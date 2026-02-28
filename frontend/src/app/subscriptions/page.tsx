"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Subscriptions as SubscriptionsIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useUserSubscriptions } from "@/lib/hooks";
import { subscriptionApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";

/**
 * Страница управления подписками
 */
export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const {
    subscriptions,
    isLoading,
    error,
    pagination,
    fetchSubscriptions,
  } = useUserSubscriptions({
    autoFetch: isAuthenticated,
    page: currentPage,
    size: pageSize,
  });

  const handleUnsubscribe = async (libraryId: number, libraryName: string) => {
    try {
      await subscriptionApi.unsubscribe(libraryId);
      fetchSubscriptions(currentPage, pageSize);
    } catch {
      // Handle error silently
    }
  };

  const handleToggleNotifications = async (
    libraryId: number,
    libraryName: string,
    enabled: boolean
  ) => {
    try {
      await subscriptionApi.updateNotifications(libraryId, enabled);
      fetchSubscriptions(currentPage, pageSize);
    } catch {
      // Handle error silently
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <SubscriptionsIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h3" fontWeight={800}>
            Мои подписки
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Управляйте подписками на библиотеки
        </Typography>
      </Box>

      {/* Content */}
      {!isAuthenticated ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Войдите, чтобы увидеть подписки
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            После входа вы сможете подписываться на библиотеки и отслеживать их обновления
          </Typography>
          <Button variant="contained" onClick={() => router.push("/login")}>
            Войти
          </Button>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : subscriptions.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <SubscriptionsIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            У вас пока нет подписок
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Подпишитесь на библиотеки, чтобы отслеживать их обновления
          </Typography>
          <Button variant="contained" onClick={() => router.push("/explore")}>
            Найти библиотеки
          </Button>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {subscriptions.map((subscription) => (
              <Box key={subscription.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{ flex: 1, cursor: "pointer" }}
                      onClick={() =>
                        router.push(`/library/${subscription.libraryId}`)
                      }
                    >
                      <Typography variant="h6" fontWeight={700}>
                        {subscription.libraryName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subscription.librarySource.toUpperCase()} • Подписка с{" "}
                        {new Date(subscription.subscribedAt).toLocaleDateString("ru-RU")}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={subscription.notificationsEnabled}
                            onChange={(e) =>
                              handleToggleNotifications(
                                subscription.libraryId,
                                subscription.libraryName,
                                e.target.checked
                              )
                            }
                          />
                        }
                        label="Уведомления"
                      />
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleUnsubscribe(
                            subscription.libraryId,
                            subscription.libraryName
                          )
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 4 }}>
              <Button
                variant="outlined"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Предыдущая
              </Button>
              <Typography sx={{ display: "flex", alignItems: "center", px: 2 }}>
                Страница {currentPage + 1} из {pagination.totalPages}
              </Typography>
              <Button
                variant="outlined"
                disabled={currentPage >= pagination.totalPages - 1}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Следующая
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

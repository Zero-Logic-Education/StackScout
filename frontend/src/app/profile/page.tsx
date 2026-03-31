"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
} from "@mui/material";
import {
  Person as PersonIcon,
  Subscriptions as SubscriptionsIcon,
  Update as UpdateIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/auth";
import { subscriptionApi } from "@/lib/api";
import { useUserSubscriptions, useUpdateStats } from "@/lib/hooks";

function formatSource(source: string) {
  return source.toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    subscriptions,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    pagination,
    fetchSubscriptions,
  } = useUserSubscriptions({ autoFetch: isAuthenticated, page: 0, size: 8 });

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    fetchStats,
  } = useUpdateStats();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }

    fetchStats();
  }, [isAuthenticated, router, fetchStats]);

  const notificationsEnabledCount = useMemo(() => {
    return subscriptions.filter((item) => item.notificationsEnabled).length;
  }, [subscriptions]);

  const topSources = useMemo(() => {
    const sourceMap = new Map<string, number>();
    for (const subscription of subscriptions) {
      const current = sourceMap.get(subscription.librarySource) ?? 0;
      sourceMap.set(subscription.librarySource, current + 1);
    }

    return Array.from(sourceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [subscriptions]);

  const recentUpdates = stats?.recentUpdates?.slice(0, 5) ?? [];

  const handleToggleNotifications = async (libraryId: number, enabled: boolean) => {
    setActionError(null);
    try {
      await subscriptionApi.updateNotifications(libraryId, enabled);
      await fetchSubscriptions(0, 8);
    } catch {
      setActionError("Не удалось обновить настройки уведомлений");
    }
  };

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

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 14 }, pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>
          Профиль
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Личный центр управления подписками, обновлениями и фокусом по библиотекам
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" },
          gap: 3,
        }}
      >
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                sx={{ width: 56, height: 56, fontWeight: 700 }}
              >
                {user?.name?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email || "Email не указан"}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip icon={<PersonIcon />} label="Личный кабинет" variant="outlined" />
              <Chip
                color={isAdmin() ? "warning" : "default"}
                label={isAdmin() ? "Роль: Администратор" : "Роль: Пользователь"}
                variant={isAdmin() ? "filled" : "outlined"}
              />
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Быстрые действия
            </Typography>
            <Stack
              direction="row"
              spacing={1.25}
              useFlexGap
              flexWrap="wrap"
              sx={{ alignItems: "center" }}
            >
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                size="small"
                onClick={() => router.push("/explore")}
                sx={{ px: 2, py: 0.75, minHeight: 38, fontWeight: 600 }}
              >
                Исследовать
              </Button>
              <Button
                variant="outlined"
                startIcon={<SubscriptionsIcon />}
                size="small"
                onClick={() => router.push("/subscriptions")}
                sx={{ px: 2, py: 0.75, minHeight: 38, fontWeight: 600 }}
              >
                Подписки
              </Button>
              <Button
                variant="outlined"
                startIcon={<UpdateIcon />}
                size="small"
                onClick={() => router.push("/updates")}
                sx={{ px: 2, py: 0.75, minHeight: 38, fontWeight: 600 }}
              >
                Обновления
              </Button>
              {isAdmin() && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<AdminPanelSettingsIcon />}
                  size="small"
                  onClick={() => router.push("/admin")}
                  sx={{ px: 2, py: 0.75, minHeight: 38, fontWeight: 600 }}
                >
                  Админ-панель
                </Button>
              )}
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Полезное сейчас: управление уведомлениями
            </Typography>
            {actionError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {actionError}
              </Alert>
            )}
            {subscriptionsLoading ? (
              <Box sx={{ py: 3, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={28} />
              </Box>
            ) : subscriptionsError ? (
              <Alert severity="error">{subscriptionsError}</Alert>
            ) : subscriptions.length === 0 ? (
              <Alert severity="info">
                Подпишитесь на библиотеки в разделе «Исследовать», чтобы получать уведомления.
              </Alert>
            ) : (
              <List disablePadding>
                {subscriptions.slice(0, 6).map((subscription, index) => (
                  <Box key={subscription.id}>
                    <ListItem
                      sx={{ px: 0, cursor: "pointer" }}
                      onClick={() => router.push(`/library/${subscription.libraryId}`)}
                    >
                      <ListItemText
                        primary={subscription.libraryName}
                        secondary={`${formatSource(subscription.librarySource)} · Подписка с ${new Date(subscription.subscribedAt).toLocaleDateString("ru-RU")}`}
                      />
                      <ListItemSecondaryAction>
                        <Switch
                          edge="end"
                          checked={subscription.notificationsEnabled}
                          onChange={(event) => {
                            event.stopPropagation();
                            handleToggleNotifications(subscription.libraryId, event.target.checked);
                          }}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < Math.min(subscriptions.length, 6) - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Stack>

        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Моя сводка
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Подписок</Typography>
                <Typography fontWeight={700}>{pagination.totalElements}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Уведомления включены</Typography>
                <Typography fontWeight={700}>{notificationsEnabledCount}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Обновлений за 7 дней</Typography>
                <Typography fontWeight={700}>{statsLoading ? "..." : (stats?.last7Days ?? 0)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Обновлений за 30 дней</Typography>
                <Typography fontWeight={700}>{statsLoading ? "..." : (stats?.last30Days ?? 0)}</Typography>
              </Box>
            </Stack>
            {statsError && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {statsError}
              </Alert>
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Фокус по источникам
            </Typography>
            {topSources.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Пока нет данных. Когда появятся подписки, здесь будет видно, где ваш основной фокус.
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {topSources.map(([source, count]) => (
                  <Chip key={source} label={`${formatSource(source)}: ${count}`} color="success" variant="outlined" />
                ))}
              </Stack>
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Свежие обновления для вас
            </Typography>
            {recentUpdates.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Пока нет свежих обновлений по вашим подпискам.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {recentUpdates.map((update) => (
                  <Box key={update.id} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Box>
                      <Typography fontWeight={600}>{update.libraryName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {update.oldVersion} → {update.newVersion} · {new Date(update.updateDate).toLocaleDateString("ru-RU")}
                      </Typography>
                    </Box>
                    <Button size="small" onClick={() => router.push(`/library/${update.libraryId}`)}>
                      Открыть
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  Update as UpdateIcon,
  NotificationsActive as NotificationsIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useLibraryUpdates, useUpdateStats } from "@/lib/hooks";
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
            Войдите, чтобы видеть обновления
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Подпишитесь на библиотеки и отслеживайте их обновления здесь
          </Typography>
          <Button variant="contained" onClick={() => router.push("/login")}>
            Войти
          </Button>
        </Paper>
      ) : (
        <>
          <TabPanel value={currentTab} index={0}>
            {updates.map((update) => (
              <LibraryUpdateCard key={update.id} update={update} />
            ))}
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            {updates.map((update) => (
              <LibraryUpdateCard key={update.id} update={update} />
            ))}
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            {updates.map((update) => (
              <LibraryUpdateCard key={update.id} update={update} />
            ))}
          </TabPanel>

          {/* Pagination */}
          {currentTab === 0 && pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 4 }}>
              <Button
                variant="outlined"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Предыдущая
              </Button>
              <Stack direction="row" spacing={1}>
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i ? "contained" : "outlined"}
                    onClick={() => handlePageChange(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </Stack>
              <Button
                variant="outlined"
                disabled={currentPage >= pagination.totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Следующая
              </Button>
            </Box>
          )}
        </>
  const pageSize = 20;

  const {
    updates,
    isLoading,
    error,
    pagination,
    fetchUpdates,
    fetchRecentUpdates,
  } = useLibraryUpdates({ autoFetch: isAuthenticated, page: currentPage, size: pageSize });

  const { stats, isLoading: statsLoading, fetchStats } = useUpdateStats();

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [fetchStats, isAuthenticated]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setCurrentPage(0);

    switch (newValue) {
      case 0: // Все обновления
        fetchUpdates(0, pageSize);
        break;
      case 1: // Последние 7 дней
        fetchRecentUpdates(7);
        break;
      case 2: // Последние 30 дней
        fetchRecentUpdates(30);
        break;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUpdates(page, pageSize);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <UpdateIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h3" fontWeight={800}>
            Обновления библиотек
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Отслеживайте обновления библиотек, на которые вы подписаны
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && !statsLoading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: 2,
            mb: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <NotificationsIcon sx={{ fontSize: 32, color: "primary.main", mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {stats.last7Days}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              За последние 7 дней
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <TimelineIcon sx={{ fontSize: 32, color: "success.main", mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {stats.last30Days}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              За последние 30 дней
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "center",
            }}
          >
            <UpdateIcon sx={{ fontSize: 32, color: "info.main", mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {pagination.totalElements}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Всего обновлений
            </Typography>
          </Paper>
        </Box>
      )}

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
            Войдите, чтобы видеть обновления
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Подпишитесь на библиотеки и отслеживайте их обновления здесь
          </Typography>
          <Button variant="contained" onClick={() => router.push("/login")}>
            Войти
          </Button>
        </Paper>
      ) : (
        <>
          {/* Tabs */}
          <Paper
            elevation={0}
            sx={{ mb: 3, border: "1px solid", borderColor: "divider" }}
          >
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="updates tabs"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab label="Все обновления" />
              <Tab label="За 7 дней" />
              <Tab label="За 30 дней" />
            </Tabs>
          </Paper>

          {/* Content */}
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : updates.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <UpdateIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Нет обновлений
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Подпишитесь на библиотеки, чтобы отслеживать их обновления
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push("/explore")}
              >
                Найти библиотеки
              </Button>
            </Paper>
          ) : (
            <>
              <TabPanel value={currentTab} index={0}>
                {updates.map((update) => (
                  <LibraryUpdateCard key={update.id} update={update} />
                ))}
              </TabPanel>

              <TabPanel value={currentTab} index={1}>
                {updates.map((update) => (
                  <LibraryUpdateCard key={update.id} update={update} />
                ))}
              </TabPanel>

              <TabPanel value={currentTab} index={2}>
                {updates.map((update) => (
                  <LibraryUpdateCard key={update.id} update={update} />
                ))}
              </TabPanel>

              {/* Pagination */}
              {currentTab === 0 && pagination.totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 4 }}>
                  <Button
                    variant="outlined"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Предыдущая
                  </Button>
                  <Stack direction="row" spacing={1}>
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i ? "contained" : "outlined"}
                        onClick={() => handlePageChange(i)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </Stack>
                  <Button
                    variant="outlined"
                    disabled={currentPage >= pagination.totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Следующая
                  </Button>
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}

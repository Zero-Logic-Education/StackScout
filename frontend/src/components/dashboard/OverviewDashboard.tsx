"use client";

import { useState, useEffect } from "react";
import { apiClient, libraryApi, libraryUpdateApi, type UpdateStats } from "@/lib/api";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  LibraryBooks,
  Speed,
  AccountTree,
  Code,
  TrendingUp,
  Security,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  InsertChart,
  Timeline,
} from "@mui/icons-material";

interface StatsData {
  totalLibraries: number;
  averageHealthScore: number;
  sources: {
    pypi: number;
    npm: number;
    maven?: number;
    [key: string]: number | undefined;
  };
  [key: string]: unknown;
}

function StatCard({
  icon,
  label,
  value,
  color,
  trend,
  subtitle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "primary" | "secondary" | "success" | "info";
  trend?: string;
  subtitle?: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: `${color}.main`,
          boxShadow: `0 12px 24px rgba(76, 175, 80, 0.15)`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box
            sx={{
              color: `${color}.main`,
              p: 1.5,
              borderRadius: 2,
              bgcolor: `rgba(76, 175, 80, 0.1)`,
            }}
          >
            {icon}
          </Box>
          {trend && (
            <Chip
              label={trend}
              size="small"
              color="success"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Typography
          variant="h3"
          fontWeight={700}
          color={`${color}.main`}
          sx={{ mb: 0.5 }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function OverviewDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [updatesStats, setUpdatesStats] = useState<UpdateStats | null>(null);
  const [healthDistribution, setHealthDistribution] = useState({
    healthy: 0,
    warning: 0,
    critical: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const [{ data }, updatesResponse] = await Promise.all([
          apiClient.get("/libraries/stats"),
          libraryUpdateApi.getUpdateStats(),
        ]);

        const totalLibraries = Number(data.totalLibraries) || 0;
        if (totalLibraries > 0) {
          try {
            const librariesResponse = await libraryApi.getAll(0, totalLibraries);
            const libraries = librariesResponse.data.libraries || [];

            const healthy = libraries.filter((library) => library.healthScore >= 80).length;
            const warning = libraries.filter((library) => library.healthScore >= 60 && library.healthScore < 80).length;
            const critical = libraries.filter((library) => library.healthScore < 60).length;

            if (isMounted) {
              setHealthDistribution({ healthy, warning, critical });
            }
          } catch (distributionError) {
            console.error("Ошибка загрузки распределения здоровья:", distributionError);
          }
        }

        if (isMounted) {
          setStats(data);
          setUpdatesStats(updatesResponse.data);
        }
      } catch (err: unknown) {
        console.error("Ошибка загрузки статистики:", err);
        if (isMounted) {
          const error = err as Record<string, unknown>;
          if (
            error.code === "ERR_NETWORK" ||
            String(error.message).includes("Network")
          ) {
            setError(
              "Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:8081",
            );
          } else {
            setError("Не удалось загрузить статистику");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh" }}>
        <Box
          sx={{
            background:
              "linear-gradient(135deg, rgba(76, 175, 80, 0.35) 0%, rgba(56, 142, 60, 0.15) 100%)",
            pt: { xs: 16, md: 20 },
            pb: { xs: 8, md: 12 },
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 3 }} color="text.secondary">
                Загрузка аналитики...
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    );
  }

  if (error || !stats) {
    return (
      <Box sx={{ minHeight: "100vh" }}>
        <Box
          sx={{
            background:
              "linear-gradient(135deg, rgba(76, 175, 80, 0.35) 0%, rgba(56, 142, 60, 0.15) 100%)",
            pt: { xs: 16, md: 20 },
            pb: { xs: 8, md: 12 },
          }}
        >
          <Container maxWidth="lg">
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              <Typography variant="body1" fontWeight={600} gutterBottom>
                {error || "Ошибка загрузки данных"}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Для запуска бэкенда выполните:
              </Typography>
              <Box
                component="code"
                sx={{
                  display: "block",
                  mt: 1,
                  p: 2,
                  bgcolor: "rgba(0,0,0,0.1)",
                  borderRadius: 1,
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                }}
              >
                cd backend && ./gradlew bootRun
              </Box>
            </Alert>
          </Container>
        </Box>
      </Box>
    );
  }

  const totalForHealth =
    healthDistribution.healthy + healthDistribution.warning + healthDistribution.critical;

  const healthyLibs = healthDistribution.healthy;
  const warningLibs = healthDistribution.warning;
  const criticalLibs = healthDistribution.critical;

  const toPercent = (value: number) => {
    if (!totalForHealth) return 0;
    return Math.round((value / totalForHealth) * 100);
  };

  const healthyPercent = toPercent(healthyLibs);
  const warningPercent = toPercent(warningLibs);
  const criticalPercent = toPercent(criticalLibs);

  return (
    <Box sx={{ minHeight: "100vh", pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(76, 175, 80, 0.03) 2px, rgba(76, 175, 80, 0.03) 4px),
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(76, 175, 80, 0.03) 2px, rgba(76, 175, 80, 0.03) 4px),
            linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(55, 100, 80, 0.3) 50%, rgba(26, 26, 26, 0.95) 100%)
          `,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
          position: "relative",
          borderBottom: "1px solid",
          borderColor: "divider",
          pt: { xs: 16, md: 20 },
          pb: { xs: 8, md: 12 },
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(56, 142, 60, 0.08) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "3.5rem" },
              }}
            >
              Аналитический дашборд
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "700px", mx: "auto" }}
            >
              Полный обзор ключевых метрик и статистики Open Source библиотек
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
            }}
          >
            <StatCard
              icon={<LibraryBooks sx={{ fontSize: 40 }} />}
              label="Всего библиотек"
              value={stats.totalLibraries.toLocaleString()}
              color="primary"
              trend={`${updatesStats?.last30Days ?? 0} обновл./30д`}
            />
            <StatCard
              icon={<Speed sx={{ fontSize: 40 }} />}
              label="Средний рейтинг"
              value={`${Math.round(Number(stats.averageHealthScore) || 0)}%`}
              color="success"
              trend={`${updatesStats?.last7Days ?? 0} обновл./7д`}
            />
            <StatCard
              icon={<Code sx={{ fontSize: 40 }} />}
              label="PyPI библиотек"
              value={stats.sources.pypi.toLocaleString()}
              color="info"
              subtitle="Python"
            />
            <StatCard
              icon={<AccountTree sx={{ fontSize: 40 }} />}
              label="NPM пакетов"
              value={stats.sources.npm.toLocaleString()}
              color="secondary"
              subtitle="JavaScript"
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Распределение по здоровью
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Анализ состояния библиотек в экосистеме
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "success.main",
                  boxShadow: "0 8px 16px rgba(76, 175, 80, 0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(76, 175, 80, 0.1)",
                      color: "success.main",
                      mr: 2,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="success.main"
                    >
                      {healthyLibs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Здоровые
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={healthyPercent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "success.main",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {healthyPercent}% от общего числа
                </Typography>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "warning.main",
                  boxShadow: "0 8px 16px rgba(255, 152, 0, 0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 152, 0, 0.1)",
                      color: "warning.main",
                      mr: 2,
                    }}
                  >
                    <Warning sx={{ fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="warning.main"
                    >
                      {warningLibs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Требуют внимания
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={warningPercent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "rgba(255, 152, 0, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "warning.main",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {warningPercent}% от общего числа
                </Typography>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "error.main",
                  boxShadow: "0 8px 16px rgba(244, 67, 54, 0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(244, 67, 54, 0.1)",
                      color: "error.main",
                      mr: 2,
                    }}
                  >
                    <ErrorIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      color="error.main"
                    >
                      {criticalLibs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Критические
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={criticalPercent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "rgba(244, 67, 54, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "error.main",
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {criticalPercent}% от общего числа
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
            gap: 3,
            mb: 6,
          }}
        >
          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Timeline sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Анализ трендов
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Динамика за последний месяц
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box
                sx={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "background.default",
                  borderRadius: 2,
                  border: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <InsertChart
                    sx={{ fontSize: 64, color: "text.disabled", mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    График будет добавлен
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Новые библиотеки
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                    >
                      +{updatesStats?.last7Days ?? 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Обновления
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="success.main"
                    >
                      +{updatesStats?.last30Days ?? 0}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Устаревшие
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="warning.main"
                    >
                      {criticalLibs}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Security sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Безопасность
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Обзор уязвимостей
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    border: "1px solid",
                    borderColor: "success.main",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Безопасные библиотеки
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="success.main"
                    >
                      {healthyPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={healthyPercent}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "rgba(76, 175, 80, 0.2)",
                      "& .MuiLinearProgress-bar": { bgcolor: "success.main" },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(255, 152, 0, 0.1)",
                    border: "1px solid",
                    borderColor: "warning.main",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Средний риск
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="warning.main"
                    >
                      {warningPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={warningPercent}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "rgba(255, 152, 0, 0.2)",
                      "& .MuiLinearProgress-bar": { bgcolor: "warning.main" },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(244, 67, 54, 0.1)",
                    border: "1px solid",
                    borderColor: "error.main",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Высокий риск
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="error.main"
                    >
                      {criticalPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={criticalPercent}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "rgba(244, 67, 54, 0.2)",
                      "& .MuiLinearProgress-bar": { bgcolor: "error.main" },
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        <Card
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: "center",
            backgroundImage: `linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(55, 100, 80, 0.2) 100%)`,
            border: "1px solid",
            borderColor: "rgba(76, 175, 80, 0.3)",
          }}
        >
          <TrendingUp sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Расширенная аналитика
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: "600px", mx: "auto" }}
          >
            Получите доступ к детальным отчётам, прогнозам и персонализированным
            рекомендациям
          </Typography>
          <Chip
            label="Скоро"
            color="primary"
            sx={{ fontWeight: 600, px: 2, py: 2.5, fontSize: "1rem" }}
          />
        </Card>
      </Container>
    </Box>
  );
}

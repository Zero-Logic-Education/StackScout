"use client";

import { useState, useEffect } from "react";
import { apiClient, libraryApi, libraryUpdateApi, type UpdateStats, type UpdateType } from "@/lib/api";
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
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  LibraryBooks,
  Speed,
  AccountTree,
  Code,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Update,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

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
  const [timelineDays, setTimelineDays] = useState<7 | 14 | 30>(14);
  const [selectedUpdateType, setSelectedUpdateType] = useState<"ALL" | UpdateType>("ALL");

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

  const sourceEntries = Object.entries(stats.sources || {})
    .filter(([, value]) => typeof value === "number" && (value as number) > 0)
    .map(([key, value]) => [key, value as number] as const)
    .sort((a, b) => b[1] - a[1]);

  const sourceChartData = sourceEntries.map(([source, count]) => {
    const percent = stats.totalLibraries > 0
      ? Math.round((count / stats.totalLibraries) * 100)
      : 0;

    return {
      source: formatSourceLabel(source),
      libraries: count,
      percent,
    };
  });

  const updateTypeStats = (updatesStats?.recentUpdates || []).reduce(
    (acc, update) => {
      if (update.updateType === "MAJOR") acc.major += 1;
      if (update.updateType === "MINOR") acc.minor += 1;
      if (update.updateType === "PATCH") acc.patch += 1;
      return acc;
    },
    { major: 0, minor: 0, patch: 0 },
  );

  const updateTypeChartData = [
    { name: "Major", value: updateTypeStats.major, color: "#ef5350", key: "MAJOR" as const },
    { name: "Minor", value: updateTypeStats.minor, color: "#ffa726", key: "MINOR" as const },
    { name: "Patch", value: updateTypeStats.patch, color: "#66bb6a", key: "PATCH" as const },
  ].filter((item) => item.value > 0);

  const timelineData = (() => {
    const now = new Date();
    const dates = Array.from({ length: timelineDays }, (_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (timelineDays - 1 - index));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
        total: 0,
        major: 0,
        minor: 0,
        patch: 0,
      };
    });

    const map = new Map(dates.map((item) => [item.key, item]));

    (updatesStats?.recentUpdates || []).forEach((item) => {
      const key = new Date(item.updateDate).toISOString().slice(0, 10);
      const bucket = map.get(key);
      if (!bucket) return;

      bucket.total += 1;
      if (item.updateType === "MAJOR") bucket.major += 1;
      if (item.updateType === "MINOR") bucket.minor += 1;
      if (item.updateType === "PATCH") bucket.patch += 1;
    });

    return dates;
  })();

  const filteredRecentUpdates = (() => {
    const source = updatesStats?.recentUpdates || [];
    if (selectedUpdateType === "ALL") return source;
    return source.filter((item) => item.updateType === selectedUpdateType);
  })();

  function formatSourceLabel(source: string) {
    const lower = source.toLowerCase();
    if (lower === "pypi") return "PyPI";
    if (lower === "npm") return "NPM";
    if (lower === "maven") return "Maven";
    return source;
  }

  function formatUpdateType(type: string) {
    if (type === "MAJOR") return "Major";
    if (type === "MINOR") return "Minor";
    if (type === "PATCH") return "Patch";
    return type;
  }

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
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Динамика обновлений
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Интерактивный график по последним изменениям версий
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={timelineDays}
                  onChange={(_, value) => {
                    if (value) setTimelineDays(value);
                  }}
                  color="success"
                >
                  <ToggleButton value={7}>7д</ToggleButton>
                  <ToggleButton value={14}>14д</ToggleButton>
                  <ToggleButton value={30}>30д</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ height: 280, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="label" tick={{ fill: "#b0b0b0", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#b0b0b0", fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#1f1f1f",
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="major" name="Major" stackId="1" stroke="#ef5350" fill="#ef5350" fillOpacity={0.35} />
                    <Area type="monotone" dataKey="minor" name="Minor" stackId="1" stroke="#ffa726" fill="#ffa726" fillOpacity={0.35} />
                    <Area type="monotone" dataKey="patch" name="Patch" stackId="1" stroke="#66bb6a" fill="#66bb6a" fillOpacity={0.35} />
                  </AreaChart>
                </ResponsiveContainer>
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
                <AccountTree sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Распределение по источникам
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Реальные данные из каталога библиотек
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={2}>
                {sourceEntries.map(([source, count]) => {
                  const percent = stats.totalLibraries > 0
                    ? Math.round((count / stats.totalLibraries) * 100)
                    : 0;
                  return (
                    <Box key={source}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 0.75,
                        }}
                      >
                        <Typography variant="body2" fontWeight={600}>
                          {formatSourceLabel(source)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {count.toLocaleString()} ({percent}%)
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                          height: 7,
                          borderRadius: 3.5,
                          bgcolor: "rgba(76, 175, 80, 0.12)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "primary.main",
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Stack>

              <Box sx={{ height: 220, mt: 3 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceChartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="source" tick={{ fill: "#b0b0b0", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#b0b0b0", fontSize: 12 }} />
                    <Bar dataKey="libraries" name="Библиотек" fill="#4caf50" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
                <Update sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Последние обновления
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Недавние изменения версий библиотек
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  size="small"
                  label="Все"
                  color={selectedUpdateType === "ALL" ? "primary" : "default"}
                  onClick={() => setSelectedUpdateType("ALL")}
                />
                <Chip
                  size="small"
                  label="Major"
                  color={selectedUpdateType === "MAJOR" ? "error" : "default"}
                  onClick={() => setSelectedUpdateType("MAJOR")}
                />
                <Chip
                  size="small"
                  label="Minor"
                  color={selectedUpdateType === "MINOR" ? "warning" : "default"}
                  onClick={() => setSelectedUpdateType("MINOR")}
                />
                <Chip
                  size="small"
                  label="Patch"
                  color={selectedUpdateType === "PATCH" ? "success" : "default"}
                  onClick={() => setSelectedUpdateType("PATCH")}
                />
              </Stack>

              <Stack spacing={1.5}>
                {filteredRecentUpdates.slice(0, 6).map((updateItem) => (
                  <Box
                    key={updateItem.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.default",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {updateItem.libraryName}
                      </Typography>
                      <Chip
                        size="small"
                        label={formatUpdateType(updateItem.updateType)}
                        color={
                          updateItem.updateType === "MAJOR"
                            ? "error"
                            : updateItem.updateType === "MINOR"
                              ? "warning"
                              : "success"
                        }
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {updateItem.oldVersion} → {updateItem.newVersion}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(updateItem.updateDate).toLocaleDateString("ru-RU")}
                    </Typography>
                  </Box>
                ))}

                {filteredRecentUpdates.length === 0 && (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Нет свежих обновлений библиотек.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Структура обновлений по типам
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Обзор Major / Minor / Patch для последних событий в системе.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
                gap: 3,
                alignItems: "center",
              }}
            >
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={updateTypeChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {updateTypeChartData.map((entry) => (
                        <Cell key={entry.key} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#1f1f1f",
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Stack spacing={1.5}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(244, 67, 54, 0.1)", border: "1px solid", borderColor: "error.main" }}>
                  <Typography variant="caption" color="text.secondary">Major</Typography>
                  <Typography variant="h5" fontWeight={700} color="error.main">{updateTypeStats.major}</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(255, 152, 0, 0.1)", border: "1px solid", borderColor: "warning.main" }}>
                  <Typography variant="caption" color="text.secondary">Minor</Typography>
                  <Typography variant="h5" fontWeight={700} color="warning.main">{updateTypeStats.minor}</Typography>
                </Box>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(76, 175, 80, 0.1)", border: "1px solid", borderColor: "success.main" }}>
                  <Typography variant="caption" color="text.secondary">Patch</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">{updateTypeStats.patch}</Typography>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

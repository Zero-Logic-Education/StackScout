"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  IconButton,
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
  Refresh,
} from "@mui/icons-material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  sources: Record<string, number>;
  [key: string]: unknown;
}

type SourceHealthBucket = {
  total: number;
  healthy: number;
  warning: number;
  critical: number;
};

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
  const [sourceHealthStats, setSourceHealthStats] = useState<Record<string, SourceHealthBucket>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineDays, setTimelineDays] = useState<7 | 14 | 30>(14);
  const [selectedUpdateType, setSelectedUpdateType] = useState<"ALL" | UpdateType>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);
  const hasInitialDataRef = useRef(false);

  const fetchStats = useCallback(async (silent = true) => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    if (!silent && isMountedRef.current) {
      setRefreshing(true);
    }

    try {
      const [{ data }, updatesResponse] = await Promise.all([
        apiClient.get("/libraries/stats"),
        libraryUpdateApi.getUpdateStats(),
      ]);

      const totalLibraries = Number(data.totalLibraries) || 0;
      let nextHealthDistribution = { healthy: 0, warning: 0, critical: 0 };
      let nextSourceHealthStats: Record<string, SourceHealthBucket> = {};

      if (totalLibraries > 0) {
        try {
          const librariesResponse = await libraryApi.getAll(0, totalLibraries);
          const libraries = librariesResponse.data.libraries || [];

          nextHealthDistribution = {
            healthy: libraries.filter((library) => library.healthScore >= 80).length,
            warning: libraries.filter((library) => library.healthScore >= 60 && library.healthScore < 80).length,
            critical: libraries.filter((library) => library.healthScore < 60).length,
          };

          nextSourceHealthStats = libraries.reduce((acc, library) => {
            const sourceKey = String(library.source || "unknown").toLowerCase();
            if (!acc[sourceKey]) {
              acc[sourceKey] = { total: 0, healthy: 0, warning: 0, critical: 0 };
            }

            acc[sourceKey].total += 1;
            if (library.healthScore >= 80) {
              acc[sourceKey].healthy += 1;
            } else if (library.healthScore >= 60) {
              acc[sourceKey].warning += 1;
            } else {
              acc[sourceKey].critical += 1;
            }

            return acc;
          }, {} as Record<string, SourceHealthBucket>);
        } catch (distributionError) {
          console.error("Ошибка загрузки распределения здоровья:", distributionError);
        }
      }

      if (isMountedRef.current) {
        const rawSources =
          data && typeof data === "object" && data.sources && typeof data.sources === "object"
            ? (data.sources as Record<string, unknown>)
            : {};

        const normalizedSources = Object.fromEntries(
          Object.entries(rawSources).map(([key, value]) => [key, Number(value) || 0]),
        ) as Record<string, number>;

        setHealthDistribution(nextHealthDistribution);
        setSourceHealthStats(nextSourceHealthStats);
        setStats({
          ...(data as StatsData),
          sources: normalizedSources,
        });
        setUpdatesStats(updatesResponse.data);
        setLastUpdatedAt(new Date());
        setError(null);
        hasInitialDataRef.current = true;
      }
    } catch (err: unknown) {
      console.error("Ошибка загрузки статистики:", err);
      if (isMountedRef.current && !hasInitialDataRef.current) {
        const parsedError = err as Record<string, unknown>;
        if (
          parsedError.code === "ERR_NETWORK" ||
          String(parsedError.message).includes("Network")
        ) {
          setError(
            "Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:8081",
          );
        } else {
          setError("Не удалось загрузить статистику");
        }
      }
    } finally {
      inFlightRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const getSourceCount = (sourceKey: string): number => {
    if (!stats?.sources) {
      return 0;
    }
    return Number(stats.sources[sourceKey]) || 0;
  };

  useEffect(() => {
    isMountedRef.current = true;
    void fetchStats(true);

    const intervalId = window.setInterval(() => {
      void fetchStats(true);
    }, 30000);

    const handleWindowFocus = () => {
      void fetchStats(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchStats(true);
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchStats]);

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
      const date = new Date(item.updateDate);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = date.toISOString().slice(0, 10);
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

  const fallbackSourceEntries = (() => {
    if (Object.keys(sourceHealthStats).length === 0) {
      return sourceEntries.slice(0, 5).map(([source, total]) => ({
        source,
        value: total,
        metricLabel: "библиотек",
      }));
    }

    const rows = Object.entries(sourceHealthStats).map(([source, bucket]) => {
      if (selectedUpdateType === "MAJOR") {
        return { source, value: bucket.critical, metricLabel: "критических" };
      }
      if (selectedUpdateType === "MINOR") {
        return { source, value: bucket.warning, metricLabel: "требуют внимания" };
      }
      if (selectedUpdateType === "PATCH") {
        return { source, value: bucket.healthy, metricLabel: "здоровых" };
      }

      return { source, value: bucket.total, metricLabel: "библиотек" };
    });

    const positiveRows = rows.filter((row) => row.value > 0).sort((a, b) => b.value - a.value);
    if (positiveRows.length > 0) {
      return positiveRows.slice(0, 5);
    }

    return Object.entries(sourceHealthStats)
      .map(([source, bucket]) => ({ source, value: bucket.total, metricLabel: "библиотек" }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  })();

  const hasTimelineData = timelineData.some((item) => item.total > 0);
  const hasUpdateTypeData = updateTypeChartData.length > 0;

  const healthSnapshotData = [
    { name: "Здоровые", value: healthyLibs, color: "#66bb6a" },
    { name: "Требуют внимания", value: warningLibs, color: "#ffa726" },
    { name: "Критические", value: criticalLibs, color: "#ef5350" },
  ].filter((item) => item.value > 0);

  const timelineFallbackData = healthSnapshotData.map((item) => ({
    label: item.name,
    value: item.value,
  }));

  const pieData = hasUpdateTypeData
    ? updateTypeChartData
    : healthSnapshotData.map((item) => ({
        name: item.name,
        value: item.value,
        color: item.color,
        key: item.name,
      }));

  const pieSummaryCards = hasUpdateTypeData
    ? [
        {
          label: "Major",
          value: updateTypeStats.major,
          color: "error.main" as const,
          borderColor: "error.main" as const,
          bgColor: "rgba(244, 67, 54, 0.1)",
        },
        {
          label: "Minor",
          value: updateTypeStats.minor,
          color: "warning.main" as const,
          borderColor: "warning.main" as const,
          bgColor: "rgba(255, 152, 0, 0.1)",
        },
        {
          label: "Patch",
          value: updateTypeStats.patch,
          color: "success.main" as const,
          borderColor: "success.main" as const,
          bgColor: "rgba(76, 175, 80, 0.1)",
        },
      ]
    : [
        {
          label: "Критические",
          value: criticalLibs,
          color: "error.main" as const,
          borderColor: "error.main" as const,
          bgColor: "rgba(244, 67, 54, 0.1)",
        },
        {
          label: "Требуют внимания",
          value: warningLibs,
          color: "warning.main" as const,
          borderColor: "warning.main" as const,
          bgColor: "rgba(255, 152, 0, 0.1)",
        },
        {
          label: "Здоровые",
          value: healthyLibs,
          color: "success.main" as const,
          borderColor: "success.main" as const,
          bgColor: "rgba(76, 175, 80, 0.1)",
        },
      ];

  function formatSourceLabel(source: string) {
    const lower = source.toLowerCase();
    if (lower === "pypi") return "PyPI";
    if (lower === "npm") return "NPM";
    if (lower === "maven") return "Maven";
    if (lower === "dockerhub") return "Docker Hub";
    if (lower === "github") return "GitHub";
    if (lower === "gitlab") return "GitLab";
    if (lower === "nuget") return "NuGet";
    if (lower === "nvd") return "NVD";
    if (lower === "osv") return "OSV";
    return source;
  }

  function formatUpdateType(type: string) {
    if (type === "MAJOR") return "Major";
    if (type === "MINOR") return "Minor";
    if (type === "PATCH") return "Patch";
    return type;
  }

  function formatDateSafe(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "дата неизвестна";
    }
    return date.toLocaleDateString("ru-RU");
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
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Обновлено: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString("ru-RU") : "-"}
              </Typography>
              <IconButton
                size="small"
                color="success"
                onClick={() => void fetchStats(false)}
                disabled={refreshing}
                aria-label="Обновить аналитику"
              >
                {refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh fontSize="small" />}
              </IconButton>
            </Box>
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
              value={getSourceCount("pypi").toLocaleString()}
              color="info"
              subtitle="Python"
            />
            <StatCard
              icon={<AccountTree sx={{ fontSize: 40 }} />}
              label="NPM пакетов"
              value={getSourceCount("npm").toLocaleString()}
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
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {hasTimelineData ? "Динамика обновлений" : "Снимок состояния каталога"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hasTimelineData
                      ? "Интерактивный график по последним изменениям версий"
                      : "Пока нет событий обновлений, показываем актуальное распределение библиотек"}
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

              <Box sx={{ flex: 1, minHeight: 320, mt: 2 }}>
                {hasTimelineData ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
                    <AreaChart data={timelineData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" tick={{ fill: "#b0b0b0", fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: "#b0b0b0", fontSize: 12 }} />
                      <Tooltip
                        cursor={false}
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
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
                    <BarChart data={timelineFallbackData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="label" tick={{ fill: "#b0b0b0", fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fill: "#b0b0b0", fontSize: 12 }} />
                      <Tooltip
                        cursor={false}
                        contentStyle={{
                          backgroundColor: "#1f1f1f",
                          border: "1px solid rgba(255,255,255,0.14)",
                          borderRadius: 8,
                        }}
                      />
                      <Bar dataKey="value" name="Библиотек" fill="#4caf50" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 4, height: "100%", display: "flex", flexDirection: "column" }}>
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
              <Stack spacing={2} sx={{ flex: 1, overflow: "auto", pr: 0.5 }}>
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
                      {formatDateSafe(updateItem.updateDate)}
                    </Typography>
                  </Box>
                ))}

                {filteredRecentUpdates.length === 0 && (
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
                      {selectedUpdateType === "ALL"
                        ? "Текущая картина по источникам каталога"
                        : `Срез по ${formatUpdateType(selectedUpdateType)}: источники с наибольшими значениями`}
                    </Typography>
                    {fallbackSourceEntries.map(({ source, value, metricLabel }) => {
                      const percent = stats.totalLibraries > 0
                        ? Math.round((value / stats.totalLibraries) * 100)
                        : 0;

                      return (
                        <Box
                          key={source}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.default",
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {formatSourceLabel(source)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {value.toLocaleString()} {metricLabel} ({percent}%)
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
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
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {hasUpdateTypeData ? "Структура обновлений по типам" : "Структура каталога по состоянию"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {hasUpdateTypeData
                ? "Обзор Major / Minor / Patch для последних событий в системе."
                : "Обзор текущего распределения библиотек: здоровые, требующие внимания и критические."}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr" },
                gap: 3,
                alignItems: "center",
                flex: 1,
              }}
            >
              <Box sx={{ height: "100%", minHeight: 320 }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.key} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    Нет данных для круговой диаграммы.
                  </Alert>
                )}
              </Box>

              <Stack spacing={1.5}>
                {pieSummaryCards.map((card) => (
                  <Box
                    key={card.label}
                    sx={{ p: 2, borderRadius: 2, bgcolor: card.bgColor, border: "1px solid", borderColor: card.borderColor }}
                  >
                    <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                    <Typography variant="h5" fontWeight={700} color={card.color}>{card.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

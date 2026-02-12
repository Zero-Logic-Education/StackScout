import { Box, Typography, LinearProgress, Stack, Paper } from "@mui/material";
import { TrendingUp, Code, Group, Speed } from "@mui/icons-material";
import type { HealthMetrics, MetricDetail } from "@/lib/api";

interface HealthMetricsProps {
  metrics: HealthMetrics;
}

/**
 * Компонент для отображения метрик здоровья библиотеки
 * Показывает детальные показатели по 4 категориям:
 * - Актуальность (actuality)
 * - Активность (activity)
 * - Репозиторий (repository)
 * - Сообщество (community)
 */
export default function HealthMetricsDisplay({ metrics }: HealthMetricsProps) {
  const getMetricColor = (score: number) => {
    if (score >= 80) return "success.main";
    if (score >= 60) return "warning.main";
    return "error.main";
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "actuality":
        return <Speed sx={{ fontSize: 28 }} />;
      case "activity":
        return <TrendingUp sx={{ fontSize: 28 }} />;
      case "repository":
        return <Code sx={{ fontSize: 28 }} />;
      case "community":
        return <Group sx={{ fontSize: 28 }} />;
      default:
        return null;
    }
  };

  const renderMetric = (type: string, metric: MetricDetail) => {
    const color = getMetricColor(metric.score);

    return (
      <Paper
        key={type}
        elevation={0}
        sx={{
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          transition: "all 0.3s ease",
          "&:hover": {
            borderColor: color,
            boxShadow: `0 4px 12px ${color === "success.main" ? "rgba(76, 175, 80, 0.2)" : color === "warning.main" ? "rgba(255, 152, 0, 0.2)" : "rgba(244, 67, 54, 0.2)"}`,
          },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              color: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color.replace("main", "main")}15`,
            }}
          >
            {getMetricIcon(type)}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {metric.label}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ color: color }}>
              {metric.score}%
            </Typography>
          </Box>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={metric.score}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "rgba(255, 255, 255, 0.1)",
            "& .MuiLinearProgress-bar": {
              bgcolor: color,
              borderRadius: 4,
            },
          }}
        />

        {metric.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {metric.description}
          </Typography>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Метрики здоровья
      </Typography>

      <Stack spacing={2}>
        {renderMetric("actuality", metrics.actuality)}
        {renderMetric("activity", metrics.activity)}
        {renderMetric("repository", metrics.repository)}
        {renderMetric("community", metrics.community)}
      </Stack>
    </Box>
  );
}

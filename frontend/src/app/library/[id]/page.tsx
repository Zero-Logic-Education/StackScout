"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Stack,
  Chip,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  Home,
  FiberManualRecord,
  OpenInNew,
  Share,
} from "@mui/icons-material";
import { libraryApi, type LibraryDetail, type HealthMetrics } from "@/lib/api";
import HealthMetricsDisplay from "@/components/library/HealthMetricsDisplay";
import LibraryInfo from "@/components/library/LibraryInfo";
import DetailPageSkeleton from "@/components/skeletons/DetailPageSkeleton";
import toast from "react-hot-toast";

interface LibraryPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Страница детальной информации о библиотеке
 * Показывает полную информацию о библиотеке, метрики здоровья,
 * зависимости, уязвимости (если есть) и историю версий
 */
export default function LibraryPage({ params }: LibraryPageProps) {
  const router = useRouter();
  const [library, setLibrary] = useState<LibraryDetail | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [libraryId, setLibraryId] = useState<string | null>(null);

  // Разворачиваем промис с параметрами
  useEffect(() => {
    params.then((p) => setLibraryId(p.id));
  }, [params]);

  useEffect(() => {
    if (!libraryId) return;
    fetchLibraryData();
  }, [libraryId]);

  const fetchLibraryData = async () => {
    if (!libraryId) return;

    try {
      setLoading(true);
      setError(null);

      const id = parseInt(libraryId);
      if (isNaN(id)) {
        setError("Некорректный ID библиотеки");
        return;
      }

      // Загружаем данные параллельно
      const [libraryResponse, healthResponse] = await Promise.allSettled([
        libraryApi.getById(id),
        libraryApi.getHealth(id),
      ]);

      if (libraryResponse.status === "fulfilled") {
        setLibrary(libraryResponse.value.data);
      } else {
        throw new Error("Не удалось загрузить информацию о библиотеке");
      }

      if (healthResponse.status === "fulfilled") {
        setHealthMetrics(healthResponse.value.data);
      } else {
        // Метрики здоровья не критичны, просто логируем
        console.warn("Не удалось загрузить метрики здоровья");
        toast.error("Не удалось загрузить метрики здоровья");
      }
    } catch (err: unknown) {
      const error = err as { message?: string; code?: string };
      console.error("Ошибка загрузки данных:", err);

      if (error.code === "ERR_NETWORK") {
        setError("Не удалось подключиться к серверу");
      } else {
        setError(error.message || "Произошла ошибка при загрузке данных");
      }

      toast.error("Не удалось загрузить информацию о библиотеке");
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "success.main";
    if (score >= 60) return "warning.main";
    return "error.main";
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return "Отлично";
    if (score >= 60) return "Хорошо";
    return "Требует внимания";
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: library?.name || "StackScout",
          text: library?.description || "",
          url: window.location.href,
        });
        toast.success("Ссылка успешно отправлена!");
      } catch (err) {
        console.error("Ошибка при шаринге:", err);
      }
    } else {
      // Fallback - копирование в буфер обмена
      navigator.clipboard.writeText(window.location.href);
      toast.success("Ссылка скопирована в буфер обмена!");
    }
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (error || !library) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Библиотека не найдена"}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
        >
          Вернуться назад
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          pt: { xs: 12, md: 16 },
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              href="/"
              underline="hover"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                "&:hover": { color: "primary.main" },
              }}
            >
              <Home sx={{ fontSize: 18 }} />
              Главная
            </Link>
            <Link
              href="/explore"
              underline="hover"
              color="text.secondary"
              sx={{ "&:hover": { color: "primary.main" } }}
            >
              Библиотеки
            </Link>
            <Typography color="text.primary">{library.name}</Typography>
          </Breadcrumbs>

          {/* Title Section */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h3"
              fontWeight={800}
              gutterBottom
              sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
            >
              {library.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {library.description || "Описание отсутствует"}
            </Typography>
          </Box>

          {/* Meta Information */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 3 }}
          >
            <Chip
              label={library.source}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                fontWeight: 600,
              }}
            />
            <Chip
              label={`v${library.version}`}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            {library.license && (
              <Chip
                label={library.license}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor:
                  getHealthScoreColor(library.healthScore) === "success.main"
                    ? "rgba(76, 175, 80, 0.1)"
                    : getHealthScoreColor(library.healthScore) ===
                        "warning.main"
                      ? "rgba(255, 152, 0, 0.1)"
                      : "rgba(244, 67, 54, 0.1)",
              }}
            >
              <FiberManualRecord
                sx={{
                  fontSize: 10,
                  color: getHealthScoreColor(library.healthScore),
                }}
              />
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: getHealthScoreColor(library.healthScore) }}
              >
                {getHealthScoreLabel(library.healthScore)} -{" "}
                {library.healthScore}%
              </Typography>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
            >
              Назад
            </Button>
            {library.repositoryUrl && (
              <Button
                variant="outlined"
                endIcon={<OpenInNew />}
                href={library.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Репозиторий
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShare}
            >
              Поделиться
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
          }}
        >
          {/* Left Column - Health Metrics & Description */}
          <Stack spacing={3}>
            {healthMetrics && <HealthMetricsDisplay metrics={healthMetrics} />}

            {/* Описание */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
            >
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Описание
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" color="text.secondary" paragraph>
                {library.description || "Описание отсутствует"}
              </Typography>
            </Paper>

            {/* Зависимости (если есть) */}
            {library.dependencies && library.dependencies.length > 0 && (
              <Paper
                elevation={0}
                sx={{ p: 3, border: "1px solid", borderColor: "divider" }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Зависимости ({library.dependencies.length})
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.5}>
                  {library.dependencies.slice(0, 10).map((dep) => (
                    <Box
                      key={dep.id}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {dep.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dep.version} • {dep.source}
                      </Typography>
                    </Box>
                  ))}
                  {library.dependencies.length > 10 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textAlign: "center", pt: 1 }}
                    >
                      И ещё {library.dependencies.length - 10} зависимостей...
                    </Typography>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Уязвимости (если есть) */}
            {library.vulnerabilities && library.vulnerabilities.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "2px solid",
                  borderColor: "error.main",
                  bgcolor: "rgba(244, 67, 54, 0.05)",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={700}
                  gutterBottom
                  color="error.main"
                >
                  Уязвимости ({library.vulnerabilities.length})
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={2}>
                  {library.vulnerabilities.map((vuln) => (
                    <Alert
                      key={vuln.id}
                      severity={
                        vuln.severity === "CRITICAL" || vuln.severity === "HIGH"
                          ? "error"
                          : vuln.severity === "MEDIUM"
                            ? "warning"
                            : "info"
                      }
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {vuln.cve || vuln.id} - {vuln.severity}
                      </Typography>
                      <Typography variant="body2">
                        {vuln.description}
                      </Typography>
                    </Alert>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>

          {/* Right Column - Library Info */}
          <LibraryInfo library={library} />
        </Box>
      </Container>
    </Box>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  Divider,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  FiberManualRecord,
  OpenInNew,
  Share,
} from "@mui/icons-material";
import { libraryApi, type LibraryDetail, type HealthMetrics } from "@/lib/api";
import HealthMetricsDisplay from "@/components/library/HealthMetricsDisplay";
import LibraryInfo from "@/components/library/LibraryInfo";
import DetailPageSkeleton from "@/components/skeletons/DetailPageSkeleton";
import toast from "react-hot-toast";

interface LibraryDetailViewProps {
  libraryId: string;
}

export default function LibraryDetailView({
  libraryId,
}: LibraryDetailViewProps) {
  const router = useRouter();
  const [library, setLibrary] = useState<LibraryDetail | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = parseInt(libraryId);
        if (isNaN(id)) {
          setError("Некорректный ID библиотеки");
          return;
        }

        const [libraryResponse, healthResponse] = await Promise.allSettled([
          libraryApi.getById(id),
          libraryApi.getHealth(id),
        ]);

        if (libraryResponse.status === "fulfilled") {
          setLibrary(libraryResponse.value.data);
        } else {
          // Вместо throw new Error, который может вызывать Error Overlay в dev-режиме,
          // просто устанавливаем ошибку и выходим.
          console.warn(
            "Ошибка при получении библиотеки:",
            libraryResponse.reason,
          );
          setError("Библиотека не найдена или произошла ошибка сервера");
          // Если метрики тоже не загрузились, можно сразу выходить
          setLoading(false);
          return;
        }

        if (healthResponse.status === "fulfilled") {
          setHealthMetrics(healthResponse.value.data);
        } else {
          console.warn("Не удалось загрузить метрики здоровья");
          // Не критичная ошибка, не блокируем отображение библиотеки
        }
      } catch (err: unknown) {
        // ... (остальной код catch)
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

    fetchLibraryData();
  }, [libraryId]);

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
          onClick={() => router.push("/dashboard")}
        >
          Вернуться к дашборду
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          pt: { xs: 4, md: 6 },
          pb: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => router.push("/dashboard")}
            sx={{ mb: 2 }}
          >
            Назад к обзору
          </Button>

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

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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
          <Stack spacing={3}>
            {healthMetrics && <HealthMetricsDisplay metrics={healthMetrics} />}

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
          </Stack>

          <LibraryInfo library={library} />
        </Box>
      </Container>
    </Box>
  );
}
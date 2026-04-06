"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { libraryApi, Library } from "@/lib/api";
import { useAuthStore } from "@/lib/auth";
import { useSourceDefinitions } from "@/lib/hooks";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Chip,
  InputAdornment,
  Stack,
  Tooltip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControl,
  FormLabel,
} from "@mui/material";
import {
  Search,
  FiberManualRecord,
  FilterList,
  TrendingUp,
  Security,
  OpenInNew,
} from "@mui/icons-material";
import LibraryCardSkeleton from "@/components/skeletons/LibraryCardSkeleton";
import LoginModal from "@/components/LoginModal";

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { sources, isLoading: sourcesLoading } = useSourceDefinitions();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [minHealthScore, setMinHealthScore] = useState<number>(0);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [tempSelectedSource, setTempSelectedSource] = useState<string | null>(null);
  const [tempMinHealthScore, setTempMinHealthScore] = useState<number>(0);
  const pageSize = 12;

  const applyFilters = useCallback(
    (
      nextQuery: string,
      nextSource: string | null,
      nextMinHealthScore: number,
      page = 0,
    ) => {
      const params = new URLSearchParams();
      if (nextQuery.trim()) params.set("q", nextQuery.trim());
      if (nextSource) params.set("source", nextSource);
      if (nextMinHealthScore > 0) {
        params.set("minHealthScore", nextMinHealthScore.toString());
      }
      params.set("page", page.toString());
      router.push(`/explore?${params.toString()}`);
    },
    [router],
  );

  const resolveSourceKey = useCallback(
    (source: string | null) => {
      if (!source) return null;

      const normalized = source.trim().toLowerCase();
      const matchedSource = sources.find(
        (item) => item.key === normalized || item.aliases.includes(normalized),
      );

      return matchedSource?.key || normalized;
    },
    [sources],
  );

  const fetchLibraries = useCallback(
    async (page: number, searchQuery: string, source: string | null, minScore: number) => {
      try {
        setLoading(true);
        let data;
        if (searchQuery || source) {
          const response = await libraryApi.search(
            searchQuery || "",
            source || undefined,
            page,
            pageSize,
            minScore > 0 ? minScore : undefined,
          );
          data = response.data;
        } else {
          const response = await libraryApi.getAll(
            page,
            pageSize,
            minScore > 0 ? minScore : undefined,
          );
          data = response.data;
        }

        const normalizedSource = resolveSourceKey(source);
        setLibraries(data.libraries);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setSelectedSource(normalizedSource);
      } catch (err: unknown) {
        console.error("Ошибка загрузки библиотек:", err);
        const error = err as Record<string, unknown>;
        if (
          error.code === "ERR_NETWORK" ||
          String(error.message).includes("Network")
        ) {
          setError(
            "Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на http://localhost:8081",
          );
        } else {
          setError("Не удалось загрузить данные");
        }
      } finally {
        setLoading(false);
      }
    },
    [pageSize, resolveSourceKey],
  );

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "0");
    const searchQuery = searchParams.get("q") || "";
    const source = searchParams.get("source") || null;
    const minScore = parseInt(searchParams.get("minHealthScore") || "0");
    const normalizedSource = resolveSourceKey(source);

    setQuery(searchQuery);
    setCurrentPage(page);
    setSelectedSource(normalizedSource);
    setMinHealthScore(minScore);
    setTempSelectedSource(normalizedSource);
    setTempMinHealthScore(minScore);
    fetchLibraries(page, searchQuery, normalizedSource, minScore);
  }, [searchParams, fetchLibraries, resolveSourceKey]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(query, selectedSource, minHealthScore, 0);
  };

  const handleOpenFilters = () => {
    setTempSelectedSource(selectedSource);
    setTempMinHealthScore(minHealthScore);
    setShowFiltersDialog(true);
  };

  const handleApplyFilters = () => {
    setSelectedSource(tempSelectedSource);
    setMinHealthScore(tempMinHealthScore);
    applyFilters(query, tempSelectedSource, tempMinHealthScore, 0);
    setShowFiltersDialog(false);
  };

  const handleResetFilters = () => {
    setSelectedSource(null);
    setMinHealthScore(0);
    setTempSelectedSource(null);
    setTempMinHealthScore(0);
    applyFilters(query, null, 0, 0);
    setShowFiltersDialog(false);
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number,
  ) => {
    const newPage = page - 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    if (query) params.set("q", query);
    if (selectedSource) params.set("source", selectedSource);
    if (minHealthScore > 0) params.set("minHealthScore", minHealthScore.toString());
    router.push(`/explore?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const activeFiltersCount = (selectedSource ? 1 : 0) + (minHealthScore > 0 ? 1 : 0);

  return (
    <Box sx={{ minHeight: "100vh", pb: 8 }}>
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
              Исследовать библиотеки
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: "700px", mx: "auto", mb: 5 }}
            >
              Находите и анализируйте Open Source библиотеки из различных
              экосистем
            </Typography>

            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ maxWidth: 800, mx: "auto" }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  bgcolor: "background.paper",
                  p: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  fullWidth
                  variant="standard"
                  placeholder="Поиск по имени, описанию или источнику..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                    sx: { px: 2 },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ px: 4, minWidth: { xs: "100%", sm: 120 }, boxShadow: "none" }}
                >
                  Найти
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 6 }}>
        {loading ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                {" "}
                Загрузка...{" "}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {[...Array(pageSize)].map((_, index) => (
                <LibraryCardSkeleton key={index} />
              ))}
            </Box>
          </>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ borderRadius: 2, "& .MuiAlert-message": { width: "100%" } }}
          >
            <Typography variant="body1" fontWeight={600} gutterBottom>
              {" "}
              {error}{" "}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {" "}
              Для запуска бэкенда выполните:{" "}
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
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
                gap: 2,
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Найдено результатов: {totalElements}
                {currentPage > 0 &&
                  ` (страница ${currentPage + 1} из ${totalPages})`}
              </Typography>
              <Button
                startIcon={<FilterList />}
                variant="contained"
                color="success"
                onClick={handleOpenFilters}
                sx={{
                  whiteSpace: "nowrap",
                  color: "common.white",
                  "& .MuiButton-startIcon": {
                    color: "common.white",
                  },
                }}
              >
                {activeFiltersCount > 0 ? `Фильтр (${activeFiltersCount})` : "Фильтр"}
              </Button>
            </Box>

            {activeFiltersCount > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
                {selectedSource && (
                  <Chip
                    label={`Источник: ${selectedSource}`}
                    color="success"
                    onDelete={() => {
                      setSelectedSource(null);
                      setTempSelectedSource(null);
                      applyFilters(query, null, minHealthScore, 0);
                    }}
                  />
                )}
                {minHealthScore > 0 && (
                  <Chip
                    label={`Рейтинг: от ${minHealthScore}%`}
                    color="success"
                    onDelete={() => {
                      setMinHealthScore(0);
                      setTempMinHealthScore(0);
                      applyFilters(query, selectedSource, 0, 0);
                    }}
                  />
                )}
              </Stack>
            )}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 3,
                mb: 4,
              }}
            >
              {libraries.map((lib) => (
                <Card
                  key={lib.id}
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: "primary.main",
                      boxShadow: "0 12px 24px rgba(76, 175, 80, 0.15)",
                    },
                  }}
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push(`/dashboard?libraryId=${lib.id}`);
                    } else {
                      setLoginModalOpen(true);
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={lib.source}
                        size="small"
                        sx={{
                          bgcolor: "primary.main",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor:
                            getHealthScoreColor(lib.healthScore) ===
                            "success.main"
                              ? "rgba(76, 175, 80, 0.1)"
                              : getHealthScoreColor(lib.healthScore) ===
                                  "warning.main"
                                ? "rgba(255, 152, 0, 0.1)"
                                : "rgba(244, 67, 54, 0.1)",
                        }}
                      >
                        <FiberManualRecord
                          sx={{
                            fontSize: 10,
                            color: getHealthScoreColor(lib.healthScore),
                          }}
                        />
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{ color: getHealthScoreColor(lib.healthScore) }}
                        >
                          {" "}
                          {lib.healthScore}%{" "}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      fontWeight={700}
                      sx={{ mb: 1 }}
                    >
                      {" "}
                      {lib.name}{" "}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "text.secondary", mb: 2 }}
                    >
                      {" "}
                      v{lib.version}{" "}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.6,
                        minHeight: "72px",
                      }}
                    >
                      {lib.description || "Описание отсутствует"}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                        <Tooltip title="Рейтинг здоровья">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <TrendingUp
                              sx={{ fontSize: 16, color: "primary.main" }}
                            />
                            <Typography variant="caption">
                              {getHealthScoreLabel(lib.healthScore)}
                            </Typography>
                          </Box>
                        </Tooltip>
                        {lib.license && (
                          <Tooltip title="Лицензия">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Security
                                sx={{ fontSize: 16, color: "text.secondary" }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {lib.license}
                              </Typography>
                            </Box>
                          </Tooltip>
                        )}
                      </Stack>
                    </Box>
                    <Box
                      sx={{
                        mt: "auto",
                        pt: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack direction="row" spacing={1.5}>
                        {lib.repositoryUrl && (
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<OpenInNew />}
                            sx={{ fontWeight: 600 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(lib.repositoryUrl, "_blank", "noopener,noreferrer");
                            }}
                          >
                            Репозиторий
                          </Button>
                        )}
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          sx={{ fontWeight: 600 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAuthenticated) {
                              router.push(`/dashboard?libraryId=${lib.id}`);
                            } else {
                              setLoginModalOpen(true);
                            }
                          }}
                        >
                          Подробнее
                        </Button>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {libraries.length === 0 && (
                <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 10 }}>
                  <Search
                    sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {" "}
                    Библиотеки не найдены{" "}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {" "}
                    Попробуйте изменить запрос или выберите другую
                    экосистему{" "}
                  </Typography>
                </Box>
              )}
            </Box>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage + 1}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{ "& .MuiPaginationItem-root": { fontWeight: 600 } }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      <Dialog
        open={showFiltersDialog}
        onClose={() => setShowFiltersDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Фильтр библиотек</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel sx={{ mb: 1.5 }}>Источник</FormLabel>
              {sourcesLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Загружаем источники...
                  </Typography>
                </Box>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label="Все"
                    color={tempSelectedSource === null ? "primary" : "default"}
                    variant={tempSelectedSource === null ? "filled" : "outlined"}
                    onClick={() => setTempSelectedSource(null)}
                    sx={{ cursor: "pointer" }}
                  />
                  {sources.map((sourceItem) => (
                    <Chip
                      key={sourceItem.key}
                      label={sourceItem.displayName}
                      color={tempSelectedSource === sourceItem.key ? "primary" : "default"}
                      variant={tempSelectedSource === sourceItem.key ? "filled" : "outlined"}
                      onClick={() => setTempSelectedSource(sourceItem.key)}
                      sx={{ cursor: "pointer" }}
                    />
                  ))}
                </Stack>
              )}
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel sx={{ mb: 2 }}>
                Минимальный рейтинг здоровья: {tempMinHealthScore}%
              </FormLabel>
              <Slider
                value={tempMinHealthScore}
                onChange={(_, value) => setTempMinHealthScore(value as number)}
                min={0}
                max={100}
                step={10}
                marks={[
                  { value: 0, label: "0%" },
                  { value: 60, label: "60%" },
                  { value: 80, label: "80%" },
                  { value: 90, label: "90%" },
                  { value: 100, label: "100%" },
                ]}
                valueLabelDisplay="auto"
                sx={{ mt: 2 }}
              />
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Фильтрует библиотеки с рейтингом здоровья выше указанного значения
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters} color="inherit">
            Сбросить
          </Button>
          <Button onClick={() => setShowFiltersDialog(false)}>
            Отмена
          </Button>
          <Button onClick={handleApplyFilters} variant="contained">
            Применить
          </Button>
        </DialogActions>
      </Dialog>

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        title="Требуется вход в аккаунт"
        message="Для просмотра подробной информации о библиотеке необходимо авторизироваться"
      />
    </Box>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography>Загрузка...</Typography>
        </Box>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

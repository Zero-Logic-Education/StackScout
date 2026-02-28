'use client';

import { useState, useEffect } from 'react';
import {
  CircularProgress,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  LinearProgress,
  Chip,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import {
  PlayArrow,
  Pause as PauseIcon,
  Refresh,
  Settings,
  Error as ErrorIcon,
  CheckCircle,
  Schedule,
  GetApp,
} from '@mui/icons-material';
import { useAdminProtection } from '@/lib/useAdminProtection';
import { adminApi } from '@/lib/api';

interface ScraperTask {
  id: number;
  scraperName: string;
  displayName: string;
  source: string;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR' | 'COMPLETED';
  enabled: boolean;
  progress: number;
  processedCount: number;
  totalCount: number;
  errorCount: number;
  lastRunAt?: string;
  nextRunAt?: string;
  lastError?: string;
}

export default function ScrapersMonitorPage() {
  const theme = useTheme();
  const { isAdminAuthenticated } = useAdminProtection();
  const [scrapers, setScrapers] = useState<ScraperTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScrapers();
    // Обновление каждые 5 секунд
    const interval = setInterval(loadScrapers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadScrapers = async () => {
    try {
      const response = await adminApi.getScrapers();
      setScrapers(response.data);
    } catch (error) {
      console.error('Failed to load scrapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (scraperName: string) => {
    try {
      await adminApi.startScraper(scraperName);
      loadScrapers();
    } catch (error) {
      console.error('Failed to start scraper:', error);
    }
  };

  const handlePause = async (scraperName: string) => {
    try {
      await adminApi.pauseScraper(scraperName);
      loadScrapers();
    } catch (error) {
      console.error('Failed to pause scraper:', error);
    }
  };

  const handleRestart = async (scraperName: string) => {
    try {
      await adminApi.restartScraper(scraperName);
      loadScrapers();
    } catch (error) {
      console.error('Failed to restart scraper:', error);
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (status) {
      case 'RUNNING': return 'success';
      case 'PAUSED': return 'warning';
      case 'ERROR': return 'error';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING': return <GetApp />;
      case 'ERROR': return <ErrorIcon />;
      case 'COMPLETED': return <CheckCircle />;
      default: return <Schedule />;
    }
  };

  if (loading || !isAdminAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 10, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Stack spacing={4} sx={{ mb: 6 }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{
              fontWeight: 800,
              mb: 1,
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Мониторинг скрейперов
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Управление и мониторинг задач парсинга данных
            </Typography>
          </Box>
        </Stack>

        {/* Scrapers Grid */}
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr'}, gap: 3}}>
          {scrapers.map((scraper) => (
            <Box key={scraper.id}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ pb: 2 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {scraper.displayName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Источник: {scraper.source.toUpperCase()}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(scraper.status)}
                      label={scraper.status}
                      color={getStatusColor(scraper.status)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  {/* Progress Bar */}
                  {scraper.status === 'RUNNING' && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Прогресс
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {scraper.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={scraper.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.primary.main, 0.12),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: 'linear-gradient(to right, #4caf50, #81c784)',
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Stats */}
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr'}, gap: 3}}>
                    <Box>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Обработано
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {scraper.processedCount?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Всего
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {scraper.totalCount?.toLocaleString() || 0}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                          Ошибки
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: scraper.errorCount > 0 ? 'error.main' : 'text.primary' }}>
                          {scraper.errorCount || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Error Message */}
                  {scraper.lastError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {scraper.lastError}
                      </Typography>
                    </Alert>
                  )}

                  {/* Last Run */}
                  {scraper.lastRunAt && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Последний запуск: {new Date(scraper.lastRunAt).toLocaleString('ru-RU')}
                    </Typography>
                  )}
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ gap: 1, pt: 0 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleStart(scraper.scraperName)}
                    disabled={scraper.status === 'RUNNING'}
                    sx={{ flex: 1 }}
                  >
                    Запустить
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PauseIcon />}
                    onClick={() => handlePause(scraper.scraperName)}
                    disabled={scraper.status !== 'RUNNING'}
                    sx={{ flex: 1 }}
                  >
                    Пауза
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => handleRestart(scraper.scraperName)}
                  >
                    Перезапуск
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Settings />}
                  >
                    Настройки
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Empty State */}
        {scrapers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <GetApp sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2, mx: 'auto' }} />
            <Typography color="text.secondary">Нет доступных скрейперов</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

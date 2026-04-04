'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CircularProgress,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  Settings as SettingsIcon,
  Storage,
  People,
  Autorenew,
  Dns,
} from '@mui/icons-material';
import { useAdminProtection } from '@/lib/useAdminProtection';
import { adminApi, type AdminDashboardStats, type CacheStats } from '@/lib/api';

interface ScraperRuntime {
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
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAdminAuthenticated } = useAdminProtection();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [scrapers, setScrapers] = useState<ScraperRuntime[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const loadData = async (showMainLoader = false) => {
    if (showMainLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const [dashboardResponse, cacheResponse, scrapersResponse] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getCacheStats(),
        adminApi.getScrapers(),
      ]);

      setDashboardStats(dashboardResponse.data);
      setCacheStats(cacheResponse.data);
      setScrapers((scrapersResponse.data || []) as ScraperRuntime[]);
      setLastUpdatedAt(new Date().toISOString());
    } catch (e) {
      console.error('Failed to load admin diagnostics:', e);
      setError('Не удалось загрузить реальные данные системы');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdminAuthenticated) {
      return;
    }
    loadData(true);
  }, [isAdminAuthenticated]);

  const runningScrapers = useMemo(
    () => scrapers.filter((scraper) => scraper.status === 'RUNNING').length,
    [scrapers],
  );

  const failedScrapers = useMemo(
    () => scrapers.filter((scraper) => scraper.status === 'ERROR').length,
    [scrapers],
  );

  const totalScraperErrors = useMemo(
    () => scrapers.reduce((sum, scraper) => sum + (scraper.errorCount || 0), 0),
    [scrapers],
  );

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
        <Stack spacing={4} sx={{ mb: 6 }}>
          <Box>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/admin')}>
              Назад
            </Button>
          </Box>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 1,
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Диагностика системы
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Только реальные показатели из backend API
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => loadData(false)}
              disabled={refreshing}
            >
              {refreshing ? 'Обновление...' : 'Обновить данные'}
            </Button>
            {lastUpdatedAt && (
              <Typography variant="body2" color="text.secondary">
                Последнее обновление: {new Date(lastUpdatedAt).toLocaleString('ru-RU')}
              </Typography>
            )}
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3,
            mb: 4,
          }}
        >
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Storage color="primary" />
                <Typography variant="body2" color="text.secondary">Библиотек</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800}>
                {(dashboardStats?.totalLibraries ?? 0).toLocaleString('ru-RU')}
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <People color="primary" />
                <Typography variant="body2" color="text.secondary">Пользователей</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800}>
                {(dashboardStats?.totalUsers ?? 0).toLocaleString('ru-RU')}
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Autorenew color="primary" />
                <Typography variant="body2" color="text.secondary">Скрейперов запущено</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800}>
                {runningScrapers}
              </Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Dns color="primary" />
                <Typography variant="body2" color="text.secondary">Кэш-областей Redis</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800}>
                {(cacheStats?.cacheNames?.length ?? 0).toLocaleString('ru-RU')}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>Статус платформы</Typography>
              </Stack>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Системный статус</Typography>
                  <Chip
                    size="small"
                    label={dashboardStats?.systemStatus || 'UNKNOWN'}
                    color={dashboardStats?.systemStatus === 'UP' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Скрейперы в ошибке</Typography>
                  <Typography fontWeight={700}>{failedScrapers}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Ошибок скрейперов всего</Typography>
                  <Typography fontWeight={700}>{totalScraperErrors}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Активных скрейперов (API)</Typography>
                  <Typography fontWeight={700}>{dashboardStats?.activeScraper ?? 0}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Список кэшей Redis
              </Typography>
              {!cacheStats?.cacheNames?.length ? (
                <Typography variant="body2" color="text.secondary">
                  API не вернуло ни одной кэш-области.
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {cacheStats.cacheNames.map((cacheName) => (
                    <Chip key={cacheName} label={cacheName} size="small" variant="outlined" />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

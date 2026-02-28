'use client';

import { useEffect, useState } from 'react';
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
  alpha,
  useTheme,
} from '@mui/material';
import {
  DeleteOutline,
  Refresh,
  Storage,
  CachedRounded,
} from '@mui/icons-material';
import { useAdminProtection } from '@/lib/useAdminProtection';
import { adminApi, type AdminDashboardStats, type CacheStats } from '@/lib/api';

export default function AdminMaintenancePage() {
  const theme = useTheme();
  const { isAdminAuthenticated } = useAdminProtection();
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated) {
      return;
    }

    const loadStats = async () => {
      try {
        const [dashboardResponse, cacheResponse] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getCacheStats(),
        ]);

        setDashboardStats(dashboardResponse.data);
        setCacheStats(cacheResponse.data);
      } catch (error) {
        console.error('Failed to load maintenance stats:', error);
      }
    };

    loadStats();
  }, [isAdminAuthenticated]);

  const handleClearCache = async () => {
    setLoading(true);
    try {
      await adminApi.clearCache();
      const cacheResponse = await adminApi.getCacheStats();
      setCacheStats(cacheResponse.data);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleNormalizeLicenses = async () => {
    if (!confirm('Запустить нормализацию всех лицензий?')) return;
    
    setLoading(true);
    try {
      await adminApi.normalizeLicenses();
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!confirm('Удалить дубликаты библиотек? Это действие нельзя отменить!')) return;
    
    setLoading(true);
    try {
      await adminApi.removeDuplicates();
      const dashboardResponse = await adminApi.getDashboardStats();
      setDashboardStats(dashboardResponse.data);
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminAuthenticated) {
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
              Регламентные работы
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Обслуживание и оптимизация системы
            </Typography>
          </Box>
        </Stack>

        {/* Actions Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 6 }}>
          {/* Clear Cache */}
          <Box>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.paper, 0.6),
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DeleteOutline sx={{ color: 'error.main', fontSize: '1.75rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Очистка кэша Redis
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Очищает все кэши в Redis. Используйте, если возникли проблемы с устаревшими данными.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  onClick={handleClearCache}
                  disabled={loading}
                >
                  {loading ? 'Очистка...' : 'Очистить кэш'}
                </Button>
              </CardActions>
            </Card>
          </Box>

          {/* Normalize Licenses */}
          <Box>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.paper, 0.6),
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Refresh sx={{ color: 'info.main', fontSize: '1.75rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Нормализация лицензий
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Массовое обновление и нормализация названий лицензий во всех библиотеках.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="info"
                  onClick={handleNormalizeLicenses}
                  disabled={loading}
                >
                  {loading ? 'Обработка...' : 'Нормализовать лицензии'}
                </Button>
              </CardActions>
            </Card>
          </Box>

          {/* Remove Duplicates */}
          <Box>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.paper, 0.6),
              }}
            >
              <CardContent sx={{ pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Storage sx={{ color: 'warning.main', fontSize: '1.75rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      Удаление дубликатов
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Удаляет дублирующиеся записи библиотек из базы данных.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  onClick={handleRemoveDuplicates}
                  disabled={loading}
                >
                  {loading ? 'Удаление...' : 'Удалить дубликаты'}
                </Button>
              </CardActions>
            </Card>
          </Box>

          {/* Database Stats */}
          <Box>
            <Card
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.paper, 0.6),
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.12),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CachedRounded sx={{ color: 'success.main', fontSize: '1.75rem' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Статистика базы данных
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Библиотек:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(dashboardStats?.totalLibraries ?? 0).toLocaleString('ru-RU')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Пользователей:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(dashboardStats?.totalUsers ?? 0).toLocaleString('ru-RU')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Кэшей в Redis:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {(cacheStats?.cacheNames?.length ?? 0).toLocaleString('ru-RU')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

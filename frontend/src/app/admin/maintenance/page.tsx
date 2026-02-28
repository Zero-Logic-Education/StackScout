'use client';

import { useState } from 'react';
import {
  CircularProgress,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  Grid,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DeleteOutline,
  Refresh,
  Storage,
  WarningAmber,
  CheckCircle,
  CachedRounded,
  GetApp,
} from '@mui/icons-material';
import { useAdminProtection } from '@/lib/useAdminProtection';

export default function AdminMaintenancePage() {
  const theme = useTheme();
  const { isAdminAuthenticated } = useAdminProtection();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClearCache = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/maintenance/clear-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Кэш успешно очищен. Очищено кэшей: ${data.clearedCaches}` });
      } else {
        setMessage({ type: 'error', text: 'Не удалось очистить кэш' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при очистке кэша' });
    } finally {
      setLoading(false);
    }
  };

  const handleNormalizeLicenses = async () => {
    if (!confirm('Запустить нормализацию всех лицензий?')) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/libraries/bulk-normalize-licenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Нормализация лицензий запущена' });
      } else {
        setMessage({ type: 'error', text: 'Не удалось запустить нормализацию' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при нормализации лицензий' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!confirm('Удалить дубликаты библиотек? Это действие нельзя отменить!')) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/libraries/remove-duplicates', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Дубликаты успешно удалены' });
      } else {
        setMessage({ type: 'error', text: 'Не удалось удалить дубликаты' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при удалении дубликатов' });
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
      <Container maxWidth="xxl">
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

        {/* Message */}
        {message && (
          <Alert
            severity={message.type === 'success' ? 'success' : 'error'}
            sx={{ mb: 4, borderRadius: 2 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        {/* Actions Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {/* Clear Cache */}
          <Grid item xs={12} md={6}>
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
          </Grid>

          {/* Normalize Licenses */}
          <Grid item xs={12} md={6}>
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
          </Grid>

          {/* Remove Duplicates */}
          <Grid item xs={12} md={6}>
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
          </Grid>

          {/* Database Stats */}
          <Grid item xs={12} md={6}>
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
                          1,234
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Пользователей:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          56
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Размер БД:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          245 МБ
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Warning */}
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <WarningAmber sx={{ mr: 1, display: 'inline' }} />
          Регламентные работы могут повлиять на производительность системы. 
          Рекомендуется выполнять их в периоды низкой нагрузки.
        </Alert>
      </Container>
    </Box>
  );
}

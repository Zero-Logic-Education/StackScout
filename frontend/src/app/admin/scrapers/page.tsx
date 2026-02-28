'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Pause as PauseIcon,
  Refresh,
  Settings,
  Error as ErrorIcon,
  CheckCircle,
  Schedule,
  GetApp,
  Add as AddIcon,
  Close as CloseIcon,
  Stop as StopIcon,
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
  const router = useRouter();
  const theme = useTheme();
  const { isAdminAuthenticated } = useAdminProtection();
  const [scrapers, setScrapers] = useState<ScraperTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Диалог ручного сканирования
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogScraper, setDialogScraper] = useState<ScraperTask | null>(null);
  const [packageInput, setPackageInput] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  // Snackbar уведомления
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false, message: '', severity: 'info',
  });
  const showSnack = (message: string, severity: 'success' | 'error' | 'info' = 'info') =>
    setSnackbar({ open: true, message, severity });

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
      showSnack(`Скрейпер ${scraperName} запущен. Данные начнут появляться через несколько секунд.`, 'success');
      loadScrapers();
    } catch (error) {
      console.error('Failed to start scraper:', error);
      showSnack('Не удалось запустить скрейпер', 'error');
    }
  };

  const handlePause = async (scraperName: string) => {
    try {
      await adminApi.pauseScraper(scraperName);
      showSnack(`Скрейпер ${scraperName} приостановлен`, 'info');
      loadScrapers();
    } catch (error) {
      console.error('Failed to pause scraper:', error);
      showSnack('Не удалось приостановить скрейпер', 'error');
    }
  };

  const handleResume = async (scraperName: string) => {
    try {
      await adminApi.resumeScraper(scraperName);
      showSnack(`Скрейпер ${scraperName} возобновлён`, 'success');
      loadScrapers();
    } catch (error) {
      console.error('Failed to resume scraper:', error);
      showSnack('Не удалось возобновить скрейпер', 'error');
    }
  };

  const handleStop = async (scraperName: string) => {
    try {
      await adminApi.stopScraper(scraperName);
      showSnack(`Скрейпер ${scraperName} остановлен`, 'info');
      loadScrapers();
    } catch (error) {
      console.error('Failed to stop scraper:', error);
      showSnack('Не удалось остановить скрейпер', 'error');
    }
  };

  // -- Диалог ручного сканирования --

  const openScanDialog = (scraper: ScraperTask) => {
    setDialogScraper(scraper);
    setPackageInput('');
    setDialogOpen(true);
  };

  const closeScanDialog = () => {
    setDialogOpen(false);
    setDialogScraper(null);
    setPackageInput('');
  };

  const handleScanPackages = async () => {
    if (!dialogScraper || !packageInput.trim()) return;

    const packages = packageInput
      .split(/[\n,]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (packages.length === 0) {
      showSnack('Введите хотя бы один пакет', 'error');
      return;
    }

    setDialogLoading(true);
    try {
      await adminApi.scanPackages(dialogScraper.scraperName, dialogScraper.source, packages);
      showSnack(`${packages.length} пакетов поставлено в очередь на сканирование`, 'success');
      closeScanDialog();
      setTimeout(loadScrapers, 2000);
    } catch (error) {
      console.error('Failed to scan packages:', error);
      showSnack('Ошибка при запуске сканирования', 'error');
    } finally {
      setDialogLoading(false);
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
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/admin')}>
              Назад
            </Button>
          </Box>
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
                <CardActions
                  sx={{
                    pt: 0,
                    px: 2,
                    pb: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 1,
                  }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={() => handleStart(scraper.scraperName)}
                    disabled={scraper.status === 'RUNNING'}
                    fullWidth
                    color="success"
                  >
                    Запустить
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => openScanDialog(scraper)}
                    fullWidth
                  >
                    Пакеты
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PauseIcon />}
                    onClick={() => handlePause(scraper.scraperName)}
                    disabled={scraper.status !== 'RUNNING'}
                    fullWidth
                  >
                    Пауза
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<StopIcon />}
                    onClick={() => handleStop(scraper.scraperName)}
                    disabled={scraper.status === 'IDLE' || scraper.status === 'COMPLETED'}
                    fullWidth
                    color="error"
                  >
                    Стоп
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

      {/* Диалог ручного сканирования пакетов */}
      <Dialog open={dialogOpen} onClose={closeScanDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={700}>
              Сканировать пакеты
            </Typography>
            <IconButton size="small" onClick={closeScanDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
          {dialogScraper && (
            <Typography variant="body2" color="text.secondary">
              Скрейпер: <strong>{dialogScraper.displayName}</strong> ({dialogScraper.source.toUpperCase()})
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Введите названия пакетов через запятую или с новой строки. Пакеты будут поставлены в очередь
            и появятся в библиотеках после завершения сбора данных.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={5}
            label={dialogScraper?.source === 'dockerhub' ? 'Docker образы' : 'PyPI пакеты'}
            placeholder={
              dialogScraper?.source === 'dockerhub'
                ? 'nginx\nmysql\nredis, postgres'
                : 'requests\ndjango\nnumpy, pandas'
            }
            value={packageInput}
            onChange={(e) => setPackageInput(e.target.value)}
            variant="outlined"
            helperText="Например: requests, numpy, pandas"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeScanDialog} disabled={dialogLoading}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleScanPackages}
            disabled={!packageInput.trim() || dialogLoading}
            startIcon={dialogLoading ? <CircularProgress size={16} /> : <PlayArrow />}
          >
            {dialogLoading ? 'Запуск...' : 'Начать сканирование'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

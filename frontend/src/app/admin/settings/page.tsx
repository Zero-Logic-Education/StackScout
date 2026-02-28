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
  TextField,
  Button,
  Stack,
  Switch,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAdminProtection } from '@/lib/useAdminProtection';

interface SystemSettings {
  appName: string;
  appDescription: string;
  maxUploadSize: number;
  enableNotifications: boolean;
  enableAnalytics: boolean;
  maintenanceMode: boolean;
  apiRateLimit: number;
  sessionTimeout: number;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAdminAuthenticated } = useAdminProtection();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    appName: 'StackScout',
    appDescription: 'Платформа для управления зависимостями Python и Docker',
    maxUploadSize: 100,
    enableNotifications: true,
    enableAnalytics: true,
    maintenanceMode: false,
    apiRateLimit: 1000,
    sessionTimeout: 3600,
  });

  useEffect(() => {
    // Simulate loading settings from localStorage
    setLoading(false);
    const savedSettings = localStorage.getItem('admin-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: keyof SystemSettings, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage (in real app, would save to backend)
      localStorage.setItem('admin-settings', JSON.stringify(settings));
      // Show success message (in real app, would show toast)
      alert('Настройки сохранены');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
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
      <Container maxWidth="md">
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
              Настройки системы
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Конфигурация параметров платформы StackScout
            </Typography>
          </Box>
        </Stack>

        {/* Application Settings */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 2,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SettingsIcon sx={{ color: 'primary.main', fontSize: '1.75rem' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Основные параметры приложения
              </Typography>
            </Box>

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Имя приложения"
                value={settings.appName}
                onChange={(e) => handleSettingChange('appName', e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Описание приложения"
                value={settings.appDescription}
                onChange={(e) => handleSettingChange('appDescription', e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                type="number"
                label="Максимальный размер загрузки (МБ)"
                value={settings.maxUploadSize}
                onChange={(e) => handleSettingChange('maxUploadSize', parseInt(e.target.value))}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 2,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Включение функций
            </Typography>

            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Уведомления</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Включение системы уведомлений для пользователей
                  </Typography>
                </Box>
                <Switch
                  checked={settings.enableNotifications}
                  onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                />
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Аналитика</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Сбор статистики использования платформы
                  </Typography>
                </Box>
                <Switch
                  checked={settings.enableAnalytics}
                  onChange={(e) => handleSettingChange('enableAnalytics', e.target.checked)}
                />
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Режим обслуживания</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Закрыть доступ для обычных пользователей
                  </Typography>
                </Box>
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  color="error"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            borderRadius: 2,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Параметры API
            </Typography>

            <Stack spacing={3}>
              <TextField
                fullWidth
                type="number"
                label="Лимит запросов API (req/hour)"
                value={settings.apiRateLimit}
                onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                fullWidth
                type="number"
                label="Timeout сессии (секунды)"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/admin')}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #2a6d2c 100%)',
              },
            }}
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

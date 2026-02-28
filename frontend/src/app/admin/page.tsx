'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';
import {
  CircularProgress,
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Devices,
  Storage,
  People,
  Settings,
  Build,
  TrendingUp,
  Autorenew,
} from '@mui/icons-material';

export default function AdminDashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated } = useAuthStore();
  const isAdmin = useAuthStore((state) => state.isAdmin);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    if (!isAdmin()) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin()) {
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

  const adminSections = [
    {
      title: 'Мониторинг скрейперов',
      description: 'Управление парсерами PyPI и Docker Hub',
      href: '/admin/scrapers',
      icon: Devices,
      color: 'success',
    },
    {
      title: 'Управление библиотеками',
      description: 'CRUD операции и модерация библиотек',
      href: '/admin/libraries',
      icon: Storage,
      color: 'info',
    },
    {
      title: 'Управление пользователями',
      description: 'Редактирование и блокировка пользователей',
      href: '/admin/users',
      icon: People,
      color: 'warning',
    },
    {
      title: 'Регламентные работы',
      description: 'Очистка кэша, обновление лицензий',
      href: '/admin/maintenance',
      icon: Build,
      color: 'error',
    },
    {
      title: 'Настройки системы',
      description: 'Конфигурация и параметры платформы',
      href: '/admin/settings',
      icon: Settings,
      color: 'primary',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 10, md: 12 } }}>
      <Container maxWidth="xxl">
        {/* Header */}
        <Stack spacing={4} sx={{ mb: 6 }}>
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
              Административная панель
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Управление платформой StackScout
            </Typography>
          </Box>
        </Stack>

        {/* Admin Sections Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {adminSections.slice(0, 4).map((section, index) => {
            const IconComponent = section.icon;
            const colorMap: Record<string, string> = {
              success: '#4caf50',
              info: '#2196f3',
              warning: '#ff9800',
              error: '#f44336',
              primary: '#4caf50',
            };

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Link href={section.href} style={{ textDecoration: 'none' }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        borderColor: colorMap[section.color],
                        boxShadow: `0 12px 32px ${alpha(colorMap[section.color], 0.2)}`,
                      },
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(colorMap[section.color], 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComponent
                            sx={{ color: colorMap[section.color], fontSize: '1.75rem' }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {section.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {section.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>

        {/* System Status */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.background.paper, 0.6),
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
              Статус системы
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      gap: 1,
                    }}
                  >
                    <Autorenew sx={{ color: 'success.main', fontSize: '1.5rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      2
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Активные скрейперы
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      1,234
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Всего библиотек
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      56
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Пользователей
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                      gap: 1,
                    }}
                  >
                    <TrendingUp sx={{ color: 'success.main', fontSize: '1.5rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      ОК
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Статус системы
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

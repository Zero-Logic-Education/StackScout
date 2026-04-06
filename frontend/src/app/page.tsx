import { Container, Box, Typography, Button, Card, CardContent, Stack } from '@mui/material';
import { 
  Search, 
  Dashboard, 
  Security, 
  TrendingUp, 
  Speed,
  CheckCircle,
  Analytics,
  Shield,
  Insights,
  AutoGraph,
  NotificationsActive,
  Hub
} from '@mui/icons-material';
import Link from 'next/link';

export default function Home() {
  const stats = [
    { value: '50K+', label: 'Библиотек в каталоге' },
    { value: '7+', label: 'Источников данных' },
    { value: '24/7', label: 'Фоновый мониторинг' },
    { value: 'Live', label: 'Актуальная аналитика' },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Мониторинг здоровья',
      description: 'Отслеживание состояния пакетов и их поддержки в режиме реального времени',
    },
    {
      icon: Security,
      title: 'Анализ безопасности',
      description: 'Проверка уязвимостей и оценка рисков безопасности ваших зависимостей',
    },
    {
      icon: Shield,
      title: 'Лицензионный аудит',
      description: 'Автоматическая оценка юридических рисков и соответствия лицензиям',
    },
    {
      icon: Analytics,
      title: 'Предиктивная аналитика',
      description: 'ML-прогнозирование надёжности и долговечности библиотек',
    },
    {
      icon: Speed,
      title: 'Метрики производительности',
      description: 'Детальный анализ производительности и бенчмарки библиотек',
    },
    {
      icon: Insights,
      title: 'Умные рекомендации',
      description: 'Персонализированные советы по выбору оптимальных зависимостей',
    },
  ];

  const whyChooseUs = [
    'Единое место для анализа риска, лицензий и обновлений',
    'Интеграции с GitHub, npm, Maven, PyPI, NuGet и Docker',
    'Оперативные метрики по качеству и активности экосистемы',
    'Отслеживание CVE и уязвимостей по версиям зависимостей',
    'Быстрый переход от обзора к детальной аналитике',
    'Поддержка командного сценария через API и админ-панель',
  ];

  const useCases = [
    {
      icon: AutoGraph,
      title: 'Контроль стабильности релизов',
      description: 'Сверяйте динамику обновлений и уровень риска до публикации новой версии продукта.',
    },
    {
      icon: NotificationsActive,
      title: 'Приоритет уязвимостей',
      description: 'Фокусируйтесь на критичных зависимостях по влиянию на ваши сервисы, а не только по CVSS.',
    },
    {
      icon: Hub,
      title: 'Единая картина экосистемы',
      description: 'Сравнивайте библиотеки между экосистемами и выбирайте наиболее живые и поддерживаемые решения.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      {/* Hero Section с градиентом */}
      <Box
        sx={{
          backgroundImage: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(55, 100, 80, 0.35) 50%, rgba(26, 26, 26, 0.95) 100%)',
          position: 'relative',
          borderTop: '2px solid',
          borderBottom: '2px solid',
          borderColor: 'rgba(76, 175, 80, 0.4)',
          boxShadow: 'inset 0 0 40px rgba(76, 175, 80, 0.1), 0 0 60px rgba(76, 175, 80, 0.05)',
          pt: { xs: 16, md: 20 },
          pb: { xs: 12, md: 16 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(76, 175, 80, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(56, 142, 60, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              Принимайте обоснованные
              <br />
              решения о зависимостях
            </Typography>
            <Typography
              variant="h5"
              sx={{ 
                mb: 5, 
                color: 'text.secondary', 
                maxWidth: '800px', 
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              StackScout — профессиональная платформа для глубокого анализа Open Source библиотек. 
              Оценивайте риски, отслеживайте уязвимости и выбирайте надёжные зависимости.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 8 }}
            >
              <Link href="/explore" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Search />}
                  sx={{ 
                    px: 5, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(76, 175, 80, 0.3)',
                  }}
                >
                  Начать исследование
                </Button>
              </Link>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Dashboard />}
                  sx={{ px: 5, py: 2, fontSize: '1.1rem', fontWeight: 600 }}
                >
                  Перейти к аналитике
                </Button>
              </Link>
            </Stack>

            {/* Stats */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 4,
                mt: 4,
              }}
            >
              {stats.map((stat, index) => (
                <Box key={index}>
                  <Box>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 0.5,
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Мощные инструменты аналитики
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Всё необходимое для полного контроля над вашими зависимостями
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Box key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(76, 175, 80, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        color: 'white',
                        mb: 3,
                      }}
                    >
                      <Icon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight={600}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Container>

      {/* Use Cases Section */}
      <Container maxWidth="lg" sx={{ mt: 14 }}>
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.75rem' },
            }}
          >
            Что даёт StackScout команде
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '760px', mx: 'auto' }}>
            Практические сценарии, которые помогают принимать решения быстрее и снижать стоимость ошибок в зависимостях.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {useCases.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                elevation={0}
                sx={{
                  p: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(76, 175, 80, 0.14)',
                    color: 'primary.main',
                    mb: 2,
                  }}
                >
                  <Icon sx={{ fontSize: 30 }} />
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Card>
            );
          })}
        </Box>
      </Container>

      {/* Why Choose Us Section */}
      <Container maxWidth="lg" sx={{ mt: 16 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 6,
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                mb: 3,
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.75rem' },
              }}
            >
              Почему выбирают StackScout?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
              Мы предоставляем самые полные и актуальные данные о Open Source библиотеках, 
              помогая командам разработчиков принимать взвешенные решения.
            </Typography>
            <Stack spacing={2}>
              {whyChooseUs.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <CheckCircle sx={{ color: 'primary.main', mr: 2, mt: 0.5 }} />
                  <Typography variant="body1" sx={{ fontSize: '1rem' }}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
          <Box>
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'rgba(76, 175, 80, 0.25)',
                backgroundImage: 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(26, 26, 26, 0.06) 100%)',
              }}
            >
              <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
                Фокус на решениях, а не на шуме
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                Главная цель StackScout: помочь вам быстрее перейти от вопроса «что происходит с зависимостями»
                к ответу «что делать в этом спринте». На одной странице вы видите здоровье, риски и динамику,
                а в аналитике уже работаете с деталями по каждому пакету.
              </Typography>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="contained" startIcon={<Dashboard />} sx={{ px: 3.5, py: 1.2 }}>
                  Перейти к аналитике
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

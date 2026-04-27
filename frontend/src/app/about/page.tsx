import type { Metadata } from "next";
import { Container, Box, Typography, Card, CardContent, Button } from '@mui/material';
import { 
  RocketLaunch, 
  Visibility, 
  Code,
  Security,
  Speed,
  Public,
  GitHub
} from '@mui/icons-material';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "О нас | StackScout",
  description: "Актуальная информация о StackScout: миссия, ценности и репозиторий проекта",
};

export default function AboutPage() {
  const values = [
    {
      icon: Code,
      title: 'Open Source First',
      description: 'Мы верим в силу открытого кода и вносим вклад в сообщество',
    },
    {
      icon: Security,
      title: 'Безопасность',
      description: 'Защита данных и конфиденциальность — наши главные приоритеты',
    },
    {
      icon: Speed,
      title: 'Производительность',
      description: 'Оптимизированные процессы сбора и анализа данных для быстрого принятия решений',
    },
    {
      icon: Public,
      title: 'Доступность',
      description: 'Делаем аналитику Open Source доступной для всех разработчиков',
    },
  ];

  const features = [
    {
      title: 'Управление программными активами (SAM)',
      description: 'Централизованный анализ зависимостей, рисков лицензирования и технического долга по библиотекам.',
    },
    {
      title: 'Глубокая аналитика и мониторинг',
      description: 'Метрики качества, уязвимостей, активности экосистем и обновлений в едином контуре аналитики.',
    },
    {
      title: 'Асинхронная обработка данных',
      description: 'Фоновые задачи и очередь сообщений для стабильного сбора данных из внешних источников.',
    },
    {
      title: 'Production-ready инфраструктура',
      description: 'Docker Compose, healthchecks сервисов и наблюдаемость через Prometheus/Grafana.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', pt: 12, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="h1"
            sx={{
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            О StackScout
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: '800px', mx: 'auto', lineHeight: 1.7 }}
          >
            Актуальная платформа для анализа и мониторинга Open Source библиотек с фокусом
            на безопасность, лицензии и управляемость зависимостей
          </Typography>
          
        </Box>

        {/* Mission */}
        <Card
          elevation={0}
          sx={{
            mb: 8,
            p: { xs: 4, md: 6 },
            backgroundImage: `linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(55, 100, 80, 0.25) 100%), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(76, 175, 80, 0.02) 2px, rgba(76, 175, 80, 0.02) 4px)`,
            border: '1px solid',
            borderColor: 'rgba(76, 175, 80, 0.2)',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 6,
              alignItems: 'center',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <RocketLaunch sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                <Typography variant="h3" fontWeight={700}>
                  Наша миссия
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary' }}>
                Мы создаём инструменты, которые помогают разработчикам и командам принимать 
                обоснованные решения о выборе Open Source зависимостей. Наша цель — сделать 
                экосистему открытого ПО более безопасной, прозрачной и предсказуемой
                для продуктовых и инженерных команд.
              </Typography>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Visibility sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                <Typography variant="h3" fontWeight={700}>
                  Наше видение
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'text.secondary' }}>
                Мы стремимся стать главным источником аналитической информации о Open Source 
                библиотеках, чтобы команды могли быстрее переходить от анализа данных
                к конкретным решениям в спринтах и релизах.
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Values */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 6,
              fontWeight: 700,
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Наши ценности
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 4,
            }}
          >
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Box key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      <Icon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {value.description}
                    </Typography>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>


        {/* What We Offer */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
              textAlign: 'center',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Что мы предлагаем
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 6, textAlign: 'center', maxWidth: '700px', mx: 'auto' }}
          >
            StackScout предоставляет комплексное решение для анализа Open Source библиотек
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
            }}
          >
            {features.map((feature, index) => (
              <Box key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    p: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" gutterBottom fontWeight={600} color="primary.main">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Repository Snapshot */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            mb: 10,
            border: '1px solid',
            borderColor: 'rgba(76, 175, 80, 0.25)',
            backgroundImage: 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(26, 26, 26, 0.05) 100%)',
          }}
        >
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2, textAlign: 'center' }}>
            Репозиторий проекта
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: '820px', mx: 'auto', textAlign: 'center', lineHeight: 1.8 }}
          >
            В GitHub-репозитории доступны исходный код, релизы, документация и история развития проекта.
            Этот раздел отражает открытый и прозрачный подход к развитию StackScout.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Link
              href="https://github.com/Zero-Logic-Education/StackScout.git"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Button
                variant="outlined"
                startIcon={<GitHub />}
                sx={{ px: 3.5, py: 1.2, fontWeight: 700, borderWidth: 1.5 }}
              >
                Открыть GitHub
              </Button>
            </Link>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

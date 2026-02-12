"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

// Динамическая загрузка компонента авторизации только на клиенте.
// Это предотвращает ошибки гидратации (HTML mismatch) и убирает
// необходимость использования useEffect с setState, на что жаловался линтер.
const AuthSection = dynamic(() => import("./AuthSection"), {
  ssr: false,
  loading: () => <Box sx={{ width: 100, height: 36 }} />, // Placeholder, чтобы не прыгало
});

export default function Navbar() {
  const pathname = usePathname();
  const theme = useTheme();

  const links = [
    { href: "/", label: "Главная", icon: <HomeIcon fontSize="small" /> },
    {
      href: "/explore",
      label: "Исследовать",
      icon: <SearchIcon fontSize="small" />,
    },
    {
      href: "/dashboard",
      label: "Аналитика",
      icon: <DashboardIcon fontSize="small" />,
    },
    { href: "/about", label: "О нас", icon: <InfoIcon fontSize="small" /> },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: alpha(theme.palette.background.default, 0.8),
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: 1100,
        transition: "all 0.3s ease",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: { xs: 64, md: 80 },
          px: { xs: 2, md: 4, lg: 6 },
        }}
        disableGutters
      >
        {/* 1. Логотип (Слева) */}
        <Box sx={{ display: "flex", alignItems: "center", width: { md: 280 } }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: "var(--font-outfit), sans-serif",
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.5rem", md: "1.75rem" },
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              StackScout
            </Typography>
          </Link>
        </Box>

        {/* 2. Навигация (Центр) - скрыта на мобильных */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 1,
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{ textDecoration: "none" }}
              >
                <Button
                  startIcon={link.icon}
                  disableRipple
                  sx={{
                    color: isActive ? "primary.main" : "text.secondary",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.95rem",
                    textTransform: "none",
                    px: 2.5,
                    py: 1,
                    borderRadius: 3,
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      color: "primary.main",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </Box>

        {/* 3. Авторизация / Профиль (Справа) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            width: { md: 280 }, // Фиксированная ширина для баланса
            gap: 2,
          }}
        >
          <AuthSection />

          {/* Mobile Menu Icon (Placeholder for now) */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton color="inherit">
              <MenuIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

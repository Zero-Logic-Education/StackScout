"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Stack,
} from "@mui/material";
import {
  Search,
  Dashboard,
  Home,
  Info,
  Login,
  PersonAdd,
  Logout,
  Person,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    router.push("/");
  };

  const links = [
    { href: "/", label: "Главная", icon: <Home /> },
    { href: "/explore", label: "Исследовать", icon: <Search /> },
    { href: "/dashboard", label: "Аналитика", icon: <Dashboard /> },
    { href: "/about", label: "О нас", icon: <Info /> },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: 1100,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={4}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  fontFamily: "var(--font-outfit)",
                  letterSpacing: "-0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                StackScout
              </Typography>
            </Link>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
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
                      variant={isActive ? "contained" : "text"}
                      size="small"
                      sx={{
                        color: isActive ? "white" : "text.primary",
                        borderRadius: 2,
                        px: 2,
                        "&:hover": {
                          bgcolor: isActive ? "primary.dark" : "action.hover",
                        },
                      }}
                    >
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </Box>
          </Stack>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isClient && isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleMenu}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  <Avatar
                    src={user?.avatar}
                    alt={user?.name}
                    sx={{
                      width: 32,
                      height: 32,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {user?.name?.[0]}
                  </Avatar>
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      overflow: "visible",
                      filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                      mt: 1.5,
                      minWidth: 180,
                      border: "1px solid",
                      borderColor: "divider",
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: "background.paper",
                        transform: "translateY(-50%) rotate(45deg)",
                        zIndex: 0,
                        borderTop: "1px solid",
                        borderLeft: "1px solid",
                        borderColor: "divider",
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" noWrap fontWeight={600}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleClose}>
                    <Person
                      fontSize="small"
                      sx={{ mr: 1.5, color: "text.secondary" }}
                    />{" "}
                    Профиль
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Logout
                      fontSize="small"
                      sx={{ mr: 1.5, color: "error.main" }}
                    />
                    <Typography color="error.main" variant="body2">
                      Выйти
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Stack direction="row" spacing={1}>
                <Link href="/login" style={{ textDecoration: "none" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Login />}
                    sx={{ borderRadius: 2 }}
                  >
                    Войти
                  </Button>
                </Link>
                <Link href="/register" style={{ textDecoration: "none" }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PersonAdd />}
                    sx={{ borderRadius: 2 }}
                  >
                    Регистрация
                  </Button>
                </Link>
              </Stack>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

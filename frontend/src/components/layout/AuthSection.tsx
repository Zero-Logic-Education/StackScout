"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Update as UpdateIcon,
  Subscriptions as SubscriptionsIcon,
} from "@mui/icons-material";
import { useAuthStore } from "@/lib/auth";
import { useUpdateStats } from "@/lib/hooks";

export default function AuthSection() {
  const router = useRouter();
  const theme = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const { stats, fetchStats } = useUpdateStats();

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

  useEffect(() => {
    if (!isAuthenticated) {
      setHasNewUpdates(false);
      return;
    }

    fetchStats();
    const intervalId = window.setInterval(() => {
      fetchStats();
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchStats, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const recentUpdates = stats?.recentUpdates || [];
    if (recentUpdates.length === 0) {
      setHasNewUpdates(false);
      return;
    }

    const latestUpdate = new Date(recentUpdates[0].updateDate).getTime();
    if (!Number.isFinite(latestUpdate)) {
      setHasNewUpdates(false);
      return;
    }

    let lastSeen = 0;
    try {
      const stored = localStorage.getItem("updates-last-seen");
      if (stored) {
        lastSeen = new Date(stored).getTime();
      }
    } catch (err) {
      lastSeen = 0;
    }

    setHasNewUpdates(latestUpdate > lastSeen);
  }, [stats, isAuthenticated]);

  if (isAuthenticated) {
    return (
      <>
        {/* User Avatar & Menu */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            {user?.name}
          </Typography>
          <IconButton
            onClick={handleMenu}
            size="small"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            sx={{
              p: 0.5,
              border: "2px solid",
              borderColor: anchorEl ? "primary.main" : "transparent",
              transition: "all 0.2s",
            }}
          >
            <Badge
              color="error"
              variant="dot"
              overlap="circular"
              invisible={!hasNewUpdates}
            >
              <Avatar
                src={user?.avatar}
                alt={user?.name}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "primary.main",
                  fontSize: "1rem",
                  fontWeight: 700,
                }}
              >
                {user?.name?.[0]}
              </Avatar>
            </Badge>
          </IconButton>
        </Box>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          keepMounted
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.15))",
              mt: 2,
              minWidth: 220,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="subtitle2" noWrap fontWeight={700}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={handleClose}
            sx={{ py: 1.5, px: 2.5, borderRadius: 1, mx: 1 }}
          >
            <PersonIcon
              fontSize="small"
              sx={{ mr: 2, color: "text.secondary" }}
            />
            Профиль
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={handleClose}
            component={Link}
            href="/subscriptions"
            sx={{ py: 1.5, px: 2.5, borderRadius: 1, mx: 1 }}
          >
            <SubscriptionsIcon
              fontSize="small"
              sx={{ mr: 2, color: "text.secondary" }}
            />
            Подписки
          </MenuItem>
          <MenuItem
            onClick={handleClose}
            component={Link}
            href="/updates"
            sx={{ py: 1.5, px: 2.5, borderRadius: 1, mx: 1 }}
          >
            <Badge
              color="error"
              variant="dot"
              overlap="circular"
              invisible={!hasNewUpdates}
              sx={{ mr: 2 }}
            >
              <UpdateIcon fontSize="small" sx={{ color: "text.secondary" }} />
            </Badge>
            Обновления
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{ py: 1.5, px: 2.5, borderRadius: 1, mx: 1 }}
          >
            <LogoutIcon fontSize="small" sx={{ mr: 2, color: "error.main" }} />
            <Typography color="error.main" variant="body2" fontWeight={600}>
              Выйти
            </Typography>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Link href="/login" style={{ textDecoration: "none" }}>
        <Button
          variant="text"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            textTransform: "none",
            fontSize: "0.95rem",
            "&:hover": { color: "primary.main", bgcolor: "transparent" },
          }}
        >
          Войти
        </Button>
      </Link>
      <Link href="/register" style={{ textDecoration: "none" }}>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon fontSize="small" />}
          sx={{
            borderRadius: "50px", // Pill shape
            fontWeight: 600,
            textTransform: "none",
            px: 3,
            py: 0.8,
            fontSize: "0.9rem",
            borderWidth: "1.5px",
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.2)"
                : "rgba(0,0,0,0.1)",
            color: "text.primary",
            "&:hover": {
              bgcolor: "primary.main",
              color: "#fff",
              borderColor: "primary.main",
              borderWidth: "1.5px",
            },
          }}
        >
          Регистрация
        </Button>
      </Link>
    </Stack>
  );
}

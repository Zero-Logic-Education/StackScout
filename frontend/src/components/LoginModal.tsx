"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import { Person as PersonIcon, Lock as LockIcon } from "@mui/icons-material";
import { useAuthStore } from "@/lib/auth";
import Link from "next/link";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function LoginModal({
  open,
  onClose,
  title = "Требуется вход в аккаунт",
  message = "Для просмотра подробной информации о библиотеке необходимо авторизироваться",
}: LoginModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      setUsername("");
      setPassword("");
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Неверное имя пользователя или пароль";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: "1.25rem",
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {message}
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Имя пользователя"
            variant="outlined"
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            placeholder="admin"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ fontSize: 20, color: "primary.main" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Пароль"
            type="password"
            variant="outlined"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ fontSize: 20, color: "primary.main" }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Впервые здесь?{" "}
              <MuiLink
                component={Link}
                href="/register"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Создать аккаунт
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !username || !password}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            minWidth: 100,
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ mr: 1 }} />
          ) : (
            "Войти"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

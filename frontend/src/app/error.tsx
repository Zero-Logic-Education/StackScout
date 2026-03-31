"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Box, Button, Container, Typography } from "@mui/material";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Что-то пошло не так
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
          Возникла непредвиденная ошибка. Попробуйте обновить данные или вернуться на главную.
        </Typography>
        <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
          <Button variant="contained" onClick={reset}>
            Повторить
          </Button>
          <Button component={Link} href="/" variant="outlined">
            На главную
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

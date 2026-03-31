import { Box, Button, Container, Typography } from "@mui/material";

export default function NotFound() {
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
        <Typography variant="h2" fontWeight={800}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          Страница не найдена
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 540 }}>
          Возможно, ссылка устарела или страница была перемещена.
        </Typography>
        <Button href="/" variant="contained" sx={{ mt: 1 }}>
          На главную
        </Button>
      </Box>
    </Container>
  );
}

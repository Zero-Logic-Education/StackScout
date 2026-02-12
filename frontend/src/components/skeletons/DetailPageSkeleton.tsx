import { Box, Skeleton, Container, Stack } from "@mui/material";

/**
 * Skeleton для страницы детальной информации о библиотеке
 * Используется на странице /library/[id] во время загрузки
 */
export default function DetailPageSkeleton() {
  return (
    <Box sx={{ minHeight: "100vh", pb: 8 }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={2}>
            {/* Breadcrumbs */}
            <Skeleton variant="text" width={200} height={24} />

            {/* Title */}
            <Skeleton variant="text" width="60%" height={48} />

            {/* Meta info */}
            <Stack direction="row" spacing={2}>
              <Skeleton
                variant="rectangular"
                width={80}
                height={28}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width={60}
                height={28}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width={100}
                height={28}
                sx={{ borderRadius: 1 }}
              />
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
          }}
        >
          {/* Main content */}
          <Stack spacing={3}>
            {/* Health Metrics Card */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 3 }}>
              <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Skeleton
                  variant="rectangular"
                  height={80}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={80}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={80}
                  sx={{ borderRadius: 1 }}
                />
              </Stack>
            </Box>

            {/* Description Card */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 3 }}>
              <Skeleton variant="text" width={150} height={32} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
            </Box>
          </Stack>

          {/* Sidebar */}
          <Stack spacing={3}>
            {/* Info Card */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 3 }}>
              <Skeleton variant="text" width={120} height={28} sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
              </Stack>
            </Box>

            {/* Actions Card */}
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, p: 3 }}>
              <Stack spacing={2}>
                <Skeleton
                  variant="rectangular"
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={40}
                  sx={{ borderRadius: 1 }}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

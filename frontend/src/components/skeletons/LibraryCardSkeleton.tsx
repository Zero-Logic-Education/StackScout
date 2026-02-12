import { Card, CardContent, Box, Skeleton, Stack } from "@mui/material";

/**
 * Skeleton для карточки библиотеки
 * Используется на странице Explore во время загрузки данных
 */
export default function LibraryCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header с badge и health score */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            width={60}
            height={24}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={50}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </Box>

        {/* Title */}
        <Skeleton variant="text" width="70%" height={32} sx={{ mb: 1 }} />

        {/* Version */}
        <Skeleton variant="text" width="30%" height={20} sx={{ mb: 2 }} />

        {/* Description - 3 строки */}
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="60%" />
        </Box>

        {/* Metrics */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={60} />
        </Stack>

        {/* Footer button */}
        <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={36}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

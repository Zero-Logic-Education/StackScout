"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import OverviewDashboard from "@/components/dashboard/OverviewDashboard";
import LibraryDetailView from "@/components/dashboard/LibraryDetailView";

function DashboardContent() {
  const searchParams = useSearchParams();
  const libraryId = searchParams.get("libraryId");

  if (libraryId) {
    return <LibraryDetailView libraryId={libraryId} />;
  }

  return <OverviewDashboard />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              background:
                "linear-gradient(135deg, rgba(76, 175, 80, 0.35) 0%, rgba(56, 142, 60, 0.15) 100%)",
              pt: { xs: 16, md: 20 },
              pb: { xs: 8, md: 12 },
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }} color="text.secondary">
              Загрузка дашборда...
            </Typography>
          </Box>
        </Box>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

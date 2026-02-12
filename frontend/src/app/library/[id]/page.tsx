"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Box } from "@mui/material";

interface LibraryPageProps {
  params: Promise<{ id: string }>;
}

export default function LibraryPage({ params }: LibraryPageProps) {
  const router = useRouter();

  useEffect(() => {
    params.then((resolvedParams) => {
      router.replace(`/dashboard?libraryId=${resolvedParams.id}`);
    });
  }, [params, router]);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}

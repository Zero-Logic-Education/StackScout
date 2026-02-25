"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Link as MuiLink,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Update as UpdateIcon,
  NewReleases as NewReleasesIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";
import { LibraryUpdate, UpdateType } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface LibraryUpdateCardProps {
  update: LibraryUpdate;
}

// Функция для получения цвета и иконки в зависимости от типа обновления
const getUpdateTypeConfig = (updateType: UpdateType) => {
  switch (updateType) {
    case "MAJOR":
      return {
        color: "#e53e3e" as const,
        label: "Мажорное",
        icon: <NewReleasesIcon />,
        description: "Breaking changes",
      };
    case "MINOR":
      return {
        color: "#dd6b20" as const,
        label: "Минорное",
        icon: <UpdateIcon />,
        description: "Новые возможности",
      };
    case "PATCH":
      return {
        color: "#38a169" as const,
        label: "Патч",
        icon: <BugReportIcon />,
        description: "Исправления",
      };
  }
};

/**
 * Карточка обновления библиотеки
 */
export default function LibraryUpdateCard({ update }: LibraryUpdateCardProps) {
  const updateConfig = getUpdateTypeConfig(update.updateType);
  const updateDate = new Date(update.updateDate);

  const healthScoreChange =
    update.newHealthScore && update.oldHealthScore
      ? update.newHealthScore - update.oldHealthScore
      : null;

  return (
    <Card
      sx={{
        mb: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Link
              href={`/library/${update.libraryId}`}
              passHref
              style={{ textDecoration: "none" }}
            >
              <Typography
                variant="h6"
                component="span"
                sx={{
                  color: "primary.main",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {update.libraryName}
              </Typography>
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {update.librarySource.toUpperCase()}
            </Typography>
          </Box>

          <Chip
            icon={updateConfig.icon}
            label={updateConfig.label}
            size="small"
            sx={{
              backgroundColor: updateConfig.color,
              color: "#fff",
              fontWeight: 600,
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="body1" sx={{ fontFamily: "monospace" }}>
            <Box component="span" sx={{ color: "text.secondary" }}>
              {update.oldVersion}
            </Box>
            {" → "}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
              {update.newVersion}
            </Box>
          </Typography>

          {healthScoreChange !== null && (
            <Chip
              icon={<TrendingUpIcon />}
              label={`${healthScoreChange > 0 ? "+" : ""}${healthScoreChange}`}
              size="small"
              color={healthScoreChange > 0 ? "success" : "error"}
              variant="outlined"
            />
          )}
        </Box>

        {update.changeLog && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              p: 1.5,
              backgroundColor: "action.hover",
              borderRadius: 1,
              borderLeft: "3px solid",
              borderLeftColor: updateConfig.color,
            }}
          >
            {update.changeLog}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          Обновлено{" "}
          {format(updateDate, "d MMMM yyyy, HH:mm", { locale: ru })}
        </Typography>
      </CardContent>
    </Card>
  );
}

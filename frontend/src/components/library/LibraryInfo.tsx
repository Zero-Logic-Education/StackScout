import { Box, Typography, Chip, Stack, Paper, Divider } from "@mui/material";
import {
  CalendarToday,
  Code,
  Security,
  Download,
  GitHub,
  Person,
  Inventory2,
  Cloud,
  LibraryBooks,
} from "@mui/icons-material";
import type { LibraryDetail } from "@/lib/api";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface LibraryInfoProps {
  library: LibraryDetail;
}

/**
 * Компонент для отображения информации о библиотеке
 * Показывает метаданные: версию, лицензию, автора, дату обновления и т.д.
 */
export default function LibraryInfo({ library }: LibraryInfoProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Неизвестно";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: ru });
    } catch {
      return dateString;
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return "-";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "pypi":
        return <Code sx={{ fontSize: 18 }} />;
      case "npm":
        return <Inventory2 sx={{ fontSize: 18 }} />;
      case "maven":
        return <Code sx={{ fontSize: 18 }} />;
      case "docker_hub":
        return <Cloud sx={{ fontSize: 18 }} />;
      default:
        return <LibraryBooks sx={{ fontSize: 18 }} />;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
        position: "sticky",
        top: 24,
      }}
    >
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Информация
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2.5}>
        {/* Источник */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mb: 0.5 }}
          >
            Источник
          </Typography>
          <Chip
            label={library.source}
            icon={getSourceIcon(library.source)}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
              "& .MuiChip-label": {
                px: 1,
              },
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        </Box>

        {/* Версия */}
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Code sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Версия
            </Typography>
          </Stack>
          <Typography variant="body1" fontWeight={600}>
            {library.version}
          </Typography>
        </Box>

        {/* Лицензия */}
        {library.license && (
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Security sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Лицензия
              </Typography>
            </Stack>
            <Typography variant="body1" fontWeight={600}>
              {library.license}
            </Typography>
          </Box>
        )}

        {/* Последнее обновление */}
        {library.lastUpdate && (
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Последнее обновление
              </Typography>
            </Stack>
            <Typography variant="body1" fontWeight={600}>
              {formatDate(library.lastUpdate)}
            </Typography>
          </Box>
        )}

        {/* Скачивания */}
        {library.downloads && (
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Download sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Скачиваний
              </Typography>
            </Stack>
            <Typography variant="body1" fontWeight={600}>
              {formatNumber(library.downloads)}
            </Typography>
          </Box>
        )}

        {/* Авторы */}
        {library.authors && library.authors.length > 0 && (
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Person sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Авторы
              </Typography>
            </Stack>
            <Typography variant="body2">
              {library.authors.slice(0, 3).join(", ")}
              {library.authors.length > 3 &&
                ` и ещё ${library.authors.length - 3}`}
            </Typography>
          </Box>
        )}

        {/* Ссылка на репозиторий */}
        {library.repositoryUrl && (
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <GitHub sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Репозиторий
              </Typography>
            </Stack>
            <Typography
              component="a"
              href={library.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": {
                  textDecoration: "underline",
                },
                wordBreak: "break-all",
              }}
            >
              {library.repositoryUrl.replace(/^https?:\/\//, "")}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

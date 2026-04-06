'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CircularProgress,
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Search as SearchIcon,
  Delete,
  Refresh,
  Archive as ArchiveIcon,
  Edit,
} from '@mui/icons-material';
import { useAdminProtection } from '@/lib/useAdminProtection';
import { adminApi } from '@/lib/api';

interface Library {
  id: number;
  name: string;
  version: string;
  source: string;
  license: string;
  healthScore: number;
  moderationStatus: 'PENDING' | 'VERIFIED' | 'NEEDS_REVIEW' | 'ARCHIVED';
  lastRelease: string;
  description: string;
  updatedAt: string;
}

export default function AdminLibrariesPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAdminAuthenticated } = useAdminProtection();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [moderationDialogOpen, setModerationDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('VERIFIED');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    try {
      const response = await adminApi.getLibraries(50);
      setLibraries(response.data.content || []);
    } catch (error) {
      console.error('Failed to load libraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту библиотеку?')) return;
    
    try {
      await adminApi.deleteLibrary(id);
      loadLibraries();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleUpdateModeration = async () => {
    if (!selectedLibrary) return;
    
    try {
      await adminApi.updateLibraryModeration(selectedLibrary.id, newStatus, notes);
      setModerationDialogOpen(false);
      setSelectedLibrary(null);
      setNewStatus('VERIFIED');
      setNotes('');
      loadLibraries();
    } catch (error) {
      console.error('Failed to update moderation status:', error);
    }
  };

  const handleRecalculateHealth = async (id: number) => {
    try {
      await adminApi.recalculateLibraryHealth(id);
      loadLibraries();
    } catch (error) {
      console.error('Failed to recalculate health:', error);
    }
  };

  const getModerationBadge = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'NEEDS_REVIEW':
        return 'error';
      case 'ARCHIVED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  const filteredLibraries = libraries.filter(lib => {
    const matchesSearch = lib.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lib.moderationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading || !isAdminAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 10, md: 12 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Stack spacing={4} sx={{ mb: 6 }}>
          <Box>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/admin')}>
              Назад
            </Button>
          </Box>
          <Box>
            <Typography variant="h3" component="h1" sx={{
              fontWeight: 800,
              mb: 1,
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Управление библиотеками
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Модерация и редактирование библиотек
            </Typography>
          </Box>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 6 }}>
          <TextField
            fullWidth
            placeholder="Поиск библиотек..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <TextField
            select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            SelectProps={{
              native: true,
            }}
            sx={{
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            <option value="all">Все статусы</option>
            <option value="PENDING">Ожидает проверки</option>
            <option value="VERIFIED">Проверено</option>
            <option value="NEEDS_REVIEW">Требует уточнения</option>
            <option value="ARCHIVED">Архив</option>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadLibraries}
            sx={{ borderRadius: 2 }}
          >
            Обновить
          </Button>
        </Stack>

        {/* Table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'auto',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Библиотека</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Версия</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Источник</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Health Score</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Лицензия</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Статус</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLibraries.map((library) => (
                <TableRow
                  key={library.id}
                  sx={{
                    transition: 'none',
                    '&:hover, &:hover > *': {
                      backgroundColor: 'transparent !important',
                    },
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {library.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {library.description?.substring(0, 50)}...
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{library.version}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={library.source} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: getHealthScoreColor(library.healthScore) }}>
                      {library.healthScore}/100
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{library.license || 'N/A'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={library.moderationStatus}
                      color={getModerationBadge(library.moderationStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => {
                          setSelectedLibrary(library);
                          setNewStatus(library.moderationStatus);
                          setModerationDialogOpen(true);
                        }}
                      >
                        Статус
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleRecalculateHealth(library.id)}
                      >
                        Пересчёт
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(library.id)}
                      >
                        Удалить
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Empty State */}
        {filteredLibraries.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ArchiveIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2, mx: 'auto' }} />
            <Typography color="text.secondary">Нет библиотек по заданным критериям</Typography>
          </Box>
        )}

        {/* Moderation Status Dialog */}
        <Dialog open={moderationDialogOpen} onClose={() => {
          setModerationDialogOpen(false);
          setSelectedLibrary(null);
          setNewStatus('VERIFIED');
          setNotes('');
        }} maxWidth="sm" fullWidth>
          <DialogTitle>Изменить статус модерации</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Библиотека: <strong>{selectedLibrary?.name}</strong>
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Статус</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Статус"
              >
                <MenuItem value="PENDING">Ожидает проверки</MenuItem>
                <MenuItem value="VERIFIED">Проверено</MenuItem>
                <MenuItem value="NEEDS_REVIEW">Требует уточнения</MenuItem>
                <MenuItem value="ARCHIVED">Архив</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Примечание (опционально)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setModerationDialogOpen(false);
              setSelectedLibrary(null);
              setNewStatus('VERIFIED');
              setNotes('');
            }}>Отмена</Button>
            <Button 
              onClick={handleUpdateModeration} 
              variant="contained"
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CircularProgress,
  Box,
  Container,
  Typography,
  Card,
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
  alpha,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  Search as SearchIcon,
  Delete,
  Refresh,
  People as PeopleIcon,
  Edit,
} from '@mui/icons-material';
import { useAdminProtection } from '@/lib/useAdminProtection';
import { adminApi, type AdminUserDto } from '@/lib/api';

export default function AdminUsersPage() {
  const router = useRouter();
  const theme = useTheme();
  const { isAdminAuthenticated } = useAdminProtection();
  const [users, setUsers] = useState<AdminUserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserDto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await adminApi.getUsers(0, 50);
      const data = response.data as unknown as { content: AdminUserDto[] };
      setUsers(data.content || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user: AdminUserDto) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Удалить этого пользователя? Это действие нельзя отменить!')) return;
    
    try {
      await adminApi.deleteUser(userId);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    try {
      await adminApi.resetUserPassword(selectedUser.id, newPassword);
      setEditDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Управление пользователями
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Редактирование и управление учётными записями
            </Typography>
          </Box>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 6 }}>
          <TextField
            fullWidth
            placeholder="Поиск пользователей..."
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
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadUsers}
            sx={{ borderRadius: 2 }}
          >
            Обновить
          </Button>
        </Stack>

        {/* Table */}
        <TableContainer
          component={Card}
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
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Имя пользователя</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Роль</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Дата создания</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} sx={{
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Активен' : 'Неактивен'}
                      color={user.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => {
                          setSelectedUser(user);
                          setEditDialogOpen(true);
                        }}
                      >
                        Пароль
                      </Button>
                      <Button
                        size="small"
                        variant={user.isActive ? 'outlined' : 'contained'}
                        color={user.isActive ? 'warning' : 'success'}
                        onClick={() => handleStatusToggle(user)}
                      >
                        {user.isActive ? 'Отвлючить' : 'Включить'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteUser(user.id)}
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
        {filteredUsers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PeopleIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2, mx: 'auto' }} />
            <Typography color="text.secondary">Пользователи не найдены</Typography>
          </Box>
        )}

        {/* Password Reset Dialog */}
        <Dialog open={editDialogOpen} onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
          setNewPassword('');
        }} maxWidth="sm" fullWidth>
          <DialogTitle>Изменить пароль пользователя</DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Пользователь: <strong>{selectedUser?.username}</strong>
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setEditDialogOpen(false);
              setSelectedUser(null);
              setNewPassword('');
            }}>Отмена</Button>
            <Button 
              onClick={handleResetPassword} 
              variant="contained"
              disabled={!newPassword}
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

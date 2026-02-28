import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './auth';

/**
 * Хук для защиты администраторских страниц
 * Перенаправляет на /admin/login если пользователь не администратор
 */
export const useAdminProtection = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const isAdmin = useAuthStore((state) => state.isAdmin);

  useEffect(() => {
    // Если пользователь не аутентифицирован, перенаправляем на админ логин
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Если пользователь аутентифицирован, но не является админом, перенаправляем на админ логин
    if (!isAdmin()) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isAdmin, router]);

  return {
    isAdminAuthenticated: isAuthenticated && isAdmin(),
  };
};

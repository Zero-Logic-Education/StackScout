'use client';

import { useState } from 'react';
import {
  Trash2,
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function AdminMaintenancePage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleClearCache = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/maintenance/clear-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Кэш успешно очищен. Очищено кэшей: ${data.clearedCaches}` });
      } else {
        setMessage({ type: 'error', text: 'Не удалось очистить кэш' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при очистке кэша' });
    } finally {
      setLoading(false);
    }
  };

  const handleNormalizeLicenses = async () => {
    if (!confirm('Запустить нормализацию всех лицензий?')) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/libraries/bulk-normalize-licenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Нормализация лицензий запущена' });
      } else {
        setMessage({ type: 'error', text: 'Не удалось запустить нормализацию' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при нормализации лицензий' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (!confirm('Удалить дубликаты библиотек? Это действие нельзя отменить!')) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/libraries/remove-duplicates', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Дубликаты успешно удалены' });
      } else {
        setMessage({ type: 'error', text: 'Не удалось удалить дубликаты' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при удалении дубликатов' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Регламентные работы
        </h1>
        <p className="text-slate-400">
          Обслуживание и оптимизация системы
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-green-950/30 border-green-800 text-green-400'
            : 'bg-red-950/30 border-red-800 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p>{message.text}</p>
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clear Cache */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-950/50 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Очистка кэша Redis
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Очищает все кэши в Redis. Используйте, если возникли проблемы с устаревшими данными.
              </p>
              <button
                onClick={handleClearCache}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Очистка...' : 'Очистить кэш'}
              </button>
            </div>
          </div>
        </div>

        {/* Normalize Licenses */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-950/50 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Нормализация лицензий
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Массовое обновление и нормализация названий лицензий во всех библиотеках.
              </p>
              <button
                onClick={handleNormalizeLicenses}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Обработка...' : 'Нормализовать лицензии'}
              </button>
            </div>
          </div>
        </div>

        {/* Remove Duplicates */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-950/50 rounded-lg">
              <Database className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Удаление дубликатов
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Удаляет дублирующиеся записи библиотек из базы данных.
              </p>
              <button
                onClick={handleRemoveDuplicates}
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Удаление...' : 'Удалить дубликаты'}
              </button>
            </div>
          </div>
        </div>

        {/* Database Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-950/50 rounded-lg">
              <Database className="w-6 h-6 text-[#6DB33F]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                Статистика базы данных
              </h3>
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Библиотек:</span>
                  <span className="text-white font-medium">1,234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Пользователей:</span>
                  <span className="text-white font-medium">56</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Размер БД:</span>
                  <span className="text-white font-medium">245 МБ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-8 bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-semibold mb-2">
              Внимание!
            </h4>
            <p className="text-sm text-yellow-400/80">
              Регламентные работы могут повлиять на производительность системы. 
              Рекомендуется выполнять их в периоды низкой нагрузки.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

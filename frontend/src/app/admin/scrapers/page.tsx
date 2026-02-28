'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ScraperTask {
  id: number;
  scraperName: string;
  displayName: string;
  source: string;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR' | 'COMPLETED';
  enabled: boolean;
  progress: number;
  processedCount: number;
  totalCount: number;
  errorCount: number;
  lastRunAt?: string;
  nextRunAt?: string;
  lastError?: string;
}

export default function ScrapersMonitorPage() {
  const [scrapers, setScrapers] = useState<ScraperTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScrapers();
    // Обновление каждые 5 секунд
    const interval = setInterval(loadScrapers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadScrapers = async () => {
    try {
      const response = await fetch('/api/admin/scrapers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setScrapers(data);
      }
    } catch (error) {
      console.error('Failed to load scrapers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (scraperName: string) => {
    try {
      await fetch(`/api/admin/scrapers/${scraperName}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      loadScrapers();
    } catch (error) {
      console.error('Failed to start scraper:', error);
    }
  };

  const handlePause = async (scraperName: string) => {
    try {
      await fetch(`/api/admin/scrapers/${scraperName}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      loadScrapers();
    } catch (error) {
      console.error('Failed to pause scraper:', error);
    }
  };

  const handleRestart = async (scraperName: string) => {
    try {
      await fetch(`/api/admin/scrapers/${scraperName}/restart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      loadScrapers();
    } catch (error) {
      console.error('Failed to restart scraper:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'text-green-400 bg-green-950/50 border-green-800';
      case 'PAUSED': return 'text-yellow-400 bg-yellow-950/50 border-yellow-800';
      case 'ERROR': return 'text-red-400 bg-red-950/50 border-red-800';
      case 'COMPLETED': return 'text-blue-400 bg-blue-950/50 border-blue-800';
      default: return 'text-slate-400 bg-slate-900/50 border-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING': return <Activity className="w-4 h-4" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Мониторинг скрейперов
        </h1>
        <p className="text-slate-400">
          Управление и мониторинг задач парсинга данных
        </p>
      </div>

      {/* Scrapers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scrapers.map((scraper) => (
          <div
            key={scraper.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {scraper.displayName}
                </h3>
                <p className="text-sm text-slate-400">
                  Источник: {scraper.source.toUpperCase()}
                </p>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(scraper.status)}`}>
                {getStatusIcon(scraper.status)}
                {scraper.status}
              </div>
            </div>

            {/* Progress Bar */}
            {scraper.status === 'RUNNING' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Прогресс</span>
                  <span className="text-white font-medium">{scraper.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={['h-full', 'transition-all', 'duration-500'].join(' ')}
                    style={{
                      width: `${scraper.progress}%`,
                      background: 'linear-gradient(to right, #6DB33F, rgb(52 211 153))',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Обработано</p>
                <p className="text-lg font-bold text-white">
                  {scraper.processedCount?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Всего</p>
                <p className="text-lg font-bold text-white">
                  {scraper.totalCount?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Ошибки</p>
                <p className={`text-lg font-bold ${scraper.errorCount > 0 ? 'text-red-400' : 'text-white'}`}>
                  {scraper.errorCount || 0}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {scraper.lastError && (
              <div className="mb-4 p-3 bg-red-950/30 border border-red-800/50 rounded-lg">
                <p className="text-xs text-red-400 font-mono">
                  {scraper.lastError}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStart(scraper.scraperName)}
                disabled={scraper.status === 'RUNNING'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#6DB33F] hover:bg-[#5da335] disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                Запустить
              </button>
              
              <button
                onClick={() => handlePause(scraper.scraperName)}
                disabled={scraper.status !== 'RUNNING'}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                <Pause className="w-4 h-4" />
                Пауза
              </button>
              
              <button
                onClick={() => handleRestart(scraper.scraperName)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Last Run */}
            {scraper.lastRunAt && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500">
                  Последний запуск: {new Date(scraper.lastRunAt).toLocaleString('ru-RU')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {scrapers.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Нет доступных скрейперов</p>
        </div>
      )}
    </div>
  );
}

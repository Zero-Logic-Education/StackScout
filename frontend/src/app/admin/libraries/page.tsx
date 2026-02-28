'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Archive
} from 'lucide-react';

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
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadLibraries();
  }, []);

  const loadLibraries = async () => {
    try {
      const response = await fetch('/api/admin/libraries?size=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLibraries(data.content || []);
      }
    } catch (error) {
      console.error('Failed to load libraries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateHealth = async (id: number) => {
    try {
      await fetch(`/api/admin/libraries/${id}/recalculate-health`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      loadLibraries();
    } catch (error) {
      console.error('Failed to recalculate:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту библиотеку?')) return;
    
    try {
      await fetch(`/api/admin/libraries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      loadLibraries();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getModerationBadge = (status: string) => {
    const styles = {
      VERIFIED: 'bg-green-950/50 text-green-400 border-green-800',
      PENDING: 'bg-yellow-950/50 text-yellow-400 border-yellow-800',
      NEEDS_REVIEW: 'bg-orange-950/50 text-orange-400 border-orange-800',
      ARCHIVED: 'bg-slate-800/50 text-slate-400 border-slate-700',
    }[status] || 'bg-slate-800/50 text-slate-400 border-slate-700';

    const icons = {
      VERIFIED: <CheckCircle className="w-3 h-3" />,
      NEEDS_REVIEW: <AlertTriangle className="w-3 h-3" />,
      ARCHIVED: <Archive className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${styles}`}>
        {icons[status as keyof typeof icons]}
        {status}
      </span>
    );
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredLibraries = libraries.filter(lib => {
    const matchesSearch = lib.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lib.moderationStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          Управление библиотеками
        </h1>
        <p className="text-slate-400">
          Модерация и редактирование библиотек
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск библиотек..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#6DB33F]"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-[#6DB33F]"
          >
            <option value="all">Все статусы</option>
            <option value="PENDING">Ожидает проверки</option>
            <option value="VERIFIED">Проверено</option>
            <option value="NEEDS_REVIEW">Требует уточнения</option>
            <option value="ARCHIVED">Архив</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Библиотека
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Версия
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Источник
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Health Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Лицензия
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLibraries.map((library) => (
                <tr key={library.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {library.name}
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-xs">
                      {library.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {library.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-slate-800 rounded text-xs font-medium text-slate-300 uppercase">
                      {library.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getHealthScoreColor(library.healthScore)}`}>
                      {library.healthScore}/100
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {library.license || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getModerationBadge(library.moderationStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRecalculateHealth(library.id)}
                        className="p-2 text-[#6DB33F] hover:bg-slate-800 rounded transition-colors"
                        title="Пересчитать Health Score"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-blue-400 hover:bg-slate-800 rounded transition-colors"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(library.id)}
                        className="p-2 text-red-400 hover:bg-slate-800 rounded transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredLibraries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">Библиотеки не найдены</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
        <div>
          Показано {filteredLibraries.length} из {libraries.length} библиотек
        </div>
      </div>
    </div>
  );
}

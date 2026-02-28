'use client';

import Link from 'next/link';
import {
  Activity,
  Database,
  Users,
  Settings,
  Wrench,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Административная панель
        </h1>
        <p className="text-slate-400">
          Управление платформой StackScout
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Scrapers Monitor */}
        <Link
          href="/admin/scrapers"
          className="group bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-[#6DB33F] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-950/50 rounded-lg">
              <Activity className="w-6 h-6 text-[#6DB33F]" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#6DB33F] transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Мониторинг скрейперов
          </h3>
          <p className="text-sm text-slate-400">
            Управление парсерами PyPI и Docker Hub
          </p>
        </Link>

        {/* Libraries Management */}
        <Link
          href="/admin/libraries"
          className="group bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-[#6DB33F] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-950/50 rounded-lg">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#6DB33F] transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Управление библиотеками
          </h3>
          <p className="text-sm text-slate-400">
            CRUD операции и модерация библиотек
          </p>
        </Link>

        {/* Users Management */}
        <Link
          href="/admin/users"
          className="group bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-[#6DB33F] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-950/50 rounded-lg">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#6DB33F] transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Управление пользователями
          </h3>
          <p className="text-sm text-slate-400">
            Редактирование и блокировка пользователей
          </p>
        </Link>

        {/* Maintenance */}
        <Link
          href="/admin/maintenance"
          className="group bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-[#6DB33F] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-950/50 rounded-lg">
              <Wrench className="w-6 h-6 text-orange-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#6DB33F] transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Регламентные работы
          </h3>
          <p className="text-sm text-slate-400">
            Очистка кэша, обновление лицензий
          </p>
        </Link>

        {/* System Settings */}
        <Link
          href="/admin/settings"
          className="group bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-[#6DB33F] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <Settings className="w-6 h-6 text-slate-400" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#6DB33F] transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Настройки системы
          </h3>
          <p className="text-sm text-slate-400">
            Конфигурация и параметры платформы
          </p>
        </Link>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Статус системы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">Активные скрейперы</p>
            <p className="text-2xl font-bold text-white">2</p>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">Всего библиотек</p>
            <p className="text-2xl font-bold text-white">1,234</p>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">Пользователей</p>
            <p className="text-2xl font-bold text-white">56</p>
          </div>
          <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
            <p className="text-xs text-slate-400 mb-1">Статус</p>
            <p className="text-2xl font-bold text-[#6DB33F]">Healthy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

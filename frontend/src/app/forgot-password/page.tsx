'use client';

import { useState } from 'react';
import { KeyRound, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Письмо с инструкциями отправлено на указанный email',
        });
        setStep('confirm');
      } else {
        setMessage({ type: 'error', text: 'Не удалось отправить запрос' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при отправке запроса' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Пароль успешно изменен! Теперь вы можете войти с новым паролем.',
        });
        setToken('');
        setNewPassword('');
      } else {
        setMessage({ type: 'error', text: 'Недействительный или истекший токен' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка при смене пароля' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6DB33F]/10 rounded-full mb-4">
            <KeyRound className="w-8 h-8 text-[#6DB33F]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Восстановление пароля
          </h1>
          <p className="text-slate-400">
            {step === 'request'
              ? 'Введите email для получения инструкций'
              : 'Введите токен и новый пароль'}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-950/30 border-green-800 text-green-400'
                : 'bg-red-950/30 border-red-800 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          {step === 'request' ? (
            <form onSubmit={handleRequestReset}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#6DB33F]"
                    placeholder="admin@stackscout.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#6DB33F] hover:bg-[#5da335] disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Отправка...' : 'Отправить инструкции'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleConfirmReset}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Токен восстановления
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#6DB33F] font-mono text-sm"
                  placeholder="Вставьте токен из письма"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#6DB33F]"
                  placeholder="Минимум 8 символов"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-[#6DB33F] hover:bg-[#5da335] disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Сохранение...' : 'Сменить пароль'}
              </button>
            </form>
          )}

          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setStep(step === 'request' ? 'confirm' : 'request');
                setMessage(null);
              }}
              className="text-sm text-[#6DB33F] hover:text-[#5da335] transition-colors"
            >
              {step === 'request' ? 'У меня уже есть токен' : 'Запросить новый токен'}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Если письмо не пришло, проверьте папку "Спам" или попробуйте еще раз
          </p>
        </div>
      </div>
    </div>
  );
}

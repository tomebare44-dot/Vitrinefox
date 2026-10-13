import React, { useState } from 'react';
import {
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  Loader2,
  Lock,
} from 'lucide-react';

interface AdminSecurityProps {
  authToken: string;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onRefresh: () => void;
}

export const AdminSecurity: React.FC<AdminSecurityProps> = ({
  authToken,
  showToast,
  onRefresh,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isResettingDemo, setIsResettingDemo] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentPassword) {
      setErrorMsg('Informe a senha atual.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    setIsChanging(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alterar senha.');
      }

      showToast('Senha mestra alterada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao alterar senha.');
    } finally {
      setIsChanging(false);
    }
  };

  const handleResetDemoCatalog = async () => {
    if (!window.confirm('Deseja realmente restaurar os produtos e categorias iniciais de demonstração?')) {
      return;
    }

    setIsResettingDemo(true);
    try {
      const res = await fetch('/api/admin/reset-demo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) throw new Error('Erro ao restaurar catálogo.');
      showToast('Catálogo inicial restaurado com sucesso!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsResettingDemo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Segurança e Senha do Proprietário
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Proteja o painel administrativo alterando a senha padrão inicial.
        </p>
      </div>

      {/* Password Change Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
          <Key className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-bold text-slate-900">Alterar Senha de Acesso</h3>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite a senha atual..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nova Senha (Mínimo 6 caracteres)
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha segura..."
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha..."
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChanging}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {isChanging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Salvar Nova Senha</span>
            </button>
          </div>
        </form>
      </div>

      {/* Catalog Reset Option */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <RotateCcw className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">Restaurar Catálogo de Demonstração</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Restaura os produtos e categorias de exemplo originais (fones, relógio, umidificador, organizador etc.) caso queira repor o catálogo base.
        </p>

        <button
          type="button"
          onClick={handleResetDemoCatalog}
          disabled={isResettingDemo}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {isResettingDemo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          <span>Restaurar Catálogo Base</span>
        </button>
      </div>
    </div>
  );
};

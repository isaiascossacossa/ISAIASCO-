import React, { useState } from 'react';
import { User, UserStatusType } from '../types';
import { X, Camera, Check, ShieldCheck, Key, Fingerprint, Sparkles } from 'lucide-react';

interface ProfileStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfileStatusModal: React.FC<ProfileStatusModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [statusType, setStatusType] = useState<UserStatusType>(currentUser.status.type);
  const [customText, setCustomText] = useState(currentUser.status.customText);
  const [emoji, setEmoji] = useState(currentUser.status.emoji);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [biometricEnabled, setBiometricEnabled] = useState(currentUser.biometricEnabled);

  if (!isOpen) return null;

  const statusPresets: { type: UserStatusType; label: string; emoji: string; badgeColor: string }[] = [
    { type: 'online', label: 'Disponível', emoji: '🟢', badgeColor: 'text-emerald-400' },
    { type: 'meeting', label: 'Em Reunião', emoji: '🟡', badgeColor: 'text-amber-400' },
    { type: 'field', label: 'Em Campo / Despacho', emoji: '🚗', badgeColor: 'text-cyan-400' },
    { type: 'busy', label: 'Ocupado / Foco', emoji: '🔴', badgeColor: 'text-rose-400' },
    { type: 'away', label: 'Ausente', emoji: '✈️', badgeColor: 'text-purple-400' },
    { type: 'dnd', label: 'Não Perturbe', emoji: '⛔', badgeColor: 'text-red-500' },
  ];

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateUser({
      ...currentUser,
      name,
      role,
      avatarUrl,
      biometricEnabled,
      status: {
        type: statusType,
        customText,
        emoji,
        updatedAt: 'Agora mesmo',
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-slate-100">Meu Perfil & Status Operacional</h2>
            <p className="text-xs text-slate-400">Personalize sua foto, presença interna e segurança</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="relative group shrink-0">
              <img
                src={avatarUrl}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-18 h-18 rounded-full object-cover border-2 border-cyan-500/50 shadow-md"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                title="Alterar foto de perfil"
              >
                <Camera className="w-5 h-5 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cargo / Função</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Status Preset Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Status Online Atual
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statusPresets.map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => {
                    setStatusType(preset.type);
                    setEmoji(preset.emoji);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium text-left transition-all ${
                    statusType === preset.type
                      ? 'bg-cyan-950/40 border-cyan-500 text-slate-100'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base">{preset.emoji}</span>
                  <span className="truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Status Text and Emoji */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Mensagem de Status Personalizada
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="w-12 text-center bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                placeholder="⚡"
              />
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="O que você está fazendo no momento?"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Biometric & Security Token Settings */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-5 h-5 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Autenticação Biométrica (WebAuthn / Touch ID)</h4>
                  <p className="text-[11px] text-slate-400">Permitir login por biometria rápida sem senha neste dispositivo</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricEnabled}
                  onChange={(e) => setBiometricEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-300">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                Token Exclusivo:
              </span>
              <span className="text-cyan-300 font-bold">{currentUser.securityToken}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 active:scale-95 rounded-lg shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

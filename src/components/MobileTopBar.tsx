import React, { useState } from 'react';
import { Menu, ChevronDown, ShieldCheck, Fingerprint, Plus, Lock, X, Smartphone, Wrench } from 'lucide-react';
import { Channel, User } from '../types';
import { Logo } from './Logo';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileTopBarProps {
  currentView: string;
  activeChannel: Channel;
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
  users: User[];
  currentUser: User;
  portalMode?: 'client' | 'admin';
  onSwitchPortalMode?: (mode: 'client' | 'admin') => void;
  activeIncidentsCount?: number;
  onOpenProfile: () => void;
  onOpenBiometrics: () => void;
  onOpenSecurity: () => void;
  onNewChannel: () => void;
  onOpenPhoneContacts?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  currentView,
  activeChannel,
  channels,
  selectedChannelId,
  onSelectChannel,
  users,
  currentUser,
  portalMode = 'client',
  onSwitchPortalMode,
  activeIncidentsCount = 0,
  onOpenProfile,
  onOpenBiometrics,
  onOpenSecurity,
  onNewChannel,
  onOpenPhoneContacts,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  const getTitle = () => {
    switch (currentView) {
      case 'chat':
        return `#${activeChannel.name}`;
      case 'video':
        return 'Videoconferência';
      case 'calendar':
        return 'Calendário';
      case 'field':
        return 'Radar de Campo';
      case 'reports':
        return 'Produtividade';
      default:
        return 'ISAIASCO';
    }
  };

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 h-14 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3.5 flex items-center justify-between shrink-0 select-none pt-[env(safe-area-inset-top)]">
        {/* Left: Logo & Channel Drawer Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 active:scale-95 transition-transform"
            title="Abrir canais e mensagens"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Logo size="sm" showSubtitle={false} />
        </div>

        {/* Center: Current Section / Channel Badge */}
        {currentView === 'chat' ? (
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-slate-200 max-w-[140px] truncate"
          >
            <span className="text-cyan-400 font-mono text-[11px]">#</span>
            <span className="truncate">{activeChannel.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
          </button>
        ) : (
          <span className="text-xs font-bold text-slate-200 font-sans">{getTitle()}</span>
        )}

        {/* Right: Admin Mode Toggle + Phone Contacts + PWA Install + User Avatar */}
        <div className="flex items-center gap-1.5">
          {onSwitchPortalMode && (
            <button
              type="button"
              onClick={() => onSwitchPortalMode(portalMode === 'client' ? 'admin' : 'client')}
              className={`p-1.5 rounded-lg border relative active:scale-95 transition-transform ${
                portalMode === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800'
              }`}
              title={portalMode === 'admin' ? 'Voltar ao Portal do Cliente' : 'Abrir Painel Admin (Resolver Problemas)'}
            >
              <Wrench className="w-4 h-4" />
              {activeIncidentsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-mono font-bold flex items-center justify-center">
                  {activeIncidentsCount}
                </span>
              )}
            </button>
          )}

          {onOpenPhoneContacts && (
            <button
              type="button"
              onClick={onOpenPhoneContacts}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 active:scale-95 transition-transform"
              title="Encontrar amigos através dos contatos do celular"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          <PWAInstallButton className="text-[11px] px-2 py-1" />

          <button
            type="button"
            onClick={onOpenProfile}
            className="relative"
            title="Meu perfil e status"
          >
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-cyan-500/50"
            />
            <span className="absolute -bottom-0.5 -right-0.5 text-[9px] leading-none">
              {currentUser.status.emoji}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Sheet for Channels & Contacts */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-slate-900 h-full border-r border-slate-800 flex flex-col z-10 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Switcher inside Drawer */}
            {onSwitchPortalMode && (
              <div className="p-3 border-b border-slate-800 bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onSwitchPortalMode(portalMode === 'client' ? 'admin' : 'client');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${
                    portalMode === 'admin'
                      ? 'bg-amber-950/60 border-amber-600/50 text-amber-200'
                      : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <div className="text-left">
                      <span className="block text-[11px] font-bold">
                        {portalMode === 'admin' ? 'Modo Admin Ativo' : 'Painel do Administrador'}
                      </span>
                      <span className="block text-[9px] text-slate-400 font-normal">
                        {portalMode === 'admin' ? 'Voltar para Cliente' : 'Resolver Problemas do Sistema'}
                      </span>
                    </div>
                  </div>
                  {activeIncidentsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-rose-500 text-white font-bold">
                      {activeIncidentsCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Canais Seguros</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onNewChannel();
                    }}
                    className="hover:text-cyan-400 p-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {channels.filter(c => c.type !== 'direct').map(chan => {
                  const isSelected = selectedChannelId === chan.id;
                  return (
                    <button
                      key={chan.id}
                      type="button"
                      onClick={() => {
                        onSelectChannel(chan.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-slate-800 text-cyan-300'
                          : 'text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-500 font-mono">#</span>
                        <span className="truncate">{chan.name}</span>
                      </div>
                      {chan.isPrivate && <Lock className="w-3 h-3 text-slate-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Direct Messages */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Mensagens Diretas</span>
                  {onOpenPhoneContacts && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawerOpen(false);
                        onOpenPhoneContacts();
                      }}
                      className="hover:text-cyan-400 text-slate-400"
                      title="Encontrar amigos através dos contatos do celular"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {onOpenPhoneContacts && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenPhoneContacts();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-950/40 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Contatos do Celular</span>
                    </div>
                    <span className="text-[9px] font-mono bg-cyan-900 px-1.5 py-0.5 rounded text-cyan-200">
                      Agenda
                    </span>
                  </button>
                )}

                {otherUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      const dmChan = channels.find(c => c.directUserId === u.id);
                      if (dmChan) {
                        onSelectChannel(dmChan.id);
                      }
                      setIsDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-850 transition-colors text-left"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                        u.status.type === 'online' ? 'bg-emerald-400' :
                        u.status.type === 'field' ? 'bg-cyan-400' :
                        u.status.type === 'busy' ? 'bg-rose-400' : 'bg-amber-400'
                      }`} />
                    </div>
                    <div className="truncate flex-1">
                      <span className="truncate block font-semibold">{u.name}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{u.role.split(' ')[0]}</span>
                    </div>
                    <span className="text-xs">{u.status.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenSecurity();
                }}
                className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono hover:underline"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Auditoria E2EE</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenBiometrics();
                }}
                className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 hover:text-white"
                title="Autenticação Biométrica"
              >
                <Fingerprint className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

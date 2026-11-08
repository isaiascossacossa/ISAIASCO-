import React from 'react';
import { 
  MessageSquare, Video, Calendar, Compass, BarChart3, 
  ShieldCheck, Lock, Fingerprint, Plus, Settings, 
  ChevronDown, Hash, UserCheck, Key, LogOut, Smartphone,
  Wrench, SlidersHorizontal, ShieldAlert
} from 'lucide-react';
import { Channel, User } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  currentView: 'chat' | 'video' | 'calendar' | 'field' | 'reports';
  onSelectView: (view: 'chat' | 'video' | 'calendar' | 'field' | 'reports') => void;
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
  onLogout?: () => void;
  onOpenPhoneContacts?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
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
  onLogout,
  onOpenPhoneContacts,
}) => {
  const otherUsers = users.filter(u => u.id !== currentUser.id);

  return (
    <aside className="hidden md:flex w-64 lg:w-72 bg-slate-900 border-r border-slate-800 flex-col h-full shrink-0 select-none">
      {/* Brand & Organization Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
        <Logo size="sm" />

        <div className="flex items-center gap-1">
          {onSwitchPortalMode && currentUser.roleType === 'admin' && (
            <button
              type="button"
              onClick={() => onSwitchPortalMode('admin')}
              className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
              title="Acessar Painel do Administrador (Resolver Problemas)"
            >
              <Wrench className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSecurity}
            title="Verificar Chaves de Criptografia"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Platform Mode Selector (Client vs Admin Problem Resolver) */}
      {onSwitchPortalMode && (
        <div className="p-3 pb-0 shrink-0">
          <button
            type="button"
            onClick={() => onSwitchPortalMode(portalMode === 'client' ? 'admin' : 'client')}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all group cursor-pointer ${
              portalMode === 'admin'
                ? 'bg-gradient-to-r from-amber-950/80 to-rose-950/80 border-amber-500/60 text-amber-200 shadow-md'
                : 'bg-slate-950 hover:bg-slate-800/80 border-slate-700/80 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <div className={`p-1.5 rounded-lg shrink-0 ${portalMode === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/10 text-cyan-400 group-hover:scale-105 transition-transform'}`}>
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <div className="truncate text-left">
                <span className="block truncate text-[11px] font-bold">
                  {portalMode === 'admin' ? 'Painel Admin Ativo' : 'Painel do Administrador'}
                </span>
                <span className="block truncate text-[9px] text-slate-400 font-normal">
                  {portalMode === 'admin' ? 'Alternar p/ Modo Cliente' : 'Resolver Problemas do Sistema'}
                </span>
              </div>
            </div>

            {activeIncidentsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-500 text-white shrink-0 animate-pulse" title="Incidentes técnicos pendentes">
                {activeIncidentsCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Navigation Modules */}
      <div className="p-3 border-b border-slate-800 space-y-1 shrink-0">
        <button
          type="button"
          onClick={() => onSelectView('chat')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'chat'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comunicação & Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('video')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'video'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Videoconferência em Grupo</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('calendar')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'calendar'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Calendário Corporativo</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('field')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'field'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Equipes em Campo (GPS)</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('reports')}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentView === 'reports'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Relatórios de Produtividade</span>
        </button>
      </div>

      {/* Scrollable Channels & DMs List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Channels Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Canais Seguros</span>
            <button
              type="button"
              onClick={onNewChannel}
              className="hover:text-cyan-400"
              title="Criar novo canal corporativo"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {channels.filter(c => c.type !== 'direct').map(chan => {
            const isSelected = currentView === 'chat' && selectedChannelId === chan.id;
            return (
              <button
                key={chan.id}
                type="button"
                onClick={() => {
                  onSelectView('chat');
                  onSelectChannel(chan.id);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
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

        {/* Direct Messages Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Mensagens Diretas (DMs)</span>
            {onOpenPhoneContacts && (
              <button
                type="button"
                onClick={onOpenPhoneContacts}
                className="hover:text-cyan-400 text-slate-400 flex items-center gap-1"
                title="Encontrar amigos através dos contatos do celular"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dedicated Quick Action: Encontrar amigos da agenda do celular */}
          {onOpenPhoneContacts && (
            <button
              type="button"
              onClick={onOpenPhoneContacts}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-950/60 to-blue-950/60 hover:from-cyan-900/60 hover:to-blue-900/60 border border-cyan-800/80 text-cyan-300 transition-all shadow-sm group"
            >
              <div className="flex items-center gap-2 truncate">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">Contatos do Celular</span>
              </div>
              <span className="text-[9px] font-mono font-bold bg-cyan-900/80 border border-cyan-700/60 px-1.5 py-0.5 rounded text-cyan-200 shrink-0">
                Agenda
              </span>
            </button>
          )}

          {otherUsers.map(u => {
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onSelectView('chat');
                  // Find or target direct channel for this user
                  const dmChan = channels.find(c => c.directUserId === u.id);
                  if (dmChan) {
                    onSelectChannel(dmChan.id);
                  }
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left"
              >
                <div className="relative shrink-0">
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-700"
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                    u.status.type === 'online' ? 'bg-emerald-400' :
                    u.status.type === 'field' ? 'bg-cyan-400' :
                    u.status.type === 'busy' ? 'bg-rose-400' : 'bg-amber-400'
                  }`} />
                </div>
                <div className="truncate flex-1">
                  <span className="truncate block">{u.name}</span>
                </div>
                <span className="text-[10px]">{u.status.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current User Profile Deck Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 text-left group flex-1 min-w-0"
            title="Editar meu perfil e status online"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-cyan-500/50 group-hover:border-cyan-400 transition-colors"
              />
              <span className="absolute -bottom-0.5 -right-0.5 text-[11px] leading-none">
                {currentUser.status.emoji}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate transition-colors">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                {currentUser.status.customText}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onOpenBiometrics}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
              title="Autenticação Biométrica / Trocar Perfil com Token"
            >
              <Fingerprint className="w-4 h-4 text-cyan-400" />
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Encerrar Sessão / Trocar de Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

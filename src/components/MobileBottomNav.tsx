import React from 'react';
import { MessageSquare, Video, Calendar, Compass, BarChart3 } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'chat' | 'video' | 'calendar' | 'field' | 'reports';
  onSelectView: (view: 'chat' | 'video' | 'calendar' | 'field' | 'reports') => void;
  unreadCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onSelectView,
  unreadCount = 0,
}) => {
  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare, badge: unreadCount },
    { id: 'video' as const, label: 'Vídeo', icon: Video },
    { id: 'calendar' as const, label: 'Agenda', icon: Calendar },
    { id: 'field' as const, label: 'Campo', icon: Compass },
    { id: 'reports' as const, label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 pb-[env(safe-area-inset-bottom)] select-none">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectView(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 truncate ${isActive ? 'font-bold text-cyan-400' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-cyan-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

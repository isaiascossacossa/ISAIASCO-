import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, Check, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Logo } from './Logo';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running standalone on Android or iOS home screen, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md active:scale-95 transition-all ${className}`}
        title="Instalar aplicativo no Android ou iPhone"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{isIOS ? 'Instalar no iPhone' : isAndroid ? 'Instalar no Android' : 'Instalar App'}</span>
      </button>

      {/* Mobile Installation Guide Modal for iOS & Android */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logo size="sm" showText={false} />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Instalar o ISAIASCO</h3>
                  <p className="text-[10px] text-slate-400">Funciona nativamente no Android e iPhone</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-300">
              {/* iPhone iOS Guide */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>No iPhone (Safari iOS):</span>
                </div>
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-mono text-[9px] shrink-0 mt-0.5">1</span>
                    <p>Toque no ícone de <strong className="text-slate-100">Compartilhar</strong> (<Share className="w-3 h-3 inline text-cyan-400 mx-0.5" />) na barra inferior do Safari.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-mono text-[9px] shrink-0 mt-0.5">2</span>
                    <p>Role para baixo e selecione <strong className="text-slate-100">Adicionar à Tela de Início</strong> (<PlusSquare className="w-3 h-3 inline text-cyan-400 mx-0.5" />).</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 flex items-center justify-center font-mono text-[9px] shrink-0 mt-0.5">3</span>
                    <p>Toque em <strong className="text-cyan-400">Adicionar</strong> no canto superior direito.</p>
                  </div>
                </div>
              </div>

              {/* Android Guide */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Smartphone className="w-4 h-4" />
                  <span>No Android (Chrome):</span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <p>1. Toque nos <strong className="text-slate-100">três pontinhos (⋮)</strong> no canto superior direito do Chrome.</p>
                  <p>2. Selecione <strong className="text-emerald-400">Instalar aplicativo</strong> ou <strong className="text-emerald-400">Adicionar à tela inicial</strong>.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>O app roda em tela cheia com biometria e criptografia E2EE.</span>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

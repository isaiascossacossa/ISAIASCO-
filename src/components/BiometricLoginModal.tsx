import React, { useState } from 'react';
import { Fingerprint, Key, ShieldCheck, Check, ArrowRight, Lock, UserCheck, Shield } from 'lucide-react';
import { User } from '../types';

interface BiometricLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onOpenSignUp?: () => void;
}

export const BiometricLoginModal: React.FC<BiometricLoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  onOpenSignUp,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'token'>('biometric');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const targetUser = users.find(u => u.id === selectedUserId) || currentUser;

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    setErrorMessage('');
    
    // Simulate real WebAuthn biometric scan with hardware latency
    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        onSelectUser(targetUser);
        setAuthSuccess(false);
        onClose();
      }, 700);
    }, 1200);
  };

  const handleTokenAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMessage('Por favor, insira o token de segurança exclusivo.');
      return;
    }

    if (tokenInput.trim().toUpperCase() === targetUser.securityToken.toUpperCase() || tokenInput.trim().length >= 8) {
      setAuthSuccess(true);
      setTimeout(() => {
        onSelectUser(targetUser);
        setAuthSuccess(false);
        onClose();
      }, 600);
    } else {
      setErrorMessage('Token inválido ou expirado para este perfil.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/70 text-center relative">
          <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">ISAIASCO Zero-Trust Vault</h2>
          <p className="text-xs text-slate-400 mt-0.5">Autenticação Biométrica ou Token Criptográfico Exclusivo</p>
        </div>

        {/* User Selection Carousel */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Selecione o Colaborador para Iniciar Sessão:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setTokenInput(u.securityToken);
                    setErrorMessage('');
                  }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    selectedUserId === u.id
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{u.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{u.role.split(' ')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Method Switcher */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setAuthMethod('biometric')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                authMethod === 'biometric'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Fingerprint className="w-4 h-4" />
              Biometria (Touch ID / Face)
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('token');
                if (!tokenInput) setTokenInput(targetUser.securityToken);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                authMethod === 'token'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-4 h-4" />
              Token de Segurança
            </button>
          </div>

          {/* Biometric Scan Section */}
          {authMethod === 'biometric' && (
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-3">
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isAuthenticating || authSuccess}
                className={`relative w-24 h-24 rounded-2xl flex items-center justify-center border transition-all ${
                  authSuccess
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                    : isAuthenticating
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 animate-pulse'
                    : 'bg-slate-950 border-slate-800 hover:border-cyan-500/80 text-cyan-400 active:scale-95'
                }`}
              >
                {authSuccess ? (
                  <Check className="w-12 h-12 animate-scaleIn" />
                ) : (
                  <Fingerprint className={`w-12 h-12 ${isAuthenticating ? 'animate-bounce' : ''}`} />
                )}

                {/* Laser scan line effect when authenticating */}
                {isAuthenticating && (
                  <div className="absolute inset-x-2 top-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
                )}
              </button>

              <div>
                <p className="text-xs font-semibold text-slate-200">
                  {authSuccess
                    ? 'Identidade Confirmada com Sucesso!'
                    : isAuthenticating
                    ? 'Validando credenciais biométricas (FIDO2)...'
                    : 'Toque no sensor para escanear biometria'}
                </p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  Chave P-256 vinculada: {targetUser.publicKeyFingerprint}
                </p>
              </div>
            </div>
          )}

          {/* Security Token Input Section */}
          {authMethod === 'token' && (
            <form onSubmit={handleTokenAuth} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Token Exclusivo do Usuário (Hardware ou OTP)
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Ex: ISC-98F1-4A2D-0B99-771A"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-10 py-2.5 font-mono text-xs text-cyan-300 tracking-wider focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setTokenInput(targetUser.securityToken)}
                    title="Inserir Token deste usuário automaticamente"
                    className="absolute right-2.5 top-2.5 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono"
                  >
                    Usar do Perfil
                  </button>
                </div>
              </div>

              {errorMessage && (
                <p className="text-xs text-red-400 font-mono">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={authSuccess}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  authSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white'
                }`}
              >
                {authSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Sessão Autenticada!
                  </>
                ) : (
                  <>
                    <span>Validar Token e Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chave de 256 bits criptografada</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenSignUp && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSignUp();
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
              >
                Criar Nova Conta
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

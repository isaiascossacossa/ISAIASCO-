import React, { useState } from 'react';
import { 
  Fingerprint, Key, Mail, Lock, User as UserIcon, 
  ShieldCheck, ArrowRight, Camera, Check, Sparkles, 
  Building2, Phone, Shield, AlertCircle 
} from 'lucide-react';
import { User } from '../types';
import { Logo } from './Logo';
import { PWAInstallButton } from './PWAInstallButton';
import { generateSecurityToken } from '../services/crypto';

interface AuthPortalProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  users,
  onLogin,
  onRegister,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // Sign In State
  const [signInMethod, setSignInMethod] = useState<'biometric' | 'token' | 'password'>('biometric');
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [tokenInput, setTokenInput] = useState<string>(users[0]?.securityToken || '');
  const [emailInput, setEmailInput] = useState<string>(users[0]?.email || '');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••••••');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authSuccess, setAuthSuccess] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<string>('');

  // Sign Up State
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newDepartment, setNewDepartment] = useState<string>('Operações de Campo');
  const [newRole, setNewRole] = useState<string>('Técnico Especialista de Campo');
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>('/src/assets/images/avatar_isaias_director_1794085280276.jpg');
  const [newBiometricEnabled, setNewBiometricEnabled] = useState<boolean>(true);
  const [signUpError, setSignUpError] = useState<string>('');

  const targetUser = users.find(u => u.id === selectedUserId) || users[0];

  // Handle Biometric Login
  const handleBiometricLogin = () => {
    setIsAuthenticating(true);
    setSignInError('');

    setTimeout(() => {
      setIsAuthenticating(false);
      setAuthSuccess(true);
      setTimeout(() => {
        onLogin(targetUser);
      }, 600);
    }, 1100);
  };

  // Handle Token Login
  const handleTokenLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setSignInError('Por favor, informe seu token de segurança exclusivo.');
      return;
    }

    const matchedUser = users.find(
      u => u.securityToken.toUpperCase() === tokenInput.trim().toUpperCase()
    ) || targetUser;

    setAuthSuccess(true);
    setTimeout(() => {
      onLogin(matchedUser);
    }, 600);
  };

  // Handle Password Login
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setSignInError('Informe seu e-mail corporativo.');
      return;
    }

    const matchedUser = users.find(
      u => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    ) || targetUser;

    setAuthSuccess(true);
    setTimeout(() => {
      onLogin(matchedUser);
    }, 600);
  };

  // Handle Sign Up Avatar Upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewAvatarUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      setSignUpError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const { token, expiry } = generateSecurityToken();
    const hexSlice = Math.random().toString(16).substring(2, 6).toUpperCase();

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim() || 'Colaborador Corporativo',
      department: newDepartment,
      email: newEmail.trim(),
      avatarUrl: newAvatarUrl,
      status: {
        type: 'online',
        customText: 'Disponível no sistema ISAIASCO',
        emoji: '🟢',
        updatedAt: 'Agora mesmo',
      },
      securityToken: token,
      tokenExpiry: expiry,
      biometricEnabled: newBiometricEnabled,
      publicKeyFingerprint: `ECC-${hexSlice}-P256-${Math.floor(1000 + Math.random() * 9000)}`,
      isCurrentUser: true,
      roleType: newRole.toLowerCase().includes('admin') || newRole.toLowerCase().includes('ceo') || newRole.toLowerCase().includes('chefe') ? 'admin' : 'client',
      isBlocked: false,
      location: {
        lat: -23.5505 + (Math.random() - 0.5) * 0.05,
        lng: -46.6333 + (Math.random() - 0.5) * 0.05,
        locationName: 'Base Operacional Central',
        speedKmH: 0,
        batteryLevel: 100,
        lastUpdate: 'Agora mesmo',
        isLiveSharing: true,
      },
    };

    onRegister(newUser);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Grid and Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <Logo size="md" />

        <div className="flex items-center gap-2">
          <PWAInstallButton className="text-xs" />
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setSignInError(''); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'signin'
                ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Iniciar Sessão
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setSignUpError(''); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'signup'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Criar Conta
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-xl bg-slate-900 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Card Top Brand Presentation */}
          <div className="p-6 border-b border-slate-800 bg-slate-950/70 text-center relative">
            <div className="flex justify-center mb-3">
              <Logo size="lg" showText={false} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-sans">
              {activeTab === 'signin' ? 'Iniciar Sessão no ISAIASCO' : 'Criar Nova Conta Corporativa'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === 'signin'
                ? 'Acesse a rede segura com criptografia ponta a ponta, biometria ou token exclusivo.'
                : 'Cadastre seu perfil corporativo com geração automática de par de chaves E2EE de 256 bits.'}
            </p>

            {/* Segmented Switcher */}
            <div className="mt-4 max-w-xs mx-auto flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setSignInError(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'signin'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Iniciar Sessão
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('signup'); setSignUpError(''); }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Criar Conta
              </button>
            </div>
          </div>

          {/* TAB 1: INICIAR SESSÃO */}
          {activeTab === 'signin' && (
            <div className="p-6 space-y-5">
              {/* Authentication Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSignInMethod('biometric')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    signInMethod === 'biometric'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Fingerprint className="w-5 h-5 mb-1 text-cyan-400" />
                  <span>Biometria</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignInMethod('token')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    signInMethod === 'token'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Key className="w-5 h-5 mb-1 text-cyan-400" />
                  <span>Token Físico</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignInMethod('password')}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    signInMethod === 'password'
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Lock className="w-5 h-5 mb-1 text-cyan-400" />
                  <span>Senha / E-mail</span>
                </button>
              </div>

              {/* Quick Select Profile for Demo testing */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Selecionar Usuário da Equipe:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setTokenInput(u.securityToken);
                        setEmailInput(u.email);
                        setSignInError('');
                      }}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                        selectedUserId === u.id
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{u.role.split(' ')[0]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method 1: Biometric Scan */}
              {signInMethod === 'biometric' && (
                <div className="py-4 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={isAuthenticating || authSuccess}
                    className={`relative w-20 h-20 rounded-2xl flex items-center justify-center border transition-all ${
                      authSuccess
                        ? 'bg-emerald-950/70 border-emerald-500 text-emerald-400'
                        : isAuthenticating
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 animate-pulse'
                        : 'bg-slate-900 border-slate-800 hover:border-cyan-500/80 text-cyan-400 active:scale-95 shadow-lg'
                    }`}
                  >
                    {authSuccess ? (
                      <Check className="w-10 h-10 animate-scaleIn" />
                    ) : (
                      <Fingerprint className={`w-10 h-10 ${isAuthenticating ? 'animate-bounce' : ''}`} />
                    )}

                    {isAuthenticating && (
                      <div className="absolute inset-x-2 top-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                    )}
                  </button>

                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      {authSuccess
                        ? 'Identidade Confirmada! Carregando Workspace...'
                        : isAuthenticating
                        ? 'Lendo sensor biométrico (WebAuthn)...'
                        : `Toque para autenticar como ${targetUser.name}`}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Chave Criptográfica: {targetUser.publicKeyFingerprint}
                    </p>
                  </div>
                </div>
              )}

              {/* Method 2: Exclusive Token */}
              {signInMethod === 'token' && (
                <form onSubmit={handleTokenLogin} className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Token Criptográfico Exclusivo do Usuário
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="Ex: ISC-98F1-4A2D-0B99-771A"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-10 py-2.5 font-mono text-xs text-cyan-300 tracking-wider focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setTokenInput(targetUser.securityToken)}
                        className="absolute right-2.5 top-2.5 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono"
                      >
                        Preencher
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Validar Token e Entrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Method 3: Password */}
              {signInMethod === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">E-mail Corporativo</label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Senha Segura</label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Entrar no Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {signInError && (
                <p className="text-xs text-red-400 font-mono text-center">{signInError}</p>
              )}
            </div>
          )}

          {/* TAB 2: CRIAR CONTA */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="p-6 space-y-4">
              {/* Profile Photo & Name */}
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={newAvatarUrl}
                    alt="Novo usuário"
                    className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/50 shadow-md"
                  />
                  <label
                    htmlFor="signup-avatar"
                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    title="Carregar foto de perfil"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </label>
                  <input
                    id="signup-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-1.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      placeholder="Ex: Roberto Silva"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    placeholder="roberto.silva@isaiasco.internal"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Senha de Acesso *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Mínimo 8 caracteres"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Department & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Departamento
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Operações de Campo">Operações de Campo</option>
                    <option value="Diretoria Geral">Diretoria Executiva</option>
                    <option value="Engenharia & TI">Engenharia & TI</option>
                    <option value="Logística & Suprimentos">Logística & Suprimentos</option>
                    <option value="Segurança & Telecom">Segurança & Telecom</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Cargo / Função
                  </label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    required
                    placeholder="Ex: Engenheiro de Suporte"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Biometric Toggle & Automatic Token Generation Preview */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">Habilitar Biometria no Dispositivo</h4>
                      <p className="text-[10px] text-slate-400">Permite login via Touch ID, Face ID ou Windows Hello</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={newBiometricEnabled}
                    onChange={(e) => setNewBiometricEnabled(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 rounded bg-slate-900 border-slate-700"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Chave Criptográfica Gerada:
                  </span>
                  <span className="text-cyan-300 font-bold">AES-256-GCM + Token ISC-Auto</span>
                </div>
              </div>

              {signUpError && (
                <p className="text-xs text-red-400 font-mono text-center">{signUpError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Criar Conta & Iniciar Sessão</span>
              </button>
            </form>
          )}

          {/* Footer security badge */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Shield className="w-3.5 h-3.5" />
              Criptografia E2EE Zero-Trust Ativa
            </span>
            <span>Versão 2.4.0-SEC</span>
          </div>
        </div>
      </div>

      {/* Corporate Copyright */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-900 font-mono">
        © 2026 ISAIASCO Technologies · Todos os direitos reservados · Comunicação Interna Segura
      </footer>
    </div>
  );
};

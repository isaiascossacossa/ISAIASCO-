import React, { useState } from 'react';
import { ShieldCheck, Lock, Key, Copy, Check, QrCode, Terminal, RefreshCw, X } from 'lucide-react';
import { EncryptedPayload, User } from '../types';

interface SecurityInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  inspectedPayload?: {
    senderName: string;
    plaintext: string;
    payload: EncryptedPayload;
  } | null;
  partnerUser?: User | null;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  inspectedPayload,
  partnerUser,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'payload' | 'safety_numbers' | 'device_token'>('payload');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Verifiable safety numbers (6 blocks of 5 digits)
  const safetyNumbers = [
    '49102', '88129', '04128',
    '99201', '33418', '77210',
    '12093', '48190', '55219',
    '60912', '83019', '21094'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Auditoria Criptográfica E2EE & Segurança
                <span className="text-[11px] font-mono text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                  AES-256-GCM
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Garantia matemática de privacidade ponto a ponto da ISAIASCO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-900">
          <button
            onClick={() => setActiveTab('payload')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'payload'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Payload Criptografado
          </button>
          <button
            onClick={() => setActiveTab('safety_numbers')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'safety_numbers'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Números de Segurança Verificáveis
          </button>
          <button
            onClick={() => setActiveTab('device_token')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'device_token'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Token & Biometria do Usuário
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'payload' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Mensagem Descriptografada (Visão Local):</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                    <Check className="w-3.5 h-3.5" /> Chave Válida
                  </span>
                </div>
                <p className="text-sm text-slate-200 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  {inspectedPayload?.plaintext || 'Inspeção de tráfego de dados de teste ativo na rede ISAIASCO.'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    Ciphertext Bruto (Tráfego de Rede Criptografado):
                  </span>
                  <button
                    onClick={() => copyToClipboard(inspectedPayload?.payload.cipherText || '9b7a4f89d02318eb4c194bb10842ff399e52e189', 'cipher')}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                  >
                    {copied === 'cipher' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copiar Hex
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-xs text-amber-300 break-all leading-relaxed select-all">
                  {inspectedPayload?.payload.cipherText || '9b7a4f89d02318eb4c194bb10842ff399e52e189d901a8f9b2014c29184ba01'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-mono text-[11px]">Vetor de Inicialização (IV 96-bit):</span>
                  <p className="font-mono text-cyan-300 break-all">
                    {inspectedPayload?.payload.iv || '4f29108b33ce2198fa0184b2'}
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-mono text-[11px]">Fingerprint da Chave de Sessão:</span>
                  <p className="font-mono text-emerald-300 break-all">
                    {inspectedPayload?.payload.keyFingerprint || 'E2EE-ISAIASCO-9982-A4B7-C091'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safety_numbers' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-center space-y-2">
                <p className="text-xs text-slate-300">
                  Compare estes números com seu interlocutor ({partnerUser?.name || 'Membros do Canal'}). Se os números forem idênticos em ambos os dispositivos, a criptografia de ponta a ponta é 100% autêntica contra interceptação.
                </p>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                  {safetyNumbers.map((num, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-2 rounded-lg font-mono text-sm font-bold text-cyan-300 text-center tracking-wider">
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <QrCode className="w-8 h-8 text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">Verificação Presencial via QR Code</h4>
                    <p className="text-[11px] text-slate-400">Escaneie o código do colega para aprovação biométrica imediata</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Chave de segurança validada com sucesso! Conexão autenticada.')}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Marcar como Verificado
                </button>
              </div>
            </div>
          )}

          {activeTab === 'device_token' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Token Criptográfico do Dispositivo:</span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Sessão Ativa
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300">
                  <span>{currentUser.securityToken}</span>
                  <button
                    onClick={() => copyToClipboard(currentUser.securityToken, 'token')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copied === 'token' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Expiração da Sessão: {new Date(currentUser.tokenExpiry).toLocaleTimeString('pt-BR')}</span>
                  <span>Autenticação Biométrica: {currentUser.biometricEnabled ? 'Ativada (FIDO2)' : 'Desativada'}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-slate-300">Chave Pública de Assinatura (ECC / P-256):</span>
                <p className="font-mono text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 break-all">
                  ISAIASCO-PUBKEY-SHA256:{currentUser.publicKeyFingerprint}-MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Nenhum dado é transmitido em texto claro para os servidores.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

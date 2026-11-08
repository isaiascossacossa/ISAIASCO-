import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Paperclip, Mic, Lock, ShieldCheck, Video, 
  Search, Smile, CheckCheck, FileText, Download, Eye, 
  Phone, Sparkles, AlertCircle, Smartphone 
} from 'lucide-react';
import { Channel, Message, User, EncryptedPayload } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { AudioRecorder } from './AudioRecorder';
import { encryptE2EEMessage } from '../services/crypto';

interface ChatAreaProps {
  channel: Channel;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, type: 'text' | 'audio' | 'file', audioData?: { duration: number; url: string }, fileData?: { name: string; size: number; type: string; url: string }) => void;
  onStartVideoCall: (roomName: string) => void;
  onInspectPayload: (payload: { senderName: string; plaintext: string; payload: EncryptedPayload }) => void;
  partnerUser?: User | null;
  onOpenPhoneContacts?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  channel,
  messages,
  currentUser,
  onSendMessage,
  onStartVideoCall,
  onInspectPayload,
  partnerUser,
  onOpenPhoneContacts,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    setInputText('');
    onSendMessage(textToSend, 'text');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = (event.target?.result as string) || '#';
        onSendMessage(
          `Arquivo compartilhado via canal seguro: ${file.name}`,
          'file',
          undefined,
          {
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            url: fileUrl,
          }
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioRecorded = (audioBlob: Blob | null, duration: number, audioUrl: string) => {
    setIsRecordingAudio(false);
    onSendMessage(
      `Mensagem de voz criptografada (${duration}s)`,
      'audio',
      { duration, url: audioUrl }
    );
  };

  const filteredMessages = messages.filter(m => {
    if (!searchQuery.trim()) return true;
    return m.content.toLowerCase().includes(searchQuery.toLowerCase()) || m.senderName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Top Channel Bar */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          {channel.type === 'direct' && partnerUser ? (
            <div className="relative">
              <img
                src={partnerUser.avatarUrl}
                alt={partnerUser.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700"
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                partnerUser.status.type === 'online' ? 'bg-emerald-500' :
                partnerUser.status.type === 'field' ? 'bg-cyan-500' :
                partnerUser.status.type === 'busy' ? 'bg-rose-500' : 'bg-amber-500'
              }`} />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400">
              #
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">
                {channel.type === 'direct' && partnerUser ? partnerUser.name : channel.name}
              </h2>
              <button
                type="button"
                onClick={() => onInspectPayload({
                  senderName: 'ISAIASCO Security Root',
                  plaintext: 'Canal verificado com criptografia de ponta a ponta ativa.',
                  payload: {
                    cipherText: '9b7a4f89d02318eb4c194bb10842ff399e52e189',
                    iv: '4f29108b33ce2198fa0184b2',
                    algorithm: 'AES-256-GCM',
                    keyFingerprint: 'E2EE-ISAIASCO-9982-A4B7-C091',
                  }
                })}
                className="text-[10px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-cyan-900/80 transition-colors"
                title="Clique para auditar chaves e payload E2EE"
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> E2EE Verificado
              </button>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">
              {channel.type === 'direct' && partnerUser
                ? `${partnerUser.role} · ${partnerUser.status.customText}`
                : channel.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <div className="relative">
            {isSearching ? (
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar mensagens..."
                  autoFocus
                  className="bg-transparent text-xs text-slate-200 focus:outline-none w-32 sm:w-48"
                />
                <button onClick={() => { setIsSearching(false); setSearchQuery(''); }} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearching(true)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Pesquisar histórico"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Find Friends / Phone Contacts button */}
          {onOpenPhoneContacts && (
            <button
              type="button"
              onClick={onOpenPhoneContacts}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-sm"
              title="Encontrar amigos através dos contatos do celular"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Agenda</span>
            </button>
          )}

          {/* Quick Video Call Launch */}
          <button
            type="button"
            onClick={() => onStartVideoCall(`Sala ${channel.name}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            title="Iniciar chamada de vídeo em grupo com baixa latência"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vídeo E2EE</span>
          </button>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Security Banner at top of chat */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-900/90 border border-cyan-900/50 rounded-xl px-4 py-2 text-center text-xs text-slate-400 max-w-lg space-y-0.5">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-semibold text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              <span>Criptografia de Ponta a Ponta Ativada</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              As mensagens, áudios e arquivos trafegam protegidos por chaves AES-256-GCM. Somente os participantes autorizados possuem a chave para decifrá-los.
            </p>
          </div>
        </div>

        {/* Message Items */}
        {filteredMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0 mt-0.5"
              />

              <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-300">{msg.senderName}</span>
                  <span className="text-[10px] font-mono text-slate-500">{msg.timestamp}</span>
                </div>

                <div
                  className={`rounded-2xl p-3.5 relative shadow-sm ${
                    isMe
                      ? 'bg-cyan-950/70 text-slate-100 border border-cyan-800/80 rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Text Message Content */}
                  {msg.type === 'text' && (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}

                  {/* Audio Message Content */}
                  {msg.type === 'audio' && (
                    <div className="space-y-1">
                      <AudioPlayer duration={msg.audioDuration || 15} audioUrl={msg.audioUrl} />
                    </div>
                  )}

                  {/* File Message Content */}
                  {msg.type === 'file' && msg.fileData && (
                    <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">{msg.fileData.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {formatFileSize(msg.fileData.size)} · Documento Seguro
                        </p>
                      </div>
                      <a
                        href={msg.fileData.url}
                        download={msg.fileData.name}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                        title="Baixar arquivo seguro"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                  {/* Message Meta & E2EE Inspector trigger */}
                  <div className="flex items-center justify-end gap-1.5 mt-1.5 pt-1 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                    <button
                      type="button"
                      onClick={() => onInspectPayload({
                        senderName: msg.senderName,
                        plaintext: msg.content,
                        payload: msg.encryptedPayload,
                      })}
                      className="hover:text-cyan-400 flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                      title="Inspecionar Payload E2EE e Chave"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      <span>{msg.encryptedPayload.algorithm}</span>
                    </button>
                    <span>·</span>
                    <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Deck */}
      <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md">
        {isRecordingAudio ? (
          <AudioRecorder
            onAudioRecorded={handleAudioRecorded}
            onCancel={() => setIsRecordingAudio(false)}
          />
        ) : (
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            {/* File Attachment Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
              title="Compartilhar arquivo com criptografia de ponta a ponta"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Audio Voice Recording Trigger */}
            <button
              type="button"
              onClick={() => setIsRecordingAudio(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
              title="Gravar mensagem de voz E2EE"
            >
              <Mic className="w-4 h-4" />
            </button>

            {/* Main Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Mensagem criptografada para ${channel.type === 'direct' && partnerUser ? partnerUser.name : '#' + channel.name}...`}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
              />
              <span className="absolute right-3 top-2.5 text-slate-500 pointer-events-none">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
              </span>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white transition-all active:scale-95 shrink-0 shadow-sm"
              title="Enviar mensagem criptografada"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

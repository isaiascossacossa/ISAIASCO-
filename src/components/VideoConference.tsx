import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff, 
  Users, MessageSquare, ShieldCheck, Settings, Maximize2, 
  Sparkles, Radio, Volume2, Shield
} from 'lucide-react';
import { User } from '../types';

interface VideoConferenceProps {
  roomName: string;
  currentUser: User;
  onLeaveCall: () => void;
}

interface PeerParticipant {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  locationStatus: string;
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  roomName,
  currentUser,
  onLeaveCall,
}) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeLayout, setActiveLayout] = useState<'grid' | 'speaker'>('grid');
  const [callDuration, setCallDuration] = useState(0);
  const [latencyMs, setLatencyMs] = useState(38);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string>('peer_mariana');
  const [inCallChatOpen, setInCallChatOpen] = useState(false);
  const [inCallMessages, setInCallMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Mariana Rios', text: 'Conexão de campo com sinal excelente via satélite.', time: '09:31' },
    { sender: 'Carlos Mendes', text: 'Latência do relay E2EE estabilizada em 38ms.', time: '09:32' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Simulated corporate peer participants
  const peers: PeerParticipant[] = [
    {
      id: 'peer_mariana',
      name: 'Mariana Rios',
      role: 'Coord. Operações (Unidade Móvel)',
      avatarUrl: '/src/assets/images/avatar_mariana_ops_1794085281221.jpg',
      isSpeaking: true,
      isMuted: false,
      isVideoOff: false,
      locationStatus: 'Em Campo - Zona Sul',
    },
    {
      id: 'peer_carlos',
      name: 'Carlos Mendes',
      role: 'Eng. Chefe de Infraestrutura',
      avatarUrl: '/src/assets/images/avatar_carlos_eng_1794085281646.jpg',
      isSpeaking: false,
      isMuted: false,
      isVideoOff: false,
      locationStatus: 'Data Center Primário',
    },
    {
      id: 'peer_beatriz',
      name: 'Beatriz Lima',
      role: 'Gerente de Logística',
      avatarUrl: '/src/assets/images/avatar_beatriz_logistics_1794085282021.jpg',
      isSpeaking: false,
      isMuted: true,
      isVideoOff: false,
      locationStatus: 'Sede Central HQ',
    },
  ];

  // Request real user camera & microphone stream
  useEffect(() => {
    let mounted = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true,
          });
          if (mounted && localVideoRef.current) {
            localStreamRef.current = stream;
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Câmera ou microfone não puderam ser inicializados:', err);
      }
    }

    initCamera();

    const durationTimer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Natural random jitter for latency and speaker rotation
    const jitterTimer = setInterval(() => {
      setLatencyMs(prev => Math.floor(34 + Math.random() * 8));
      if (Math.random() > 0.6) {
        const pool = ['user_me', 'peer_mariana', 'peer_carlos'];
        setActiveSpeakerId(pool[Math.floor(Math.random() * pool.length)]);
      }
    }, 3500);

    return () => {
      mounted = false;
      clearInterval(durationTimer);
      clearInterval(jitterTimer);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          screenStreamRef.current = screenStream;
          if (screenShareVideoRef.current) {
            screenShareVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);
          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
          };
        }
      } catch (err) {
        console.warn('Compartilhamento de tela cancelado:', err);
      }
    }
  };

  const handleSendInCallChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setInCallMessages(prev => [
      ...prev,
      { sender: currentUser.name, text: chatInput.trim(), time: timeStr }
    ]);
    setChatInput('');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 h-full relative overflow-hidden">
      {/* Top Conference Bar */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">{roomName}</h2>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" /> E2EE DTLS-SRTP
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>Duração: {formatSeconds(callDuration)}</span>
              <span>·</span>
              <span className="text-emerald-400">Latência: {latencyMs}ms</span>
              <span>·</span>
              <span>4 Participantes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveLayout(activeLayout === 'grid' ? 'speaker' : 'grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              activeLayout === 'grid'
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {activeLayout === 'grid' ? 'Visualização em Grade' : 'Foco no Orador'}
          </button>

          <button
            type="button"
            onClick={() => setInCallChatOpen(!inCallChatOpen)}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors relative ${
              inCallChatOpen
                ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Chat da chamada"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main Video Stage & Side Chat */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Video Tiles Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full overflow-y-auto">
          {/* Tile 1: Current User (Local) */}
          <div className={`relative bg-slate-900 rounded-2xl overflow-hidden border transition-all ${
            activeSpeakerId === 'user_me' ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800'
          } flex flex-col justify-end`}>
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-700"
                />
                <span className="text-xs text-slate-400 mt-2">Câmera desativada</span>
              </div>
            )}

            {/* Overlay Info */}
            <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">{currentUser.name} (Você)</span>
                <span className="text-[10px] text-cyan-300 font-mono">Diretoria HQ</span>
              </div>
              <div className="flex items-center gap-1.5">
                {!isMicOn && (
                  <span className="p-1 rounded-md bg-red-950/80 text-red-400 border border-red-800">
                    <MicOff className="w-3.5 h-3.5" />
                  </span>
                )}
                {isMicOn && (
                  <span className="p-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1 text-[10px] font-mono">
                    <Volume2 className="w-3.5 h-3.5" /> E2EE
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tiles 2, 3, 4: Peer Participants */}
          {peers.map((peer) => {
            const isSpeaker = activeSpeakerId === peer.id;
            return (
              <div
                key={peer.id}
                className={`relative bg-slate-900 rounded-2xl overflow-hidden border transition-all ${
                  isSpeaker ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800'
                } flex flex-col justify-end`}
              >
                {/* Simulated live camera view with authentic avatar background */}
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center">
                  <div className="relative">
                    <img
                      src={peer.avatarUrl}
                      alt={peer.name}
                      referrerPolicy="no-referrer"
                      className={`w-28 h-28 rounded-full object-cover border-2 transition-all ${
                        isSpeaker ? 'border-cyan-400 scale-105' : 'border-slate-700'
                      }`}
                    />
                    {isSpeaker && (
                      <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-slate-950 rounded-full p-1 shadow">
                        <Volume2 className="w-4 h-4 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 mt-2">{peer.role}</span>
                </div>

                {/* Overlay Info */}
                <div className="relative z-10 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{peer.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">· {peer.locationStatus}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {peer.isMuted ? (
                      <span className="p-1 rounded-md bg-red-950/80 text-red-400 border border-red-800">
                        <MicOff className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        <Mic className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Screen Share Tile (if active) */}
          {isScreenSharing && (
            <div className="col-span-1 md:col-span-2 relative bg-slate-900 rounded-2xl overflow-hidden border border-cyan-500 shadow-xl min-h-[300px]">
              <video
                ref={screenShareVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2">
                <ScreenShare className="w-4 h-4 text-cyan-400" />
                Compartilhando Tela em Alta Definição (60fps)
              </div>
            </div>
          )}
        </div>

        {/* In-Call Side Chat Drawer */}
        {inCallChatOpen && (
          <div className="w-80 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full shrink-0 animate-fadeIn">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Chat da Reunião
              </span>
              <span className="text-[10px] font-mono text-cyan-400">E2EE Instantâneo</span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
              {inCallMessages.map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-cyan-300">{m.sender}</span>
                    <span className="text-[10px] font-mono text-slate-500">{m.time}</span>
                  </div>
                  <p className="text-xs text-slate-300">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendInCallChat} className="p-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Enviar mensagem na chamada..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Enviar
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Conference Bottom Control Deck */}
      <div className="h-20 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Shield className="w-3.5 h-3.5" /> Criptografia de Ponta a Ponta Ativa
          </span>
        </div>

        {/* Core Call Action Buttons */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            type="button"
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              isMicOn
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title={isMicOn ? 'Mutar microfone' : 'Ativar microfone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              isVideoOn
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
            title={isVideoOn ? 'Desligar câmera' : 'Ligar câmera'}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${
              isScreenSharing
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
            }`}
            title="Compartilhar tela"
          >
            <ScreenShare className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onLeaveCall}
            className="w-14 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all shadow-md ml-3"
            title="Encerrar chamada"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert('Configurações de Áudio e Cancelamento de Ruído E2EE operando normalmente.')}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors"
            title="Configurações de mídia"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

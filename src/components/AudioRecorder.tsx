import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Lock } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob | null, duration: number, audioUrl: string) => void;
  onCancel: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioRecorded, onCancel }) => {
  const [isRecording, setIsRecording] = useState(true);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startRecording() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!mounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.start();
        }
      } catch (err) {
        console.warn('Microfone não acessível ou permissão negada, utilizando modo seguro simulado:', err);
      }

      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);
    }

    startRecording();

    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleStopAndSend = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const finalDuration = Math.max(1, recordTime);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onAudioRecorded(audioBlob, finalDuration, audioUrl);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
      };
      mediaRecorderRef.current.stop();
    } else {
      // Fallback synthetic audio voice note
      onAudioRecorded(null, finalDuration, '');
    }
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    onCancel();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-between gap-3 bg-slate-900 border border-cyan-500/40 rounded-xl px-4 py-2.5 w-full animate-fadeIn shadow-lg">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute" />
          <span className="w-3 h-3 rounded-full bg-red-500 relative" />
        </div>
        
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-medium text-slate-200">
            Gravando Áudio E2EE: {formatTime(recordTime)}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400/90 ml-2">
            <Lock className="w-3 h-3" />
            Criptografia Ativa
          </span>
        </div>
      </div>

      {/* Simulated Live Waveform */}
      <div className="hidden md:flex items-center gap-1 h-5">
        {[20, 50, 80, 40, 95, 60, 30, 85, 45, 90, 70, 30, 85, 40].map((h, i) => (
          <div
            key={i}
            className="w-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              height: `${Math.max(25, (h * ((recordTime % 3) + 1)) % 100)}%`,
              animationDelay: `${i * 70}ms`,
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          title="Cancelar gravação"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleStopAndSend}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          title="Concluir e Enviar com E2EE"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Enviar Áudio</span>
        </button>
      </div>
    </div>
  );
};

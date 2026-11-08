import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  duration?: number;
  audioUrl?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ duration = 15, audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<any>(null);

  // Generate deterministic bar heights for waveform visualization
  const bars = [40, 65, 85, 30, 95, 70, 50, 90, 60, 45, 80, 100, 65, 50, 75, 90, 40, 60, 85, 55, 30, 70];

  const togglePlay = () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setProgress(0);
          clearInterval(intervalRef.current);
        };
      }
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        clearInterval(intervalRef.current);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
        intervalRef.current = setInterval(() => {
          if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const dur = audioRef.current.duration || duration;
            setProgress((current / dur) * 100);
          }
        }, 100);
      }
    } else {
      // Synthetic preview playback when audioUrl is a demo tone
      if (isPlaying) {
        setIsPlaying(false);
        clearInterval(intervalRef.current);
      } else {
        setIsPlaying(true);
        const startTime = Date.now() - (progress / 100) * (duration * 1000);
        intervalRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed >= duration) {
            setIsPlaying(false);
            setProgress(0);
            clearInterval(intervalRef.current);
          } else {
            setProgress((elapsed / duration) * 100);
          }
        }, 100);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const currentSeconds = Math.floor((progress / 100) * duration);

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/60 rounded-xl p-2.5 max-w-sm">
      <button
        type="button"
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition-transform active:scale-95 shrink-0 shadow-sm"
        title={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio criptografado'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Waveform Visualization */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-6 flex items-center gap-1">
          {bars.map((height, i) => {
            const barProgress = (i / bars.length) * 100;
            const isPlayed = barProgress <= progress;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isPlayed ? 'bg-cyan-400' : 'bg-slate-700'
                } ${isPlaying && isPlayed ? 'opacity-100 scale-y-110' : 'opacity-80'}`}
                style={{ height: `${Math.max(20, height)}%` }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{formatSeconds(isPlaying ? currentSeconds : 0)}</span>
          <span className="flex items-center gap-1 text-[10px] text-cyan-400">
            <Volume2 className="w-3 h-3" />
            E2EE Audio
          </span>
          <span>{formatSeconds(duration)}</span>
        </div>
      </div>
    </div>
  );
};

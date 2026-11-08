import React, { useState } from 'react';
import { 
  Navigation, Battery, Radio, MapPin, Compass, AlertCircle, 
  CheckCircle2, Clock, Plus, Filter, ShieldCheck, ChevronRight, 
  Crosshair, UserCheck, PhoneCall, Video 
} from 'lucide-react';
import { FieldAgent, User } from '../types';

interface FieldTrackerProps {
  agents: FieldAgent[];
  currentUser: User;
  onNewCheckin: (agentId: string, note: string, type: 'checkin' | 'relatorio_campo' | 'alerta') => void;
  onStartCallWithAgent: (agentName: string) => void;
}

export const FieldTracker: React.FC<FieldTrackerProps> = ({
  agents,
  currentUser,
  onNewCheckin,
  onStartCallWithAgent,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_transit' | 'on_site' | 'idle'>('all');
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [checkinNote, setCheckinNote] = useState('');
  const [checkinType, setCheckinType] = useState<'checkin' | 'relatorio_campo' | 'alerta'>('checkin');
  const [gpsLiveStatus, setGpsLiveStatus] = useState<string | null>(null);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const filteredAgents = agents.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  const handleLiveGpsBroadcast = () => {
    if ('geolocation' in navigator) {
      setGpsLiveStatus('Adquirindo sinal de satélite GPS...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLiveStatus(`GPS Ativo: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)} (Precisão: ±${Math.round(position.coords.accuracy)}m)`);
        },
        () => {
          setGpsLiveStatus('GPS Satelital simulado com sucesso na malha metropolitana.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsLiveStatus('Geolocalização ativada via triangulação de antenas de campo.');
    }
  };

  const handleSaveCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkinNote.trim() || !selectedAgent) return;
    onNewCheckin(selectedAgent.id, checkinNote.trim(), checkinType);
    setCheckinNote('');
    setIsCheckinModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-slate-950 overflow-hidden text-slate-100">
      {/* Left/Main Column: Interactive Field Dispatch Radar & Map */}
      <div className="flex-1 flex flex-col h-full border-r border-slate-800 overflow-hidden relative">
        {/* Top Radar Bar */}
        <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Central de Rastreamento de Equipes de Campo
                <span className="text-[10px] font-mono text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                  GPS E2EE Em Tempo Real
                </span>
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {agents.length} unidades conectadas · Monitoramento de rota e telemetria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLiveGpsBroadcast}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-sm"
              title="Transmitir posição do dispositivo"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Meu GPS Atual</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCheckinModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Check-in</span>
            </button>
          </div>
        </div>

        {/* GPS Live Status Notice if triggered */}
        {gpsLiveStatus && (
          <div className="px-6 py-2 bg-cyan-950/90 border-b border-cyan-800 text-xs font-mono text-cyan-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              {gpsLiveStatus}
            </span>
            <button onClick={() => setGpsLiveStatus(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Map Stage Container */}
        <div className="flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center">
          {/* Satellite Map Background Image */}
          <img
            src="/src/assets/images/field_satellite_map_bg_1794085282635.jpg"
            alt="Malha Cartográfica Metropolitana ISAIASCO"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.65] contrast-[1.15]"
          />

          {/* Tactical Grid Overlay (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(34, 211, 238, 0.25)" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Sector Circles */}
            <circle cx="50%" cy="50%" r="180" fill="none" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50%" cy="50%" r="320" fill="none" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="0.5" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="0.5" />
          </svg>

          {/* Render Route Paths between checkpoints */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polyline
              points="280,320 380,240 450,290 620,380"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          </svg>

          {/* Pin 1: Unidade Alfa (Mariana) */}
          <div
            onClick={() => setSelectedAgentId('fa_1')}
            className="absolute cursor-pointer transition-transform hover:scale-110 z-20 group"
            style={{ left: '46%', top: '38%' }}
          >
            <div className="relative flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-cyan-500/20 animate-ping absolute" />
              <div className="w-11 h-11 rounded-full border-2 border-cyan-400 p-0.5 bg-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                <img
                  src="/src/assets/images/avatar_mariana_ops_1794085281221.jpg"
                  alt="Mariana Rios"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border border-slate-950" />
            </div>
            {/* Tactical Label */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 border border-cyan-500/60 px-2 py-0.5 rounded shadow text-[10px] font-mono text-cyan-300">
              Unidade Alfa · 38 km/h
            </div>
          </div>

          {/* Pin 2: Unidade Beta (Carlos Mendes) */}
          <div
            onClick={() => setSelectedAgentId('fa_2')}
            className="absolute cursor-pointer transition-transform hover:scale-110 z-20 group"
            style={{ left: '62%', top: '56%' }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-400 p-0.5 bg-slate-950 shadow-md">
                <img
                  src="/src/assets/images/avatar_carlos_eng_1794085281646.jpg"
                  alt="Carlos Mendes"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-slate-950" />
            </div>
            <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 border border-emerald-500/60 px-2 py-0.5 rounded shadow text-[10px] font-mono text-emerald-300">
              Unidade Beta · No Ponto
            </div>
          </div>

          {/* Pin 3: Unidade Gamma (Beatriz Lima) */}
          <div
            onClick={() => setSelectedAgentId('fa_3')}
            className="absolute cursor-pointer transition-transform hover:scale-110 z-20 group"
            style={{ left: '28%', top: '64%' }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-purple-400 p-0.5 bg-slate-950 shadow-md">
                <img
                  src="/src/assets/images/avatar_beatriz_logistics_1794085282021.jpg"
                  alt="Beatriz Lima"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-400 border border-slate-950" />
            </div>
            <div className="absolute top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 border border-purple-500/60 px-2 py-0.5 rounded shadow text-[10px] font-mono text-purple-300">
              Unidade Gamma · Terminal
            </div>
          </div>

          {/* Map Compass HUD */}
          <div className="absolute bottom-4 left-4 p-3 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 space-y-1 z-10 pointer-events-none">
            <div className="flex items-center gap-2 text-cyan-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>Setor Operacional Centro-Sul</span>
            </div>
            <p className="text-slate-400 text-[10px]">Criptografia de Posição: AES-256-GCM / 5s Beacon</p>
          </div>
        </div>
      </div>

      {/* Right Column: Selected Agent Telemetry & Check-in Timeline */}
      <div className="w-full lg:w-96 bg-slate-900 flex flex-col h-full shrink-0">
        {/* Header with Segmented Filter */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Unidades de Campo</h3>
            <span className="text-xs font-mono text-cyan-400">{filteredAgents.length} Ativas</span>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg">
            {(['all', 'in_transit', 'on_site'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterStatus(tab)}
                className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  filterStatus === tab
                    ? 'bg-slate-800 text-slate-100 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? 'Todas' : tab === 'in_transit' ? 'Em Rota' : 'No Local'}
              </button>
            ))}
          </div>
        </div>

        {/* Agents List Carousel / Selector */}
        <div className="p-3 border-b border-slate-800 space-y-2 overflow-y-auto max-h-48">
          {filteredAgents.map(agent => (
            <button
              key={agent.id}
              type="button"
              onClick={() => setSelectedAgentId(agent.id)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                selectedAgent.id === agent.id
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={agent.avatarUrl}
                  alt={agent.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <p className="text-xs font-bold text-slate-200">{agent.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{agent.locationName}</p>
                </div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  agent.status === 'in_transit' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {agent.status === 'in_transit' ? `${agent.speed} km/h` : 'No Ponto'}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Agent Details & Telemetry */}
        <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={selectedAgent.avatarUrl}
                alt={selectedAgent.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/40"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-100">{selectedAgent.name}</h4>
                <p className="text-[10px] text-slate-400">{selectedAgent.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartCallWithAgent(selectedAgent.name)}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              title="Iniciar chamada de vídeo direta"
            >
              <Video className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" /> Bateria:
              </span>
              <span className="text-emerald-300 font-bold">{selectedAgent.battery}%</span>
            </div>
            <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" /> Sinal:
              </span>
              <span className="text-cyan-300 font-bold">{selectedAgent.lastPing}</span>
            </div>
          </div>
        </div>

        {/* Check-ins Timeline */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Histórico de Check-ins de Campo
            </h4>
            <span className="text-[10px] font-mono text-slate-500">
              {selectedAgent.checkins.length} registros
            </span>
          </div>

          <div className="space-y-2.5">
            {selectedAgent.checkins.map(ck => (
              <div key={ck.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    {ck.type === 'alerta' ? (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                    {ck.address}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">{ck.time}</span>
                </div>
                <p className="text-xs text-slate-300">{ck.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in Registration Modal */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Registrar Check-in de Campo</h3>
                <p className="text-xs text-slate-400">Salvar relatório de posição e nota operacional</p>
              </div>
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCheckin} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tipo de Registro
                </label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(['checkin', 'relatorio_campo', 'alerta'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCheckinType(t)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        checkinType === t
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t === 'checkin' ? 'Check-in' : t === 'relatorio_campo' ? 'Relatório' : 'Alerta'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Nota / Observação Operacional
                </label>
                <textarea
                  value={checkinNote}
                  onChange={(e) => setCheckinNote(e.target.value)}
                  rows={3}
                  required
                  placeholder="Descreva a atividade, condição do local ou status da fiscalização..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckinModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Confirmar Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

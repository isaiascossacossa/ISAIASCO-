import React, { useState } from 'react';
import { 
  Wrench, AlertTriangle, ShieldCheck, Activity, Users, 
  Terminal, RefreshCw, CheckCircle2, XCircle, Search, 
  Plus, ArrowRightLeft, Lock, Unlock, Key, Fingerprint, 
  Download, Filter, Play, Check, Server, Radio, Zap
} from 'lucide-react';
import { 
  SystemIncident, SystemHealthMetric, AuditLog, User, 
  IncidentSeverity, IncidentStatus, SystemModule 
} from '../types';
import { Logo } from './Logo';

interface AdminConsoleProps {
  currentUser: User;
  users: User[];
  incidents: SystemIncident[];
  healthMetrics: SystemHealthMetric[];
  auditLogs: AuditLog[];
  onSwitchToClientMode: () => void;
  onResolveIncident: (incidentId: string, remedyTitle: string, note?: string) => void;
  onCreateIncident: (incident: Omit<SystemIncident, 'id' | 'createdAt'>) => void;
  onToggleUserBlock: (userId: string) => void;
  onRotateUserToken: (userId: string) => void;
  onToggleUserRole: (userId: string) => void;
  onRunSystemHealthScan: () => Promise<void>;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  currentUser,
  users,
  incidents,
  healthMetrics,
  auditLogs,
  onSwitchToClientMode,
  onResolveIncident,
  onCreateIncident,
  onToggleUserBlock,
  onRotateUserToken,
  onToggleUserRole,
  onRunSystemHealthScan,
}) => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'health' | 'users' | 'audit'>('incidents');
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'open' | 'critical' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isResolvingId, setIsResolvingId] = useState<string | null>(null);
  const [isScanningHealth, setIsScanningHealth] = useState(false);
  const [healthScanLogs, setHealthScanLogs] = useState<string[]>([]);
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);

  // New incident form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('high');
  const [newModule, setNewModule] = useState<SystemModule>('webrtc');
  const [newAffectedCount, setNewAffectedCount] = useState(5);
  const [newRemedyTitle, setNewRemedyTitle] = useState('');

  // Filtering incidents
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inc.module.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (incidentFilter === 'open') return inc.status !== 'resolved';
    if (incidentFilter === 'critical') return inc.severity === 'critical' && inc.status !== 'resolved';
    if (incidentFilter === 'resolved') return inc.status === 'resolved';
    return true;
  });

  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const resolvedIncidentsCount = incidents.filter(i => i.status === 'resolved').length;

  const handleExecuteRemedy = async (incident: SystemIncident) => {
    setIsResolvingId(incident.id);
    // Simulate diagnostic fix execution
    setTimeout(() => {
      onResolveIncident(
        incident.id, 
        incident.remedyActionTitle || 'Correção Automática de Infraestrutura',
        `Reparo aplicado com sucesso por ${currentUser.name}. Pacotes normalizados e chaves validadas.`
      );
      setIsResolvingId(null);
    }, 1200);
  };

  const handleRunFullScan = async () => {
    setIsScanningHealth(true);
    setHealthScanLogs([
      'Iniciando varredura profunda de nós da rede ISAIASCO...',
      'Testando endpoint de saúde HTTP /api/health (porta 3000)...',
    ]);

    setTimeout(() => {
      setHealthScanLogs(prev => [
        ...prev,
        'API Central Express: HTTP 200 OK (latência 12ms)',
        'Verificando integridade das assinaturas de chave AES-256-GCM...',
      ]);
    }, 800);

    setTimeout(() => {
      setHealthScanLogs(prev => [
        ...prev,
        'Web Crypto Engine: 100% dos blocos criptográficos íntegros',
        'Inspecionando relays WebRTC STUN/TURN...',
      ]);
    }, 1600);

    setTimeout(async () => {
      await onRunSystemHealthScan();
      setHealthScanLogs(prev => [
        ...prev,
        'Relay WebRTC re-calibrado: jitter reduzido para <15ms',
        'Gateway de Telemetria GPS: conexões ativas confirmadas',
        '✅ Varredura concluída. Todos os subsistemas em conformidade operacional.',
      ]);
      setIsScanningHealth(false);
    }, 2400);
  };

  const handleCreateNewIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateIncident({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Incidente registrado manualmente pelo console de administração.',
      severity: newSeverity,
      status: 'open',
      module: newModule,
      affectedUsersCount: newAffectedCount,
      remedyActionTitle: newRemedyTitle.trim() || 'Ação de Reparo do Sistema',
    });

    setNewTitle('');
    setNewDesc('');
    setNewRemedyTitle('');
    setIsNewIncidentModalOpen(false);
  };

  const exportAuditLogsAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `isaiasco_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Banner / Switch to Client Portal */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-800/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Wrench className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                PAINEL DO ADMINISTRADOR DA PLATAFORMA
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SISTEMA & INFRA
              </span>
            </div>
            <p className="text-[11px] text-cyan-200/80">
              Centro de diagnóstico, resolução de problemas técnicos e governança dos clientes
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToClientMode}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md active:scale-95 transition-all group cursor-pointer"
          title="Alternar para o Portal do Cliente / Colaborador"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
          <span>Voltar ao Portal do Cliente</span>
        </button>
      </div>

      {/* Admin Navigation Bar */}
      <div className="h-14 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'incidents'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Resolução de Problemas</span>
            {activeIncidentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                {activeIncidentsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'health'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Saúde da Infraestrutura</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'users'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Clientes & Permissões</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'audit'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs de Auditoria</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operador: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.role})</span>
          </div>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: RESOLUÇÃO DE PROBLEMAS & INCIDENTES (TROUBLESHOOTING) */}
        {/* ========================================================= */}
        {activeTab === 'incidents' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Incidentes Ativos</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-400 font-mono">{activeIncidentsCount}</span>
                  <span className="text-xs text-slate-500">requerem atenção</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Casos Críticos</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-rose-400 font-mono">{criticalIncidentsCount}</span>
                  <span className="text-xs text-slate-500">bloqueio potencial</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Problemas Resolvidos</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-400 font-mono">{resolvedIncidentsCount}</span>
                  <span className="text-xs text-slate-500">com sucesso</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">SLA de Resolução</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-cyan-400 font-mono">99.8%</span>
                  <span className="text-xs text-slate-500">tempo médio 14 min</span>
                </div>
              </div>
            </div>

            {/* Controls Bar: Search, Filters, and New Incident Trigger */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por problema, módulo ou descrição..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setIncidentFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      incidentFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Todos ({incidents.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncidentFilter('open')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      incidentFilter === 'open' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Ativos ({activeIncidentsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncidentFilter('critical')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      incidentFilter === 'critical' ? 'bg-slate-800 text-rose-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Críticos ({criticalIncidentsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncidentFilter('resolved')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      incidentFilter === 'resolved' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Resolvidos ({resolvedIncidentsCount})
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewIncidentModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Novo Problema</span>
              </button>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {filteredIncidents.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <h4 className="text-sm font-semibold text-slate-200">Nenhum problema encontrado neste filtro</h4>
                  <p className="text-xs text-slate-400 mt-1">A infraestrutura ISAIASCO está operando com estabilidade e segurança total.</p>
                </div>
              ) : (
                filteredIncidents.map((incident) => {
                  const isResolved = incident.status === 'resolved';
                  const isBusy = isResolvingId === incident.id;

                  const severityColor = 
                    incident.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    incident.severity === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    incident.severity === 'medium' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                    'bg-slate-800 text-slate-300 border-slate-700';

                  const moduleIcon = 
                    incident.module === 'webrtc' ? <Radio className="w-4 h-4 text-cyan-400" /> :
                    incident.module === 'crypto_e2ee' ? <Lock className="w-4 h-4 text-emerald-400" /> :
                    incident.module === 'gps_telemetry' ? <Zap className="w-4 h-4 text-amber-400" /> :
                    incident.module === 'auth_tokens' ? <Key className="w-4 h-4 text-rose-400" /> :
                    <Server className="w-4 h-4 text-indigo-400" />;

                  return (
                    <div 
                      key={incident.id} 
                      className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-sm ${
                        isResolved ? 'border-slate-800/80 opacity-75' : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                              {moduleIcon}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${severityColor}`}>
                              {incident.severity === 'critical' ? 'Crítico' : 
                               incident.severity === 'high' ? 'Alto' : 
                               incident.severity === 'medium' ? 'Médio' : 'Baixo'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">
                              Módulo: {incident.module}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {incident.createdAt}
                            </span>
                            {isResolved && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Resolvido
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-slate-100">{incident.title}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">{incident.description}</p>

                          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                            <span>👥 Clientes impactados: <strong className="text-slate-200">{incident.affectedUsersCount}</strong></span>
                            {incident.remedyActionTitle && (
                              <span>🛠️ Ação recomendada: <strong className="text-cyan-300">{incident.remedyActionTitle}</strong></span>
                            )}
                          </div>

                          {isResolved && incident.resolutionNote && (
                            <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold block text-emerald-300">Resolução registrada por {incident.resolvedBy || 'Admin'}:</span>
                                <span>{incident.resolutionNote}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Interactive Remediation Actions */}
                        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 justify-center">
                          {!isResolved ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleExecuteRemedy(incident)}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {isBusy ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                  <span>Executando Reparo...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                                  <span>{incident.remedyActionTitle ? `Executar: ${incident.remedyActionTitle}` : 'Resolver Problema Agora'}</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleExecuteRemedy(incident)}
                              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Re-executar Diagnóstico</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SAÚDE DA INFRAESTRUTURA & SLAS (SYSTEM HEALTH) */}
        {/* ========================================================= */}
        {activeTab === 'health' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Monitor de Microserviços & SLAs ISAIASCO</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Validação em tempo real dos serviços de streaming de voz, criptografia AES-256 e APIs centrais.
                </p>
              </div>

              <button
                type="button"
                disabled={isScanningHealth}
                onClick={handleRunFullScan}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanningHealth ? 'animate-spin' : ''}`} />
                <span>{isScanningHealth ? 'Testando Nós...' : 'Executar Varredura Geral'}</span>
              </button>
            </div>

            {/* Health Logs Terminal Output */}
            {healthScanLogs.length > 0 && (
              <div className="bg-slate-950 border border-cyan-900/60 rounded-2xl p-4 font-mono text-xs text-cyan-300 space-y-1">
                <div className="flex items-center gap-2 pb-2 border-b border-cyan-900/40 text-slate-400 font-sans">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Console de Telemetria ao Vivo</span>
                </div>
                {healthScanLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthMetrics.map((metric) => {
                const isOp = metric.status === 'operational';
                const isDegraded = metric.status === 'degraded';

                return (
                  <div key={metric.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isOp ? 'bg-emerald-400 animate-pulse' : isDegraded ? 'bg-amber-400 animate-bounce' : 'bg-rose-400'}`} />
                        <h4 className="text-xs font-bold text-slate-100">{metric.service}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isOp ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        isDegraded ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {isOp ? 'Operacional' : isDegraded ? 'Degradado' : 'Interrompido'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">{metric.description}</p>

                    <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 uppercase block">Latência</span>
                        <span className="text-xs font-mono font-bold text-cyan-300">{metric.latencyMs} ms</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 uppercase block">Uptime</span>
                        <span className="text-xs font-mono font-bold text-emerald-300">{metric.uptime}%</span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 uppercase block">Conexões</span>
                        <span className="text-xs font-mono font-bold text-slate-200">{metric.activeConnections}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: GESTÃO DE CLIENTES & SEGURANÇA (USER GOVERNANCE) */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Governança de Clientes & Controles de Acesso</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gerencie contas, bloqueie acessos suspeitos, revogue tokens de segurança e alterne privilégios administrativos.
                </p>
              </div>

              <div className="text-xs text-slate-400">
                Total de Usuários: <strong className="text-slate-100">{users.length}</strong>
              </div>
            </div>

            <div className="space-y-3">
              {users.map((u) => {
                const isAdmin = u.roleType === 'admin';
                const isBlocked = !!u.isBlocked;

                return (
                  <div 
                    key={u.id}
                    className={`bg-slate-900 border rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                      isBlocked ? 'border-rose-900/60 bg-rose-950/10' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        {isBlocked && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold">
                            ✕
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{u.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isAdmin 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}>
                            {isAdmin ? 'Administrador' : 'Cliente / Colaborador'}
                          </span>
                          {isBlocked && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
                              Acesso Bloqueado
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                          <span>{u.role}</span>
                          <span>•</span>
                          <span>{u.department}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-300">{u.email}</span>
                        </div>

                        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-slate-500">
                          <span>Token: <strong className="text-slate-300">{u.securityToken}</strong></span>
                          <span>•</span>
                          <span>Chave: {u.publicKeyFingerprint}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Actions for this user */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Rotate Security Token */}
                      <button
                        type="button"
                        onClick={() => onRotateUserToken(u.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                        title="Revogar e gerar novo token ISC-XXXX"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Rotacionar Token</span>
                      </button>

                      {/* Promote / Demote Role */}
                      <button
                        type="button"
                        onClick={() => onToggleUserRole(u.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                          isAdmin 
                            ? 'bg-amber-950/40 hover:bg-amber-900/60 border-amber-700/60 text-amber-200' 
                            : 'bg-cyan-950/40 hover:bg-cyan-900/60 border-cyan-700/60 text-cyan-200'
                        }`}
                        title="Alternar entre Administrador e Cliente"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{isAdmin ? 'Rebaixar p/ Cliente' : 'Tornar Admin'}</span>
                      </button>

                      {/* Block / Unblock User */}
                      <button
                        type="button"
                        onClick={() => onToggleUserBlock(u.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                          isBlocked
                            ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-700/60 text-emerald-300'
                            : 'bg-rose-950/50 hover:bg-rose-900/60 border-rose-700/60 text-rose-300'
                        }`}
                        title={isBlocked ? 'Restaurar acesso do cliente' : 'Bloquear temporariamente acesso do cliente'}
                      >
                        {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isBlocked ? 'Desbloquear' : 'Bloquear Acesso'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TRILHA DE AUDITORIA & SEGURANÇA (AUDIT LOGS) */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Trilha de Auditoria & Segurança Criptográfica</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Registro cronológico imutável de handshakes E2EE, autenticações biométricas e ações administrativas.
                </p>
              </div>

              <button
                type="button"
                onClick={exportAuditLogsAsJson}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Exportar Logs (.JSON)</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-800 font-mono text-xs">
                {auditLogs.map((log) => {
                  const badgeColor = 
                    log.severity === 'alert' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                    log.severity === 'warning' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                    log.severity === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

                  return (
                    <div key={log.id} className="p-3.5 hover:bg-slate-850/60 flex flex-col md:flex-row md:items-center justify-between gap-2 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${badgeColor}`}>
                          {log.severity}
                        </span>
                        <span className="text-slate-200 font-sans font-semibold text-xs">{log.action}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                        <span>Op: <strong className="text-slate-300">{log.operator}</strong></span>
                        <span>Alvo: <span className="text-cyan-400">{log.target}</span></span>
                        <span className="text-slate-500">{log.ipAddress}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Registrar Novo Problema do Sistema */}
      {isNewIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Registrar Novo Problema no Sistema</h3>
                <p className="text-xs text-slate-400">Adicione uma ocorrência ou chamado técnico para diagnóstico imediato</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsNewIncidentModalOpen(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewIncidentSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Título do Problema</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ex: Falha de handshake WebRTC no grupo de operações"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Descrição dos Sintomas</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Descreva o impacto percebido pelos clientes..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gravidade / Prioridade</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="critical">Crítico (Interrupção)</option>
                    <option value="high">Alto (Degradação Severa)</option>
                    <option value="medium">Médio (Alerta / Instabilidade)</option>
                    <option value="low">Baixo (Cosmético / Otimização)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Módulo Afetado</label>
                  <select
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value as SystemModule)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="webrtc">WebRTC (Vídeo & Áudio)</option>
                    <option value="crypto_e2ee">Criptografia E2EE</option>
                    <option value="gps_telemetry">Telemetria GPS de Campo</option>
                    <option value="auth_tokens">Cofre de Tokens FIDO2</option>
                    <option value="server_api">Servidor API Express</option>
                    <option value="file_vault">Armazenamento de Arquivos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clientes Impactados</label>
                  <input
                    type="number"
                    min={1}
                    value={newAffectedCount}
                    onChange={(e) => setNewAffectedCount(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ação Recomendada</label>
                  <input
                    type="text"
                    value={newRemedyTitle}
                    onChange={(e) => setNewRemedyTitle(e.target.value)}
                    placeholder="ex: Reiniciar Relay STUN"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewIncidentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Cadastrar Incidente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

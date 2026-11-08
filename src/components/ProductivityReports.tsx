import React, { useState } from 'react';
import { 
  BarChart3, Sparkles, TrendingUp, Download, Printer, 
  CheckCircle, ShieldCheck, Clock, FileText, MessageSquare, 
  Radio, Users, RefreshCw 
} from 'lucide-react';
import { WeeklyReport } from '../types';

interface ProductivityReportsProps {
  reports: WeeklyReport[];
  onGenerateReportWithAi: () => Promise<void>;
  isGeneratingAi: boolean;
}

export const ProductivityReports: React.FC<ProductivityReportsProps> = ({
  reports,
  onGenerateReportWithAi,
  isGeneratingAi,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const report = reports.find(r => r.id === selectedReportId) || reports[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `ISAIASCO_Relatorio_${report.weekRange.replace(/\s+/g, '_')}.json`);
    dlAnchorElem.click();
  };

  if (!report) {
    return <div className="p-8 text-center text-slate-400">Nenhum relatório encontrado.</div>;
  }

  const { stats } = report;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Relatórios Automáticos de Produtividade & Operações
              <span className="text-[10px] font-mono text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                Fechamento Semanal
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Consolidação de telemetria, comunicação interna e trabalho de campo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors"
            title="Exportar dados estruturados JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Exportar JSON</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition-colors"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>

          <button
            type="button"
            onClick={onGenerateReportWithAi}
            disabled={isGeneratingAi}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
            title="Gerar análise e síntese executiva com inteligência artificial"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processando IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Análise IA da Semana</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Week Selector Tab Bar */}
      <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center gap-3 shrink-0">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Período Selecionado:
        </span>
        <div className="flex items-center gap-2">
          {reports.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedReportId(r.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                selectedReportId === r.id
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.weekRange}
            </button>
          ))}
        </div>
      </div>

      {/* Main Report Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* KPI Score Cards Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Mensagens E2EE
            </span>
            <p className="text-xl font-bold font-mono text-slate-100">{stats.totalMessages.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-400 font-mono">+14% vs anterior</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-cyan-400" /> Áudios Gravados
            </span>
            <p className="text-xl font-bold font-mono text-slate-100">{stats.audioNotes}</p>
            <span className="text-[10px] text-emerald-400 font-mono">100% Criptografados</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" /> Arquivos Seguros
            </span>
            <p className="text-xl font-bold font-mono text-slate-100">{stats.filesShared}</p>
            <span className="text-[10px] text-cyan-400 font-mono">Zero vazamentos</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Vídeo em Grupo
            </span>
            <p className="text-xl font-bold font-mono text-slate-100">{stats.totalCallsDurationMinutes} min</p>
            <span className="text-[10px] text-emerald-400 font-mono">{stats.videoMeetings} reuniões</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Check-ins Campo
            </span>
            <p className="text-xl font-bold font-mono text-slate-100">{stats.fieldCheckins}</p>
            <span className="text-[10px] text-emerald-400 font-mono">{stats.routesCompleted} rotas feitas</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1 bg-gradient-to-br from-slate-900 to-cyan-950/30">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Score Equipe
            </span>
            <p className="text-xl font-bold font-mono text-cyan-300">{report.collaborationScore}%</p>
            <span className="text-[10px] text-cyan-400 font-mono">Nível Excelente</span>
          </div>
        </div>

        {/* Executive Overview Section */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">{report.title}</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Emitido em {report.generatedAt}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {report.executiveOverview}
          </p>
        </div>

        {/* Two-Column Grid: Key Achievements vs Tactical Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Achievements */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Principais Conquistas & Marcos Semanais
            </h4>
            <div className="space-y-2">
              {report.keyAchievements.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="text-cyan-400 font-mono text-[11px] mt-0.5">0{idx + 1}.</span>
                  <p className="leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Recommendations */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recomendações Táticas para a Próxima Semana
            </h4>
            <div className="space-y-2">
              {report.tacticalRecommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <span className="text-amber-400 font-mono text-[11px] mt-0.5">→</span>
                  <p className="leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Departmental Metrics Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Desempenho por Departamento Operacional
            </h4>
            <span className="text-xs font-mono text-cyan-400">4 Departamentos Auditados</span>
          </div>

          <div className="divide-y divide-slate-800">
            {report.departmentalInsights.map((dept, idx) => (
              <div key={idx} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-850/50 transition-colors text-xs">
                <div>
                  <p className="font-semibold text-slate-200">{dept.dept}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{dept.metric}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  dept.status === 'Excelente' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                }`}>
                  {dept.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

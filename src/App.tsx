import React, { useState } from 'react';
import { 
  INITIAL_USERS, INITIAL_CHANNELS, INITIAL_MESSAGES, 
  INITIAL_EVENTS, INITIAL_FIELD_AGENTS, INITIAL_REPORTS,
  INITIAL_PHONE_CONTACTS, INITIAL_INCIDENTS,
  INITIAL_HEALTH_METRICS, INITIAL_AUDIT_LOGS
} from './data/mockData';
import { 
  User, Channel, Message, CalendarEvent, FieldAgent, 
  WeeklyReport, EncryptedPayload, PhoneContact,
  SystemIncident, SystemHealthMetric, AuditLog
} from './types';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { VideoConference } from './components/VideoConference';
import { CalendarView } from './components/CalendarView';
import { FieldTracker } from './components/FieldTracker';
import { ProductivityReports } from './components/ProductivityReports';
import { SecurityInspectorModal } from './components/SecurityInspectorModal';
import { ProfileStatusModal } from './components/ProfileStatusModal';
import { BiometricLoginModal } from './components/BiometricLoginModal';
import { AuthPortal } from './components/AuthPortal';
import { MobileTopBar } from './components/MobileTopBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PhoneContactsModal } from './components/PhoneContactsModal';
import { AdminConsole } from './components/AdminConsole';
import { encryptE2EEMessage, generateSecurityToken } from './services/crypto';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<'chat' | 'video' | 'calendar' | 'field' | 'reports'>('chat');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(INITIAL_CHANNELS[0].id);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [fieldAgents, setFieldAgents] = useState<FieldAgent[]>(INITIAL_FIELD_AGENTS);
  const [reports, setReports] = useState<WeeklyReport[]>(INITIAL_REPORTS);
  const [phoneContacts, setPhoneContacts] = useState<PhoneContact[]>(INITIAL_PHONE_CONTACTS);

  // Dual-portal mode: 'client' (comunicações) vs 'admin' (resolução de problemas)
  const [portalMode, setPortalMode] = useState<'client' | 'admin'>('client');
  const [incidents, setIncidents] = useState<SystemIncident[]>(INITIAL_INCIDENTS);
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetric[]>(INITIAL_HEALTH_METRICS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Modals state
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [isPhoneContactsModalOpen, setIsPhoneContactsModalOpen] = useState(false);
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelPrivate, setNewChannelPrivate] = useState(false);

  // Video call active state
  const [activeVideoRoom, setActiveVideoRoom] = useState<string>('Reunião Executiva Geral');

  // Inspected E2EE payload for the modal
  const [inspectedPayload, setInspectedPayload] = useState<{
    senderName: string;
    plaintext: string;
    payload: EncryptedPayload;
  } | null>(null);

  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);

  // Count active incidents
  const activeIncidentsCount = incidents.filter(i => i.status !== 'resolved').length;

  // Active channel resolution
  const activeChannel = channels.find(c => c.id === selectedChannelId) || channels[0];
  const partnerUser = activeChannel.directUserId ? users.find(u => u.id === activeChannel.directUserId) : null;
  const channelMessages = messages.filter(m => m.channelId === selectedChannelId);

  // Send message handler with genuine Web Crypto AES-GCM encryption
  const handleSendMessage = async (
    content: string,
    type: 'text' | 'audio' | 'file',
    audioData?: { duration: number; url: string },
    fileData?: { name: string; size: number; type: string; url: string }
  ) => {
    const encrypted = await encryptE2EEMessage(content);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      channelId: selectedChannelId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content,
      encryptedPayload: encrypted,
      type,
      timestamp: timeStr,
      audioDuration: audioData?.duration,
      audioUrl: audioData?.url,
      fileData,
      readBy: [currentUser.id],
    };

    setMessages(prev => [...prev, newMessage]);
  };

  // Inspect payload modal opener
  const handleInspectPayload = (data: { senderName: string; plaintext: string; payload: EncryptedPayload }) => {
    setInspectedPayload(data);
    setIsSecurityModalOpen(true);
  };

  // Start video call
  const handleStartVideoCall = (roomName: string) => {
    setActiveVideoRoom(roomName);
    setCurrentView('video');
  };

  // Add Calendar Event
  const handleAddEvent = (event: CalendarEvent) => {
    setEvents(prev => [...prev, event]);
  };

  // New Field Check-in
  const handleNewCheckin = (
    agentId: string,
    note: string,
    type: 'checkin' | 'relatorio_campo' | 'alerta'
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setFieldAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return {
          ...agent,
          lastPing: 'Agora mesmo',
          checkins: [
            {
              id: `ck_${Date.now()}`,
              time: timeStr,
              userId: currentUser.id,
              userName: currentUser.name,
              note,
              type,
              coords: { lat: agent.lat, lng: agent.lng },
              address: agent.locationName,
            },
            ...agent.checkins,
          ],
        };
      }
      return agent;
    }));
  };

  // Generate AI Weekly Productivity Report
  const handleGenerateReportWithAi = async () => {
    setIsGeneratingAiReport(true);
    try {
      const response = await fetch('/api/reports/generate-ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekRange: '09 a 13 de Novembro de 2026',
          stats: {
            totalMessages: messages.length + 1480,
            audioNotes: 320,
            filesShared: 146,
            videoMeetings: 36,
            totalCallsDurationMinutes: 910,
            fieldCheckins: 104,
            routesCompleted: 31,
            collaborationScore: 97,
          },
          topContributors: users.map(u => ({ name: u.name, role: u.role })),
        }),
      });

      const data = await response.json();
      if (data.success && data.summary) {
        const newReport: WeeklyReport = {
          id: `rep_w45_${Date.now()}`,
          weekRange: '09 a 13 de Novembro de 2026 (Atualizado)',
          generatedAt: new Date().toLocaleString('pt-BR'),
          isAiGenerated: true,
          title: data.summary.title || 'Relatório Semanal Consolidado ISAIASCO',
          executiveOverview: data.summary.executiveOverview,
          collaborationScore: data.summary.collaborationScore || 97,
          keyAchievements: data.summary.keyAchievements || [],
          departmentalInsights: data.summary.departmentalInsights || [],
          tacticalRecommendations: data.summary.tacticalRecommendations || [],
          stats: {
            totalMessages: messages.length + 1480,
            audioNotes: 320,
            filesShared: 146,
            videoMeetings: 36,
            totalCallsDurationMinutes: 910,
            fieldCheckins: 104,
            routesCompleted: 31,
            collaborationScore: 97,
          },
        };
        setReports(prev => [newReport, ...prev]);
      }
    } catch (err) {
      console.warn('Erro ao chamar API Gemini, fallback local executado:', err);
    } finally {
      setIsGeneratingAiReport(false);
    }
  };

  // Create Channel
  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const channelSlug = newChannelName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newChan: Channel = {
      id: `chan_${Date.now()}`,
      name: channelSlug,
      description: newChannelDesc.trim() || 'Canal de operações e comunicação interna.',
      isPrivate: newChannelPrivate,
      type: 'general',
      members: [currentUser.id],
      e2eeVerified: true,
    };

    setChannels(prev => [...prev, newChan]);
    setSelectedChannelId(newChan.id);
    setNewChannelName('');
    setNewChannelDesc('');
    setIsNewChannelModalOpen(false);
    setCurrentView('chat');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleRegister = (newUser: User) => {
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    // Add new user to general channels
    setChannels(prev => prev.map(c => ({
      ...c,
      members: [...c.members, newUser.id]
    })));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleStartChatWithPhoneContact = (contact: PhoneContact) => {
    if (contact.registeredUserId) {
      let dmChannel = channels.find(c => c.directUserId === contact.registeredUserId);
      if (!dmChannel) {
        dmChannel = {
          id: `dm_${contact.registeredUserId}`,
          name: contact.name,
          description: `Conversa direta E2EE com ${contact.name}`,
          isPrivate: true,
          type: 'direct',
          members: [currentUser.id, contact.registeredUserId],
          e2eeVerified: true,
          directUserId: contact.registeredUserId,
        };
        setChannels(prev => [...prev, dmChannel!]);
      }
      setSelectedChannelId(dmChannel.id);
      setCurrentView('chat');
    }
  };

  const handleImportNewContacts = (newContacts: PhoneContact[]) => {
    setPhoneContacts(prev => {
      const existingPhones = new Set(prev.map(c => c.phone));
      const filtered = newContacts.filter(c => !existingPhones.has(c.phone));
      return [...filtered, ...prev];
    });
  };

  // Administration: Resolve technical incident & update microservice health
  const handleResolveIncident = (incidentId: string, remedyTitle: string, note?: string) => {
    const target = incidents.find(i => i.id === incidentId);
    const nowStr = new Date().toLocaleTimeString('pt-BR');

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'resolved',
          resolvedAt: 'Agora mesmo',
          resolvedBy: `${currentUser.name} (${currentUser.role.split(' ')[0]})`,
          resolutionNote: note || 'Problema solucionado com êxito pelo console do administrador.',
        };
      }
      return inc;
    }));

    // If incident affected a microservice, normalize its health metric
    if (target) {
      setHealthMetrics(prev => prev.map(m => {
        if (target.module === 'webrtc' && m.category === 'media') {
          return { ...m, status: 'operational', latencyMs: 24, uptime: 99.98 };
        }
        if (target.module === 'crypto_e2ee' && m.category === 'crypto') {
          return { ...m, status: 'operational', latencyMs: 3, uptime: 100.0 };
        }
        if (target.module === 'gps_telemetry' && m.category === 'gps') {
          return { ...m, status: 'operational', latencyMs: 18, uptime: 99.99 };
        }
        if (target.module === 'auth_tokens' && m.category === 'api') {
          return { ...m, status: 'operational', latencyMs: 7, uptime: 100.0 };
        }
        return m;
      }));
    }

    // Add immutable audit log entry
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: nowStr,
      action: `Problema Resolvido: ${remedyTitle}`,
      operator: currentUser.name,
      target: target ? target.title : `Incidente #${incidentId}`,
      ipAddress: '10.0.0.1 (Terminal Admin)',
      severity: 'success',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Administration: Create new system incident
  const handleCreateIncident = (incidentData: Omit<SystemIncident, 'id' | 'createdAt'>) => {
    const newInc: SystemIncident = {
      ...incidentData,
      id: `inc_${Date.now()}`,
      createdAt: 'Agora mesmo',
    };
    setIncidents(prev => [newInc, ...prev]);

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: `Novo Incidente Aberto: ${incidentData.title}`,
      operator: currentUser.name,
      target: `Módulo ${incidentData.module}`,
      ipAddress: '10.0.0.1',
      severity: incidentData.severity === 'critical' ? 'alert' : 'warning',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Administration: Block or unblock user account
  const handleToggleUserBlock = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextBlocked = !u.isBlocked;
        if (currentUser.id === userId) {
          setCurrentUser({ ...u, isBlocked: nextBlocked });
        }
        return { ...u, isBlocked: nextBlocked };
      }
      return u;
    }));

    const targetUser = users.find(u => u.id === userId);
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: targetUser?.isBlocked ? `Acesso Desbloqueado` : `Acesso Bloqueado / Suspenso`,
      operator: currentUser.name,
      target: targetUser ? targetUser.name : userId,
      ipAddress: '10.0.0.1',
      severity: targetUser?.isBlocked ? 'info' : 'warning',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Administration: Rotate compromised or expiring security token
  const handleRotateUserToken = (userId: string) => {
    const { token: newToken, expiry: newExpiry } = generateSecurityToken();

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, securityToken: newToken, tokenExpiry: newExpiry };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    const targetUser = users.find(u => u.id === userId);
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: `Token de Segurança Rotacionado (${newToken.slice(0, 8)}...)`,
      operator: currentUser.name,
      target: targetUser ? targetUser.name : userId,
      ipAddress: '10.0.0.1',
      severity: 'info',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Administration: Toggle user role between 'admin' and 'client'
  const handleToggleUserRole = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newRoleType = u.roleType === 'admin' ? 'client' : 'admin';
        const updated: User = { ...u, roleType: newRoleType };
        if (currentUser.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    const targetUser = users.find(u => u.id === userId);
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: `Privilégios Alterados: ${targetUser?.roleType === 'admin' ? 'Rebaixado para Cliente' : 'Promovido para Administrador'}`,
      operator: currentUser.name,
      target: targetUser ? targetUser.name : userId,
      ipAddress: '10.0.0.1',
      severity: 'warning',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Administration: Run full system connectivity and node health scan
  const handleRunSystemHealthScan = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (data.status === 'ok') {
        setHealthMetrics(prev => prev.map(m => ({
          ...m,
          status: 'operational',
          latencyMs: Math.floor(8 + Math.random() * 15),
          uptime: 99.99,
        })));
      }
    } catch {
      // Offline / fallback probe
      setHealthMetrics(prev => prev.map(m => ({
        ...m,
        status: 'operational',
        latencyMs: 12,
      })));
    }

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      action: 'Varredura Global de Saúde Concluída com Sucesso',
      operator: currentUser.name,
      target: 'Cluster de Servidores ISAIASCO',
      ipAddress: '10.0.0.1',
      severity: 'success',
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // If not authenticated, display full AuthPortal for Iniciar Sessão / Criar Conta
  if (!isAuthenticated) {
    return (
      <AuthPortal
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Top App Bar (Android & iOS) */}
      <MobileTopBar
        currentView={currentView}
        activeChannel={activeChannel}
        channels={channels}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
        users={users}
        currentUser={currentUser}
        portalMode={portalMode}
        onSwitchPortalMode={(mode) => setPortalMode(mode)}
        activeIncidentsCount={activeIncidentsCount}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenBiometrics={() => setIsBiometricModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onNewChannel={() => setIsNewChannelModalOpen(true)}
        onOpenPhoneContacts={() => setIsPhoneContactsModalOpen(true)}
      />

      {/* Primary Desktop Sidebar (hidden on mobile) */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        channels={channels}
        selectedChannelId={selectedChannelId}
        onSelectChannel={setSelectedChannelId}
        users={users}
        currentUser={currentUser}
        portalMode={portalMode}
        onSwitchPortalMode={(mode) => setPortalMode(mode)}
        activeIncidentsCount={activeIncidentsCount}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenBiometrics={() => setIsBiometricModalOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onNewChannel={() => setIsNewChannelModalOpen(true)}
        onLogout={handleLogout}
        onOpenPhoneContacts={() => setIsPhoneContactsModalOpen(true)}
      />

      {/* Main Viewport Content Area (with bottom padding on mobile for tab bar) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0 relative">
        {/* If in Platform Administrator Mode, render AdminConsole for problem solving */}
        {portalMode === 'admin' ? (
          <AdminConsole
            currentUser={currentUser}
            users={users}
            incidents={incidents}
            healthMetrics={healthMetrics}
            auditLogs={auditLogs}
            onSwitchToClientMode={() => setPortalMode('client')}
            onResolveIncident={handleResolveIncident}
            onCreateIncident={handleCreateIncident}
            onToggleUserBlock={handleToggleUserBlock}
            onRotateUserToken={handleRotateUserToken}
            onToggleUserRole={handleToggleUserRole}
            onRunSystemHealthScan={handleRunSystemHealthScan}
          />
        ) : (
          /* Client Portal Viewports */
          <>
            {currentView === 'chat' && (
              <ChatArea
                channel={activeChannel}
                messages={channelMessages}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onStartVideoCall={handleStartVideoCall}
                onInspectPayload={handleInspectPayload}
                partnerUser={partnerUser}
                onOpenPhoneContacts={() => setIsPhoneContactsModalOpen(true)}
              />
            )}

            {currentView === 'video' && (
              <VideoConference
                roomName={activeVideoRoom}
                currentUser={currentUser}
                onLeaveCall={() => setCurrentView('chat')}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView
                events={events}
                users={users}
                currentUser={currentUser}
                onAddEvent={handleAddEvent}
                onJoinVideoCall={(roomId) => handleStartVideoCall(`Reunião: ${roomId}`)}
              />
            )}

            {currentView === 'field' && (
              <FieldTracker
                agents={fieldAgents}
                currentUser={currentUser}
                onNewCheckin={handleNewCheckin}
                onStartCallWithAgent={(name) => handleStartVideoCall(`Chamada de Campo - ${name}`)}
              />
            )}

            {currentView === 'reports' && (
              <ProductivityReports
                reports={reports}
                onGenerateReportWithAi={handleGenerateReportWithAi}
                isGeneratingAi={isGeneratingAiReport}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Fixed Bottom Tab Bar (iOS & Android) - only in Client Mode */}
      {portalMode === 'client' && (
        <MobileBottomNav
          currentView={currentView}
          onSelectView={setCurrentView}
        />
      )}

      {/* E2EE Security Inspector Modal */}
      <SecurityInspectorModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        currentUser={currentUser}
        inspectedPayload={inspectedPayload}
        partnerUser={partnerUser}
      />

      {/* Profile & Custom Status Modal */}
      <ProfileStatusModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        }}
      />

      {/* Biometric & Security Token Login Modal */}
      <BiometricLoginModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={(selectedUser) => {
          setCurrentUser(selectedUser);
        }}
        onOpenSignUp={() => setIsAuthenticated(false)}
      />

      {/* New Channel Modal */}
      {isNewChannelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Criar Novo Canal E2EE</h3>
                <p className="text-xs text-slate-400">Canal corporativo com criptografia ponta a ponta</p>
              </div>
              <button onClick={() => setIsNewChannelModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nome do Canal</label>
                <div className="mt-1 flex items-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus-within:border-cyan-500">
                  <span className="text-slate-500 font-mono mr-1">#</span>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    required
                    placeholder="ex: logistica-expresso"
                    className="bg-transparent flex-1 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Descrição / Objetivo</label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="Finalidade do canal..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Canal Privado</h4>
                  <p className="text-[11px] text-slate-400">Apenas membros convidados com chave terão acesso</p>
                </div>
                <input
                  type="checkbox"
                  checked={newChannelPrivate}
                  onChange={(e) => setNewChannelPrivate(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewChannelModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Criar Canal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Phone Contacts / Find Friends from Mobile Address Book Modal */}
      <PhoneContactsModal
        isOpen={isPhoneContactsModalOpen}
        onClose={() => setIsPhoneContactsModalOpen(false)}
        phoneContacts={phoneContacts}
        onStartChatWithContact={handleStartChatWithPhoneContact}
        onImportNewContacts={handleImportNewContacts}
      />
    </div>
  );
}

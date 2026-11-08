import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, Video, MapPin, 
  Plus, Download, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import { CalendarEvent, User } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  users: User[];
  currentUser: User;
  onAddEvent: (event: CalendarEvent) => void;
  onJoinVideoCall: (roomId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  users,
  currentUser,
  onAddEvent,
  onJoinVideoCall,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-11-09');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-11-11');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [eventType, setEventType] = useState<'meeting' | 'field_op' | 'review' | '1on1'>('meeting');
  const [location, setLocation] = useState('Sala Virtual E2EE #02');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([currentUser.id]);

  const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const dates = [
    { label: '09 Nov', date: '2026-11-09', dayName: 'Seg' },
    { label: '10 Nov', date: '2026-11-10', dayName: 'Ter' },
    { label: '11 Nov', date: '2026-11-11', dayName: 'Qua' },
    { label: '12 Nov', date: '2026-11-12', dayName: 'Qui' },
    { label: '13 Nov', date: '2026-11-13', dayName: 'Sex' },
    { label: '14 Nov', date: '2026-11-14', dayName: 'Sáb' },
    { label: '15 Nov', date: '2026-11-15', dayName: 'Dom' },
  ];

  const filteredEvents = events.filter(e => e.date === selectedDate);

  const handleExportICS = (event: CalendarEvent) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ISAIASCO//Corporate Calendar E2EE//PT-BR
BEGIN:VEVENT
UID:${event.id}@isaiasco.internal
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.date.replace(/-/g, '')}T${event.startTime.replace(':', '')}00
DTEND:${event.date.replace(/-/g, '')}T${event.endTime.replace(':', '')}00
SUMMARY:${event.title}
DESCRIPTION:${event.description}\\nSala E2EE: ${event.videoRoomId || 'N/A'}
LOCATION:${event.location || 'ISAIASCO Digital Hub'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent: CalendarEvent = {
      id: `ev_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      date,
      startTime,
      endTime,
      type: eventType,
      attendees: selectedAttendees,
      videoRoomId: `sala-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      location,
      isE2eeProtected: true,
    };

    onAddEvent(newEvent);
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Calendar Bar */}
      <div className="h-14 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              ISAIASCO Corporate Calendar
              <span className="text-[10px] font-mono text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                Sincronização E2EE & .ICS
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Semana Operacional de 09 a 15 de Novembro de 2026</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Agendar Reunião</span>
        </button>
      </div>

      {/* Week Day Selector Strip */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/40 flex items-center gap-2 overflow-x-auto shrink-0">
        {dates.map(d => {
          const isSelected = selectedDate === d.date;
          const dayCount = events.filter(e => e.date === d.date).length;
          return (
            <button
              key={d.date}
              type="button"
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-col items-center justify-center min-w-[85px] py-2 px-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-500 text-slate-100 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">{d.dayName}</span>
              <span className="text-sm font-bold mt-0.5">{d.label.split(' ')[0]}</span>
              {dayCount > 0 && (
                <span className="mt-1 text-[10px] font-mono text-cyan-400 font-semibold">
                  {dayCount} {dayCount === 1 ? 'evento' : 'eventos'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Agenda View */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Agenda do Dia ({selectedDate})
          </h3>
          <span className="text-xs font-mono text-cyan-400">
            {filteredEvents.length} compromissos corporativos
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl space-y-3">
            <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">Nenhum evento agendado para esta data.</p>
            <button
              type="button"
              onClick={() => {
                setDate(selectedDate);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 rounded-lg transition-colors"
            >
              Agendar Reunião ou Despacho
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        event.type === 'field_op' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        event.type === 'review' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                        'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}>
                        {event.type === 'field_op' ? 'Operação de Campo' : event.type === 'review' ? 'Auditoria' : 'Videoconferência'}
                      </span>
                      {event.isE2eeProtected && (
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> E2EE
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 mt-1">{event.title}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportICS(event)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    title="Exportar para Google Calendar / Outlook (.ics)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate max-w-[180px]">{event.location}</span>
                  </div>
                </div>

                {/* Attendees list */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    {event.attendees.map(attendeeId => {
                      const user = users.find(u => u.id === attendeeId);
                      if (!user) return null;
                      return (
                        <img
                          key={user.id}
                          src={user.avatarUrl}
                          alt={user.name}
                          title={user.name}
                          className="w-7 h-7 rounded-full border-2 border-slate-900 object-cover"
                        />
                      );
                    })}
                  </div>

                  {event.videoRoomId && (
                    <button
                      type="button"
                      onClick={() => onJoinVideoCall(event.videoRoomId!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Entrar na Chamada</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100">Agendar Compromisso Corporativo</h3>
                <p className="text-xs text-slate-400">Integração com calendário e sala de vídeo criptografada</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Título da Reunião</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Alinhamento Tático de Despacho"
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Início</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Término</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tipo de Evento</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {(['meeting', 'field_op', 'review', '1on1'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEventType(t)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        eventType === t
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t === 'meeting' ? 'Reunião' : t === 'field_op' ? 'Campo' : t === 'review' ? 'Auditoria' : '1-on-1'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Local / Sala E2EE</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Descrição / Pauta</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Itens a serem abordados na reunião..."
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Salvar na Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

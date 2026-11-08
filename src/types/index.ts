export type UserStatusType = 'online' | 'busy' | 'meeting' | 'field' | 'away' | 'dnd';

export interface UserStatus {
  type: UserStatusType;
  customText: string;
  emoji: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  avatarUrl: string;
  status: UserStatus;
  securityToken: string;
  tokenExpiry: string;
  biometricEnabled: boolean;
  publicKeyFingerprint: string;
  phone?: string;
  isCurrentUser?: boolean;
  roleType?: 'client' | 'admin';
  isBlocked?: boolean;
  location?: {
    lat: number;
    lng: number;
    locationName: string;
    speedKmH: number;
    batteryLevel: number;
    lastUpdate: string;
    isLiveSharing: boolean;
  };
}

export interface PhoneContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isRegistered: boolean;
  registeredUserId?: string;
  avatarUrl?: string;
}

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
  algorithm: string;
  keyFingerprint: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  encryptedPayload: EncryptedPayload;
  type: 'text' | 'audio' | 'file' | 'system';
  timestamp: string;
  audioDuration?: number;
  audioUrl?: string;
  fileData?: {
    name: string;
    size: number;
    type: string;
    url: string;
  };
  readBy: string[];
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  type: 'general' | 'operations' | 'engineering' | 'direct';
  members: string[];
  e2eeVerified: boolean;
  unreadCount?: number;
  directUserId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'meeting' | 'field_op' | 'review' | '1on1';
  attendees: string[];
  videoRoomId?: string;
  location?: string;
  isE2eeProtected: boolean;
}

export interface FieldCheckin {
  id: string;
  time: string;
  userId: string;
  userName: string;
  note: string;
  type: 'checkin' | 'relatorio_campo' | 'alerta';
  coords: { lat: number; lng: number };
  address: string;
}

export interface FieldAgent {
  id: string;
  userId: string;
  name: string;
  role: string;
  avatarUrl: string;
  status: 'in_transit' | 'on_site' | 'idle' | 'checkpoint';
  lat: number;
  lng: number;
  locationName: string;
  battery: number;
  speed: number;
  lastPing: string;
  assignedRoute: string;
  checkins: FieldCheckin[];
}

export interface ProductivityStats {
  totalMessages: number;
  audioNotes: number;
  filesShared: number;
  videoMeetings: number;
  totalCallsDurationMinutes: number;
  fieldCheckins: number;
  routesCompleted: number;
  collaborationScore: number;
}

export interface WeeklyReport {
  id: string;
  weekRange: string;
  generatedAt: string;
  isAiGenerated: boolean;
  title: string;
  executiveOverview: string;
  keyAchievements: string[];
  collaborationScore: number;
  departmentalInsights: {
    dept: string;
    metric: string;
    status: string;
  }[];
  tacticalRecommendations: string[];
  stats: ProductivityStats;
}

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type SystemModule = 'webrtc' | 'crypto_e2ee' | 'gps_telemetry' | 'auth_tokens' | 'server_api' | 'file_vault';

export interface SystemIncident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  module: SystemModule;
  affectedUsersCount: number;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  remedyActionTitle?: string;
  resolutionNote?: string;
}

export interface SystemHealthMetric {
  id: string;
  service: string;
  category: 'api' | 'crypto' | 'media' | 'gps' | 'database';
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number;
  uptime: number; // e.g. 99.98
  activeConnections: number;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  operator: string;
  target: string;
  ipAddress: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
}

// Durable Object state types

import type { Event } from './analytics';
import type { DeviceInfo } from './common';
import type { StatsFilter } from './dashboard';

export { Event, DeviceInfo, StatsFilter };

export interface SessionState {
  id: string;
  visitorId: string;
  visitId: string;
  firstSeen: Date;
  lastSeen: Date;
  lastActivity: number; // timestamp
  pageViews: number;
  events: Event[];
  visitCount: number;
  deviceInfo: DeviceInfo;
  isBounce: boolean;
  totalEngagementTime: number;
  lastHeartbeat: number;
}

export interface HourlyStatsState {
  hour: string; // "2025-01-31T14:00:00"
  views: number;
  visits: Set<string>;
  visitors: Set<string>;
  bounceCount: number;
  totalDuration: number;
  customEvents: number;
}

export interface WebSocketClient {
  ws: WebSocket;
  clientId: string;
  connectedAt: Date;
  lastPing: number;
  filters?: StatsFilter;
}

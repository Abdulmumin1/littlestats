// Common/shared types

export interface DeviceInfo {
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  device: 'desktop' | 'mobile' | 'tablet' | null;
  screen: string | null;
  language: string | null;
  timezone: string | null;
  country: string | null;
}

// Legacy user agent parsing type for compatibility
export interface ParsedUserAgent {
  name: string;
  version: string;
  engine: string;
  isPrivate: boolean;
  isMobile: boolean;
  platform: string;
}

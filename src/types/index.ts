// Channel type from DaddyLive API
export interface Channel {
  channel_name: string;
  channel_id: string;
  logo_url?: string;
}

// Event/Match type from DaddyLive API
export interface Event {
  time: string;
  event: string;
  channels: Channel[];
  channels2?: Channel[];
}

// Schedule structure - day headers as keys, categories as values
export interface DaySchedule {
  [category: string]: Event[];
}

export interface Schedule {
  [day: string]: DaySchedule;
}

// API Response types
export interface ChannelsApiResponse {
  success: boolean;
  data?: Channel[];
  count?: number;
  error?: string;
  message?: string;
}

export interface ScheduleApiResponse {
  success: boolean;
  data?: Schedule;
  days_count?: number;
  error?: string;
  message?: string;
}

// Parsed match for UI display
export interface Match {
  id: string;
  time: string;
  title: string;
  competition: string;
  channels: Channel[];
  isLive: boolean;
  startsIn?: string;
}

// Category filter
export interface Category {
  name: string;
  count: number;
  icon?: string;
}

// Player folders supported by DaddyLive
export const PLAYER_FOLDERS = ['stream', 'cast', 'watch', 'plus', 'casting', 'player'] as const;
export type PlayerFolder = typeof PLAYER_FOLDERS[number];

// Base URL for DaddyLive
export const DADDYLIVE_BASE_URL = 'https://dlhd.link';

// Helper to construct stream URL
export function getStreamUrl(channelId: string, folder: PlayerFolder = 'stream'): string {
  return `${DADDYLIVE_BASE_URL}/${folder}/stream-${channelId}.php`;
}

// Helper to get logo URL
export function getLogoUrl(logoPath: string | undefined): string {
  if (!logoPath) return '/placeholder-channel.png';
  if (logoPath.startsWith('http')) return logoPath;
  return `${DADDYLIVE_BASE_URL}/${logoPath}`;
}

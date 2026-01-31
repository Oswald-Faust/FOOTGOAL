import { Schedule, Channel, Match, Event } from '@/types';
import { SportWatchScraper } from './sportwatch';
import { SportsWatcherScraper } from './sportswatcher';

// Fetch schedule from SportWatch
export async function fetchSchedule(category: string = 'Soccer'): Promise<Schedule | null> {
  try {
    if (category === 'Football 2') {
      console.log('[API] Check SportsWatcher scraper...');
      const swData = await SportsWatcherScraper.getSchedule();
      if (swData && Object.keys(swData).length > 0) return swData;
    }

    console.log('[API] Attempting to scrape SportWatch...');
    const scrapedData = await SportWatchScraper.getSchedule();
    
    if (scrapedData && Object.keys(scrapedData).length > 0) {
      console.log('[API] Successfully scraped schedule data');
      return scrapedData;
    }
    
    // Fallback Mock
    console.warn('[API] Scraper failed. Using Mock Data.');
    return getMockSchedule();
    
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return getMockSchedule();
  }
}

// Fetch channels (Legacy support)
export async function fetchChannels(): Promise<Channel[] | null> {
   return []; 
}

// Parse schedule into match list
export function parseScheduleToMatches(
  schedule: Schedule,
  category: string = 'Soccer',
  currentTime?: Date
): Match[] {
  const now = currentTime || new Date();
  const matches: Match[] = [];

  for (const [day, categories] of Object.entries(schedule)) {
    // If our category is 'Soccer', we just grab it. 
    const evts = categories[category] || categories['Soccer'] || [];
    
    for (const event of evts) {
        const match = eventToMatch(event, day, category, now);
        matches.push(match);
    }
  }

  return matches.sort((a, b) => {
    const timeA = parseTimeToMinutes(a.time);
    const timeB = parseTimeToMinutes(b.time);
    return timeA - timeB;
  });
}

function eventToMatch(event: Event, day: string, category: string, now: Date): Match {
  const [hours, minutes] = event.time.split(':').map(Number);
  
  const matchTime = new Date(now);
  matchTime.setHours(hours, minutes, 0, 0);
  
  const diffMs = matchTime.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  // Use a wider window for "isLive" since times might be approximate or "LIVE"
  const isLive = diffMinutes <= 0 && diffMinutes > -150; 
  const startsIn = diffMinutes > 0 ? formatTimeUntil(diffMinutes) : undefined;

  return {
    id: event.channels[0]?.channel_id || `match-${Math.random()}`,
    time: event.time,
    title: event.event,
    competition: category,
    channels: event.channels || [],
    isLive,
    startsIn,
  };
}

function parseTimeToMinutes(time: string): number {
  if (!time || !time.includes(':')) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTimeUntil(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// Use an internal API route to resolve the iframe URL dynamically
export function getStreamUrl(channel: { channel_id: string }, folder: string = 'stream'): string {
  // If it's a SportWatch ID (sw-...)
  if (channel.channel_id.startsWith('sw-')) {
     const b64 = channel.channel_id.replace('sw-', '');
     try {
       // Decode base64 to get the full URL
       return typeof atob !== 'undefined' 
         ? atob(b64) 
         : Buffer.from(b64, 'base64').toString('utf-8');
     } catch (e) {
       console.error('Failed to decode SW token', e);
       return '#';
     }
  }
  // Fallback / Legacy
  return `https://dlhd.link/${folder}/stream-${channel.channel_id}.php`;
}

export function getLogoUrl(_channelName: string): string {
  return '/placeholder-logo.png'; 
}

function getMockSchedule(): Schedule {
  const today = new Date();
  const dayString = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Helper to format date to HH:MM relative to now
  const getTime = (offsetMinutes: number) => {
    const d = new Date(today.getTime() + offsetMinutes * 60000);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return {
    [dayString]: {
      'Soccer': [
        {
          time: getTime(-45), 
          event: 'Arsenal vs Manchester City',
          channels: [{ channel_name: 'Main Stream', channel_id: 'mock-1' }],
          channels2: [],
        },
        {
          time: getTime(-10), 
          event: 'Real Madrid vs Barcelona',
          channels: [{ channel_name: 'Main Stream', channel_id: 'mock-2' }],
          channels2: [],
        },
      ],
    },
  };
}

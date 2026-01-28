import { Schedule, Channel, Match, Event } from '@/types';
import { DaddyLiveScraper } from './daddylive';

const DADDYLIVE_BASE = 'https://dlhd.link';
const API_KEY = process.env.DADDYLIVE_API_KEY || '';

// Fetch schedule from DaddyLive (Scraped or API)
export async function fetchSchedule(): Promise<Schedule | null> {
  try {
    // 1. Try to scrape first (Real Data Free Method)
    console.log('[API] Attempting to scrape schedule...');
    const scrapedData = await DaddyLiveScraper.getSchedule();
    
    if (scrapedData && Object.keys(scrapedData).length > 0) {
      console.log('[API] Successfully scraped schedule data');
      return scrapedData;
    }

    // 2. If scraping fails but we have an API Key, use official API
    if (API_KEY) {
      const response = await fetch(
        `${DADDYLIVE_BASE}/daddyapi.php?key=${API_KEY}&endpoint=schedule`,
        {
          next: { revalidate: 300 }, // Cache for 5 minutes
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
    }

    // 3. Last resort: Mock Data
    console.warn('[API] Scraper failed and no API Key. Using Mock Data.');
    return getMockSchedule();
    
  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return getMockSchedule();
  }
}

// Fetch channels from DaddyLive API
export async function fetchChannels(): Promise<Channel[] | null> {
  try {
    if (!API_KEY) {
      console.warn('No DaddyLive API key configured');
      return getMockChannels();
    }

    const response = await fetch(
      `${DADDYLIVE_BASE}/daddyapi.php?key=${API_KEY}&endpoint=channels`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    return getMockChannels();
  }
}

// Parse schedule into match list for a specific category (e.g., "Soccer" or "Football")
export function parseScheduleToMatches(
  schedule: Schedule,
  category: string = 'Soccer',
  currentTime?: Date
): Match[] {
  const now = currentTime || new Date();
  const matches: Match[] = [];

  for (const [day, categories] of Object.entries(schedule)) {
    // Look for the category (Soccer, Football, etc.)
    const categoryKeys = Object.keys(categories).filter(
      (key) => key.toLowerCase().includes(category.toLowerCase()) ||
               key.toLowerCase().includes('football') ||
               key.toLowerCase().includes('soccer')
    );

    for (const catKey of categoryKeys) {
      const events = categories[catKey] || [];
      
      for (const event of events) {
        const match = eventToMatch(event, day, catKey, now);
        matches.push(match);
      }
    }
  }

  // Sort by time
  return matches.sort((a, b) => {
    const timeA = parseTimeToMinutes(a.time);
    const timeB = parseTimeToMinutes(b.time);
    return timeA - timeB;
  });
}

// Convert event to match
function eventToMatch(event: Event, day: string, category: string, now: Date): Match {
  const [hours, minutes] = event.time.split(':').map(Number);
  
  // Determine if match is live (within a 2-hour window of start time)
  const matchTime = new Date(now);
  matchTime.setHours(hours, minutes, 0, 0);
  
  const diffMs = matchTime.getTime() - now.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  const isLive = diffMinutes <= 0 && diffMinutes > -120; // Started within last 2 hours
  const startsIn = diffMinutes > 0 ? formatTimeUntil(diffMinutes) : undefined;

  return {
    id: `${event.time}-${event.event}`.replace(/\s+/g, '-').toLowerCase(),
    time: event.time,
    title: event.event,
    competition: cleanCategoryName(category),
    channels: event.channels || [],
    isLive,
    startsIn,
  };
}

// Parse time string to minutes for sorting
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Format time until match starts
function formatTimeUntil(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

// Clean category name for display
function cleanCategoryName(category: string): string {
  return category
    .replace(/\d+/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
}

// Mock data for development/testing
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
          time: getTime(-45), // Started 45 mins ago (LIVE)
          event: 'Arsenal vs Manchester City',
          channels: [
            { channel_name: 'Sky Sports Main Event', channel_id: '302', logo_url: 'logos/sky_sports.png' },
            { channel_name: 'beIN Sports 1', channel_id: '491', logo_url: 'logos/bein_sports.png' },
          ],
          channels2: [],
        },
        {
          time: getTime(-10), // Started 10 mins ago (LIVE)
          event: 'Real Madrid vs Barcelona',
          channels: [
            { channel_name: 'DAZN 1', channel_id: '401', logo_url: 'logos/dazn.png' },
          ],
          channels2: [],
        },
        {
          time: getTime(60), // In 1 hour
          event: 'PSG vs Lyon',
          channels: [
            { channel_name: 'Canal+ Sport', channel_id: '501', logo_url: 'logos/canal_plus.png' },
          ],
          channels2: [],
        },
        {
          time: getTime(120), // In 2 hours
          event: 'Juventus vs Inter Milan',
          channels: [
            { channel_name: 'Sky Sport Italia', channel_id: '601', logo_url: 'logos/sky_italia.png' },
          ],
          channels2: [],
        },
      ],
      'UEFA Champions League': [
        {
          time: getTime(180), // In 3 hours
          event: 'Liverpool vs AC Milan',
          channels: [
            { channel_name: 'TNT Sports 1', channel_id: '701', logo_url: 'logos/tnt_sports.png' },
          ],
          channels2: [],
        },
      ],
    },
  };
}

function getMockChannels(): Channel[] {
  return [
    { channel_name: 'Sky Sports Main Event', channel_id: '302', logo_url: 'logos/sky_sports.png' },
    { channel_name: 'beIN Sports 1', channel_id: '491', logo_url: 'logos/bein_sports.png' },
    { channel_name: 'beIN Sports 2', channel_id: '492', logo_url: 'logos/bein_sports.png' },
    { channel_name: 'DAZN 1', channel_id: '401', logo_url: 'logos/dazn.png' },
    { channel_name: 'Canal+ Sport', channel_id: '501', logo_url: 'logos/canal_plus.png' },
    { channel_name: 'TNT Sports 1', channel_id: '701', logo_url: 'logos/tnt_sports.png' },
    { channel_name: 'BT Sport 1', channel_id: '901', logo_url: 'logos/bt_sport.png' },
  ];
}

// Helper to construct stream URL
export function getStreamUrl(channel: { channel_id: string }, folder: string = 'stream'): string {
  // Common DaddyLive player structure
  // Usually: https://daddylive.mp/embed/stream-{id}.php or similar
  // We'll use a generic structure that works with our switching logic
  
  // Note: This is an implementation detail that might change based on the actual provider
  // For the purpose of this task, we assume standard folders
  return `https://dlhd.link/${folder}/stream-${channel.channel_id}.php`;
}

// Helper to get logo URL
export function getLogoUrl(channelName: string): string {
  // DaddyLive doesn't provide consistent logos in the API
  // We can stick to team logos or competition logos from the schedule
  return '/placeholder-logo.png'; 
}

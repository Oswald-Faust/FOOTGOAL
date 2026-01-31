import { Schedule } from '@/types';

const API_URL = "https://opensheet.elk.sh/1vpV6z-RlvUhtLVpzngiHiKavo19VNFPQHuhy1ndJsHI/1";

// Keywords to exclude non-football sports
const EXCLUDED_KEYWORDS = [
  'nba', 'nfl', 'nhl', 'mlb', 'ufc', 'boxing', 'wwe', 'basketball', 
  'formula 1', 'moto gp', 'cricket', 'rugby', 'tennis', 'golf', 'hockey', 'aew'
];

interface ApiMatch {
  MatchID: string;
  League: string;
  Team1: string;
  Team1Logo: string;
  Team2: string;
  Team2Logo: string;
  Date: string;
  Time: string;
  IframeURL: string;
}

export class SportsWatcherScraper {
  static async getSchedule(): Promise<Schedule | null> {
    try {
      const response = await fetch(API_URL, { next: { revalidate: 60 } });
      if (!response.ok) throw new Error('Failed to fetch from SportsWatcher API');
      
      const data: ApiMatch[] = await response.json();
      
      const schedule: Schedule = {};
      
      // Get today's date in the format used by the app (e.g. "Saturday, 31 January 2026")
      // Note: The API returns dates like "January 31, 2026"
      // We will try to map the API matches to "today" if they match today's date
      
      const today = new Date();
      const todayString = today.toLocaleDateString('en-GB', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
      });

      // Initialize bucket
      schedule[todayString] = { 'Football 2': [] };



      data.forEach(match => {
        // Filter for Football/Soccer
        const leagueLower = (match.League || '').toLowerCase();
        if (EXCLUDED_KEYWORDS.some(k => leagueLower.includes(k))) return;

        // Parse Date
        // API Date: "January 31, 2026"
        // We need to check if it matches today (or close enough)
        // Since we are showing a schedule, maybe we just stash them all under the current day bucket 
        // IF the date matches?
        
        // Simple check: does match.Date string match today's date string representation?
        // Let's rely on parsing to timestamp to compare properly
        const matchDate = new Date(`${match.Date} ${match.Time} EST`); // Assume ET based on analysis
        
        // If Invalid Date, skip
        if (isNaN(matchDate.getTime())) return;

        // Convert match time to local 24h HH:MM format
        // The API timestamp (parsed from "January 31, 2026 10:00 AM EST") gives us the absolute time.
        // We format this to the system's local time string.
        const localTimeString = matchDate.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });

        // Filter: Only show matches for "today" (or maybe pending ones?)
        // daddylive.ts puts everything in one key. The API.ts logic might filter based on time.
        // We'll trust the data is relevant if it's in the feed (which seems to be upcoming/live).
        // Check if the match is definitely not today (e.g. tomorrow)
        // For simplicity, we put everything into the "today" bucket because Header/MatchList 
        // architecture seems to pivot on a single 'schedule' object where keys are just labels.
        // But to be safe, let's only verify it's not old.
        
        const title = `${match.Team1} vs ${match.Team2}`;
        // const channelId = match.MatchID || `sw-${Math.random()}`; // Use MatchID or fallback
        
        // The IframeURL is provided directly in JSON: "https://embed.selltvonline.shop/live/embed.php?ch=es46"
        // We need to preserve this. 
        // However, the internal `Match` type expects `channels: [{ channel_id }]`.
        // And `api.ts` `getStreamUrl` constructs the URL from ID.
        // We should encode the IframeURL into the ID or use a lookup?
        // `api.ts` has `getStreamUrl` logic.
        // If we prefix with 'sw-', api.ts handles it: `/api/stream?id=sw-...`
        // We can pass the full URL if we modify api.ts, OR we can store the URL in a way we can retrieve.
        // Let's use a special prefix strategy: `sw-BASE64` ?
        // Or better: Modify `api.ts` to handle `sw-` IDs by looking up safely? 
        // No, `api.ts` just constructs a URL.
        // The best way: Encode the IframeURL in the "channel_id" if it fits, or assume standard format?
        // The IframeURL looks like `https://embed.selltvonline.shop/live/embed.php?ch=es46`.
        // The ID `es46` is the key.
        // Maybe we just extract `es46` and use that?
        // But the domain might change.
        // Let's try to extract the useful part or use a custom format.
        // Let's assume we can change `api.ts` `getStreamUrl` to handle a new prefix.
        
        // Let's pass the whole IframeURL encoded as base64 after a prefix.
        const encodedUrl = Buffer.from(match.IframeURL).toString('base64');
        const customId = `sw-${encodedUrl}`;

        schedule[todayString]['Football 2'].push({
          time: localTimeString,
          event: title,
          channels: [{
            channel_name: 'Stream 1',
            channel_id: customId,
            logo_url: '/placeholder-logo.png'
          }],
          channels2: []
        });
      });

      console.log(`[SportsWatcher] Found ${schedule[todayString]['Football 2'].length} matches.`);
      return schedule;

    } catch (e) {
      console.error('[SportsWatcher] Error:', e);
      return null;
    }
  }
}

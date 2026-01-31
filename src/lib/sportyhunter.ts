import * as cheerio from 'cheerio';
import { Schedule, Channel, Event } from '@/types';

const BASE_URL = 'https://sportyhunter.com';
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class SportyHunterScraper {
  static async getSchedule(): Promise<Schedule | null> {
    try {
      console.log('[SportyHunter] Fetching schedule...');
      const response = await fetch(`${BASE_URL}/sport/football`, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml',
        },
        next: { revalidate: 30 }
      });

      if (!response.ok) {
        console.error(`[SportyHunter] Failed to fetch: ${response.status}`);
        return null;
      }

      const html = await response.text();
      
      // DEBUG: Dump HTML to analyze why selectors fail
      const { dumpHtml } = await import('./debug');
      dumpHtml(html);
      
      const $ = cheerio.load(html);
      
      // Parse __NEXT_DATA__
      const nextDataScript = $('#__NEXT_DATA__').html();
      if (!nextDataScript) {
        console.error('[SportyHunter] __NEXT_DATA__ not found');
        return this.fallbackScrape($);
      }

      try {
        const json = JSON.parse(nextDataScript);
        return this.parseNextData(json);
      } catch (e) {
        console.error('[SportyHunter] Failed to parse NEXT_DATA JSON', e);
        return this.fallbackScrape($);
      }

    } catch (error) {
      console.error('[SportyHunter] Error:', error);
      return null;
    }
  }

  private static parseNextData(json: any): Schedule {
    const schedule: Schedule = {};
    const today = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    schedule[today] = {};

    try {
      // Navigate to the matches in the props
      // Structure varies but usually props.pageProps.initialState... or something similar
      // or props.pageProps.events
      // Based on inspection, we need to find where the "events" or "matches" are.
      // Often in pageProps.dehydratedState.queries...
      
      const pageProps = json.props.pageProps;
      let matches: any[] = [];

      // Attempt 1: Direct matches array
      if (pageProps?.matches) matches = pageProps.matches;
      // Attempt 2: Through react-query dehydrated state
      else if (pageProps?.dehydratedState?.queries) {
        pageProps.dehydratedState.queries.forEach((q: any) => {
          if (q?.state?.data?.matches) {
            matches = matches.concat(q.state.data.matches);
          } else if (Array.isArray(q?.state?.data)) {
             // Sometimes the query result IS the array
             matches = matches.concat(q.state.data);
          }
        });
      }

      if (!matches.length) {
         console.warn('[SportyHunter] No matches found in JSON data');
         return {};
      }

      // Group by league
      matches.forEach((match: any) => {
         // Data structure mapping
         // This is speculative based on common sportyhunter structs, will refine with debug output
         // Usually: match.homeTeam.name, match.awayTeam.name, match.date, match.league.name
         
         const leagueName = match.league?.name || match.tournament?.name || 'Unknown League';
         const category = 'Soccer'; // It's all football page

         if (!schedule[today][category]) schedule[today][category] = [];
         // Or grouping by League names directly as sub-categories is better? 
         // System expects Schedule[Date][Category] -> List. 
         // We can put everything in "Soccer" or split by league.
         // Let's stick to 'Soccer' as the main key and use match.competition for the badge.

         if (!schedule[today]['Soccer']) schedule[today]['Soccer'] = [];

         const date = new Date(match.timestamp * 1000 || match.date);
         const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

         const event: Event = {
           time,
           event: `${match.homeTeam?.name || match.home_team} vs ${match.awayTeam?.name || match.away_team}`,
           channels: [], // We'll fill this if the data has streams info
           // Metadata for linking
           // We need to store the slug/id to build the URL later
         };
         
         // Attach a special ID property if we can modify the type, 
         // BUT we need to fit into 'Event'. 
         // We can smuggle the ID into the channel_id of a "Main" channel
         const matchId = match.slug || match.id;
         
         if (matchId) {
            event.channels.push({
                channel_name: 'Main Stream',
                channel_id: `sh-${matchId}`, // Prefix to know it's SportyHunter
                logo_url: '/placeholder-logo.png'
            });
         }

         schedule[today]['Soccer'].push(event);
      });

      return schedule;

    } catch (e) {
      console.error('[SportyHunter] Error parsing JSON data structure', e);
      return {};
    }
  }

  private static fallbackScrape($: cheerio.CheerioAPI): Schedule {
    // Basic HTML scraping if JSON fails
    const schedule: Schedule = {};
    const today = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
    
    schedule[today] = { 'Soccer': [] };
    
    // Broaden search: Find ANY div that looks like a row (contains a time)
    // Class names like 'cursor-pointer' might be stripped or dynamic
    const elements = $('div').filter((i, el) => {
        const txt = $(el).text();
        return /\d{2}:\d{2}/.test(txt) && $(el).find('img').length > 0; // Match usually has time + identifiers like team logos
    });
    
    console.log(`[SportyHunter] Fallback Scraper found ${elements.length} row candidates (broad search).`);
    
    if (elements.length === 0) {
        // Debug: Log what valid match rows might look like if our selector failed
        // Maybe the class name is dynamic or different in server response
        const html = $.html();
        console.warn(`[SportyHunter] Fallback Scraper found 0 rows. HTML Length: ${html.length}`);
        // console.log('[SportyHunter] HTML Sample:', html.substring(0, 500));
        return schedule; // Empty
    }

    elements.each((_, el) => {
        try {
            const text = $(el).text().replace(/\s+/g, ' ').trim(); // Flatten whitespace
            // Look for time pattern HH:MM
            const timeMatch = text.match(/(\d{2}:\d{2})/);
            
            if (timeMatch) {
                // Determine teams. 
                // In our browser inspection, teams were in p tags or div tags.
                // We will try to find the team names by excluding the time.
                
                // Strategy: Get all child text nodes
                // The structure usually has Time, then Team A, then Team B, or Team A vs Team B
                
                // Let's rely on the link mostly
                const href = $(el).find('a').attr('href') || $(el).attr('href') || $(el).closest('a').attr('href');
                let matchId = '';
                let title = '';

                if (href) {
                     // /match/slg-Team-A-vs-Team-B-ID
                     // We can extract the title from the URL slug! It's cleaner.
                     const parts = href.split('/');
                     const slug = parts[parts.length - 1]; // slg-Team-A-vs-Team-B-ID
                     matchId = slug;

                     // Extract title from slug: remove 'slg-' and the trailing ID
                     // slug example: slg-Brighton-and-Hove-Albion-vs-Everton-3duPQw3Jex9uxaxDHXUjS4
                     const slugParts = slug.split('-');
                     if (slugParts.length > 2) {
                        // Remove first 'slg' if present
                        if (slugParts[0] === 'slg') slugParts.shift();
                        // Remove last part (ID)
                        slugParts.pop();
                        
                        title = slugParts.join(' ');
                     }
                }

                // If we couldn't get title from URL, try text
                if (!title || title.length < 5) {
                    title = text.replace(timeMatch[1], '').trim();
                }
                
                if (title && matchId) {
                    schedule[today]['Soccer'].push({
                        time: timeMatch[1],
                        event: title,
                        channels: [{
                            channel_name: 'Main Stream',
                            channel_id: `sh-${matchId}`,
                            logo_url: '/placeholder-logo.png'
                        }]
                    });
                }
            }
        } catch (err) {
            console.error('[SportyHunter] Error parsing individual row', err);
        }
    });

    console.log(`[SportyHunter] Fallback Scraper parsed ${schedule[today]['Soccer'].length} matches.`);
    return schedule;
  }

  // Find stream iframe for a specific match
  static async getStreamUrl(matchId: string): Promise<string | null> {
      // Remove prefix
      const realId = matchId.replace('sh-', '');
      const url = `${BASE_URL}/match/${realId}`;
      
      try {
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Look for iframe
        const iframeSrc = $('iframe').attr('src');
        if (iframeSrc) return iframeSrc;
        
        // Look for buttons with eidx
        // If we need to support eidx selection, we might need to fetch the eidx link
        // But usually the first one is loaded by default or easily constructible
        
        return null;
      } catch (e) {
          return null;
      }
  }
}

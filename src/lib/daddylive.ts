import * as cheerio from 'cheerio';
import { Schedule, Channel } from '@/types';

// Configuration
const DADDYLIVE_URL = process.env.DADDYLIVE_URL || 'https://dlhd.link'; // Base URL
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class DaddyLiveScraper {
  /**
   * Fetches and parses the schedule from the DaddyLive website
   */
  static async getSchedule(): Promise<Schedule | null> {
    try {
      // Try multiple common endpoints including the one user provided
      const endpoints = [
        '/index.php?cat=Soccer',
        '/24-hours-games.php', 
        '/schedule.php',
        '/'
      ];
      
      let html = '';

      // Simple rotation to find a working endpoint
      for (const endpoint of endpoints) {
        try {
          console.log(`[Scraper] Trying endpoint: ${endpoint}`);
          const response = await fetch(`${DADDYLIVE_URL}${endpoint}`, {
            headers: {
              'User-Agent': USER_AGENT,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Referer': DADDYLIVE_URL,
            },
            next: { revalidate: 60 } // Cache for 1 min only to get fresh live data
          });
          
          if (response.ok) {
            html = await response.text();
            // Basic validation to check if we actually got a page with content
            if (html.length > 5000) {
               console.log(`[Scraper] Successfully fetched ${html.length} bytes from ${endpoint}`);
               break;
            }
          }
        } catch (e) {
          console.warn(`[Scraper] Failed to fetch ${endpoint}`);
        }
      }

      if (!html) {
        console.error('[Scraper] Could not fetch schedule from any endpoint');
        return null;
      }

      const schedule = this.parseScheduleHtml(html);
      
      // Critical check: If parsing resulted in 0 matches/categories, return null to trigger Mock
      const hasMatches = Object.values(schedule).some(cats => 
        Object.values(cats).some(matches => matches.length > 0)
      );

      if (!hasMatches) {
        console.warn('[Scraper] Parsed HTML but found 0 matches. Fallback to Mock.');
        return null;
      }

      return schedule;

    } catch (error) {
      console.error('[Scraper] Critical error fetching schedule:', error);
      return null;
    }
  }

  /**
   * Parses the raw HTML to extracting matches using heuristic/fuzzy matching
   */
  private static parseScheduleHtml(html: string): Schedule {
    const $ = cheerio.load(html);
    const schedule: Schedule = {};
    const today = new Date().toLocaleDateString('en-GB', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    schedule[today] = { 'Soccer': [] }; // Default bucket

    // Debug: Log the structure to help understand what we got
    // console.log('[Scraper] HTML Preview:', html.substring(0, 500)); 

    // Strategy 1: Look for explicit match rows (common in these sites)
    // Attempt to find containers that have both a time and a link
    
    // We scrape all text nodes that look like a time HH:MM
    const timePattern = /\b\d{1,2}:\d{2}\b/;
    
    // Iterate over common block elements that might wrap a match
    $('div, p, li, tr').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      
      // If text is too long, it's likely a container, not a match row. Skip.
      // If text is too short, skip.
      if (text.length > 300 || text.length < 10) return;

      const timeMatch = text.match(timePattern);
      if (timeMatch) {
         // We found a time!
         const links = $(el).find('a');
         const collectedChannels: Channel[] = [];

         links.each((_, link) => {
             const href = $(link).attr('href');
             const name = $(link).text().trim();
             
             if (href) {
                // Extract ID from link
                // Patterns: /stream/stream-123.php, /embed/123, index.php?id=123
                const idMatch = href.match(/stream-(\d+)\.php/i) || href.match(/id=(\d+)/i) || href.match(/\/(\d+)\.php/i);
                
                if (idMatch) {
                    const channelId = idMatch[1];
                    // Clean name (remove common suffixes/prefixes if needed)
                    let cleanName = name || `Channel ${channelId}`;
                    // Shorten very long names
                    if (cleanName.length > 20) cleanName = cleanName.substring(0, 20) + '...';

                    collectedChannels.push({
                        channel_name: cleanName,
                        channel_id: channelId,
                        logo_url: '/placeholder-logo.png'
                    });
                }
             }
         });

         // Logic to determine the title
         // We take the full text, and remove the time. 
         // Crucial: We must also remove the text of the channels we found to avoid "Real vs Barca DAZN 1"
         let title = text.replace(timeMatch[0], '').replace(/Live/i, '').replace(/Stream/i, '').trim();
         
         // Remove channel names from title
         collectedChannels.forEach(ch => {
             // Escape special regex chars in channel name
             const escapedName = ch.channel_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             const chPattern = new RegExp(escapedName, 'gi');
             title = title.replace(chPattern, '');
         });

         // Remove typical separators and cleanup
         title = title.replace(/^[-–: ]+/, '').replace(/[-–: ]+$/, '').replace(/\s+/g, ' ').trim();

         // Final validity check
         if (title.length > 3 && !title.includes('24/7') && !title.includes('Channels')) {
            // Unify channels if duplicates found (same ID)
            const uniqueChannels = new Map();
            collectedChannels.forEach(c => {
                if (!uniqueChannels.has(c.channel_id)) {
                    uniqueChannels.set(c.channel_id, c);
                }
            });

            // If no channels found but we have a title, we might still listing it? 
            // Better to only list matches where we found at least one stream, 
            // unless we want to show "No stream available"
            if (uniqueChannels.size > 0) {
               schedule[today]['Soccer'].push({
                 time: timeMatch[0],
                 event: title,
                 channels: Array.from(uniqueChannels.values()),
                 channels2: []
               });
            }
         }
      }
    });

    // Clean duplicates (fuzzy logic can catch the same match twice in nested divs)
    const uniqueMatches = new Map();
    schedule[today]['Soccer'].forEach(m => {
      const key = `${m.time}-${m.event}`;
      if (!uniqueMatches.has(key)) {
        uniqueMatches.set(key, m);
      }
    });
    schedule[today]['Soccer'] = Array.from(uniqueMatches.values());

    console.log(`[Scraper] Found ${schedule[today]['Soccer'].length} potential matches.`);
    return schedule;
  }
}

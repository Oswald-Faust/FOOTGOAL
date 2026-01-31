
import * as cheerio from 'cheerio';
import { Schedule, Channel, Event } from '@/types';

const BASE_URL = 'https://sportwatch24.info';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export class SportWatchScraper {
  static async getSchedule(): Promise<Schedule | null> {
    try {
      console.log('[SportWatch] Fetching schedule from multiple pages...');
      
      const today = new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
      });
      
      const schedule: Schedule = {};
      schedule[today] = { 'Soccer': [] };

      // Helper to scrape a single page
      const scrapePage = async (page: number) => {
          const url = page === 1 ? `${BASE_URL}/sport/football` : `${BASE_URL}/sport/football?page=${page}`;
          try {
            const response = await fetch(url, {
                headers: {
                'User-Agent': USER_AGENT,
                'Referer': BASE_URL,
                },
                next: { revalidate: 30 }
            });
            if (!response.ok) return [];
            
            const html = await response.text();
            const $ = cheerio.load(html);
            const cards = $('a.card-link');
            const matches: Event[] = [];

            cards.each((_, el) => {
                try {
                    const href = $(el).attr('href');
                    if (!href) return;

                    // Robust Text Extraction
                    // We expect: Span(Sport) -> Span(Title) ... OR structured text
                    const spans = $(el).find('span');
                    let sport = '';
                    let rawTitle = '';

                    if (spans.length >= 2) {
                        sport = $(spans[0]).text().trim();
                        rawTitle = $(spans[1]).text().trim();
                    } else {
                        // Fallback: splitting text
                        const fullText = $(el).text();
                        if (fullText.toLowerCase().includes('football')) {
                            sport = 'Football';
                            rawTitle = fullText.replace(/football/i, '').trim();
                        }
                    }

                    if (sport.toLowerCase() !== 'football') return;

                    const timeText = $(el).find('div').eq(1).find('span').text().trim();

                    const slug = href.split('/').pop() || '';
                    
                    let time = timeText;
                    if (time === 'LIVE' || !time.match(/\d{2}:\d{2}/)) {
                        const now = new Date();
                        time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    }
                    
                    // Clean Title
                    let cleanTitle = rawTitle;
                    // Remove "Football" prefix if it leaked
                    cleanTitle = cleanTitle.replace(/^football\s*/i, '').replace(/^soccer\s*/i, '');
                    // Remove "otball" artifact
                    cleanTitle = cleanTitle.replace(/otball/i, '');
                    // Remove trailing time or LIVE status from title
                    cleanTitle = cleanTitle.replace(/\d{2}:\d{2}$/, '').replace(/LIVE$/, '');
                    cleanTitle = cleanTitle.trim();

                    if (cleanTitle && slug) {
                        matches.push({
                            time: time,
                            event: cleanTitle,
                            channels: [{
                                channel_name: 'Main Stream',
                                channel_id: `sw-${slug}`,
                                logo_url: '/placeholder-logo.png'
                            }],
                            channels2: []
                        });
                    }
                } catch (e) {
                    // ignore individual row errors
                }
            });
            return matches;
          } catch (e) {
              console.error(`[SportWatch] Error fetching page ${page}`, e);
              return [];
          }
      };

      // Fetch first 3 pages concurrently
      const [page1, page2, page3] = await Promise.all([scrapePage(1), scrapePage(2), scrapePage(3)]);
      
      const allMatches = [...page1, ...page2, ...page3];
      console.log(`[SportWatch] Found ${allMatches.length} matches across 3 pages.`);
      
      // Deduplicate by ID just in case
      const seenIds = new Set();
      allMatches.forEach(m => {
          const id = m.channels[0].channel_id;
          if (!seenIds.has(id)) {
              seenIds.add(id);
              schedule[today]['Soccer'].push(m);
          }
      });

      return schedule;

    } catch (error) {
      console.error('[SportWatch] Error:', error);
      return null;
    }
  }

  // Get stream URL for a match
  static async getStreamUrl(slug: string): Promise<string | null> {
      // 1. Convert to SportZone URL
      // sportwatch24.info -> stream.sportzone.su (Direct mapping of ID)
      const realId = slug.replace('sw-', '');
      const targetUrl = `https://stream.sportzone.su/game/${realId}`;
      
      try {
        console.log(`[SportWatch] Resolving stream via SportZone: ${targetUrl}`);
        
        const response = await fetch(targetUrl, {
            headers: { 
                'User-Agent': USER_AGENT,
                'Referer': 'https://sportwatch24.info/', // Pretend we clicked from main site
            }
        });
        
        if (!response.ok) {
            console.error(`[SportWatch] SportZone fetch failed: ${response.status}`);
            return null;
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        
        // 2. Find Server Buttons (class .source-item)
        // They have onclick="playStream('URL', this)"
        // We want the URL from the first valid server
        
        let embedUrl = '';
        
        const scripts = $('script').text();
        const sourceItems = $('.source-item');
        
        if (sourceItems.length > 0) {
            // Check the onclick attribute
            const firstButton = sourceItems.first();
            const onclickHash = firstButton.attr('onclick') || '';
            // Match: playStream('/embed?url=...', this)
            const match = onclickHash.match(/playStream\(['"]([^'"]+)['"]/);
            if (match && match[1]) {
                embedUrl = match[1];
            }
        }
        
        // Fallback: Check if there's a default iframe (sometimes on page load?)
        if (!embedUrl) {
            embedUrl = $('iframe#live-player').attr('src') || '';
        }

        if (embedUrl) {
             // 3. Construct absolute URL
             // If relative, prepend sportzone domain
             if (embedUrl.startsWith('/')) {
                 return `https://stream.sportzone.su${embedUrl}`;
             }
             return embedUrl;
        }
        
        console.warn('[SportWatch] No stream found on SportZone page. Dumping HTML.');
        const { dumpHtml } = await import('./debug');
        dumpHtml(html, 'debug-sportzone.html');

        return null;
      } catch (e) {
          console.error('[SportWatch] Error getting stream', e);
          return null;
      }
  }
}

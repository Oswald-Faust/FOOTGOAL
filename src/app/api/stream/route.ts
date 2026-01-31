
import { NextRequest, NextResponse } from 'next/server';
import { SportyHunterScraper } from '@/lib/sportyhunter';
import { SportWatchScraper } from '@/lib/sportwatch';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const src = searchParams.get('src'); // Optional source selector if we extend it

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  // Handle SportWatch IDs
  if (id.startsWith('sw-')) {
    const streamUrl = await SportWatchScraper.getStreamUrl(id);
    if (streamUrl) {
      return NextResponse.redirect(streamUrl);
    }
    return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
  }

  // Handle SportyHunter IDs (Legacy/Alternative)
  if (id.startsWith('sh-')) {
    const streamUrl = await SportyHunterScraper.getStreamUrl(id);
    
    if (streamUrl) {
      // Redirect to the real iframe source
      return NextResponse.redirect(streamUrl);
    } else {
      // Fallback or error page
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }
  }

  return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
}

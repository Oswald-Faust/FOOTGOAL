import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StreamPlayer from '@/components/StreamPlayer';
import { fetchChannels, fetchSchedule, parseScheduleToMatches } from '@/lib/api';
import { Channel } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const matchTitle = typeof searchParams.match === 'string' ? searchParams.match : 'Live Stream';
  
  return {
    title: `Watch ${matchTitle} - FOOTGOAL`,
    description: `Watch ${matchTitle} live on FOOTGOAL. Free HD streaming.`,
  };
}

export default async function WatchPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id: channelId } = params;
  const matchTitle = typeof searchParams.match === 'string' ? searchParams.match : undefined;

  // Ideally we would look up the channel details here using the channelId
  // For now, we'll try to fetch channels to get the name
  const channels = await fetchChannels();
  const currentChannel = channels?.find((c) => c.channel_id === channelId);
  
  // We can also try to find alternative channels for this match if we have the title
  let alternativeChannels: Channel[] = [];
  if (matchTitle) {
    const schedule = await fetchSchedule();
    if (schedule) {
      // Very naive search - in a real app would be more robust
      const allMatches = parseScheduleToMatches(schedule, 'Soccer'); // We default to Soccer search for now
      const match = allMatches.find((m) => m.title === matchTitle);
      if (match) {
        alternativeChannels = match.channels.filter((c) => c.channel_id !== channelId);
      }
    }
  }

  if (!channelId) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-32">
      <div className="container mx-auto p-6 lg:p-8 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
          <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
          <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white font-medium truncate max-w-[200px] md:max-w-none">
            {matchTitle || `Channel ${channelId}`}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {matchTitle ? (
                  <>
                    <span className="gradient-text">Live:</span> {matchTitle}
                  </>
                ) : (
                  <>Channel Stream {channelId}</>
                )}
              </h1>
              {currentChannel && (
                <div className="flex items-center gap-2">
                  <span className="text-[#a1a1aa]">Broadcasting on:</span>
                  <span className="px-2 py-1 rounded-md bg-[#1a1a25] border border-white/10 text-xs font-semibold text-white">
                    {currentChannel.channel_name}
                  </span>
                </div>
              )}
            </div>

            <StreamPlayer 
              key={channelId}
              channelId={channelId} 
              channelName={currentChannel?.channel_name || `Channel ${channelId}`}
              matchTitle={matchTitle || 'Live Stream'}
              alternativeChannels={alternativeChannels}
            />
            
            {/* Share / Actions */}
            <div className="flex items-center gap-4 py-4 border-t border-white/5">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a25] hover:bg-[#222230] text-sm font-medium text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Stream
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a25] hover:bg-[#222230] text-sm font-medium text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report Issue
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
             <div className="sticky top-28 space-y-8">
               <div className="card p-6 bg-[#0f0f16]/50 backdrop-blur border border-white/5 rounded-2xl">
                 <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></span>
                    Live Chat
                 </h3>
                 <div className="h-[400px] bg-[#0a0a0f] rounded-xl border border-white/5 flex items-center justify-center text-[#71717a] text-sm font-medium">
                   Chat is disabled for guest users
                 </div>
               </div>

               <div className="card p-8 bg-gradient-to-br from-[#1a1a25] to-[#0a0a0f] border border-white/5 rounded-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-32 bg-[#ff6b35]/5 rounded-full blur-3xl group-hover:bg-[#ff6b35]/10 transition-colors"></div>
                 <h3 className="text-xl font-bold text-white mb-3 relative z-10">Support the platform</h3>
                 <p className="text-sm text-[#a1a1aa] mb-6 leading-relaxed relative z-10">
                   Help us keep the servers running and ad-free by donating.
                 </p>
                 <button className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg relative z-10">
                   Donate Crypto
                 </button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

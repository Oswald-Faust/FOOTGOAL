'use client';

import Link from 'next/link';
import { Match } from '@/types';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const parseTitle = (title: string) => {
    // Try "Vs" or "v" or "-"
    const vsMatch = title.match(/(.+?)\s+(?:vs\.?|v|–|-)\s+(.+)/i);
    if (vsMatch) {
      return { team1: vsMatch[1].trim(), team2: vsMatch[2].trim() };
    }
    return null;
  };

  const teams = parseTitle(match.title);

  return (
    <Link 
      href={`/watch/${match.channels[0]?.channel_id || '0'}?match=${encodeURIComponent(match.title)}`}
      className="block h-full"
    >
      <div className={`
        group relative h-full flex flex-col justify-between
        bg-[#18181b] hover:bg-[#202027] 
        border border-white/5 hover:border-[#ff6b35]/50
        rounded-2xl overflow-hidden transition-all duration-300
        hover:shadow-[0_0_30px_rgba(255,107,53,0.15)]
        hover:-translate-y-1
      `}>
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b35]/5 blur-[50px] rounded-full -mr-16 -mt-16 transition-opacity duration-300 group-hover:opacity-100 opacity-0" />

        {/* Card Header: League/Time */}
        <div className="flex items-center justify-between p-4 pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${match.isLive ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`} />
                <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-wider truncate max-w-[150px]">
                    {match.competition || 'MATCHDAY'}
                </span>
            </div>
            {match.isLive ? (
                <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
                    LIVE
                </span>
            ) : (
                <span className="text-[11px] font-mono text-[#a1a1aa]">
                    {match.time}
                </span>
            )}
        </div>

        {/* Card Body: Teams */}
        <div className="flex-1 p-5 flex flex-col justify-center gap-4">
            {teams ? (
                <>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-lg font-bold text-white leading-tight group-hover:text-[#ff6b35] transition-colors duration-300">
                            {teams.team1}
                        </span>
                        {/* Placeholder Icon/Score if we had it */}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-30">
                        <div className="h-px w-full bg-white"></div>
                        <span className="text-[10px] font-black uppercase italic">VS</span>
                        <div className="h-px w-full bg-white"></div>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-right">
                         {/* Placeholder Icon */}
                        <span className="text-lg font-bold text-white leading-tight ml-auto group-hover:text-[#ff6b35] transition-colors duration-300">
                            {teams.team2}
                        </span>
                    </div>
                </>
            ) : (
                <h3 className="text-lg font-bold text-white text-center group-hover:text-[#ff6b35] transition-colors">
                    {match.title}
                </h3>
            )}
        </div>

        {/* Card Footer: Action */}
        <div className="p-3 mt-auto bg-black/20 backdrop-blur-sm border-t border-white/5 flex items-center justify-between group-hover:bg-[#ff6b35] transition-colors duration-300">
            <div className="flex items-center gap-2 overflow-hidden">
                 {match.channels.length > 0 && (
                     <div className="text-[10px] font-medium text-[#71717a] group-hover:text-white/80 whitespace-nowrap px-1">
                        {match.channels.length > 1 ? `${match.channels.length} Streams` : 'HD Stream'}
                     </div>
                 )}
            </div>
            
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Watch Now
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
        </div>

      </div>
    </Link>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="h-[180px] bg-[#18181b] rounded-2xl border border-white/5 p-4 animate-pulse">
        <div className="flex justify-between mb-6">
            <div className="w-16 h-3 bg-white/5 rounded" />
            <div className="w-10 h-3 bg-white/5 rounded" />
        </div>
        <div className="space-y-4">
            <div className="w-3/4 h-5 bg-white/10 rounded" />
            <div className="w-full h-px bg-white/5" />
            <div className="w-3/4 h-5 bg-white/10 rounded ml-auto" />
        </div>
    </div>
  );
}
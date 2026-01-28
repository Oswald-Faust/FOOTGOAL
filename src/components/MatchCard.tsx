'use client';
import Link from 'next/link';
import { Match } from '@/types';
interface MatchCardProps {
  match: Match;
}
export default function MatchCard({ match }: MatchCardProps) {
  const parseTitle = (title: string) => {
    const vsMatch = title.match(/(.+?)\s+vs\.?\s+(.+)/i);
    if (vsMatch) {
      return { team1: vsMatch[1].trim(), team2: vsMatch[2].trim() };
    }
    return null;
  };
  const teams = parseTitle(match.title);
  return (
    <Link href={`/watch/${match.channels[0]?.channel_id || '0'}?match=${encodeURIComponent(match.title)}`}>
      <div className="card group relative bg-[#16161f] border border-white/5 hover:border-[#ff6b35]/30 hover:bg-[#1a1a25] transition-all duration-200 rounded-xl overflow-hidden">
        
        {/* Desktop Layout (md+) */}
        <div className="hidden md:flex items-center h-24 px-6 gap-6">
          
          {/* 1. Time & Status (Left) */}
          <div className="w-24 shrink-0 flex flex-col items-center justify-center gap-1">
            {match.isLive ? (
              <span className="live-badge w-full justify-center">LIVE</span>
            ) : (
              <span className="text-xl font-bold text-white tabular-nums tracking-tight">{match.time}</span>
            )}
            {match.startsIn && !match.isLive && (
              <span className="text-[11px] font-medium text-[#71717a]">in {match.startsIn}</span>
            )}
            <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider mt-1">
              {match.competition || 'LEAGUE'}
            </span>
          </div>
          {/* Separator */}
          <div className="w-px h-12 bg-white/5 mx-2" />
          {/* 2. Teams (Center - Flex Grow) */}
          <div className="flex-1 flex items-center justify-center gap-8 min-w-0">
            {teams ? (
              <>
                <div className="flex-1 text-right min-w-0">
                  <h3 className="text-xl font-bold text-white truncate group-hover:text-[#ff6b35] transition-colors leading-snug">
                    {teams.team1}
                  </h3>
                </div>
                
                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[#0a0a0f] border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[#a1a1aa] text-xs font-black group-hover:text-[#ff6b35]">VS</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <h3 className="text-xl font-bold text-white truncate group-hover:text-[#ff6b35] transition-colors leading-snug">
                    {teams.team2}
                  </h3>
                </div>
              </>
            ) : (
              <h3 className="text-lg font-bold text-white truncate group-hover:text-[#ff6b35] transition-colors">
                {match.title}
              </h3>
            )}
          </div>
          {/* 3. Channels (Right) */}
          <div className="w-48 shrink-0 flex flex-col items-end gap-2 pl-6 border-l border-white/5">
            <div className="flex flex-wrap justify-end gap-1.5">
              {match.channels.slice(0, 2).map((channel, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded bg-[#0a0a0f] border border-white/5 text-[11px] font-medium text-[#a1a1aa]"
                >
                  {channel.channel_name.replace(/Sports|Channel/gi, '').trim()}
                </span>
              ))}
              {match.channels.length > 2 && (
                <span className="px-2 py-1 rounded bg-[#0a0a0f] text-[10px] text-[#52525b]">
                  +{match.channels.length - 2}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[#ff6b35] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
              Watch Stream
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
          </div>
        </div>
        {/* Mobile Layout (< md) */}
        <div className="md:hidden flex flex-col p-4 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#71717a] uppercase bg-[#0a0a0f] px-2 py-1 rounded">
              {match.competition || 'LIVE'}
            </span>
            {match.isLive ? (
               <span className="live-badge">LIVE</span>
            ) : (
               <span className="text-sm font-bold text-white/80">{match.time}</span>
            )}
          </div>
          
          <div className="space-y-3">
            {teams ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">{teams.team1}</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="h-px bg-white/20 flex-1" />
                  <span className="text-xs font-bold">VS</span>
                  <div className="h-px bg-white/20 flex-1" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">{teams.team2}</span>
                </div>
              </>
            ) : (
               <p className="text-lg font-bold text-white">{match.title}</p>
            )}
          </div>
        </div>
        {/* Hover Line */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff6b35] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
    </Link>
  );
}
// Skeleton loader for match card
export function MatchCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div className="skeleton w-14 h-7 rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="skeleton w-24 h-4 rounded" />
            <div className="skeleton w-full h-5 rounded" />
            <div className="flex gap-2">
              <div className="skeleton w-24 h-6 rounded-lg" />
              <div className="skeleton w-24 h-6 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { Match } from '@/types';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const parseTitle = (title: string) => {
    // Regex flexible to catch "vs", "v", "-", "–"
    const vsMatch = title.match(/(.+?)\s+(?:vs\.?|v|–|-)\s+(.+)/i);
    if (vsMatch) {
      return { team1: vsMatch[1].trim(), team2: vsMatch[2].trim() };
    }
    // Fallback for just splitting by first " vs " if regex failed
    if (title.toLowerCase().includes(' vs ')) {
        const parts = title.split(/ vs /i);
        return { team1: parts[0].trim(), team2: parts[1].trim() };
    }
    return null;
  };

  const teams = parseTitle(match.title);

  // Helper to generate a consistent color gradient for a team name (Pseudo-logo)
  const getTeamColor = (name: string) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-red-500 to-rose-600', 
      'from-green-500 to-emerald-600',
      'from-amber-500 to-orange-600',
      'from-purple-500 to-violet-600',
      'from-pink-500 to-fuchsia-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const TeamLogo = ({ name }: { name: string }) => (
    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${getTeamColor(name)} flex items-center justify-center text-white font-bold text-xs md:text-sm shadow-lg shrink-0`}>
      {name.substring(0, 1).toUpperCase()}
    </div>
  );

  return (
    <Link href={`/watch/${match.channels[0]?.channel_id || '0'}?match=${encodeURIComponent(match.title)}`}>
      <div className="group relative bg-[#181820]/80 hover:bg-[#20202a] border border-white/5 hover:border-white/10 transition-all duration-300 rounded-xl overflow-hidden backdrop-blur-sm">
        
        {/* Card Content Grid */}
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[100px_1fr_150px] items-center gap-3 p-3 md:p-4">
          
          {/* 1. Time / Status (Left Column) */}
          <div className="flex flex-col items-center justify-center min-w-[60px] md:min-w-unset">
             {match.isLive ? (
               <div className="flex flex-col items-center gap-1">
                 <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-red-500 tracking-wider">LIVE</span>
               </div>
             ) : (
                <div className="flex flex-col items-center">
                    <span className="text-white font-bold text-sm md:text-lg">{match.time}</span>
                    {/* Only show date/upcoming indicator on desktop or if space permits */}
                </div>
             )}
          </div>

          {/* 2. Match Info (Center Column) */}
          <div className="flex flex-col gap-1 md:gap-2">
            
            {/* Competition Tag */}
            <div className="flex justify-center md:items-center">
               <span className="text-[9px] md:text-[10px] font-bold text-[#71717a] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full truncate max-w-[150px]">
                 {match.competition || 'LEAGUE'}
               </span>
            </div>

            {/* Teams Display */}
            {teams ? (
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-8">
                {/* Team 1 */}
                <div className="flex items-center gap-3 w-full md:w-1/2 justify-start md:justify-end min-w-0">
                  <div className="md:order-2"><TeamLogo name={teams.team1} /></div>
                  <span className="text-sm md:text-base font-bold text-white truncate md:text-right leading-tight">
                    {teams.team1}
                  </span>
                </div>

                {/* VS Badge */}
                <div className="shrink-0 text-[#52525b] text-[10px] font-bold bg-white/5 px-1.5 py-0.5 rounded md:bg-transparent md:p-0">
                  VS
                </div>

                {/* Team 2 */}
                <div className="flex items-center gap-3 w-full md:w-1/2 justify-end md:justify-start min-w-0">
                  <div className="order-2 md:order-1"><TeamLogo name={teams.team2} /></div>
                  <span className="text-sm md:text-base font-bold text-white truncate text-right md:text-left leading-tight">
                    {teams.team2}
                  </span>
                </div>
              </div>
            ) : (
                // Fallback for non-parseable titles
               <div className="text-sm md:text-lg font-bold text-white text-center px-2">
                 {match.title}
               </div>
            )}
          </div>

           {/* 3. Action / Channels (Right Column) */}
          <div className="hidden md:flex flex-col items-end gap-1">
             <div className="flex -space-x-2">
                {match.channels.slice(0,3).map((c,i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-[#2a2a35] border border-[#181820] flex items-center justify-center text-[8px] text-white font-mono shadow-sm z-10">
                        {i+1}
                    </div>
                ))}
             </div>
             <div className="group-hover:translate-x-1 transition-transform duration-300">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </div>
          </div>
          
           {/* Mobile Arrow */}
           <div className="md:hidden flex items-center justify-end text-[#52525b]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
           </div>
        </div>

        {/* Hover Highlight Line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6b35] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </Link>
  );
}

// Skeleton loader for match card
export function MatchCardSkeleton() {
  return (
    <div className="card overflow-hidden h-24 bg-[#181820] animate-pulse rounded-xl" />
  );
}

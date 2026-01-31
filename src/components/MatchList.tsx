'use client';

import { useState } from 'react';
import { Match } from '@/types';
import MatchCard, { MatchCardSkeleton } from './MatchCard';

interface MatchListProps {
  matches: Match[];
  loading?: boolean;
}

export default function MatchList({ matches, loading }: MatchListProps) {
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');

  const liveMatches = matches.filter(m => m.isLive);
  const upcomingMatches = matches.filter(m => !m.isLive);

  // If filter is 'live', only show live. If 'upcoming', only upcoming. 
  // But 'all' typically means showing both sections clearly.

  const showLive = filter === 'all' || filter === 'live';
  const showUpcoming = filter === 'all' || filter === 'upcoming';

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      
      {/* Filters */}
      <div className="flex justify-center">
        <div className="inline-flex bg-[#18181b] p-1.5 rounded-full border border-white/5 shadow-2xl">
            {[
                { id: 'all', label: 'All Games' },
                { id: 'live', label: 'Live Now', count: liveMatches.length },
                { id: 'upcoming', label: 'Schedule' }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`
                        px-6 py-2 rounded-full text-sm font-bold transition-all duration-300
                        flex items-center gap-2
                        ${filter === tab.id 
                            ? 'bg-[#ff6b35] text-white shadow-lg shadow-orange-500/20' 
                            : 'text-[#71717a] hover:text-white hover:bg-white/5'}
                    `}
                >
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                        <span className="bg-white text-[#ff6b35] text-[10px] font-black px-1.5 rounded-full min-w-[1.2rem] text-center">
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* No Matches State */}
      {matches.length === 0 && (
          <div className="text-center py-20 opacity-50">
              <div className="text-4xl mb-4">💤</div>
              <p className="text-xl font-bold text-white">No matches found right now.</p>
              <p className="text-[#71717a]">Check back later for more action.</p>
          </div>
      )}

      {/* LIVE SECTION */}
      {showLive && liveMatches.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute inset-0" />
                    <div className="w-3 h-3 bg-red-500 rounded-full relative" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    Live Action <span className="text-[#71717a] text-lg font-medium normal-case ml-2">({liveMatches.length})</span>
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {liveMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))}
            </div>
        </section>
      )}

      {/* UPCOMING SECTION */}
      {showUpcoming && upcomingMatches.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
             <div className="flex items-center gap-4 mb-8 mt-4">
                <div className="w-2 h-8 bg-[#ff6b35] rounded-full" />
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    Upcoming Matches
                </h2>
                <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcomingMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))}
            </div>
        </section>
      )}

    </div>
  );
}

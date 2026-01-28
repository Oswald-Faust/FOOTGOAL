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
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');

  // Get unique competitions
  const competitions = ['all', ...new Set(matches.map((m) => m.competition).filter(Boolean))];

  // Filter matches
  const filteredMatches = matches.filter((match) => {
    // Status filter
    if (filter === 'live' && !match.isLive) return false;
    if (filter === 'upcoming' && match.isLive) return false;

    // Competition filter
    if (selectedCompetition !== 'all' && match.competition !== selectedCompetition) return false;

    return true;
  });

  // Group matches by competition
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const comp = match.competition || 'Other';
    if (!acc[comp]) acc[comp] = [];
    acc[comp].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Filters Section */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Top Filter Bar */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
          {/* Status Tabs */}
          <div className="bg-[#16161f] p-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/5 overflow-x-auto max-w-full no-scrollbar">
            {[
              { key: 'all', label: 'All Matches', count: matches.length },
              { key: 'live', label: 'Live Now', icon: '🔴', count: matches.filter(m => m.isLive).length },
              { key: 'upcoming', label: 'Upcoming', count: matches.filter(m => !m.isLive).length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as typeof filter)}
                className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-[#2a2a35] text-white shadow-lg ring-1 ring-white/10'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                  filter === tab.key 
                    ? (tab.key === 'live' ? 'bg-red-500 text-white' : 'bg-white text-black')
                    : 'bg-[#0a0a0f] text-[#71717a]'
                }`}>
                  {tab.count}
                </span>
                {filter === tab.key && tab.key === 'live' && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* League Quick Filters */}
          <div className="w-full xl:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-3 pb-2 xl:pb-0">
              {competitions.slice(0, 5).map((comp) => (
                <button
                  key={comp}
                  onClick={() => setSelectedCompetition(comp)}
                  className={`group flex items-center gap-3 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 border ${
                    selectedCompetition === comp
                      ? 'bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white border-transparent shadow-[0_0_20px_rgba(255,107,53,0.4)] transform scale-105'
                      : 'bg-[#16161f] text-[#a1a1aa] border-white/5 hover:border-white/20 hover:text-white hover:bg-[#1f1f2b]'
                  }`}
                >
                  <span className={`text-lg transition-transform duration-300 ${selectedCompetition === comp ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>
                    {comp === 'all' ? '🌍' : '🏆'}
                  </span>
                  {comp === 'all' ? 'All Leagues' : comp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Status Banner */}
        {matches.some((m) => m.isLive) && filter !== 'upcoming' && (
          <div className="relative overflow-hidden rounded-2xl bg-[#0f0f13] border border-red-500/20 p-1">
             <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-transparent opacity-50" />
             <div className="relative flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute inset-0" />
                    <div className="w-3 h-3 rounded-full bg-red-500 relative shadow-[0_0_10px_#ef4444]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">Live Action</p>
                    <p className="text-red-400/80 text-xs font-medium uppercase tracking-wider">Happening Now</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[#a1a1aa] text-sm">
                   <span className="font-mono text-white">{matches.filter(m => m.isLive).length}</span> matches in progress
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Matches Content */}
      <div className="min-h-[400px]">
        {selectedCompetition === 'all' ? (
          Object.entries(groupedMatches).map(([competition, matchList]) => (
            <div key={competition} className="mb-12 last:mb-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-4 mb-6 group cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-2 h-10 bg-gradient-to-b from-[#ff6b35] to-[#f7931e] rounded-full shadow-[0_0_20px_#ff6b35] group-hover:scale-y-110 transition-transform duration-300"></div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">{competition}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 via-white/5 to-transparent ml-6 mt-2" />
              </div>
              <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                {matchList.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredMatches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 px-4 rounded-[3rem] bg-[#0f0f15] border border-white/5 border-dashed relative overflow-hidden group">
            
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff6b35]/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-3xl bg-[#16161f] border border-white/5 flex items-center justify-center shadow-2xl mb-8 group-hover:shadow-[0_0_40px_rgba(255,107,53,0.1)] group-hover:-translate-y-2 transition-all duration-500">
                 <span className="text-6xl filter grayscale group-hover:grayscale-0 transition-all duration-500">🏟️</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                No Matches Found
              </h3>
              
              <p className="text-[#a1a1aa] text-lg max-w-md mb-10 leading-relaxed">
                {filter === 'live'
                  ? <>The fields are empty right now. <br/>Check our schedule for upcoming games.</>
                  : "We couldn't find any matches matching your current filters."}
              </p>

              <button
                onClick={() => {
                  setFilter('all');
                  setSelectedCompetition('all');
                }}
                className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-[#f0f0f0] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <span>Clear All Filters</span>
                  <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

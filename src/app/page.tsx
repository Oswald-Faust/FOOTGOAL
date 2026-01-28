import { Suspense } from 'react';
import { fetchSchedule, parseScheduleToMatches } from '@/lib/api';
import MatchList from '@/components/MatchList';

// Helper to deduce category from search params
function getCategoryFromParams(cat?: string | string[]): string {
  if (Array.isArray(cat)) return cat[0];
  if (!cat) return 'Soccer'; // Default to Soccer
  return cat;
}

export const revalidate = 60; // Revalidate every minute

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;
  const category = getCategoryFromParams(searchParams.cat);
  const loading = false; // Server component, initial load handled by Suspense/loading.tsx effectively

  // Fetch data on the server
  const schedule = await fetchSchedule();
  
  // Parse matches for the selected category
  const matches = schedule 
    ? parseScheduleToMatches(schedule, category) 
    : [];

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#0a0a0f] border-b border-white/5 min-h-[60vh] flex items-center">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-20 animate-pulse-slow"></div>
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#ff6b35]/20 via-[#ff6b35]/5 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-2/3 bg-gradient-to-t from-[#16161f] to-transparent"></div>
        
        <div className="container mx-auto relative z-10 py-20 md:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#ff6b35] font-bold text-xs uppercase tracking-widest mb-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
               <span className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse"></span>
               Live Sports Streaming
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.1] animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
              Watch <span className="gradient-text">{category}</span> <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Matches Live</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#a1a1aa] mb-12 leading-relaxed max-w-2xl animate-in slide-in-from-bottom-6 fade-in duration-700 delay-200">
              Experience the thrill of live sports with premium HD streaming. 
              <br className="hidden md:block"/>No interruptions, just pure action from the world&apos;s best {category.toLowerCase()} leagues.
            </p>
            
            <div className="flex flex-wrap gap-5 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-300">
              <a href="#matches" className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4 shadow-[0_0_30px_rgba(255,107,53,0.3)] hover:shadow-[0_0_50px_rgba(255,107,53,0.5)]">
                Browse Matches
                <svg className="w-6 h-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
              <div className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-white font-medium flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                API Connected & Stable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Matches Section */}
      <div id="matches" className="container mx-auto py-12">
        <Suspense fallback={<div className="text-white">Loading matches...</div>}>
          <MatchList matches={matches} loading={loading} />
        </Suspense>
      </div>
    </div>
  );
}

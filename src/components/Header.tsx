'use client';

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const NAV_ITEMS = [
  { name: 'Football 2', href: '/?cat=Football%202', icon: '⚽' },
  { name: 'NBA', href: '/?cat=NBA', icon: '🏀' },
  { name: 'NFL', href: '/?cat=NFL', icon: '🏈' },
  { name: 'UFC', href: '/?cat=UFC', icon: '🥊' },
  { name: 'F1', href: '/?cat=F1', icon: '🏎️' },
  { name: 'Tennis', href: '/?cat=Tennis', icon: '🎾' },
];

function HeaderContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('cat');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20 md:h-28">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-5 group shrink-0">
            <div className="relative">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-gradient-to-br from-[#ff6b35] to-[#f7931e] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_40px_rgba(255,107,53,0.4)] transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3">
                <span className="text-2xl md:text-4xl drop-shadow-md">⚽</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 rounded-full animate-pulse-live border-4 border-[#0a0a0f]" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-1 italic">
                <span className="gradient-text drop-shadow-sm">FOOT</span>
                <span className="text-white drop-shadow-sm">GOAL</span>
              </h1>
              <p className="text-[10px] md:text-xs text-[#a1a1aa] tracking-[0.3em] uppercase font-bold pl-1 mt-0.5">Live Streaming</p>
            </div>
          </Link>

          {/* Desktop Navigation - Centered & Floating */}
          <div className="hidden xl:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-lg shadow-2xl">
              {NAV_ITEMS.map((item) => {
                const itemCat = item.href.includes('?cat=') ? item.href.split('=')[1] : null;
                const isActive = currentCategory === itemCat || (!currentCategory && item.href === '/');
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-3 ${
                      isActive 
                        ? 'text-white bg-[#1a1a25] shadow-[0_0_20px_rgba(0,0,0,0.3)]' 
                        : 'text-[#a1a1aa] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-110'}`}>{item.icon}</span>
                    <span className={isActive ? 'gradient-text' : ''}>{item.name}</span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-full border border-white/5" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section: Search & Timezone */}
          <div className="hidden md:flex items-center gap-4 md:gap-6">
            {/* Search Bar */}
            <div className="relative group hidden lg:block">
              <input
                type="text"
                placeholder="Find a match..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 xl:w-80 px-6 py-3.5 pl-14 rounded-full bg-[#16161f] border border-white/10 text-white placeholder-[#52525b] text-sm font-medium focus:outline-none focus:border-[#ff6b35]/50 focus:ring-4 focus:ring-[#ff6b35]/10 transition-all duration-300 shadow-inner group-hover:bg-[#1a1a25]"
              />
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#52525b] group-focus-within:text-[#ff6b35] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Timezone Badge */}
            <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#16161f] border border-white/10 text-xs font-bold uppercase tracking-wider text-[#a1a1aa] shadow-lg">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff6b35] shadow-[0_0_10px_#ff6b35]" />
              GMT+1
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden p-4 rounded-2xl bg-[#1a1a25] border border-white/10 text-white hover:bg-white/5 transition-colors shadow-lg active:scale-95"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden pb-8 border-t border-white/5 mt-2 pt-6 animate-in slide-in-from-top-4 fade-in duration-300">
            {/* Mobile Search */}
            <div className="relative mb-8">
              <input
                type="text"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-5 pl-14 rounded-3xl bg-[#1a1a25] border border-white/10 text-white placeholder-[#71717a] text-lg focus:outline-none focus:border-[#ff6b35]/50 focus:ring-4 focus:ring-[#ff6b35]/20"
              />
              <svg
                className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#71717a]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Mobile Nav Items */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-[#1a1a25] border border-white/5 text-sm font-bold text-[#a1a1aa] hover:text-white hover:border-[#ff6b35]/30 hover:bg-[#ff6b35]/5 transition-all active:scale-95"
                >
                  <span className="text-3xl mb-1">{item.icon}</span>
                  <span className="text-base">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense 
      fallback={
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl transition-all duration-300">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-20 md:h-28" />
          </div>
        </header>
      }
    >
      <HeaderContent />
    </Suspense>
  );
}

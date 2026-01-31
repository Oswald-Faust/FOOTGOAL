'use client';

import { useState } from 'react';
import { Channel } from '@/types';
import { getStreamUrl } from '@/lib/api';

type PlayerFolder = 'stream' | 'cast' | 'watch' | 'plus' | 'casting' | 'player';

interface StreamPlayerProps {
  channelId: string;
  channelName: string;
  matchTitle: string;
  alternativeChannels?: Channel[];
}

export default function StreamPlayer({
  channelId,
  channelName,
  matchTitle,
  alternativeChannels = [],
}: StreamPlayerProps) {
  const [currentFolder, setCurrentFolder] = useState<PlayerFolder>('stream');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setHasError] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel>({
    channel_id: channelId,
    channel_name: channelName,
  });
  const [isStreamActive, setIsStreamActive] = useState(true);

  // Folders to try in order
  const folders: PlayerFolder[] = ['stream', 'cast', 'watch', 'plus', 'casting', 'player'];

  const tryNextFolder = () => {
    const currentIndex = folders.indexOf(currentFolder);
    if (currentIndex < folders.length - 1) {
      console.log(`Trying next folder: ${folders[currentIndex + 1]}`);
      setCurrentFolder(folders[currentIndex + 1]);
      setIsLoading(true);
      setHasError(false);
    } else {
      console.log('All folders failed');
      setHasError(true);
      setIsLoading(false);
    }
  };

  const streamUrl = getStreamUrl(selectedChannel, currentFolder);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    console.error('Iframe load error');
    tryNextFolder();
  };

  if (!channelId) return null;

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Main Video Area */}
      <div className="w-full aspect-video bg-black relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 group ring-1 ring-white/5">
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#12121a] z-10 transition-opacity duration-500">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[#1a1a25]" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff6b35] animate-spin" />
            </div>
            <p className="text-base font-medium text-[#a1a1aa] animate-pulse">Loading stream...</p>
            <p className="text-sm text-[#52525b] mt-3 bg-[#0a0a0f] px-3 py-1 rounded-full border border-white/5">Server: {currentFolder}</p>
          </div>
        )}

        {/* Safety/Start Overlay - REMOVED */}
        {/* Stream starts automatically now */}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#12121a] z-20">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-xl mb-3">Stream Unavailable</h3>
            <p className="text-[#a1a1aa] text-center max-w-md px-4 text-base mb-8 leading-relaxed">
              We couldn&apos;t load the stream from any of our servers. Please try a different channel below.
            </p>
            {alternativeChannels.length > 0 && (
              <button 
                onClick={() => {
                  const nextChannel = alternativeChannels[0];
                  setSelectedChannel(nextChannel);
                  setCurrentFolder('stream');
                  setIsLoading(true);
                  setHasError(false);
                  setIsStreamActive(true);
                }}
                className="px-8 py-3 rounded-xl bg-[#ff6b35] text-white font-bold hover:bg-[#e05a2b] transition-all transform hover:scale-105 shadow-lg shadow-[#ff6b35]/20"
              >
                Try {alternativeChannels[0].channel_name}
              </button>
            )}
          </div>
        )}

        {/* Iframe */}
        {isStreamActive && (
          <iframe
          key={`${selectedChannel.channel_id}-${currentFolder}`}
          src={streamUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
        )}
      </div>

      {/* Control Bar */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Server Selection */}
        <div className="p-5 rounded-2xl bg-[#16161f] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xs font-bold text-[#71717a] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
            Server Selection
          </h4>
          <div className="flex gap-2.5 flex-wrap">
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => {
                  setCurrentFolder(folder);
                  setIsLoading(true);
                  setHasError(false);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all border ${
                  currentFolder === folder
                    ? 'bg-[#ff6b35] text-white border-[#ff6b35] shadow-lg shadow-[#ff6b35]/20'
                    : 'bg-[#0a0a0f] text-[#a1a1aa] border-white/5 hover:text-white hover:border-white/20'
                }`}
              >
                {folder}
              </button>
            ))}
          </div>
        </div>

        {/* Channel Selection */}
        <div className="p-5 rounded-2xl bg-[#16161f] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xs font-bold text-[#71717a] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
            Alternative Sources
          </h4>
          {alternativeChannels.length > 0 ? (
            <div className="flex gap-2.5 flex-wrap">
              <button
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                  selectedChannel.channel_id === channelId
                    ? 'bg-[#ff6b35] text-white border-[#ff6b35]'
                    : 'bg-[#0a0a0f] text-[#a1a1aa] border-white/5 hover:border-white/20'
                }`}
                onClick={() => setSelectedChannel({ channel_id: channelId, channel_name: channelName })}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${selectedChannel.channel_id === channelId ? 'bg-white' : 'bg-[#ff6b35]'}`} />
                Main
              </button>
              {alternativeChannels.map((channel) => (
                <button
                  key={channel.channel_id}
                  onClick={() => {
                    setSelectedChannel(channel);
                    setCurrentFolder('stream');
                    setIsLoading(true);
                    setHasError(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                    selectedChannel.channel_id === channel.channel_id
                      ? 'bg-[#ff6b35] text-white border-[#ff6b35]'
                      : 'bg-[#0a0a0f] text-[#a1a1aa] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${selectedChannel.channel_id === channel.channel_id ? 'bg-white' : 'bg-[#ff6b35]'}`} />
                  {channel.channel_name.replace(/Sports|Channel/gi, '').trim()}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#52525b] italic py-2">No alternative sources available for this match.</p>
          )}
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-[#1a1a25]/50 border border-white/5 backdrop-blur-sm">
        <div>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-live" />
            {matchTitle}
          </h2>
          <p className="text-xs text-[#a1a1aa]">
            Watching on: <span className="text-[#ff6b35] font-semibold">{selectedChannel.channel_name}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0f] border border-white/10 text-xs font-bold text-[#a1a1aa] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a0a0f] border border-white/10 text-xs font-bold text-[#a1a1aa] hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}

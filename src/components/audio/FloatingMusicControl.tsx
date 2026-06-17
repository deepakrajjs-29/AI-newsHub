'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAudio } from '@/lib/AudioContext';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack, Music } from 'lucide-react';

export default function FloatingMusicControl() {
  const pathname = usePathname();
  const {
    isPlaying,
    currentTrack,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    togglePlay,
    nextTrack,
    prevTrack
  } = useAudio();

  const [isHovered, setIsHovered] = useState(false);

  // Hide on auth page
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center transition-all duration-500 ease-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur-md transition-all duration-500 ${
        isHovered ? 'opacity-30 blur-lg' : 'opacity-10'
      }`} />
      
      <div className={`relative flex items-center overflow-hidden rounded-full border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-out ${
        isHovered ? 'max-w-[420px] px-4 py-2.5' : 'max-w-[50px] p-3'
      }`}>
        {/* EQ / Note icon section */}
        <div
          onClick={togglePlay}
          className="flex h-6 w-6 cursor-pointer items-center justify-center relative shrink-0"
        >
          {isPlaying ? (
            <div className="flex items-end justify-between h-3.5 w-4.5">
              <span className="audio-wave-bar" />
              <span className="audio-wave-bar" />
              <span className="audio-wave-bar" />
              <span className="audio-wave-bar" />
            </div>
          ) : (
            <Music className="h-4 w-4 text-indigo-400 hover:text-indigo-300 transition-colors animate-pulse" />
          )}
        </div>

        {/* Expanded Controls */}
        <div className={`flex items-center transition-all duration-500 ease-out ${
          isHovered ? 'opacity-100 w-auto ml-4' : 'opacity-0 w-0 pointer-events-none overflow-hidden'
        }`}>
          {/* Metadata */}
          <div className="flex flex-col min-w-[120px] max-w-[140px] select-none pr-3 border-r border-zinc-800/60">
            <span className="truncate text-xs font-semibold text-zinc-100">{currentTrack?.title}</span>
            <span className="truncate text-[10px] text-zinc-400 font-medium mt-0.5">{currentTrack?.artist}</span>
          </div>

          {/* Media Buttons */}
          <div className="flex items-center space-x-2 px-3 shrink-0 border-r border-zinc-800/60">
            <button
              onClick={prevTrack}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className="rounded-full bg-indigo-500/90 p-2 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-500/20"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 fill-current" />
              ) : (
                <Play className="h-3 w-3 fill-current translate-x-[0.5px]" />
              )}
            </button>
            <button
              onClick={nextTrack}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 pl-3 shrink-0">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4 text-rose-400/80" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="h-1 w-14 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface Track {
  title: string;
  artist: string;
  url: string;
  category: string;
  duration: string;
}

export const TRACKS: Track[] = [
  {
    title: "Zen Garden",
    artist: "Ambient Synth",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "Ambient",
    duration: "6:12"
  },
  {
    title: "Deep Focus",
    artist: "Space Pad",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "Focus",
    duration: "7:05"
  },
  {
    title: "Study Wave",
    artist: "Relax Chill",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    category: "Lo-Fi",
    duration: "5:44"
  },
  {
    title: "Soft Reflections",
    artist: "Ambient Piano",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    category: "Calm",
    duration: "5:02"
  },
  {
    title: "Morning Breeze",
    artist: "Acoustic Guitar",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    category: "Instrumental",
    duration: "5:38"
  }
];

interface AudioContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  tracks: Track[];
  currentTrack: Track;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize from localStorage on client side
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTrackIndex = localStorage.getItem('audio_track_index');
      const storedVolume = localStorage.getItem('audio_volume');
      const storedMuted = localStorage.getItem('audio_muted');

      if (storedTrackIndex !== null) {
        setCurrentTrackIndex(parseInt(storedTrackIndex, 10));
      }
      if (storedVolume !== null) {
        setVolume(parseFloat(storedVolume));
      }
      if (storedMuted !== null) {
        setIsMuted(storedMuted === 'true');
      }
    } catch (e) {
      console.error('Failed to load audio settings from localStorage', e);
    }
  }, []);

  // Sync state to localStorage & HTML Audio element
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('audio_track_index', currentTrackIndex.toString());
    } catch (e) {}
  }, [currentTrackIndex, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('audio_volume', volume.toString());
    } catch (e) {}
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('audio_muted', isMuted.toString());
    } catch (e) {}
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted, isMounted]);

  // Handle Play/Pause logic on HTML Audio element
  useEffect(() => {
    if (!isMounted || !audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Playback prevented or failed. User interaction might be required first.", error);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex, isMounted]);

  // Re-run source load on track index change
  useEffect(() => {
    if (!isMounted || !audioRef.current) return;
    
    const wasPlaying = isPlaying;
    audioRef.current.src = TRACKS[currentTrackIndex].url;
    audioRef.current.load();
    
    if (wasPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn("Autoplay compliance verification failed on track swap.", e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex, isMounted]);

  const playTrack = (index: number) => {
    if (index >= 0 && index < TRACKS.length) {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const currentTrack = TRACKS[currentTrackIndex];

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentTrackIndex,
        setCurrentTrackIndex,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        tracks: TRACKS,
        currentTrack,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
      }}
    >
      {children}
      {isMounted && (
        <audio
          ref={audioRef}
          preload="auto"
          loop
          style={{ display: 'none' }}
        />
      )}
    </AudioContext.Provider>
  );
};

"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

interface AudioData {
  url: string;
  title: string;
  index: number;
  duration?: number;
  filename?: string;
  audio_url?: string;
  audio_id?: string;
}

interface AudioPlayerContextType {
  isPlayerOpen: boolean;
  setIsPlayerOpen: (isOpen: boolean) => void;
  currentAudio: AudioData | null;
  setCurrentAudio: (audio: AudioData | null) => void;
  playlist: any[];
  setPlaylist: (playlist: any[]) => void;
  playAudio: (audio: any, index: number, playlist: any[]) => void;
  closePlayer: () => void;
  
  // Audio Controls & State
  isPlaying: boolean;
  togglePlay: () => void;
  progress: number;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  seek: (time: number) => void;
  handleVolumeChange: (value: number) => void;
  toggleMute: () => void;
  repeatMode: 'off' | 'all' | 'one';
  cycleRepeat: () => void;
  isShuffled: boolean;
  toggleShuffle: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioData | null>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffled, setIsShuffled] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // We need a ref to access the latest playlist/index in the onEnded callback 
  // without re-creating the specific event listener constantly if we can avoid it,
  // but React state in cleanup is fine usually. 
  // However, for the `onEnded` logic which might trigger next, we need fresh state.
  
  // Helpers to handle next/prev based on playlist
  const handleNext = () => {
    if (!currentAudio || playlist.length === 0) return;
    
    let nextIndex = currentAudio.index + 1;
    if (nextIndex >= playlist.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return; // End of playlist
      }
    }
    
    // If shuffled, we might pick random (simple implementation: just next for now, or true random)
    // For true shuffle, we'd need a shuffled playlist mapping. 
    // Let's stick to linear for now or implement simple random if requested.
    // The previous implementation didn't seem to have full shuffle logic in the view I saw, 
    // just a state toggle. I'll keep it simple: next is next.
    
    const nextAudio = playlist[nextIndex];
    if (nextAudio) {
        playAudio(nextAudio, nextIndex, playlist);
    }
  };

  const handlePrevious = () => {
    if (!currentAudio || playlist.length === 0) return;
    
    let prevIndex = currentAudio.index - 1;
    if (prevIndex < 0) {
      prevIndex = 0; // Or wrap around if repeat all? usually prev goes to start or prev track.
    }
    
    const prevAudio = playlist[prevIndex];
    if (prevAudio) {
        playAudio(prevAudio, prevIndex, playlist);
    }
  };

  const playAudio = (audio: any, index: number, newPlaylist: any[]) => {
    const audioData = {
      ...audio,
      url: audio.url || audio.audio_url,
      title: audio.filename || audio.title,
      index,
      duration: audio.duration
    };
    
    // If playing the same audio, just toggle play or ensure it's playing?
    // Usually clicking "play" on a track listing starts it from beginning or resumes.
    // Let's restart if it's a new track, resume if it's the same? 
    // The user requirement implies "pause if file is playing".
    
    if (currentAudio?.url === audioData.url) {
        togglePlay();
        // If it was closed, open it
        setIsPlayerOpen(true);
        return;
    }

    setCurrentAudio(audioData);
    setPlaylist(newPlaylist);
    setIsPlayerOpen(true);
    // duration reset happens in onLoadedMetadata
    // progress reset
    setProgress(0);
    setCurrentTime(0);
    setIsPlaying(true); // Auto play new track
  };

  const closePlayer = () => {
    // Only hide UI, don't stop audio
    setIsPlayerOpen(false);
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const seek = (time: number) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      setProgress((time / duration) * 100);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };
  
  const cycleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };
  
  const toggleShuffle = () => setIsShuffled(!isShuffled);

  // Audio Event Handlers
  const onTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0); // Handle NaN
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
     if (repeatMode === 'one') {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.error);
        }
     } else {
        // Auto play next
        handleNext();
     }
  };

  // Sync volume on mount/change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, audioRef.current]);

  // Effect to play/pause when isPlaying changes via other means (if any), 
  // or to ensure sync. Actually togglePlay handles it mostly. 
  // But if source changes, we need to play.
  useEffect(() => {
    if (currentAudio && audioRef.current) {
        // When src changes, standard HTML audio behavior stops playback.
        // We set autoplay logic in playAudio -> setIsPlaying(true)
        // But we need to actually trigger .play() after render update if playing is true.
        if (isPlaying) {
             audioRef.current.play().catch(e => {
                 console.error("Autoplay failed", e);
                 setIsPlaying(false);
             });
        } else {
            audioRef.current.pause();
        }
    }
  }, [currentAudio, isPlaying]); // Be careful with dependency loops here.

  return (
    <AudioPlayerContext.Provider value={{ 
      isPlayerOpen, 
      setIsPlayerOpen, 
      currentAudio, 
      setCurrentAudio,
      playlist,
      setPlaylist,
      playAudio,
      closePlayer,
      isPlaying,
      togglePlay,
      progress,
      duration,
      currentTime,
      volume,
      isMuted,
      seek,
      handleVolumeChange,
      toggleMute,
      repeatMode,
      cycleRepeat,
      isShuffled,
      toggleShuffle,
      handleNext,
      handlePrevious
    }}>
      {children}
      {currentAudio && (
        <audio
            ref={audioRef}
            src={currentAudio.url}
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={onEnded}
            // onPlay/onPause handlers could sync isPlaying state if manipulated externally (e.g. keyboard media keys)
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
        />
      )}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AudioData {
  url: string;
  title: string;
  index: number;
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
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioData | null>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);

  const playAudio = (audio: any, index: number, newPlaylist: any[]) => {
    setCurrentAudio({
      url: audio.url || audio.audio_url,
      title: audio.filename || audio.title,
      index
    });
    setPlaylist(newPlaylist);
    setIsPlayerOpen(true);
  };

  const closePlayer = () => {
    setCurrentAudio(null);
    setPlaylist([]);
    setIsPlayerOpen(false);
  };

  return (
    <AudioPlayerContext.Provider value={{ 
      isPlayerOpen, 
      setIsPlayerOpen, 
      currentAudio, 
      setCurrentAudio,
      playlist,
      setPlaylist,
      playAudio,
      closePlayer
    }}>
      {children}
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

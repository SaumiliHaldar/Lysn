"use client";

import { AudioPlayerProvider, useAudioPlayer } from "@/contexts/audio-player-context";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { AudioPlayer } from "@/components/audio-player";
import { api } from "@/lib/api";

function GlobalAudioPlayer() {
  const { currentAudio, playlist, closePlayer, playAudio } = useAudioPlayer();

  if (!currentAudio) return null;

  const handleNext = () => {
    if (currentAudio.index < playlist.length - 1) {
      const nextAudio = playlist[currentAudio.index + 1];
      playAudio(nextAudio, currentAudio.index + 1, playlist);
    }
  };

  const handlePrevious = () => {
    if (currentAudio.index > 0) {
      const prevAudio = playlist[currentAudio.index - 1];
      playAudio(prevAudio, currentAudio.index - 1, playlist);
    }
  };

  return (
    <AudioPlayer
      url={currentAudio.url}
      title={currentAudio.title}
      playlist={playlist}
      currentIndex={currentAudio.index}
      onNext={currentAudio.index < playlist.length - 1 ? handleNext : undefined}
      onPrevious={currentAudio.index > 0 ? handlePrevious : undefined}
      onClose={closePlayer}
    />
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AudioPlayerProvider>
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <GlobalAudioPlayer />
      <Toaster />
    </AudioPlayerProvider>
  );
}

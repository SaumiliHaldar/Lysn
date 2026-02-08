"use client";

import { usePathname } from "next/navigation";

import { AudioPlayerProvider, useAudioPlayer } from "@/contexts/audio-player-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AudioPlayer } from "@/components/audio-player";
import { MiniPlayer } from "@/components/mini-player";
import { api } from "@/lib/api";

function GlobalAudioPlayer() {
  return (
    <>
      <AudioPlayer />
      <MiniPlayer />
    </>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <AudioPlayerProvider>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      {!isAuthPage && <Footer />}
      <GlobalAudioPlayer />
      <Toaster />
    </AudioPlayerProvider>
  );
}

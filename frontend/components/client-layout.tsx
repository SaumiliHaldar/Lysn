"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { AudioPlayerProvider, useAudioPlayer } from "@/contexts/audio-player-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AudioPlayer } from "@/components/audio-player";
import { MiniPlayer } from "@/components/mini-player";
import { AnnouncementBanner } from "@/components/announcement-banner";
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
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    // Show banner on every full page reload/mount so users get to see it
    setIsBannerVisible(true);
  }, []);

  const handleCloseBanner = () => {
    // Dismiss for the current session/client-state
    setIsBannerVisible(false);
  };

  return (
    <AudioPlayerProvider>
      <AnnouncementBanner isVisible={isBannerVisible} onClose={handleCloseBanner} />
      <Navbar isBannerVisible={isBannerVisible} />
      <main className={`min-h-screen transition-all duration-500 ease-in-out ${
        isBannerVisible ? "pt-[101px]" : "pt-16"
      }`}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
      <GlobalAudioPlayer />
      <Toaster />
    </AudioPlayerProvider>
  );
}

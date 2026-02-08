"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/contexts/audio-player-context";
import { Play, Pause, Maximize2, X, Headphones } from "lucide-react";
import { useEffect, useState } from "react";

export function MiniPlayer() {
  const { currentAudio, isPlayerOpen, setIsPlayerOpen, isPlaying, togglePlay } = useAudioPlayer();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  // Only show if audio exists and main player is closed
  const showMiniPlayer = currentAudio && !isPlayerOpen;

  return (
    <AnimatePresence>
      {showMiniPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed z-40 flex items-center gap-4 rounded-full border border-white/20 bg-background/60 backdrop-blur-xl shadow-2xl hover:bg-background/80 transition-colors group cursor-pointer ${
            isMobile 
              ? "bottom-0 left-0 right-0 mx-4 mb-4 p-4 rounded-2xl" 
              : "bottom-6 right-6 p-3 pr-5"
          }`}
          onClick={() => setIsPlayerOpen(true)}
        >
          {/* Pulsing Album Art / Icon */}
          <motion.div
             animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className={`relative flex-shrink-0 overflow-hidden rounded-full bg-primary/20 flex items-center justify-center border border-white/10 ${
               isMobile ? 'h-14 w-14' : 'h-12 w-12'
             }`}
          >
             <Headphones className={`${isMobile ? 'h-7 w-7' : 'h-6 w-6'} text-primary`} />
          </motion.div>

          {/* Info */}
          <div className={`flex flex-col ${isMobile ? 'flex-1 min-w-0' : 'min-w-[120px] max-w-[200px]'}`}>
            <span className={`${isMobile ? 'text-sm' : 'text-xs'} font-bold truncate text-foreground/90`}>
              {currentAudio.title || "Unknown Track"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              Playing Now
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={togglePlay}
              className={`${isMobile ? 'h-11 w-11' : 'h-8 w-8'} flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 active:scale-95 transition-all`}
            >
              {isPlaying ? <Pause className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} /> : <Play className={`${isMobile ? 'h-5 w-5 ml-0.5' : 'h-4 w-4 ml-0.5'}`} />}
            </button>
            
            <button
              onClick={() => setIsPlayerOpen(true)}
              className={`${isMobile ? 'h-11 w-11' : 'h-8 w-8'} flex items-center justify-center rounded-full bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all ${isMobile ? '' : 'ml-1'}`}
            >
              <Maximize2 className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

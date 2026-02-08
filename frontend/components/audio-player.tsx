"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Headphones, Download, Shuffle, Repeat, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioPlayer } from "@/contexts/audio-player-context";

export function AudioPlayer() {
  const { 
    isPlayerOpen, 
    closePlayer, 
    currentAudio, 
    playlist, 
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
  } = useAudioPlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // If not open or no audio, don't render (or rely on AnimatePresence in parent, but here we control exit anim)
  // Actually, the context `isPlayerOpen` controls visibility.
  // The original used AnimatePresence wrapping the whole thing.
  
  const handleSeek = (clientX: number, commit: boolean = false) => {
    if (progressBarRef.current && duration > 0) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, clickX / rect.width));
      const newTime = percentage * duration;
      
      // We can update local visual progress if needed, but context has seek.
      // Context seek updates both time and progress.
      // However, for smooth dragging, we might want to defer the context update or have a "seek preview".
      // But the original just updated state. Context seek updates state.
      seek(newTime);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleSeek(e.clientX); // update immediately
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleSeek(e.clientX);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        setIsDragging(false);
        handleSeek(e.clientX, true); // final commit if needed, though seek updates continuously in my impl above
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (currentAudio?.url) {
        const link = document.createElement('a');
        link.href = currentAudio.url;
        link.download = currentAudio.title || 'audio';
        link.click();
    }
  };

  return (
    <AnimatePresence>
      {isPlayerOpen && currentAudio && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={closePlayer}
            />
          )}
          
          <motion.div
            initial={isMobile ? { y: "100%", opacity: 0 } : { x: 400, opacity: 0 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
            exit={isMobile ? { y: "100%", opacity: 0 } : { x: 400, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className={`fixed z-50 bg-background/95 backdrop-blur-xl shadow-2xl ${
              isMobile 
                ? "bottom-0 left-0 right-0 h-[90vh] rounded-t-3xl border-t border-border/50" 
                : "right-0 top-0 h-screen w-80 border-l border-border/50"
            }`}
          >
            {/* Close Button / Drag Handle */}
            {isMobile ? (
              <div className="flex flex-col items-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mb-3" />
                <button
                  onClick={closePlayer}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-all"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={closePlayer}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-all z-10"
              >
                <X className="h-4 w-4" />
              </button>
            )}

          <div className={`flex flex-col h-full ${isMobile ? 'px-6 pb-6' : 'p-6'}`}>
            {/* Album Art */}
            <div className={`flex-shrink-0 ${isMobile ? 'mt-4 mb-6' : 'mt-8 mb-6'}`}>
              <div className={`aspect-square w-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg ${isMobile ? 'max-w-sm mx-auto' : ''}`}>
                <Headphones className={`${isMobile ? 'h-32 w-32' : 'h-24 w-24'} text-primary/40`} />
              </div>
            </div>

            {/* Track Info */}
            <div className={`flex-shrink-0 ${isMobile ? 'mb-6' : 'mb-8'} text-center`}>
              <h3 className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold truncate mb-1 px-4`}>{currentAudio.title}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Now Playing</p>
            </div>

            {/* Progress Bar */}
            <div className="flex-shrink-0 mb-2">
              <div 
                ref={progressBarRef}
                className="h-1.5 bg-secondary rounded-full cursor-pointer group"
                onMouseDown={handleProgressMouseDown}
              >
                <motion.div 
                  className="h-full bg-primary rounded-full relative group-hover:bg-primary/80 transition-colors pointer-events-none"
                  style={{ width: `${progress}%` }}
                >
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full transition-opacity ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </motion.div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Controls */}
            <div className={`flex-shrink-0 flex items-center justify-center ${isMobile ? 'gap-6 mb-8' : 'gap-4 mb-6'}`}>
              <button
                onClick={handlePrevious}
                disabled={!currentAudio || (currentAudio.index <= 0 && repeatMode !== 'all')} 
                className={`flex ${isMobile ? 'h-12 w-12' : 'h-10 w-10'} items-center justify-center rounded-full hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95`}
              >
                <SkipBack className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
              </button>

              <button 
                onClick={togglePlay}
                className={`flex ${isMobile ? 'h-16 w-16' : 'h-14 w-14'} items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95`}
              >
                {isPlaying ? <Pause className={`${isMobile ? 'h-7 w-7' : 'h-6 w-6'}`} /> : <Play className={`${isMobile ? 'h-7 w-7 ml-0.5' : 'h-6 w-6 ml-0.5'}`} />}
              </button>

              <button
                onClick={handleNext}
                disabled={!currentAudio || (currentAudio.index >= playlist.length - 1 && repeatMode !== 'all')}
                className={`flex ${isMobile ? 'h-12 w-12' : 'h-10 w-10'} items-center justify-center rounded-full hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95`}
              >
                <SkipForward className={`${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
              </button>
            </div>

            {/* Secondary Controls */}
            <div className={`flex-shrink-0 flex items-center justify-between ${isMobile ? 'mb-8 px-4' : 'mb-6 px-2'}`}>
              <button
                onClick={toggleShuffle}
                className={`flex ${isMobile ? 'h-11 w-11' : 'h-8 w-8'} items-center justify-center rounded-full transition-all active:scale-95 ${
                  isShuffled ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Shuffle className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
              </button>

              <button
                onClick={cycleRepeat}
                className={`flex ${isMobile ? 'h-11 w-11' : 'h-8 w-8'} items-center justify-center rounded-full transition-all relative active:scale-95 ${
                  repeatMode !== 'off' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                <Repeat className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                {repeatMode === 'one' && (
                  <span className={`absolute ${isMobile ? '-top-1 -right-1 text-[9px] h-4 w-4' : '-top-0.5 -right-0.5 text-[8px] h-3 w-3'} font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center`}>1</span>
                )}
              </button>

              <button
                onClick={handleDownload}
                className={`flex ${isMobile ? 'h-11 w-11' : 'h-8 w-8'} items-center justify-center rounded-full text-muted-foreground hover:bg-secondary transition-all active:scale-95`}
              >
                <Download className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
              </button>
            </div>

            {/* Volume Control */}
            <div className={`flex-shrink-0 flex items-center gap-3 ${isMobile ? 'px-4' : 'px-2'}`}>
              <button onClick={toggleMute} className={`text-muted-foreground hover:text-foreground transition-colors ${isMobile ? 'p-2' : ''}`}>
                {isMuted || volume === 0 ? <VolumeX className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} /> : <Volume2 className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className={`flex-1 ${isMobile ? 'h-1.5' : 'h-1'} bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:${isMobile ? 'w-4' : 'w-3'} [&::-webkit-slider-thumb]:${isMobile ? 'h-4' : 'h-3'} [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer`}
              />
            </div>

            {/* Playlist Info */}
            {playlist.length > 0 && (
              <div className="mt-auto pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground text-center">
                  Track {currentAudio.index + 1} of {playlist.length}
                </p>
              </div>
            )}
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

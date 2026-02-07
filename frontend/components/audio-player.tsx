"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X, Headphones, Download, Shuffle, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
  playlist?: { audio_id: string; filename: string; uploaded: string }[];
  currentIndex?: number;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function AudioPlayer({ url, title, onClose, playlist = [], currentIndex = 0, onNext, onPrevious }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const onCanPlay = () => {
    if (audioRef.current && isFinite(audioRef.current.duration) && duration === 0) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
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

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    link.click();
  };

  const cycleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed right-0 top-0 z-50 h-screen w-80 border-l border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary/50 text-foreground hover:bg-secondary transition-all z-10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col h-full p-6">
          {/* Album Art */}
          <div className="flex-shrink-0 mt-8 mb-6">
            <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
              <Headphones className="h-24 w-24 text-primary/40" />
            </div>
          </div>

          {/* Track Info */}
          <div className="flex-shrink-0 mb-8 text-center">
            <h3 className="text-lg font-bold truncate mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Now Playing</p>
          </div>

          {/* Progress Bar */}
          <div className="flex-shrink-0 mb-2">
            <div 
              className="h-1.5 bg-secondary rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <motion.div 
                className="h-full bg-primary rounded-full relative group-hover:bg-primary/80 transition-colors"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex-shrink-0 flex items-center justify-center gap-4 mb-6">
            <button
              onClick={onPrevious}
              disabled={!onPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button 
              onClick={togglePlay}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </button>

            <button
              onClick={onNext}
              disabled={!onNext}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="flex-shrink-0 flex items-center justify-between mb-6 px-2">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                isShuffled ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Shuffle className="h-4 w-4" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all relative ${
                repeatMode !== 'off' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Repeat className="h-4 w-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold bg-primary text-primary-foreground rounded-full h-3 w-3 flex items-center justify-center">1</span>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary transition-all"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex-shrink-0 flex items-center gap-3 px-2">
            <button onClick={toggleMute} className="text-muted-foreground hover:text-foreground transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Playlist Info */}
          {playlist.length > 0 && (
            <div className="mt-auto pt-6 border-t border-border/50">
              <p className="text-xs text-muted-foreground text-center">
                Track {currentIndex + 1} of {playlist.length}
              </p>
            </div>
          )}
        </div>
        
        <audio 
          ref={audioRef} 
          src={url} 
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onCanPlay={onCanPlay}
          onEnded={() => {
            setIsPlaying(false);
            if (repeatMode === 'one') {
              audioRef.current?.play();
              setIsPlaying(true);
            } else if (repeatMode === 'all' && onNext) {
              onNext();
            }
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

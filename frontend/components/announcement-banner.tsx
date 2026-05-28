"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

interface AnnouncementBannerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AnnouncementBanner({ isVisible, onClose }: AnnouncementBannerProps) {
  // diagonal technical caution stripe pattern
  const diagonalStripeStyle = {
    backgroundImage: `linear-gradient(45deg, 
      rgba(245, 158, 11, 0.02) 25%, 
      transparent 25%, 
      transparent 50%, 
      rgba(245, 158, 11, 0.02) 50%, 
      rgba(245, 158, 11, 0.02) 75%, 
      transparent 75%, 
      transparent
    )`,
    backgroundSize: "14px 14px",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-50 overflow-hidden bg-zinc-950/90 border-b border-amber-500/10 backdrop-blur-md"
          style={diagonalStripeStyle}
        >
          <div className="relative w-full px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-x-4 pr-8 h-6 sm:h-7">
              {/* Left Column: Fixed Badges */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                {/* V2 Tech Badge with premium shadow glow */}
                <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold font-mono tracking-wider text-amber-400 border border-amber-500/20 uppercase whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.15)]">
                  v2 active
                </span>
              </div>

              {/* Middle Column: Infinite Scrolling Text with Gradient Fade Overlays */}
              <div className="relative flex-1 overflow-hidden h-full flex items-center mx-2 sm:mx-4">
                {/* Left Fade Overlay */}
                <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none z-10" />

                {/* Infinite Scrolling Container */}
                <motion.div
                  className="flex whitespace-nowrap gap-16 pr-16"
                  animate={{ x: [0, "-50%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 15, // Faster, highly active and catchy marquee speed
                    ease: "linear",
                  }}
                >
                  {/* Duplicated text elements to create an infinite, gapless scroll loop */}
                  <span className="text-zinc-300 text-xs sm:text-sm font-medium">
                    🚀 Lysn v2 is Live! Now upgraded with handwritten document processing, navigable chapter summaries, and interactive comprehension quizzes.
                  </span>
                  <span className="text-zinc-300 text-xs sm:text-sm font-medium">
                    🚀 Lysn v2 is Live! Now upgraded with handwritten document processing, navigable chapter summaries, and interactive comprehension quizzes.
                  </span>
                </motion.div>

                {/* Right Fade Overlay */}
                <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none z-10" />
              </div>

              {/* Right Column: Fixed Call to Action */}
              <div className="flex items-center flex-shrink-0">
                <Link
                  href="https://lysn-v2.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1 text-[10px] sm:text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider whitespace-nowrap"
                >
                  See What's New
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Absolute close button */}
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2">
              <button
                onClick={onClose}
                className="flex items-center justify-center p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all active:scale-95 cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* INFINITE MOVING GLOWING LASER LINE */}
          <motion.div
            className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "linear",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

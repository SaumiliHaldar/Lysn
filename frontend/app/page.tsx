"use client";

import { motion } from "framer-motion";
import { Headphones, FileText, Share2, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/audio-player-context";

export default function Home() {
  const { isPlayerOpen } = useAudioPlayer();
  
  return (
    <div className={`flex flex-col items-center transition-all duration-500 ease-in-out ${isPlayerOpen ? 'mr-[320px]' : ''}`}>
      {/* Hero Section */}
      <section className="relative w-full px-4 pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 -z-10 h-full w-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-primary/5 blur-[120px] rounded-full" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6"
            >
              <Zap className="h-4 w-4" />
              <span>Experience the future of reading</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
            >
              Listen to your <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                documents
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
            >
              Lysn transforms your PDFs into high-quality, natural-sounding audio. 
              Go beyond reading and experience your content anywhere, anytime.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/auth"
                className="group flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20"
              >
                Start Listening for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#features"
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-input bg-background/50 backdrop-blur-sm px-8 text-sm font-semibold text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
              >
                Explore Features
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="w-full bg-secondary/30 py-24 px-4 border-y border-border/50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Powerful Features for Pro Consumers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to turn text into an immersive audio experience.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<FileText className="h-6 w-6" />}
              title="Instant PDF Conversion"
              description="Upload any PDF and watch it transform into a clear, structured audio script in seconds."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Natural AI Voices"
              description="Powered by state-of-the-art TTS technology for a human-like listening experience."
            />
            <FeatureCard
              icon={<Share2 className="h-6 w-6" />}
              title="Cloud Library"
              description="Your generated audios are stored securely in the cloud, accessible from any device."
            />
          </div>
        </div>
      </section>

      {/* Social Proof / Trust Section */}
      <section className="w-full py-24 px-4 overflow-hidden">
        <div className="mx-auto max-w-7xl text-center">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
            {/* Mock logos or partners */}
            <span className="text-2xl font-bold tracking-tighter">TECHLEASH</span>
            <span className="text-2xl font-bold tracking-tighter">PODFLOW</span>
            <span className="text-2xl font-bold tracking-tighter">LISTEN.IO</span>
            <span className="text-2xl font-bold tracking-tighter">AUDIOMIND</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group rounded-3xl border border-border/50 bg-background p-8 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/5 dark:hover:bg-zinc-900/50"
    >
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

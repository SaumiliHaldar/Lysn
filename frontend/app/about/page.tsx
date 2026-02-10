"use client";

import { motion } from "framer-motion";
import { Headphones, Mail, Github, Linkedin, Sparkles, Zap, Shield, Heart } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/audio-player-context";

export default function AboutPage() {
  const { isPlayerOpen } = useAudioPlayer();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={`relative min-h-screen pt-20 pb-16 overflow-hidden transition-all duration-500 ease-in-out ${isPlayerOpen ? 'lg:mr-[320px]' : ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-6 border border-primary/20">
            <Sparkles className="h-3 w-3" />
            Discover our mission
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
            Transforming how we <br />
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">consume information</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Lysn was born from a simple idea: that information should be accessible everywhere. 
            We turn your documents into high-quality audio, so you can learn while you move.
          </p>
        </motion.div>

        {/* Features / Why section */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
        >
          <FeatureCard 
            icon={<Zap className="h-6 w-6 text-primary" />}
            title="Instant Processing"
            description="Our advanced text-to-speech engine converts PDFs to MP3s in seconds, preserving your time for what matters."
          />
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-purple-500" />}
            title="Privacy First"
            description="Your documents are your business. We prioritize security and privacy, ensuring your data remains protected."
          />
          <FeatureCard 
            icon={<Sparkles className="h-6 w-6 text-primary" />}
            title="Natural Voice"
            description="Experience high-quality, natural-sounding audio that makes listening to long documents a pleasure."
          />
        </motion.div>

        {/* Creator Section */}
        <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-background/50 backdrop-blur-xl p-8 sm:p-12 mb-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="relative group mx-auto max-w-[320px]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary/20 bg-secondary shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                  <img 
                    src="/Saumili.jpg" 
                    alt="Saumili Haldar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold tracking-widest uppercase mb-4 border border-purple-500/20">
                Software Developer
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Meet the Developer
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Hi, I'm <span className="text-foreground font-semibold italic">Saumili Haldar</span>. 
                I built <span className="text-primary font-bold">Lysn</span> to bridge the gap between <span className="italic text-foreground/80">reading</span> and <span className="italic text-foreground/80">listening</span>. 
                As a developer who values <span className="text-purple-400 font-medium">efficiency</span> and <span className="text-purple-400 font-medium">accessibility</span>, I wanted a way to "read" my favorite articles 
                and documents during my daily commute without being glued to a screen.
              </p>
              <div className="flex flex-row gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                <SocialBtn href="https://github.com/SaumiliHaldar" icon={<Github className="h-5 w-5" />} label="GitHub" />
                <SocialBtn href="https://www.linkedin.com/in/saumili-haldar-0804s2003/" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
                <SocialBtn href="mailto:haldar.saumili843@gmail.com" icon={<Mail className="h-5 w-5" />} label="Contact" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Closing CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-12"
        >
          <Link 
            href="/auth" 
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-primary px-10 text-base font-bold text-primary-foreground shadow-2xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 hover:shadow-primary/30"
          >
            Start Your Journey
            <Zap className="ml-2 h-4 w-4 fill-current" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="group p-8 rounded-3xl border border-border/50 bg-secondary/20 backdrop-blur-sm transition-all hover:bg-secondary/40 hover:border-primary/30 hover:shadow-xl hover:shadow-black/5"
    >
      <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-background/80 shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}

function SocialBtn({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      target="_blank"
      className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl border border-border/50 bg-background/50 hover:bg-secondary transition-all hover:border-primary/40 active:scale-95 group"
    >
      <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
      <span className="hidden sm:inline text-xs sm:text-sm font-semibold whitespace-nowrap">{label}</span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { Headphones, Github, Linkedin, Heart, Mail } from "lucide-react";
import { useAudioPlayer } from "@/contexts/audio-player-context";
import { useState } from "react";
import { CookieModal } from "./cookie-modal";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { isPlayerOpen } = useAudioPlayer();
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  return (
    <footer className={`relative border-t border-border/50 bg-gradient-to-b from-background to-secondary/10 backdrop-blur-xl transition-all duration-500 ease-in-out ${isPlayerOpen ? "lg:mr-[320px]" : ""}`}>
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 group mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 transition-all group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/40">
                <Headphones className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Lysn
              </span>
            </Link>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground max-w-sm">
              Transform your PDFs into natural-sounding audio. Listen to your documents anywhere, anytime.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink href="https://github.com/SaumiliHaldar" icon={<Github className="h-4 w-4" />} label="GitHub" />
              <SocialLink href="https://www.linkedin.com/in/saumili-haldar-0804s2003/" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
              <SocialLink href="mailto:haldar.saumili843@gmail.com" icon={<Mail className="h-4 w-4" />} label="Email" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Product</h3>
              <ul className="space-y-2">
                <FooterLink href="/#features">Features</FooterLink>
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/library">Library</FooterLink>
                <FooterLink href="/dashboard">Dashboard</FooterLink>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2">
                <FooterLink href="/privacy">Privacy</FooterLink>
                <FooterLink href="/terms">Terms</FooterLink>
                <FooterLink href="/support">Support</FooterLink>
                <li>
                  <button
                    onClick={() => setIsCookieModalOpen(true)}
                    className="text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-flex items-center gap-1 active:scale-95 group"
                  >
                    <span className="group-hover:underline underline-offset-4 cursor-pointer">Cookies</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} Lysn. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-purple-500 fill-purple-500" />
              <span>by Saumili Haldar</span>
            </div>
          </div>
        </div>
      </div>
      
      <CookieModal isOpen={isCookieModalOpen} onOpenChange={setIsCookieModalOpen} />
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
      aria-label={label}
    >
      {icon}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-flex items-center gap-1 active:scale-95 group"
      >
        <span className="group-hover:underline underline-offset-4">{children}</span>
      </Link>
    </li>
  );
}


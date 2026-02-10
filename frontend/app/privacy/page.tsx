"use client";

import { motion } from "framer-motion";
import { Shield, ArrowLeft, Lock, Eye, FileLock, Bell, Server, Cpu } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/audio-player-context";

export default function PrivacyPage() {
  const { isPlayerOpen } = useAudioPlayer();

  return (
    <div className={`relative min-h-screen pt-20 pb-16 overflow-hidden transition-all duration-500 ease-in-out ${isPlayerOpen ? 'lg:mr-[320px]' : ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Privacy Framework
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            How Lysn protects your intellectual property and personal data.
          </p>
        </motion.div>

        <div className="space-y-12 pb-20">
          <section className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Lock className="h-6 w-6" />
              <h2 className="text-2xl font-bold m-0">1. Data Minimization</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We operate on a "privacy-by-default" principle. We only collect the data necessary to provide high-quality audio conversion:
            </p>
            <div className="grid gap-4 mt-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6">
                <div className="flex items-center gap-2 mb-3 text-foreground font-bold">
                  <Server className="h-4 w-4 text-primary" />
                  Cloud Infrastructure
                </div>
                <p className="text-sm text-muted-foreground">Your account details and converted audio metadata are stored in geo-redundant, encrypted databases.</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-secondary/20 p-6">
                <div className="flex items-center gap-2 mb-3 text-foreground font-bold">
                  <Cpu className="h-4 w-4 text-primary" />
                  AI Processing
                </div>
                <p className="text-sm text-muted-foreground">PDF text extraction occurs in temporary, isolated environments. Files are purged immediately after conversion.</p>
              </div>
            </div>
          </section>

          <section className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Eye className="h-6 w-6" />
              <h2 className="text-2xl font-bold m-0">2. Document Handling</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              When you upload a PDF to Lysn:
            </p>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                <span>The file is transmitted via **256-bit AES encryption** to our processing server.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                <span>Our system performs **OCR and text analysis** to identify structure, headings, and core content.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                <span>Text is synthesized into audio fragments using **Neural Voice technology**.</span>
              </li>
            </ul>
          </section>

          <section className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="flex items-center gap-3 text-primary mb-4">
              <FileLock className="h-6 w-6" />
              <h2 className="text-2xl font-bold m-0">3. Third-Party Intelligence</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We leverage industry-leading AI providers (like OpenAI or ElevenLabs) for text processing and voice synthesis. We ensure that our data processing agreements with these providers prohibit them from using your personal content to train their models.
            </p>
          </section>

          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
            <h3 className="text-xl font-bold text-foreground mb-4">Your Data, Your Control</h3>
            <p className="text-muted-foreground mb-8 text-balance max-w-md mx-auto">You can request full deletion of your account and all associated document metadata at any time through your dashboard.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/support"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
              >
                Contact Privacy Officer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

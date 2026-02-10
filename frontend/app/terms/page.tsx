"use client";

import { motion } from "framer-motion";
import { FileText, ArrowLeft, Scale, Globe, UserCheck, AlertTriangle, Copyright, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/audio-player-context";

export default function TermsPage() {
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
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Service Governance
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Legal boundaries and usage agreements for the Lysn platform.
          </p>
        </motion.div>

        <div className="space-y-12 pb-20">
          <section className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Scale className="h-6 w-6" />
              <h2 className="text-2xl font-bold m-0">1. Usage License</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Upon creating an account, Lysn grants you a limited, non-exclusive, non-transferable license to use our AI-powered conversion tools for personal or internal business use. You retain all ownership rights to the original content you upload.
            </p>
          </section>

          <section className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="flex items-center gap-3 text-primary mb-4">
              <Copyright className="h-6 w-6" />
              <h2 className="text-2xl font-bold m-0">2. Intellectual Property</h2>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                While you own your source documents, the underlying technology, including the proprietary software, design, and AI implementation of Lysn, remains the exclusive property of Lysn.
              </p>
              <div className="rounded-2xl border border-border/50 bg-secondary/30 p-6 flex gap-4 items-start">
                <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground">
                  <b>Generated Audio</b>: You are granted the right to use generated audio for personal consumption. Commercial redistribution of AI-generated audio may require a specific commercial license Tier.
                </p>
              </div>
            </div>
          </section>

          <section className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="flex items-center gap-3 text-primary mb-4">
              <UserCheck className="h-6 w-6" />
              <h2 className="text-2xl font-bold m-0">3. Acceptable Conduct</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You agree not to bypass our service limits or attempt to "jailbreak" our AI voice synthesis engines. Specifically, you may not:
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 list-none p-0">
              <li className="flex items-center gap-2 text-sm text-muted-foreground bg-background border border-border rounded-xl p-3">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Upload copyrighted material without authorization.
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground bg-background border border-border rounded-xl p-3">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Automate account creation or file processing.
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground bg-background border border-border rounded-xl p-3">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Resell our API services without permission.
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground bg-background border border-border rounded-xl p-3">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Reverse engineer our audio synthesis pipeline.
              </li>
            </ul>
          </section>

          <section className="prose prose-zinc dark:prose-invert max-w-none">
            <div className="flex items-center gap-3 text-primary mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-2xl font-bold m-0">4. Liability & Disclaimers</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-6 py-2">
              Lysn is provided on an "as-is" basis. AI-generated audio may occasionally contain inaccuracies or mispronunciations. We provide no warranty regarding the suitability of the audio for any specific purpose (including academic or professional transcription).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

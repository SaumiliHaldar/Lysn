"use client";

import { motion } from "framer-motion";
import { Headphones, ArrowLeft, Mail, HelpCircle, FileText, Shield } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/contexts/audio-player-context";

export default function SupportPage() {
  const { isPlayerOpen } = useAudioPlayer();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`relative min-h-screen pt-20 pb-16 overflow-hidden transition-all duration-500 ease-in-out ${isPlayerOpen ? 'lg:mr-[320px]' : ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <motion.div variants={itemVariants}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all mb-12 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </motion.div>

          <motion.div variants={itemVariants} className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-8 shadow-inner">
            <Headphones className="h-10 w-10" />
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50"
          >
            Support
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="max-w-2xl text-lg text-muted-foreground leading-relaxed"
          >
            Need help with your documents or have a technical question? Our team is dedicated to providing you with the best experience.
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid gap-8 mb-20"
        >
          <motion.section 
            variants={itemVariants}
            className="glass rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden group border-primary/5"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Mail className="h-32 w-32 -rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40">
                  <Mail className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Direct Support</h2>
              </div>
              
              <p className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed">
                For account inquiries, technical issues, or partnership opportunities, reach out to our support team. We're committed to answering all requests within 24 hours.
              </p>

              <a
                href="mailto:haldar.saumili843@gmail.com"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-primary px-6 sm:px-10 py-4 text-xs sm:text-sm md:text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30 w-full sm:w-auto text-center break-all sm:break-normal"
              >
                haldar.saumili843@gmail.com
              </a>
            </div>
          </motion.section>

          <motion.div variants={itemVariants} className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="h-10 w-1 rounded-full bg-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Common Questions</h2>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <FAQItem 
                icon={<FileText className="h-5 w-5" />}
                question="What file types can I upload?"
                answer="Lysn is optimized for high-fidelity PDF processing. We support digital exports and scanned documents via advanced OCR."
              />
              <FAQItem 
                icon={<Shield className="h-5 w-5" />}
                question="Is my data secure?"
                answer="Enterprise-grade encryption protecting your data at rest and in transit. Your privacy is baked into our architecture."
              />
              <FAQItem 
                icon={<HelpCircle className="h-5 w-5" />}
                question="How do I reset my password?"
                answer="You can reset your password from the login screen. We'll send a secure link to your registered email address."
              />
              <FAQItem 
                icon={<Headphones className="h-5 w-5" />}
                question="Custom integrations?"
                answer="We offer API access for enterprise partners. Contact us via email for documentation and custom pricing."
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function FAQItem({ icon, question, answer }: { icon: React.ReactNode; question: string; answer: string }) {
  return (
    <div className="glass group rounded-3xl p-6 transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-center gap-3 text-foreground font-bold mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
        {question}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pl-1">
        {answer}
      </p>
    </div>
  );
}

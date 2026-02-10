"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie, ShieldCheck, Info } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

interface CookieModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CookieModal({ isOpen, onOpenChange }: CookieModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="relative w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-[1.5rem] sm:rounded-[2rem] border border-border/50 bg-background/80 p-6 sm:p-10 shadow-2xl backdrop-blur-3xl">
                  <Dialog.Close className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full p-2 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground active:scale-90">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Close</span>
                  </Dialog.Close>

                  <div className="mb-6 sm:mb-8 flex items-center gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Cookie className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <Dialog.Title className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Cookie Preferences
                      </Dialog.Title>
                      <Dialog.Description className="text-xs sm:text-sm text-muted-foreground">
                        Manage how we use data to power your audio experience.
                      </Dialog.Description>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:gap-6 py-2">
                    <CookieOption 
                      icon={<ShieldCheck className="h-4 w-4" />}
                      title="Essential"
                      description="Required for authentication, security, and core document processing features."
                    />
                    <CookieOption 
                      icon={<Info className="h-4 w-4" />}
                      title="Performance"
                      description="Helps us optimize voice synthesis speed and identify conversion errors."
                    />
                    <CookieOption 
                      icon={<Info className="h-4 w-4" />}
                      title="Analytics"
                      description="Used to understand library usage and improve our AI model recommendations."
                    />
                  </div>

                  <div className="mt-6 sm:mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row pt-6 border-t border-border/30">
                    <p className="text-[10px] text-muted-foreground max-w-[200px] leading-tight text-center sm:text-left">
                      By clicking understand, you agree to our refined data collection policies.
                    </p>
                    <button
                      onClick={() => onOpenChange(false)}
                      className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                    >
                      I Understand
                    </button>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function CookieOption({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-border/50 transition-colors group">
      <div className="mt-1 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-xs sm:text-sm font-bold text-foreground">{title}</h4>
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Headphones, Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAudioPlayer } from "@/contexts/audio-player-context";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isPlayerOpen } = useAudioPlayer();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.auth.getMe();
        setUser(data.user);
      } catch (err) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5" 
          : "bg-background/60 backdrop-blur-md border-b border-border/30"
      }`}
    >
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-500 ease-in-out ${isPlayerOpen ? 'mr-[320px]' : ''}`}>
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/30">
              <Headphones className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Lysn
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-1">
              <NavLink href="/" isActive={pathname === "/"}>Home</NavLink>
              <NavLink href="/library" isActive={pathname === "/library"}>Library</NavLink>
              
              {user ? (
                <Link href="/dashboard" className="flex items-center ml-4 group">
                  <div className={`h-9 w-9 overflow-hidden rounded-full bg-secondary transition-all group-hover:border-primary/40 group-hover:shadow-md ${
                    pathname === "/dashboard" 
                      ? "border-[3px] border-white/40 shadow-sm" 
                      : "border-2 border-primary/20"
                  }`}>
                    {user.profile_pic ? (
                      <img src={user.profile_pic} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="ml-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:scale-105"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="space-y-1 px-4 pb-6 pt-4">
              <MobileNavLink href="/" isActive={pathname === "/"}>Home</MobileNavLink>
              <MobileNavLink href="/library" isActive={pathname === "/library"}>Library</MobileNavLink>
              
              {user ? (
                <div className="mt-4 flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/50 backdrop-blur-sm">
                  <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-secondary text-primary">
                    {user.profile_pic ? (
                      <img src={user.profile_pic} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm font-medium transition-all relative group ${
        isActive 
          ? "text-foreground" 
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all group-hover:w-3/4 rounded-full" />
    </Link>
  );
}

function MobileNavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-4 py-3 text-base font-medium transition-all backdrop-blur-sm ${
        isActive
          ? "bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      }`}
    >
      {children}
    </Link>
  );
}

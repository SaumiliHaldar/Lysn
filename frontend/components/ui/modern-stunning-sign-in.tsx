"use client" 

import * as React from "react"
import { useState } from "react";
import { Headphones, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SignIn1 = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
 
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
 
  const handleSignIn = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    alert("Sign in successful! (Demo)");
  };
 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Centered glass card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl border border-white/10 shadow-2xl p-8 flex flex-col items-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white mb-6 shadow-xl shadow-primary/20">
          <Headphones className="h-8 w-8" />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white mb-2 text-center tracking-tight">
          Lysn
        </h2>
        <p className="text-zinc-400 text-sm mb-8 text-center px-4">
          Convert your thoughts into high-fidelity AI voices.
        </p>

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <div className="relative">
              <input
                placeholder="Email"
                type="email"
                value={email}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                placeholder="Password"
                type="password"
                value={password}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-400 text-left px-2"
              >
                {error}
              </motion.div>
            )}
          </div>

          <div className="mt-2 text-right">
            <a href="#" className="text-xs text-zinc-500 hover:text-white transition-colors">Forgot password?</a>
          </div>

          <div className="mt-2 space-y-4">
            <button
              onClick={handleSignIn}
              className="group w-full bg-white text-black font-bold px-5 py-4 rounded-2xl shadow-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 text-sm"
            >
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Google Sign In */}
            <button className="w-full flex items-center justify-center gap-3 bg-zinc-900 border border-white/10 rounded-2xl px-5 py-4 font-semibold text-white shadow-lg hover:bg-zinc-800 transition-all text-sm">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>
            
            <div className="w-full text-center mt-6">
              <span className="text-xs text-zinc-500">
                Don&apos;t have an account?{" "}
                <a
                  href="#"
                  className="font-bold text-white hover:underline"
                >
                  Join for free
                </a>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User count and avatars */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 mt-12 flex flex-col items-center text-center px-4"
      >
        <p className="text-zinc-500 text-sm mb-4">
          Trusted by <span className="font-bold text-white">5,000+</span> creators worldwide
        </p>
        <div className="flex -space-x-3">
          {[
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=64&h=64&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=64&h=64&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=64&h=64&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=64&h=64&auto=format&fit=crop"
          ].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="user"
              className="w-10 h-10 rounded-full border-4 border-[#121212] object-cover hover:scale-110 transition-transform cursor-pointer"
            />
          ))}
          <div className="w-10 h-10 rounded-full border-4 border-[#121212] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
            +2.4k
          </div>
        </div>
      </motion.div>
    </div>
  );
};
 
export { SignIn1 };

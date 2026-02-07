"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headphones, Mail, ArrowRight, Loader2, CheckCircle2, ShieldCheck, Lock, Eye, EyeOff, KeyRound, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AuthMode = "signup" | "login" | "forgot-password";
type AuthStep = "email" | "otp" | "password" | "set-password" | "success";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const router = useRouter();

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const startOtpTimer = () => {
    setOtpTimer(300); // 5 minutes = 300 seconds
    setCanResendOtp(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (mode === "forgot-password") {
        await api.auth.requestPasswordReset(email);
      } else {
        await api.auth.requestOtp(email, name);
      }
      startOtpTimer();
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");
    setOtp("");
    try {
      if (mode === "forgot-password") {
        await api.auth.requestPasswordReset(email);
      } else {
        await api.auth.requestOtp(email, name);
      }
      startOtpTimer();
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (mode === "forgot-password") {
        await api.auth.verifyPasswordReset(email, otp);
        setStep("set-password");
      } else {
        const response = await api.auth.verifyOtp(email, otp, name);
        // Check if this is a new user by trying to get user info
        try {
          const userInfo = await api.auth.getMe();
          // If user has no password set or is new, show set-password
          setIsNewUser(true);
          setStep("set-password");
        } catch {
          // Existing user, redirect to dashboard
          setStep("success");
          setTimeout(() => window.location.href = "/", 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await api.auth.login(email, password);
      setStep("success");
      setTimeout(() => window.location.href = "/", 2000);
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (mode === "forgot-password") {
        // In forgot-password mode, we use the verify endpoint with the new password
        // This relies on the previous step verifying the OTP, and the OTP still being valid
        await api.auth.verifyPasswordReset(email, otp, newPassword);
        
        toast.success("Password Reset Successfully!", {
          description: "Please login with your new password.",
        });
        
        // Return to login
        setStep("email");
        setMode("login");
      } else {
        // Normal flow (e.g. new user setting password)
        await api.auth.setPassword(oldPassword, newPassword);
        
        toast.success("Password Set Successfully!", {
          description: "Please login with your new password.",
        });
        
        setStep("email");
        setMode("login");
      }
      
      setOldPassword("");
      setNewPassword("");
      setPassword("");
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to set password");
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setStep("email");
    setError("");
    setEmail("");
    setPassword("");
    setOtp("");
    setName("");
  };

  const switchToOtpLogin = () => {
    setStep("email");
    setMode("signup");
    setError("");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border/50 bg-background shadow-2xl"
      >
        <div className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Headphones className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {step === "email" && mode === "signup" && "Create Account"}
              {step === "email" && mode === "login" && "Welcome Back"}
              {step === "email" && mode === "forgot-password" && "Reset Password"}
              {step === "otp" && "Verify your email"}
              {step === "password" && "Enter Password"}
              {step === "set-password" && "Set Your Password"}
              {step === "success" && "Welcome aboard!"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {step === "email" && mode === "signup" && "Sign up to start listening"}
              {step === "email" && mode === "login" && "Login to continue"}
              {step === "email" && mode === "forgot-password" && "We'll send you a reset code"}
              {step === "otp" && `Code sent to ${email}`}
              {step === "password" && "Enter your password to continue"}
              {step === "set-password" && mode === "forgot-password" && "Enter your new password"}
              {step === "set-password" && mode !== "forgot-password" && "Check your email for temporary password"}
              {step === "success" && "Redirecting to dashboard..."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Email Step - Signup Mode */}
            {step === "email" && mode === "signup" && (
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRequestOtp}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-destructive ml-1">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continue with Email
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <span className="relative bg-background px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <a
                  href={api.auth.googleLoginUrl}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/50 bg-background py-2.5 text-sm font-medium transition-all hover:bg-secondary/50"
                >
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="h-5 w-5" />
                  Sign in with Google
                </a>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  Have an account?{" "}
                  <button type="button" onClick={() => switchMode("login")} className="text-primary hover:underline font-medium">
                    Login
                  </button>
                </p>
              </motion.form>
            )}

            {/* Email Step - Login Mode */}
            {step === "email" && mode === "login" && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePasswordLogin}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={switchToOtpLogin}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Login with OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot-password")}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                </button>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <span className="relative bg-background px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Or continue with
                  </span>
                </div>

                <a
                  href={api.auth.googleLoginUrl}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/50 bg-background py-2.5 text-sm font-medium transition-all hover:bg-secondary/50"
                >
                  <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="h-5 w-5" />
                  Sign in with Google
                </a>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  New user?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="text-primary hover:underline font-medium">
                    Sign up
                  </button>
                </p>
              </motion.form>
            )}

            {/* Email Step - Forgot Password Mode */}
            {step === "email" && mode === "forgot-password" && (
              <motion.form
                key="forgot-password-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRequestOtp}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-destructive ml-1">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Code"}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to Login
                </button>
              </motion.form>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1 text-center">Enter Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-input bg-background px-4 py-3 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                
                {error && <p className="text-xs text-destructive text-center">{error}</p>}
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Continue"}
                </button>
                
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResendOtp || isLoading}
                    className="text-purple-500 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {canResendOtp ? "Resend Code" : `Resend in ${formatTime(otpTimer)}`}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Set Password Step */}
            {step === "set-password" && (
              <motion.form
                key="set-password-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSetPassword}
                className="space-y-3.5"
              >
                <div>
                  {mode !== "forgot-password" && (
                    <>
                      <label className="block text-sm font-medium mb-1.5 ml-1">Temporary Password</label>
                      <div className="relative mb-3.5">
                        <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type={showOldPassword ? "text" : "password"}
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="From your email"
                          className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2.5 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-destructive ml-1">{error}</p>}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set Password"}
                </button>
              </motion.form>
            )}

            {/* Success Step */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-8"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium animate-pulse">Redirecting you to dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-border/50 bg-secondary/30 px-8 py-3.5">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Your data is protected and secure
          </div>
        </div>
      </motion.div>
    </div>
  );
}

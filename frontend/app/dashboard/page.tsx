"use client";

import { useEffect, useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { api } from "@/lib/api";
import { Headphones, Library, LogOut, User, Clock, PlayCircle, Trash2, PauseCircle, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioPlayer } from "@/components/audio-player";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAudioPlayer } from "@/contexts/audio-player-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [audios, setAudios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; audioId: string; filename: string }>({
    open: false,
    audioId: "",
    filename: "",
  });
  const router = useRouter();
  const { playAudio: playAudioGlobal, currentAudio, isPlaying, togglePlay, isPlayerOpen } = useAudioPlayer();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userData = await api.auth.getMe() as { user: any };
      setUser(userData.user);
      const audioData = await api.audio.list();
      setAudios(audioData.audios);
    } catch (err) {
      router.push("/auth");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    window.location.href = "/";
  };

  const playAudio = (audio: any, index: number) => {
    if (currentAudio?.audio_id === audio.audio_id) {
        togglePlay();
        return;
    }

    const audioWithUrl = {
      ...audio,
      url: api.audio.getUrl(audio.audio_id)
    };
    playAudioGlobal(audioWithUrl, index, audios.map(a => ({ ...a, url: api.audio.getUrl(a.audio_id) })));
  };

  const handleDelete = (audioId: string, filename: string) => {
    setDeleteDialog({ open: true, audioId, filename });
  };

  const confirmDelete = async () => {
    const { audioId, filename } = deleteDialog;
    setDeleteDialog({ open: false, audioId: "", filename: "" });
    setDeletingId(audioId);
    
    try {
      await api.audio.delete(audioId);
      // Refresh the audio list
      await fetchData();
      toast.success("Audio Deleted", {
        description: `"${filename}" has been removed from your library.`,
      });
    } catch (err: any) {
      toast.error("Delete Failed", {
        description: err.message || "Failed to delete audio. Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen pt-20 sm:pt-24 pb-20 overflow-hidden transition-all duration-500 ease-in-out ${isPlayerOpen ? 'lg:mr-[320px]' : ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-2xl bg-primary/10 border border-primary/20 p-0.5">
             {user?.profile_pic ? (
               <img src={user.profile_pic} alt={user.name} className="h-full w-full object-cover rounded-[14px]" />
             ) : (
               <div className="flex h-full w-full items-center justify-center text-primary bg-primary/5 rounded-[14px]">
                 <User className="h-6 w-6 sm:h-8 sm:w-8" />
               </div>
             )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Welcome back, {user?.name || "Listener"}</h1>
            <p className="text-sm text-muted-foreground truncate opacity-80">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm px-4 py-2.5 sm:px-5 sm:py-2 text-sm sm:text-xs font-semibold hover:bg-destructive hover:text-white hover:border-destructive transition-all active:scale-95 shadow-sm"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
        {/* Left: Upload */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">New Conversion</h2>
          </div>
          <UploadZone onSuccess={() => fetchData()} />
          <div className="bg-secondary/20 p-4 rounded-2xl border border-border/50 backdrop-blur-sm shadow-sm group hover:border-primary/20 transition-all">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-primary group-hover:underline">Pro Tip:</span> For the best results, ensure your PDF has a clear heading structure. Our AI works best with structured text.
            </p>
          </div>
        </div>

        {/* Right: Library */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Library className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">Your Library</h2>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-primary/20">
              {audios.length} <span className="hidden sm:inline">{audios.length === 1 ? 'Item' : 'Items'}</span>
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto overflow-x-hidden p-1 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] custom-scrollbar -mx-1 px-1">
            {audios.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px] p-6 sm:p-8 text-center rounded-3xl border-2 border-dashed border-border/50 bg-secondary/10 hover:border-primary/30 hover:bg-secondary/20 transition-all group">
                <div className="h-12 w-12 sm:h-16 sm:w-16 flex items-center justify-center rounded-full bg-secondary/30 mb-4 group-hover:scale-110 transition-transform">
                  <Library className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-muted-foreground">Your library is empty</p>
                <p className="text-xs sm:text-sm text-muted-foreground/60 mt-2 max-w-[200px]">Convert your first PDF to see it here</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {audios.map((audio, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    key={audio.audio_id}
                    className="group flex items-center gap-3 sm:gap-4 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-3 sm:p-4 transition-all hover:bg-secondary/40 hover:shadow-xl hover:border-primary/20"
                  >
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground transition-all group-hover:bg-primary/20 group-hover:text-primary border border-transparent group-hover:border-primary/20">
                      <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{audio.filename}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">{audio.uploaded}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => playAudio(audio, i)}
                        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50 text-foreground transition-all hover:bg-primary hover:text-white group-hover:scale-105 active:scale-95 shadow-sm"
                        title={currentAudio?.audio_id === audio.audio_id && isPlaying ? "Pause audio" : "Play audio"}
                      >
                        {currentAudio?.audio_id === audio.audio_id && isPlaying ? (
                          <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(audio.audio_id, audio.filename)}
                        disabled={deletingId === audio.audio_id}
                        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50 text-foreground transition-all hover:bg-destructive hover:text-white group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
                        title="Delete audio"
                      >
                        {deletingId === audio.audio_id ? (
                          <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent className="w-[90%] sm:w-full rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.filename}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, audioId: "", filename: "" })} className="mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}

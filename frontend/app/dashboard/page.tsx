"use client";

import { useEffect, useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { api } from "@/lib/api";
import { Headphones, Library, LogOut, User, Clock, PlayCircle, Trash2 } from "lucide-react";
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
  const { playAudio: playAudioGlobal, currentAudio } = useAudioPlayer();

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
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 transition-all duration-500 ease-in-out ${currentAudio ? 'mr-[320px]' : ''}`}>
      {/* Header */}
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-2xl bg-primary/10">
             {user?.profile_pic ? (
               <img src={user.profile_pic} alt={user.name} className="h-full w-full object-cover" />
             ) : (
               <div className="flex h-full w-full items-center justify-center text-primary">
                 <User className="h-8 w-8" />
               </div>
             )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name || "Listener"}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 self-start rounded-full border border-border/50 bg-background/50 px-4 py-2 text-xs font-semibold hover:bg-destructive hover:text-white transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Left: Upload */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Headphones className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">New Conversion</h2>
          </div>
          <UploadZone onSuccess={() => fetchData()} />
          <p className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-2xl leading-relaxed">
            <span className="font-semibold text-foreground">Pro Tip:</span> For the best results, ensure your PDF has a clear heading structure. Our AI works best with structured text.
          </p>
        </div>

        {/* Right: Library */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Library className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Your Library</h2>
            </div>
            <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
              {audios.length} items
            </span>
          </div>

          <div className="max-h-[365px] space-y-3 overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
            {audios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed">
                <Library className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">Your library is empty</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Convert your first PDF to see it here</p>
              </div>
            ) : (
              audios.map((audio, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={audio.audio_id}
                  className="group flex items-center gap-4 rounded-2xl border border-border/50 bg-background p-4 transition-all hover:bg-secondary/40 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-all group-hover:bg-primary/20 group-hover:text-primary">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{audio.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{audio.uploaded}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playAudio(audio, i)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-all hover:bg-primary hover:text-primary-foreground group-hover:scale-105"
                      title="Play audio"
                    >
                      <PlayCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(audio.audio_id, audio.filename)}
                      disabled={deletingId === audio.audio_id}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-all hover:bg-destructive hover:text-white group-hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete audio"
                    >
                      {deletingId === audio.audio_id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.filename}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialog({ open: false, audioId: "", filename: "" })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Library as LibraryIcon, PlayCircle, Trash2, Clock, FileAudio, Search, Filter, PauseCircle, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioPlayer } from "@/components/audio-player";
import { toast } from "sonner";
import { useAudioPlayer } from "@/contexts/audio-player-context";
import Link from "next/link";
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

export default function LibraryPage() {
  const [audios, setAudios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; audioId: string; filename: string }>({
    open: false,
    audioId: "",
    filename: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { playAudio: playAudioGlobal, currentAudio, isPlaying, togglePlay, isPlayerOpen } = useAudioPlayer();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const audioData = await api.audio.list();
      setAudios(audioData.audios || []);
    } catch (err: any) {
      if (err.status === 401) {
        toast.error("Access Denied", {
          description: "Login or Signup to view your library",
        });
      } else {
        toast.error("Failed to load library", {
          description: err.message || "Could not fetch your audio files.",
        });
      }
    } finally {
      setIsLoading(false);
    }
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
    playAudioGlobal(audioWithUrl, index, filteredAudios.map(a => ({ ...a, url: api.audio.getUrl(a.audio_id) })));
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "Recently added";
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Recently added";
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredAudios = audios.filter(audio =>
    audio.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative min-h-screen pt-20 pb-16 overflow-hidden transition-all duration-500 ease-in-out ${isPlayerOpen ? 'lg:mr-[320px]' : ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LibraryIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Library</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {audios.length} {audios.length === 1 ? 'audio file' : 'audio files'}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 p-2 rounded-lg bg-primary/10 backdrop-blur-md border border-primary/20 text-muted-foreground z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search your library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 h-[44px] sm:h-[52px] rounded-xl border border-border bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm sm:text-base flex items-center"
              />
            </div>

            {/* Guidelines Note */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 w-full lg:w-auto"
            >
              <Link 
                href="/dashboard"
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 h-auto lg:h-[52px] rounded-2xl bg-secondary/30 border border-border/50 backdrop-blur-sm hover:bg-secondary/50 hover:border-primary/30 transition-all group py-4 lg:py-0"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap">Expand Collection</p>
                    <p className="hidden xl:block text-[11px] text-muted-foreground border-l border-border/50 pl-2">Upload more files or start conversions in Dashboard.</p>
                  </div>
                </div>
                <div className="flex items-center justify-center h-8 px-4 rounded-xl bg-primary/10 text-primary text-[10px] font-bold tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  DASHBOARD
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="mt-4 text-muted-foreground">Loading your library...</p>
          </div>
        ) : filteredAudios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <FileAudio className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">
              {searchQuery ? "No results found" : "Your library is empty"}
            </h3>
            <p className="mt-2 text-muted-foreground text-center max-w-sm">
              {searchQuery 
                ? `No audio files match "${searchQuery}"`
                : "Upload your first PDF to start building your audio library"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredAudios.map((audio, index) => (
                <motion.div
                  key={audio.audio_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-5 sm:p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Audio Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <FileAudio className="h-7 w-7" />
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(audio.audio_id, audio.filename)}
                      disabled={deletingId === audio.audio_id}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all disabled:opacity-50"
                    >
                      {deletingId === audio.audio_id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive/20 border-t-destructive" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* File Info */}
                  <h3 className="font-semibold text-foreground mb-2 truncate group-hover:text-primary transition-colors">
                    {audio.filename}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatDate(audio.created_at)}</span>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => playAudio(audio, index)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/20"
                  >
                    {currentAudio?.audio_id === audio.audio_id && isPlaying ? (
                        <PauseCircle className="h-4 w-4" />
                    ) : (
                        <PlayCircle className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                        {currentAudio?.audio_id === audio.audio_id && isPlaying ? "Pause Audio" : "Play Audio"}
                    </span>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
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

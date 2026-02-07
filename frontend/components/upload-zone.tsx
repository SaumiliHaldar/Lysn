"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface UploadZoneProps {
  onSuccess: (audioId: string) => void;
}

export function UploadZone({ onSuccess }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setError("");
    try {
      const res = await api.pdf.upload(file);
      setStatus("success");
      toast.success("Audio Generated!", {
        description: `"${file.name}" has been converted to audio successfully.`,
      });
      onSuccess(res.audio_id);
      setTimeout(() => {
        setFile(null);
        setStatus("idle");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Upload failed");
      setStatus("error");
      toast.error("Conversion Failed", {
        description: err.message || "Failed to convert PDF to audio. Please try again.",
      });
      
      if (err.message && err.message.includes("already exists")) {
        setFile(null);
        setStatus("idle");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed p-12 transition-all min-h-[280px] flex items-center justify-center ${
          isDragActive
            ? "border-primary bg-primary/5 ring-4 ring-primary/10"
            : "border-border/50 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/40"
        }`}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Upload your PDF</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Drag and drop your document here, or click to browse.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Max file size: 10MB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-10 w-10" />
                </div>
                {status !== "uploading" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mb-6 text-sm font-semibold truncate max-w-xs">{file.name}</p>
              
              <button
                disabled={status === "uploading"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                className="group flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-70"
              >
                {status === "uploading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Converting to Audio...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Success!
                  </>
                ) : (
                  "Start Conversion"
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

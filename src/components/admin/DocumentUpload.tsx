"use client";

import { useRef, useState } from "react";
import { uploadDocuments } from "@/lib/api/documents";
import { ApiError } from "@/types/api";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, cn } from "@/lib/utils";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

function validateFiles(files: File[]): string | null {
  const allowedExtensions = [".pdf", ".docx", ".txt", ".csv", ".md"];

  for (const file of files) {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      return `"${file.name}" is not a supported file type. Allowed: PDF, DOCX, TXT, CSV, MD`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB size limit`;
    }
  }

  return null;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const fileArray = Array.from(files);
    const validationError = validateFiles(fileArray);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSuccess(null);
    setSelectedFiles(fileArray);
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadDocuments(selectedFiles);
      setSuccess(response.message);
      setSelectedFiles([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      onUploadComplete();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to upload documents";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card
      title="Upload Documents"
      description={`Supported: PDF, DOCX, TXT, CSV, MD — max ${MAX_FILE_SIZE_MB} MB per file`}
    >
      <div
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-cyan-400/50 bg-cyan-500/10"
            : "border-white/15 bg-white/3",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <p className="text-sm font-medium text-slate-300">
          Drag and drop files here, or{" "}
          <button
            type="button"
            className="text-cyan-400 hover:text-cyan-300"
            onClick={() => inputRef.current?.click()}
          >
            browse
          </button>
        </p>

        {selectedFiles.length > 0 && (
          <ul className="mt-4 space-y-1 text-left text-sm text-slate-400">
            {selectedFiles.map((file) => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <Alert variant="error" className="mt-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="mt-4">
          {success}
        </Alert>
      )}

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleUpload}
          isLoading={isUploading}
          disabled={selectedFiles.length === 0}
        >
          Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""}
        </Button>
      </div>
    </Card>
  );
}

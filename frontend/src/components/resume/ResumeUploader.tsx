import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../api/client";

interface ResumeUploaderProps {
  onUpload: (file: File) => Promise<void>;
}

const ACCEPTED_TYPES = ".pdf,.doc,.docx";
const MAX_SIZE_MB = 5;

export function ResumeUploader({ onUpload }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
      toast.success("Resume uploaded and parsed");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't upload that resume."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        isDragging ? "border-brand-400 bg-brand-50" : "border-slate-300 hover:border-brand-300"
      }`}
    >
      <UploadCloud className="mb-2 h-8 w-8 text-slate-400" />
      <p className="text-sm font-medium text-slate-700">{uploading ? "Uploading..." : "Drag & drop your resume, or click to browse"}</p>
      <p className="mt-1 text-xs text-slate-400">PDF or Word, up to {MAX_SIZE_MB}MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

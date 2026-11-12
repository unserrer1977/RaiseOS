"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircleIcon, UploadFileIcon } from "@/components/icons";

export function Uploader() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function send(file: File) {
    setError("");
    setPending(true);
    const body = new FormData();
    body.set("deck", file);
    const response = await fetch("/api/ingest", { method: "POST", body });
    const payload = (await response.json().catch(() => null)) as { id?: string; error?: string } | null;
    if (!response.ok || !payload?.id) {
      setPending(false);
      setError(payload?.error ?? "Upload failed.");
      return;
    }
    router.push(`/a/${payload.id}`);
  }

  return (
    <div>
      <label
        className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-[20px] border-[1.5px] border-dashed px-6 py-10 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-accent ${
          dragging ? "border-accent bg-accent-tint" : "border-line-strong bg-card"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file && !pending) void send(file);
        }}
      >
        <span className="text-accent">
          <UploadFileIcon size={36} />
        </span>
        <span className="font-serif text-3xl leading-tight text-ink">
          {dragging ? "Release to upload" : "Drop the deck"}
        </span>
        <span className="max-w-sm text-sm text-muted">
          PDF or PPTX, up to 50MB. Keynote needs a PDF export. The file stays in your private storage
          and is not used to train a model.
        </span>
        <input
          type="file"
          accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void send(file);
          }}
        />
        <span className="mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm text-paper">
          {pending ? "Reading the deck…" : "Choose a file"}
        </span>
      </label>
      {error ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-danger" role="alert">
          <AlertCircleIcon size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

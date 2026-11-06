"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function Uploader() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

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
        className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card px-6 py-10 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void send(file);
        }}
      >
        <span className="font-serif text-3xl text-ink">Drop the deck</span>
        <span className="mt-3 max-w-sm text-sm text-muted">
          PDF or PPTX, up to 50MB. Keynote needs a PDF export. The file stays in your private storage and is not used to train a model.
        </span>
        <input
          type="file"
          accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void send(file);
          }}
        />
        <span className="mt-6 rounded-full bg-ink px-5 py-2 text-sm text-paper">
          {pending ? "Reading the deck…" : "Choose a file"}
        </span>
      </label>
      {error ? (
        <p className="mt-4 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

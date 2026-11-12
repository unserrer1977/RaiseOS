"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircleIcon, LinkIcon, UploadFileIcon } from "@/components/icons";

type Mode = "file" | "link";

export function AngelUploader() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("file");
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function send(body: FormData) {
    setError("");
    setPending(true);
    const response = await fetch("/api/angel/ingest", { method: "POST", body }).catch(() => null);
    const payload = (await response?.json().catch(() => null)) as { id?: string; error?: string } | null;
    if (!response?.ok || !payload?.id) {
      setPending(false);
      setError(payload?.error ?? "Something went wrong. Try again.");
      return;
    }
    router.push(`/angel/a/${payload.id}`);
  }

  function sendFile(file: File) {
    const body = new FormData();
    body.set("deck", file);
    void send(body);
  }

  function sendLink(event: React.FormEvent) {
    event.preventDefault();
    if (!link.trim() || pending) return;
    const body = new FormData();
    body.set("url", link.trim());
    void send(body);
  }

  const tab = (value: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === value}
      onClick={() => {
        setMode(value);
        setError("");
      }}
      className={`min-h-10 rounded-md px-4 text-sm font-medium ${
        mode === value ? "bg-card text-ink shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div role="tablist" aria-label="How to share the deck" className="mb-4 inline-flex gap-1 rounded-lg bg-secondary p-1">
        {tab("file", "Upload a file")}
        {tab("link", "Paste a link")}
      </div>

      {mode === "file" ? (
        <label
          className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-[1.5px] border-dashed px-6 py-10 text-center transition-colors focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-accent ${
            dragging ? "border-accent bg-accent-soft" : "border-line-strong bg-card"
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
            if (file && !pending) sendFile(file);
          }}
        >
          <span className="text-ink">
            <UploadFileIcon size={36} />
          </span>
          <span className="text-xl font-semibold leading-tight text-ink">
            {dragging ? "Release to upload" : "Drop the founder’s deck"}
          </span>
          <span className="max-w-sm text-sm text-muted">
            PDF or PPTX, up to 50 MB. Keynote needs a PDF export. No account or password needed.
          </span>
          <input
            type="file"
            accept=".pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="sr-only"
            disabled={pending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) sendFile(file);
            }}
          />
          <span className="mt-3 inline-flex min-h-11 items-center rounded-md font-medium bg-ink px-5 text-sm text-white">
            {pending ? "Reading the deck…" : "Choose a file"}
          </span>
        </label>
      ) : (
        <form
          onSubmit={sendLink}
          className="flex min-h-56 flex-col justify-center gap-4 rounded-lg border-[1.5px] border-dashed border-line-strong bg-card px-6 py-10"
        >
          <label className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-xl font-semibold leading-tight text-ink">
              <span className="text-ink">
                <LinkIcon size={28} />
              </span>
              Paste the deck link
            </span>
            <span className="text-sm text-muted">
              A direct link to a PDF or PPTX, or a public Google Drive, Google Slides or Dropbox share link.
            </span>
            <input
              type="url"
              inputMode="url"
              required
              value={link}
              disabled={pending}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://"
              className="mt-2 h-11 w-full rounded-md border border-line-strong bg-card px-3 text-base text-ink shadow-sm outline-none focus:border-ink focus:ring-2 focus:ring-accent/50"
            />
          </label>
          <p role="status" className="flex items-start gap-2.5 rounded-md border border-warn/25 bg-warn-tint/60 px-3.5 py-3 text-sm text-warn">
            <span className="mt-0.5 shrink-0">
              <AlertCircleIcon />
            </span>
            <span>
              Please check the link doesn’t need a password, sign-in or email to open. We can only read decks
              that anyone with the link can access. If it’s protected, download the deck and upload the file
              instead.
            </span>
          </p>
          <div>
            <button
              type="submit"
              disabled={pending || !link.trim()}
              className="inline-flex min-h-11 items-center rounded-md font-medium bg-ink px-5 text-sm text-white disabled:opacity-60"
            >
              {pending ? "Fetching the deck…" : "Assess this deck"}
            </button>
          </div>
        </form>
      )}

      {error ? (
        <p className="mt-4 flex items-start gap-2 text-sm text-danger" role="alert">
          <span className="mt-0.5 shrink-0">
            <AlertCircleIcon size={16} />
          </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import http from "node:http";
import https from "node:https";
import { BlockList, isIP } from "node:net";
import { MAX_DECK_BYTES, kindFromBytes } from "@/lib/ingest/deck";

const TIMEOUT_MS = 25_000;
const MAX_REDIRECTS = 5;

export const PASSWORD_HINT =
  "Check the link opens the file without a password, sign-in or email gate, then try again. Or download the deck and upload the file instead.";

export type FetchedDeck =
  | { bytes: Uint8Array; fileName: string; kind: "pdf" | "pptx" }
  | { error: string };

/**
 * Downloads a deck from a public link. Rewrites common share links (Google Drive,
 * Google Slides, Dropbox) to their direct-download form, refuses private network
 * addresses, follows a few redirects and caps the size.
 */
export async function fetchDeckFromUrl(raw: string): Promise<FetchedDeck> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { error: "That does not look like a web link. Paste the full address, starting with https://." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { error: "Only http and https links can be fetched." };
  }
  if (url.username || url.password) {
    return { error: "Links with a username or password in them cannot be used." };
  }
  url = toDirectDownload(url);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    let response: Awaited<ReturnType<typeof request>>;
    try {
      response = await request(url);
    } catch (error) {
      if (error instanceof BlockedAddressError) return { error: "That link points to a private address." };
      if (error instanceof TooLargeError) return { error: "Decks must be 50MB or smaller." };
      return { error: `The link could not be reached. ${PASSWORD_HINT}` };
    }

    if (response.status >= 300 && response.status < 400 && response.location) {
      try {
        url = toDirectDownload(new URL(response.location, url));
      } catch {
        return { error: "The link redirected somewhere unexpected." };
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") {
        return { error: "The link redirected somewhere unexpected." };
      }
      continue;
    }
    if (response.status === 401 || response.status === 403) {
      return { error: `That link needs a password or sign-in, so we can't open it. ${PASSWORD_HINT}` };
    }
    if (response.status === 404) return { error: "Nothing was found at that link." };
    if (response.status < 200 || response.status >= 300) {
      return { error: `The link returned an error (${response.status}). ${PASSWORD_HINT}` };
    }

    const kind = kindFromBytes(response.body);
    if (!kind) {
      const looksLikePage = /text\/html/i.test(response.contentType) || startsWithHtml(response.body);
      return {
        error: looksLikePage
          ? `That link opened a web page, not a PDF or PPTX file. It may be behind a password, sign-in or viewer. ${PASSWORD_HINT}`
          : "That link did not return a PDF or PPTX file.",
      };
    }
    return { bytes: response.body, fileName: fileNameFor(url, response.disposition, kind), kind };
  }
  return { error: "The link redirected too many times." };
}

/** Maps common share-page links to links that return the file itself. */
export function toDirectDownload(url: URL): URL {
  const host = url.hostname.toLowerCase();
  if (host === "drive.google.com") {
    const match = url.pathname.match(/\/file\/d\/([^/]+)/);
    const id = match?.[1] ?? url.searchParams.get("id");
    if (id) return new URL(`https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`);
  }
  if (host === "docs.google.com") {
    const match = url.pathname.match(/\/presentation\/d\/([^/]+)/);
    if (match && match[1] !== "e") {
      return new URL(`https://docs.google.com/presentation/d/${encodeURIComponent(match[1])}/export/pdf`);
    }
  }
  if (host === "www.dropbox.com" || host === "dropbox.com") {
    const next = new URL(url);
    next.searchParams.delete("dl");
    next.searchParams.set("dl", "1");
    return next;
  }
  return url;
}

const blocked = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const) {
  blocked.addSubnet(net, prefix, "ipv4");
}
for (const [net, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
  ["64:ff9b::", 96],
  ["2001:db8::", 32],
] as const) {
  blocked.addSubnet(net, prefix, "ipv6");
}

export function isPrivateAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return blocked.check(address, "ipv4");
  if (family === 6) {
    const mapped = address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return blocked.check(mapped[1], "ipv4");
    return blocked.check(address, "ipv6");
  }
  return true;
}

class BlockedAddressError extends Error {}
class TooLargeError extends Error {}

/** DNS lookup that refuses private addresses, checked at connect time. */
function safeLookup(
  hostname: string,
  options: { all?: boolean },
  callback: (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void,
) {
  dnsLookup(hostname, { all: true }, (err, addresses) => {
    if (err) return callback(err, "", 0);
    if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) {
      return callback(new BlockedAddressError("blocked"), "", 0);
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

function request(url: URL): Promise<{
  status: number;
  location?: string;
  contentType: string;
  disposition: string;
  body: Uint8Array;
}> {
  return new Promise((resolve, reject) => {
    if (isIP(url.hostname.replace(/^\[|\]$/g, "")) && isPrivateAddress(url.hostname.replace(/^\[|\]$/g, ""))) {
      reject(new BlockedAddressError("blocked"));
      return;
    }
    const client = url.protocol === "https:" ? https : http;
    const req = client.request(
      url,
      {
        method: "GET",
        lookup: safeLookup as never,
        headers: { "User-Agent": "RaiseOS deck fetcher", Accept: "application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,*/*" },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const contentType = String(res.headers["content-type"] ?? "");
        const disposition = String(res.headers["content-disposition"] ?? "");
        if (status >= 300 && status < 400) {
          res.resume();
          resolve({ status, location: res.headers.location, contentType, disposition, body: new Uint8Array() });
          return;
        }
        const declared = Number(res.headers["content-length"] ?? 0);
        if (declared > MAX_DECK_BYTES) {
          res.destroy();
          reject(new TooLargeError("too large"));
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on("data", (chunk: Buffer) => {
          size += chunk.length;
          if (size > MAX_DECK_BYTES) {
            res.destroy();
            reject(new TooLargeError("too large"));
            return;
          }
          chunks.push(chunk);
        });
        res.on("end", () =>
          resolve({ status, contentType, disposition, body: new Uint8Array(Buffer.concat(chunks)) }),
        );
        res.on("error", reject);
      },
    );
    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error("timeout")));
    const deadline = setTimeout(() => req.destroy(new Error("timeout")), TIMEOUT_MS * 2);
    req.on("close", () => clearTimeout(deadline));
    req.on("error", (error) => reject(error.cause instanceof BlockedAddressError ? error.cause : error));
    req.end();
  });
}

function startsWithHtml(bytes: Uint8Array): boolean {
  const head = Buffer.from(bytes.subarray(0, 512)).toString("utf8").trimStart().toLowerCase();
  return head.startsWith("<!doctype html") || head.startsWith("<html");
}

function fileNameFor(url: URL, disposition: string, kind: "pdf" | "pptx"): string {
  const star = disposition.match(/filename\*\s*=\s*(?:UTF-8'')?([^;]+)/i);
  const plain = disposition.match(/filename\s*=\s*"?([^";]+)"?/i);
  let name = "";
  try {
    name = star ? decodeURIComponent(star[1].trim().replace(/^"|"$/g, "")) : plain?.[1]?.trim() ?? "";
  } catch {
    name = plain?.[1]?.trim() ?? "";
  }
  if (!name) {
    const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
    try {
      name = decodeURIComponent(last);
    } catch {
      name = last;
    }
  }
  if (!name || !/\.(pdf|pptx)$/i.test(name)) {
    const base = name && /^[\w .-]{1,80}$/.test(name) && !["export", "uc", "pdf", "download"].includes(name.toLowerCase()) ? name : "Deck from link";
    name = `${base}.${kind}`;
  }
  return name.slice(0, 160);
}

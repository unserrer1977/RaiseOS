import { describe, expect, it } from "vitest";
import { fetchDeckFromUrl, isPrivateAddress, toDirectDownload } from "@/lib/ingest/url";

describe("isPrivateAddress", () => {
  it("blocks loopback, private and link-local addresses", () => {
    for (const address of ["127.0.0.1", "10.1.2.3", "192.168.0.10", "172.20.0.1", "169.254.169.254", "::1", "fd00::1", "::ffff:127.0.0.1"]) {
      expect(isPrivateAddress(address)).toBe(true);
    }
  });
  it("allows public addresses", () => {
    for (const address of ["8.8.8.8", "142.250.72.14", "2606:4700:4700::1111"]) {
      expect(isPrivateAddress(address)).toBe(false);
    }
  });
});

describe("toDirectDownload", () => {
  it("rewrites Google Drive file links", () => {
    expect(toDirectDownload(new URL("https://drive.google.com/file/d/abc123/view?usp=sharing")).href).toBe(
      "https://drive.google.com/uc?export=download&id=abc123",
    );
  });
  it("rewrites Google Slides links to a PDF export", () => {
    expect(toDirectDownload(new URL("https://docs.google.com/presentation/d/xyz/edit#slide=id.p")).href).toBe(
      "https://docs.google.com/presentation/d/xyz/export/pdf",
    );
  });
  it("forces Dropbox links to download", () => {
    expect(toDirectDownload(new URL("https://www.dropbox.com/s/k/deck.pdf?dl=0")).searchParams.get("dl")).toBe("1");
  });
  it("leaves other links alone", () => {
    expect(toDirectDownload(new URL("https://example.com/deck.pdf")).href).toBe("https://example.com/deck.pdf");
  });
});

describe("fetchDeckFromUrl", () => {
  it("rejects non-web links and private hosts", async () => {
    expect(await fetchDeckFromUrl("ftp://example.com/deck.pdf")).toHaveProperty("error");
    expect(await fetchDeckFromUrl("not a url")).toHaveProperty("error");
    expect(await fetchDeckFromUrl("http://127.0.0.1/deck.pdf")).toEqual({ error: "That link points to a private address." });
    expect(await fetchDeckFromUrl("http://localhost/deck.pdf")).toEqual({ error: "That link points to a private address." });
  });
});

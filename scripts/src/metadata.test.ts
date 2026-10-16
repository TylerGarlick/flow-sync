import { afterEach, describe, expect, test } from "bun:test";
import { lookupMetadata, lookupSongUrl, searchMetadata } from "../../src/song-entry/metadata.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("metadata lookup", () => {
  test("resolves Apple Music song URLs through the iTunes lookup API", async () => {
    let requestedUrl: URL | undefined;
    let userAgent = "";
    globalThis.fetch = (async (input, init) => {
      requestedUrl = new URL(input.toString());
      userAgent = new Headers(init?.headers).get("User-Agent") ?? "";
      return Response.json({
        results: [{
          trackName: "Test Track",
          artistName: "Test Artist",
          trackViewUrl: "https://music.apple.com/us/album/test-track/789?i=456",
        }],
      });
    }) as typeof fetch;

    const result = await lookupSongUrl("https://music.apple.com/us/album/test-track/789?i=456");

    expect(requestedUrl?.origin).toBe("https://itunes.apple.com");
    expect(requestedUrl?.pathname).toBe("/lookup");
    expect(requestedUrl?.searchParams.get("id")).toBe("456");
    expect(userAgent).toContain("FlowSyncSongEntryGenerator/1.0");
    expect(result).toEqual({
      title: "Test Track",
      artist: "Test Artist",
      links: [{ label: "Apple Music", url: "https://music.apple.com/us/album/test-track/789?i=456" }],
      source: "APPLE_MUSIC",
    });
  });

  test("resolves MusicBrainz recordings with credited artist join phrases", async () => {
    let requestedUrl: URL | undefined;
    globalThis.fetch = (async (input) => {
      requestedUrl = new URL(input.toString());
      return Response.json({
        title: "Collaboration",
        "artist-credit": [
          { name: "Artist One", joinphrase: " & " },
          { name: "Artist Two" },
        ],
      });
    }) as typeof fetch;

    const id = "123e4567-e89b-12d3-a456-426614174000";
    const result = await lookupSongUrl(`https://musicbrainz.org/recording/${id}`);

    expect(requestedUrl?.origin).toBe("https://musicbrainz.org");
    expect(requestedUrl?.pathname).toBe(`/ws/2/recording/${id}`);
    expect(requestedUrl?.searchParams.get("inc")).toBe("artists");
    expect(result.artist).toBe("Artist One & Artist Two");
    expect(result.links[0].url).toBe(`https://musicbrainz.org/recording/${id}`);
  });

  test("searches both catalogs and removes duplicate title/artist candidates", async () => {
    const requestedHosts: string[] = [];
    globalThis.fetch = (async (input) => {
      const url = new URL(input.toString());
      requestedHosts.push(url.hostname);
      if (url.hostname === "musicbrainz.org") {
        return Response.json({
          recordings: [{
            id: "123e4567-e89b-12d3-a456-426614174000",
            title: "Test Track",
            "artist-credit": [{ name: "Test Artist" }],
          }],
        });
      }
      return Response.json({
        results: [{
          trackName: "Test Track",
          artistName: "Test Artist",
          trackViewUrl: "https://music.apple.com/us/album/test-track/789?i=456",
        }],
      });
    }) as typeof fetch;

    const { candidates } = await searchMetadata("Test Track", "Test Artist");

    expect(requestedHosts).toEqual(["musicbrainz.org", "itunes.apple.com"]);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].source).toBe("MUSICBRAINZ");
  });

  test("returns partial catalog failures as warnings", async () => {
    globalThis.fetch = (async (input) => {
      if (new URL(input.toString()).hostname === "musicbrainz.org") {
        return new Response("unavailable", { status: 503 });
      }
      return Response.json({ results: [] });
    }) as typeof fetch;

    const result = await searchMetadata("Missing Track", "Missing Artist");
    expect(result.candidates).toEqual([]);
    expect(result.warnings).toEqual([
      "MusicBrainz lookup failed: Metadata service returned HTTP 503 for musicbrainz.org.",
    ]);
  });

  test("supports URL and title/artist lookup scenarios and rejects mixed inputs", async () => {
    globalThis.fetch = (async () => Response.json({
      results: [{
        trackName: "Test Track",
        artistName: "Test Artist",
        trackViewUrl: "https://music.apple.com/us/album/test-track/789?i=456",
      }],
    })) as typeof fetch;

    const byUrl = await lookupMetadata({ url: "https://music.apple.com/us/album/test-track/789?i=456" });
    expect(byUrl.candidates).toHaveLength(1);
    expect(byUrl.warnings).toEqual([]);
    await expect(lookupMetadata({ url: "https://music.apple.com/us/album/test-track/789?i=456", title: "Test Track", artist: "Test Artist" }))
      .rejects.toThrow("either a supported song URL");
    await expect(lookupMetadata({ title: "Test Track" })).rejects.toThrow("both title and artist");
  });

  test("rejects arbitrary URLs without making a request", async () => {
    let requested = false;
    globalThis.fetch = (async () => {
      requested = true;
      return Response.json({});
    }) as typeof fetch;

    await expect(lookupSongUrl("https://example.com/song")).rejects.toThrow("Supported song URLs");
    expect(requested).toBe(false);
  });
});

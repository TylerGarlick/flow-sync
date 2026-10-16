import { describe, expect, test } from "bun:test";
import { updateCatalog } from "../../src/song-entry/catalog-index.js";
import { parseSupportedSongUrl } from "../../src/song-entry/metadata.js";
import { isSlug, slugify } from "../../src/song-entry/slug.js";
import { renderSongEntry, songEntryLocation } from "../../src/song-entry/template.js";
import type { SongEntryDetails, TrackMetadata } from "../../src/song-entry/types.js";

const template = await Bun.file(new URL("../../docs/TEMPLATE.md", import.meta.url)).text();
const metadata: TrackMetadata = {
  title: "A Song | Live",
  artist: "Beyoncé",
  links: [{ label: "Apple Music", url: "https://music.apple.com/us/album/song/123?i=456" }],
  source: "APPLE_MUSIC",
};
const details: SongEntryDetails = {
  genre: "Ambient / Electronic",
  genreSlug: "ambient-electronic",
  contributor: "@listener",
  dateAdded: "2026-10-15",
  flowRating: 4,
  timeToFlowSeconds: 90,
  flowAchieved: true,
  workContext: "Writing",
  environment: "Headphones",
  description: "Steady instrumental layers.",
  triggerPoints: ["00:00 - 00:30 – Gradual transition", "01:15 – Beat settles"],
};

describe("song entry generator helpers", () => {
  test("creates stable URL-safe slugs", () => {
    expect(slugify("Beyoncé & Friends")).toBe("beyonce-friends");
    expect(isSlug("beyonce-friends")).toBe(true);
    expect(isSlug("Beyoncé & Friends")).toBe(false);
    expect(() => slugify("♪")).toThrow("Cannot create");
  });

  test("parses only supported song URLs", () => {
    expect(parseSupportedSongUrl("https://music.apple.com/us/album/song/123?i=456")).toEqual({
      provider: "apple",
      id: "456",
    });
    expect(parseSupportedSongUrl("https://music.apple.com/us/song/song/456")).toEqual({
      provider: "apple",
      id: "456",
    });
    expect(parseSupportedSongUrl("https://musicbrainz.org/recording/123e4567-e89b-12d3-a456-426614174000"))
      .toEqual({ provider: "musicbrainz", id: "123e4567-e89b-12d3-a456-426614174000" });
    expect(() => parseSupportedSongUrl("https://music.apple.com/us/album/song/123")).toThrow("Supported song URLs");
    expect(() => parseSupportedSongUrl("https://example.com/song")).toThrow("Supported song URLs");
  });

  test("renders the current template with contributor facts and provider links", () => {
    const result = renderSongEntry(template, metadata, details);
    expect(result).toContain('artist: "Beyoncé"');
    expect(result).toContain('title_slug: "a-song-live"');
    expect(result).toContain("Work / Activity Type:** Writing");
    expect(result).toContain("01:15");
    expect(result).toContain("https://music.apple.com/us/album/song/123?i=456");
    expect(result).toContain("| `@listener` | Writing | ~90s | Yes | ⭐⭐⭐⭐ | Steady instrumental layers. |");
    expect(result).not.toContain("Initial Transition");
    expect(result).not.toContain("Listen on Spotify](https://open.spotify.com/...)");
  });

  test("updates the song catalog without duplicating paths", () => {
    const path = "artist/ambient/title/index.md";
    const original = "# Music Catalog\n\n## Songs\n\n* [other](other/genre/song/index.md)\n";
    const updated = updateCatalog(original, path, "title");
    expect(updated).toContain(`* [title](${path})`);
    expect(updated).toContain(`## Songs\n\n* [title](${path})\n* [other]`);
    expect(updateCatalog(updated, path, "title")).toBe(updated);
  });

  test("does not claim flow was achieved when the contributor says it was not", () => {
    const result = renderSongEntry(template, metadata, { ...details, flowAchieved: false });
    expect(result).toContain("| `@listener` | Writing | ~90s | No | ⭐⭐⭐⭐ |");
  });

  test("builds the specified artist/genre/title entry path", () => {
    expect(songEntryLocation(metadata, details.genreSlug)).toEqual({
      artistSlug: "beyonce",
      genreSlug: "ambient-electronic",
      titleSlug: "a-song-live",
      relativePath: "beyonce/ambient-electronic/a-song-live/index.md",
    });
  });
});

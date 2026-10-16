import { describe, expect, test } from "bun:test";
import { parseSongEntryFrontmatter, validateSongEntryDetails, validateTrackMetadata } from "../../src/song-entry/validation.js";

describe("shared song entry validation", () => {
  test("normalizes genre slugs and validates contributor-owned listening facts", () => {
    const result = validateSongEntryDetails({
      genre: "Ambient / Downtempo",
      contributor: "@listener",
      flowRating: 5,
      timeToFlowSeconds: 60,
      flowAchieved: true,
      workContext: "Writing",
      environment: "Headphones",
      description: "Steady layers.",
      triggerPoints: ["00:30 – Rhythm settles"],
    }, "2026-10-15");

    expect(result).toEqual({
      ok: true,
      value: {
        genre: "Ambient / Downtempo",
        genreSlug: "ambient-downtempo",
        contributor: "@listener",
        dateAdded: "2026-10-15",
        flowRating: 5,
        timeToFlowSeconds: 60,
        flowAchieved: true,
        workContext: "Writing",
        environment: "Headphones",
        description: "Steady layers.",
        triggerPoints: ["00:30 – Rhythm settles"],
      },
    });
  });

  test("reports invalid ratings, dates, and trigger points without fabricating values", () => {
    const result = validateSongEntryDetails({
      genre: "Ambient",
      contributor: "@listener",
      dateAdded: "2026-02-30",
      flowRating: 6,
      timeToFlowSeconds: -1,
      flowAchieved: false,
      workContext: "Writing",
      environment: "Headphones",
      description: "Test",
      triggerPoints: ["No timestamp"],
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected invalid entry details");
    expect(result.issues.map(({ field }) => field)).toEqual([
      "flowRating",
      "timeToFlowSeconds",
      "dateAdded",
      "triggerPoints[0]",
    ]);
  });

  test("parses and validates the same frontmatter contract used by the GraphQL catalog", () => {
    const frontmatter = parseSongEntryFrontmatter({
      artist: "Test Artist",
      artist_slug: "test-artist",
      genre: "Ambient",
      genre_slug: "ambient",
      title: "Test Song",
      title_slug: "test-song",
      contributor: "@listener",
      date_added: "2026-10-15",
      overall_flow_rating: 5,
      time_to_flow_seconds: 120,
      bpm: 90,
      key: "A Minor",
    });
    expect(frontmatter).toEqual({
      artist: "Test Artist",
      artist_slug: "test-artist",
      genre: "Ambient",
      genre_slug: "ambient",
      title: "Test Song",
      title_slug: "test-song",
      contributor: "@listener",
      date_added: "2026-10-15",
      overall_flow_rating: 5,
      time_to_flow_seconds: 120,
      bpm: "90",
      key: "A Minor",
    });
    expect(parseSongEntryFrontmatter({ ...frontmatter, title_slug: "../escape" })).toBeUndefined();
  });

  test("limits metadata links to supported HTTPS music providers", () => {
    expect(validateTrackMetadata({
      title: "Test Song",
      artist: "Test Artist",
      source: "MANUAL",
      links: [{ label: "Spotify", url: "https://open.spotify.com/track/example" }],
    }).ok).toBe(true);
    const invalid = validateTrackMetadata({
      title: "Test Song",
      artist: "Test Artist",
      source: "MANUAL",
      links: [{ label: "External", url: "https://example.com/song" }],
    });
    expect(invalid.ok).toBe(false);
  });
});

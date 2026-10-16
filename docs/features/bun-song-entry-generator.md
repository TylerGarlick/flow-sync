---
state: "draft"
is_ready: false
created_at: "2026-10-15"
created_by: "@TylerGarlick"
started_at: ""
started_by: ""
---

# 🧰 Bun Song Entry Generator

Provide small TypeScript functions and command-line scripts under `scripts/` that turn a song title, artist, or supported song URL into a correctly structured FlowSync Markdown entry.

## Problem to solve

Adding a song currently requires contributors to find the right location, copy `docs/TEMPLATE.md`, look up metadata, create URL-safe directory names, and update `music/index.md`. These steps are repetitive and easy to get wrong.

## Proposed experience

From the repository root, a contributor can run a Bun command with a song title and artist or a supported provider URL. The script resolves available metadata, asks for any required listening-session details it cannot infer, previews the generated changes, and writes the new entry only after confirmation.

## Implementation outline

- Add reusable TypeScript functions under `scripts/src/` for metadata lookup, slug creation, template rendering, validation, and catalog-index updates.
- Expose them through Bun scripts, with a dry-run/preview mode and clear validation errors.
- Generate `music/{artist_slug}/{genre_slug}/{title_slug}/index.md` from `docs/TEMPLATE.md`; preserve the repository's frontmatter fields and review-table structure.
- Add the song to `music/index.md` without duplicating an existing catalog entry.
- Keep listening-session judgments (flow rating, time-to-flow, work context, and trigger timestamps) contributor-provided; external services cannot supply these facts.
- Detect an existing destination and stop with an actionable message rather than overwriting contributed content.

## Metadata sources

- **MusicBrainz Web Service** is the preferred open catalog for artist, recording, release, and identifier lookups: [API documentation](https://musicbrainz.org/doc/MusicBrainz_API). It requires a descriptive `User-Agent`, limits each client to one request per second, and its free live service is for non-commercial use. Confirm terms before any commercial deployment.
- **Apple iTunes Search API** can supplement provider links and available catalog metadata: [API overview](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/). Treat results as candidates and let the contributor confirm the match.
- Genre labels and genre slugs remain FlowSync-curated because catalog genre tags can be missing, inconsistent, or overly broad. Do not invent BPM, key, flow ratings, timestamps, or other unsupported facts.

Only support known provider URL formats or explicit title/artist lookup. Do not fetch arbitrary user-supplied URLs. Keep API credentials out of generated files and repository history.

## Success criteria

- A contributor can generate a valid entry and catalog link with one Bun command.
- Output follows the current template and path conventions and is stable across repeated runs.
- Dry-run previews all proposed changes; duplicate paths are never silently overwritten.
- Missing or uncertain metadata is clearly surfaced for contributor review.

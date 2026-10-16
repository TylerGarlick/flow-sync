# Song Entry Generator

FlowSync provides one shared song-entry implementation for the Bun CLI and GraphQL API. Metadata lookup, provider-link validation, contributor-detail validation, slug creation, template rendering, duplicate checks, catalog-index updates, and file writes live under `src/song-entry/`. The GraphQL catalog loader uses the same slug and frontmatter validation.

## Bun CLI

From the repository root, run the guided flow:

```bash
bun run generate:song
```

The CLI and Bun test suites require Bun. The GraphQL server requires Node.js 22 or newer.

Choose either a supported MusicBrainz recording URL, an Apple Music song URL, or a title and artist. Title/artist searches show candidates from MusicBrainz and Apple; if no candidate fits, choose the manual entry. The generator then collects the curated genre and the listening-session facts that external metadata cannot provide.

The CLI prints the full Markdown entry and proposed `music/index.md` change. It writes only after explicit confirmation. Use `--dry-run` to preview without writing and `--help` to see flags. For example:

```bash
bun run generate:song -- --url "https://music.apple.com/us/album/example/123?i=456" --genre "Ambient / Downtempo" --contributor "@listener" --flow-rating 4 --time-to-flow-seconds 90 --flow-achieved yes --work-context Writing --environment Headphones --description "Steady layers support focus." --trigger-points "01:30 – Rhythm settles"
```

Separate multiple trigger points with `|`. Supported options are `--url`, `--title`, `--artist`, `--genre`, `--genre-slug`, `--contributor`, `--flow-rating`, `--time-to-flow-seconds`, `--flow-achieved`, `--work-context`, `--environment`, `--description`, `--trigger-points`, and `--dry-run`. Use either `--url` or the title/artist pair, not both.

## GraphQL workflow

`metadataLookup(input:)` supports the same URL and title/artist lookup scenarios. It returns zero or more candidates with a typed source (`MUSICBRAINZ`, `APPLE_MUSIC`, or `MANUAL`) and reports partial provider outages as warnings. Select a candidate or provide manual title/artist metadata when no candidate is suitable.

`songEntryPreview(input:)` accepts the selected metadata and contributor details, validates them, and returns the Markdown and proposed catalog index without writing files. Example variables:

```json
{
  "input": {
    "metadata": {
      "title": "Example Track",
      "artist": "Example Artist",
      "source": "APPLE_MUSIC",
      "links": [
        {
          "label": "Apple Music",
          "url": "https://music.apple.com/us/album/example-track/123?i=456"
        }
      ]
    },
    "details": {
      "genre": "Ambient / Downtempo",
      "genreSlug": "ambient-downtempo",
      "contributor": "@listener",
      "flowRating": 4,
      "timeToFlowSeconds": 90,
      "flowAchieved": true,
      "workContext": "Writing",
      "environment": "Headphones",
      "description": "Steady layers support focus.",
      "triggerPoints": ["01:30 – Rhythm settles"]
    }
  }
}
```

The `generateSongEntry(input:, confirm:)` mutation writes a reviewed entry and updates the catalog. It requires `confirm: true` and an administrator-configured bearer token; it is disabled when `SONG_ENTRY_WRITE_TOKEN` is unset. Configure a private token with at least 32 bytes and send it in the HTTP `Authorization: Bearer <token>` header. Do not put this token in client-side code, GraphQL variables, or source control. The mutation is intended for trusted server-side tooling only.

The GraphQL server writes under `REPOSITORY_ROOT` (the parent of `CATALOG_DIR` by default). Docker Compose persists the catalog in the `music-data` volume. For local development, set `CATALOG_DIR` and `REPOSITORY_ROOT` together when using a fixture repository.

## Data and safety rules

- MusicBrainz recording URLs and Apple Music song URLs are the only URL lookup inputs. The generator does not fetch arbitrary user-supplied URLs.
- MusicBrainz requests use a descriptive User-Agent. Its live service is limited to one request per second per client and is provided for non-commercial use; verify terms before commercial use.
- Apple/iTunes and MusicBrainz metadata are candidates, not proof that the result is correct. Review the selected title and artist.
- Genre and genre slug are contributor-curated. A slug is normalized using the same rules as the GraphQL catalog.
- Flow rating (1–5), time-to-flow (0–86,400 seconds), whether flow was achieved, context, environment, description, and timestamped trigger points are contributor-provided.
- Provider links must use HTTPS and a supported music-provider host. Invalid metadata, dates, ratings, trigger formats, and unsafe links are rejected.
- Generated files use `music/{artist-slug}/{genre-slug}/{title-slug}/index.md`. The catalog link is added idempotently. Existing entries are never overwritten, including on concurrent requests.
- File writes create the entry exclusively and atomically update the catalog. If catalog update fails, the newly created entry is removed.

## Tests

```bash
npm run test:unit          # Shared Bun unit tests
npm run test:e2e:generator # CLI write/dry-run/duplicate E2E tests
npm test                   # Type generation, build, GraphQL HTTP E2E, and Bun E2E
```

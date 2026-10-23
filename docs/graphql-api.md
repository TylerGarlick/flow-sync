# FlowSync GraphQL API

The GraphQL API reads song entries from `music/**` Markdown files and can optionally create contributor-reviewed song entries. Catalog parsing and song-entry generation share validated frontmatter, slug, and detail rules. The schema is defined in [`schema.graphql`](../schema.graphql); GraphQL Code Generator produces resolver and operation types from that schema and [`graphql/operations.graphql`](../graphql/operations.graphql).

## Run with Docker Compose

```bash
docker compose up --build
```

The service listens on `http://localhost:4000/graphql`. Check `http://localhost:4000/health` for readiness. Stop it with `docker compose down`.

Song generation is disabled by default. To enable it, set `SONG_ENTRY_WRITE_TOKEN` to a private secret of at least 32 bytes and send it as an `Authorization: Bearer <token>` header. Never expose this token in browser code or commit it. Docker Compose passes the variable through when provided; generated songs live in its persistent `music-data` volume.

## Local development

Requires Node.js 22 or newer.

```bash
npm ci
npm run build
npm start
```

The Bun CLI and its test suites additionally require Bun.

Useful commands:

```bash
npm run codegen       # Regenerate schema and operation types
npm run typecheck     # Check generated types and TypeScript
npm test              # Build and run GraphQL plus Bun generator tests
npm run test:unit      # Bun unit tests for metadata and shared song-entry validation
npm run test:e2e:generator # Bun CLI write, dry-run, and duplicate-protection tests
```

## Queries

`catalog` returns artist and genre facets with song counts. `songs` accepts a case-insensitive partial `search`, exact display-name or slug filters for `artist` and `genre`, and `limit`/`offset` pagination. The page size must be between 1 and 100.

```graphql
query {
  catalog {
    artists { name slug songCount }
    genres { name slug songCount }
  }

  songs(search: "ambient", limit: 10, offset: 0) {
    totalCount
    hasNextPage
    songs {
      id
      title
      artist
      genre
      overallFlowRating
      timeToFlowSeconds
    }
  }
}
```

Song and report IDs are internal, normalized slugs—not file paths. A song ID contains artist, genre, and title slugs; its `reports` include the song's `index.md` and any contributor Markdown files in that song directory. The `report(slug:)` query accepts the report ID returned by the API. Unknown IDs return `null`.

The catalog is parsed and cached when the service starts. Restart the local process or rebuild the Compose service after changing Markdown files. Files with invalid frontmatter or unsafe/unexpected paths are skipped with a warning on stderr; required fields and rating/time values are validated rather than synthesized.

## Song-entry generation

`metadataLookup(input:)` accepts either a supported HTTPS MusicBrainz recording URL or Apple Music song URL, or a title and artist pair. It returns provider candidates and any partial-provider warnings. The caller selects a candidate; when no candidates are available, it can supply a manual candidate with `source: MANUAL`.

`songEntryPreview(input:)` validates the selected metadata and contributor-provided details, then returns the proposed entry Markdown, destination, catalog preview, and duplicate status. It does not write files.

`generateSongEntry(input:, confirm:)` requires `confirm: true` and the configured bearer token. It writes the generated `index.md` and updates `music/index.md`; destinations are exclusive and existing entries are never overwritten. The in-memory GraphQL catalog is refreshed after successful creation. Requests with invalid metadata, ratings, dates, links, or trigger timestamps return a `BAD_USER_INPUT` GraphQL error.

For full variables, examples, CLI options, input limits, and the trust model, see the [Song Entry Generator guide](song-entry-generator.md).

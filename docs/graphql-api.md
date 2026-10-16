# FlowSync GraphQL API

The read-only GraphQL API reads song entries from `music/**` Markdown files. The schema is defined in [`schema.graphql`](../schema.graphql); GraphQL Code Generator produces resolver and operation types from that schema and [`graphql/operations.graphql`](../graphql/operations.graphql).

## Run with Docker Compose

```bash
docker compose up --build
```

The service listens on `http://localhost:4000/graphql`. Check `http://localhost:4000/health` for readiness. Stop it with `docker compose down`.

## Local development

Requires Node.js 22 or newer.

```bash
npm ci
npm run build
npm start
```

Useful commands:

```bash
npm run codegen       # Regenerate schema and operation types
npm run typecheck     # Check generated types and TypeScript
npm test              # Build and run HTTP end-to-end tests
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

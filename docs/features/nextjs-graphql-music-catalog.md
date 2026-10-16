---
state: "draft"
is_ready: false
created_at: "2026-10-15"
created_by: "@TylerGarlick"
started_at: ""
started_by: ""
---

# 🌐 Next.js GraphQL Music Catalog

Build a website for browsing FlowSync's Markdown song reports, backed by a typed GraphQL API.

## Problem to solve

The catalog is currently navigated through repository directories and a manually maintained Markdown index. A web interface would make community tracks and their focus-session context easier to find.

## Proposed experience

- Browse songs and individual reports in a responsive Next.js website.
- Filter and search by genre, artist, and song title; show ratings, time-to-flow, links, and flow trigger points.
- Navigate from a song to its individual contributor reports and back to the filtered catalog.
- Link to the repository source and contribution guidance so readers can verify and propose changes.

## Technical direction

- Use **GraphQL Yoga** for a GraphQL-over-HTTP API; it supports TypeScript and can be deployed in Node.js or other supported runtimes. See the [Yoga documentation](https://the-guild.dev/graphql/yoga-server/docs).
- Use **Next.js** for the frontend, with typed GraphQL operations shared between the client and API.
- Generate TypeScript types from the GraphQL schema and operations (for example, GraphQL Code Generator), and fail CI when generated types are stale.
- Parse the existing `music/**/index.md` YAML frontmatter and Markdown body into a validated catalog model. Treat the Markdown repository as the source of truth rather than maintaining a duplicate database initially.
- Define read-only queries for catalog facets, paginated/searchable songs, song details, and reports. Keep URL and path resolution internal; never accept arbitrary file paths from GraphQL callers.
- Cache parsed catalog data and rebuild or invalidate it when repository content changes. Mutations and authenticated contribution workflows can be considered separately after the read-only site is established.

## Risks and guardrails

- Frontmatter and Markdown may be inconsistent; parsing should report invalid entries without silently fabricating fields.
- Validate and normalize slugs, and prevent path traversal when resolving repository content.
- Keep generated API types aligned with the schema and operations as the site evolves.
- Avoid presenting subjective flow ratings as objective guarantees; expose contributor context and report counts alongside summaries.

## Success criteria

- A visitor can search and browse all valid catalog entries without using the GitHub file tree.
- Genre, artist, and song filters work consistently across list and detail pages.
- The API and frontend use generated TypeScript types and a single documented GraphQL schema.
- Catalog changes become visible without manually editing a second index or database.

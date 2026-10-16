import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GraphQLError } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import type { Resolvers } from "./generated/graphql.js";
import { getCatalogFacets, loadCatalog, type Catalog, type CatalogSong } from "./catalog.js";

const schemaPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../schema.graphql");
const schemaSource = await readFile(schemaPath, "utf8");
const port = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const catalogDirectory = process.env.CATALOG_DIR ?? path.resolve(process.cwd(), "music");
const catalog = await loadCatalog(catalogDirectory);
if (catalog.songs.length === 0) {
  throw new Error(`No valid catalog entries were found in ${catalogDirectory}`);
}

function matchesFilter(value: string, filter: string | null | undefined): boolean {
  if (!filter) return true;
  const normalized = filter.trim().toLocaleLowerCase();
  if (!normalized) return true;
  return value.toLocaleLowerCase() === normalized;
}

function findSong(catalog: Catalog, slug: string): CatalogSong | null {
  const segments = slug.split("/");
  if (segments.length !== 3 || !segments.every((segment) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))) {
    return null;
  }
  return catalog.songs.find((song) => song.id === segments.join("/")) ?? null;
}

const resolvers: Resolvers = {
  Query: {
    catalog: () => getCatalogFacets(catalog),
    songs: (_parent, args) => {
      const limit = args.limit ?? 20;
      const offset = args.offset ?? 0;
      if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new GraphQLError("limit must be an integer between 1 and 100");
      }
      if (!Number.isInteger(offset) || offset < 0) {
        throw new GraphQLError("offset must be a non-negative integer");
      }

      const search = args.search?.trim().toLocaleLowerCase();
      const matchingSongs = catalog.songs.filter((song) => {
        const matchesSearch =
          !search ||
          [song.title, song.artist, song.genre].some((value) =>
            value.toLocaleLowerCase().includes(search),
          );
        return (
          matchesSearch &&
          (matchesFilter(song.artist, args.artist) ||
            matchesFilter(song.artistSlug, args.artist)) &&
          (matchesFilter(song.genre, args.genre) ||
            matchesFilter(song.genreSlug, args.genre))
        );
      });
      const songs = matchingSongs.slice(offset, offset + limit);
      return {
        songs,
        totalCount: matchingSongs.length,
        hasNextPage: offset + songs.length < matchingSongs.length,
      };
    },
    song: (_parent, args) => findSong(catalog, args.slug),
    report: (_parent, args) => {
      const segments = args.slug.split("/");
      if (segments.length !== 4) return null;
      const song = findSong(catalog, segments.slice(0, 3).join("/"));
      if (!song) return null;
      return catalog.reports.get(args.slug) ?? null;
    },
  },
  Song: {
    slug: (song) => song.id,
    reportCount: (song) => song.reports.length,
  },
};

const yoga = createYoga({
  schema: createSchema({ typeDefs: schemaSource, resolvers }),
  graphqlEndpoint: "/graphql",
  landingPage: false,
  graphiql: false,
});

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  if (url.pathname === "/health" && request.method === "GET") {
    sendJson(response, 200, { status: "ok", songs: catalog.songs.length });
    return;
  }
  if (url.pathname !== "/graphql") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }
  await yoga.handle(request, response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`FlowSync GraphQL API listening on port ${port} (${catalog.songs.length} songs)`);
});

function shutdown(): void {
  server.close((error) => {
    if (error) {
      console.error("Failed to close GraphQL server cleanly", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

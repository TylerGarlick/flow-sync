import { readFile } from "node:fs/promises";
import { timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GraphQLError } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import type { Resolvers } from "./generated/graphql.js";
import { getCatalogFacets, loadCatalog, type Catalog, type CatalogSong } from "./catalog.js";
import {
  previewSongEntry,
  SongEntryAlreadyExistsError,
  writeSongEntry,
} from "./song-entry/generator.js";
import { lookupMetadata, MetadataLookupInputError, MetadataProviderError } from "./song-entry/metadata.js";
import { isSlug } from "./song-entry/slug.js";
import { validateSongEntryDetails, validateTrackMetadata, validationMessage } from "./song-entry/validation.js";
import type { MetadataLookupInput, ValidationResult } from "./song-entry/types.js";

const schemaPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../schema.graphql");
const schemaSource = await readFile(schemaPath, "utf8");
const port = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const catalogDirectory = process.env.CATALOG_DIR ?? path.resolve(process.cwd(), "music");
const repositoryRoot = path.resolve(process.env.REPOSITORY_ROOT ?? path.resolve(catalogDirectory, ".."));
if (process.env.SONG_ENTRY_WRITE_TOKEN && Buffer.byteLength(process.env.SONG_ENTRY_WRITE_TOKEN) < 32) {
  throw new Error("SONG_ENTRY_WRITE_TOKEN must contain at least 32 bytes.");
}
let catalog = await loadCatalog(catalogDirectory);
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
  if (segments.length !== 3 || !segments.every(isSlug)) {
    return null;
  }
  return catalog.songs.find((song) => song.id === segments.join("/")) ?? null;
}

interface GraphQLContext {
  request: Request;
}

function requireValid<T>(result: ValidationResult<T>): T {
  if (!result.ok) {
    throw new GraphQLError(validationMessage(result.issues), {
      extensions: { code: "BAD_USER_INPUT", validationIssues: result.issues },
    });
  }
  return result.value;
}

function lookupInput(input: {
  url?: string | null;
  title?: string | null;
  artist?: string | null;
}): MetadataLookupInput {
  return {
    ...(input.url !== null && input.url !== undefined ? { url: input.url } : {}),
    ...(input.title !== null && input.title !== undefined ? { title: input.title } : {}),
    ...(input.artist !== null && input.artist !== undefined ? { artist: input.artist } : {}),
  };
}

function hasWriteAuthorization(request: Request): boolean {
  const configuredToken = process.env.SONG_ENTRY_WRITE_TOKEN;
  if (!configuredToken) return false;
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const expected = Buffer.from(configuredToken);
  const supplied = Buffer.from(suppliedToken);
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

function graphQLError(error: unknown): GraphQLError {
  if (error instanceof GraphQLError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof SongEntryAlreadyExistsError) {
    return new GraphQLError(message, { extensions: { code: "CONFLICT" } });
  }
  if (error instanceof MetadataProviderError) {
    return new GraphQLError(message, { extensions: { code: "UPSTREAM_METADATA_ERROR" } });
  }
  return new GraphQLError(message, { extensions: { code: "INTERNAL_SERVER_ERROR" } });
}

const resolvers: Resolvers<GraphQLContext> = {
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
    metadataLookup: async (_parent, { input }) => {
      try {
        return await lookupMetadata(lookupInput(input));
      } catch (error) {
        if (error instanceof MetadataLookupInputError) {
          throw new GraphQLError(error.message, { extensions: { code: "BAD_USER_INPUT" } });
        }
        throw graphQLError(error);
      }
    },
    songEntryPreview: async (_parent, { input }) => {
      const metadata = requireValid(validateTrackMetadata(input.metadata));
      const details = requireValid(validateSongEntryDetails(input.details));
      try {
        return await previewSongEntry(repositoryRoot, metadata, details);
      } catch (error) {
        throw graphQLError(error);
      }
    },
  },
  Mutation: {
    generateSongEntry: async (_parent, { input, confirm }, context) => {
      if (!process.env.SONG_ENTRY_WRITE_TOKEN) {
        throw new GraphQLError("Song entry generation is disabled; configure SONG_ENTRY_WRITE_TOKEN to enable it.", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      if (!hasWriteAuthorization(context.request)) {
        throw new GraphQLError("A valid bearer token is required to generate song entries.", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      if (!confirm) {
        throw new GraphQLError("Confirm the reviewed preview before generating a song entry.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const metadata = requireValid(validateTrackMetadata(input.metadata));
      const details = requireValid(validateSongEntryDetails(input.details));
      try {
        const result = await writeSongEntry(repositoryRoot, metadata, details);
        catalog = await loadCatalog(catalogDirectory);
        return { path: result.path, created: true, catalogUpdated: result.catalogChanged };
      } catch (error) {
        throw graphQLError(error);
      }
    },
  },
  Song: {
    slug: (song) => song.id,
    reportCount: (song) => song.reports.length,
  },
};

const yoga = createYoga<GraphQLContext>({
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

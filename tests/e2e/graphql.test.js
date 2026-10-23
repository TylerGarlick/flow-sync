import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { after, before, test } from "node:test";

let serverProcess;
let endpoint;
let baseUrl;

async function unusedPort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to allocate a port");
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return address.port;
}

async function waitForServer() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`GraphQL server exited with code ${serverProcess.exitCode}`);
    }
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("GraphQL server did not become ready");
}

async function query(queryText, variables = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: queryText, variables }),
  });
  return { status: response.status, body: await response.json() };
}

before(async () => {
  const port = await unusedPort();
  baseUrl = `http://127.0.0.1:${port}`;
  endpoint = `${baseUrl}/graphql`;
  serverProcess = spawn(process.execPath, ["dist/server.js"], {
    env: { ...process.env, PORT: String(port) },
    stdio: "ignore",
  });
  await waitForServer();
});

after(() => {
  serverProcess?.kill("SIGTERM");
});

test("serves a healthy catalog over HTTP", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", songs: 15 });
});

test("returns catalog facets and paginated searchable songs", async () => {
  const result = await query(`
    query {
      catalog {
        artists { name slug songCount }
        genres { name slug songCount }
      }
      songs(search: "strobe", limit: 1) {
        totalCount
        hasNextPage
        songs { id title artist genre overallFlowRating timeToFlowSeconds }
      }
    }
  `);
  assert.equal(result.status, 200);
  assert.equal(result.body.errors, undefined);
  assert.equal(result.body.data.catalog.artists.length, 14);
  assert.ok(result.body.data.catalog.genres.length > 0);
  assert.deepEqual(result.body.data.songs, {
    totalCount: 1,
    hasNextPage: false,
    songs: [{
      id: "deadmau5/progressive-house/strobe",
      title: "Strobe",
      artist: "deadmau5",
      genre: "Progressive House",
      overallFlowRating: 5,
      timeToFlowSeconds: 180,
    }],
  });
});

test("filters by artist and genre and enforces pagination limits", async () => {
  const filtered = await query(`
    query($artist: String!, $genre: String!, $offset: Int!) {
      songs(artist: $artist, genre: $genre, offset: $offset, limit: 1) {
        totalCount
        hasNextPage
        songs { title }
      }
    }
  `, { artist: "Daft Punk", genre: "french-house", offset: 1 });
  assert.equal(filtered.body.errors, undefined);
  assert.deepEqual(filtered.body.data.songs, {
    totalCount: 2,
    hasNextPage: false,
    songs: [{ title: "Veridis Quo" }],
  });

  const invalidLimit = await query("{ songs(limit: 101) { totalCount } }");
  assert.match(invalidLimit.body.errors[0].message, /limit must be an integer/);
});

test("returns song details, source links, flow triggers, and reports", async () => {
  const result = await query(`
    query($slug: ID!) {
      song(slug: $slug) {
        title
        description
        links { label url }
        triggers { timestamp title description }
        reportCount
        reports { id contributor dateAdded overallFlowRating timeToFlowSeconds sourceFile }
      }
      report(slug: "deadmau5/progressive-house/strobe/index") {
        id
        markdown
      }
    }
  `, { slug: "deadmau5/progressive-house/strobe" });
  assert.equal(result.body.errors, undefined);
  const song = result.body.data.song;
  assert.equal(song.title, "Strobe");
  assert.match(song.description, /benchmark of long-form progressive electronic music/i);
  assert.ok(song.links.some(({ url }) => url.includes("spotify.com")));
  assert.equal(song.triggers.length, 3);
  assert.equal(song.reportCount, 1);
  assert.deepEqual(song.reports[0], {
    id: "deadmau5/progressive-house/strobe/index",
    contributor: "@TylerGarlick",
    dateAdded: "2026-10-14",
    overallFlowRating: 5,
    timeToFlowSeconds: 180,
    sourceFile: "index.md",
  });
  assert.match(result.body.data.report.markdown, /Flow Trigger Points/);
});

test("returns null for unknown or path-traversal slugs", async () => {
  const result = await query(`
    query {
      unknown: song(slug: "unknown/genre/title") { title }
      traversal: song(slug: "../README.md") { title }
      invalidReport: report(slug: "../README.md") { id }
    }
  `);
  assert.equal(result.body.errors, undefined);
  assert.deepEqual(result.body.data, {
    unknown: null,
    traversal: null,
    invalidReport: null,
  });
});

test("rejects unsupported routes and malformed GraphQL operations", async () => {
  const route = await fetch(`${baseUrl}/not-found`);
  assert.equal(route.status, 404);
  const malformed = await query("{ notAField }");
  assert.ok(malformed.body.errors?.length);
});

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { once } from "node:events";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, test } from "node:test";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const writeToken = "test-song-entry-token-is-at-least-32-bytes";
const entryInput = {
  metadata: {
    title: "Generated Song",
    artist: "Test Artist",
    source: "MANUAL",
    links: [],
  },
  details: {
    genre: "Ambient",
    genreSlug: "ambient",
    contributor: "@graphql-test",
    flowRating: 5,
    timeToFlowSeconds: 42,
    flowAchieved: true,
    workContext: "Testing",
    environment: "Headphones",
    description: "A contributor-provided note.",
    triggerPoints: ["00:42 – The rhythm settles"],
  },
};

let temporaryRoot;
let serverProcess;
let endpoint;

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
    if (serverProcess.exitCode !== null) throw new Error(`GraphQL server exited with code ${serverProcess.exitCode}`);
    try {
      const response = await fetch(endpoint);
      if (response.status !== 404) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("GraphQL server did not become ready");
}

async function request(query, variables = {}, token) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

before(async () => {
  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "flowsync-graphql-generator-"));
  await mkdir(path.join(temporaryRoot, "docs"), { recursive: true });
  await mkdir(path.join(temporaryRoot, "music/excision/g-shit"), { recursive: true });
  await cp(path.join(repositoryRoot, "docs/TEMPLATE.md"), path.join(temporaryRoot, "docs/TEMPLATE.md"));
  await cp(
    path.join(repositoryRoot, "music/excision/g-shit/index.md"),
    path.join(temporaryRoot, "music/excision/g-shit/index.md"),
  );
  await writeFile(path.join(temporaryRoot, "music/index.md"), "# Music Catalog\n\n## Songs\n\n");

  const port = await unusedPort();
  endpoint = `http://127.0.0.1:${port}/graphql`;
  serverProcess = spawn(process.execPath, ["dist/server.js"], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      PORT: String(port),
      CATALOG_DIR: path.join(temporaryRoot, "music"),
      REPOSITORY_ROOT: temporaryRoot,
      SONG_ENTRY_WRITE_TOKEN: writeToken,
    },
    stdio: "ignore",
  });
  await waitForServer();
});

after(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill("SIGTERM");
    await once(serverProcess, "exit");
  }
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
});

test("previews generated markdown and catalog changes without writing", async () => {
  const result = await request(`
    query($input: SongEntryInput!) {
      songEntryPreview(input: $input) {
        path
        markdown
        catalogMarkdown
        catalogChanged
        alreadyExists
      }
    }
  `, { input: entryInput });

  assert.equal(result.errors, undefined);
  const preview = result.data.songEntryPreview;
  assert.equal(preview.path, "music/test-artist/ambient/generated-song/index.md");
  assert.equal(preview.catalogChanged, true);
  assert.equal(preview.alreadyExists, false);
  assert.match(preview.markdown, /The rhythm settles/);
  assert.match(preview.catalogMarkdown, /\* \[generated-song\]\(test-artist\/ambient\/generated-song\/index\.md\)/);
  await assert.rejects(readFile(path.join(temporaryRoot, preview.path)));
});

test("requires authorization and explicit confirmation before generation", async () => {
  const mutation = `
    mutation($input: SongEntryInput!, $confirm: Boolean!) {
      generateSongEntry(input: $input, confirm: $confirm) { path created }
    }
  `;
  const unauthorized = await request(mutation, { input: entryInput, confirm: true });
  assert.equal(unauthorized.errors[0].extensions.code, "FORBIDDEN");

  const unconfirmed = await request(mutation, { input: entryInput, confirm: false }, writeToken);
  assert.equal(unconfirmed.errors[0].extensions.code, "BAD_USER_INPUT");

  const generated = await request(mutation, { input: entryInput, confirm: true }, writeToken);
  assert.equal(generated.errors, undefined);
  assert.deepEqual(generated.data.generateSongEntry, {
    path: "music/test-artist/ambient/generated-song/index.md",
    created: true,
  });

  const refreshedCatalog = await request(`{
    songs(search: "Generated Song") {
      totalCount
      songs { title artist genre }
    }
  }`);
  assert.deepEqual(refreshedCatalog.data.songs, {
    totalCount: 1,
    songs: [{ title: "Generated Song", artist: "Test Artist", genre: "Ambient" }],
  });
});

test("reports duplicate entries and never overwrites contributed content", async () => {
  const entryPath = path.join(temporaryRoot, "music/test-artist/ambient/generated-song/index.md");
  const catalogPath = path.join(temporaryRoot, "music/index.md");
  const originalEntry = await readFile(entryPath, "utf8");
  const originalCatalog = await readFile(catalogPath, "utf8");
  const preview = await request(`
    query($input: SongEntryInput!) {
      songEntryPreview(input: $input) { alreadyExists }
    }
  `, { input: entryInput });
  assert.equal(preview.errors, undefined);
  assert.equal(preview.data.songEntryPreview.alreadyExists, true);

  const result = await request(`
    mutation($input: SongEntryInput!, $confirm: Boolean!) {
      generateSongEntry(input: $input, confirm: $confirm) { path }
    }
  `, { input: entryInput, confirm: true }, writeToken);
  assert.equal(result.errors[0].extensions.code, "CONFLICT");
  assert.equal(await readFile(entryPath, "utf8"), originalEntry);
  assert.equal(await readFile(catalogPath, "utf8"), originalCatalog);
});

test("preserves both catalog entries when distinct songs are generated concurrently", async () => {
  const mutation = `
    mutation($input: SongEntryInput!, $confirm: Boolean!) {
      generateSongEntry(input: $input, confirm: $confirm) { path created }
    }
  `;
  const inputs = ["Parallel Song One", "Parallel Song Two"].map((title) => ({
    ...entryInput,
    metadata: { ...entryInput.metadata, title },
  }));
  const results = await Promise.all(
    inputs.map((input) => request(mutation, { input, confirm: true }, writeToken)),
  );

  assert.deepEqual(results.map((result) => result.errors), [undefined, undefined]);
  const catalog = await readFile(path.join(temporaryRoot, "music/index.md"), "utf8");
  assert.match(catalog, /\* \[parallel-song-one\]\(test-artist\/ambient\/parallel-song-one\/index\.md\)/);
  assert.match(catalog, /\* \[parallel-song-two\]\(test-artist\/ambient\/parallel-song-two\/index\.md\)/);
});

test("validates metadata links, flow ratings, and timestamp formats", async () => {
  const invalidInput = {
    ...entryInput,
    metadata: {
      ...entryInput.metadata,
      links: [{ label: "Unsafe", url: "https://example.com/song" }],
    },
    details: {
      ...entryInput.details,
      flowRating: 6,
      triggerPoints: ["No timestamp"],
    },
  };
  const result = await request(`
    query($input: SongEntryInput!) {
      songEntryPreview(input: $input) { path }
    }
  `, { input: invalidInput });
  assert.equal(result.errors[0].extensions.code, "BAD_USER_INPUT");
  assert.match(result.errors[0].message, /flowRating|triggerPoints|metadata\.links/);
});

test("metadata lookup rejects unsupported URLs without fetching arbitrary hosts", async () => {
  const result = await request(`
    query($input: MetadataLookupInput!) {
      metadataLookup(input: $input) { candidates { title } }
    }
  `, { input: { url: "https://example.com/song" } });
  assert.equal(result.errors[0].extensions.code, "BAD_USER_INPUT");
  assert.match(result.errors[0].message, /Supported song URLs/);
});

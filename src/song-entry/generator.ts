import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { readCatalog, updateCatalog, writeCatalogSafely } from "./catalog-index.js";
import { renderSongEntry, songEntryLocation } from "./template.js";
import type { SongEntryDetails, SongEntryPreview, TrackMetadata } from "./types.js";

export class SongEntryAlreadyExistsError extends Error {}
let catalogWriteQueue: Promise<void> = Promise.resolve();

function isMissingFile(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function serializeCatalogWrite<T>(write: () => Promise<T>): Promise<T> {
  const currentWrite = catalogWriteQueue.then(write);
  catalogWriteQueue = currentWrite.then(() => undefined, () => undefined);
  return currentWrite;
}

export async function previewSongEntry(
  repositoryRoot: string,
  metadata: TrackMetadata,
  details: SongEntryDetails,
): Promise<SongEntryPreview> {
  const location = songEntryLocation(metadata, details.genreSlug);
  const entryPath = resolve(repositoryRoot, "music", location.relativePath);
  const catalogPath = resolve(repositoryRoot, "music/index.md");
  const template = await readFile(resolve(repositoryRoot, "docs/TEMPLATE.md"), "utf8");
  const catalog = await readCatalog(catalogPath);
  const catalogMarkdown = updateCatalog(catalog, location.relativePath, location.titleSlug);
  let alreadyExists = false;

  try {
    await readFile(entryPath);
    alreadyExists = true;
  } catch (error) {
    if (!isMissingFile(error)) throw error;
  }

  return {
    path: `music/${location.relativePath}`,
    markdown: renderSongEntry(template, metadata, details, location),
    catalogMarkdown,
    catalogChanged: catalogMarkdown !== catalog,
    alreadyExists,
  };
}

export async function writeSongEntry(
  repositoryRoot: string,
  metadata: TrackMetadata,
  details: SongEntryDetails,
): Promise<SongEntryPreview> {
  const preview = await previewSongEntry(repositoryRoot, metadata, details);
  if (preview.alreadyExists) {
    throw new SongEntryAlreadyExistsError(
      `Destination already exists: ${preview.path}. Existing entries are never overwritten.`,
    );
  }

  const location = songEntryLocation(metadata, details.genreSlug);
  const entryPath = resolve(repositoryRoot, "music", location.relativePath);
  const catalogPath = resolve(repositoryRoot, "music/index.md");
  await mkdir(dirname(entryPath), { recursive: true });
  try {
    await writeFile(entryPath, preview.markdown, { flag: "wx" });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "EEXIST") {
      throw new SongEntryAlreadyExistsError(
        `Destination already exists: ${preview.path}. Existing entries are never overwritten.`,
      );
    }
    throw error;
  }

  let catalogChanged = false;
  try {
    await serializeCatalogWrite(async () => {
      const currentCatalog = await readCatalog(catalogPath);
      const updatedCatalog = updateCatalog(currentCatalog, location.relativePath, location.titleSlug);
      catalogChanged = updatedCatalog !== currentCatalog;
      if (catalogChanged) await writeCatalogSafely(catalogPath, updatedCatalog);
    });
  } catch (error) {
    await unlink(entryPath);
    throw new Error(
      `Could not update music/index.md; the new song entry was removed. ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return { ...preview, catalogChanged };
}

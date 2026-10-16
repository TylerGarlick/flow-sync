import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";

export function updateCatalog(catalog: string, relativePath: string, titleSlug: string) {
  const entries = [...catalog.matchAll(/^\* \[[^\]]+\]\(([^)]+)\)$/gm)].map((match) => match[1]);
  if (entries.includes(relativePath)) return catalog;
  const newEntry = `* [${titleSlug}](${relativePath})`;
  const songsHeading = /^## Songs[ \t]*$/m;
  if (!songsHeading.test(catalog)) throw new Error("Could not find the '## Songs' section in music/index.md.");

  const headingMatch = catalog.match(songsHeading);
  if (!headingMatch) throw new Error("Could not find the '## Songs' section in music/index.md.");
  const beforeSongs = catalog.slice(0, catalog.search(songsHeading) + headingMatch[0].length);
  const afterSongs = catalog.slice(beforeSongs.length).replace(/^\s*/, "");
  return `${beforeSongs}\n\n${newEntry}${afterSongs ? `\n${afterSongs}` : "\n"}`;
}

export async function writeCatalogSafely(path: string, contents: string) {
  const temporaryPath = `${path}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, contents, { flag: "wx" });
  try {
    await rename(temporaryPath, path);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

export async function readCatalog(path: string) {
  return readFile(path, "utf8");
}

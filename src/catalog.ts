import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { isSlug } from "./song-entry/slug.js";
import { parseSongEntryFrontmatter } from "./song-entry/validation.js";
import type { SongEntryFrontmatter } from "./song-entry/types.js";

export interface CatalogReport {
  id: string;
  contributor: string;
  dateAdded: string;
  overallFlowRating: number;
  timeToFlowSeconds: number;
  markdown: string;
  sourceFile: string;
}

export interface SongLink {
  label: string;
  url: string;
}

export interface FlowTrigger {
  timestamp: string;
  title: string;
  description: string;
}

export interface CatalogSong {
  id: string;
  artist: string;
  artistSlug: string;
  genre: string;
  genreSlug: string;
  title: string;
  titleSlug: string;
  dateAdded: string;
  overallFlowRating: number;
  timeToFlowSeconds: number;
  bpm: string | null;
  key: string | null;
  description: string;
  links: SongLink[];
  triggers: FlowTrigger[];
  reports: CatalogReport[];
}

export interface CatalogFacet {
  name: string;
  slug: string;
  songCount: number;
}

export interface Catalog {
  songs: CatalogSong[];
  reports: Map<string, CatalogReport>;
}

interface ParsedFile {
  songId: string;
  filename: string;
  metadata: SongEntryFrontmatter;
  markdown: string;
}

function extractDescription(markdown: string): string {
  const section = markdown.split(/^##\s+/m).find((part) => /Context & Description/.test(part));
  if (!section) return "";
  const descriptionStart = section.indexOf("**Description:**");
  return descriptionStart === -1
    ? ""
    : section.slice(descriptionStart + "**Description:**".length).trim();
}

function extractLinks(markdown: string): SongLink[] {
  const quickLinks = markdown.split(/^##\s+/m).find((part) => /Quick Links/.test(part));
  if (!quickLinks) return [];

  return [...quickLinks.matchAll(/^\s*\*\s+\*\*([^*]+):\*\*\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gm)]
    .map(([, label, linkText, url]) => ({
      label: `${label?.trim() ?? ""} ${linkText?.trim() ?? ""}`.trim(),
      url: url ?? "",
    }));
}

function extractTriggers(markdown: string): FlowTrigger[] {
  const section = markdown.split(/^##\s+/m).find((part) => /Flow Trigger Points/.test(part));
  if (!section) return [];

  return [...section.matchAll(/^\s*\*\s+\*\*`([^`]+)`\s+[–-]\s+([^:*]+):\*\*\s*(.+)$/gm)]
    .map(([, timestamp, title, description]) => ({
      timestamp: timestamp?.trim() ?? "",
      title: title?.trim() ?? "",
      description: description?.trim() ?? "",
    }));
}

function facetMap(
  songs: CatalogSong[],
  nameField: "artist" | "genre",
  slugField: "artistSlug" | "genreSlug",
): CatalogFacet[] {
  const counts = new Map<string, CatalogFacet>();
  for (const song of songs) {
    const slug = song[slugField];
    const current = counts.get(slug);
    if (current) current.songCount += 1;
    else counts.set(slug, { name: song[nameField], slug, songCount: 1 });
  }
  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getCatalogFacets(catalog: Catalog): {
  artists: CatalogFacet[];
  genres: CatalogFacet[];
} {
  return {
    artists: facetMap(catalog.songs, "artist", "artistSlug"),
    genres: facetMap(catalog.songs, "genre", "genreSlug"),
  };
}

export async function loadCatalog(catalogDirectory: string): Promise<Catalog> {
  const root = path.resolve(catalogDirectory);
  const files = await findMarkdownFiles(root);
  const parsedFiles: ParsedFile[] = [];

  for (const file of files) {
    const relative = path.relative(root, file);
    const segments = relative.split(path.sep);
    if (segments.length === 1 && segments[0] === "index.md") continue;
    const canonicalPath = segments.length === 4;
    const legacyPath = segments.length === 3;
    if (
      (!canonicalPath && !legacyPath) ||
      !segments.slice(0, -1).every(isSlug) ||
      !segments.at(-1)?.endsWith(".md")
    ) {
      console.warn(`Skipping catalog file with an unexpected path: ${relative}`);
      continue;
    }

    try {
      const source = await readFile(file, "utf8");
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      if (!frontmatter) throw new Error("Missing YAML frontmatter block");
      const metadata = parseSongEntryFrontmatter(parseYaml(frontmatter[1] ?? ""));
      const [pathArtistSlug, pathGenreOrTitleSlug, pathTitleOrFilename, pathFilename] = segments;
      const artistSlug = pathArtistSlug;
      const genreSlug = canonicalPath ? pathGenreOrTitleSlug : metadata?.genre_slug;
      const titleSlug = canonicalPath ? pathTitleOrFilename : pathGenreOrTitleSlug;
      const filename = canonicalPath ? pathFilename : pathTitleOrFilename;
      if (
        !metadata ||
        !artistSlug ||
        !genreSlug ||
        !titleSlug ||
        !filename ||
        (canonicalPath && pathFilename === undefined) ||
        (legacyPath && filename !== "index.md") ||
        metadata.artist_slug !== artistSlug ||
        metadata.genre_slug !== genreSlug ||
        metadata.title_slug !== titleSlug
      ) {
        console.warn(`Skipping catalog file with invalid frontmatter: ${relative}`);
        continue;
      }

      const id = `${artistSlug}/${genreSlug}/${titleSlug}`;
      parsedFiles.push({
        songId: id,
        filename: filename ?? "",
        metadata,
        markdown: source.slice(frontmatter[0].length).trim(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Skipping catalog file ${relative}: ${message}`);
    }
  }

  const groups = new Map<string, ParsedFile[]>();
  for (const file of parsedFiles) {
    const group = groups.get(file.songId) ?? [];
    group.push(file);
    groups.set(file.songId, group);
  }

  const songs: CatalogSong[] = [];
  const reports = new Map<string, CatalogReport>();
  for (const [id, group] of groups) {
    const summary = group.find((file) => file.filename === "index.md");
    if (!summary) {
      console.warn(`Skipping catalog entry without index.md: ${id}`);
      continue;
    }

    const songReports = group.map((file) => {
      const sourceFile = file.filename;
      const reportId = `${id}/${sourceFile.slice(0, -".md".length)}`;
      const report: CatalogReport = {
        id: reportId,
        contributor: file.metadata.contributor,
        dateAdded: file.metadata.date_added,
        overallFlowRating: file.metadata.overall_flow_rating,
        timeToFlowSeconds: file.metadata.time_to_flow_seconds,
        markdown: file.markdown,
        sourceFile,
      };
      reports.set(report.id, report);
      return report;
    });
    const metadata = summary.metadata;
    songs.push({
      id,
      artist: metadata.artist,
      artistSlug: metadata.artist_slug,
      genre: metadata.genre,
      genreSlug: metadata.genre_slug,
      title: metadata.title,
      titleSlug: metadata.title_slug,
      dateAdded: metadata.date_added,
      overallFlowRating: metadata.overall_flow_rating,
      timeToFlowSeconds: metadata.time_to_flow_seconds,
      bpm: metadata.bpm ?? null,
      key: metadata.key ?? null,
      description: extractDescription(summary.markdown),
      links: extractLinks(summary.markdown),
      triggers: extractTriggers(summary.markdown),
      reports: songReports,
    });
  }

  songs.sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));
  return { songs, reports };
}

async function findMarkdownFiles(root: string, relative = ""): Promise<string[]> {
  const directory = path.join(root, relative);
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findMarkdownFiles(root, entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path.join(root, entryPath));
    }
  }
  return files;
}

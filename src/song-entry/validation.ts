import { isSlug, slugify } from "./slug.js";
import { parseFlowTriggerPoint } from "./trigger-point.js";
import type {
  MetadataSource,
  SongEntryDetails,
  SongEntryFrontmatter,
  TrackMetadata,
  ValidationIssue,
  ValidationResult,
} from "./types.js";

const ALLOWED_LINK_HOSTS = new Set([
  "musicbrainz.org",
  "www.musicbrainz.org",
  "music.apple.com",
  "www.music.apple.com",
  "open.spotify.com",
  "spotify.com",
  "www.youtube.com",
  "youtube.com",
  "music.youtube.com",
]);
function isMetadataSource(value: unknown): value is MetadataSource {
  return value === "MUSICBRAINZ" || value === "APPLE_MUSIC" || value === "MANUAL";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readRequiredString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

export function readInteger(value: unknown, minimum: number, maximum: number): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum
    ? value
    : undefined;
}

function requiredText(
  value: unknown,
  field: string,
  issues: ValidationIssue[],
  maxLength: number,
): string {
  const normalized = readRequiredString(value);
  if (!normalized) {
    issues.push({ field, message: "is required" });
    return "";
  }
  if (normalized.length > maxLength) issues.push({ field, message: `must be at most ${maxLength} characters` });
  if (/[\r\n]/.test(normalized)) issues.push({ field, message: "must not contain line breaks" });
  return normalized;
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseSongEntryFrontmatter(data: unknown): SongEntryFrontmatter | undefined {
  if (!isRecord(data)) return undefined;

  const artist = readRequiredString(data.artist);
  const artistSlug = readRequiredString(data.artist_slug);
  const genre = readRequiredString(data.genre);
  const genreSlug = readRequiredString(data.genre_slug);
  const title = readRequiredString(data.title);
  const titleSlug = readRequiredString(data.title_slug);
  const contributor = readRequiredString(data.contributor);
  const dateAdded = readRequiredString(data.date_added);
  const rating = readInteger(data.overall_flow_rating, 1, 5);
  const timeToFlow = readInteger(data.time_to_flow_seconds, 0, 86_400);
  const bpm = typeof data.bpm === "number" && Number.isInteger(data.bpm) && data.bpm >= 1 && data.bpm <= 400
    ? String(data.bpm)
    : typeof data.bpm === "string" && /^\d{1,3}(?:-\d{1,3})?$/.test(data.bpm)
      ? data.bpm
      : undefined;
  const key = data.key === undefined ? undefined : readRequiredString(data.key);

  if (
    !artist ||
    !artistSlug ||
    !genre ||
    !genreSlug ||
    !title ||
    !titleSlug ||
    !contributor ||
    !dateAdded ||
    rating === undefined ||
    timeToFlow === undefined ||
    !validDate(dateAdded) ||
    !isSlug(artistSlug) ||
    !isSlug(genreSlug) ||
    !isSlug(titleSlug) ||
    (data.bpm !== undefined && bpm === undefined) ||
    (data.key !== undefined && key === undefined)
  ) return undefined;

  const metadata: SongEntryFrontmatter = {
    artist,
    artist_slug: artistSlug,
    genre,
    genre_slug: genreSlug,
    title,
    title_slug: titleSlug,
    contributor,
    date_added: dateAdded,
    overall_flow_rating: rating,
    time_to_flow_seconds: timeToFlow,
  };
  if (bpm !== undefined) metadata.bpm = bpm;
  if (key !== undefined) metadata.key = key;
  return metadata;
}

export function validateSongEntryDetails(
  input: unknown,
  dateAdded = new Date().toISOString().slice(0, 10),
): ValidationResult<SongEntryDetails> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) {
    return { ok: false, issues: [{ field: "details", message: "must be an object" }] };
  }

  const genre = requiredText(input.genre, "genre", issues, 100);
  const contributor = requiredText(input.contributor, "contributor", issues, 100);
  const workContext = requiredText(input.workContext, "workContext", issues, 200);
  const environment = requiredText(input.environment, "environment", issues, 200);
  const description = requiredText(input.description, "description", issues, 5000);
  const flowRating = readInteger(input.flowRating, 1, 5);
  if (flowRating === undefined) issues.push({ field: "flowRating", message: "must be an integer between 1 and 5" });
  const timeToFlowSeconds = readInteger(input.timeToFlowSeconds, 0, 86_400);
  if (timeToFlowSeconds === undefined) {
    issues.push({ field: "timeToFlowSeconds", message: "must be an integer between 0 and 86400" });
  }
  const date = input.dateAdded === undefined
    ? dateAdded
    : requiredText(input.dateAdded, "dateAdded", issues, 10);
  if (!validDate(date)) issues.push({ field: "dateAdded", message: "must be a valid date in YYYY-MM-DD format" });

  let genreSlug: string;
  try {
    const suppliedSlug = input.genreSlug === undefined
      ? genre
      : requiredText(input.genreSlug, "genreSlug", issues, 100);
    genreSlug = slugify(suppliedSlug);
  } catch {
    genreSlug = "";
    issues.push({ field: "genreSlug", message: "must contain at least one URL-safe character" });
  }

  const flowAchieved = input.flowAchieved;
  if (typeof flowAchieved !== "boolean") {
    issues.push({ field: "flowAchieved", message: "must be true or false" });
  }
  if (!Array.isArray(input.triggerPoints) || input.triggerPoints.length < 1 || input.triggerPoints.length > 20) {
    issues.push({ field: "triggerPoints", message: "must contain between 1 and 20 timestamped points" });
  }
  const triggerPoints = Array.isArray(input.triggerPoints)
    ? input.triggerPoints.map((point, index) => {
        if (typeof point !== "string" || !parseFlowTriggerPoint(point)) {
          issues.push({ field: `triggerPoints[${index}]`, message: "must start with a timestamp such as '01:15 – Peak focus'" });
          return "";
        }
        return point.trim();
      }).filter(Boolean)
    : [];

  if (
    issues.length ||
    flowRating === undefined ||
    timeToFlowSeconds === undefined ||
    typeof flowAchieved !== "boolean"
  ) return { ok: false, issues };
  return {
    ok: true,
    value: {
      genre,
      genreSlug,
      contributor,
      dateAdded: date,
      flowRating,
      timeToFlowSeconds,
      flowAchieved,
      workContext,
      environment,
      description,
      triggerPoints,
    },
  };
}

export function validateTrackMetadata(input: unknown): ValidationResult<TrackMetadata> {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { ok: false, issues: [{ field: "metadata", message: "must be an object" }] };
  const title = requiredText(input.title, "metadata.title", issues, 200);
  const artist = requiredText(input.artist, "metadata.artist", issues, 200);
  const source = input.source;
  if (!isMetadataSource(source)) {
    issues.push({ field: "metadata.source", message: "must be MUSICBRAINZ, APPLE_MUSIC, or MANUAL" });
  }
  if (!Array.isArray(input.links) || input.links.length > 10) {
    issues.push({ field: "metadata.links", message: "must be a list of at most 10 provider links" });
  }

  const links = Array.isArray(input.links)
    ? input.links.map((item, index) => {
        if (!isRecord(item)) {
          issues.push({ field: `metadata.links[${index}]`, message: "must include a label and HTTPS provider URL" });
          return { label: "", url: "" };
        }
        const label = requiredText(item.label, `metadata.links[${index}].label`, issues, 60);
        const urlText = requiredText(item.url, `metadata.links[${index}].url`, issues, 2048);
        if (!/^[\p{L}\p{N}][\p{L}\p{N} .&+_-]*$/u.test(label)) {
          issues.push({ field: `metadata.links[${index}].label`, message: "contains unsupported Markdown characters" });
        }
        let url = "";
        try {
          const parsed = new URL(urlText);
          if (
            parsed.protocol !== "https:" ||
            parsed.username ||
            parsed.password ||
            !ALLOWED_LINK_HOSTS.has(parsed.hostname)
          ) {
            issues.push({ field: `metadata.links[${index}].url`, message: "must be an HTTPS URL from a supported music provider" });
          } else {
            url = parsed.toString();
          }
        } catch {
          issues.push({ field: `metadata.links[${index}].url`, message: "must be a valid HTTPS provider URL" });
        }
        return { label, url };
      })
    : [];

  if (issues.length || !isMetadataSource(source)) return { ok: false, issues };
  return {
    ok: true,
    value: {
      title,
      artist,
      source,
      links,
    },
  };
}

export function validationMessage(issues: ValidationIssue[]): string {
  return issues.map(({ field, message }) => `${field} ${message}`).join("; ");
}

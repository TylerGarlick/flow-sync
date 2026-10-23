import type { SongEntryDetails, SongEntryLocation, TrackMetadata } from "./types.js";
import { slugify } from "./slug.js";
import { parseFlowTriggerPoint } from "./trigger-point.js";

function yamlQuote(value: string) {
  return JSON.stringify(value);
}

function replaceOnce(content: string, pattern: RegExp, replacement: string, field: string) {
  if (!pattern.test(content)) throw new Error(`The song template is missing its ${field} placeholder.`);
  return content.replace(pattern, replacement);
}

function tableCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function renderTriggerPoint(point: string) {
  const parsed = parseFlowTriggerPoint(point);
  if (!parsed) throw new Error(`Invalid flow trigger timestamp: "${point}".`);
  return `* **\`${parsed.timestamp}\`**${parsed.description ? ` – ${parsed.description}` : ""}`;
}

export function renderSongEntry(
  template: string,
  metadata: TrackMetadata,
  details: SongEntryDetails,
  slugs: SongEntryLocation = songEntryLocation(metadata, details.genreSlug),
) {
  let output = template;
  const fields: Record<string, string> = {
    artist: yamlQuote(metadata.artist),
    artist_slug: yamlQuote(slugs.artistSlug),
    genre: yamlQuote(details.genre),
    genre_slug: yamlQuote(slugs.genreSlug),
    title: yamlQuote(metadata.title),
    title_slug: yamlQuote(slugs.titleSlug),
    contributor: yamlQuote(details.contributor),
    date_added: yamlQuote(details.dateAdded),
    overall_flow_rating: String(details.flowRating),
    time_to_flow_seconds: String(details.timeToFlowSeconds),
  };

  for (const [field, value] of Object.entries(fields)) {
    output = replaceOnce(output, new RegExp(`^${field}:.*$`, "m"), `${field}: ${value}`, `frontmatter ${field}`);
  }

  output = replaceOnce(
    output,
    /^# \{Song Title\} – \{Artist Name\}$/m,
    `# ${metadata.title} – ${metadata.artist}`,
    "song heading",
  );

  const links = metadata.links.length
    ? metadata.links.map(({ label, url }) => `* **${label}:** [Open ${label}](${url})`).join("\n")
    : "* No provider links were found.";
  output = replaceOnce(output, /^\* \*\*Spotify:\*\*[\s\S]*?(?=\n\n---)/m, links, "provider links");

  output = replaceOnce(output, /^\* \*\*Work \/ Activity Type:\*\*.*$/m, `* **Work / Activity Type:** ${details.workContext}`, "work context");
  output = replaceOnce(output, /^\* \*\*Environment:\*\*.*$/m, `* **Environment:** ${details.environment}`, "environment");
  output = replaceOnce(
    output,
    /^\* \*\*Description:\*\*[\s\S]*?(?=\n\n---)/m,
    `* **Description:**\n  ${details.description.replace(/\r?\n/g, "\n  ")}`,
    "description",
  );
  output = replaceOnce(
    output,
    /^\* \*\*`00:00 - 00:30`[\s\S]*?(?=\n\n---)/m,
    details.triggerPoints.map(renderTriggerPoint).join("\n"),
    "flow trigger points",
  );
  output = replaceOnce(
    output,
    /^\| `@your-username`.*$/m,
    `| \`${details.contributor.startsWith("@") ? details.contributor : `@${details.contributor}`}\` | ${tableCell(details.workContext)} | ~${details.timeToFlowSeconds}s | ${details.flowAchieved ? "Yes" : "No"} | ${"⭐".repeat(details.flowRating)} | ${tableCell(details.description)} |`,
    "community review row",
  );

  return output;
}

export function songEntryLocation(metadata: TrackMetadata, genre: string): SongEntryLocation {
  const slugs = {
    artistSlug: slugify(metadata.artist),
    genreSlug: slugify(genre),
    titleSlug: slugify(metadata.title),
  };
  return {
    ...slugs,
    relativePath: `${slugs.artistSlug}/${slugs.genreSlug}/${slugs.titleSlug}/index.md`,
  };
}

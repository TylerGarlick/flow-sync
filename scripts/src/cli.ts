import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { previewSongEntry, writeSongEntry } from "../../src/song-entry/generator.js";
import { lookupMetadata } from "../../src/song-entry/metadata.js";
import { slugify } from "../../src/song-entry/slug.js";
import {
  validateSongEntryDetails,
  validateTrackMetadata,
  validationMessage,
} from "../../src/song-entry/validation.js";
import type { MetadataCandidate, SongEntryDetails, TrackMetadata } from "../../src/song-entry/types.js";

type Options = Record<string, string | boolean>;
const VALUE_OPTIONS = new Set([
  "url",
  "title",
  "artist",
  "genre",
  "genre-slug",
  "contributor",
  "flow-rating",
  "time-to-flow-seconds",
  "flow-achieved",
  "work-context",
  "environment",
  "description",
  "trigger-points",
]);

function parseArgs(args: string[]): Options {
  const options: Options = {};
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (!arg.startsWith("--")) throw new Error(`Unexpected argument: ${arg}`);
    const key = arg.slice(2);
    if (key === "dry-run" || key === "help") {
      options[key] = true;
      continue;
    }
    if (!VALUE_OPTIONS.has(key)) throw new Error(`Unknown option: --${key}`);
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error(`Expected a value after --${key}.`);
    options[key] = value;
  }
  return options;
}

function option(options: Options, key: string) {
  const value = options[key];
  return typeof value === "string" ? value : undefined;
}

function requiredNumber(value: string | undefined, label: string, min: number, max = Number.MAX_SAFE_INTEGER) {
  const number = value === undefined ? Number.NaN : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`${label} must be a whole number from ${min} to ${max}.`);
  }
  return number;
}

async function main() {
  const options = parseArgs(Bun.argv.slice(2));
  if (options.help) {
    console.log(`Usage: bun run generate:song -- [options]

Provide --url (MusicBrainz recording or Apple Music song), or --title and --artist.
Options: --genre --genre-slug --contributor --flow-rating --time-to-flow-seconds --flow-achieved
         --work-context --environment --description --trigger-points --dry-run`);
    return;
  }

  const root = resolve(process.env.FLOWSYNC_ROOT ?? resolve(import.meta.dir, "../.."));
  const rl = createInterface({ input: stdin, output: stdout });
  const queuedLines: string[] = [];
  let waitingForLine: ((line: string | null) => void) | undefined;
  let inputClosed = false;
  rl.on("line", (line) => {
    if (waitingForLine) {
      const resolveLine = waitingForLine;
      waitingForLine = undefined;
      resolveLine(line);
    } else {
      queuedLines.push(line);
    }
  });
  rl.on("close", () => {
    inputClosed = true;
    waitingForLine?.(null);
    waitingForLine = undefined;
  });
  const readLine = (prompt: string) => {
    stdout.write(prompt);
    if (queuedLines.length) return Promise.resolve(queuedLines.shift()!);
    if (inputClosed) return Promise.resolve(null);
    return new Promise<string | null>((resolveLine) => {
      waitingForLine = resolveLine;
    });
  };
  const ask = async (label: string, current?: string, required = true) => {
    while (true) {
      const suffix = current ? ` [${current}]` : "";
      const answer = (await readLine(`${label}${suffix}: `))?.trim();
      if (answer === null) {
        if (current) return current;
        if (!required) return "";
        throw new Error(`Input ended before ${label} was provided.`);
      }
      const value = answer || current || "";
      if (value || !required) return value;
      console.log(`${label} is required.`);
    }
  };

  try {
    const inputUrl = option(options, "url");
    if (inputUrl && (option(options, "title") || option(options, "artist"))) {
      throw new Error("Use either --url or --title with --artist, not both.");
    }
    let metadata: TrackMetadata;
    if (inputUrl) {
      const result = await lookupMetadata({ url: inputUrl });
      const candidate = result.candidates[0];
      if (!candidate) throw new Error("Metadata lookup did not return a song.");
      metadata = candidate;
    } else {
      const title = await ask("Song title", option(options, "title"));
      const artist = await ask("Artist", option(options, "artist"));
      const result = await lookupMetadata({ title, artist });
      result.warnings.forEach((warning) => console.warn(warning));
      metadata = await chooseMetadata(result.candidates, { title, artist }, ask);
    }
    const validatedMetadata = validateTrackMetadata(metadata);
    if (!validatedMetadata.ok) throw new Error(validationMessage(validatedMetadata.issues));
    metadata = validatedMetadata.value;

    const sourceLabel = metadata.source === "MUSICBRAINZ"
      ? "MusicBrainz"
      : metadata.source === "APPLE_MUSIC"
        ? "Apple Music"
        : "manual";
    console.log(`\nSelected: ${metadata.title} — ${metadata.artist} (${sourceLabel})`);
    const genre = await ask("Curated genre", option(options, "genre"));
    const suggestedGenreSlug = slugify(genre);
    const genreSlug = await ask("Genre slug", option(options, "genre-slug") ?? suggestedGenreSlug);
    const contributor = await ask("Contributor (include @ if desired)", option(options, "contributor"));
    const flowRating = requiredNumber(
      await ask("Overall flow rating (1-5)", option(options, "flow-rating")),
      "Overall flow rating",
      1,
      5,
    );
    const timeToFlowSeconds = requiredNumber(
      await ask("Time to flow in seconds", option(options, "time-to-flow-seconds")),
      "Time to flow",
      0,
    );
    const flowAchievedAnswer = (await ask("Was flow achieved? (yes/no)", option(options, "flow-achieved"))).toLowerCase();
    if (!["yes", "y", "no", "n"].includes(flowAchievedAnswer)) {
      throw new Error("Flow achieved must be answered yes or no.");
    }
    const workContext = await ask("Work / activity type", option(options, "work-context"));
    const environment = await ask("Listening environment", option(options, "environment"));
    const description = await ask("Description", option(options, "description"));
    const triggerText = await ask(
      "Flow trigger points (separate points with |)",
      option(options, "trigger-points"),
    );
    const rawDetails = {
      genre,
      genreSlug,
      contributor,
      flowRating,
      timeToFlowSeconds,
      flowAchieved: ["yes", "y"].includes(flowAchievedAnswer),
      workContext,
      environment,
      description,
      triggerPoints: triggerText.split("|").map((point) => point.trim()).filter(Boolean),
    };
    const validated = validateSongEntryDetails(rawDetails);
    if (!validated.ok) throw new Error(validationMessage(validated.issues));
    const details: SongEntryDetails = validated.value;
    const preview = await previewSongEntry(root, metadata, details);
    if (preview.alreadyExists) {
      throw new Error(`Destination already exists: ${preview.path}. Choose a different song or review the existing entry; it will not be overwritten.`);
    }

    console.log(`\n--- ${preview.path} ---\n${preview.markdown}`);
    if (preview.catalogChanged) {
      console.log(`--- music/index.md ---\n${preview.catalogMarkdown}`);
    } else {
      console.log("Catalog entry already exists; music/index.md will not change.");
    }

    if (options["dry-run"]) {
      console.log("\nDry run: no files were written.");
      return;
    }
    const confirmation = (await ask("Write these changes? [y/N]", "N", false)).toLowerCase();
    if (!["y", "yes"].includes(confirmation)) {
      console.log("Cancelled; no files were written.");
      return;
    }

    const written = await writeSongEntry(root, metadata, details);
    console.log(`\nCreated ${written.path}${written.catalogChanged ? " and updated music/index.md" : ""}.`);
  } finally {
    rl.close();
  }
}

async function chooseMetadata(
  candidates: MetadataCandidate[],
  manual: { title: string; artist: string },
  ask: (label: string, current?: string, required?: boolean) => Promise<string>,
): Promise<TrackMetadata> {
  if (candidates.length) {
    console.log("\nMetadata candidates (review before choosing):");
    candidates.forEach((candidate, index) => {
      const sourceLabel = candidate.source === "MUSICBRAINZ"
        ? "MusicBrainz"
        : candidate.source === "APPLE_MUSIC"
          ? "Apple Music"
          : "manual";
      console.log(`  ${index + 1}. ${candidate.title} — ${candidate.artist} (${sourceLabel})`);
    });
    console.log("  0. Use the title and artist you entered");
    const choice = requiredNumber(await ask("Candidate number", "0"), "Candidate number", 0, candidates.length);
    if (choice === 0) return { ...manual, links: [], source: "MANUAL" };
    const selected = candidates[choice - 1];
    if (!selected) throw new Error("The selected metadata candidate is unavailable.");
    return selected;
  }
  console.log("No metadata candidates found; using the title and artist you entered.");
  return { ...manual, links: [], source: "MANUAL" };
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

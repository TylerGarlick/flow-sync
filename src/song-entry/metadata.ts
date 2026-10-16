import type { MetadataCandidate, MetadataLookupInput, MetadataSearchResult } from "./types.js";

export class MetadataLookupInputError extends Error {}
export class MetadataProviderError extends Error {}

interface ArtistCredit {
  name?: string;
  artist?: { name?: string };
  joinphrase?: string;
}

interface MusicBrainzRecording {
  id?: string;
  title?: string;
  "artist-credit"?: ArtistCredit[];
}

interface AppleTrack {
  trackName?: string;
  artistName?: string;
  trackViewUrl?: string;
}

const USER_AGENT =
  "FlowSyncSongEntryGenerator/1.0 (https://github.com/TylerGarlick/flow-sync)";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let lastMusicBrainzRequestAt = 0;
let musicBrainzRequestQueue = Promise.resolve();

function artistName(
  credits: Array<{ name?: string; artist?: { name?: string }; joinphrase?: string }> = [],
) {
  return credits
    .map((credit) => `${credit.name ?? credit.artist?.name ?? ""}${credit.joinphrase ?? ""}`)
    .join("")
    .trim();
}

function musicBrainzUrl(id: string) {
  return `https://musicbrainz.org/recording/${id}`;
}

async function waitForMusicBrainzTurn(): Promise<void> {
  const turn = musicBrainzRequestQueue.then(async () => {
    const waitMilliseconds = Math.max(0, 1000 - (Date.now() - lastMusicBrainzRequestAt));
    if (waitMilliseconds) await new Promise((resolve) => setTimeout(resolve, waitMilliseconds));
    lastMusicBrainzRequestAt = Date.now();
  });
  musicBrainzRequestQueue = turn.catch(() => undefined);
  await turn;
}

export function parseSupportedSongUrl(input: string): { provider: "musicbrainz" | "apple"; id: string } {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new MetadataLookupInputError("Enter a valid MusicBrainz recording or Apple Music song URL.");
  }

  if (url.protocol !== "https:") {
    throw new MetadataLookupInputError("Song URLs must use HTTPS.");
  }

  if (url.hostname === "musicbrainz.org" || url.hostname === "www.musicbrainz.org") {
    const match = url.pathname.match(/^\/recording\/([0-9a-f-]+)\/?$/i);
    const id = match?.[1];
    if (id && UUID.test(id)) return { provider: "musicbrainz", id };
  }

  if (url.hostname === "music.apple.com" || url.hostname === "www.music.apple.com") {
    const albumMatch = url.pathname.match(/^\/[a-z]{2}(?:-[a-z]{2})?\/album\/[^/]+\/\d+\/?$/i);
    const songMatch = url.pathname.match(/^\/[a-z]{2}(?:-[a-z]{2})?\/song\/[^/]+\/(\d+)\/?$/i);
    const trackId = url.searchParams.get("i") ?? songMatch?.[1];
    if ((albumMatch || songMatch) && trackId && /^\d+$/.test(trackId)) return { provider: "apple", id: trackId };
  }

  throw new MetadataLookupInputError("Supported song URLs are MusicBrainz recording pages and Apple Music song pages.");
}

async function requestJson<T>(url: URL): Promise<T> {
  if (url.hostname === "musicbrainz.org") await waitForMusicBrainzTurn();
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    throw new MetadataProviderError(
      `Could not reach ${url.hostname}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (!response.ok) throw new MetadataProviderError(`Metadata service returned HTTP ${response.status} for ${url.hostname}.`);
  try {
    return await response.json() as T;
  } catch {
    throw new MetadataProviderError(`Metadata service returned invalid JSON for ${url.hostname}.`);
  }
}

async function musicBrainzRecording(id: string): Promise<MetadataCandidate> {
  const url = new URL(`https://musicbrainz.org/ws/2/recording/${id}`);
  url.searchParams.set("inc", "artists");
  url.searchParams.set("fmt", "json");
  const recording = await requestJson<MusicBrainzRecording>(url);
  const artist = artistName(recording["artist-credit"]);
  if (!recording.title || !artist) throw new MetadataProviderError("MusicBrainz did not return a title and artist for that recording.");
  return {
    title: recording.title,
    artist,
    links: [{ label: "MusicBrainz", url: musicBrainzUrl(id) }],
    source: "MUSICBRAINZ",
  };
}

async function appleTrack(id: string): Promise<MetadataCandidate> {
  const url = new URL("https://itunes.apple.com/lookup");
  url.searchParams.set("id", id);
  const result = await requestJson<{ results?: AppleTrack[] }>(url);
  const track = result.results?.[0];
  if (!track?.trackName || !track?.artistName || !track.trackViewUrl) {
    throw new MetadataProviderError("Apple did not return a song for that Apple Music URL.");
  }
  return {
    title: track.trackName,
    artist: track.artistName,
    links: [{ label: "Apple Music", url: track.trackViewUrl }],
    source: "APPLE_MUSIC",
  };
}

export async function lookupSongUrl(input: string): Promise<MetadataCandidate> {
  const parsed = parseSupportedSongUrl(input);
  return parsed.provider === "musicbrainz"
    ? musicBrainzRecording(parsed.id)
    : appleTrack(parsed.id);
}

export async function lookupMetadata(input: MetadataLookupInput): Promise<MetadataSearchResult> {
  const url = input.url?.trim();
  const title = input.title?.trim();
  const artist = input.artist?.trim();

  if (url) {
    if (title || artist) {
      throw new MetadataLookupInputError("Provide either a supported song URL or both title and artist.");
    }
    return { candidates: [await lookupSongUrl(url)], warnings: [] };
  }

  if (!title || !artist) {
    throw new MetadataLookupInputError("Provide either a supported song URL or both title and artist.");
  }
  return searchMetadata(title, artist);
}

export async function searchMetadata(title: string, artist: string): Promise<MetadataSearchResult> {
  const candidates: MetadataCandidate[] = [];
  const warnings: string[] = [];
  const query = new URL("https://musicbrainz.org/ws/2/recording/");
  query.searchParams.set("query", `recording:"${title}" AND artist:"${artist}"`);
  query.searchParams.set("fmt", "json");
  query.searchParams.set("limit", "5");
  try {
    const result = await requestJson<{ recordings?: MusicBrainzRecording[] }>(query);
    for (const recording of result.recordings ?? []) {
      const candidateArtist = artistName(recording["artist-credit"]);
      if (!recording.title || !candidateArtist || !recording.id) continue;
      candidates.push({
        title: recording.title,
        artist: candidateArtist,
        links: [{ label: "MusicBrainz", url: musicBrainzUrl(recording.id) }],
        source: "MUSICBRAINZ",
      });
    }
  } catch (error) {
    warnings.push(`MusicBrainz lookup failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const apple = new URL("https://itunes.apple.com/search");
  apple.searchParams.set("term", `${title} ${artist}`);
  apple.searchParams.set("entity", "song");
  apple.searchParams.set("limit", "5");
  try {
    const result = await requestJson<{ results?: AppleTrack[] }>(apple);
    for (const track of result.results ?? []) {
      if (!track.trackName || !track.artistName || !track.trackViewUrl) continue;
      candidates.push({
        title: track.trackName,
        artist: track.artistName,
        links: [{ label: "Apple Music", url: track.trackViewUrl }],
        source: "APPLE_MUSIC",
      });
    }
  } catch (error) {
    warnings.push(`Apple lookup failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const seen = new Set<string>();
  const uniqueCandidates = candidates.filter((candidate) => {
    const key = `${candidate.title.toLocaleLowerCase()}|${candidate.artist.toLocaleLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { candidates: uniqueCandidates, warnings };
}

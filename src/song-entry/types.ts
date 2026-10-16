export interface TrackMetadata {
  title: string;
  artist: string;
  links: SongLink[];
  source: MetadataSource;
}

export type MetadataSource = "MUSICBRAINZ" | "APPLE_MUSIC" | "MANUAL";

export interface SongLink {
  label: string;
  url: string;
}

export interface MetadataLookupInput {
  url?: string;
  title?: string;
  artist?: string;
}

export interface SongEntryDetailsInput {
  genre: string;
  genreSlug?: string;
  contributor: string;
  dateAdded?: string;
  flowRating: number;
  timeToFlowSeconds: number;
  flowAchieved: boolean;
  workContext: string;
  environment: string;
  description: string;
  triggerPoints: string[];
}

export interface SongEntryDetails {
  genre: string;
  genreSlug: string;
  contributor: string;
  dateAdded: string;
  flowRating: number;
  timeToFlowSeconds: number;
  flowAchieved: boolean;
  workContext: string;
  environment: string;
  description: string;
  triggerPoints: string[];
}

export interface SongEntryFrontmatter {
  artist: string;
  artist_slug: string;
  genre: string;
  genre_slug: string;
  title: string;
  title_slug: string;
  contributor: string;
  date_added: string;
  overall_flow_rating: number;
  time_to_flow_seconds: number;
  bpm?: string;
  key?: string;
}

export interface MetadataSearchResult {
  candidates: MetadataCandidate[];
  warnings: string[];
}

export interface SongEntryLocation {
  artistSlug: string;
  genreSlug: string;
  titleSlug: string;
  relativePath: string;
}

export interface SongEntryPreview {
  path: string;
  markdown: string;
  catalogMarkdown: string;
  catalogChanged: boolean;
  alreadyExists: boolean;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: ValidationIssue[] };

export type MetadataCandidate = TrackMetadata;

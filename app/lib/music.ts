import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getGenre, GENRE_TAXONOMY } from './taxonomy';

const MUSIC_ROOT = path.resolve('/Users/tylergarlick/@Projects/flow-sync/music');

export interface Song {
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
  bpm: number;
  key: string;
  yt_music_url?: string;
  spotify_url?: string;
  content: string;
  path: string;
}

export async function getAllSongs(): Promise<Song[]> {
  const songs: Song[] = [];
  if (!fs.existsSync(MUSIC_ROOT)) return [];
  const artists = fs.readdirSync(MUSIC_ROOT);

  for (const artist of artists) {
    if (artist === 'index.md') continue;
    const artistPath = path.join(MUSIC_ROOT, artist);
    if (!fs.statSync(artistPath).isDirectory()) continue;

    const genres = fs.readdirSync(artistPath);
    for (const genre of genres) {
      const genrePath = path.join(artistPath, genre);
      if (!fs.statSync(genrePath).isDirectory()) continue;

      const songFolders = fs.readdirSync(genrePath);
      for (const songFolder of songFolders) {
        const songPath = path.join(genrePath, songFolder, 'index.md');
        if (fs.existsSync(songPath)) {
          const fileContent = fs.readFileSync(songPath, 'utf8');
          const { data, content } = matter(fileContent);
          
          const ytMusicMatch = content.match(/\[Listen on YouTube Music\]\((.*?)\)/);
          const spotifyMatch = content.match(/\[Listen on Spotify\]\((.*?)\)/);
          
          const taxonomyGenre = getGenre(genre);

          songs.push({
            ...data,
            genre: taxonomyGenre ? taxonomyGenre.name : (data.genre || genre),
            genre_slug: genre,
            content,
            path: songPath,
            yt_music_url: ytMusicMatch ? ytMusicMatch[1] : undefined,
            spotify_url: spotifyMatch ? spotifyMatch[1] : undefined,
          } as Song);
        }
      }
    }
  }
  return songs;
}

export async function searchSongs(query: string): Promise<Song[]> {
  const allSongs = await getAllSongs();
  const q = query.toLowerCase();
  
  return allSongs.filter(song => 
    song.title?.toLowerCase().includes(q) || 
    song.artist?.toLowerCase().includes(q) || 
    song.genre?.toLowerCase().includes(q) || 
    song.content?.toLowerCase().includes(q)
  );
}

export async function saveSong(song: Partial<Song>) {
  const { artist, artist_slug, genre, genre_slug, title, title_slug } = song;
  if (!artist_slug || !genre_slug || !title_slug) throw new Error('Missing slugs');
  
  if (!GENRE_TAXONOMY[genre_slug]) {
    throw new Error(`Invalid genre slug: ${genre_slug}. Please use a valid genre from the taxonomy.`);
  }

  const songDir = path.join(MUSIC_ROOT, artist_slug, genre_slug, title_slug);
  fs.mkdirSync(songDir, { recursive: true });

  const yaml = matter.stringify({
    artist: song.artist,
    artist_slug: song.artist_slug,
    genre: song.genre || GENRE_TAXONOMY[genre_slug].name,
    genre_slug: song.genre_slug,
    title: song.title,
    title_slug: song.title_slug,
    contributor: song.contributor,
    date_added: song.date_added,
    overall_flow_rating: song.overall_flow_rating,
    time_to_flow_seconds: song.time_to_flow_seconds,
    bpm: song.bpm,
    key: song.key,
  }, '---');
  const content = `\n# ${title} – ${artist}\n\n## 🔗 Quick Links\n* **YouTube Music:** [Listen on YouTube Music](${song.yt_music_url || '#'}) *(Preferred)*\n* **Spotify:** [Listen on Spotify](${song.spotify_url || '#'})`;
  
  fs.writeFileSync(path.join(songDir, 'index.md'), yaml + content);
  return { success: true };
}

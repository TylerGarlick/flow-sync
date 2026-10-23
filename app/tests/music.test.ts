import { describe, it, expect } from 'bun:test';
import { getAllSongs, searchSongs } from '../lib/music';

describe('Music Utility (Integration)', () => {
  it('should fetch songs from the music directory', async () => {
    const songs = await getAllSongs();
    expect(songs.length).toBeGreaterThan(0);
  });

  it('should search songs by title', async () => {
    // 'Contact' is a known song in the repo
    const results = await searchSongs('Contact');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('Contact');
  });
});

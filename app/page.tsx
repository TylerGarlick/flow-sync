'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Music, Plus } from 'lucide-react';

interface Song {
  title: string;
  artist: string;
  genre: string;
  overall_flow_rating: number;
  title_slug: string;
}

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs(q = '') {
    setLoading(true);
    const url = q ? `/api/songs?q=${encodeURIComponent(q)}` : '/api/songs';
    const res = await fetch(url);
    const data = await res.json();
    setSongs(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
            <Music className="text-emerald-400" /> Flow Sync
          </h1>
          <Link 
            href="/capture" 
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors"
          >
            <Plus size={20} /> Capture Song
          </Link>
        </header>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
          <input 
            type="text" 
            placeholder="Search flow songs (artist, title, genre)..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchSongs(query)}
          />
          <button 
            onClick={() => fetchSongs(query)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-lg text-sm"
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading flow state...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {songs.map((song) => (
              <Link 
                key={song.title_slug} 
                href={`/songs/${song.title_slug}`}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-emerald-400 transition-colors">{song.title}</h3>
                    <p className="text-zinc-400 text-sm">{song.artist}</p>
                  </div>
                  <span className="text-emerald-400 font-mono text-sm">
                    ★ {song.overall_flow_rating}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{song.genre}</span>
                </div>
              </Link>
            ))}
            {songs.length === 0 && (
              <div className="col-span-full text-center py-20 text-zinc-500">
                No songs found. Try another query or capture a new one.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

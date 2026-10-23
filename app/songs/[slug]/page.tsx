import { getAllSongs } from '@/lib/music';
import { notFound } from 'next/navigation';
import { Music, ExternalLink, Clock, Activity, Hash } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
  const songs = await getAllSongs();
  return songs.map(song => ({ slug: song.title_slug }));
}

export default async function SongPage({ params }: { params: { slug: string } }) {
  const songs = await getAllSongs();
  const song = songs.find(s => s.title_slug === params.slug);

  if (!song) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-zinc-400 hover:text-white mb-8 inline-block transition-colors">
          ← Back to Library
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter mb-2">{song.title}</h1>
            <p className="text-2xl text-zinc-400">{song.artist}</p>
          </div>
          <div className="flex gap-3">
            <a 
              href={song.yt_music_url} 
              target="_blank" 
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
            >
              <Music size={20} /> YouTube Music
            </a>
            <a 
              href={song.spotify_url} 
              target="_blank" 
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors"
            >
              <ExternalLink size={20} /> Spotify
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase mb-1">
              <Activity size={14} /> Flow Rating
            </div>
            <div className="text-2xl font-bold text-emerald-400">{song.overall_flow_rating}/5</div>
          </div>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase mb-1">
              <Clock size={14} /> Time to Flow
            </div>
            <div className="text-2xl font-bold">{song.time_to_flow_seconds}s</div>
          </div>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase mb-1">
              <Hash size={14} /> BPM
            </div>
            <div className="text-2xl font-bold">{song.bpm}</div>
          </div>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase mb-1">
              <span>Key</span>
            </div>
            <div className="text-2xl font-bold">{song.key}</div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none">
          <div 
            className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 whitespace-pre-wrap text-zinc-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: song.content }} 
          />
        </div>
      </div>
    </main>
  );
}

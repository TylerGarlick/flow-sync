'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Music, Sparkles, Save, ArrowLeft } from 'lucide-react';

export default function CapturePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [form, setForm] = useState({
    artist: '',
    artist_slug: '',
    genre: '',
    genre_slug: '',
    title: '',
    title_slug: '',
    yt_music_url: '',
    spotify_url: '',
    overall_flow_rating: 5,
    time_to_flow_seconds: 90,
    bpm: 120,
    key: '',
  });

  const handleSlug = (field: string, value: string) => {
    const slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    setForm(prev => ({ ...prev, [field]: value, [`${field}_slug`]: slug }));
  };

  async function enrich() {
    if (!form.artist || !form.title) return alert('Artist and Title required for AI enrichment');
    setEnriching(true);
    try {
      const res = await fetch('/api/songs/enrich', {
        method: 'POST',
        body: JSON.stringify({ artist: form.artist, title: form.title }),
      });
      const data = await res.json();
      setForm(prev => ({
        ...prev,
        overall_flow_rating: data.overall_flow_rating,
        time_to_flow_seconds: data.time_to_flow_seconds,
        bpm: data.bpm,
        key: data.key,
      }));
    } finally {
      setEnriching(false);
    }
  }

  async function save() {
    setLoading(true);
    try {
      const res = await fetch('/api/songs/save', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/');
      } else {
        alert('Failed to save song');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Library
        </Link>
        
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <Music className="text-emerald-400" /> Capture Flow Song
        </h1>

        <div className="space-y-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Artist</label>
              <input 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.artist}
                onChange={e => handleSlug('artist', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Song Title</label>
              <input 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.title}
                onChange={e => handleSlug('title', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Genre</label>
            <input 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
              value={form.genre}
              onChange={e => handleSlug('genre', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">YT Music URL</label>
              <input 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.yt_music_url}
                onChange={e => setForm(prev => ({ ...prev, yt_music_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Spotify URL</label>
              <input 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.spotify_url}
                onChange={e => setForm(prev => ({ ...prev, spotify_url: e.target.value }))}
              />
            </div>
          </div>

          <div className="p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-emerald-400 font-medium flex items-center gap-2">
                <Sparkles size={18} /> AI Template Filler
              </h3>
              <p className="text-xs text-emerald-500/70">Auto-calculate BPM, Key, and Flow Rating</p>
            </div>
            <button 
              onClick={enrich}
              disabled={enriching}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {enriching ? 'Enriching...' : 'Fill Gaps'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Flow Rating</label>
              <input 
                type="number"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.overall_flow_rating}
                onChange={e => setForm(prev => ({ ...prev, overall_flow_rating: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Time to Flow (s)</label>
              <input 
                type="number"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.time_to_flow_seconds}
                onChange={e => setForm(prev => ({ ...prev, time_to_flow_seconds: parseInt(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">BPM</label>
              <input 
                type="number"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.bpm}
                onChange={e => setForm(prev => ({ ...prev, bpm: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <button 
            onClick={save}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Save size={20} /> {loading ? 'Saving...' : 'Save to Flow Library'}
          </button>
        </div>
      </div>
    </main>
  );
}

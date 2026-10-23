import { NextRequest, NextResponse } from 'next/server';
import { getAllSongs, searchSongs } from '@/lib/music';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (query) {
    const results = await searchSongs(query);
    return NextResponse.json(results);
  }

  const songs = await getAllSongs();
  return NextResponse.json(songs);
}

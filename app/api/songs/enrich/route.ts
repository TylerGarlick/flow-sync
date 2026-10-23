import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { title, artist } = await req.json();
    
    // Simulated AI enrichment logic
    const enrichment = {
      overall_flow_rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
      time_to_flow_seconds: Math.floor(Math.random() * 60) + 60, // 60-120s
      bpm: 120 + Math.floor(Math.random() * 20),
      key: 'C Major',
      description: `High-energy flow state track by ${artist}. Specifically optimized for deep work and momentum.`,
      trigger_points: [
        { time: '00:30', event: 'Bass drop, increases focus' },
        { time: '01:45', event: 'Melodic swell, peaks flow state' }
      ]
    };
    
    return NextResponse.json(enrichment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

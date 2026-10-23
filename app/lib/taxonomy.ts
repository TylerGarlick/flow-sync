export interface Genre {
  slug: string;
  name: string;
  description?: string;
  parent?: string;
}

export const GENRE_TAXONOMY: Record<string, Genre> = {
  'hip-hop': {
    slug: 'hip-hop',
    name: 'Hip Hop',
    description: 'Rhythmic music typically featuring rapping and beat-driven production.',
  },
  'french-house': {
    slug: 'french-house',
    name: 'French House',
    description: 'Filtered house music characterized by disco samples and heavy compression.',
  },
  'progressive-house': {
    slug: 'progressive-house',
    name: 'Progressive House',
    description: 'House music with a progressive structure and atmospheric build-ups.',
  },
  'future-bass': {
    slug: 'future-bass',
    name: 'Future Bass',
    description: 'Synthesizer-heavy electronic music with rhythmic, oscillating basslines.',
  },
  'synthwave-electro': {
    slug: 'synthwave-electro',
    name: 'Synthwave / Electro',
    description: '1980s-inspired electronic music with heavy synth usage.',
  },
  'bass-dubstep-glitch': {
    slug: 'bass-dubstep-glitch',
    name: 'Bass / Dubstep / Glitch',
    description: 'Aggressive low-end frequencies mixed with glitchy textures.',
  },
  'electronic-ambient': {
    slug: 'electronic-ambient',
    name: 'Electronic / Ambient',
    description: 'Atmospheric, textured electronic soundscapes.',
  },
  'drum-and-bass': {
    slug: 'drum-and-bass',
    name: 'Drum & Bass',
    description: 'High-tempo breakbeats and heavy basslines.',
  },
  'electronica-synth': {
    slug: 'electronica-synth',
    name: 'Electronica / Synth',
    description: 'Experimental and structured synthetic compositions.',
  },
  'mid-tempo-bass': {
    slug: 'mid-tempo-bass',
    name: 'Mid-Tempo Bass',
    description: 'Heavy, slow-tempo bass music typically around 100-110 BPM.',
  },
  'dance-electronic': {
    slug: 'dance-electronic',
    name: 'Dance / Electronic',
    description: 'General purpose electronic dance music.',
  },
  'dubstep-melodic': {
    slug: 'dubstep-melodic',
    name: 'Melodic Dubstep',
    description: 'Dubstep focusing on melody and emotional progression.',
  },
  'g-shit': {
    slug: 'g-shit',
    name: 'G-Shit',
    description: 'Specialized high-energy bass textures.',
  },
};

export function getGenre(slug: string): Genre | undefined {
  return GENRE_TAXONOMY[slug];
}

export function getAllGenres(): Genre[] {
  return Object.values(GENRE_TAXONOMY);
}

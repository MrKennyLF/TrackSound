import { NextResponse } from 'next/server';

export async function GET() {
  const ostCollection = [
    { id: 1, game: "The Elder Scrolls V: Skyrim", track: "Dragonborn", composer: "Jeremy Soule" },
    { id: 2, game: "Destiny 2", track: "The Journey", composer: "Michael Salvatori" },
    { id: 3, game: "Warframe", track: "This Is What You Are", composer: "Keith Power" }
  ];

  return NextResponse.json(ostCollection);
}
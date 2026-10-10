import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Consultamos la API pública de Apple buscando bandas sonoras de videojuegos.
    // Sin autenticación, sin tokens, respuesta inmediata.
    const response = await fetch('https://itunes.apple.com/search?term=video+game+original+soundtrack&entity=song&limit=50', {
      cache: 'no-store' 
    });
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: 'No se encontraron pistas en la bóveda de Apple.' }, { status: 404 });
    }
    
    // Filtramos y adaptamos el JSON de Apple al formato que requiere tu minijuego
    const formattedTracks = data.results
      .filter(item => item.previewUrl) // Aseguramos que exista el clip de audio
      .map(item => ({
        id: item.trackId,
        // Usamos el nombre del álbum que suele contener el nombre del juego
        game: item.collectionName || 'Videojuego Desconocido', 
        track: item.trackName,
        composer: item.artistName,
        // Apple entrega clips de 30 segundos de altísima calidad
        audioFile: item.previewUrl 
      }));

    // Mezclamos el arreglo aleatoriamente para el desafío
    const shuffledTracks = formattedTracks.sort(() => 0.5 - Math.random());

    return NextResponse.json(shuffledTracks);
    
  } catch (error) {
    console.error("🚨 ERROR CRÍTICO AL CONECTAR CON APPLE:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
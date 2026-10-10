"use client";
import { useState, useRef } from 'react';

export default function OSTVault() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [soundtracks, setSoundtracks] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para controlar las vistas y el Minijuego
  const [activeTab, setActiveTab] = useState('library'); // 'library' o 'minigame'
  const [currentTrack, setCurrentTrack] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guessResult, setGuessResult] = useState(null); // 'correct' o 'incorrect'
  
  const audioRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        fetchSoundtracks();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSoundtracks = async () => {
    const res = await fetch('/api/soundtracks');
    if (res.ok) {
      const data = await res.json();
      setSoundtracks(data);
    }
  };

  // --- LÓGICA DEL MINIJUEGO ---
  const startNewRound = () => {
    if (!soundtracks) return;
    
    setGuessResult(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // 1. Elegir una pista correcta al azar
    const correctIndex = Math.floor(Math.random() * soundtracks.length);
    const correctOst = soundtracks[correctIndex];
    setCurrentTrack(correctOst);

    // 2. Generar 3 opciones incorrectas
    const wrongOptions = soundtracks.filter(ost => ost.id !== correctOst.id)
                                    .sort(() => 0.5 - Math.random())
                                    .slice(0, 3);
    
    // 3. Mezclar la correcta con las incorrectas
    const allOptions = [correctOst, ...wrongOptions].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
  };

  const handlePlayToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleGuess = (selectedGame) => {
    if (guessResult) return; // Evitar multiples clics
    
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);

    if (selectedGame === currentTrack.game) {
      setGuessResult('correct');
      setScore(prev => prev + 100);
    } else {
      setGuessResult('incorrect');
      setScore(0); // Reiniciar racha
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans text-slate-200">
      {!soundtracks ? (
        // VISTA DE LOGIN (Se mantiene intacta)
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <h1 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            OST Vault
          </h1>
          <p className="text-sm text-slate-400 mb-6">Autenticación requerida para acceder a la biblioteca.</p>
          
          {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-lg">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-purple-500" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Contraseña" required className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-purple-500" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button disabled={loading} type="submit" className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-3 rounded-lg font-bold transition-colors">
              {loading ? 'Verificando Hash...' : 'Desencriptar Acceso'}
            </button>
          </form>
        </div>
      ) : (
        // VISTA PRINCIPAL (Bóveda protegida)
        <div className="w-full max-w-3xl">
          {/* Navegación por pestañas */}
          <div className="flex gap-4 mb-8 border-b border-slate-800 pb-4">
            <button 
              onClick={() => setActiveTab('library')}
              className={`text-xl font-bold transition-colors ${activeTab === 'library' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Biblioteca Verificada
            </button>
            <button 
              onClick={() => { setActiveTab('minigame'); if(!currentTrack) startNewRound(); }}
              className={`text-xl font-bold transition-colors ${activeTab === 'minigame' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Desafío Auditivo
            </button>
          </div>

          {/* CONTENIDO: BIBLIOTECA */}
          {activeTab === 'library' && (
            <div className="grid gap-4">
              {soundtracks.map(ost => (
                <div key={ost.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-purple-500/50 transition-all flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-purple-400">{ost.track}</h3>
                    <p className="text-slate-400 text-sm">{ost.game}</p>
                  </div>
                  <div className="text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                    Composer: {ost.composer}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONTENIDO: MINIJUEGO */}
          {activeTab === 'minigame' && currentTrack && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center">
              <div className="w-full flex justify-between items-center mb-8">
                <span className="text-slate-400 font-mono text-sm">Nivel de Seguridad: Alto</span>
                <span className="bg-slate-950 border border-cyan-900 text-cyan-400 px-4 py-1 rounded-full font-bold">
                  Puntuación: {score}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-6">¿A qué juego pertenece este fragmento?</h2>
              
              {/* Elemento de Audio Oculto */}
              <audio ref={audioRef} src={currentTrack.audioFile} onEnded={() => setIsPlaying(false)} />

              {/* Botón Reproductor (Estilo UI Cyberpunk) */}
              <button 
                onClick={handlePlayToggle}
                className="w-24 h-24 rounded-full bg-cyan-950 border-4 border-cyan-500 flex items-center justify-center hover:bg-cyan-900 hover:scale-105 transition-all mb-10 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                {isPlaying ? (
                  <svg className="w-10 h-10 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                ) : (
                  <svg className="w-12 h-12 text-cyan-400 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>

              {/* Opciones Múltiples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {options.map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => handleGuess(opt.game)}
                    disabled={guessResult !== null}
                    className={`p-4 rounded-xl font-bold border transition-all ${
                      guessResult && opt.game === currentTrack.game ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400' : 
                      guessResult && opt.game !== currentTrack.game ? 'bg-slate-950 border-slate-800 opacity-50' : 
                      'bg-slate-950 border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400'
                    }`}
                  >
                    {opt.game}
                  </button>
                ))}
              </div>

              {/* Resultados y Botón para siguiente ronda */}
              {guessResult && (
                <div className="mt-8 flex flex-col items-center animate-fade-in">
                  <p className={`text-xl font-bold mb-4 ${guessResult === 'correct' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {guessResult === 'correct' ? '¡ACCESO CONCEDIDO! Respuesta Correcta.' : `BRECHA DETECTADA. Era de ${currentTrack.game}`}
                  </p>
                  <button 
                    onClick={startNewRound}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                  >
                    Siguiente Fragmento
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
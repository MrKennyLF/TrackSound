"use client";
import { useState } from 'react';

export default function OSTVault() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [soundtracks, setSoundtracks] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans text-slate-200">
      {!soundtracks ? (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <h1 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            OST Vault
          </h1>
          <p className="text-sm text-slate-400 mb-6">Autenticación requerida para acceder a la biblioteca.</p>
          
          {error && <div className="mb-4 p-3 bg-red-950/50 border border-red-900 text-red-400 text-sm rounded-lg">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-purple-500"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:outline-none focus:border-purple-500"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button disabled={loading} type="submit" className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 p-3 rounded-lg font-bold transition-colors">
              {loading ? 'Verificando Hash...' : 'Desencriptar Acceso'}
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full max-w-3xl">
          <h2 className="text-3xl font-bold text-white mb-6 border-b border-slate-800 pb-4">Biblioteca Verificada</h2>
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
        </div>
      )}
    </div>
  );
}
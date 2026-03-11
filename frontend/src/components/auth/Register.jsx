import { useState } from 'react';

export default function Register({ onRegister, loading, error, onSwitch }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');
    try {
      await onRegister(name, email, password);
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-[#6E7480]">Inscription</p>
      <h3 className="mt-2 text-lg font-semibold text-white">Créer votre compte TradAI</h3>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="label">Nom</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {(localError || error) && <p className="text-sm text-red-400">{localError || error}</p>}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Création...' : 'Créer le compte'}
        </button>
      </form>
      <button onClick={onSwitch} className="mt-4 text-sm text-[#C9A96E] hover:underline">
        Déjà inscrit ? Se connecter
      </button>
    </div>
  );
}

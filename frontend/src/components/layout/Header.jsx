export default function Header({ activeDesk, setActiveDesk, user, onLogout }) {
  return (
    <header className="border-b border-white/10 bg-[#0A0C10] px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="font-serif text-3xl font-bold tracking-tight text-white">
            Trad<span className="text-[#C9A96E]">AI</span>
          </div>
          <p className="mt-1 text-sm text-[#6E7480]">Plateforme multi-IA pour traders et conseillers en investissement</p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {[
            { id: 'trading', label: '📈 Trading Desk' },
            { id: 'advisory', label: '💼 Advisory Desk' },
            { id: 'pricing', label: '💳 Plans' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDesk(tab.id)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                activeDesk === tab.id
                  ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                  : 'border-white/10 text-[#9EA4AF] hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm text-[#7A7F89]">
          <span>{user ? `${user.name} — ${user.plan?.toUpperCase()}` : 'Non connecté'}</span>
          {user && (
            <button onClick={onLogout} className="btn-secondary px-3 py-2 text-xs">
              Déconnexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

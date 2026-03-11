import Login from '../auth/Login';
import Register from '../auth/Register';
import DonutChart from '../shared/DonutChart';

export default function Sidebar({ activeDesk, setActiveDesk, user, auth, authMode, setAuthMode, subscription }) {
  const chartItems = Number.isFinite(subscription.limit)
    ? [
        { label: 'Utilisées', value: subscription.questionsToday || 0, color: '#C9A96E' },
        { label: 'Restantes', value: Math.max(subscription.limit - (subscription.questionsToday || 0), 0), color: '#1E293B' },
      ]
    : [{ label: 'Illimité', value: 1, color: '#6EC9A9' }];

  return (
    <aside className="space-y-6">
      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6E7480]">Workspace</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Cockpit TradAI</h2>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#C9A96E]">{subscription.label}</span>
        </div>

        <div className="space-y-2">
          {[
            { id: 'trading', title: 'Trading Desk', text: '3 marchés : Global, Nasdaq, Europe' },
            { id: 'advisory', title: 'Advisory Desk', text: 'ETF, fonds, portefeuilles et switches' },
            { id: 'pricing', title: 'Plans', text: 'Stripe, upgrade et gestion de l’offre' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveDesk(item.id)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                activeDesk === item.id
                  ? 'border-[#C9A96E] bg-[#C9A96E]/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <div className="font-semibold text-white">{item.title}</div>
              <div className="mt-1 text-sm text-[#7A7F89]">{item.text}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6E7480]">Consommation</p>
            <h3 className="mt-1 text-base font-semibold text-white">Questions du jour</h3>
          </div>
          <span className="text-sm text-[#C9A96E]">{subscription.remaining}</span>
        </div>
        <div className="flex items-center gap-4">
          <DonutChart items={chartItems} size={92} />
          <div className="space-y-2 text-sm text-[#9EA4AF]">
            <div>Plan actuel : <span className="font-semibold text-white">{subscription.plan}</span></div>
            <div>Utilisées : <span className="font-semibold text-white">{subscription.questionsToday}</span></div>
            <div>Restantes : <span className="font-semibold text-white">{subscription.remaining}</span></div>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        {user ? (
          <div className="space-y-3 text-sm text-[#9EA4AF]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6E7480]">Compte</p>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="font-semibold text-white">{user.name}</div>
              <div className="mt-1 text-xs text-[#7A7F89]">{user.email}</div>
            </div>
            <p>Connecté. Utilise les desks pour lancer des analyses live avec web search.</p>
          </div>
        ) : authMode === 'login' ? (
          <Login onLogin={auth.login} loading={auth.loading} error={auth.error} onSwitch={() => setAuthMode('register')} />
        ) : (
          <Register onRegister={auth.register} loading={auth.loading} error={auth.error} onSwitch={() => setAuthMode('login')} />
        )}
      </section>
    </aside>
  );
}

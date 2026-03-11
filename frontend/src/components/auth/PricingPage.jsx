import { api } from '../../utils/api';

const PLANS = [
  {
    id: 'free', name: 'Free', price: '€0', period: '',
    color: '#555',
    features: ['5 questions/jour', 'Trading Desk (lecture)', 'Publicités partenaires'],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'trader', name: 'Trader', price: '€24', period: '/mois',
    color: '#C9A96E',
    features: ['Questions illimitées', '3 marchés Trading Desk', 'Web search temps réel', 'Sans publicité'],
    cta: 'Devenir Trader',
    highlighted: true,
  },
  {
    id: 'advisor', name: 'Advisor', price: '€59', period: '/mois',
    color: '#6EC9A9',
    features: ['Tout Trader inclus', 'Advisory Desk complet', 'Analyse ETF & Fonds', 'Switch Optimizer', 'Angle fiscal belge'],
    cta: 'Devenir Advisor',
  },
  {
    id: 'team', name: 'Team', price: '€199', period: '/mois',
    color: '#6EA9C9',
    features: ['Tout Advisor inclus', 'Jusqu\'à 10 utilisateurs', 'White label possible', 'Support prioritaire'],
    cta: 'Contacter l\'équipe',
  },
];

export default function PricingPage({ token }) {
  const handleSubscribe = async (planId) => {
    if (planId === 'free' || !token) return;
    const { url } = await api.checkout(planId, token);
    if (url) window.location.href = url;
  };

  return (
    <div className="space-y-6">
      <section className="panel p-8 text-center">
        <h1 className="font-serif text-4xl font-bold text-white">Choisissez votre plan</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#727987]">
          Passez au niveau supérieur de l’analyse financière multi-IA avec Trading Desk, Advisory Desk, web search temps réel et flux de travail Stripe.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <div key={plan.id} className="panel relative p-6" style={{ borderColor: plan.highlighted ? `${plan.color}` : undefined }}>
            {plan.highlighted && (
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1 text-xs font-bold text-black" style={{ background: plan.color }}>
                POPULAIRE
              </div>
            )}
            <div className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: plan.color }}>{plan.name}</div>
            <div className="mt-4 text-4xl font-bold text-white">
              {plan.price}<span className="text-base font-normal text-[#6E7480]">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-3 text-sm text-[#A1A7B2]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2"><span style={{ color: plan.color }}>✓</span><span>{feature}</span></li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              className="mt-8 w-full rounded-xl border px-4 py-3 text-sm font-semibold transition"
              style={{ borderColor: plan.color, color: plan.highlighted ? '#000' : plan.color, background: plan.highlighted ? plan.color : 'transparent' }}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

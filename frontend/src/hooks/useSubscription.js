export function useSubscription(user) {
  const plan = user?.plan || 'free';
  const questionsToday = user?.questions_today || 0;

  const limits = {
    free: 5,
    trader: Infinity,
    advisor: Infinity,
    team: Infinity,
  };

  const limit = limits[plan] ?? 5;
  const remaining = Number.isFinite(limit) ? Math.max(limit - questionsToday, 0) : '∞';

  return {
    plan,
    questionsToday,
    limit,
    remaining,
    isPaid: plan !== 'free',
    label: plan.toUpperCase(),
  };
}

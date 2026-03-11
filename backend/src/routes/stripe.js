import express from 'express';
import Stripe from 'stripe';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const router = express.Router();

const PLANS = {
  trader: process.env.STRIPE_TRADER_PRICE_ID,
  advisor: process.env.STRIPE_ADVISOR_PRICE_ID,
  team: process.env.STRIPE_TEAM_PRICE_ID,
};

router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    const priceId = PLANS[plan];

    if (!priceId) {
      return res.status(400).json({ error: 'Plan invalide' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      await pool.query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, req.userId]);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { plan },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('[stripe/checkout] Error:', error.message);
    return res.status(500).json({ error: 'Erreur Stripe' });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const plan = session.metadata?.plan || 'trader';
    await pool.query(
      'UPDATE users SET plan = $1, stripe_subscription_id = $2 WHERE stripe_customer_id = $3',
      [plan, session.subscription, session.customer]
    );
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    await pool.query('UPDATE users SET plan = $1 WHERE stripe_customer_id = $2', ['free', subscription.customer]);
  }

  return res.json({ received: true });
});

router.post('/portal', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.userId]);
    const customerId = userResult.rows[0]?.stripe_customer_id;

    if (!customerId) {
      return res.status(400).json({ error: 'Pas de compte Stripe' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('[stripe/portal] Error:', error.message);
    return res.status(500).json({ error: 'Erreur Stripe' });
  }
});

export default router;

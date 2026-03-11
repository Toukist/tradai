import { useState } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import TradingDesk from './components/trading/TradingDesk';
import AdvisoryDesk from './components/advisory/AdvisoryDesk';
import PricingPage from './components/auth/PricingPage';
import AffiliateBar from './components/shared/AffiliateBar';
import { useAuth } from './hooks/useAuth';
import { useSubscription } from './hooks/useSubscription';

export default function App() {
  const [activeDesk, setActiveDesk] = useState('trading');
  const [authMode, setAuthMode] = useState('login');
  const auth = useAuth();
  const subscription = useSubscription(auth.user);

  return (
    <div className="min-h-screen bg-[#080A0E] text-[#E0DDD6]">
      <Header activeDesk={activeDesk} setActiveDesk={setActiveDesk} user={auth.user} onLogout={auth.logout} />
      {auth.user?.plan === 'free' && <AffiliateBar />}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        <Sidebar
          activeDesk={activeDesk}
          setActiveDesk={setActiveDesk}
          user={auth.user}
          auth={auth}
          authMode={authMode}
          setAuthMode={setAuthMode}
          subscription={subscription}
        />

        <main className="space-y-6">
          {activeDesk === 'trading' && <TradingDesk user={auth.user} token={auth.token} />}
          {activeDesk === 'advisory' && <AdvisoryDesk user={auth.user} token={auth.token} />}
          {activeDesk === 'pricing' && <PricingPage user={auth.user} token={auth.token} />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

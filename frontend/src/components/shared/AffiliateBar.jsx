const AFFILIATES = [
  { name: 'eToro', logo: '📊', text: 'Trading 0% commission', url: 'https://etoro.com', color: '#00C853' },
  { name: 'Saxo Bank', logo: '🏦', text: 'Plateforme pro Belgique', url: 'https://home.saxo', color: '#0066CC' },
  { name: 'Bolero', logo: '🔵', text: 'Courtier KBC Belgique', url: 'https://bolero.be', color: '#009BE0' },
];

export default function AffiliateBar() {
  return (
    <div className="border-b border-white/10 bg-[#0A0C10] px-6 py-3">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 lg:justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#444B56]">Partenaires</span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {AFFILIATES.map((affiliate) => (
            <a
              key={affiliate.name}
              href={affiliate.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-white/80 transition hover:bg-white/[0.04]"
            >
              <span>{affiliate.logo}</span>
              <span style={{ color: affiliate.color }}>{affiliate.name}</span>
              <span className="text-xs text-[#5E6470]">{affiliate.text}</span>
            </a>
          ))}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#30353F]">Liens sponsorisés</span>
      </div>
    </div>
  );
}

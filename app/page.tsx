import Link from "next/link";

export default function HomePage() {
  return (
    <div className="py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="text-sm text-gray-400 uppercase tracking-wider">Portfolio Opdracht</span>
          </div>
          <h1 className="text-5xl font-bold text-orange-500 mb-4">
            Digitale Facturering
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Facturatie applicatie voor IT freelancers. Maak facturen, beheer klanten en genereer PDF's.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/invoices/new"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Nieuwe factuur
            </Link>
            <Link
              href="/invoices"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors border border-gray-600"
            >
              Facturen overzicht
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-800">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Facturen Maken</h3>
            <p className="text-gray-300">
              Creëer facturen met klantgegevens, items en automatische BTW berekening.
            </p>
          </div>

          <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-800">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Klantbeheer</h3>
            <p className="text-gray-300">
              Klantgegevens worden opgeslagen en kunnen hergebruikt worden voor nieuwe facturen.
            </p>
          </div>

          <div className="bg-black p-6 rounded-lg shadow-lg border border-gray-800">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Overzicht</h3>
            <p className="text-gray-300">
              Bekijk alle facturen, filter op status en download PDF's.
            </p>
          </div>
        </div>

        {/* Functionality */}
        <div className="bg-black rounded-lg shadow-lg border border-gray-800 p-8 mb-16">
          <h2 className="text-3xl font-bold text-orange-500 mb-6">
            Functionaliteiten
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-3">Facturatie</h3>
              <ul className="text-gray-300 space-y-2">
                <li>Opeenvolgende factuurnummers per jaar</li>
                <li>BTW berekening en vermelding</li>
                <li>Vervaldatums instellen</li>
                <li>PDF generatie</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">IT-specifieke Features</h3>
              <ul className="text-gray-300 space-y-2">
                <li>Pricing intelligence</li>
                <li>Automatische service detectie</li>
                <li>Marktprijs vergelijking</li>
                <li>IT-dienst beschrijvingen</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-orange-500 mb-8">
            Technologie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="text-white font-medium">Next.js 15</div>
              <div className="text-gray-400 text-sm">App Router</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="text-white font-medium">TypeScript</div>
              <div className="text-gray-400 text-sm">Type Safety</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="text-white font-medium">Prisma</div>
              <div className="text-gray-400 text-sm">SQLite</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="text-white font-medium">PDF-lib</div>
              <div className="text-gray-400 text-sm">PDF Generatie</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

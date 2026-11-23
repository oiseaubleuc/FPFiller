'use client';

import { useState, useEffect } from 'react';
import { formatEuro } from '@/lib/pricing/calculator';

interface Domain {
  id: string;
  name: string;
  icon: string;
}

interface ComparisonResult {
  domain: string;
  domainName: string;
  icon: string;
  laborCost: number;
  total: number;
  hourlyRate: number;
  effectiveHourlyRate: number;
  marketAvg?: number;
}

export default function ComparisonPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [hours, setHours] = useState<number>(40);
  const [experienceLevel, setExperienceLevel] = useState<string>('MEDIOR');
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/pricing/domains')
      .then(res => res.json())
      .then(data => {
        setDomains(data.domains);
        // Pre-select first 3 domains
        if (data.domains.length >= 3) {
          setSelectedDomains([
            data.domains[0].id,
            data.domains[1].id,
            data.domains[2].id
          ]);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedDomains.length > 0 && hours > 0) {
      compareAll();
    }
  }, [selectedDomains, hours, experienceLevel]);

  const toggleDomain = (domainId: string) => {
    if (selectedDomains.includes(domainId)) {
      setSelectedDomains(selectedDomains.filter(id => id !== domainId));
    } else {
      if (selectedDomains.length < 6) {
        setSelectedDomains([...selectedDomains, domainId]);
      }
    }
  };

  const compareAll = async () => {
    setLoading(true);
    const comparisonResults: ComparisonResult[] = [];

    for (const domainId of selectedDomains) {
      try {
        const response = await fetch('/api/pricing/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: domainId,
            serviceType: 'General Service',
            hours,
            experienceLevel,
            materialCostPct: 0,
            overheadPct: 10,
            vatPercent: 21
          })
        });

        const data = await response.json();
        if (data.success) {
          const domainData = domains.find(d => d.id === domainId);
          comparisonResults.push({
            domain: domainId,
            domainName: domainData?.name || domainId,
            icon: domainData?.icon || '📊',
            laborCost: data.result.laborCost,
            total: data.result.total,
            hourlyRate: data.result.hourlyRate,
            effectiveHourlyRate: data.result.effectiveHourlyRate,
            marketAvg: data.result.marketAvg
          });
        }
      } catch (error) {
        console.error(`Error comparing ${domainId}:`, error);
      }
    }

    // Sort by total (highest first)
    comparisonResults.sort((a, b) => b.total - a.total);
    setResults(comparisonResults);
    setLoading(false);
  };

  const getColorClass = (index: number) => {
    const colors = [
      'from-blue-900/30 to-blue-800/30 border-blue-700/50',
      'from-purple-900/30 to-purple-800/30 border-purple-700/50',
      'from-pink-900/30 to-pink-800/30 border-pink-700/50',
      'from-green-900/30 to-green-800/30 border-green-700/50',
      'from-yellow-900/30 to-yellow-800/30 border-yellow-700/50',
      'from-red-900/30 to-red-800/30 border-red-700/50'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
            Multi-Domain Vergelijker
          </h1>
          <p className="text-xl text-gray-300">
            Vergelijk prijzen tussen verschillende professionele domeinen
          </p>
        </div>

        {/* Configuration */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aantal Uren: {hours}
              </label>
              <input
                type="range"
                min="1"
                max="200"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ervaring Niveau
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['JUNIOR', 'MEDIOR', 'SENIOR', 'EXPERT'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setExperienceLevel(level)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      experienceLevel === level
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Domain Selection */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            Selecteer Domeinen (max 6)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => toggleDomain(domain.id)}
                disabled={!selectedDomains.includes(domain.id) && selectedDomains.length >= 6}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedDomains.includes(domain.id)
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 disabled:opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{domain.icon}</div>
                <div className="text-xs font-medium">
                  {domain.name.split('&')[0].trim()}
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-3">
            {selectedDomains.length} van 6 domeinen geselecteerd
          </p>
        </div>

        {/* Comparison Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Vergelijken...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            {/* Price Comparison Bar */}
            <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6">Totaalprijs Vergelijking</h2>
              <div className="space-y-4">
                {results.map((result, idx) => {
                  const maxTotal = results[0].total;
                  const percentage = (result.total / maxTotal) * 100;
                  
                  return (
                    <div key={result.domain}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{result.icon}</span>
                          <span className="text-sm font-medium text-white">
                            {result.domainName}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-purple-400">
                          {formatEuro(result.total)}
                        </span>
                      </div>
                      <div className="relative bg-gray-700 rounded-full h-6">
                        <div
                          className="absolute bg-gradient-to-r from-purple-500 to-pink-500 h-6 rounded-full flex items-center justify-end pr-3"
                          style={{ width: `${percentage}%` }}
                        >
                          {idx === 0 && (
                            <span className="text-xs font-bold text-white">Hoogste</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result, idx) => (
                <div
                  key={result.domain}
                  className={`bg-gradient-to-br ${getColorClass(idx)} rounded-xl p-6 border`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{result.icon}</span>
                    {idx === 0 && (
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                        HOOGSTE
                      </span>
                    )}
                    {idx === results.length - 1 && (
                      <span className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">
                        LAAGSTE
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-4">
                    {result.domainName}
                  </h3>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Basis Uurtarief</span>
                      <span className="font-medium text-white">
                        {formatEuro(result.hourlyRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Effectief Uurtarief</span>
                      <span className="font-medium text-white">
                        {formatEuro(result.effectiveHourlyRate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Arbeidskosten</span>
                      <span className="font-medium text-white">
                        {formatEuro(result.laborCost)}
                      </span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300 font-bold">Totaal</span>
                        <span className="font-bold text-purple-400 text-lg">
                          {formatEuro(result.total)}
                        </span>
                      </div>
                    </div>
                    {result.marketAvg && (
                      <div className="text-xs text-gray-400 pt-2">
                        Markt gemiddelde: {formatEuro(result.marketAvg)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Difference Analysis */}
            {results.length >= 2 && (
              <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Prijsverschil Analyse</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Hoogste Prijs</div>
                    <div className="text-2xl font-bold text-white">
                      {formatEuro(results[0].total)}
                    </div>
                    <div className="text-sm text-gray-400">{results[0].domainName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Laagste Prijs</div>
                    <div className="text-2xl font-bold text-white">
                      {formatEuro(results[results.length - 1].total)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {results[results.length - 1].domainName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Verschil</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {formatEuro(results[0].total - results[results.length - 1].total)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {Math.round(
                        ((results[0].total - results[results.length - 1].total) /
                          results[results.length - 1].total) *
                          100
                      )}
                      % hoger
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

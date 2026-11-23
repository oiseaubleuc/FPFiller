'use client';

import { useState, useEffect } from 'react';
import { formatEuro } from '@/lib/pricing/calculator';
import Link from 'next/link';

interface SavedSimulation {
  input: any;
  result: any;
  timestamp: string;
}

export default function HistoryPage() {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [filteredSims, setFilteredSims] = useState<SavedSimulation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'hours'>('date');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [simulations, searchQuery, sortBy]);

  const loadHistory = () => {
    try {
      const data = JSON.parse(localStorage.getItem('pricing_simulations') || '[]');
      setSimulations(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const filterAndSort = () => {
    let filtered = [...simulations];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(sim =>
        sim.input.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sim.input.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'total':
          return b.result.total - a.result.total;
        case 'hours':
          return b.input.hours - a.input.hours;
        default:
          return 0;
      }
    });

    setFilteredSims(filtered);
  };

  const clearHistory = () => {
    if (confirm('Weet je zeker dat je alle historie wilt verwijderen?')) {
      localStorage.removeItem('pricing_simulations');
      setSimulations([]);
    }
  };

  const deleteSimulation = (index: number) => {
    const updated = simulations.filter((_, i) => i !== index);
    localStorage.setItem('pricing_simulations', JSON.stringify(updated));
    setSimulations(updated);
  };

  const getDomainIcon = (domain: string) => {
    const icons: Record<string, string> = {
      'IT_SOFTWARE': '💻',
      'CONSTRUCTION': '🏗️',
      'HOSPITALITY': '🍽️',
      'CONSULTING': '💼',
      'DESIGN_CREATIVE': '🎨',
      'EDUCATION': '📚',
      'HEALTHCARE': '⚕️',
      'LEGAL': '⚖️',
      'MARKETING': '📱',
      'REAL_ESTATE': '🏠'
    };
    return icons[domain] || '📊';
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('nl-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Simulatie Historie
          </h1>
          <p className="text-gray-400">Bekijk al je eerdere prijssimulaties</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Zoek op domein of service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sorteer op Datum</option>
                <option value="total">Sorteer op Totaal</option>
                <option value="hours">Sorteer op Uren</option>
              </select>
            </div>

            {/* Clear Button */}
            <div>
              <button
                onClick={clearHistory}
                disabled={simulations.length === 0}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                Wis Historie
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            {filteredSims.length} simulatie{filteredSims.length !== 1 ? 's' : ''} gevonden
          </div>
        </div>

        {/* History List */}
        {filteredSims.length > 0 ? (
          <div className="space-y-4">
            {filteredSims.map((sim, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <span className="text-4xl">{getDomainIcon(sim.input.domain)}</span>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {sim.input.serviceType}
                        </h3>
                        <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                          {sim.input.domain.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Uren</div>
                          <div className="text-white font-medium">{sim.input.hours}u</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Ervaring</div>
                          <div className="text-white font-medium">{sim.input.experienceLevel}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Uurtarief</div>
                          <div className="text-white font-medium">
                            {formatEuro(sim.result.hourlyRate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Datum</div>
                          <div className="text-white font-medium">{formatDate(sim.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {formatEuro(sim.result.total)}
                    </div>
                    <button
                      onClick={() => deleteSimulation(simulations.indexOf(sim))}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Verwijder
                    </button>
                  </div>
                </div>

                {/* Detailed breakdown (collapsible) */}
                <details className="mt-4">
                  <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                    Toon details
                  </summary>
                  <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Arbeidskosten</div>
                      <div className="text-white">{formatEuro(sim.result.laborCost)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Materiaal</div>
                      <div className="text-white">{formatEuro(sim.result.materialCost || 0)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Overhead</div>
                      <div className="text-white">{formatEuro(sim.result.overheadCost || 0)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">BTW</div>
                      <div className="text-white">{formatEuro(sim.result.vat)}</div>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Geen historie gevonden</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Probeer een andere zoekterm' : 'Start met het maken van simulaties'}
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Nieuwe Simulatie
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

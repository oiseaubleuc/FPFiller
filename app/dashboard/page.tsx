'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SimulationStats {
  total: number;
  avgTotal: number;
  mostUsedDomain: string;
  recentSimulations: Array<{
    domain: string;
    service: string;
    total: number;
    hours: number;
    date: string;
  }>;
  domainBreakdown: Array<{
    domain: string;
    count: number;
    totalRevenue: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stats from localStorage
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      const simulations = JSON.parse(localStorage.getItem('pricing_simulations') || '[]');
      
      if (simulations.length === 0) {
        setStats({
          total: 0,
          avgTotal: 0,
          mostUsedDomain: 'N/A',
          recentSimulations: [],
          domainBreakdown: []
        });
        setLoading(false);
        return;
      }

      // Calculate statistics
      const total = simulations.length;
      const avgTotal = simulations.reduce((sum: number, s: any) => sum + s.result.total, 0) / total;
      
      // Count domains
      const domainCounts: Record<string, { count: number; revenue: number }> = {};
      simulations.forEach((s: any) => {
        if (!domainCounts[s.input.domain]) {
          domainCounts[s.input.domain] = { count: 0, revenue: 0 };
        }
        domainCounts[s.input.domain].count++;
        domainCounts[s.input.domain].revenue += s.result.total;
      });

      const mostUsedDomain = Object.entries(domainCounts)
        .sort(([,a], [,b]) => b.count - a.count)[0]?.[0] || 'N/A';

      const domainBreakdown = Object.entries(domainCounts)
        .map(([domain, data]) => ({
          domain,
          count: data.count,
          totalRevenue: data.revenue
        }))
        .sort((a, b) => b.count - a.count);

      const recentSimulations = simulations
        .slice(-5)
        .reverse()
        .map((s: any) => ({
          domain: s.input.domain,
          service: s.input.serviceType,
          total: s.result.total,
          hours: s.input.hours,
          date: s.timestamp || new Date().toISOString()
        }));

      setStats({
        total,
        avgTotal,
        mostUsedDomain,
        recentSimulations,
        domainBreakdown
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400">Overzicht van al je prijssimulaties en analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Simulations */}
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Totaal Simulaties</span>
              <span className="text-3xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.total || 0}</div>
            <div className="text-sm text-gray-400 mt-2">
              Alle tijden
            </div>
          </div>

          {/* Average Value */}
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Gemiddelde Waarde</span>
              <span className="text-3xl">💰</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(stats?.avgTotal || 0)}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Per simulatie
            </div>
          </div>

          {/* Most Used Domain */}
          <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/20 border border-orange-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Meest Gebruikt</span>
              <span className="text-3xl">{getDomainIcon(stats?.mostUsedDomain || '')}</span>
            </div>
            <div className="text-xl font-bold text-white">
              {stats?.mostUsedDomain?.replace('_', ' ') || 'N/A'}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Populairste domein
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Simulations */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Recente Simulaties</h2>
            
            {stats?.recentSimulations && stats.recentSimulations.length > 0 ? (
              <div className="space-y-4">
                {stats.recentSimulations.map((sim, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getDomainIcon(sim.domain)}</span>
                        <div>
                          <div className="font-medium text-white">{sim.service}</div>
                          <div className="text-sm text-gray-400">{sim.domain.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-500">{formatCurrency(sim.total)}</div>
                        <div className="text-sm text-gray-400">{sim.hours}u</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-400 mb-4">Nog geen simulaties</p>
                <Link
                  href="/pricing"
                  className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Start je eerste simulatie
                </Link>
              </div>
            )}
          </div>

          {/* Domain Breakdown */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Domein Overzicht</h2>
            
            {stats?.domainBreakdown && stats.domainBreakdown.length > 0 ? (
              <div className="space-y-4">
                {stats.domainBreakdown.map((domain, idx) => (
                  <div key={idx} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getDomainIcon(domain.domain)}</span>
                        <span className="font-medium text-white">
                          {domain.domain.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">{domain.count} simulaties</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-600 rounded-full h-2 mr-4">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${(domain.count / (stats.total || 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-orange-500">
                        {formatCurrency(domain.totalRevenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-gray-400">Geen data beschikbaar</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/pricing"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-4 text-center transition-all"
            >
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-white font-medium">Nieuwe Simulatie</div>
            </Link>
            <Link
              href="/pricing/compare"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-4 text-center transition-all"
            >
              <div className="text-3xl mb-2">⚖️</div>
              <div className="text-white font-medium">Vergelijk Domeinen</div>
            </Link>
            <Link
              href="/pricing/templates"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-4 text-center transition-all"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="text-white font-medium">Templates</div>
            </Link>
            <Link
              href="/pricing/history"
              className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-4 text-center transition-all"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="text-white font-medium">Historie</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

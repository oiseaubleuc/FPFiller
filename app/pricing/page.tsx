'use client';

import { useState, useEffect } from 'react';
import { formatEuro } from '@/lib/pricing/calculator';
import { downloadPDF, type PDFData } from '@/lib/pricing/pdf-generator';
import { supportedCurrencies, convertCurrency, formatCurrency } from '@/lib/pricing/currency';
import { generateRecommendations, getPricingScore, type RecommendationInput } from '@/lib/pricing/ai-recommendations';

interface Domain {
  id: string;
  name: string;
  description: string;
  icon: string;
  services: string[];
}

interface PricingResult {
  laborCost: number;
  materialCost: number;
  overheadCost: number;
  subtotal: number;
  vat: number;
  total: number;
  marketMin?: number;
  marketMax?: number;
  marketAvg?: number;
  hourlyRate: number;
  effectiveHourlyRate: number;
}

export default function PricingSimulatorPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [hours, setHours] = useState<number>(40);
  const [experienceLevel, setExperienceLevel] = useState<string>('MEDIOR');
  const [materialCostPct, setMaterialCostPct] = useState<number>(0);
  const [overheadPct, setOverheadPct] = useState<number>(10);
  const [vatPercent, setVatPercent] = useState<number>(21);
  
  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('EUR');

  // Fetch domains on mount
  useEffect(() => {
    fetch('/api/pricing/domains')
      .then(res => res.json())
      .then(data => {
        setDomains(data.domains);
        
        // Check for template from localStorage
        const templateStr = localStorage.getItem('pricing_template');
        if (templateStr) {
          try {
            const template = JSON.parse(templateStr);
            setSelectedDomain(template.domain);
            setServiceType(template.serviceType);
            setHours(template.hours);
            setExperienceLevel(template.experienceLevel);
            setMaterialCostPct(template.materialCostPct);
            setOverheadPct(template.overheadPct);
            setVatPercent(template.vatPercent);
            // Clear template from storage
            localStorage.removeItem('pricing_template');
          } catch (error) {
            console.error('Error loading template:', error);
          }
        } else if (data.domains.length > 0) {
          setSelectedDomain(data.domains[0].id);
          setServiceType(data.domains[0].services[0]);
        }
      })
      .catch(err => console.error('Error loading domains:', err));
  }, []);

  // Auto-calculate on input change
  useEffect(() => {
    if (selectedDomain && serviceType && hours > 0) {
      calculatePrice();
    }
  }, [selectedDomain, serviceType, hours, experienceLevel, materialCostPct, overheadPct, vatPercent]);

  const calculatePrice = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/pricing/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: selectedDomain,
          serviceType,
          hours,
          experienceLevel,
          materialCostPct,
          overheadPct,
          vatPercent
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fout bij berekening');
      }

      setResult(data.result);
      
      // Save to localStorage for dashboard
      saveSimulation(data.input, data.result);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const saveSimulation = (input: any, result: any) => {
    try {
      const simulations = JSON.parse(localStorage.getItem('pricing_simulations') || '[]');
      simulations.push({
        input,
        result,
        timestamp: new Date().toISOString()
      });
      // Keep only last 100 simulations
      if (simulations.length > 100) {
        simulations.shift();
      }
      localStorage.setItem('pricing_simulations', JSON.stringify(simulations));
    } catch (error) {
      console.error('Error saving simulation:', error);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    
    const pdfData: PDFData = {
      domain: selectedDomain,
      serviceType,
      hours,
      experienceLevel,
      result,
      timestamp: new Date().toISOString()
    };
    
    const filename = `pricing-${selectedDomain}-${Date.now()}.html`;
    downloadPDF(pdfData, filename);
  };

  const selectedDomainData = domains.find(d => d.id === selectedDomain);

  const getMarketComparison = () => {
    if (!result) return 'neutral';
    
    if (result.marketAvg && result.total < result.marketAvg * 0.9) {
      return 'below';
    } else if (result.marketAvg && result.total > result.marketAvg * 1.1) {
      return 'above';
    }
    return 'competitive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
            Multi-Domain Pricing Simulator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Bereken en vergelijk prijzen voor verschillende professionele domeinen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Domain Selection */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">1. Selecteer Domein</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {domains.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => {
                      setSelectedDomain(domain.id);
                      setServiceType(domain.services[0]);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDomain === domain.id
                        ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-3xl mb-2">{domain.icon}</div>
                    <div className="text-sm font-medium">{domain.name.split('&')[0].trim()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Type & Parameters */}
            {selectedDomainData && (
              <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">2. Configureer Service</h2>
                
                <div className="space-y-4">
                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Service Type
                    </label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {selectedDomainData.services.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1u</span>
                      <span>200u</span>
                    </div>
                  </div>

                  {/* Experience Level */}
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
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Materiaalkosten: {materialCostPct}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={materialCostPct}
                      onChange={(e) => setMaterialCostPct(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Overhead */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Overhead: {overheadPct}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={overheadPct}
                      onChange={(e) => setOverheadPct(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* VAT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      BTW: {vatPercent}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="21"
                      step="1"
                      value={vatPercent}
                      onChange={(e) => setVatPercent(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valuta
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {supportedCurrencies.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.flag} {curr.name} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Price Breakdown */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-2xl border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6">Prijsberekening</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-300">
                      <span>Arbeidskosten</span>
                      <span className="font-medium">
                        {selectedCurrency === 'EUR' 
                          ? formatEuro(result.laborCost)
                          : formatCurrency(convertCurrency(result.laborCost, selectedCurrency), selectedCurrency)
                        }
                      </span>
                    </div>
                    
                    {result.materialCost > 0 && (
                      <div className="flex justify-between text-gray-300">
                        <span>Materiaalkosten</span>
                        <span className="font-medium">{formatEuro(result.materialCost)}</span>
                      </div>
                    )}
                    
                    {result.overheadCost > 0 && (
                      <div className="flex justify-between text-gray-300">
                        <span>Overhead</span>
                        <span className="font-medium">{formatEuro(result.overheadCost)}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between text-gray-300">
                        <span>Subtotaal</span>
                        <span className="font-medium">{formatEuro(result.subtotal)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-gray-300">
                      <span>BTW ({vatPercent}%)</span>
                      <span className="font-medium">{formatEuro(result.vat)}</span>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between text-2xl font-bold text-orange-500">
                        <span>Totaal</span>
                        <span>
                          {selectedCurrency === 'EUR'
                            ? formatEuro(result.total)
                            : formatCurrency(convertCurrency(result.total, selectedCurrency), selectedCurrency)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hourly Rates */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Uurtarieven</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Basis uurtarief</span>
                      <span className="font-medium">{formatEuro(result.hourlyRate)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Effectief uurtarief</span>
                      <span className="font-medium text-orange-500">{formatEuro(result.effectiveHourlyRate)}</span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                {result && (
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/50 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                      <span>🤖</span>
                      <span>AI Aanbevelingen</span>
                    </h3>
                    {(() => {
                      const recInput: RecommendationInput = {
                        domain: selectedDomain,
                        hours,
                        experienceLevel,
                        total: result.total,
                        marketAvg: result.marketAvg,
                        hourlyRate: result.hourlyRate
                      };
                      const recommendations = generateRecommendations(recInput);
                      const score = getPricingScore(recInput);
                      
                      return (
                        <>
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-300">Pricing Score</span>
                              <span className="text-lg font-bold text-purple-400">{score}/100</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {recommendations.slice(0, 3).map((rec, idx) => (
                              <div key={idx} className="text-xs bg-gray-800/50 rounded p-2">
                                <div className="font-medium text-white mb-1">
                                  {rec.icon} {rec.title}
                                </div>
                                <div className="text-gray-400">{rec.message}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Market Comparison */}
                {result && result.marketAvg && (
                  <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Markt Vergelijking</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Markt Min</span>
                        <span>{formatEuro(result.marketMin || 0)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Markt Gem</span>
                        <span className="font-medium">{formatEuro(result.marketAvg)}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Markt Max</span>
                        <span>{formatEuro(result.marketMax || 0)}</span>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-700">
                        <button
                          onClick={() => downloadReport()}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                          <span>📄</span>
                          <span>Download PDF</span>
                        </button>
                      </div>
                      
                      <div className="pt-1">
                        {getMarketComparison() === 'below' && (
                          <div className="text-yellow-500 text-xs">
                            ⚠️ Onder marktgemiddelde - Overweeg hogere prijzen
                          </div>
                        )}
                        {getMarketComparison() === 'competitive' && (
                          <div className="text-green-500 text-xs">
                            ✓ Competitief geprijsd binnen marktrange
                          </div>
                        )}
                        {getMarketComparison() === 'above' && (
                          <div className="text-orange-500 text-xs">
                            📈 Boven marktgemiddelde - Zorg voor goede waardepropositie
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-xl p-4 text-red-400">
                {error}
              </div>
            )}

            {loading && (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-400 mt-2">Berekenen...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

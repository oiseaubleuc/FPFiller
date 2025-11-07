"use client";
import { useState, useEffect } from "react";
import { analyzePricing, getMarketInsights, calculateRevenueImpact, PricingAnalysis } from "@/lib/pricing-intelligence";

interface PricingIntelligenceProps {
    service: string;
    currentRate: number;
    onRecommendation: (rate: number) => void;
}

export default function PricingIntelligence({ service, currentRate, onRecommendation }: PricingIntelligenceProps) {
    const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showDataSources, setShowDataSources] = useState(false);
    const [marketInsights, setMarketInsights] = useState<any>(null);

    useEffect(() => {
        if (service && currentRate > 0) {
            analyzePricingData();
        }
    }, [service, currentRate]);

    const analyzePricingData = async () => {
        setLoading(true);
        try {
            const pricingAnalysis = await analyzePricing(service, currentRate);
            setAnalysis(pricingAnalysis);

            const insights = await getMarketInsights(service);
            setMarketInsights(insights);
        } catch (error) {
            console.error('Pricing analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApplyRecommendation = () => {
        if (analysis) {
            onRecommendation(analysis.recommendation);
        }
    };

    if (!analysis) {
        return (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm font-bold">€</span>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Pricing Intelligence</h3>
                            <p className="text-gray-400 text-sm">Analyseer je tarief voor betere winstgevendheid</p>
                        </div>
                    </div>
                    {loading && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    )}
                </div>
            </div>
        );
    }

    const getPositionColor = (position: string) => {
        switch (position) {
            case 'below': return 'text-red-400';
            case 'above': return 'text-green-400';
            default: return 'text-yellow-400';
        }
    };

    const getPositionText = (position: string) => {
        switch (position) {
            case 'below': return 'Onder marktprijs';
            case 'above': return 'Boven marktprijs';
            default: return 'Marktconform';
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-white text-lg font-bold">€</span>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">Pricing Intelligence</h3>
                        <p className="text-gray-400 text-sm">Tarief analyse</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-orange-500 hover:text-orange-400 text-sm font-medium"
                >
                    {showDetails ? 'Verberg details' : 'Toon details'}
                </button>
            </div>

            {/* Quick Analysis */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Jouw tarief</div>
                    <div className="text-white font-bold text-xl">€{currentRate}/uur</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Marktprijs</div>
                    <div className="text-white font-bold text-xl">€{analysis.marketRate}/uur</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Aanbeveling</div>
                    <div className="text-orange-400 font-bold text-xl">€{analysis.recommendation}/uur</div>
                </div>
            </div>

            {/* Market Position */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Marktpositie</span>
                    <span className={`font-bold ${getPositionColor(analysis.marketPosition)}`}>
                        {getPositionText(analysis.marketPosition)}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (currentRate / analysis.marketRate) * 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="text-white font-semibold mb-2">Advies</div>
                <p className="text-gray-300 text-sm mb-3">{analysis.reasoning}</p>

                {analysis.potentialIncrease > 0 && (
                    <div className="text-green-400 text-sm font-bold">
                        Potentiële verhoging: +€{analysis.potentialIncrease}/uur
                    </div>
                )}
            </div>

            {/* Action Button */}
            {analysis.recommendation !== currentRate && (
                <button
                    onClick={handleApplyRecommendation}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-bold transition-colors mb-4"
                >
                    Pas aanbeveling toe (€{analysis.recommendation}/uur)
                </button>
            )}

            {/* Detailed Insights */}
            {showDetails && marketInsights && (
                <div className="space-y-4">
                    <div className="border-t border-gray-700 pt-4">
                        <h4 className="text-white font-semibold mb-3">Markttrends</h4>
                        <div className="space-y-2">
                            {marketInsights.trends.map((trend: string, index: number) => (
                                <div key={index} className="text-gray-300 text-sm">• {trend}</div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-3">Kansen</h4>
                        <div className="space-y-2">
                            {marketInsights.opportunities.map((opportunity: string, index: number) => (
                                <div key={index} className="text-green-300 text-sm">• {opportunity}</div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-3">Waarschuwingen</h4>
                        <div className="space-y-2">
                            {marketInsights.warnings.map((warning: string, index: number) => (
                                <div key={index} className="text-yellow-300 text-sm">• {warning}</div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Data Sources */}
            {analysis.dataSources && analysis.dataSources.length > 0 && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-semibold text-sm">Data Bronnen</h4>
                        <button
                            onClick={() => setShowDataSources(!showDataSources)}
                            className="text-orange-500 hover:text-orange-400 text-xs font-medium"
                        >
                            {showDataSources ? 'Verberg alle bronnen' : 'Toon alle mogelijke bronnen'}
                        </button>
                    </div>
                    <div className="space-y-2">
                        {analysis.dataSources.map((source, index) => (
                            <div key={index} className="bg-gray-800 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="text-white font-medium text-sm">
                                                {source.name}
                                            </div>
                                            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">
                                                Actief
                                            </span>
                                        </div>
                                        <div className="text-gray-400 text-xs mb-2">
                                            {source.description}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="px-2 py-1 bg-gray-700 rounded">
                                                {source.type === 'internal' ? 'Intern' : 
                                                 source.type === 'external' ? 'Extern' : 
                                                 source.type === 'api' ? 'API' : 'Aggregated'}
                                            </span>
                                            {source.sampleSize && (
                                                <span>Sample: {source.sampleSize.toLocaleString()} punten</span>
                                            )}
                                            {source.lastUpdated && (
                                                <span>Updated: {new Date(source.lastUpdated).toLocaleDateString('nl-BE')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* All Possible Data Sources */}
                    {showDataSources && (
                        <div className="mt-4 border-t border-gray-700 pt-4">
                            <h5 className="text-white font-semibold text-xs mb-3">Alle Mogelijke Data Bronnen (Toekomstig)</h5>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <div className="text-orange-400 font-medium text-xs mb-2">API Bronnen (Gepland)</div>
                                    <div className="text-gray-300 text-xs space-y-1">
                                        <div>• Indeed API - Salary ranges (Gratis)</div>
                                        <div>• Reddit API - Community data (Gratis)</div>
                                        <div>• Upwork API - Freelancer rates (Betaald)</div>
                                        <div>• Glassdoor API - Salary insights (Betaald)</div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <div className="text-blue-400 font-medium text-xs mb-2">Aggregated Services (Toekomstig)</div>
                                    <div className="text-gray-300 text-xs space-y-1">
                                        <div>• RapidAPI Marketplace - Multi-source data</div>
                                        <div>• Web Scraping Services - Job board data</div>
                                    </div>
                                </div>
                                <div className="bg-gray-800 rounded-lg p-3">
                                    <div className="text-purple-400 font-medium text-xs mb-2">Open Data (Toekomstig)</div>
                                    <div className="text-gray-300 text-xs space-y-1">
                                        <div>• Eurostat API - Economische data (Gratis)</div>
                                        <div>• data.gov.be - Belgische open data (Gratis)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-500 italic">
                        Momenteel gebruikt het systeem interne hardcoded data. Externe API integratie is gepland voor toekomstige updates.
                    </div>
                </div>
            )}

            {/* Confidence Score */}
            <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
                <span>Vertrouwen: {Math.round(analysis.confidence * 100)}%</span>
                <span>Gebaseerd op {service} marktdata</span>
            </div>
        </div>
    );
}



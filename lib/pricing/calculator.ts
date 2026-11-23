/**
 * Multi-Domain Pricing Calculator
 * Berekent prijzen voor verschillende domeinen met marktdata
 */

export interface PricingInput {
  domain: string;
  serviceType: string;
  hours?: number;
  quantity?: number;
  experienceLevel?: 'JUNIOR' | 'MEDIOR' | 'SENIOR' | 'EXPERT';
  materialCostPct?: number;
  overheadPct?: number;
  vatPercent?: number;
}

export interface PricingResult {
  laborCost: number;
  materialCost: number;
  overheadCost: number;
  subtotal: number;
  vat: number;
  total: number;
  
  // Market comparison
  marketMin?: number;
  marketMax?: number;
  marketAvg?: number;
  
  // Breakdown
  hourlyRate: number;
  effectiveHourlyRate: number;
}

/**
 * Bereken basis uurtarief op basis van ervaring
 */
function getBaseHourlyRate(domain: string, experienceLevel: string): number {
  const rates: Record<string, Record<string, number>> = {
    'IT_SOFTWARE': {
      'JUNIOR': 45,
      'MEDIOR': 75,
      'SENIOR': 105,
      'EXPERT': 150
    },
    'CONSTRUCTION': {
      'JUNIOR': 35,
      'MEDIOR': 55,
      'SENIOR': 75,
      'EXPERT': 95
    },
    'HOSPITALITY': {
      'JUNIOR': 15,
      'MEDIOR': 25,
      'SENIOR': 40,
      'EXPERT': 60
    },
    'CONSULTING': {
      'JUNIOR': 60,
      'MEDIOR': 95,
      'SENIOR': 140,
      'EXPERT': 200
    },
    'DESIGN_CREATIVE': {
      'JUNIOR': 40,
      'MEDIOR': 65,
      'SENIOR': 90,
      'EXPERT': 125
    },
    'EDUCATION': {
      'JUNIOR': 30,
      'MEDIOR': 50,
      'SENIOR': 70,
      'EXPERT': 95
    },
    'HEALTHCARE': {
      'JUNIOR': 50,
      'MEDIOR': 80,
      'SENIOR': 110,
      'EXPERT': 150
    },
    'LEGAL': {
      'JUNIOR': 80,
      'MEDIOR': 120,
      'SENIOR': 180,
      'EXPERT': 250
    },
    'MARKETING': {
      'JUNIOR': 45,
      'MEDIOR': 70,
      'SENIOR': 100,
      'EXPERT': 140
    },
    'REAL_ESTATE': {
      'JUNIOR': 40,
      'MEDIOR': 65,
      'SENIOR': 90,
      'EXPERT': 120
    }
  };
  
  return rates[domain]?.[experienceLevel] || 50;
}

/**
 * Bereken markt prijzen (min/max/avg)
 */
function getMarketRates(domain: string, experienceLevel: string): {
  min: number;
  max: number;
  avg: number;
} {
  const baseRate = getBaseHourlyRate(domain, experienceLevel);
  
  return {
    min: Math.round(baseRate * 0.75),
    max: Math.round(baseRate * 1.4),
    avg: baseRate
  };
}

/**
 * Hoofdcalculator functie
 */
export function calculatePrice(input: PricingInput): PricingResult {
  const {
    domain,
    hours = 0,
    experienceLevel = 'MEDIOR',
    materialCostPct = 0,
    overheadPct = 10,
    vatPercent = 21
  } = input;
  
  // 1. Bereken basis arbeidskosten
  const hourlyRate = getBaseHourlyRate(domain, experienceLevel);
  const laborCost = hourlyRate * hours;
  
  // 2. Bereken materiaalkosten
  const materialCost = (laborCost * materialCostPct) / 100;
  
  // 3. Bereken overhead
  const overheadCost = ((laborCost + materialCost) * overheadPct) / 100;
  
  // 4. Bereken subtotaal
  const subtotal = laborCost + materialCost + overheadCost;
  
  // 5. Bereken BTW
  const vat = (subtotal * vatPercent) / 100;
  
  // 6. Bereken totaal
  const total = subtotal + vat;
  
  // 7. Markt vergelijking
  const marketRates = getMarketRates(domain, experienceLevel);
  const marketMin = (marketRates.min * hours) + materialCost + overheadCost;
  const marketMax = (marketRates.max * hours) + materialCost + overheadCost;
  const marketAvg = (marketRates.avg * hours) + materialCost + overheadCost;
  
  // 8. Effectief uurtarief (inclusief alle kosten)
  const effectiveHourlyRate = hours > 0 ? total / hours : hourlyRate;
  
  return {
    laborCost: Math.round(laborCost * 100) / 100,
    materialCost: Math.round(materialCost * 100) / 100,
    overheadCost: Math.round(overheadCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100,
    
    marketMin: Math.round(marketMin * 100) / 100,
    marketMax: Math.round(marketMax * 100) / 100,
    marketAvg: Math.round(marketAvg * 100) / 100,
    
    hourlyRate,
    effectiveHourlyRate: Math.round(effectiveHourlyRate * 100) / 100
  };
}

/**
 * Format bedrag naar EUR
 */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('nl-BE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

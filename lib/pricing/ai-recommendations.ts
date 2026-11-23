/**
 * AI-Powered Pricing Recommendations
 * Smart suggestions based on domain, experience, and market data
 */

export interface PricingRecommendation {
  type: 'increase' | 'decrease' | 'optimal' | 'warning';
  title: string;
  message: string;
  suggestedValue?: number;
  icon: string;
}

export interface RecommendationInput {
  domain: string;
  hours: number;
  experienceLevel: string;
  total: number;
  marketAvg?: number;
  hourlyRate: number;
}

/**
 * Generate AI-powered pricing recommendations
 */
export function generateRecommendations(input: RecommendationInput): PricingRecommendation[] {
  const recommendations: PricingRecommendation[] = [];

  // 1. Market comparison recommendation
  if (input.marketAvg) {
    const difference = ((input.total - input.marketAvg) / input.marketAvg) * 100;
    
    if (difference < -15) {
      recommendations.push({
        type: 'increase',
        title: 'Prijs onder marktgemiddelde',
        message: `Je prijs ligt ${Math.abs(Math.round(difference))}% onder het marktgemiddelde. Overweeg een hogere prijs voor deze ${input.experienceLevel} dienst.`,
        suggestedValue: input.marketAvg,
        icon: '💰'
      });
    } else if (difference > 25) {
      recommendations.push({
        type: 'warning',
        title: 'Prijs boven marktgemiddelde',
        message: `Je prijs ligt ${Math.round(difference)}% boven het marktgemiddelde. Zorg voor een sterke waardepropositie.`,
        icon: '⚠️'
      });
    } else {
      recommendations.push({
        type: 'optimal',
        title: 'Competitief geprijsd',
        message: `Je prijs ligt binnen ${Math.abs(Math.round(difference))}% van het marktgemiddelde. Dit is een goede balans.`,
        icon: '✅'
      });
    }
  }

  // 2. Experience level recommendation
  if (input.experienceLevel === 'JUNIOR' && input.hours > 100) {
    recommendations.push({
      type: 'warning',
      title: 'Grote project scope',
      message: `Als JUNIOR professional vraag je ${input.hours} uren aan. Overweeg een MEDIOR collega voor complexe delen.`,
      icon: '👨‍🎓'
    });
  }

  if (input.experienceLevel === 'EXPERT' && input.hours < 20) {
    recommendations.push({
      type: 'optimal',
      title: 'Efficiënte expert inzet',
      message: `Als EXPERT voor ${input.hours} uren is dit een efficiënte korte consultancy. Perfecte inzet van senior kennis.`,
      icon: '🎯'
    });
  }

  // 3. Domain-specific recommendations
  const domainAdvice = getDomainSpecificAdvice(input.domain, input.hours, input.total);
  if (domainAdvice) {
    recommendations.push(domainAdvice);
  }

  // 4. Project size recommendation
  if (input.hours > 160) {
    recommendations.push({
      type: 'optimal',
      title: 'Groot project',
      message: `Met ${input.hours} uren is dit een substantieel project. Overweeg milestone-gebaseerde betalingen.`,
      icon: '📋'
    });
  }

  // 5. Hourly rate optimization
  if (input.hourlyRate < 40 && input.experienceLevel !== 'JUNIOR') {
    recommendations.push({
      type: 'increase',
      title: 'Uurtarief optimalisatie',
      message: `Je uurtarief van €${input.hourlyRate}/u is relatief laag voor ${input.experienceLevel}. Overweeg een verhoging.`,
      suggestedValue: getRecommendedRate(input.domain, input.experienceLevel),
      icon: '📈'
    });
  }

  return recommendations;
}

function getDomainSpecificAdvice(
  domain: string,
  hours: number,
  total: number
): PricingRecommendation | null {
  switch (domain) {
    case 'IT_SOFTWARE':
      if (hours > 80 && total > 10000) {
        return {
          type: 'optimal',
          title: 'Software Development Best Practice',
          message: 'Voor dit project: overweeg Agile sprints en iteratieve delivery voor betere risico-spreiding.',
          icon: '💻'
        };
      }
      break;
    
    case 'CONSTRUCTION':
      if (total > 15000) {
        return {
          type: 'optimal',
          title: 'Bouw Advies',
          message: 'Voor dit bedrag: zorg voor gedetailleerde offerte met materiaalspecificaties en planning.',
          icon: '🏗️'
        };
      }
      break;
    
    case 'CONSULTING':
      if (hours < 40) {
        return {
          type: 'optimal',
          title: 'Consultancy Model',
          message: 'Voor korte consultancy: overweeg een retainer of advisory fee ipv uurtarief.',
          icon: '💼'
        };
      }
      break;
    
    case 'DESIGN_CREATIVE':
      if (total > 5000) {
        return {
          type: 'optimal',
          title: 'Creative Project',
          message: 'Voor deze scope: werk met design reviews en milestone approvals voor betere alignment.',
          icon: '🎨'
        };
      }
      break;
  }
  
  return null;
}

function getRecommendedRate(domain: string, level: string): number {
  const rates: Record<string, Record<string, number>> = {
    'IT_SOFTWARE': { 'MEDIOR': 75, 'SENIOR': 105, 'EXPERT': 150 },
    'CONSULTING': { 'MEDIOR': 95, 'SENIOR': 140, 'EXPERT': 200 },
    'DESIGN_CREATIVE': { 'MEDIOR': 65, 'SENIOR': 90, 'EXPERT': 125 },
  };
  
  return rates[domain]?.[level] || 70;
}

/**
 * Get a summary score (0-100) for the pricing
 */
export function getPricingScore(input: RecommendationInput): number {
  let score = 50; // Base score

  // Market alignment (30 points)
  if (input.marketAvg) {
    const difference = Math.abs((input.total - input.marketAvg) / input.marketAvg);
    if (difference < 0.1) score += 30;
    else if (difference < 0.2) score += 20;
    else if (difference < 0.3) score += 10;
  }

  // Experience appropriate (20 points)
  const minRate = { JUNIOR: 30, MEDIOR: 60, SENIOR: 90, EXPERT: 130 }[input.experienceLevel] || 50;
  if (input.hourlyRate >= minRate) score += 20;
  else score += 10;

  // Project scope appropriateness (20 points)
  if (input.hours >= 20 && input.hours <= 160) score += 20;
  else if (input.hours < 20 || input.hours > 200) score += 10;
  else score += 15;

  // Value threshold (10 points)
  if (input.total > 1000) score += 10;

  return Math.min(100, Math.max(0, score));
}

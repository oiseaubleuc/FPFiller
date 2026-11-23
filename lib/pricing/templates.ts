/**
 * Pre-configured project templates voor veelvoorkomende scenarios
 */

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  serviceType: string;
  hours: number;
  experienceLevel: 'JUNIOR' | 'MEDIOR' | 'SENIOR' | 'EXPERT';
  materialCostPct: number;
  overheadPct: number;
  vatPercent: number;
  icon: string;
  category: string;
  estimatedValue: string;
}

export const projectTemplates: ProjectTemplate[] = [
  // IT & Software
  {
    id: 'web-mvp',
    name: 'MVP Website',
    description: 'Minimaal viable product - Landing page met basis functionaliteit',
    domain: 'IT_SOFTWARE',
    serviceType: 'Full Stack Development',
    hours: 80,
    experienceLevel: 'MEDIOR',
    materialCostPct: 5,
    overheadPct: 10,
    vatPercent: 21,
    icon: '🌐',
    category: 'Website',
    estimatedValue: '€6.000 - €8.000'
  },
  {
    id: 'mobile-app',
    name: 'Mobile App (iOS/Android)',
    description: 'Cross-platform mobile applicatie met basis features',
    domain: 'IT_SOFTWARE',
    serviceType: 'Mobile Development',
    hours: 160,
    experienceLevel: 'SENIOR',
    materialCostPct: 10,
    overheadPct: 15,
    vatPercent: 21,
    icon: '📱',
    category: 'Mobile',
    estimatedValue: '€18.000 - €25.000'
  },
  {
    id: 'api-backend',
    name: 'REST API Backend',
    description: 'Complete backend met database, authentication en API endpoints',
    domain: 'IT_SOFTWARE',
    serviceType: 'Backend Development',
    hours: 120,
    experienceLevel: 'SENIOR',
    materialCostPct: 5,
    overheadPct: 10,
    vatPercent: 21,
    icon: '🔌',
    category: 'Backend',
    estimatedValue: '€13.000 - €17.000'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Platform',
    description: 'Online shop met product catalog, checkout en payment integratie',
    domain: 'IT_SOFTWARE',
    serviceType: 'Full Stack Development',
    hours: 200,
    experienceLevel: 'EXPERT',
    materialCostPct: 15,
    overheadPct: 15,
    vatPercent: 21,
    icon: '🛒',
    category: 'E-commerce',
    estimatedValue: '€30.000 - €40.000'
  },

  // Construction
  {
    id: 'bathroom-renovation',
    name: 'Badkamer Renovatie',
    description: 'Complete badkamer renovatie inclusief tegels en sanitair',
    domain: 'CONSTRUCTION',
    serviceType: 'Renovatie',
    hours: 120,
    experienceLevel: 'SENIOR',
    materialCostPct: 40,
    overheadPct: 20,
    vatPercent: 21,
    icon: '🚿',
    category: 'Renovatie',
    estimatedValue: '€12.000 - €18.000'
  },
  {
    id: 'kitchen-renovation',
    name: 'Keuken Renovatie',
    description: 'Volledige keuken renovatie met nieuwe kastenwand',
    domain: 'CONSTRUCTION',
    serviceType: 'Renovatie',
    hours: 100,
    experienceLevel: 'SENIOR',
    materialCostPct: 50,
    overheadPct: 20,
    vatPercent: 21,
    icon: '🍳',
    category: 'Renovatie',
    estimatedValue: '€15.000 - €25.000'
  },

  // Design
  {
    id: 'brand-identity',
    name: 'Brand Identity Package',
    description: 'Complete corporate identity: logo, kleuren, typografie, styleguide',
    domain: 'DESIGN_CREATIVE',
    serviceType: 'Branding',
    hours: 60,
    experienceLevel: 'SENIOR',
    materialCostPct: 5,
    overheadPct: 10,
    vatPercent: 21,
    icon: '🎨',
    category: 'Branding',
    estimatedValue: '€5.500 - €7.500'
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design App',
    description: 'Complete app design met wireframes, mockups en prototype',
    domain: 'DESIGN_CREATIVE',
    serviceType: 'UI/UX Design',
    hours: 80,
    experienceLevel: 'SENIOR',
    materialCostPct: 5,
    overheadPct: 10,
    vatPercent: 21,
    icon: '📐',
    category: 'Digital',
    estimatedValue: '€7.000 - €9.500'
  },

  // Consulting
  {
    id: 'business-strategy',
    name: 'Business Strategy Consulting',
    description: 'Strategic advies voor groei en ontwikkeling (3 maanden)',
    domain: 'CONSULTING',
    serviceType: 'Strategy Consulting',
    hours: 60,
    experienceLevel: 'EXPERT',
    materialCostPct: 5,
    overheadPct: 15,
    vatPercent: 21,
    icon: '📊',
    category: 'Strategy',
    estimatedValue: '€13.000 - €17.000'
  },
  {
    id: 'it-audit',
    name: 'IT Security Audit',
    description: 'Complete IT beveiligingsanalyse en rapportage',
    domain: 'CONSULTING',
    serviceType: 'IT Consulting',
    hours: 40,
    experienceLevel: 'EXPERT',
    materialCostPct: 5,
    overheadPct: 10,
    vatPercent: 21,
    icon: '🔒',
    category: 'IT',
    estimatedValue: '€9.000 - €12.000'
  },

  // Marketing
  {
    id: 'social-media-campaign',
    name: 'Social Media Campaign',
    description: '3-maanden social media campagne met content creatie',
    domain: 'MARKETING',
    serviceType: 'Social Media',
    hours: 90,
    experienceLevel: 'MEDIOR',
    materialCostPct: 20,
    overheadPct: 10,
    vatPercent: 21,
    icon: '📱',
    category: 'Social Media',
    estimatedValue: '€7.000 - €10.000'
  },
  {
    id: 'seo-optimization',
    name: 'SEO Optimization Package',
    description: 'Complete SEO audit, optimalisatie en 3 maanden monitoring',
    domain: 'MARKETING',
    serviceType: 'SEO/SEA',
    hours: 60,
    experienceLevel: 'SENIOR',
    materialCostPct: 10,
    overheadPct: 10,
    vatPercent: 21,
    icon: '🔍',
    category: 'Digital Marketing',
    estimatedValue: '€6.500 - €8.500'
  },

  // Education
  {
    id: 'training-program',
    name: 'Corporate Training Program',
    description: 'Custom training programma voor 10-15 deelnemers (5 dagen)',
    domain: 'EDUCATION',
    serviceType: 'Training & Workshops',
    hours: 40,
    experienceLevel: 'EXPERT',
    materialCostPct: 15,
    overheadPct: 10,
    vatPercent: 21,
    icon: '👨‍🏫',
    category: 'Corporate',
    estimatedValue: '€4.500 - €6.000'
  },

  // Legal
  {
    id: 'contract-review',
    name: 'Contract Review & Advies',
    description: 'Review en advies voor commerciële contracten',
    domain: 'LEGAL',
    serviceType: 'Contracten',
    hours: 15,
    experienceLevel: 'SENIOR',
    materialCostPct: 5,
    overheadPct: 10,
    vatPercent: 21,
    icon: '📄',
    category: 'Commercial',
    estimatedValue: '€3.000 - €4.000'
  },

  // Healthcare
  {
    id: 'health-coaching',
    name: 'Personal Health Coaching',
    description: '3-maanden persoonlijk coaching programma',
    domain: 'HEALTHCARE',
    serviceType: 'Wellness',
    hours: 30,
    experienceLevel: 'SENIOR',
    materialCostPct: 10,
    overheadPct: 10,
    vatPercent: 21,
    icon: '💪',
    category: 'Wellness',
    estimatedValue: '€3.000 - €4.200'
  }
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return projectTemplates.filter(t => t.category === category);
}

/**
 * Get templates by domain
 */
export function getTemplatesByDomain(domain: string): ProjectTemplate[] {
  return projectTemplates.filter(t => t.domain === domain);
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(projectTemplates.map(t => t.category));
  return Array.from(categories).sort();
}

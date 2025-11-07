export interface AISuggestion {
    description: string;
    confidence: number;
    category: string;
}

function detectITService(input: string): string {
    const lowerInput = input.toLowerCase();
    
    const serviceKeywords: Record<string, string[]> = {
        'frontend': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'frontend', 'ui', 'interface', 'component'],
        'backend': ['backend', 'api', 'server', 'node', 'express', 'database', 'sql', 'rest', 'graphql', 'microservice'],
        'fullstack': ['fullstack', 'full stack', 'full-stack', 'web app', 'webapp', 'application'],
        'mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'app development', 'mobile app'],
        'devops': ['devops', 'ci/cd', 'docker', 'kubernetes', 'aws', 'azure', 'cloud', 'deployment', 'infrastructure'],
        'consultancy': ['consultancy', 'consulting', 'advies', 'strategie', 'architectuur', 'architecture', 'advies'],
        'support': ['support', 'maintenance', 'onderhoud', 'bugfix', 'bug fix', 'troubleshooting', 'helpdesk'],
        'testing': ['testing', 'qa', 'quality assurance', 'test', 'automation', 'selenium', 'cypress'],
        'data': ['data', 'analytics', 'big data', 'machine learning', 'ai', 'python', 'data science'],
        'security': ['security', 'cybersecurity', 'penetration', 'audit', 'compliance', 'gdpr'],
        'web development': ['web', 'website', 'web development', 'web development', 'webapp']
    };

    for (const [service, keywords] of Object.entries(serviceKeywords)) {
        if (keywords.some(keyword => lowerInput.includes(keyword))) {
            return service;
        }
    }

    return 'web development';
}

function generateITDescription(service: string, hours: number, input: string): string {
    const serviceDescriptions: Record<string, string> = {
        'frontend': `Frontend ontwikkeling - ${hours} uur ontwikkeling van gebruikersinterface met moderne frameworks en responsive design`,
        'backend': `Backend ontwikkeling - ${hours} uur ontwikkeling en optimalisatie van server-side applicaties, API's en database integratie`,
        'fullstack': `Fullstack ontwikkeling - ${hours} uur end-to-end ontwikkeling van webapplicatie inclusief frontend en backend componenten`,
        'mobile': `Mobile app ontwikkeling - ${hours} uur ontwikkeling van native of cross-platform mobiele applicatie`,
        'devops': `DevOps & Infrastructure - ${hours} uur configuratie, deployment en optimalisatie van development en production omgevingen`,
        'consultancy': `IT Consultancy - ${hours} uur technisch advies, architectuur analyse en strategische IT begeleiding`,
        'support': `Technische support & Maintenance - ${hours} uur onderhoud, bugfixing en technische ondersteuning van bestaande systemen`,
        'testing': `Software Testing & QA - ${hours} uur kwaliteitscontrole, testautomatisering en kwaliteitsborging`,
        'data': `Data Engineering & Analytics - ${hours} uur data analyse, data processing en implementatie van data-gedreven oplossingen`,
        'security': `Cybersecurity & Security Audit - ${hours} uur security assessment, compliance controle en beveiligingsoptimalisatie`,
        'web development': `Web Development - ${hours} uur ontwikkeling en implementatie van webapplicatie met moderne technologieën`
    };

    return serviceDescriptions[service] || serviceDescriptions['web development'];
}

export async function generateInvoiceDescription(
    projectType: string,
    hours: number,
    details?: string
): Promise<AISuggestion> {
    try {
        const detectedService = detectITService(projectType);
        const description = generateITDescription(detectedService, hours, projectType);

        return {
            description,
            confidence: 0.90,
            category: detectedService
        };
    } catch (error) {
        console.error('AI description generation failed:', error);
        return {
            description: `IT Dienstverlening - ${hours} uur ontwikkeling en implementatie`,
            confidence: 0.5,
            category: 'general'
        };
    }
}

export async function suggestPricing(
    service: string,
    hours: number,
    clientHistory?: any[]
): Promise<number> {
    try {
        const baseRates: Record<string, number> = {
            'web development': 75,
            'consultancy': 100,
            'design': 60,
            'marketing': 80,
            'support': 50,
        };

        const baseRate = baseRates[service.toLowerCase()] || 65;

        const clientAvg = clientHistory?.reduce((sum, inv) => sum + inv.totalCents, 0) / (clientHistory?.length || 1) / 100;
        const multiplier = clientAvg > 2000 ? 1.2 : 1.0;

        return Math.round(baseRate * multiplier * hours);
    } catch (error) {
        console.error('AI pricing suggestion failed:', error);
        return 65 * hours;
    }
}

export async function categorizeExpense(description: string): Promise<string> {
    try {
        const categories: Record<string, string[]> = {
            'Transport': ['tank', 'benzine', 'trein', 'bus', 'taxi', 'parking'],
            'Kantoorbenodigdheden': ['kantoor', 'papier', 'pen', 'printer', 'computer'],
            'Telecommunicatie': ['telefoon', 'internet', 'mobiel', 'data'],
            'Marketing': ['advertentie', 'campagne', 'social media', 'google ads'],
            'Professional Services': ['advocaat', 'accountant', 'consultant', 'expert'],
            'Materiaal': ['materiaal', 'onderdelen', 'componenten', 'hardware'],
        };

        const lowerDesc = description.toLowerCase();

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerDesc.includes(keyword))) {
                return category;
            }
        }

        return 'Algemeen';
    } catch (error) {
        console.error('AI expense categorization failed:', error);
        return 'Algemeen';
    }
}

export function suggestClients(
    partialName: string,
    clients: any[]
): any[] {
    if (partialName.length < 2) return [];

    const lowerPartial = partialName.toLowerCase();

    return clients
        .filter(client =>
            client.name.toLowerCase().includes(lowerPartial) ||
            (client.email && client.email.toLowerCase().includes(lowerPartial))
        )
        .slice(0, 5);
}

export function predictPaymentDelay(client: any, invoice: any): number {
    try {
        if (!client.invoices || client.invoices.length === 0) {
            return 30;
        }

        const paymentHistory = client.invoices
            .filter((inv: any) => inv.status === 'PAID')
            .map((inv: any) => {
                const created = new Date(inv.date);
                const paid = new Date(inv.paidAt || inv.updatedAt);
                return Math.ceil((paid.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
            });

        if (paymentHistory.length === 0) return 30;

        const avgDelay = paymentHistory.reduce((sum, days) => sum + days, 0) / paymentHistory.length;
        return Math.round(avgDelay);
    } catch (error) {
        console.error('Payment prediction failed:', error);
        return 30;
    }
}

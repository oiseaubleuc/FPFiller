/**
 * Lichte AI-hulpfuncties voor FPFiller
 * Basis helpers voor service detectie en beschrijving generatie
 */

export interface ServiceSuggestion {
    description: string;
    category: string;
}

/**
 * Detecteert het type IT-dienst op basis van zoekwoorden
 */
function detectITService(input: string): string {
    const lowerInput = input.toLowerCase();
    
    const serviceKeywords: Record<string, string[]> = {
        'frontend': ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'frontend', 'ui'],
        'backend': ['backend', 'api', 'server', 'node', 'express', 'database', 'sql', 'rest', 'graphql'],
        'fullstack': ['fullstack', 'full stack', 'web app', 'webapp'],
        'mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'app'],
        'devops': ['devops', 'ci/cd', 'docker', 'kubernetes', 'aws', 'azure', 'cloud', 'deployment'],
        'support': ['support', 'maintenance', 'onderhoud', 'bugfix', 'troubleshooting'],
    };

    for (const [service, keywords] of Object.entries(serviceKeywords)) {
        if (keywords.some(keyword => lowerInput.includes(keyword))) {
            return service;
        }
    }

    return 'web development';
}

/**
 * Genereert een professionele beschrijving voor een IT-dienst
 */
function generateITDescription(service: string, hours: number, input: string): string {
    const serviceDescriptions: Record<string, string> = {
        'frontend': `Frontend ontwikkeling - ${hours} uur ontwikkeling van gebruikersinterface`,
        'backend': `Backend ontwikkeling - ${hours} uur ontwikkeling van server-side applicaties en API's`,
        'fullstack': `Fullstack ontwikkeling - ${hours} uur end-to-end ontwikkeling van webapplicatie`,
        'mobile': `Mobile app ontwikkeling - ${hours} uur ontwikkeling van mobiele applicatie`,
        'devops': `DevOps & Infrastructure - ${hours} uur configuratie en deployment`,
        'support': `Technische support - ${hours} uur onderhoud en technische ondersteuning`,
        'web development': `Web Development - ${hours} uur ontwikkeling van webapplicatie`
    };

    return serviceDescriptions[service] || serviceDescriptions['web development'];
}

/**
 * Genereert een beschrijving voor een factuurregel op basis van de input
 * Lichte AI-hulp: detecteert het type dienst en stelt een professionele beschrijving voor
 */
export async function generateInvoiceDescription(
    projectType: string,
    hours: number
): Promise<ServiceSuggestion> {
    try {
        const detectedService = detectITService(projectType);
        const description = generateITDescription(detectedService, hours, projectType);

        return {
            description,
            category: detectedService
        };
    } catch (error) {
        console.error('Description generation failed:', error);
        return {
            description: `IT Dienstverlening - ${hours} uur`,
            category: 'general'
        };
    }
}

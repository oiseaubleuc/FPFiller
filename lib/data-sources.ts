export interface DataSourceInfo {
    name: string;
    type: 'internal' | 'external' | 'api' | 'aggregated';
    status: 'active' | 'planned' | 'future';
    url?: string;
    description: string;
    cost: 'free' | 'paid' | 'tiered';
    dataType: string[];
    sampleSize?: number;
    updateFrequency?: string;
    reliability: 'high' | 'medium' | 'low';
    notes?: string;
}

export function getAllDataSources(): DataSourceInfo[] {
    return [
        {
            name: 'Interne Marktdata (België)',
            type: 'internal',
            status: 'active',
            description: 'Hardcoded marktdata voor IT services in België, gebaseerd op marktonderzoek 2024',
            cost: 'free',
            dataType: ['hourly_rates', 'market_averages', 'min_max_ranges'],
            sampleSize: 190,
            updateFrequency: 'Manual',
            reliability: 'medium',
            notes: 'Statische data in codebase, 11 IT services gedefinieerd'
        },
        {
            name: 'Lokale Database (Prisma/SQLite)',
            type: 'internal',
            status: 'active',
            description: 'Client history, vorige facturen, betaalgeschiedenis uit eigen database',
            cost: 'free',
            dataType: ['client_history', 'invoice_history', 'payment_patterns'],
            updateFrequency: 'Real-time',
            reliability: 'high',
            notes: 'Eigen data, volledig betrouwbaar maar beperkte dataset'
        },
        {
            name: 'Upwork API',
            type: 'api',
            status: 'planned',
            url: 'https://www.upwork.com/ab/jobs/search/api',
            description: 'Real-time freelancer rates per skill, location en experience level',
            cost: 'paid',
            dataType: ['freelancer_rates', 'skill_rates', 'location_data'],
            sampleSize: 100000,
            updateFrequency: 'Real-time',
            reliability: 'high',
            notes: 'Betaalde API, rate limiting, grote dataset voor België'
        },
        {
            name: 'Freelancer.com API',
            type: 'api',
            status: 'future',
            url: 'https://www.freelancer.com/api',
            description: 'Project rates, hourly rates, skill categories',
            cost: 'tiered',
            dataType: ['project_rates', 'hourly_rates', 'skill_categories'],
            sampleSize: 50000,
            updateFrequency: 'Daily',
            reliability: 'medium',
            notes: 'Gratis tier beschikbaar, beperkte data voor België'
        },
        {
            name: 'PeoplePerHour API',
            type: 'api',
            status: 'future',
            url: 'https://www.peopleperhour.com/api',
            description: 'Hourly rates en project budgets voor Europese freelancers',
            cost: 'paid',
            dataType: ['hourly_rates', 'project_budgets'],
            sampleSize: 30000,
            updateFrequency: 'Daily',
            reliability: 'medium',
            notes: 'Europese focus, beperkte open API access'
        },
        {
            name: 'Indeed API',
            type: 'api',
            status: 'planned',
            url: 'https://api.indeed.com/ads/apisearch',
            description: 'Salary ranges voor IT posities in België',
            cost: 'free',
            dataType: ['salary_ranges', 'job_postings', 'location_data'],
            sampleSize: 20000,
            updateFrequency: 'Daily',
            reliability: 'high',
            notes: 'Gratis tier, grote dataset, maar full-time salarissen (niet freelance)'
        },
        {
            name: 'Glassdoor API',
            type: 'api',
            status: 'future',
            url: 'https://www.glassdoor.com/api/partner/jobListingApi.htm',
            description: 'Salary insights, company reviews, salary ranges',
            cost: 'paid',
            dataType: ['salary_insights', 'company_reviews', 'salary_ranges'],
            sampleSize: 50000,
            updateFrequency: 'Weekly',
            reliability: 'high',
            notes: 'Betaalde API, complexe authenticatie, accurate data'
        },
        {
            name: 'LinkedIn Salary API',
            type: 'api',
            status: 'future',
            url: 'https://api.linkedin.com/v2',
            description: 'Salary insights en industry trends van professioneel netwerk',
            cost: 'paid',
            dataType: ['salary_insights', 'industry_trends'],
            sampleSize: 100000,
            updateFrequency: 'Monthly',
            reliability: 'high',
            notes: 'Zeer beperkte API access, betaald, professioneel netwerk data'
        },
        {
            name: 'Payscale API',
            type: 'api',
            status: 'future',
            url: 'https://www.payscale.com/api/v1',
            description: 'Salary data en compensation reports',
            cost: 'paid',
            dataType: ['salary_data', 'compensation_reports'],
            sampleSize: 80000,
            updateFrequency: 'Quarterly',
            reliability: 'high',
            notes: 'Accurate salary data, maar focus op full-time (niet freelance)'
        },
        {
            name: 'Robert Half Salary Guide API',
            type: 'api',
            status: 'future',
            url: 'https://www.roberthalf.com/api',
            description: 'IT salary benchmarks en market trends',
            cost: 'paid',
            dataType: ['it_salary_benchmarks', 'market_trends'],
            sampleSize: 40000,
            updateFrequency: 'Quarterly',
            reliability: 'high',
            notes: 'IT-specifiek, regelmatig geüpdatet, betaalde API'
        },
        {
            name: 'Eurostat API',
            type: 'api',
            status: 'future',
            url: 'https://ec.europa.eu/eurostat/api/dissemination/statistics',
            description: 'Officiële economische data en arbeidsmarkt statistieken',
            cost: 'free',
            dataType: ['economic_data', 'labor_market_statistics'],
            sampleSize: 1000000,
            updateFrequency: 'Monthly',
            reliability: 'high',
            notes: 'Gratis, officieel, maar te algemeen (niet IT-specifiek)'
        },
        {
            name: 'Belgian Government API (data.gov.be)',
            type: 'api',
            status: 'future',
            url: 'https://data.gov.be/api',
            description: 'Open data en arbeidsmarkt statistieken voor België',
            cost: 'free',
            dataType: ['open_data', 'labor_statistics'],
            sampleSize: 50000,
            updateFrequency: 'Quarterly',
            reliability: 'high',
            notes: 'Gratis, Belgisch, maar beperkte IT-specifieke data'
        },
        {
            name: 'Reddit API',
            type: 'api',
            status: 'planned',
            url: 'https://www.reddit.com/api/v1',
            description: 'Freelancer discussions en rate sharing in communities',
            cost: 'free',
            dataType: ['community_discussions', 'rate_sharing'],
            sampleSize: 10000,
            updateFrequency: 'Real-time',
            reliability: 'low',
            notes: 'Gratis, real community data, maar ongeverifieerd en moeilijk te structureren'
        },
        {
            name: 'GitHub API',
            type: 'api',
            status: 'future',
            url: 'https://api.github.com',
            description: 'Developer profiles en project rates',
            cost: 'free',
            dataType: ['developer_profiles', 'project_rates'],
            sampleSize: 5000,
            updateFrequency: 'Real-time',
            reliability: 'medium',
            notes: 'Gratis, IT-specifiek, maar beperkte rate data'
        },
        {
            name: 'RapidAPI Freelancer Rates',
            type: 'aggregated',
            status: 'future',
            url: 'https://rapidapi.com/marketplace',
            description: 'Aggregated freelancer data van meerdere bronnen',
            cost: 'paid',
            dataType: ['aggregated_freelancer_data'],
            sampleSize: 200000,
            updateFrequency: 'Daily',
            reliability: 'medium',
            notes: 'Eén API voor meerdere bronnen, betaald, variabele kwaliteit'
        },
        {
            name: 'Web Scraping Services (ScraperAPI, Apify)',
            type: 'aggregated',
            status: 'future',
            url: 'https://www.scraperapi.com',
            description: 'Scraped data van job boards en freelancer platforms',
            cost: 'paid',
            dataType: ['scraped_job_data', 'freelancer_rates'],
            sampleSize: 500000,
            updateFrequency: 'Daily',
            reliability: 'medium',
            notes: 'Betaald, veel data bronnen, maar legale/ethische overwegingen'
        }
    ];
}

export function getActiveDataSources(): DataSourceInfo[] {
    return getAllDataSources().filter(source => source.status === 'active');
}

export function getPlannedDataSources(): DataSourceInfo[] {
    return getAllDataSources().filter(source => source.status === 'planned');
}

export function getFutureDataSources(): DataSourceInfo[] {
    return getAllDataSources().filter(source => source.status === 'future');
}

export function getDataSourcesByType(type: 'internal' | 'external' | 'api' | 'aggregated'): DataSourceInfo[] {
    return getAllDataSources().filter(source => source.type === type);
}

export function getFreeDataSources(): DataSourceInfo[] {
    return getAllDataSources().filter(source => source.cost === 'free');
}

export function getPaidDataSources(): DataSourceInfo[] {
    return getAllDataSources().filter(source => source.cost === 'paid' || source.cost === 'tiered');
}


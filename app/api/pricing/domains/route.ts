import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/pricing/domains
 * Haal alle beschikbare pricing domeinen op
 */
export async function GET() {
  try {
    const domains = [
      {
        id: 'IT_SOFTWARE',
        name: 'IT & Software Development',
        description: 'Web development, mobile apps, software engineering',
        icon: '💻',
        services: [
          'Frontend Development',
          'Backend Development',
          'Full Stack Development',
          'Mobile Development',
          'DevOps',
          'Technical Support'
        ]
      },
      {
        id: 'CONSTRUCTION',
        name: 'Bouw & Renovatie',
        description: 'Bouwprojecten, renovaties, onderhoud',
        icon: '🏗️',
        services: [
          'Nieuwbouw',
          'Renovatie',
          'Verbouwing',
          'Onderhoud',
          'Schilderwerk',
          'Loodgieterij'
        ]
      },
      {
        id: 'HOSPITALITY',
        name: 'Horeca & Catering',
        description: 'Restaurant, catering, evenementen',
        icon: '🍽️',
        services: [
          'Chef/Kok',
          'Bediening',
          'Bar/Barista',
          'Catering',
          'Event Planning',
          'Management'
        ]
      },
      {
        id: 'CONSULTING',
        name: 'Consultancy & Advies',
        description: 'Business consulting, strategie, coaching',
        icon: '💼',
        services: [
          'Business Consulting',
          'Strategy Consulting',
          'Management Consulting',
          'HR Consulting',
          'Financial Advisory',
          'IT Consulting'
        ]
      },
      {
        id: 'DESIGN_CREATIVE',
        name: 'Design & Creatief',
        description: 'Grafisch design, branding, content creatie',
        icon: '🎨',
        services: [
          'Graphic Design',
          'UI/UX Design',
          'Branding',
          'Content Creation',
          'Video Editing',
          'Photography'
        ]
      },
      {
        id: 'EDUCATION',
        name: 'Onderwijs & Training',
        description: 'Lesgeving, training, coaching',
        icon: '📚',
        services: [
          'Lesgeving',
          'Training & Workshops',
          'Coaching',
          'Tutoring',
          'Cursus Ontwikkeling',
          'E-learning'
        ]
      },
      {
        id: 'HEALTHCARE',
        name: 'Gezondheidszorg',
        description: 'Medische diensten, therapie, verzorging',
        icon: '⚕️',
        services: [
          'Verpleging',
          'Fysiotherapie',
          'Psychologie',
          'Thuiszorg',
          'Wellness',
          'Preventie'
        ]
      },
      {
        id: 'LEGAL',
        name: 'Juridische Diensten',
        description: 'Advocatuur, juridisch advies, notariaat',
        icon: '⚖️',
        services: [
          'Advocaat',
          'Juridisch Advies',
          'Notaris',
          'Contracten',
          'Procedures',
          'Mediation'
        ]
      },
      {
        id: 'MARKETING',
        name: 'Marketing & PR',
        description: 'Digital marketing, PR, social media',
        icon: '📱',
        services: [
          'Digital Marketing',
          'Social Media',
          'SEO/SEA',
          'Content Marketing',
          'PR & Communications',
          'Campaign Management'
        ]
      },
      {
        id: 'REAL_ESTATE',
        name: 'Vastgoed',
        description: 'Makelaarsdiensten, vastgoedbeheer',
        icon: '🏠',
        services: [
          'Makelaar',
          'Vastgoedbeheer',
          'Property Management',
          'Taxatie',
          'Verhuur',
          'Advies'
        ]
      }
    ];
    
    return NextResponse.json({ domains });
    
  } catch (error: any) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: "Fout bij ophalen domeinen" },
      { status: 500 }
    );
  }
}

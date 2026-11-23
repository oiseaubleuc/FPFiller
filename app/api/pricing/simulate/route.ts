import { NextResponse } from "next/server";
import { calculatePrice, type PricingInput } from "@/lib/pricing/calculator";

export const runtime = "nodejs";

/**
 * POST /api/pricing/simulate
 * Bereken prijs voor een specifiek domein en service
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validatie
    if (!body.domain) {
      return NextResponse.json(
        { error: "Domain is verplicht" },
        { status: 400 }
      );
    }
    
    if (!body.serviceType) {
      return NextResponse.json(
        { error: "Service type is verplicht" },
        { status: 400 }
      );
    }
    
    if (!body.hours || body.hours <= 0) {
      return NextResponse.json(
        { error: "Aantal uren moet groter dan 0 zijn" },
        { status: 400 }
      );
    }
    
    const input: PricingInput = {
      domain: body.domain,
      serviceType: body.serviceType,
      hours: body.hours,
      quantity: body.quantity || 1,
      experienceLevel: body.experienceLevel || 'MEDIOR',
      materialCostPct: body.materialCostPct || 0,
      overheadPct: body.overheadPct || 10,
      vatPercent: body.vatPercent || 21
    };
    
    // Bereken prijs
    const result = calculatePrice(input);
    
    return NextResponse.json({
      success: true,
      input,
      result
    });
    
  } catch (error: any) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { error: error.message || "Fout bij prijsberekening" },
      { status: 500 }
    );
  }
}

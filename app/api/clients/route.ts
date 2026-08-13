import { NextResponse } from "next/server";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { clientSchema, formatValidationErrors } from "@/lib/validation";
import { z } from "zod";

export const runtime = "nodejs";

/**
 * GET /api/clients
 * Haal alle clients op via het client repository
 */
export async function GET() {
    try {
        const clients = await clientRepository.findAll();
        return NextResponse.json(clients);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

/**
 * POST /api/clients
 * Maak een nieuwe client aan via het client repository
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // Validate input using Zod schema
        const validatedData = clientSchema.parse(body);
        
        // Create client via repository
        const client = await clientRepository.create({
            name: validatedData.name,
            firstName: validatedData.firstName || null,
            lastName: validatedData.lastName || null,
            company: validatedData.company || null,
            email: validatedData.email || null,
            phone: validatedData.phone || null,
            address: validatedData.address || null,
            city: validatedData.city || null,
            postalCode: validatedData.postalCode || null,
            vat: validatedData.vat || null,
            country: validatedData.country || "België",
        });
        
        return NextResponse.json(client, { status: 201 });
    } catch (e: any) {
        // Handle Zod validation errors
        if (e instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validatiefout", details: formatValidationErrors(e) },
                { status: 400 }
            );
        }
        
        // Handle unique constraint errors
        if (e.code === "P2002") {
            return NextResponse.json(
                { error: "Een klant met deze naam bestaat al" },
                { status: 409 }
            );
        }
        
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

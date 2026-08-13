import { NextResponse } from "next/server";
import { toCents, type ItemIn } from "@/lib/calc";
import { invoiceSchema, formatValidationErrors } from "@/lib/validation";
import { invoiceRepository } from "@/lib/repositories/invoiceRepository";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { z } from "zod";

export const runtime = "nodejs";

/**
 * GET /api/invoices
 * Haal alle invoices op via het invoice repository
 */
export async function GET() {
    try {
        const invoices = await invoiceRepository.findAll();
        return NextResponse.json(invoices);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

/**
 * POST /api/invoices
 * Maak een nieuwe invoice aan via de repositories
 * Gebruikt het client repository voor het upserten van de client
 * en het invoice repository voor het aanmaken van de invoice
 */
export async function POST(req: Request) {
    try {
        const raw = await req.json();
        
        // Validate input using Zod schema
        const validatedData = invoiceSchema.parse(raw);
        
        const clientName = validatedData.clientName;
        const clientFirstName = validatedData.clientFirstName || null;
        const clientLastName = validatedData.clientLastName || null;
        const clientCompany = validatedData.clientCompany || null;
        const clientEmail = validatedData.clientEmail || null;
        const clientPhone = validatedData.clientPhone || null;
        const clientAddress = validatedData.clientAddress || null;
        const clientCity = validatedData.clientCity || null;
        const clientPostalCode = validatedData.clientPostalCode || null;
        const clientVat = validatedData.clientVat || null;
        const vatPercent = validatedData.vatPercent;
        const currency = validatedData.currency || "EUR";
        const note = validatedData.note || null;
        const status = validatedData.status || "SENT";
        const dueDays = validatedData.dueDays || 30;
        
        const cleanedItems: ItemIn[] = validatedData.items.map((i) => ({
            description: i.description,
            qty: i.qty,
            unitPriceEuro: i.unitPriceEuro,
        }));

        const { subtotalCents, vatCents, totalCents, vatRateBps } = toCents(cleanedItems, vatPercent);

        const itemsCents = cleanedItems.map((i) => ({
            description: i.description,
            quantity: i.qty,
            unitPriceCents: Math.round(i.unitPriceEuro * 100),
            lineTotalCents: Math.round(i.qty * i.unitPriceEuro * 100),
        }));

        const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000);

        // Upsert client via repository
        const client = await clientRepository.upsertByName({
            name: clientName,
            firstName: clientFirstName,
            lastName: clientLastName,
            company: clientCompany,
            email: clientEmail,
            phone: clientPhone,
            address: clientAddress,
            city: clientCity,
            postalCode: clientPostalCode,
            vat: clientVat,
        });

        // Generate next invoice number via repository
        const number = await invoiceRepository.generateNextInvoiceNumber();

        // Create invoice via repository
        const created = await invoiceRepository.create({
            number,
            clientId: client.id,
            date: new Date(),
            dueDate,
            status,
            currency,
            note,
            vatRateBps,
            subtotalCents,
            vatCents,
            totalCents,
            items: itemsCents,
        });

        return NextResponse.json({ id: created.id, number: created.number }, { status: 201 });
    } catch (e: any) {
        // Handle Zod validation errors
        if (e instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validatiefout", details: formatValidationErrors(e) },
                { status: 400 }
            );
        }
        
        // Handle unique constraint errors
        if (String(e?.message || "").includes("Unique constraint") && String(e?.message || "").includes("number")) {
            return NextResponse.json(
                { error: "Nummering conflict. Probeer opnieuw." },
                { status: 409 }
            );
        }
        
        return NextResponse.json({ error: e.message ?? "Serverfout" }, { status: 500 });
    }
}

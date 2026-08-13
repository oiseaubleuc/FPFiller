import { NextRequest, NextResponse } from "next/server";
import { toCents, type ItemIn } from "@/lib/calc";
import { invoiceSchema, formatValidationErrors } from "@/lib/validation";
import { invoiceRepository } from "@/lib/repositories/invoiceRepository";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { z } from "zod";

export const runtime = "nodejs";

/**
 * GET /api/invoices/[id]
 * Haal een specifieke invoice op via het invoice repository
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const invoice = await invoiceRepository.findById(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * PATCH /api/invoices/[id]
 * Update een bestaande invoice via de repositories
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const existingInvoice = await invoiceRepository.findById(invoiceId);

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const raw = await request.json();

    // Status update (simple case) - gebruik repository helper
    if (raw.status && !raw.items) {
      const updated = await invoiceRepository.updateStatus(
        invoiceId,
        raw.status,
        raw.status === "PAID" ? new Date() : null
      );
      return NextResponse.json(updated);
    }

    // Full update - prepare data with defaults from existing invoice
    const updateData = {
      clientName: raw.clientName ?? existingInvoice.client.name,
      clientFirstName: raw.clientFirstName,
      clientLastName: raw.clientLastName,
      clientCompany: raw.clientCompany,
      clientEmail: raw.clientEmail,
      clientPhone: raw.clientPhone,
      clientAddress: raw.clientAddress,
      clientCity: raw.clientCity,
      clientPostalCode: raw.clientPostalCode,
      clientVat: raw.clientVat,
      vatPercent: raw.vatPercent ?? existingInvoice.vatRateBps / 100,
      currency: raw.currency ?? "EUR",
      note: raw.note,
      status: raw.status ?? existingInvoice.status,
      dueDays: raw.dueDays ?? 30,
      items: raw.items ?? [],
    };
    
    // Validate the full update data
    const validatedData = invoiceSchema.parse(updateData);
    
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
    const status = validatedData.status || existingInvoice.status;
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

    const dueDate = raw.dueDate ? new Date(raw.dueDate) : new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000);

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

    // Update invoice via repository (items worden automatisch vervangen)
    const updated = await invoiceRepository.update(invoiceId, {
      clientId: client.id,
      date: raw.date ? new Date(raw.date) : existingInvoice.date,
      dueDate,
      status,
      paidAt: status === "PAID" && !existingInvoice.paidAt ? new Date() : existingInvoice.paidAt,
      currency,
      note,
      vatRateBps,
      subtotalCents,
      vatCents,
      totalCents,
      items: itemsCents,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    // Handle Zod validation errors
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validatiefout", details: formatValidationErrors(e) },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: e.message ?? "Serverfout" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { toCents, type ItemIn } from "@/lib/calc";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, items: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const raw = await request.json();

    // Status update (simple case)
    if (raw.status && !raw.items) {
      const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: raw.status,
          paidAt: raw.status === "PAID" ? new Date() : null,
        },
        include: { client: true, items: true },
      });
      return NextResponse.json(updated);
    }

    // Full update
    const clientName = (raw.clientName ?? existingInvoice.client.name).trim();
    const clientFirstName = (raw.clientFirstName ?? "").trim() || null;
    const clientLastName = (raw.clientLastName ?? "").trim() || null;
    const clientCompany = (raw.clientCompany ?? "").trim() || null;
    const clientEmail = (raw.clientEmail ?? "").trim() || null;
    const clientPhone = (raw.clientPhone ?? "").trim() || null;
    const clientAddress = (raw.clientAddress ?? "").trim() || null;
    const clientCity = (raw.clientCity ?? "").trim() || null;
    const clientPostalCode = (raw.clientPostalCode ?? "").trim() || null;
    const clientVat = (raw.clientVat ?? "").trim() || null;
    const vatPercent = Number.isFinite(raw.vatPercent) ? Math.max(0, raw.vatPercent) : existingInvoice.vatRateBps / 100;
    const currency = (raw.currency ?? "EUR").trim() || "EUR";
    const note = (raw.note ?? "").trim() || null;
    const status = raw.status ?? existingInvoice.status;
    const dueDays = Number.isFinite(raw.dueDays) ? Math.max(0, Math.floor(raw.dueDays!)) : 30;

    const items = Array.isArray(raw.items) ? raw.items : [];
    const cleanedItems: ItemIn[] = items
      .map((i: any) => ({
        description: (i.description ?? "").trim(),
        qty: Math.max(0, Number(i.qty) || 0),
        unitPriceEuro: Math.max(0, Number(i.unitPriceEuro) || 0),
      }))
      .filter((i) => i.description && i.qty > 0);

    if (!clientName || cleanedItems.length === 0) {
      return NextResponse.json(
        { error: "Vul een klantnaam in en minstens één geldige lijn." },
        { status: 400 }
      );
    }

    const { subtotalCents, vatCents, totalCents, vatRateBps } = toCents(cleanedItems, vatPercent);

    const itemsCents = cleanedItems.map((i) => ({
      description: i.description,
      quantity: i.qty,
      unitPriceCents: Math.round(i.unitPriceEuro * 100),
      lineTotalCents: Math.round(i.qty * i.unitPriceEuro * 100),
    }));

    const dueDate = raw.dueDate ? new Date(raw.dueDate) : new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.$transaction(async (tx) => {
      const client = await tx.client.upsert({
        where: { name: clientName },
        update: {
          firstName: clientFirstName ?? undefined,
          lastName: clientLastName ?? undefined,
          company: clientCompany ?? undefined,
          email: clientEmail ?? undefined,
          phone: clientPhone ?? undefined,
          address: clientAddress ?? undefined,
          city: clientCity ?? undefined,
          postalCode: clientPostalCode ?? undefined,
          vat: clientVat ?? undefined
        },
        create: {
          name: clientName,
          firstName: clientFirstName,
          lastName: clientLastName,
          company: clientCompany,
          email: clientEmail,
          phone: clientPhone,
          address: clientAddress,
          city: clientCity,
          postalCode: clientPostalCode,
          vat: clientVat
        },
      });

      // Delete existing items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: invoiceId },
      });

      const invoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
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
          items: { create: itemsCents },
        },
        include: { client: true, items: true },
      });

      return invoice;
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Serverfout" }, { status: 500 });
  }
}


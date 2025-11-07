import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { toCents, type ItemIn } from "@/lib/calc";

export const runtime = "nodejs";

type Body = {
    clientName: string;
    clientFirstName?: string | null;
    clientLastName?: string | null;
    clientCompany?: string | null;
    clientEmail?: string | null;
    clientPhone?: string | null;
    clientAddress?: string | null;
    clientCity?: string | null;
    clientPostalCode?: string | null;
    clientVat?: string | null;
    vatPercent: number;
    items: ItemIn[];
    dueDays?: number;
    note?: string | null;
    currency?: string | null;
    status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
};

async function nextInvoiceNumberTx() {
    const now = new Date();
    const year = now.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const last = await prisma.invoice.findFirst({
        where: { date: { gte: start, lt: end } },
        orderBy: { number: "desc" },
        select: { number: true },
    });

    const lastSeq = last ? Number(last.number.split("-")[1] ?? "0") : 0;
    const nextSeq = lastSeq + 1;
    const padded = String(nextSeq).padStart(4, "0");
    return `${year}-${padded}`;
}

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: [{ date: "desc" }, { number: "desc" }],
            include: { client: true, items: true },
        });
        return NextResponse.json(invoices);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const raw = (await req.json()) as Body;

        const clientName = (raw.clientName ?? "").trim();
        const clientFirstName = (raw.clientFirstName ?? "").trim() || null;
        const clientLastName = (raw.clientLastName ?? "").trim() || null;
        const clientCompany = (raw.clientCompany ?? "").trim() || null;
        const clientEmail = (raw.clientEmail ?? "").trim() || null;
        const clientPhone = (raw.clientPhone ?? "").trim() || null;
        const clientAddress = (raw.clientAddress ?? "").trim() || null;
        const clientCity = (raw.clientCity ?? "").trim() || null;
        const clientPostalCode = (raw.clientPostalCode ?? "").trim() || null;
        const clientVat = (raw.clientVat ?? "").trim() || null;
        const vatPercent = Number.isFinite(raw.vatPercent) ? Math.max(0, raw.vatPercent) : 0;
        const currency = (raw.currency ?? "EUR").trim() || "EUR";
        const note = (raw.note ?? "").trim() || null;
        const status = raw.status ?? "SENT";
        const dueDays = Number.isFinite(raw.dueDays) ? Math.max(0, Math.floor(raw.dueDays!)) : 30;

        const items = Array.isArray(raw.items) ? raw.items : [];
        const cleanedItems: ItemIn[] = items
            .map((i) => ({
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

        const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000);

        const created = await prisma.$transaction(async (tx) => {
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

            const number = await nextInvoiceNumberTx();

            const invoice = await tx.invoice.create({
                data: {
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
                    items: { create: itemsCents },
                },
                include: { client: true, items: true },
            });

            return invoice;
        });

        return NextResponse.json({ id: created.id, number: created.number }, { status: 201 });
    } catch (e: any) {
        if (String(e?.message || "").includes("Unique constraint") && String(e?.message || "").includes("number")) {
            return NextResponse.json(
                { error: "Nummering conflict. Probeer opnieuw." },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: e.message ?? "Serverfout" }, { status: 500 });
    }
}

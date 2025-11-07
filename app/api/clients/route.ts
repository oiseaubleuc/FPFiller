import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
    try {
        const clients = await prisma.client.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true,
                company: true,
                email: true,
                phone: true,
                address: true,
                city: true,
                postalCode: true,
                vat: true,
                _count: {
                    select: {
                        invoices: true
                    }
                }
            }
        });
        return NextResponse.json(clients);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}



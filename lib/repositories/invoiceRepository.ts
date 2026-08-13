/**
 * Invoice Repository
 * 
 * Dit is een implementatie van het Repository Pattern voor facturen (invoices).
 * Het repository pattern scheidt de datalogica van de business logica door een
 * abstractielaag te creëren tussen de database en de rest van de applicatie.
 * 
 * VOORDELEN:
 * - Centralisatie: Alle database-operaties voor invoices zijn op één plek
 * - Transactiebeheer: Complexe operaties (zoals het maken van een invoice met items)
 *   worden in één transactie uitgevoerd via het repository
 * - Testbaarheid: Repositories kunnen gemakkelijk worden gemockt in tests
 * - Onderhoudbaarheid: Database-wijzigingen vereisen alleen aanpassingen in het repository
 * - Business logica isolatie: De API routes hoeven zich niet bezig te houden met
 *   hoe data wordt opgeslagen, alleen met wat er gebeurt
 */

import prisma from "@/lib/prisma";
import type { Invoice, InvoiceItem, InvoiceStatus, Client } from "@prisma/client";

export type InvoiceWithRelations = Invoice & {
  client: Client;
  items: InvoiceItem[];
};

export type InvoiceItemData = {
  description: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type CreateInvoiceData = {
  number: string;
  clientId: number;
  date: Date;
  dueDate: Date;
  status: InvoiceStatus;
  currency: string;
  note: string | null;
  vatRateBps: number;
  subtotalCents: number;
  vatCents: number;
  totalCents: number;
  items: InvoiceItemData[];
};

export type UpdateInvoiceData = {
  clientId?: number;
  date?: Date;
  dueDate?: Date;
  status?: InvoiceStatus;
  paidAt?: Date | null;
  currency?: string;
  note?: string | null;
  vatRateBps?: number;
  subtotalCents?: number;
  vatCents?: number;
  totalCents?: number;
  items?: InvoiceItemData[];
};

class InvoiceRepository {
  /**
   * Haal alle invoices op, inclusief client en items, gesorteerd op datum (nieuwste eerst)
   */
  async findAll(): Promise<InvoiceWithRelations[]> {
    return prisma.invoice.findMany({
      orderBy: [{ date: "desc" }, { number: "desc" }],
      include: { client: true, items: true },
    });
  }

  /**
   * Haal een invoice op via ID, inclusief client en items
   */
  async findById(id: number): Promise<InvoiceWithRelations | null> {
    return prisma.invoice.findUnique({
      where: { id },
      include: { client: true, items: true },
    });
  }

  /**
   * Haal een invoice op via factuurnummer
   */
  async findByNumber(number: string): Promise<InvoiceWithRelations | null> {
    return prisma.invoice.findUnique({
      where: { number },
      include: { client: true, items: true },
    });
  }

  /**
   * Genereer het volgende factuurnummer voor het huidige jaar
   * Formaat: YYYY-0001, YYYY-0002, etc.
   */
  async generateNextInvoiceNumber(): Promise<string> {
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

  /**
   * Maak een nieuwe invoice aan binnen een transactie
   * Dit zorgt ervoor dat de invoice en alle items in één keer worden aangemaakt
   */
  async create(data: CreateInvoiceData): Promise<InvoiceWithRelations> {
    return prisma.invoice.create({
      data: {
        number: data.number,
        clientId: data.clientId,
        date: data.date,
        dueDate: data.dueDate,
        status: data.status,
        currency: data.currency,
        note: data.note,
        vatRateBps: data.vatRateBps,
        subtotalCents: data.subtotalCents,
        vatCents: data.vatCents,
        totalCents: data.totalCents,
        items: { create: data.items },
      },
      include: { client: true, items: true },
    });
  }

  /**
   * Update een bestaande invoice
   * Als items worden meegegeven, worden de oude items verwijderd en vervangen door de nieuwe
   */
  async update(id: number, data: UpdateInvoiceData): Promise<InvoiceWithRelations> {
    return prisma.$transaction(async (tx) => {
      // Als er nieuwe items zijn, verwijder dan eerst de oude
      if (data.items) {
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id },
        });
      }

      // Update de invoice (met of zonder nieuwe items)
      return tx.invoice.update({
        where: { id },
        data: {
          clientId: data.clientId,
          date: data.date,
          dueDate: data.dueDate,
          status: data.status,
          paidAt: data.paidAt,
          currency: data.currency,
          note: data.note,
          vatRateBps: data.vatRateBps,
          subtotalCents: data.subtotalCents,
          vatCents: data.vatCents,
          totalCents: data.totalCents,
          items: data.items ? { create: data.items } : undefined,
        },
        include: { client: true, items: true },
      });
    });
  }

  /**
   * Update alleen de status van een invoice
   * Handige helper voor statuswijzigingen zoals betaald markeren
   */
  async updateStatus(
    id: number,
    status: InvoiceStatus,
    paidAt?: Date | null
  ): Promise<InvoiceWithRelations> {
    return prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: paidAt !== undefined ? paidAt : undefined,
      },
      include: { client: true, items: true },
    });
  }

  /**
   * Verwijder een invoice
   * Items worden automatisch verwijderd door de cascade delete in het schema
   */
  async delete(id: number): Promise<Invoice> {
    return prisma.invoice.delete({
      where: { id },
    });
  }

  /**
   * Haal alle invoices op voor een specifieke client
   */
  async findByClientId(clientId: number): Promise<InvoiceWithRelations[]> {
    return prisma.invoice.findMany({
      where: { clientId },
      orderBy: [{ date: "desc" }, { number: "desc" }],
      include: { client: true, items: true },
    });
  }

  /**
   * Haal invoices op gefilterd op status
   */
  async findByStatus(status: InvoiceStatus): Promise<InvoiceWithRelations[]> {
    return prisma.invoice.findMany({
      where: { status },
      orderBy: [{ date: "desc" }, { number: "desc" }],
      include: { client: true, items: true },
    });
  }
}

// Export een singleton instantie van het repository
// Dit zorgt ervoor dat we overal dezelfde instantie gebruiken
export const invoiceRepository = new InvoiceRepository();

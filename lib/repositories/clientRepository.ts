/**
 * Client Repository
 * 
 * Dit is een implementatie van het Repository Pattern. Het repository pattern scheidt
 * de datalogica van de business logica door een abstractielaag te creëren tussen de
 * database en de rest van de applicatie.
 * 
 * VOORDELEN:
 * - Centralisatie: Alle database-operaties voor clients zijn op één plek
 * - Testbaarheid: Repositories kunnen gemakkelijk worden gemockt in tests
 * - Onderhoudbaarheid: Als de database-structuur verandert, hoeven we alleen het
 *   repository aan te passen, niet alle API routes
 * - Herbruikbaarheid: Dezelfde repository-methoden kunnen door meerdere routes
 *   worden gebruikt
 * - Flexibiliteit: We kunnen later de database-implementatie wijzigen zonder de
 *   API routes aan te passen
 */

import prisma from "@/lib/prisma";
import type { Client, Prisma } from "@prisma/client";

export type ClientWithInvoiceCount = Client & {
  _count: {
    invoices: number;
  };
};

export type CreateClientData = {
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  vat?: string | null;
  country?: string | null;
};

export type UpdateClientData = Partial<CreateClientData>;

class ClientRepository {
  /**
   * Haal alle clients op, gesorteerd op naam
   */
  async findAll(): Promise<ClientWithInvoiceCount[]> {
    return prisma.client.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            invoices: true,
          },
        },
      },
    });
  }

  /**
   * Haal een client op via ID
   */
  async findById(id: number): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { id },
    });
  }

  /**
   * Haal een client op via naam
   */
  async findByName(name: string): Promise<Client | null> {
    return prisma.client.findUnique({
      where: { name },
    });
  }

  /**
   * Maak een nieuwe client aan
   */
  async create(data: CreateClientData): Promise<Client> {
    return prisma.client.create({
      data: {
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        vat: data.vat,
        country: data.country || "België",
      },
    });
  }

  /**
   * Update een bestaande client
   */
  async update(id: number, data: UpdateClientData): Promise<Client> {
    return prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        vat: data.vat,
        country: data.country,
      },
    });
  }

  /**
   * Maak of update een client op basis van naam (upsert)
   * Dit is handig voor het aanmaken van facturen waarbij de client mogelijk al bestaat
   */
  async upsertByName(data: CreateClientData): Promise<Client> {
    return prisma.client.upsert({
      where: { name: data.name },
      update: {
        firstName: data.firstName ?? undefined,
        lastName: data.lastName ?? undefined,
        company: data.company ?? undefined,
        email: data.email ?? undefined,
        phone: data.phone ?? undefined,
        address: data.address ?? undefined,
        city: data.city ?? undefined,
        postalCode: data.postalCode ?? undefined,
        vat: data.vat ?? undefined,
      },
      create: {
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        vat: data.vat,
        country: data.country || "België",
      },
    });
  }

  /**
   * Verwijder een client
   */
  async delete(id: number): Promise<Client> {
    return prisma.client.delete({
      where: { id },
    });
  }
}

// Export een singleton instantie van het repository
// Dit zorgt ervoor dat we overal dezelfde instantie gebruiken
export const clientRepository = new ClientRepository();

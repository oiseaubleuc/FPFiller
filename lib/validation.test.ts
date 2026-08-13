import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  clientSchema,
  invoiceSchema,
  invoiceItemSchema,
  formatValidationErrors,
} from './validation';

describe('validation.ts - Zod schemas', () => {
  describe('clientSchema', () => {
    it('accepteert geldige client data', () => {
      const validClient = {
        name: 'Test Bedrijf BV',
        email: 'test@example.com',
        vat: 'BE0123456789',
      };

      const result = clientSchema.parse(validClient);
      expect(result.name).toBe('Test Bedrijf BV');
      expect(result.email).toBe('test@example.com');
      expect(result.vat).toBe('BE0123456789');
    });

    it('vereist een naam', () => {
      const invalidClient = {
        email: 'test@example.com',
      };

      expect(() => clientSchema.parse(invalidClient)).toThrow();
    });

    it('weigert lege naam', () => {
      const invalidClient = {
        name: '',
        email: 'test@example.com',
      };

      expect(() => clientSchema.parse(invalidClient)).toThrow('Naam is verplicht');
    });

    it('weigert ongeldig e-mailadres', () => {
      const invalidClient = {
        name: 'Test Bedrijf',
        email: 'invalid-email',
      };

      expect(() => clientSchema.parse(invalidClient)).toThrow('Ongeldig e-mailadres');
    });

    it('accepteert geldig Belgisch BTW-nummer', () => {
      const validVatNumbers = [
        { name: 'Test', vat: 'BE0123456789' },
        { name: 'Test', vat: 'BE0999999999' },
        { name: 'Test', vat: 'BE0000000000' },
      ];

      validVatNumbers.forEach((client) => {
        expect(() => clientSchema.parse(client)).not.toThrow();
      });
    });

    it('weigert ongeldig Belgisch BTW-nummer formaat', () => {
      const invalidVatNumbers = [
        { name: 'Test', vat: 'BE123456789' }, // Geen 0 na BE
        { name: 'Test', vat: 'BE01234567' }, // Te kort
        { name: 'Test', vat: 'BE01234567890' }, // Te lang
        { name: 'Test', vat: 'NL123456789' }, // Verkeerd land
        { name: 'Test', vat: '0123456789' }, // Geen BE prefix
        { name: 'Test', vat: 'BE 0123456789' }, // Spatie
      ];

      invalidVatNumbers.forEach((client) => {
        expect(() => clientSchema.parse(client)).toThrow(
          'BTW-nummer moet het formaat BE0xxxxxxxxx hebben'
        );
      });
    });

    it('accepteert lege string of null voor optionele velden', () => {
      const client = {
        name: 'Test',
        email: '',
        vat: '',
      };

      const result = clientSchema.parse(client);
      expect(result.name).toBe('Test');
    });

    it('trimt de naam', () => {
      const client = {
        name: '  Test Bedrijf  ',
      };

      const result = clientSchema.parse(client);
      expect(result.name).toBe('Test Bedrijf');
    });

    it('accepteert alle optionele velden', () => {
      const fullClient = {
        name: 'Test Bedrijf',
        firstName: 'Jan',
        lastName: 'Jansen',
        company: 'Test BV',
        email: 'jan@test.com',
        phone: '+32 123 45 67 89',
        address: 'Teststraat 1',
        city: 'Brussel',
        postalCode: '1000',
        vat: 'BE0123456789',
        country: 'België',
      };

      expect(() => clientSchema.parse(fullClient)).not.toThrow();
    });
  });

  describe('invoiceItemSchema', () => {
    it('accepteert geldige invoice item', () => {
      const validItem = {
        description: 'Test product',
        qty: 2,
        unitPriceEuro: 50.5,
      };

      const result = invoiceItemSchema.parse(validItem);
      expect(result.description).toBe('Test product');
      expect(result.qty).toBe(2);
      expect(result.unitPriceEuro).toBe(50.5);
    });

    it('vereist een omschrijving', () => {
      const invalidItem = {
        description: '',
        qty: 1,
        unitPriceEuro: 10,
      };

      expect(() => invoiceItemSchema.parse(invalidItem)).toThrow('Omschrijving is verplicht');
    });

    it('weigert negatieve hoeveelheid', () => {
      const invalidItem = {
        description: 'Test',
        qty: -1,
        unitPriceEuro: 10,
      };

      expect(() => invoiceItemSchema.parse(invalidItem)).toThrow('Aantal moet positief zijn');
    });

    it('weigert negatieve prijs', () => {
      const invalidItem = {
        description: 'Test',
        qty: 1,
        unitPriceEuro: -10,
      };

      expect(() => invoiceItemSchema.parse(invalidItem)).toThrow('Prijs moet positief zijn');
    });

    it('accepteert string waarden en converteert ze naar nummers', () => {
      const itemWithStrings = {
        description: 'Test',
        qty: '2' as any,
        unitPriceEuro: '50.5' as any,
      };

      const result = invoiceItemSchema.parse(itemWithStrings);
      expect(result.qty).toBe(2);
      expect(result.unitPriceEuro).toBe(50.5);
    });

    it('weigert ongeldige string waarden voor qty', () => {
      const invalidItem = {
        description: 'Test',
        qty: 'invalid' as any,
        unitPriceEuro: 10,
      };

      expect(() => invoiceItemSchema.parse(invalidItem)).toThrow();
    });

    it('accepteert 0 als hoeveelheid', () => {
      const item = {
        description: 'Test',
        qty: 0,
        unitPriceEuro: 10,
      };

      const result = invoiceItemSchema.parse(item);
      expect(result.qty).toBe(0);
    });
  });

  describe('invoiceSchema', () => {
    it('accepteert geldige invoice data', () => {
      const validInvoice = {
        clientName: 'Test Bedrijf',
        vatPercent: 21,
        items: [
          {
            description: 'Product 1',
            qty: 2,
            unitPriceEuro: 50,
          },
        ],
      };

      const result = invoiceSchema.parse(validInvoice);
      expect(result.clientName).toBe('Test Bedrijf');
      expect(result.vatPercent).toBe(21);
      expect(result.items).toHaveLength(1);
    });

    it('vereist een klantnaam', () => {
      const invalidInvoice = {
        vatPercent: 21,
        items: [
          {
            description: 'Product 1',
            qty: 1,
            unitPriceEuro: 50,
          },
        ],
      };

      expect(() => invoiceSchema.parse(invalidInvoice)).toThrow();
    });

    it('weigert lege klantnaam', () => {
      const invalidInvoice = {
        clientName: '',
        vatPercent: 21,
        items: [
          {
            description: 'Product 1',
            qty: 1,
            unitPriceEuro: 50,
          },
        ],
      };

      expect(() => invoiceSchema.parse(invalidInvoice)).toThrow('Klantnaam is verplicht');
    });

    it('vereist minstens één item', () => {
      const invalidInvoice = {
        clientName: 'Test',
        vatPercent: 21,
        items: [],
      };

      expect(() => invoiceSchema.parse(invalidInvoice)).toThrow('Minstens één factuurregel is verplicht');
    });

    it('weigert BTW-percentage onder 0', () => {
      const invalidInvoice = {
        clientName: 'Test',
        vatPercent: -5,
        items: [
          {
            description: 'Product 1',
            qty: 1,
            unitPriceEuro: 50,
          },
        ],
      };

      expect(() => invoiceSchema.parse(invalidInvoice)).toThrow('BTW-percentage moet minimaal 0% zijn');
    });

    it('weigert BTW-percentage boven 100', () => {
      const invalidInvoice = {
        clientName: 'Test',
        vatPercent: 150,
        items: [
          {
            description: 'Product 1',
            qty: 1,
            unitPriceEuro: 50,
          },
        ],
      };

      expect(() => invoiceSchema.parse(invalidInvoice)).toThrow('BTW-percentage mag niet hoger zijn dan 100%');
    });

    it('accepteert 0% BTW', () => {
      const invoice = {
        clientName: 'Test',
        vatPercent: 0,
        items: [
          {
            description: 'Product 1',
            qty: 1,
            unitPriceEuro: 50,
          },
        ],
      };

      expect(() => invoiceSchema.parse(invoice)).not.toThrow();
    });

    it('gebruikt standaardwaarden voor optionele velden', () => {
      const minimalInvoice = {
        clientName: 'Test',
        vatPercent: 21,
        items: [
          {
            description: 'Product 1',
            qty: 1,
            unitPriceEuro: 50,
          },
        ],
      };

      const result = invoiceSchema.parse(minimalInvoice);
      expect(result.dueDays).toBe(30); // default
      expect(result.currency).toBe('EUR'); // default
      expect(result.status).toBe('SENT'); // default
    });

    it('accepteert meerdere items', () => {
      const invoice = {
        clientName: 'Test',
        vatPercent: 21,
        items: [
          { description: 'Product 1', qty: 1, unitPriceEuro: 50 },
          { description: 'Product 2', qty: 2, unitPriceEuro: 30 },
          { description: 'Product 3', qty: 3, unitPriceEuro: 20 },
        ],
      };

      const result = invoiceSchema.parse(invoice);
      expect(result.items).toHaveLength(3);
    });

    it('valideert alle item properties', () => {
      const invoice = {
        clientName: 'Test',
        vatPercent: 21,
        items: [
          { description: '', qty: 1, unitPriceEuro: 50 }, // Invalid description
        ],
      };

      expect(() => invoiceSchema.parse(invoice)).toThrow('Omschrijving is verplicht');
    });

    it('controleert of er minstens één geldig item is (met qty > 0)', () => {
      const invoice = {
        clientName: 'Test',
        vatPercent: 21,
        items: [
          { description: 'Test', qty: 0, unitPriceEuro: 50 }, // qty 0
        ],
      };

      // Dit zou moeten falen omdat er geen item is met qty > 0
      expect(() => invoiceSchema.parse(invoice)).toThrow('Minstens één geldige factuurregel is verplicht');
    });

    it('accepteert items met qty > 0', () => {
      const invoice = {
        clientName: 'Test',
        vatPercent: 21,
        items: [
          { description: 'Test', qty: 1, unitPriceEuro: 50 },
        ],
      };

      expect(() => invoiceSchema.parse(invoice)).not.toThrow();
    });

    it('trimt klantnaam', () => {
      const invoice = {
        clientName: '  Test Bedrijf  ',
        vatPercent: 21,
        items: [
          { description: 'Product 1', qty: 1, unitPriceEuro: 50 },
        ],
      };

      const result = invoiceSchema.parse(invoice);
      expect(result.clientName).toBe('Test Bedrijf');
    });

    it('valideert client BTW-nummer indien aanwezig', () => {
      const invalidInvoice = {
        clientName: 'Test',
        clientVat: 'INVALID',
        vatPercent: 21,
        items: [
          { description: 'Product 1', qty: 1, unitPriceEuro: 50 },
        ],
      };

      expect(() => invoiceSchema.parse(invalidInvoice)).toThrow('BTW-nummer moet het formaat BE0xxxxxxxxx hebben');
    });

    it('valideert client email indien aanwezig', () => {
      const invalidInvoice = {
        clientName: 'Test',
        clientEmail: 'invalid-email',
        vatPercent: 21,
        items: [
          { description: 'Product 1', qty: 1, unitPriceEuro: 50 },
        ],
      };

      expect(() => invoiceSchema.parse(invalidInvoice)).toThrow('Ongeldig e-mailadres');
    });
  });

  describe('formatValidationErrors', () => {
    it('formatteert Zod errors naar leesbare string', () => {
      const result = clientSchema.safeParse({
        name: '',
        email: 'invalid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toContain('name');
        expect(formatted).toContain('email');
      }
    });

    it('bevat het pad en de foutmelding', () => {
      const result = invoiceSchema.safeParse({
        clientName: 'Test',
        vatPercent: -5,
        items: [],
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted).toBeTruthy();
        expect(typeof formatted).toBe('string');
      }
    });

    it('scheidt meerdere fouten met puntkomma', () => {
      const result = clientSchema.safeParse({
        name: '',
        email: 'invalid',
        vat: 'invalid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = formatValidationErrors(result.error);
        expect(formatted.includes(';')).toBe(true);
      }
    });
  });
});

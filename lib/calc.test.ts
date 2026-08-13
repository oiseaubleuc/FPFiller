import { describe, it, expect } from 'vitest';
import { toCents, euro, type ItemIn } from './calc';

describe('calc.ts - BTW en totaalberekening', () => {
  describe('toCents', () => {
    it('berekent correct voor een enkele regel met 21% BTW', () => {
      const items: ItemIn[] = [
        { description: 'Test item', qty: 1, unitPriceEuro: 100 }
      ];
      
      const result = toCents(items, 21);
      
      expect(result.subtotalCents).toBe(10000); // 100 * 100
      expect(result.vatCents).toBe(2100); // 10000 * 0.21
      expect(result.totalCents).toBe(12100); // 10000 + 2100
      expect(result.vatRateBps).toBe(2100); // 21 * 100
    });

    it('berekent correct voor meerdere regels', () => {
      const items: ItemIn[] = [
        { description: 'Item 1', qty: 2, unitPriceEuro: 50 },
        { description: 'Item 2', qty: 3, unitPriceEuro: 30 },
      ];
      
      const result = toCents(items, 21);
      
      // Subtotaal: (2 * 50) + (3 * 30) = 100 + 90 = 190 euro = 19000 cents
      expect(result.subtotalCents).toBe(19000);
      // BTW: 19000 * 0.21 = 3990 cents
      expect(result.vatCents).toBe(3990);
      // Totaal: 19000 + 3990 = 22990 cents
      expect(result.totalCents).toBe(22990);
      expect(result.vatRateBps).toBe(2100);
    });

    it('handelt 0% BTW correct af', () => {
      const items: ItemIn[] = [
        { description: 'BTW-vrij item', qty: 1, unitPriceEuro: 100 }
      ];
      
      const result = toCents(items, 0);
      
      expect(result.subtotalCents).toBe(10000);
      expect(result.vatCents).toBe(0);
      expect(result.totalCents).toBe(10000);
      expect(result.vatRateBps).toBe(0);
    });

    it('handelt 6% BTW (verlaagd tarief) correct af', () => {
      const items: ItemIn[] = [
        { description: 'Verlaagd tarief item', qty: 1, unitPriceEuro: 100 }
      ];
      
      const result = toCents(items, 6);
      
      expect(result.subtotalCents).toBe(10000);
      expect(result.vatCents).toBe(600); // 10000 * 0.06
      expect(result.totalCents).toBe(10600);
      expect(result.vatRateBps).toBe(600);
    });

    it('handelt decimale bedragen correct af', () => {
      const items: ItemIn[] = [
        { description: 'Decimaal bedrag', qty: 1, unitPriceEuro: 99.99 }
      ];
      
      const result = toCents(items, 21);
      
      expect(result.subtotalCents).toBe(9999); // 99.99 * 100, rounded
      expect(result.vatCents).toBe(2100); // 9999 * 0.21 = 2099.79, rounded to 2100
      expect(result.totalCents).toBe(12099);
    });

    it('handelt decimale hoeveelheden correct af', () => {
      const items: ItemIn[] = [
        { description: 'Halve eenheid', qty: 0.5, unitPriceEuro: 100 }
      ];
      
      const result = toCents(items, 21);
      
      expect(result.subtotalCents).toBe(5000); // 0.5 * 100 * 100
      expect(result.vatCents).toBe(1050); // 5000 * 0.21
      expect(result.totalCents).toBe(6050);
    });

    it('klemt negatieve hoeveelheden naar 0', () => {
      const items: ItemIn[] = [
        { description: 'Negatieve qty', qty: -5, unitPriceEuro: 100 }
      ];
      
      const result = toCents(items, 21);
      
      expect(result.subtotalCents).toBe(0);
      expect(result.vatCents).toBe(0);
      expect(result.totalCents).toBe(0);
    });

    it('klemt negatieve prijzen naar 0', () => {
      const items: ItemIn[] = [
        { description: 'Negatieve prijs', qty: 1, unitPriceEuro: -100 }
      ];
      
      const result = toCents(items, 21);
      
      expect(result.subtotalCents).toBe(0);
      expect(result.vatCents).toBe(0);
      expect(result.totalCents).toBe(0);
    });

    it('klemt negatief BTW-percentage naar 0', () => {
      const items: ItemIn[] = [
        { description: 'Test item', qty: 1, unitPriceEuro: 100 }
      ];
      
      const result = toCents(items, -10);
      
      expect(result.subtotalCents).toBe(10000);
      expect(result.vatCents).toBe(0);
      expect(result.totalCents).toBe(10000);
      expect(result.vatRateBps).toBe(0);
    });

    it('handelt lege items array correct af', () => {
      const items: ItemIn[] = [];
      
      const result = toCents(items, 21);
      
      expect(result.subtotalCents).toBe(0);
      expect(result.vatCents).toBe(0);
      expect(result.totalCents).toBe(0);
      expect(result.vatRateBps).toBe(2100);
    });

    it('berekent correct met mix van items inclusief nullen', () => {
      const items: ItemIn[] = [
        { description: 'Item 1', qty: 2, unitPriceEuro: 50 },
        { description: 'Item 2', qty: 0, unitPriceEuro: 100 }, // qty 0
        { description: 'Item 3', qty: 1, unitPriceEuro: 30 },
      ];
      
      const result = toCents(items, 21);
      
      // Subtotaal: (2 * 50) + (0 * 100) + (1 * 30) = 100 + 0 + 30 = 130 euro
      expect(result.subtotalCents).toBe(13000);
      expect(result.vatCents).toBe(2730); // 13000 * 0.21
      expect(result.totalCents).toBe(15730);
    });

    it('rondt correct af bij complexe berekeningen', () => {
      const items: ItemIn[] = [
        { description: 'Complex item', qty: 3, unitPriceEuro: 33.33 }
      ];
      
      const result = toCents(items, 21);
      
      // 3 * 33.33 = 99.99 euro = 9999 cents
      expect(result.subtotalCents).toBe(9999);
      // 9999 * 0.21 = 2099.79, rounded to 2100
      expect(result.vatCents).toBe(2100);
      expect(result.totalCents).toBe(12099);
    });
  });

  describe('euro', () => {
    it('formatteert cents correct naar euro met 2 decimalen', () => {
      expect(euro(10000)).toBe('100.00');
      expect(euro(12100)).toBe('121.00');
      expect(euro(0)).toBe('0.00');
    });

    it('formatteert decimale bedragen correct', () => {
      expect(euro(12345)).toBe('123.45');
      expect(euro(9999)).toBe('99.99');
      expect(euro(1)).toBe('0.01');
    });

    it('handelt negatieve bedragen correct af', () => {
      expect(euro(-10000)).toBe('-100.00');
      expect(euro(-12345)).toBe('-123.45');
    });

    it('rondt altijd af naar 2 decimalen', () => {
      expect(euro(12)).toBe('0.12');
      expect(euro(1)).toBe('0.01');
      expect(euro(999999)).toBe('9999.99');
    });
  });
});

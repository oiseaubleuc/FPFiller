import { z } from "zod";

/**
 * Belgian VAT number format: BE0xxxxxxxxx (BE followed by 0 and 9 digits)
 * Example: BE0123456789
 */
const belgianVatRegex = /^BE0\d{9}$/;

/**
 * Client validation schema
 * - name is required and must be non-empty
 * - email must be a valid email format (if provided)
 * - vat must follow Belgian VAT format BE0xxxxxxxxx (if provided)
 */
export const clientSchema = z.object({
  name: z.string()
    .min(1, "Naam is verplicht")
    .trim(),
  
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  
  email: z.string()
    .email("Ongeldig e-mailadres")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  
  vat: z.string()
    .regex(belgianVatRegex, "BTW-nummer moet het formaat BE0xxxxxxxxx hebben (bijv. BE0123456789)")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  country: z.string().optional().nullable(),
});

export type ClientInput = z.infer<typeof clientSchema>;

/**
 * Invoice item validation schema
 */
export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Omschrijving is verplicht"),
  qty: z.number().min(0, "Aantal moet positief zijn").or(
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        throw new Error("Aantal moet een geldig positief getal zijn");
      }
      return num;
    })
  ),
  unitPriceEuro: z.number().min(0, "Prijs moet positief zijn").or(
    z.string().transform((val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        throw new Error("Prijs moet een geldig positief getal zijn");
      }
      return num;
    })
  ),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

/**
 * Invoice validation schema
 * - clientName is required
 * - items must be an array with at least one valid item
 * - vatPercent must be between 0 and 100
 * - dueDays must be positive
 */
export const invoiceSchema = z.object({
  clientName: z.string().min(1, "Klantnaam is verplicht").trim(),
  clientFirstName: z.string().optional().nullable(),
  clientLastName: z.string().optional().nullable(),
  clientCompany: z.string().optional().nullable(),
  clientEmail: z.string()
    .email("Ongeldig e-mailadres")
    .optional()
    .nullable()
    .or(z.literal("")),
  clientPhone: z.string().optional().nullable(),
  clientAddress: z.string().optional().nullable(),
  clientCity: z.string().optional().nullable(),
  clientPostalCode: z.string().optional().nullable(),
  clientVat: z.string()
    .regex(belgianVatRegex, "BTW-nummer moet het formaat BE0xxxxxxxxx hebben")
    .optional()
    .nullable()
    .or(z.literal("")),
  
  vatPercent: z.number()
    .min(0, "BTW-percentage moet minimaal 0% zijn")
    .max(100, "BTW-percentage mag niet hoger zijn dan 100%")
    .or(
      z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 100) {
          throw new Error("BTW-percentage moet tussen 0 en 100 zijn");
        }
        return num;
      })
    ),
  
  items: z.array(invoiceItemSchema)
    .min(1, "Minstens één factuurregel is verplicht")
    .refine(
      (items) => items.some((item) => item.qty > 0 && item.description.trim().length > 0),
      "Minstens één geldige factuurregel is verplicht"
    ),
  
  dueDays: z.number()
    .min(0, "Vervaldagen moet positief zijn")
    .optional()
    .default(30),
  
  note: z.string().optional().nullable(),
  currency: z.string().optional().default("EUR"),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]).optional().default("SENT"),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

/**
 * Helper function to format validation errors for API responses
 */
export function formatValidationErrors(error: z.ZodError): string {
  // ZodError uses 'issues' property, not 'errors'
  if (!error.issues || !Array.isArray(error.issues)) {
    return "Validatiefout";
  }
  return error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join("; ");
}

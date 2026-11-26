<h1 align="center">FPFiller</h1>
<p align="center">
  <b>Invoicing web app for Belgian freelancers & small businesses</b><br/>
  Manage clients, build invoices with automatic VAT, and export legally compliant PDFs — with a built-in pricing assistant.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/tested%20with-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white" />
</p>

<p align="center"><a href="README.md">Nederlandse versie</a></p>

---

## Why

Freelancers lose time — and make costly mistakes — writing invoices by hand. FPFiller answers one question:

> *How can a simple digital application streamline invoicing for self-employed professionals while reducing the risk of errors?*

## Features

- **Client management** — store name, email, address and Belgian VAT number, validated on input.
- **Invoice builder** — line items with live subtotal, VAT and total calculation.
- **Invoice lifecycle** — draft → sent → paid → overdue.
- **Compliant PDF export** — every legally required field for Belgian invoices (number, date, VAT ID, payment terms).
- **Pricing intelligence** — detects the type of IT service from a short description and suggests a market-based rate range.
- **Pricing tools** — simulate, compare and reuse pricing templates, with history.

## Tech stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Frontend and API routes in one codebase |
| Language | TypeScript 5 | Type safety end-to-end |
| UI | React 19 + Tailwind CSS 4 | Reusable components, fast consistent styling |
| Data | Prisma 6 + SQLite | Type-safe queries, zero-setup database |
| Validation | Zod 4 | Rejects bad emails and VAT numbers before they hit the DB |
| PDF | pdf-lib | Full control over invoice layout |
| Testing | Vitest 4 | Fast unit tests for core business logic |

## Architecture

A layered design keeps each responsibility isolated — API routes never touch the database directly.

```
Presentation   →  React pages & components        (app/, components/)
      │
API            →  Next.js route handlers           (app/api/*)        – validate input with Zod
      │
Repository     →  clientRepository, invoiceRepository (lib/repositories/)
      │
ORM / DB       →  Prisma Client → SQLite           (prisma/schema.prisma)
```

**Creating an invoice, end to end**

1. The user fills in `InvoiceForm`; amounts update in real time.
2. The form posts to `app/api/invoices/route.ts`.
3. Input is validated against the Zod schemas in `lib/validation.ts`.
4. `invoiceRepository` persists the invoice and its line items through Prisma.
5. `app/api/invoices/[id]/pdf/route.ts` renders the PDF with pdf-lib.

### Data model

- **Client** → has many **Invoices**
- **Invoice** → has many **InvoiceItems** (description, quantity, unit price), plus number, date, status and VAT rate
- **MarketData / ServiceCategory** → reference data used by the pricing assistant

### Key modules

| File | Responsibility |
|---|---|
| `lib/calc.ts` | Computes subtotal, VAT and total **in cents** to avoid floating-point rounding errors |
| `lib/validation.ts` | Zod schemas for email and Belgian VAT numbers (`BE0xxxxxxxxx`) |
| `lib/repositories/` | Repository pattern — all database access in one place |
| `lib/ai.ts` | Keyword-based service detection and rate suggestions |
| `lib/pricing/` | Pricing calculator, templates, currency and PDF helpers |

## Getting started

```bash
git clone https://github.com/oiseaubleuc/FPFiller.git
cd FPFiller
npm install
npx prisma migrate dev   # create the SQLite database
npm run dev              # http://localhost:3000
```

## Tests

Business-critical logic (calculations and validation) is covered by unit tests.

```bash
npm test          # watch mode
npm run test:run  # single run
```

## AI assistance

Parts of this codebase were developed with AI support (ChatGPT for structure and technical feedback, Cursor for improvements such as validation, tests and the repository pattern). Every choice was reviewed, understood, tested and adapted by me.

---

<p align="center">Built by <a href="https://github.com/oiseaubleuc">Hoho</a> · Belgium</p>

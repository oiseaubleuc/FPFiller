# FPFiller

**Auteur:** Houdaifa Hamouchi · Erasmus Hogeschool Brussel · Vak: Future Portfolio (PRG2)

## Onderzoeksvraag

> Hoe kan een eenvoudige digitale applicatie het facturatieproces van zelfstandigen vereenvoudigen en tegelijk de kans op fouten verkleinen?

FPFiller is een webapplicatie voor digitale facturatie, gericht op kleine zelfstandigen en IT-freelancers. De app laat toe om klanten te beheren, facturen op te stellen met automatische btw-berekening en deze te exporteren naar een professionele PDF die voldoet aan de Belgische wettelijke vereisten. Als lichte AI-assistent bevat de app een module die tariefsuggesties geeft.

## Technologiestack

| Onderdeel | Technologie | Waarom deze keuze |
|---|---|---|
| Framework | Next.js 15 (App Router) | Frontend én backend in één systeem (API-routes + pagina's) |
| Taal | TypeScript 5 | Typeveiligheid, minder fouten tijdens het ontwikkelen |
| UI-bibliotheek | React 19 | Component-gebaseerde, herbruikbare interface |
| Styling | Tailwind CSS 4 | Snel een consistente, moderne layout bouwen |
| Database & ORM | Prisma 6 met SQLite | Typeveilige data-toegang, eenvoudig op te zetten voor een prototype |
| Validatie | Zod 4 | Invoer valideren vóór opslag (e-mail, btw-nummer) |
| PDF-generatie | pdf-lib | Volledige controle over de opmaak van de factuur-PDF |
| Testing | Vitest 4 | Snelle unit tests voor de kernlogica |

## Architectuur en opbouw

De applicatie is opgebouwd in duidelijke lagen, zodat elke verantwoordelijkheid gescheiden blijft:

```
Presentatielaag   → React-componenten + pagina's (app/, components/)
        │
API-laag          → Next.js route handlers (app/api/*)  — ontvangen requests, valideren invoer
        │
Repository-laag   → lib/repositories/*  — kapselen alle databasetoegang in (repository-pattern)
        │
ORM / Database    → Prisma Client (lib/prisma.ts) → SQLite (prisma/schema.prisma)
```

Deze gelaagde opbouw is een bewuste designkeuze: de API-routes weten niets van de database zelf, ze praten enkel met de repositories. Daardoor is de code makkelijker te onderhouden en te testen.

### Voorbeeld van de dataflow (een factuur aanmaken)

1. De gebruiker vult het factuurformulier in (`components/InvoiceForm.tsx`), waar de bedragen in real-time worden berekend.
2. Bij verzenden gaat een request naar `app/api/invoices/route.ts`.
3. Die route valideert de invoer met de Zod-schema's uit `lib/validation.ts`.
4. Na validatie roept de route de `invoiceRepository` aan om de factuur (met haar regels) op te slaan via Prisma.
5. De PDF kan nadien gegenereerd worden via `app/api/invoices/[id]/pdf/route.ts` (pdf-lib).


## Datamodellen (Prisma)

- **Client** — een klant van de zelfstandige: naam, e-mailadres, adres en btw-nummer.
- **Invoice** — een factuur, gekoppeld aan een Client: factuurnummer, datum, status (concept, verzonden, betaald, vervallen) en btw-percentage.
- **InvoiceItem** — een factuurregel, gekoppeld aan een Invoice: omschrijving, aantal en eenheidsprijs.
- **MarketData / ServiceCategory** — referentiegegevens die de AI-module gebruikt om een tariefsuggestie te bepalen.

Relaties: één Client heeft meerdere Invoices; één Invoice heeft meerdere InvoiceItems.

## Belangrijkste functies en objecten

- **`lib/calc.ts`** — `toCents(items, vatPercent)` berekent subtotaal, btw en totaal in centen (om afrondingsfouten met floats te vermijden); `euro(cents)` formatteert naar een leesbaar bedrag. Getest in `lib/calc.test.ts`.
- **`lib/validation.ts`** — Zod-schema's die e-mailadressen en Belgische btw-nummers (formaat `BE0xxxxxxxxx`) valideren vóór ze in de database komen. Getest in `lib/validation.test.ts`.
- **`lib/repositories/`** — `clientRepository.ts` en `invoiceRepository.ts` kapselen alle databasetoegang in volgens het **repository-pattern**, zodat de API-routes losgekoppeld zijn van Prisma.
- **`lib/ai.ts`** — de lichte AI-module (Pricing Intelligence): herkent sleutelwoorden en stelt op basis van marktdata een tariefrange voor.
- **PDF-generatie** — `app/api/invoices/[id]/pdf/route.ts` bouwt met pdf-lib een factuur-PDF met alle wettelijk verplichte velden (factuurnummer, datum, btw-nummer, betalingsvoorwaarden).

### Nota over de routing (meerdere `page.tsx`)

In de Next.js App Router hoort **elke route een eigen `page.tsx`-bestand** te hebben binnen zijn map (`app/invoices/page.tsx`, `app/invoices/new/page.tsx`, …). Meerdere bestanden met de naam `page.tsx` is dus geen fout, maar de standaardconventie van het framework.

## Installatie en gebruik

```bash
npm install            # dependencies installeren
npx prisma migrate dev # database opzetten
npm run dev            # ontwikkelserver → http://localhost:3000
```

## Testing

Het project bevat unit tests (Vitest) voor de berekeningen en de validatie.

```bash
npm test         # tests in watch-modus
npm run test:run # tests één keer uitvoeren
```

## Gebruikte libraries en frameworks

Next.js, React, TypeScript, Tailwind CSS, Prisma, SQLite, Zod, pdf-lib, Vitest, ESLint. De volledige bronnenlijst met documentatie staat in [`docs/BRONNEN.md`](docs/BRONNEN.md).

## AI-ondersteuning

Delen van deze codebase zijn tot stand gekomen met AI-ondersteuning (ChatGPT voor tekststructuur en technische feedback; Cursor voor code-verbeteringen zoals validatie, tests, het repository-pattern en documentatie). Alle keuzes zijn door mij begrepen, nagekeken, getest en waar nodig aangepast. AI is gebruikt als hulpmiddel, niet als vervanging van mijn eigen werk.

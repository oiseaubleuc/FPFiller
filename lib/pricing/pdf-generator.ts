/**
 * PDF Generator for Pricing Simulations
 * Generates professional PDF reports
 */

export interface PDFData {
  domain: string;
  serviceType: string;
  hours: number;
  experienceLevel: string;
  result: {
    laborCost: number;
    materialCost: number;
    overheadCost: number;
    subtotal: number;
    vat: number;
    total: number;
    hourlyRate: number;
    effectiveHourlyRate: number;
    marketMin?: number;
    marketMax?: number;
    marketAvg?: number;
  };
  timestamp: string;
}

export function generatePDFContent(data: PDFData): string {
  const formatEuro = (amount: number) =>
    new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount);

  const date = new Date(data.timestamp).toLocaleDateString('nl-BE');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #f97316;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { 
      color: #f97316;
      font-size: 32px;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 20px;
      color: #333;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      border-left: 3px solid #f97316;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .amount {
      text-align: right;
      font-weight: 600;
    }
    .total-row {
      font-size: 18px;
      background: #fef3c7;
      border-top: 2px solid #f59e0b;
    }
    .total-row td {
      padding: 15px 12px;
      font-weight: 700;
      color: #92400e;
    }
    .market-box {
      background: #eff6ff;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
    }
    .market-title {
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .market-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }
    .market-item {
      text-align: center;
    }
    .market-label {
      font-size: 11px;
      color: #6b7280;
      margin-bottom: 3px;
    }
    .market-value {
      font-size: 15px;
      font-weight: 600;
      color: #1e40af;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #9ca3af;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Prijssimulatie Rapport</h1>
    <div class="subtitle">Gegenereerd op ${date}</div>
  </div>

  <div class="section">
    <h2 class="section-title">Project Details</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Domein</div>
        <div class="info-value">${data.domain.replace('_', ' ')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Service Type</div>
        <div class="info-value">${data.serviceType}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Aantal Uren</div>
        <div class="info-value">${data.hours} uur</div>
      </div>
      <div class="info-item">
        <div class="info-label">Ervaring Niveau</div>
        <div class="info-value">${data.experienceLevel}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Prijsberekening</h2>
    <table>
      <thead>
        <tr>
          <th>Omschrijving</th>
          <th class="amount">Bedrag</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Arbeidskosten (${data.result.hourlyRate} €/u × ${data.hours}u)</td>
          <td class="amount">${formatEuro(data.result.laborCost)}</td>
        </tr>
        ${data.result.materialCost > 0 ? `
        <tr>
          <td>Materiaalkosten</td>
          <td class="amount">${formatEuro(data.result.materialCost)}</td>
        </tr>
        ` : ''}
        ${data.result.overheadCost > 0 ? `
        <tr>
          <td>Overhead</td>
          <td class="amount">${formatEuro(data.result.overheadCost)}</td>
        </tr>
        ` : ''}
        <tr>
          <td><strong>Subtotaal</strong></td>
          <td class="amount"><strong>${formatEuro(data.result.subtotal)}</strong></td>
        </tr>
        <tr>
          <td>BTW (21%)</td>
          <td class="amount">${formatEuro(data.result.vat)}</td>
        </tr>
        <tr class="total-row">
          <td>TOTAAL</td>
          <td class="amount">${formatEuro(data.result.total)}</td>
        </tr>
      </tbody>
    </table>

    <div class="info-grid" style="margin-top: 20px;">
      <div class="info-item">
        <div class="info-label">Basis Uurtarief</div>
        <div class="info-value">${formatEuro(data.result.hourlyRate)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Effectief Uurtarief</div>
        <div class="info-value">${formatEuro(data.result.effectiveHourlyRate)}</div>
      </div>
    </div>
  </div>

  ${data.result.marketAvg ? `
  <div class="section">
    <h2 class="section-title">Marktvergelijking</h2>
    <div class="market-box">
      <div class="market-title">Marktprijzen voor vergelijkbare diensten</div>
      <div class="market-grid">
        <div class="market-item">
          <div class="market-label">Minimum</div>
          <div class="market-value">${formatEuro(data.result.marketMin || 0)}</div>
        </div>
        <div class="market-item">
          <div class="market-label">Gemiddelde</div>
          <div class="market-value">${formatEuro(data.result.marketAvg)}</div>
        </div>
        <div class="market-item">
          <div class="market-label">Maximum</div>
          <div class="market-value">${formatEuro(data.result.marketMax || 0)}</div>
        </div>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    Dit is een automatisch gegenereerd rapport van de Multi-Domain Pricing Simulator.<br>
    Voor meer informatie, bezoek uw pricing dashboard.
  </div>
</body>
</html>
  `.trim();
}

export async function downloadPDF(data: PDFData, filename: string = 'pricing-report.pdf') {
  const htmlContent = generatePDFContent(data);
  
  // Create a blob with the HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace('.pdf', '.html'); // Download as HTML for now
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

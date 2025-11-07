import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import prisma from "@/lib/prisma";
import { euro } from "@/lib/calc";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id);

    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid invoice ID" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true, items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const black = rgb(0, 0, 0);
    const darkGray = rgb(0.2, 0.2, 0.2);
    const lightGray = rgb(0.9, 0.9, 0.9);
    const orange = rgb(1, 0.5, 0);
    const headerGray = rgb(0.95, 0.95, 0.95);
    const white = rgb(1, 1, 1);

    let yPosition = height - 50;

    page.drawRectangle({
      x: 0,
      y: height - 80,
      width: width,
      height: 80,
      color: headerGray,
    });

    page.drawRectangle({
      x: 50,
      y: height - 60,
      width: 30,
      height: 30,
      color: orange,
    });

    page.drawText("E-Facturation", {
      x: 90,
      y: height - 45,
      size: 18,
      font: boldFont,
      color: black,
    });

    page.drawText("Professionele Facturering", {
      x: 90,
      y: height - 60,
      size: 10,
      font: font,
      color: darkGray,
    });

    page.drawText("FACTUUR", {
      x: 450,
      y: height - 45,
      size: 32,
      font: boldFont,
      color: black,
    });

    yPosition = height - 120;

    const invoiceDetails = [
      { label: "Factuurnummer:", value: invoice.number, x: 50 },
      { label: "Datum:", value: new Date(invoice.date).toLocaleDateString('nl-BE'), x: 300 },
      { label: "Vervaldatum:", value: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('nl-BE') : "N/A", x: 50 },
      { label: "Status:", value: getStatusText(invoice.status), x: 300 }
    ];

    invoiceDetails.forEach((detail, index) => {
      const currentY = yPosition - (Math.floor(index / 2) * 20);
      const currentX = detail.x;

      page.drawText(detail.label, {
        x: currentX,
        y: currentY,
        size: 10,
        font: boldFont,
        color: darkGray,
      });

      page.drawText(detail.value, {
        x: currentX + 80,
        y: currentY,
        size: 10,
        font: font,
        color: black,
      });
    });

    yPosition -= 60;

    page.drawText("Factuur voor:", {
      x: 50,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: black,
    });

    yPosition -= 25;

    const clientInfo = [];

    if (invoice.client.company) {
      clientInfo.push({ text: invoice.client.company, bold: true });
    } else {
      const fullName = [invoice.client.firstName, invoice.client.lastName].filter(Boolean).join(' ');
      clientInfo.push({ text: fullName || invoice.client.name, bold: true });
    }

    if (invoice.client.address) {
      clientInfo.push({ text: invoice.client.address });
    }

    if (invoice.client.city || invoice.client.postalCode) {
      const cityLine = [invoice.client.postalCode, invoice.client.city].filter(Boolean).join(' ');
      clientInfo.push({ text: cityLine });
    }

    if (invoice.client.email) {
      clientInfo.push({ text: `E-mail: ${invoice.client.email}` });
    }
    if (invoice.client.phone) {
      clientInfo.push({ text: `Tel: ${invoice.client.phone}` });
    }
    if (invoice.client.vat) {
      clientInfo.push({ text: `BTW: ${invoice.client.vat}` });
    }

    const boxHeight = Math.max(60, clientInfo.length * 15 + 20);

    page.drawRectangle({
      x: 45,
      y: yPosition - boxHeight + 10,
      width: 300,
      height: boxHeight,
      borderColor: lightGray,
      borderWidth: 1,
    });

    clientInfo.forEach((info, index) => {
      page.drawText(info.text, {
        x: 50,
        y: yPosition - (index * 15),
        size: info.bold ? 12 : 10,
        font: info.bold ? boldFont : font,
        color: info.bold ? black : darkGray,
      });
    });

    yPosition -= boxHeight + 20;

    const tableStartY = yPosition;
    const tableWidth = width - 100;
    const colWidths = [250, 80, 80, 80, 80];

    page.drawRectangle({
      x: 50,
      y: yPosition - 25,
      width: tableWidth,
      height: 30,
      color: orange,
    });

    const headers = ["Omschrijving", "Aantal", "Prijs", "BTW", "Totaal"];
    let headerXPos = 50;

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: headerXPos + 8,
        y: yPosition - 15,
        size: 11,
        font: boldFont,
        color: white,
      });
      headerXPos += colWidths[index];
    });

    yPosition -= 40;

    invoice.items.forEach((item, index) => {
      const lineTotal = item.lineTotalCents;
      const vatAmount = Math.round(lineTotal * (invoice.vatRateBps / 10000));
      const itemSubtotal = lineTotal - vatAmount;

      if (index % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: yPosition - 18,
          width: tableWidth,
          height: 22,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      page.drawText(item.description, {
        x: 55,
        y: yPosition - 8,
        size: 10,
        font: font,
        color: black,
      });

      page.drawText(item.quantity.toString(), {
        x: 310,
        y: yPosition - 8,
        size: 10,
        font: font,
        color: black,
      });

      page.drawText(`€${euro(item.unitPriceCents)}`, {
        x: 390,
        y: yPosition - 8,
        size: 10,
        font: font,
        color: black,
      });

      page.drawText(`€${euro(vatAmount)}`, {
        x: 470,
        y: yPosition - 8,
        size: 10,
        font: font,
        color: black,
      });

      page.drawText(`€${euro(lineTotal)}`, {
        x: 550,
        y: yPosition - 8,
        size: 10,
        font: boldFont,
        color: black,
      });

      yPosition -= 22;
    });

    yPosition -= 20;

    const totalsStartY = yPosition;
    const totalsWidth = 200;
    const totalsX = width - 50 - totalsWidth;

    page.drawRectangle({
      x: totalsX - 10,
      y: totalsStartY - 60,
      width: totalsWidth + 20,
      height: 70,
      color: headerGray,
      borderColor: lightGray,
      borderWidth: 1,
    });

    page.drawText("Subtotaal:", {
      x: totalsX,
      y: yPosition,
      size: 11,
      font: font,
      color: darkGray,
    });
    page.drawText(`€${euro(invoice.subtotalCents)}`, {
      x: totalsX + 100,
      y: yPosition,
      size: 11,
      font: font,
      color: black,
    });

    yPosition -= 18;

    page.drawText(`BTW (${(invoice.vatRateBps / 100).toFixed(1)}%):`, {
      x: totalsX,
      y: yPosition,
      size: 11,
      font: font,
      color: darkGray,
    });
    page.drawText(`€${euro(invoice.vatCents)}`, {
      x: totalsX + 100,
      y: yPosition,
      size: 11,
      font: font,
      color: black,
    });

    yPosition -= 25;

    page.drawText("TOTAAL:", {
      x: totalsX,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: black,
    });
    page.drawText(`€${euro(invoice.totalCents)}`, {
      x: totalsX + 100,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: orange,
    });

    yPosition -= 60;

    if (invoice.note) {
      page.drawText("Opmerkingen:", {
        x: 50,
        y: yPosition,
        size: 11,
        font: boldFont,
        color: black,
      });
      yPosition -= 15;

      const words = invoice.note.split(' ');
      let line = '';
      const maxWidth = width - 100;

      words.forEach(word => {
        const testLine = line + word + ' ';
        const textWidth = font.widthOfTextAtSize(testLine, 9);

        if (textWidth > maxWidth && line !== '') {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 9,
            font: font,
            color: black,
          });
          yPosition -= 12;
          line = word + ' ';
        } else {
          line = testLine;
        }
      });

      if (line) {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 9,
          font: font,
          color: black,
        });
        yPosition -= 20;
      }
    }

    const footerY = 80;

    page.drawText("Betalingsvoorwaarden: 30 dagen na factuurdatum", {
      x: 50,
      y: footerY,
      size: 10,
      font: font,
      color: darkGray,
    });

    page.drawText("Kleine onderneming – vrijgesteld van btw (art. 56bis, §1, 1° W.BTW)", {
      x: 50,
      y: footerY - 15,
      size: 8,
      font: font,
      color: darkGray,
    });

    page.drawText("Pagina 1 van 1", {
      x: width - 100,
      y: 30,
      size: 8,
      font: font,
      color: darkGray,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="factuur-${invoice.number}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case "DRAFT": return "Concept";
    case "SENT": return "Verzonden";
    case "PAID": return "Betaald";
    case "OVERDUE": return "Vervallen";
    default: return status;
  }
}
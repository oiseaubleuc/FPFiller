interface InvoiceTotalsProps {
  subtotal: number;
  vatPercent: number;
  vatAmount: number;
  total: number;
}

/**
 * InvoiceTotals Component
 * 
 * Verantwoordelijk voor het weergeven van de financiële totalen van de factuur.
 * Toont subtotaal, BTW-bedrag en eindtotaal in een duidelijke layout.
 */
export default function InvoiceTotals({ subtotal, vatPercent, vatAmount, total }: InvoiceTotalsProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 shadow-lg">
      <div className="max-w-md ml-auto space-y-6">
        <div className="flex justify-between items-center py-3">
          <span className="text-white font-bold text-lg">Subtotaal:</span>
          <span className="text-2xl font-bold text-white">€{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-white font-bold text-lg">BTW ({vatPercent}%):</span>
          <span className="text-2xl font-bold text-white">€{vatAmount.toFixed(2)}</span>
        </div>
        <div className="border-t-2 border-gray-700 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold text-orange-500">Totaal:</span>
            <span className="text-4xl font-bold text-orange-500">€{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

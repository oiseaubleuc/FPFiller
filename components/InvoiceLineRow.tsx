"use client";

interface InvoiceItem {
  description: string;
  qty: number;
  unitPriceEuro: number;
}

interface InvoiceLineRowProps {
  item: InvoiceItem;
  index: number;
  canRemove: boolean;
  onUpdate: (field: keyof InvoiceItem, value: string | number) => void;
  onRemove: () => void;
  onGenerateDescription?: () => void;
}

/**
 * InvoiceLineRow Component
 * 
 * Verantwoordelijk voor het weergeven en bewerken van één enkele factuurregel.
 * Bevat velden voor omschrijving, aantal, eenheidsprijs en totaal.
 * Ondersteunt AI-functies voor beschrijving en prijssuggestie.
 */
export default function InvoiceLineRow({
  item,
  index,
  canRemove,
  onUpdate,
  onRemove,
  onGenerateDescription,
}: InvoiceLineRowProps) {
  const lineTotal = item.qty * item.unitPriceEuro;

  return (
    <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <label className="block text-sm font-bold text-white uppercase tracking-wider">
              Omschrijving
            </label>
            <div className="group relative">
              <svg className="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="text-white text-xs leading-relaxed">
                  <div className="font-bold text-orange-400 mb-2">Tip</div>
                  <p className="text-gray-300">
                    Het systeem analyseert automatisch je omschrijving en kan op basis daarvan de juiste marktprijs bepalen.
                    Typ bijvoorbeeld "React development" of "DevOps setup" en het systeem herkent het type IT-dienst en geeft
                    een prijsadvies gebaseerd op Belgische marktdata.
                  </p>
                  <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400 text-xs">
                    Gebruik de generate button voor automatische prijssuggestie
                  </div>
                </div>
                <div className="absolute bottom-0 left-4 transform translate-y-full">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={item.description}
              onChange={(e) => onUpdate("description", e.target.value)}
              className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
              placeholder="bijv. React development, API integratie, DevOps setup..."
            />
            {onGenerateDescription && (
              <button
                type="button"
                onClick={onGenerateDescription}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap"
                title="AI beschrijving genereren"
              >
                ✨ AI
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Aantal
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={item.qty}
            onChange={(e) => onUpdate("qty", parseFloat(e.target.value) || 0)}
            className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
            Eenheidsprijs
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 font-bold">€</span>
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.unitPriceEuro}
              onChange={(e) => onUpdate("unitPriceEuro", parseFloat(e.target.value) || 0)}
              className="w-full pl-10 pr-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="bg-gray-800 px-6 py-4 rounded-lg border border-gray-700 min-w-[120px]">
            <div className="text-xl font-bold text-white text-right">
              €{lineTotal.toFixed(2)}
            </div>
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="ml-4 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-300"
              title="Verwijder regel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

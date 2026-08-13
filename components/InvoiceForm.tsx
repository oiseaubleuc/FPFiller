"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateInvoiceDescription } from "@/lib/ai";
import ClientSelector from "./ClientSelector";
import InvoiceLineRow from "./InvoiceLineRow";
import InvoiceTotals from "./InvoiceTotals";

type InvoiceItem = {
  description: string;
  qty: number;
  unitPriceEuro: number;
};

interface InvoiceFormProps {
  invoice?: any;
}

export default function InvoiceForm({ invoice }: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [clientData, setClientData] = useState({
    name: invoice?.client?.name || "",
    firstName: invoice?.client?.firstName || "",
    lastName: invoice?.client?.lastName || "",
    company: invoice?.client?.company || "",
    email: invoice?.client?.email || "",
    phone: invoice?.client?.phone || "",
    address: invoice?.client?.address || "",
    city: invoice?.client?.city || "",
    postalCode: invoice?.client?.postalCode || "",
    vat: invoice?.client?.vat || "",
  });
  
  const [vatPercent, setVatPercent] = useState(invoice ? invoice.vatRateBps / 100 : 21);
  const [dueDays, setDueDays] = useState(invoice?.dueDate ? Math.ceil((new Date(invoice.dueDate).getTime() - new Date(invoice.date).getTime()) / (1000 * 60 * 60 * 24)) : 30);
  const [note, setNote] = useState(invoice?.note || "");
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items?.length > 0
      ? invoice.items.map((item: any) => ({
          description: item.description,
          qty: item.quantity,
          unitPriceEuro: item.unitPriceCents / 100,
        }))
      : [{ description: "", qty: 1, unitPriceEuro: 0 }]
  );

  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    async function fetchClients() {
      try {
        const res = await fetch("/api/clients");
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    }
    fetchClients();
  }, []);

  const handleClientChange = (updates: Partial<typeof clientData>) => {
    setClientData(prev => ({ ...prev, ...updates }));
  };

  const generateAIDescription = async (index: number) => {
    const item = items[index];
    if (!item.description.trim()) return;

    try {
      const suggestion = await generateInvoiceDescription(
        item.description,
        item.qty
      );

      const newItems = [...items];
      newItems[index] = { ...newItems[index], description: suggestion.description };
      setItems(newItems);
    } catch (error) {
      console.error('Description generation failed:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { description: "", qty: 1, unitPriceEuro: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitPriceEuro), 0);
  const vatAmount = subtotal * (vatPercent / 100);
  const total = subtotal + vatAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = invoice ? `/api/invoices/${invoice.id}` : "/api/invoices";
      const method = invoice ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientData.name,
          clientFirstName: clientData.firstName || null,
          clientLastName: clientData.lastName || null,
          clientCompany: clientData.company || null,
          clientEmail: clientData.email || null,
          clientPhone: clientData.phone || null,
          clientAddress: clientData.address || null,
          clientCity: clientData.city || null,
          clientPostalCode: clientData.postalCode || null,
          clientVat: clientData.vat || null,
          vatPercent,
          dueDays,
          note: note || null,
          items: items.filter(item => item.description.trim() && item.qty > 0)
        }),
      });

      if (res.ok) {
        const result = await res.json();
        router.push(`/invoices?${invoice ? 'updated' : 'created'}=${result.number}`);
      } else {
        const error = await res.json();
        alert(`Fout bij opslaan: ${error.error}`);
      }
    } catch (error) {
      alert("Er is een fout opgetreden bij het opslaan van de factuur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-orange-500 mb-4">
            {invoice ? `Factuur bewerken: ${invoice.number}` : "Nieuwe factuur"}
          </h1>
          <p className="text-xl text-white">
            {invoice ? "Bewerk de factuurgegevens" : "Maak een nieuwe factuur aan voor uw klant"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Client Information */}
          <ClientSelector
            clientData={clientData}
            onClientChange={handleClientChange}
            clients={clients}
          />

          {/* Invoice Settings */}
          <div className="bg-black border border-gray-800 rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center mr-6">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Factuurinstellingen</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  BTW-percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={vatPercent}
                    onChange={(e) => setVatPercent(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm font-bold">%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Betaaltermijn (dagen)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={dueDays}
                    onChange={(e) => setDueDays(Number(e.target.value))}
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm font-bold">dagen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-black border border-gray-800 rounded-lg p-8 shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center mr-6">
                  <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white">Factuurregels</h2>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Regel toevoegen
              </button>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <InvoiceLineRow
                  key={index}
                  item={item}
                  index={index}
                  canRemove={items.length > 1}
                  onUpdate={(field, value) => updateItem(index, field, value)}
                  onRemove={() => removeItem(index)}
                  onGenerateDescription={() => generateAIDescription(index)}
                />
              ))}
            </div>
          </div>

          {/* Totals */}
          <InvoiceTotals
            subtotal={subtotal}
            vatPercent={vatPercent}
            vatAmount={vatAmount}
            total={total}
          />

          {/* Notes */}
          <div className="bg-black border border-gray-800 rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center mr-6">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Opmerkingen</h2>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400 resize-none"
              placeholder="Eventuele opmerkingen of betalingsvoorwaarden..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-6 pt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-10 py-4 border-2 border-gray-700 rounded-lg text-white hover:bg-gray-800 hover:border-gray-600 font-bold transition-all duration-300"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !clientData.name.trim() || items.every(item => !item.description.trim())}
              className="px-10 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg font-bold transition-all duration-300 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-4 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Opslaan...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {invoice ? "Factuur bijwerken" : "Factuur aanmaken"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
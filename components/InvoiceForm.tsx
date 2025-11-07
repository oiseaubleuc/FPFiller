"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { euro } from "@/lib/calc";
import { generateInvoiceDescription, suggestPricing, categorizeExpense } from "@/lib/ai";
import PricingIntelligence from "./PricingIntelligence";

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
  const [clientName, setClientName] = useState(invoice?.client?.name || "");
  const [clientFirstName, setClientFirstName] = useState(invoice?.client?.firstName || "");
  const [clientLastName, setClientLastName] = useState(invoice?.client?.lastName || "");
  const [clientCompany, setClientCompany] = useState(invoice?.client?.company || "");
  const [clientEmail, setClientEmail] = useState(invoice?.client?.email || "");
  const [clientPhone, setClientPhone] = useState(invoice?.client?.phone || "");
  const [clientAddress, setClientAddress] = useState(invoice?.client?.address || "");
  const [clientCity, setClientCity] = useState(invoice?.client?.city || "");
  const [clientPostalCode, setClientPostalCode] = useState(invoice?.client?.postalCode || "");
  const [clientVat, setClientVat] = useState(invoice?.client?.vat || "");
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
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.client-dropdown-container')) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClientSelect = (client: any) => {
    setSelectedClientId(client.id);
    setClientName(client.name);
    setClientFirstName(client.firstName || "");
    setClientLastName(client.lastName || "");
    setClientCompany(client.company || "");
    setClientEmail(client.email || "");
    setClientPhone(client.phone || "");
    setClientAddress(client.address || "");
    setClientCity(client.city || "");
    setClientPostalCode(client.postalCode || "");
    setClientVat(client.vat || "");
    setShowClientDropdown(false);
    setClientSearchTerm("");
  };

  const handleClientNameChange = (value: string) => {
    setClientName(value);
    setClientSearchTerm(value);
    setShowClientDropdown(value.length > 0);
    setSelectedClientId("");
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

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
      console.error('AI suggestion failed:', error);
    }
  };

  const suggestPrice = async (index: number) => {
    const item = items[index];
    if (!item.description.trim()) return;

    try {
      const suggestedPrice = await suggestPricing(
        item.description,
        item.qty,
        [] // Could pass client history here
      );

      const newItems = [...items];
      newItems[index] = { ...newItems[index], unitPriceEuro: suggestedPrice / item.qty };
      setItems(newItems);
    } catch (error) {
      console.error('Price suggestion failed:', error);
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
          clientName,
          clientFirstName: clientFirstName || null,
          clientLastName: clientLastName || null,
          clientCompany: clientCompany || null,
          clientEmail: clientEmail || null,
          clientPhone: clientPhone || null,
          clientAddress: clientAddress || null,
          clientCity: clientCity || null,
          clientPostalCode: clientPostalCode || null,
          clientVat: clientVat || null,
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
          <div className="bg-black border border-gray-800 rounded-lg p-8 shadow-lg">
            <div className="flex items-center mb-8">
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center mr-6">
                <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Klantgegevens</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Klantnaam *
                </label>
                <div className="relative client-dropdown-container">
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => handleClientNameChange(e.target.value)}
                    onFocus={() => setShowClientDropdown(clientName.length > 0)}
                    className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="Zoek of voer klantnaam in"
                  />
                  {showClientDropdown && filteredClients.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                          className="px-6 py-3 hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                        >
                          <div className="text-white font-medium">{client.name}</div>
                          <div className="text-gray-400 text-sm space-y-1">
                            {client.company && <div>Bedrijf: {client.company}</div>}
                            {client.email && <div>E-mail: {client.email}</div>}
                            {client.phone && <div>Tel: {client.phone}</div>}
                            {client.city && <div>Stad: {client.city}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Voornaam
                </label>
                <input
                  type="text"
                  value={clientFirstName}
                  onChange={(e) => setClientFirstName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Voornaam"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Achternaam
                </label>
                <input
                  type="text"
                  value={clientLastName}
                  onChange={(e) => setClientLastName(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Achternaam"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Bedrijf
                </label>
                <input
                  type="text"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Bedrijfsnaam (optioneel)"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  E-mail
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="klant@voorbeeld.be"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Telefoon
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="+32 123 456 789"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Adres
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Straat en huisnummer"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Stad
                </label>
                <input
                  type="text"
                  value={clientCity}
                  onChange={(e) => setClientCity(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Stad"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  Postcode
                </label>
                <input
                  type="text"
                  value={clientPostalCode}
                  onChange={(e) => setClientPostalCode(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                  BTW-nummer
                </label>
                <input
                  type="text"
                  value={clientVat}
                  onChange={(e) => setClientVat(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="BE0123456789"
                />
              </div>
            </div>
          </div>

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

            {/* Pricing Intelligence for first item */}
            {items.length > 0 && items[0].description && items[0].unitPriceEuro > 0 && (
              <div className="mb-8">
                <PricingIntelligence
                  service={items[0].description}
                  currentRate={items[0].unitPriceEuro}
                  onRecommendation={(rate) => {
                    const newItems = [...items];
                    newItems[0] = { ...newItems[0], unitPriceEuro: rate };
                    setItems(newItems);
                  }}
                />
              </div>
            )}

            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={index} className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
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
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
                          placeholder="bijv. React development, API integratie, DevOps setup..."
                        />
                        <button
                          type="button"
                          onClick={() => generateAIDescription(index)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                          title="AI suggestie voor omschrijving"
                        >
                          ai generate
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                        Aantal uren
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.qty}
                        onChange={(e) => updateItem(index, "qty", Number(e.target.value))}
                        className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white mb-4 uppercase tracking-wider">
                        Prijs (€)
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPriceEuro}
                            onChange={(e) => updateItem(index, "unitPriceEuro", Number(e.target.value))}
                            className="w-full px-6 py-4 pr-12 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white"
                          />
                          <div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-sm font-bold">€</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => suggestPrice(index)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
                          title="AI suggestie voor prijs"
                        >
                          ai generate
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="bg-gray-800 px-6 py-4 rounded-lg border border-gray-700 min-w-[120px]">
                        <div className="text-xl font-bold text-white text-right">
                          €{(item.qty * item.unitPriceEuro).toFixed(2)}
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
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
              ))}
            </div>
          </div>

          {/* Totals */}
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
              disabled={isSubmitting || !clientName.trim() || items.every(item => !item.description.trim())}
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
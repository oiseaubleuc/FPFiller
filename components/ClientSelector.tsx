"use client";
import { useState, useEffect } from "react";

interface ClientData {
  id?: number;
  name: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  vat?: string;
}

interface ClientSelectorProps {
  clientData: ClientData;
  onClientChange: (data: Partial<ClientData>) => void;
  clients: any[];
}

/**
 * ClientSelector Component
 * 
 * Verantwoordelijk voor het selecteren en beheren van klantgegevens.
 * Biedt autocomplete functionaliteit voor bestaande klanten en
 * formuliervelden voor alle klantinformatie.
 */
export default function ClientSelector({ clientData, onClientChange, clients }: ClientSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.client-dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClientSelect = (client: any) => {
    onClientChange({
      name: client.name,
      firstName: client.firstName || "",
      lastName: client.lastName || "",
      company: client.company || "",
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      city: client.city || "",
      postalCode: client.postalCode || "",
      vat: client.vat || "",
    });
    setShowDropdown(false);
    setSearchTerm("");
  };

  const handleNameChange = (value: string) => {
    onClientChange({ name: value });
    setSearchTerm(value);
    setShowDropdown(value.length > 0);
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
              value={clientData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => setShowDropdown(clientData.name.length > 0)}
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
              placeholder="Zoek of voer klantnaam in"
            />
            {showDropdown && filteredClients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className="px-6 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
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
            value={clientData.firstName || ""}
            onChange={(e) => onClientChange({ firstName: e.target.value })}
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
            value={clientData.lastName || ""}
            onChange={(e) => onClientChange({ lastName: e.target.value })}
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
            value={clientData.company || ""}
            onChange={(e) => onClientChange({ company: e.target.value })}
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
            value={clientData.email || ""}
            onChange={(e) => onClientChange({ email: e.target.value })}
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
            value={clientData.phone || ""}
            onChange={(e) => onClientChange({ phone: e.target.value })}
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
            value={clientData.address || ""}
            onChange={(e) => onClientChange({ address: e.target.value })}
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
            value={clientData.city || ""}
            onChange={(e) => onClientChange({ city: e.target.value })}
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
            value={clientData.postalCode || ""}
            onChange={(e) => onClientChange({ postalCode: e.target.value })}
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
            value={clientData.vat || ""}
            onChange={(e) => onClientChange({ vat: e.target.value })}
            className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-white placeholder-gray-400"
            placeholder="BE0123456789"
          />
        </div>
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { euro } from "@/lib/calc";
import { useState, useEffect } from "react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateStatus = async (invoiceId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Refresh invoices list
        const updatedRes = await fetch("/api/invoices");
        if (updatedRes.ok) {
          const data = await updatedRes.json();
          setInvoices(data);
        }
      } else {
        alert("Fout bij bijwerken van status");
      }
    } catch (error) {
      alert("Er is een fout opgetreden");
    }
  };

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch("/api/invoices");
        if (res.ok) {
          const data = await res.json();
          setInvoices(data);
        }
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-800 text-gray-300";
      case "SENT": return "bg-blue-900 text-blue-300";
      case "PAID": return "bg-green-900 text-green-300";
      case "OVERDUE": return "bg-red-900 text-red-300";
      default: return "bg-gray-800 text-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT": return "Concept";
      case "SENT": return "Verzonden";
      case "PAID": return "Betaald";
      case "OVERDUE": return "Vervallen";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-black min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-orange-500">Facturen</h1>
          <Link
            href="/invoices/new"
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Nieuwe factuur
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="text-white text-lg">Laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-orange-500">Facturen</h1>
        <Link
          href="/invoices/new"
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Nieuwe factuur
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">Nog geen facturen aangemaakt</div>
          <Link
            href="/invoices/new"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-block"
          >
            Eerste factuur maken
          </Link>
        </div>
      ) : (
        <div className="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Factuurnummer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Klant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Vervaldatum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Totaal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-black divide-y divide-gray-800">
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {invoice.number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{invoice.client?.name}</div>
                      {invoice.client?.email && (
                        <div className="text-sm text-gray-400">{invoice.client.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(invoice.date).toLocaleDateString('nl-BE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {invoice.dueDate
                        ? new Date(invoice.dueDate).toLocaleDateString('nl-BE')
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      €{euro(invoice.totalCents)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={`/api/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-400 mr-4"
                      >
                        PDF
                      </a>
                      <Link
                        href={`/invoices/${invoice.id}/edit`}
                        className="text-gray-400 hover:text-white mr-4"
                      >
                        Bewerken
                      </Link>
                      {invoice.status !== "PAID" && (
                        <button
                          onClick={() => updateStatus(invoice.id, "PAID")}
                          className="text-green-400 hover:text-green-300 mr-2"
                          title="Markeer als betaald"
                        >
                          ✓ Betaald
                        </button>
                      )}
                      {invoice.status !== "OVERDUE" && invoice.status !== "PAID" && (
                        <button
                          onClick={() => updateStatus(invoice.id, "OVERDUE")}
                          className="text-red-400 hover:text-red-300"
                          title="Markeer als vervallen"
                        >
                          Vervallen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary statistics */}
      {invoices.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black p-4 rounded-lg shadow-lg border border-gray-800">
            <div className="text-sm font-medium text-gray-400">Totaal facturen</div>
            <div className="text-2xl font-bold text-white">{invoices.length}</div>
          </div>
          <div className="bg-black p-4 rounded-lg shadow-lg border border-gray-800">
            <div className="text-sm font-medium text-gray-400">Totaal bedrag</div>
            <div className="text-2xl font-bold text-white">
              €{euro(invoices.reduce((sum: number, inv: any) => sum + inv.totalCents, 0))}
            </div>
          </div>
          <div className="bg-black p-4 rounded-lg shadow-lg border border-gray-800">
            <div className="text-sm font-medium text-gray-400">Openstaand</div>
            <div className="text-2xl font-bold text-orange-400">
              €{euro(invoices
                .filter((inv: any) => inv.status === 'SENT' || inv.status === 'OVERDUE')
                .reduce((sum: number, inv: any) => sum + inv.totalCents, 0)
              )}
            </div>
          </div>
          <div className="bg-black p-4 rounded-lg shadow-lg border border-gray-800">
            <div className="text-sm font-medium text-gray-400">Betaald</div>
            <div className="text-2xl font-bold text-green-400">
              €{euro(invoices
                .filter((inv: any) => inv.status === 'PAID')
                .reduce((sum: number, inv: any) => sum + inv.totalCents, 0)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

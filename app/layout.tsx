import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Facturation - Digitale Facturering",
  description: "Eenvoudige digitale facturering voor Belgische freelancers en zelfstandigen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black min-h-screen`}
      >
        <nav className="bg-black shadow-lg border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-white">
                    E-Facturation
                  </span>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/invoices"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Facturen
                </a>
                <a
                  href="/invoices/new"
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Nieuwe factuur
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

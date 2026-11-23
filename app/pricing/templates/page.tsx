'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectTemplates, getAllCategories } from '@/lib/pricing/templates';

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...getAllCategories()];

  const filteredTemplates = projectTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const useTemplate = (templateId: string) => {
    const template = projectTemplates.find(t => t.id === templateId);
    if (template) {
      // Store template data in localStorage
      localStorage.setItem('pricing_template', JSON.stringify(template));
      // Redirect to pricing page
      router.push('/pricing');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
            Project Templates
          </h1>
          <p className="text-xl text-gray-300">
            Start snel met vooraf geconfigureerde project templates
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zoeken
              </label>
              <input
                type="text"
                placeholder="Zoek op naam of beschrijving..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Alle Categorieën</option>
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} gevonden
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500/50 transition-all"
            >
              {/* Icon & Category */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{template.icon}</span>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                  {template.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>

              {/* Description */}
              <p className="text-sm text-gray-400 mb-4">{template.description}</p>

              {/* Stats */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Uren</span>
                  <span className="font-medium">{template.hours}u</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Ervaring</span>
                  <span className="font-medium">{template.experienceLevel}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Domein</span>
                  <span className="font-medium">{template.domain.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Estimated Value */}
              <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-400 mb-1">Geschatte waarde</div>
                <div className="text-lg font-bold text-green-400">
                  {template.estimatedValue}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => useTemplate(template.id)}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                Gebruik Template
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Geen templates gevonden</h3>
            <p className="text-gray-400">Probeer een andere zoekterm of categorie</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">💡 Hoe werken templates?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <div className="font-bold text-white mb-2">1. Selecteer</div>
              <p>Kies een template die past bij jouw project type</p>
            </div>
            <div>
              <div className="font-bold text-white mb-2">2. Pas aan</div>
              <p>Template wordt ingeladen in de pricing simulator</p>
            </div>
            <div>
              <div className="font-bold text-white mb-2">3. Verfijn</div>
              <p>Pas parameters aan naar jouw specifieke situatie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

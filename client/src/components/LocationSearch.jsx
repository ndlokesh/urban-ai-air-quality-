import React, { useState, useEffect, useRef } from 'react';
import { Search, Navigation, SlidersHorizontal, Loader2, MapPin } from 'lucide-react';
import { searchLocations } from '../services/api';
import { translations } from '../utils/translations';
import ManualAQIModal from './ManualAQIModal';

export default function LocationSearch({ onSelectLocation, onManualSubmit, isLoading, language }) {
  const t = translations[language] || translations.en;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [geoLocating, setGeoLocating] = useState(false);
  const wrapperRef = useRef(null);

  // Debounced geocoding search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const locations = await searchLocations(query);
        setResults(locations);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);\n  }, []);

  const handleSelect = (loc) => {
    setQuery(loc.displayName || loc.name);
    setIsOpen(false);
    onSelectLocation(loc.latitude, loc.longitude, loc.displayName || loc.name);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }\n\n    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        const { latitude, longitude } = pos.coords;
        onSelectLocation(latitude, longitude, 'Detected Location');
      },
      (err) => {
        setGeoLocating(false);
        console.warn('Geolocation denied or failed:', err);
        alert('Could not retrieve your location. Please type your city or use manual entry.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input with autocomplete */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 text-sm font-medium shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            aria-label="Search city location"
          />

          {/* Autocomplete Dropdown */}
          {isOpen && results.length > 0 && (
            <ul
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-72 overflow-y-auto"
              role="listbox"
            >
              {results.map((loc, idx) => (
                <li
                  key={loc.id || idx}
                  onClick={() => handleSelect(loc)}
                  className="px-4 py-3 hover:bg-emerald-50 cursor-pointer flex items-center space-x-3 transition text-sm text-slate-700"
                  role="option"
                  aria-selected={false}
                >
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-slate-900">{loc.name}</span>
                    {loc.admin1 && <span className="text-slate-500">, {loc.admin1}</span>}
                    {loc.country && <span className="text-slate-400 text-xs block">{loc.country}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Action Buttons: "Use My Location" + "Manual Fallback" */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUseLocation}
            disabled={geoLocating || isLoading}
            type="button"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-sm border border-emerald-200 shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
            aria-label="Use current GPS location"
          >
            {geoLocating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 text-emerald-600" />
            )}
            <span className="whitespace-nowrap">{t.useLocation}</span>
          </button>

          <button
            onClick={() => setShowManualModal(true)}
            type="button"
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition active:scale-95 cursor-pointer"
            title={t.manualEntry}
            aria-label="Open manual AQI entry dialog"
          >
            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Manual AQI Fallback Modal */}
      <ManualAQIModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSubmit={onManualSubmit}
        language={language}
      />
    </div>
  );
}

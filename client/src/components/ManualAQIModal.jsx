import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { translations } from '../utils/translations';

export default function ManualAQIModal({ isOpen, onClose, onSubmit, language }) {
  if (!isOpen) return null;

  const t = translations[language] || translations.en;
  const [aqiVal, setAqiVal] = useState(185);
  const [cityName, setCityName] = useState('Custom Smog Testing Area');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(Number(aqiVal), cityName);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 id="modal-title" className="text-lg font-bold text-slate-900">
              {t.manualModalTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2 mb-4">
          {t.manualModalDesc}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              {t.cityNameLabel}
            </label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-800"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                {t.aqiInputLabel}
              </label>
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                AQI {aqiVal}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="450"
              step="5"
              value={aqiVal}
              onChange={(e) => setAqiVal(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-medium">
              <span>0 (Good)</span>
              <span>100 (Mod)</span>
              <span>200 (Unhealthy)</span>
              <span>300+ (Hazardous)</span>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div>
            <span className="text-xs text-slate-500 font-medium block mb-1.5">Presets:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAqiVal(42)}
                className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              >
                Clean Day (42)
              </button>
              <button
                type="button"
                onClick={() => setAqiVal(165)}
                className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100"
              >
                Winter Smog (165)
              </button>
              <button
                type="button"
                onClick={() => setAqiVal(340)}
                className="text-xs font-semibold py-1.5 px-2 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
              >
                Severe Crisis (340)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              {t.closeBtn}
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.applyBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

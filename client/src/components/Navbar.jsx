import React from 'react';
import { Wind, Sparkles, Globe2, ShieldCheck } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Navbar({ language, onToggleLanguage, aqiBand }) {
  const t = translations[language] || translations.en;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Wind className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Clean<span className="text-emerald-600">Breath</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                  Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Right Controls: Live status indicator & Language switch */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {aqiBand && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: aqiBand.color }}
                />
                <span>{language === 'hi' ? aqiBand.hindiLabel : aqiBand.label}</span>
              </div>
            )}

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              type="button"
              aria-label="Toggle language between English and Hindi"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer focus:ring-2 focus:ring-emerald-500"
            >
              <Globe2 className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

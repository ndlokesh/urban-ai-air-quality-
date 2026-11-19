import React from 'react';
import {
  Users,
  Car,
  Home,
  Flame,
  Wallet,
  Baby,
  HeartPulse,
  PawPrint,
  Sparkles,
  Check
} from 'lucide-react';
import { translations } from '../utils/translations';

export default function LifestyleForm({
  profile,
  onChange,
  onGeneratePlan,
  isGenerating,
  language
}) {
  const t = translations[language] || translations.en;

  const toggleHousehold = (key) => {
    onChange({ ...profile, [key]: !profile[key] });
  };

  const setCommute = (mode) => {
    onChange({ ...profile, commuteMode: mode });
  };

  const setHomeType = (type) => {
    onChange({ ...profile, homeType: type });
  };

  const toggleHomeFeature = (key) => {
    onChange({ ...profile, [key]: !profile[key] });
  };

  const setCookingFuel = (fuel) => {
    onChange({ ...profile, cookingFuel: fuel });
  };

  const setBudget = (budget) => {
    onChange({ ...profile, budgetLevel: budget });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {t.profileTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {t.profileSubtitle}
          </p>
        </div>
        <span className="hidden sm:inline-block text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          ⚡ 30s Quick Setup
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Household Members */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{t.householdLabel}</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => toggleHousehold('hasChildren')}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                profile.hasChildren
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs sm:text-sm">{t.children}</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  profile.hasChildren ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {profile.hasChildren && <Check className="w-3 h-3" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleHousehold('hasElderly')}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                profile.hasElderly
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs sm:text-sm">{t.elderly}</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  profile.hasElderly ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {profile.hasElderly && <Check className="w-3 h-3" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleHousehold('hasAsthma')}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer col-span-2 ${
                profile.hasAsthma
                  ? 'bg-rose-50 border-rose-400 text-rose-950 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HeartPulse className={`w-4 h-4 ${profile.hasAsthma ? 'text-rose-600' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm">{t.asthma}</span>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  profile.hasAsthma ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-300'
                }`}
              >
                {profile.hasAsthma && <Check className="w-3 h-3" />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleHousehold('hasPets')}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer col-span-2 ${
                profile.hasPets
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <PawPrint className={`w-4 h-4 ${profile.hasPets ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="text-xs sm:text-sm">{t.pets}</span>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  profile.hasPets ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {profile.hasPets && <Check className="w-3 h-3" />}
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Commute Mode */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Car className="w-4 h-4 text-emerald-600" />
            <span>{t.commuteLabel}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'car', label: t.commuteCar },
              { id: 'two-wheeler', label: t.commuteTwoWheeler },
              { id: 'public transit', label: t.commuteTransit },
              { id: 'walk/cycle', label: t.commuteActive },
              { id: 'work from home', label: t.commuteWfh }
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCommute(item.id)}
                className={`p-3 rounded-2xl border text-center text-xs font-semibold transition cursor-pointer ${
                  profile.commuteMode === item.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Home & Features */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Home className="w-4 h-4 text-emerald-600" />
            <span>{t.homeLabel}</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setHomeType('apartment')}
              className={`p-3 rounded-2xl border text-center text-xs font-semibold transition cursor-pointer ${
                profile.homeType === 'apartment'
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.homeApartment}
            </button>
            <button
              type="button"
              onClick={() => setHomeType('house')}
              className={`p-3 rounded-2xl border text-center text-xs font-semibold transition cursor-pointer ${
                profile.homeType === 'house'
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.homeHouse}
            </button>
            <button
              type="button"
              onClick={() => toggleHomeFeature('hasPurifier')}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                profile.hasPurifier
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs">{t.hasPurifier}</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  profile.hasPurifier ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {profile.hasPurifier && <Check className="w-3 h-3" />}
              </div>
            </button>
            <button
              type="button"
              onClick={() => toggleHomeFeature('windowsSeal')}
              className={`p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                profile.windowsSeal
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xs">{t.windowsSeal}</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                  profile.windowsSeal ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {profile.windowsSeal && <Check className="w-3 h-3" />}
              </div>
            </button>
          </div>
        </div>

        {/* Section 4: Cooking Fuel & Budget */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5 mb-2">
              <Flame className="w-4 h-4 text-emerald-600" />
              <span>{t.fuelLabel}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gas', label: t.fuelGas },
                { id: 'induction', label: t.fuelInduction },
                { id: 'biomass', label: t.fuelBiomass }
              ].map((fuel) => (
                <button
                  key={fuel.id}
                  type="button"
                  onClick={() => setCookingFuel(fuel.id)}
                  className={`p-2.5 rounded-2xl border text-center text-xs font-semibold transition cursor-pointer ${
                    profile.cookingFuel === fuel.id
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {fuel.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5 mb-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>{t.budgetLabel}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'low', label: t.budgetLow },
                { id: 'medium', label: t.budgetMed },
                { id: 'high', label: t.budgetHigh }
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBudget(tier.id)}
                  className={`p-2.5 rounded-2xl border text-center text-xs font-semibold transition cursor-pointer ${
                    profile.budgetLevel === tier.id
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-2">
        <button
          onClick={onGeneratePlan}
          disabled={isGenerating}
          type="button"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 transition transform active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
          <span>{isGenerating ? t.regeneratingBtn : t.generatePlanBtn}</span>
        </button>
      </div>
    </div>
  );
}

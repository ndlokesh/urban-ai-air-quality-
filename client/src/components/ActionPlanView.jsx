import React, { useState } from 'react';
import {
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Zap,
  Info,
  DollarSign,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { translations } from '../utils/translations';

export default function ActionPlanView({ plan, language }) {
  if (!plan) return null;

  const t = translations[language] || translations.en;
  const [activeTab, setActiveTab] = useState('risk');

  const risk = plan.riskSummary || {};
  const routine = plan.dailyRoutine || [];
  const hacks = plan.iaqHacks || [];
  const swaps = plan.sustainableAlternatives || [];
  const explainer = plan.impactExplainer || [];

  const tabs = [
    { id: 'risk', label: t.tabRisk, icon: AlertCircle },
    { id: 'routine', label: t.tabRoutine, icon: Clock },
    { id: 'hacks', label: t.tabHacks, icon: Sparkles },
    { id: 'swaps', label: t.tabSwaps, icon: RefreshCw },
    { id: 'impact', label: t.tabImpact, icon: Zap }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-6">
      {/* Header with Model attribution badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>CleanBreath AI Action Plan</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Personalized mitigation and routines grounded in real-time AQI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {plan.isAiGenerated ? '✨ Gemini 2.5 Flash' : '⚙️ Calibrated Science Model'}
          </span>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex overflow-x-auto no-scrollbar p-1.5 bg-slate-100 rounded-2xl gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Today's Risk Summary */}
      {activeTab === 'risk' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <h3 className="text-base font-bold text-amber-950 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span>{risk.headline}</span>
            </h3>
            <p className="text-sm text-amber-900 leading-relaxed font-medium">
              {risk.details}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-rose-800">
              Household Vulnerability Assessment
            </h4>
            <p className="text-sm text-rose-950 leading-relaxed font-medium">
              {risk.vulnerableImpact}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Low-Emission Daily Routine */}
      {activeTab === 'routine' && (
        <div className="space-y-3 animate-in fade-in duration-300">
          <p className="text-xs text-slate-500 font-medium mb-3">
            Time-blocked routine engineered around diurnal atmospheric boundary layer shifts:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {routine.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                    {item.timeBlock}
                  </span>
                  <span
                    className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      item.exposureRisk === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : item.exposureRisk === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Risk: {item.exposureRisk}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{item.activity}</div>
                <div className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-800">Action: </span>
                  {item.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Indoor Air Quality Hacks */}
      {activeTab === 'hacks' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <p className="text-xs text-slate-500 font-medium">
            Prioritized by practical cost-effectiveness and scientifically validated filtration:
          </p>
          <div className="space-y-3">
            {hacks.map((hack, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {hack.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Cost: {hack.cost}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Effectiveness: {hack.effectiveness}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {hack.description}
                </p>

                {hack.mythVsFact && (
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
                    <span className="font-bold flex items-center space-x-1 text-amber-800">
                      <Info className="w-3.5 h-3.5" />
                      <span>Science Fact Check</span>
                    </span>
                    <p className="leading-relaxed">{hack.mythVsFact}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Sustainable Alternatives */}
      {activeTab === 'swaps' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <p className="text-xs text-slate-500 font-medium">
            Actionable swaps that eliminate neighborhood emissions and reduce personal pollution load:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {swaps.map((swap, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {swap.category}
                  </span>
                  <div className="text-xs text-slate-500 line-through">
                    {swap.standardChoice}
                  </div>
                  <div className="text-sm font-bold text-emerald-950 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{swap.cleanSwap}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-800">Practical Tip: </span>
                  {swap.practicalTip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Impact Explainer */}
      {activeTab === 'impact' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium">
            <span className="font-bold">Transparent Engineering Models: </span>
            {t.assumptionsNotice}
          </div>

          <div className="space-y-3">
            {explainer.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    {item.actionTitle}
                  </h4>
                  <div className="flex items-center space-x-3 text-xs font-bold">
                    {item.co2AvoidedGrams > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 flex items-center space-x-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>~{item.co2AvoidedGrams}g CO₂ Saved</span>
                      </span>
                    )}
                    {item.pm25ExposureReductionPct > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>~{item.pm25ExposureReductionPct}% PM2.5 Exposure Cut</span>
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-800">Why it works: </span>
                  {item.whyItWorks}
                </p>

                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                  <span className="font-semibold text-slate-700 not-italic">Assumptions used: </span>
                  {item.assumptions}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

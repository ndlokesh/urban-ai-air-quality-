import React from 'react';
import { CheckCircle2, Shield, Leaf, Activity, Sparkles, Award } from 'lucide-react';
import { translations } from '../utils/translations';

export default function ImpactTracker({
  completedActions = [],
  onToggleAction,
  ambientAqi = 150,
  language
}) {
  const t = translations[language] || translations.en;

  // Curated daily actionable items mapped to the mitigation strategy
  const actionableItems = [
    {
      id: 'n95_commute',
      title: 'Wore sealed N95 / FFP2 mask during commute',
      category: 'Protection',
      co2Avoided: 0,
      exposureReductionPct: 90,
      points: 15
    },
    {
      id: 'metro_swap',
      title: 'Swapped private car/bike ride to Metro / Bus',
      category: 'Emissions',
      co2Avoided: 1400,
      exposureReductionPct: 75,
      points: 20
    },
    {
      id: 'closed_windows_morning',
      title: 'Kept windows sealed during morning smog (7-10 AM)',
      category: 'Indoor IAQ',
      co2Avoided: 0,
      exposureReductionPct: 45,
      points: 12
    },
    {
      id: 'midday_airing',
      title: 'Timed ventilation strictly between 12 PM - 3 PM',
      category: 'Indoor IAQ',
      co2Avoided: 0,
      exposureReductionPct: 35,
      points: 10
    },
    {
      id: 'wet_mopping',
      title: 'Wet-mopped floors with microfiber (no dry sweeping)',
      category: 'Indoor IAQ',
      co2Avoided: 0,
      exposureReductionPct: 55,
      points: 12
    },
    {
      id: 'run_purifier_bedroom',
      title: 'Operated HEPA or DIY box filter in closed bedroom',
      category: 'Protection',
      co2Avoided: 0,
      exposureReductionPct: 75,
      points: 15
    },
    {
      id: 'clean_cooking',
      title: 'Cooked with lids on / induction and exhaust fan on',
      category: 'Indoor IAQ',
      co2Avoided: 250,
      exposureReductionPct: 80,
      points: 16
    }
  ];

  // Dynamic calculations
  let totalPoints = 0;
  let totalCo2AvoidedGrams = 0;
  let exposureReductions = [];

  actionableItems.forEach((item) => {
    if (completedActions.includes(item.id)) {
      totalPoints += item.points;
      totalCo2AvoidedGrams += item.co2Avoided;
      if (item.exposureReductionPct > 0) {
        exposureReductions.push(item.exposureReductionPct);
      }
    }
  });

  // Clean Air Score formula: base drops with high AQI, rises with actions
  const aqiPenalty = Math.min(45, Math.round((Number(ambientAqi) || 100) * 0.12));
  const baseScore = Math.max(25, 80 - aqiPenalty);
  const cleanAirScore = Math.min(100, baseScore + Math.round(totalPoints * 0.45));

  const avgExposureReducedPct =
    exposureReductions.length > 0
      ? Math.round(
          exposureReductions.reduce((a, b) => a + b, 0) / exposureReductions.length
        )
      : 0;

  const co2Display =
    totalCo2AvoidedGrams >= 1000
      ? `${(totalCo2AvoidedGrams / 1000).toFixed(2)} kg`
      : `${totalCo2AvoidedGrams} g`;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.trackerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t.trackerSubtitle}
            </p>
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl w-fit">
          {completedActions.length} of {actionableItems.length} actions completed
        </div>
      </div>

      {/* Metrics Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Clean Air Score */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-100">
            <span>{t.cleanAirScore}</span>
            <Shield className="w-4 h-4 text-emerald-200" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl sm:text-4xl font-black">{cleanAirScore}</span>
            <span className="text-sm opacity-80">/ 100</span>
          </div>
          <p className="text-[11px] text-emerald-100">
            {cleanAirScore >= 80 ? '🌟 Outstanding personal protection' : cleanAirScore >= 55 ? '👍 Good progress, keep it up' : '⚠️ Take more actions to mitigate exposure'}
          </p>
        </div>

        {/* Metric 2: Avoided Emissions */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>{t.emissionsSaved}</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {co2Display}
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Emissions eliminated today via clean travel & clean cooking
          </p>
        </div>

        {/* Metric 3: Exposure Reduction */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>{t.exposureReduced}</span>
            <Activity className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ~{avgExposureReducedPct}%
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Average reduction in inhaled fine particulates (PM2.5)
          </p>
        </div>
      </div>

      {/* Interactive Action Checklist */}
      <div className="space-y-2.5">
        {actionableItems.map((item) => {
          const isDone = completedActions.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => onToggleAction(item.id)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
              }`}
              role="checkbox"
              aria-checked={isDone}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  onToggleAction(item.id);
                }
              }}
            >
              <div className="flex items-center space-x-3.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition border ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-slate-50 text-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 fill-white text-emerald-600" />
                </div>
                <div>
                  <div className={`text-xs sm:text-sm font-semibold ${isDone ? 'line-through opacity-75' : ''}`}>
                    {item.title}
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="font-bold text-emerald-700">+{item.points} pts</span>
                    {item.co2Avoided > 0 && <span>• {item.co2Avoided}g CO₂ avoided</span>}
                    {item.exposureReductionPct > 0 && <span>• ~{item.exposureReductionPct}% cut</span>}
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 hidden sm:inline-block">
                {item.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

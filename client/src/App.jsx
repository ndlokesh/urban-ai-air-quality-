import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AQIHeader from './components/AQIHeader';
import LocationSearch from './components/LocationSearch';
import AQIChart from './components/AQIChart';
import RoomAirSimulator from './components/RoomAirSimulator';
import LifestyleForm from './components/LifestyleForm';
import ActionPlanView from './components/ActionPlanView';
import ImpactTracker from './components/ImpactTracker';
import FollowUpChat from './components/FollowUpChat';
import { PlanSkeleton } from './components/UI/Skeleton';

import { getLiveAQI, submitManualAQI, generatePlan } from './services/api';
import { useLocalStorage } from './hooks/useLocalStorage';
import { translations } from './utils/translations';
import { AlertCircle } from 'lucide-react';

const DEFAULT_PROFILE = {
  hasChildren: true,
  hasElderly: false,
  hasAsthma: true,
  hasPets: false,
  commuteMode: 'car',
  homeType: 'apartment',
  hasPurifier: false,
  windowsSeal: true,
  cookingFuel: 'gas',
  budgetLevel: 'medium'
};

export default function App() {
  const [language, setLanguage] = useLocalStorage('cleanbreath_lang', 'en');
  const [profile, setProfile] = useLocalStorage('cleanbreath_profile', DEFAULT_PROFILE);
  const [completedActions, setCompletedActions] = useLocalStorage('cleanbreath_actions', [
    'midday_airing',
    'wet_mopping'
  ]);

  const [aqiData, setAqiData] = useState(null);
  const [plan, setPlan] = useState(null);
  const [isLoadingAQI, setIsLoadingAQI] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState(null);

  const t = translations[language] || translations.en;

  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    if (aqiData) {
      handleGeneratePlan(aqiData, profile, nextLang);
    }
  };

  useEffect(() => {
    loadLocationAQI(28.65195, 77.23149, 'Delhi, India');
  }, []);

  const loadLocationAQI = async (lat, lon, cityName) => {
    setIsLoadingAQI(true);
    setError(null);
    try {
      const data = await getLiveAQI(lat, lon, cityName);
      setAqiData(data);
      handleGeneratePlan(data, profile, language);
    } catch (err) {
      console.error('Failed to load AQI:', err);
      setError('Unable to fetch live air quality data. You can enter values manually.');
    } finally {
      setIsLoadingAQI(false);
    }
  };

  const handleManualAQISubmit = async (aqiVal, customCity) => {
    setIsLoadingAQI(true);
    setError(null);
    try {
      const data = await submitManualAQI(aqiVal, customCity);
      setAqiData(data);
      handleGeneratePlan(data, profile, language);
    } catch (err) {
      console.error('Manual AQI failed:', err);
      setError('Failed to process manual air quality entry.');
    } finally {
      setIsLoadingAQI(false);
    }
  };

  const handleGeneratePlan = async (currentAqi = aqiData, currentProfile = profile, targetLang = language) => {
    if (!currentAqi) return;
    setIsGeneratingPlan(true);
    try {
      const planData = await generatePlan(currentAqi, currentProfile, targetLang);
      setPlan(planData);
    } catch (err) {
      console.error('Plan generation error:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleToggleAction = (actionId) => {
    setCompletedActions((prev) =>
      prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 font-sans text-slate-800">
      {/* Skip to Main Content for Screen Readers & Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 z-50 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg shadow-lg"
      >
        Skip to main content
      </a>

      {/* Top Navigation */}
      <Navbar
        language={language}
        onToggleLanguage={handleToggleLanguage}
        aqiBand={aqiData?.band}
      />

      {/* Main Content Area */}
      <main
        id="main-content"
        role="main"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8"
        tabIndex={-1}
      >
        {/* Error Notification */}
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between text-sm font-medium"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadLocationAQI(28.65195, 77.23149, 'Delhi, India')}
              className="px-3 py-1 bg-white rounded-lg border border-rose-300 text-rose-900 text-xs font-bold hover:bg-rose-100 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. Location Search & Autocomplete Bar */}
        <section aria-label="Location Search and Geocoding">
          <LocationSearch
            onSelectLocation={loadLocationAQI}
            onManualSubmit={handleManualAQISubmit}
            isLoading={isLoadingAQI}
            language={language}
          />
        </section>

        {/* 2. Color-Coded AQI Severity Header with Audio Voice Advisory */}
        <section aria-label="Current Air Quality Status" aria-live="polite">
          {isLoadingAQI ? (
            <div className="w-full h-48 bg-slate-200 animate-pulse rounded-3xl" />
          ) : (
            <AQIHeader
              aqiData={aqiData}
              profile={profile}
              plan={plan}
              language={language}
            />
          )}
        </section>

        {/* 3. 24-Hour Air Quality Diurnal Trend Chart */}
        <section aria-label="24-Hour Hourly Smog Trend Chart">
          {aqiData?.trend && <AQIChart trendData={aqiData.trend} language={language} />}
        </section>

        {/* 4. Interactive Room Air Simulator & DIY CADR Calculator */}
        <section aria-label="Interactive Room Air Simulator and CADR Calculator">
          <RoomAirSimulator initialAqi={aqiData?.aqi || 180} language={language} />
        </section>

        {/* 5. Lifestyle Profile Form (<30s) */}
        <section aria-label="Household Lifestyle Profile Settings">
          <LifestyleForm
            profile={profile}
            onChange={setProfile}
            onGeneratePlan={() => handleGeneratePlan(aqiData, profile, language)}
            isGenerating={isGeneratingPlan}
            language={language}
          />
        </section>

        {/* 6. AI Action Plan (Gemini 2.5 Flash) */}
        <section aria-label="AI Generated Action Plan and Recommendations">
          {isGeneratingPlan ? (
            <PlanSkeleton />
          ) : (
            <ActionPlanView plan={plan} language={language} />
          )}
        </section>

        {/* 7. Impact Tracker & Clean Air Score */}
        <section aria-label="Daily Clean Air Action Tracker and Score">
          <ImpactTracker
            completedActions={completedActions}
            onToggleAction={handleToggleAction}
            ambientAqi={aqiData?.aqi || 150}
            language={language}
          />
        </section>

        {/* 8. Grounded Conversational Follow-Up */}
        <section aria-label="Conversational AI Assistant and Safety Guardrails">
          <FollowUpChat
            aqiData={aqiData}
            profile={profile}
            previousPlan={plan}
            language={language}
          />
        </section>
      </main>

      {/* Accessible Footer */}
      <footer role="contentinfo" className="mt-12 py-8 bg-white border-t border-slate-200 text-slate-500 text-xs text-center space-y-2">
        <div className="flex items-center justify-center space-x-1 font-semibold text-slate-700">
          <span>CleanBreath</span>
          <span>•</span>
          <span>Google PromptWars Virtual (Challenge 6: Urban Air Quality Assistant)</span>
        </div>
        <p className="max-w-xl mx-auto px-4 text-slate-400">
          Powered by Google Gemini 2.5 Flash and Open-Meteo Air Quality API. Environmental estimates based on IPCC transport emissions and EPA indoor air filtration standards. WCAG 2.1 AA Accessible.
        </p>
      </footer>
    </div>
  );
}

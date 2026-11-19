import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  Info,
  Clock,
  MapPin,
  Gauge,
  Volume2,
  VolumeX,
  Share2,
  SunMedium,
  Sparkles
} from 'lucide-react';
import { translations } from '../utils/translations';
import FamilyShareModal from './FamilyShareModal';

export default function AQIHeader({ aqiData, profile, plan, language }) {
  if (!aqiData) return null;

  const t = translations[language] || translations.en;
  const band = aqiData.band || {};
  const pollutants = aqiData.pollutants || {};
  const isHindi = language === 'hi';

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Stop speech when component unmounts or language changes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  const severityBgMap = {
    GOOD: 'from-emerald-600 via-teal-600 to-emerald-700 text-white',
    MODERATE: 'from-amber-500 via-yellow-500 to-amber-600 text-slate-950',
    SENSITIVE: 'from-orange-500 via-amber-600 to-orange-700 text-white',
    UNHEALTHY: 'from-red-600 via-rose-600 to-red-700 text-white',
    VERY_UNHEALTHY: 'from-purple-700 via-indigo-700 to-purple-900 text-white',
    HAZARDOUS: 'from-rose-950 via-red-950 to-neutral-900 text-white'
  };

  const bgGradient = severityBgMap[band.key] || severityBgMap.UNHEALTHY;

  // Web Speech API Voice Advisory
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const city = aqiData.cityName || 'your city';
    const num = aqiData.aqi || 180;
    const cat = isHindi ? band.hindiLabel : band.label;

    const speechText = isHindi
      ? `नमस्कार! आज ${city} में वायु गुणवत्ता सूचकांक ${num} है, जो ${cat} श्रेणी में आता है। परिवार के बच्चों और सांस के मरीजों के लिए सुबह और शाम बाहरी गतिविधियों से बचें। बाहर निकलते समय N95 मास्क अवश्य लगाएं, और खिड़कियां केवल दोपहर बारह से तीन बजे के बीच ही खोलें।`
      : `Hello! Today's Air Quality Index in ${city} is ${num}, classified as ${cat}. Sensitive family members should avoid outdoor activities during morning and evening smog peaks. Please wear a sealed N95 mask when stepping out, and confine room airing to the 12 to 3 PM afternoon window.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = isHindi ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  return (
    <div
      className={`w-full rounded-3xl bg-gradient-to-br ${bgGradient} p-6 sm:p-8 shadow-xl transition-all duration-500 space-y-5`}
      role="region"
      aria-label="Air Quality Summary"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Location & Primary Value */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm text-xs sm:text-sm font-medium w-fit">
              <MapPin className="w-4 h-4" />
              <span>{aqiData.cityName}</span>
              <span className="opacity-60">•</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{t.lastUpdated}: {new Date(aqiData.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Audio Voice Readout Button */}
            <button
              onClick={handleToggleVoice}
              type="button"
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition active:scale-95 cursor-pointer backdrop-blur-sm border ${
                isPlayingAudio
                  ? 'bg-rose-500/90 text-white border-white/40 animate-pulse'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
              }`}
              title="Voice readout of today's advisory"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isPlayingAudio ? (isHindi ? 'रोकें' : 'Stop Audio') : (isHindi ? 'सलाह सुनें' : 'Listen to Advisory')}</span>
            </button>

            {/* Family WhatsApp Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/20 transition active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'शेयर कार्ड' : 'Share Card'}</span>
            </button>
          </div>

          <div className="flex items-baseline space-x-4">
            <div className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight drop-shadow-sm">
              {aqiData.aqi}
            </div>
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider opacity-85 font-semibold block">
                US AQI
              </span>
              <div className="inline-block px-3 py-1 rounded-lg text-sm sm:text-base font-bold bg-white/20 backdrop-blur-sm border border-white/20">
                {isHindi ? band.hindiLabel : band.label}
              </div>
            </div>
          </div>

          <p className="text-sm sm:text-base font-medium max-w-xl opacity-95 leading-relaxed">
            {band.shortDescription}
          </p>
        </div>

        {/* Right: Dominant Pollutant & Pollutant Concentrations */}
        <div className="flex flex-col space-y-4 lg:items-end">
          {/* Dominant Pollutant Badge */}
          <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 w-fit">
            <Gauge className="w-5 h-5 text-amber-300" />
            <div className="text-left">
              <div className="text-[11px] uppercase tracking-wider opacity-80 font-medium">
                {t.dominantPollutant}
              </div>
              <div className="text-lg font-bold">
                {aqiData.dominantPollutant || 'PM2.5'}
              </div>
            </div>
          </div>

          {/* Sub-Pollutant Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full sm:w-auto">
            <div className="px-3 py-2 rounded-xl bg-black/20 backdrop-blur-sm text-center border border-white/10">
              <div className="text-[11px] opacity-80 font-semibold">PM2.5</div>
              <div className="text-base font-bold">{pollutants.pm2_5 || '--'} <span className="text-[10px] font-normal">µg/m³</span></div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-black/20 backdrop-blur-sm text-center border border-white/10">
              <div className="text-[11px] opacity-80 font-semibold">PM10</div>
              <div className="text-base font-bold">{pollutants.pm10 || '--'} <span className="text-[10px] font-normal">µg/m³</span></div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-black/20 backdrop-blur-sm text-center border border-white/10">
              <div className="text-[11px] opacity-80 font-semibold">NO₂</div>
              <div className="text-base font-bold">{pollutants.nitrogen_dioxide || '--'} <span className="text-[10px] font-normal">µg/m³</span></div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-black/20 backdrop-blur-sm text-center border border-white/10">
              <div className="text-[11px] opacity-80 font-semibold">O₃</div>
              <div className="text-base font-bold">{pollutants.ozone || '--'} <span className="text-[10px] font-normal">µg/m³</span></div>
            </div>
          </div>

          {/* Immediate Action Banner */}
          <div className="text-xs sm:text-sm font-medium bg-black/20 px-3.5 py-2 rounded-xl flex items-center space-x-2 border border-white/10">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{band.actionGuidance}</span>
          </div>
        </div>
      </div>

      {/* Atmospheric Golden Hour Predictor Banner */}
      <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2">
        <div className="flex items-center space-x-2">
          <SunMedium className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-bold">
            {isHindi ? 'स्मॉग राहत का सर्वोत्तम समय:' : 'Safest Outdoor / Airing Window Today:'}
          </span>
          <span className="bg-white/20 px-2 py-0.5 rounded-md font-extrabold tracking-wide">
            12:30 PM - 3:00 PM
          </span>
        </div>
        <span className="text-[11px] opacity-80">
          {isHindi ? 'दोपहर की धूप से ग्राउंड स्मॉग ऊपर उठता है' : 'Thermal inversion boundary layer lifts during midday solar heating'}
        </span>
      </div>

      {/* Share Modal */}
      <FamilyShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        aqiData={aqiData}
        profile={profile}
        plan={plan}
        language={language}
      />
    </div>
  );
}

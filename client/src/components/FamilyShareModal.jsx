import React, { useState } from 'react';
import { X, Share2, Copy, Check, Printer, MessageCircle, AlertTriangle } from 'lucide-react';
import { translations } from '../utils/translations';

export default function FamilyShareModal({ isOpen, onClose, aqiData, profile, plan, language }) {
  if (!isOpen || !aqiData) return null;

  const [copied, setCopied] = useState(false);
  const isHindi = language === 'hi';

  const aqiNum = aqiData.aqi || 180;
  const cityName = aqiData.cityName || 'City';
  const bandLabel = isHindi ? aqiData.band?.hindiLabel : aqiData.band?.label;

  const topActions = [
    isHindi ? 'सुबह 7-10 बजे बाहर जाने से बचें (विंटर स्मॉग इनवर्जन)' : 'Avoid morning outdoor exercise (7:00 AM - 10:00 AM)',
    isHindi ? 'बाहर निकलते समय N95 या FFP2 मास्क अवश्य लगाएं' : 'Wear tightly sealed N95/FFP2 respirator outdoors',
    isHindi ? 'केवल दोपहर 12 से 3 बजे के बीच 15 मिनट वेंटिलेशन करें' : 'Confine room ventilation to 12:00 PM - 3:00 PM only'
  ];

  const shareText = isHindi
    ? `🚨 *पारिवारिक वायु गुणवत्ता अलर्ट - क्लीनब्रीथ*\n\n📍 *स्थान*: ${cityName}\n🌫️ *आज का AQI*: ${aqiNum} (${bandLabel})\n⚠️ *सावधानी स्तर*: ${profile?.hasAsthma || profile?.hasChildren ? 'संवेदनशील परिवार - विशेष सुरक्षा आवश्यक' : 'उच्च प्रदूषण'}\n\n*आज के 3 मुख्य सुरक्षा नियम*:\n1. ${topActions[0]}\n2. ${topActions[1]}\n3. ${topActions[2]}\n\n💡 *क्लीनब्रीथ एआई सलाह*: घर में गीला पोछा लगाएं, खिड़कियां बंद रखें, और बच्चों को आज इनडोर खेल खेलने दें।\n\n_क्लीनब्रीथ (CleanBreath) - गूगल प्रॉम्प्टवॉर्स चैलेंज 6_`
    : `🚨 *CleanBreath Family Air Quality Alert*\n\n📍 *Location*: ${cityName}\n🌫️ *Current AQI*: ${aqiNum} (${bandLabel})\n⚠️ *Vulnerability*: ${profile?.hasAsthma || profile?.hasChildren ? 'High (Children/Sensitive Members Protected)' : 'General Public Alert'}\n\n*Top 3 Actions For Today*:\n1. ${topActions[0]}\n2. ${topActions[1]}\n3. ${topActions[2]}\n\n💡 *Action Plan*: Run purifiers in closed bedrooms and keep window seals tight during peak morning inversion.\n\n_Powered by CleanBreath - Google PromptWars Virtual_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {isHindi ? 'पारिवारिक स्मॉग अलर्ट कार्ड' : 'Share Family Smog Advisory'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3.5 shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
            <span>CleanBreath Advisory</span>
            <span>{cityName}</span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-5xl font-black text-white">{aqiNum}</span>
            <div>
              <span className="text-xs uppercase text-slate-400 font-bold block">US AQI</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500 text-white">
                {bandLabel}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-700">
            <div className="font-bold text-white mb-1">
              {isHindi ? 'आज के 3 जरूरी सुरक्षा नियम:' : "Today's Top 3 Safety Rules:"}
            </div>
            {topActions.map((act, i) => (\n              <div key={i} className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">{i + 1}.</span>
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>{isHindi ? 'कॉपी हो गया!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>{isHindi ? 'व्हाट्सएप पर शेयर' : 'Copy for WhatsApp'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition cursor-pointer border border-slate-200"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{isHindi ? 'प्रिंट करें (Print)' : 'Print / Save PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

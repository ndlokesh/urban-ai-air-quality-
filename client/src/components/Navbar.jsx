import React, { useState } from 'react';
import { Gauge, Sparkles, DollarSign, Clock, ShieldAlert, CheckCircle, HelpCircle } from 'lucide-react';
import { translations } from '../utils/translations';

export default function RoomAirSimulator({ initialAqi = 180, language }) {
  const isHindi = language === 'hi';

  const [roomSizeSqFt, setRoomSizeSqFt] = useState(150); // 150 sq ft (typical 12x12 bedroom)
  const [purifierType, setPurifierType] = useState('diy_box_fan'); // 'none' | 'plants' | 'diy_box_fan' | 'commercial_hepa'

  // Filtration specifications (CADR = Clean Air Delivery Rate in CFM)
  const PURIFIERS = {
    none: {
      name: isHindi ? 'कोई प्यूरीफायर नहीं (केवल बंद कमरे)' : 'No Purifier (Natural Settling Only)',
      cadrCfm: 5,
      costEstimate: isHindi ? '₹0 / $0' : '$0',
      description: isHindi ? 'केवल प्राकृतिक जमाव। कमरे में सूक्ष्म कण घंटों तक हवा में तैरते रहते हैं।' : 'Natural gravitational settling only. PM2.5 remains suspended in air for hours.',
      efficiencyPct: 15,
      badge: 'border-slate-300 bg-slate-50 text-slate-700'
    },
    plants: {
      name: isHindi ? 'केवल इनडोर प्लांट्स (3-4 पौधे)' : 'Houseplants Only (3-4 plants)',
      cadrCfm: 8,
      costEstimate: isHindi ? '₹1,200 / $15' : '$15',
      description: isHindi ? 'वैज्ञानिक वास्तविकता: सामान्य कमरों में पौधों का PM2.5 फिल्ट्रेशन नगण्य (1-2%) होता है।' : 'Scientific Reality: In rooms with normal air exchange, plants remove negligible PM2.5 (<2%).',
      efficiencyPct: 8,
      badge: 'border-amber-300 bg-amber-50 text-amber-900',
      isMyth: true
    },
    diy_box_fan: {
      name: isHindi ? 'किफायती DIY बॉक्स फैन + MERV-13' : 'DIY Box Fan + MERV-13 Filter',
      cadrCfm: 210,
      costEstimate: isHindi ? '₹2,500 / $30' : '$30-$35',
      description: isHindi ? 'UC Davis द्वारा प्रमाणित। एक साधारण 20-इंच बॉक्स फैन और HVAC फिल्टर 70% सूक्ष्म कण हटाते हैं।' : 'Tested by aerosol scientists. A 20-inch box fan + MERV-13 filter scrubs 70%+ of fine particles.',
      efficiencyPct: 72,
      badge: 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold',
      isRecommended: true
    },
    commercial_hepa: {
      name: isHindi ? 'कमर्शियल ट्रू HEPA प्यूरीफायर' : 'Commercial True HEPA Purifier',
      cadrCfm: 280,
      costEstimate: isHindi ? '₹12,000 / $180+' : '$150 - $300',
      description: isHindi ? 'हाई-ग्रेड H13 HEPA फिल्टर। तेज एयर-सर्कुलेशन और 99.97% पार्टिकुलेट ट्रैपिंग।' : 'High-grade H13 HEPA with quiet fan and certified Clean Air Delivery Rate.',
      efficiencyPct: 88,
      badge: 'border-teal-300 bg-teal-50 text-teal-950 font-bold'
    }
  };

  const selectedPurifier = PURIFIERS[purifierType];

  // Mathematical model for indoor particulate clearance:
  // Room Volume = roomSizeSqFt * 8.5 ft ceiling height
  // Air changes per hour (ACH) = (CADR * 60) / Volume
  // Minutes to reach 50% clearance = ln(2) / (ACH / 60)
  const roomVolumeCuFt = roomSizeSqFt * 8.5;
  const ach = (selectedPurifier.cadrCfm * 60) / roomVolumeCuFt;
  const minutesToClean = ach > 0.5 ? Math.max(12, Math.round((Math.log(1 / (1 - selectedPurifier.efficiencyPct / 100)) / (ach / 60)))) : 360;

  // Final estimated indoor AQI
  const startingAqi = Math.max(80, initialAqi);
  const estimatedIndoorAqi = purifierType === 'none'
    ? Math.round(startingAqi * 0.75) // sealed windows alone reduce ~25%
    : purifierType === 'plants'
    ? Math.round(startingAqi * 0.72)
    : Math.max(25, Math.round(startingAqi * (1 - (selectedPurifier.efficiencyPct * 0.9) / 100)));

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {isHindi ? 'कमरे की हवा का सिमुलेटर एवं DIY CADR कैलकुलेटर' : 'Room Air Simulator & DIY CADR Calculator'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {isHindi ? 'देखें कि आपका कमरा कितनी जल्दी साफ हो सकता है' : 'Scientifically simulate how fast your bedroom air cleans with different purifiers'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 w-fit">
          🧪 Aerosol Physics Model
        </span>
      </div>

      {/* Controls: Room Size Slider & Purifier Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Room Size Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isHindi ? 'कमरे का आकार (वर्ग फुट)' : 'Room Floor Area (Square Feet)'}
            </label>
            <span className="text-sm font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              {roomSizeSqFt} sq ft (~{Math.round(Math.sqrt(roomSizeSqFt))}x{Math.round(Math.sqrt(roomSizeSqFt))} ft)
            </span>
          </div>

          <input
            type="range"
            min="80"
            max="450"
            step="10"
            value={roomSizeSqFt}
            onChange={(e) => setRoomSizeSqFt(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Small Room (80 sq ft)</span>
            <span>Standard Bedroom (150 sq ft)</span>
            <span>Living Hall (400 sq ft)</span>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setRoomSizeSqFt(100)}
              className="text-xs font-semibold py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 transition"
            >
              Study (100 sq ft)
            </button>
            <button
              type="button"
              onClick={() => setRoomSizeSqFt(160)}
              className="text-xs font-semibold py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 transition"
            >
              Bedroom (160 sq ft)
            </button>
            <button
              type="button"
              onClick={() => setRoomSizeSqFt(320)}
              className="text-xs font-semibold py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 transition"
            >
              Living (320 sq ft)
            </button>
          </div>
        </div>

        {/* Right: Purifier Option Cards */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            {isHindi ? 'फिल्ट्रेशन विधि चुनें' : 'Select Air Cleaning Method'}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(PURIFIERS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPurifierType(key)}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  purifierType === key
                    ? 'border-teal-500 bg-teal-50/80 shadow-sm ring-1 ring-teal-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    {item.isRecommended && (
                      <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-teal-700 font-semibold mt-1">
                    Cost: {item.costEstimate} • CADR: {item.cadrCfm} CFM
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Result Visualizer */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
              {isHindi ? 'सिमुलेशन परिणाम' : 'Clearance Prediction for'} {selectedPurifier.name}
            </span>
            <div className="text-sm text-slate-300 font-medium">
              {selectedPurifier.description}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Estimated Clean Time</span>
            <div className="text-xl sm:text-2xl font-black text-teal-300 flex items-center sm:justify-end space-x-1">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>{minutesToClean < 120 ? `~${minutesToClean} minutes` : '> 6 hours'}</span>
            </div>
          </div>
        </div>

        {/* Before vs After Gauge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <div className="text-xs text-rose-400 font-bold uppercase">Outdoor Ambient Air</div>
            <div className="text-2xl font-black text-rose-400">AQI {startingAqi}</div>
            <p className="text-[11px] text-slate-400">Unfiltered street-level air entering naturally</p>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-950/70 border border-teal-500/40 space-y-1">
            <div className="text-xs text-teal-300 font-bold uppercase">Projected Indoor Bedroom Air</div>
            <div className="text-2xl font-black text-teal-200">
              AQI {estimatedIndoorAqi}
              <span className="text-xs font-normal text-teal-400 ml-2">
                (-{Math.round(((startingAqi - estimatedIndoorAqi) / startingAqi) * 100)}% pollution)
              </span>
            </div>
            <p className="text-[11px] text-teal-300">
              Clean, filtered sanctuary in {roomSizeSqFt} sq ft enclosed room
            </p>
          </div>
        </div>

        {/* Clearance Efficiency Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Fine Particulate Filtration Efficiency:</span>
            <span className="text-teal-300 font-bold">~{selectedPurifier.efficiencyPct}% removal</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${
                selectedPurifier.efficiencyPct > 60
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : selectedPurifier.efficiencyPct > 20
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${selectedPurifier.efficiencyPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

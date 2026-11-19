import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
let aiClient = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('[Gemini Client Init Warning]:', err.message);
  }
}

/**
 * System prompt establishing persona, constraints, and grounding
 */
const SYSTEM_INSTRUCTION = `
You are "CleanBreath", a practical, empathetic, and scientifically grounded urban air quality advisor.
Your mission is to help families and urban communities navigate severe winter smog and air pollution safely and sustainably.

CRITICAL RULES:
1. STRICT GROUNDING: You MUST strictly ground your evaluation in the EXACT numerical AQI, PM2.5, PM10, NO2, and O3 values provided in the prompt. NEVER invent, alter, or contradict the provided measurements.
2. EPA AQI BANDS:
   - 0-50: Good
   - 51-100: Moderate
   - 101-150: Unhealthy for Sensitive Groups
   - 151-200: Unhealthy
   - 201-300: Very Unhealthy
   - 301+: Hazardous
3. SCIENTIFIC HONESTY & UNCERTAINTY: Be explicit that all emission savings and personal exposure reductions are approximations based on peer-reviewed environmental engineering assumptions. Never guarantee complete immunity from pollution.
4. HOUSEPLANT MYTHBUSTER: Ground indoor plant advice in science (NASA Clean Air Study tested sealed chambers with tiny air exchange; in real-world homes with 0.5-2 air changes per hour, houseplants have negligible PM2.5 filtration impact compared to HEPA/box filters).
5. MEDICAL SAFETY GUARDRAIL: Never diagnose or provide medical treatment plans. If respiratory distress, chest tightness, wheezing, or severe symptoms are mentioned, explicitly advise consulting a licensed physician immediately.
6. TAILORED TO BUDGET: For low budgets, prioritize high-impact frugal hacks (DIY box fan + MERV 13 filters, wet-mopping instead of sweeping, timing windows during afternoon inversion lift).
7. OUTPUT: Must be strictly valid JSON conforming to the requested schema.
`;

/**
 * Action plan JSON schema definition for Gemini
 */
const ACTION_PLAN_SCHEMA = {
  type: "object",
  properties: {
    riskSummary: {
      type: "object",
      properties: {
        headline: { type: "string" },
        details: { type: "string" },
        vulnerableImpact: { type: "string" }
      },
      required: ["headline", "details", "vulnerableImpact"]
    },
    dailyRoutine: {
      type: "array",
      items: {
        type: "object",
        properties: {
          timeBlock: { type: "string" },
          activity: { type: "string" },
          exposureRisk: { type: "string" },
          mitigation: { type: "string" }
        },
        required: ["timeBlock", "activity", "exposureRisk", "mitigation"]
      }
    },
    iaqHacks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          cost: { type: "string" },
          effectiveness: { type: "string" },
          description: { type: "string" },
          mythVsFact: { type: "string" }
        },
        required: ["title", "cost", "effectiveness", "description"]
      }
    },
    sustainableAlternatives: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          standardChoice: { type: "string" },
          cleanSwap: { type: "string" },
          budgetFit: { type: "string" },
          practicalTip: { type: "string" }
        },
        required: ["category", "standardChoice", "cleanSwap", "budgetFit", "practicalTip"]
      }
    },
    impactExplainer: {
      type: "array",
      items: {
        type: "object",
        properties: {
          actionTitle: { type: "string" },
          whyItWorks: { type: "string" },
          co2AvoidedGrams: { type: "number" },
          pm25ExposureReductionPct: { type: "number" },
          assumptions: { type: "string" }
        },
        required: ["actionTitle", "whyItWorks", "co2AvoidedGrams", "pm25ExposureReductionPct", "assumptions"]
      }
    }
  },
  required: ["riskSummary", "dailyRoutine", "iaqHacks", "sustainableAlternatives", "impactExplainer"]
};

/**
 * Generate Action Plan using Gemini 2.5 Flash
 */
export async function generateActionPlan({ aqiData, profile, language = 'en' }) {
  const isHindi = language === 'hi';
  const aqiNum = aqiData.aqi || 180;
  const pm25 = aqiData.pollutants?.pm2_5 || Math.round(aqiNum * 0.75);

  const prompt = `
Generate a comprehensive, personalized air quality action plan for this household.

LIVE AIR QUALITY DATA (GROUNDING SOURCE - DO NOT ALTER):
- Location: ${aqiData.cityName}
- US AQI: ${aqiNum} (${aqiData.band?.label || 'Unhealthy'})
- Dominant Pollutant: ${aqiData.dominantPollutant || 'PM2.5'}
- PM2.5 Concentration: ${pm25} µg/m³
- PM10: ${aqiData.pollutants?.pm10 || 'N/A'} µg/m³
- NO2: ${aqiData.pollutants?.nitrogen_dioxide || 'N/A'} µg/m³

HOUSEHOLD & LIFESTYLE PROFILE:
- Household members: Children: ${profile.hasChildren ? 'Yes' : 'No'}, Elderly: ${profile.hasElderly ? 'Yes' : 'No'}, Respiratory/Asthma: ${profile.hasAsthma ? 'YES (VULNERABLE)' : 'No'}, Pets: ${profile.hasPets ? 'Yes' : 'No'}
- Primary Commute: ${profile.commuteMode}
- Home Living: ${profile.homeType}, Has Air Purifier: ${profile.hasPurifier ? 'Yes' : 'No'}, Windows Seal Well: ${profile.windowsSeal ? 'Yes' : 'No'}, Cooking Fuel: ${profile.cookingFuel}
- Budget Tier: ${profile.budgetLevel}

LANGUAGE REQUIREMENT:
${isHindi ? 'IMPORTANT: Generate all text fields in clear, colloquial Hindi (हिंदी) with Devanagari script.' : 'Generate in clear, accessible English.'}

Provide:
1. Today's Risk Summary: Plain-language explanation of what AQI ${aqiNum} (${pm25} µg/m³ PM2.5) means for this specific household.
2. Low-Emission Daily Routine: Morning, Commute, Midday (afternoon inversion lift), and Evening blocks.
3. Indoor Air Quality Hacks: Ranked by cost and effectiveness. Cover ventilation timing (12-3 PM window), DIY purifier (box fan + MERV 13) if budget is low, cooking ventilation, houseplant myth vs fact, and N95 mask guidance.
4. Sustainable Alternatives: Swaps for commute, cooking, heating, waste burning matching ${profile.budgetLevel} budget.
5. Impact Explainer: For every key recommendation, provide the "why it works", estimated CO2 avoided in grams, estimated personal PM2.5 exposure reduction %, and assumptions used.
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: ACTION_PLAN_SCHEMA,
          temperature: 0.2
        }
      });

      const text = response.text();
      const parsed = JSON.parse(text);
      return { ...parsed, isAiGenerated: true, modelUsed: 'gemini-2.5-flash' };
    } catch (err) {
      console.warn('[Gemini API Call Failed]:', err.message, '- falling back to deterministic engine');
    }
  }

  // Graceful calibrated fallback matching the exact schema and grounding numbers
  return generateCalibratedFallbackPlan(aqiData, profile, isHindi);
}

/**
 * Conversational follow-up assistant grounded in current AQI & profile
 */
export async function answerFollowUpQuestion({ query, aqiData, profile, previousPlan, conversationHistory = [], language = 'en' }) {
  const isHindi = language === 'hi';
  const aqiNum = aqiData.aqi || 180;

  // Medical Safety Check
  const medicalKeywords = ['cough', 'wheez', 'chest pain', 'breathless', 'blood', 'dizzy', 'phlegm', 'fever', 'asthma attack', 'खांसी', 'सांस फूलना', 'दर्द'];
  const userTextLower = query.toLowerCase();
  const hasMedicalConcern = medicalKeywords.some(kw => userTextLower.includes(kw));

  const prompt = `
Context:
- Current Location: ${aqiData.cityName}
- Live US AQI: ${aqiNum} (${aqiData.band?.label || 'Unhealthy'})
- PM2.5: ${aqiData.pollutants?.pm2_5 || Math.round(aqiNum * 0.75)} µg/m³
- Household: Children: ${profile?.hasChildren}, Elderly: ${profile?.hasElderly}, Asthma/Sensitive: ${profile?.hasAsthma}
- Commute: ${profile?.commuteMode}, Budget: ${profile?.budgetLevel}
- Language: ${isHindi ? 'Hindi' : 'English'}

User Question: "${query}"

Safety Reminder:
- If user describes symptoms or medical emergencies, warmly advise contacting a physician or seeking urgent care. Do not diagnose.
- Ground your answer strictly in the current AQI (${aqiNum}).
- Keep response concise, friendly, and practical (2-3 short paragraphs max).
`;

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.3
        }
      });
      return { answer: response.text(), hasMedicalConcern, isAiGenerated: true };
    } catch (err) {
      console.warn('[Gemini Chat Error]:', err.message);
    }
  }

  // Fallback chat responder
  return getFallbackChatResponse(query, aqiData, profile, hasMedicalConcern, isHindi);
}

/**
 * Deterministic, scientifically calibrated fallback generator
 */
function generateCalibratedFallbackPlan(aqiData, profile, isHindi) {
  const aqi = aqiData.aqi || 180;
  const pm25 = aqiData.pollutants?.pm2_5 || Math.round(aqi * 0.75);
  const isHigh = aqi > 150;
  const hasVulnerable = profile.hasChildren || profile.hasElderly || profile.hasAsthma;

  if (isHindi) {
    return {
      isAiGenerated: false,
      modelUsed: 'deterministic-calibrated-engine (Hindi)',
      riskSummary: {
        headline: `वर्तमान एक्यूआई ${aqi} (${aqiData.band?.hindiLabel || 'अस्वस्थ'}) - ${aqiData.cityName}`,
        details: `हवा में PM2.5 की सघनता लगभग ${pm25} µg/m³ है, जो विश्व स्वास्थ्य संगठन (WHO) के सुरक्षित स्तर (15 µg/m³) से कई गुना अधिक है।`,
        vulnerableImpact: hasVulnerable
          ? 'आपके परिवार में बच्चे/बुजुर्ग या सांस के संवेदनशील सदस्य हैं। इस प्रदूषण स्तर पर फेफड़ों में सूजन और जलन का खतरा अधिक है। बाहरी व्यायाम से बचें।'
          : 'स्वस्थ वयस्कों को भी लगातार बाहर रहने पर गले में खराश और आंखों में जलन हो सकती है।'
      },
      dailyRoutine: [
        {
          timeBlock: 'सुबह (6:00 AM - 9:30 AM)',
          activity: 'प्रदूषण का चरम समय (विंटर स्मॉग इनवर्जन)',
          exposureRisk: 'High',
          mitigation: 'खिड़कियां पूरी तरह बंद रखें। सुबह की सैर घर के अंदर योग या हल्के स्ट्रेचिंग से बदलें।'
        },
        {
          timeBlock: 'यात्रा / आवागमन (9:30 AM - 10:30 AM)',
          activity: `${profile.commuteMode} से यात्रा`,
          exposureRisk: profile.commuteMode === 'car' ? 'Moderate' : 'High',
          mitigation: 'अच्छी तरह सील किया हुआ N95 मास्क पहनें। कार में केबिन रीसर्क्युलेशन (AC Recirculation) ऑन रखें।'
        },
        {
          timeBlock: 'दोपहर (12:00 PM - 3:00 PM)',
          activity: 'हवा वेंटिलेशन और खिड़कियां खोलना',
          exposureRisk: 'Low',
          mitigation: 'धूप निकलने पर ग्राउंड इनवर्जन कमजोर होता है। केवल 15-20 मिनट के लिए क्रॉस-वेंटिलेशन करें।'
        },
        {
          timeBlock: 'शाम एवं रात (6:00 PM - 10:00 PM)',
          activity: 'स्मॉग का दोबारा जमाव व भोजन पकाना',
          exposureRisk: 'High',
          mitigation: 'रसोई में एग्जॉस्ट फैन जरूर चलाएं। कम बजट में पंखे के आगे HEPA/MERV 13 फिल्टर लगाकर रूम में चलाएं।'
        }
      ],
      iaqHacks: [
        {
          title: 'दोपहर में समयबद्ध वेंटिलेशन (12 PM - 3 PM)',
          cost: 'Free',
          effectiveness: 'High',
          description: 'सर्दियों में सुबह और देर शाम जमीन के पास जहरीला धुआं जम जाता है। दोपहर में ही ताजी हवा अंदर आने दें।',
          mythVsFact: 'मिथक: दिनभर खिड़कियां बंद रखने से हवा शुद्ध रहती है। तथ्य: CO2 और रसोई के धुएं को निकालने के लिए दोपहर 15 मिनट खिड़की खोलना जरूरी है।'
        },
        {
          title: 'सस्ता DIY बॉक्स फैन + MERV-13 एयर फिल्टर',
          cost: 'Low',
          effectiveness: 'High',
          description: 'एक साधारण 20-इंच बॉक्स फैन के पीछे डक्ट टेप से MERV 13 फिल्टर चिपकाएं। यह महंगे प्यूरीफायर जैसा 70% PM2.5 सोखता है।',
          mythVsFact: 'तथ्य: DIY फिल्टर महंगे ब्रांडेड प्यूरीफायर जितने ही प्रभावी होते हैं।'
        },
        {
          title: 'इंडोर प्लांट्स: मिथक बनाम वैज्ञानिक सच',
          cost: 'Low',
          effectiveness: 'Moderate',
          description: 'पौधे घर को सुंदर बनाते हैं, परंतु PM2.5 को साफ करने के लिए मैकेनिकल फिल्टर की जगह नहीं ले सकते।',
          mythVsFact: 'मिथक: स्नेक प्लांट या मनी प्लांट कमरे का सारा धुआं साफ कर देंगे। तथ्य: नासा का प्रयोग पूरी तरह सील चैंबर में था, सामान्य कमरों में नहीं।'
        },
        {
          title: 'सूखे झाड़ू की जगह गीला पोछा (Wet Mopping)',
          cost: 'Free',
          effectiveness: 'High',
          description: 'सूखा झाड़ू लगाने से जमीन पर जमी सूक्ष्म धूल वापस हवा में उड़ जाती है। माइक्रोफाइबर गीले पोछे का प्रयोग करें।'
        }
      ],
      sustainableAlternatives: [
        {
          category: 'Commute',
          standardChoice: 'अकेले कार या दोपहिया चलाना',
          cleanSwap: 'मेट्रो या शेयर्ड इलेक्ट्रिक बस',
          budgetFit: 'Low to Medium',
          practicalTip: 'सप्ताह में 3 दिन मेट्रो चुनने से प्रति ट्रिप ~1.4 किग्रा CO2 बचती है।'
        },
        {
          category: 'Cooking',
          standardChoice: 'खुली गैस की आंच पर तेज धुआं',
          cleanSwap: 'इंडक्शन कुकटॉप या ढक्कन लगाकर पकाना',
          budgetFit: 'Medium',
          practicalTip: 'इंडक्शन से नाइट्रोजन डाइऑक्साइड (NO2) और रसोई का इनडोर स्मॉग 80% कम होता है।'
        },
        {
          category: 'Heating & Waste',
          standardChoice: 'पत्तियां या कूड़ा जलाकर हाथ सेकना',
          cleanSwap: 'मोटे कंबल, गर्म पानी की बोतल, या रेडिएंट हीटर',
          budgetFit: 'Low',
          practicalTip: 'सर्दियों में खुले में कचरा जलाना स्थानीय स्तर पर हवा को सीधे खतरनाक स्तर पर पहुंचा देता है।'
        }
      ],
      impactExplainer: [
        {
          actionTitle: '10 किमी कार सफर की जगह मेट्रो चुनना',
          whyItWorks: 'इलेक्ट्रिक मास ट्रांजिट में प्रति यात्री बहुत कम कार्बन और शून्य टेलपाइप PM2.5 उत्सर्जन होता है।',
          co2AvoidedGrams: 1400,
          pm25ExposureReductionPct: 75,
          assumptions: 'कार का औसत उत्सर्जन ~170g CO2/km बनाम मेट्रो ~30g CO2/km (10 किमी दूरी पर आधारित अनुमान)।'
        },
        {
          actionTitle: 'बाहर निकलते समय N95 मास्क लगाना',
          whyItWorks: 'इलेक्ट्रोस्टैटिक फाइबर 0.3 माइक्रोन तक के खतरनाक कणों को 95% तक फेफड़ों में जाने से रोकते हैं।',
          co2AvoidedGrams: 0,
          pm25ExposureReductionPct: 90,
          assumptions: 'नाक और मुंह पर बिना लीकेज के ठीक से बंधा हुआ N95/FFP2 मास्क।'
        },
        {
          actionTitle: 'DIY MERV-13 एयर फिल्टर चलाना',
          whyItWorks: 'लगातार एयर-सर्कुलेशन से कमरे के अंदर के सस्पेंडेड पार्टिकल्स फिल्टर में ट्रैप हो जाते हैं।',
          co2AvoidedGrams: 0,
          pm25ExposureReductionPct: 70,
          assumptions: 'सीलबंद 12x12 कमरे में 1 घंटे तक चलने पर मानक वायु शोधन।'
        }
      ]
    };
  }

  // English fallback
  return {
    isAiGenerated: false,
    modelUsed: 'deterministic-calibrated-engine (English)',
    riskSummary: {
      headline: `AQI ${aqi} (${aqiData.band?.label || 'Unhealthy'}) - ${aqiData.cityName}`,
      details: `The air currently contains approximately ${pm25} µg/m³ of fine particulate matter (PM2.5), which is ${Math.round(pm25 / 15)}x higher than the WHO 24-hour health guideline (15 µg/m³).`,
      vulnerableImpact: hasVulnerable
        ? 'High vulnerability detected (children, seniors, or respiratory sensitivity). Inhaling this air causes immediate airway inflammation and reduces oxygen exchange.'
        : 'Even healthy adults will experience throat irritation, dry eyes, and respiratory fatigue during prolonged outdoor exposure.'
    },
    dailyRoutine: [
      {
        timeBlock: 'Morning (6:00 AM - 9:30 AM)',
        activity: 'Peak Ground Smog & Temperature Inversion',
        exposureRisk: 'High',
        mitigation: 'Keep windows firmly closed. Replace outdoor morning runs or brisk walks with indoor bodyweight or yoga exercises.'
      },
      {
        timeBlock: 'Commute (9:30 AM - 10:30 AM)',
        activity: `Travel via ${profile.commuteMode}`,
        exposureRisk: profile.commuteMode === 'car' ? 'Moderate' : 'High',
        mitigation: 'Wear a sealed N95/FFP2 respirator. If driving, set ventilation to Internal Recirculation mode.'
      },
      {
        timeBlock: 'Midday (12:00 PM - 3:00 PM)',
        activity: 'Atmospheric Inversion Lifts (Solar Warming)',
        exposureRisk: 'Low',
        mitigation: 'Best window for 15-20 minutes of targeted cross-ventilation to flush out indoor CO2 buildup.'
      },
      {
        timeBlock: 'Evening & Night (6:00 PM - 10:00 PM)',
        activity: 'Secondary Smog Peak & Indoor Cooking',
        exposureRisk: 'High',
        mitigation: 'Run exhaust fan while cooking. Operate air purifier or DIY box filter in bedrooms with doors shut.'
      }
    ],
    iaqHacks: [
      {
        title: 'Targeted Midday Ventilation Window (12 PM - 3 PM)',
        cost: 'Free',
        effectiveness: 'High',
        description: 'Winter smog is trapped near the ground morning and night by thermal inversions. Solar heat lifts the inversion boundary layer midday, making 12 PM - 3 PM the safest brief airing-out period.',
        mythVsFact: 'Myth: Keeping windows sealed 24/7 is optimal. Fact: Closed homes build toxic CO2 (>1500ppm) and cooking VOCs; a 15-minute midday flush restores oxygen without severe PM2.5 penalty.'
      },
      {
        title: 'DIY Corsi-Rosenthal Box or Box Fan + MERV-13 Filter',
        cost: 'Low',
        effectiveness: 'High',
        description: 'Tape a standard 20x20 HVAC MERV-13 or HEPA furnace filter to the intake side of an inexpensive box fan. It delivers CADR equivalent to $300 commercial purifiers at under $35 total cost.',
        mythVsFact: 'Fact: Tested by UC Davis aerosol scientists to remove 70%+ of airborne PM2.5 in typical bedrooms.'
      },
      {
        title: 'Houseplants: Myth vs. Scientific Reality',
        cost: 'Low',
        effectiveness: 'Moderate',
        description: 'Indoor plants like Snake Plants and Peace Lilies boost humidity and aesthetic well-being, but cannot replace mechanical air filtration.',
        mythVsFact: 'Myth: 3 plants will filter your room air. Fact: NASA studies tested sealed 0.5m³ plexiglass boxes. In real homes with air exchanges, you would need 10 to 100 plants per square meter to match one fan filter.'
      },
      {
        title: 'Wet Mopping with Microfiber vs. Dry Sweeping',
        cost: 'Free',
        effectiveness: 'High',
        description: 'Dry brooms propel settled toxic particles (PM10 and PM2.5) right back into breathing height. Wet-mop with plain water or mild soap once daily.',
        mythVsFact: 'Fact: Wet cleaning prevents up to 60% of particle resuspension.'
      }
    ],
    sustainableAlternatives: [
      {
        category: 'Commute',
        standardChoice: 'Solo ICE Car or Petrol Scooter',
        cleanSwap: 'Metro Transit or Electric Bus',
        budgetFit: 'Low to Medium',
        practicalTip: 'Swapping a 10 km daily drive to electric metro eliminates ~1.4 kg of CO2 emissions per trip.'
      },
      {
        category: 'Cooking',
        standardChoice: 'Open Gas Stove Combustion',
        cleanSwap: 'Single Induction Plate Cooktop',
        budgetFit: 'Medium',
        practicalTip: 'Gas stoves release unburned methane and hazardous NO2. Induction cuts kitchen particulate spikes by 85%.'
      },
      {
        category: 'Heating & Waste',
        standardChoice: 'Open burning of dry leaves or biomass',
        cleanSwap: 'Radiant electric heater or layered warm woolens',
        budgetFit: 'Low',
        practicalTip: 'Biomass and leaf burning produces dioxins and concentrated black carbon that settles directly into neighborhood homes.'
      }
    ],
    impactExplainer: [
      {
        actionTitle: 'Switching 10 km car commute to Metro',
        whyItWorks: 'Electric mass transit carries dozens of passengers per kW with zero street-level exhaust emission.',
        co2AvoidedGrams: 1400,
        pm25ExposureReductionPct: 75,
        assumptions: 'Estimated ~170g CO2/km for typical passenger car vs ~30g CO2/km allocated for metro rail.'
      },
      {
        actionTitle: 'Wearing a sealed N95/FFP2 respirator outdoors',
        whyItWorks: 'Electrostatic meltblown polypropylene matrix physically intercepts particles down to 0.1 microns.',
        co2AvoidedGrams: 0,
        pm25ExposureReductionPct: 90,
        assumptions: 'Assumes genuine NIOSH N95 or EN149 FFP2 mask with tight nose clip and no perimeter leak.'
      },
      {
        actionTitle: 'Deploying DIY Box Fan + MERV-13 Filter in Bedroom',
        whyItWorks: 'Recirculates 200+ cubic feet of air per minute through high-density pleated particulate media.',
        co2AvoidedGrams: 0,
        pm25ExposureReductionPct: 70,
        assumptions: 'Run continuously in closed 12x12 ft bedroom with doors and windows taped.'
      }
    ]
  };
}

/**
 * Deterministic fallback chat response
 */
function getFallbackChatResponse(query, aqiData, profile, hasMedicalConcern, isHindi) {
  const aqi = aqiData.aqi || 180;

  if (hasMedicalConcern) {
    return {
      answer: isHindi
        ? '⚠️ **महत्वपूर्ण चिकित्सा सलाह**: आपने सांस लेने में तकलीफ या खांसी जैसे लक्षणों का उल्लेख किया है। कृपया तुरंत किसी योग्य चिकित्सक या नजदीकी स्वास्थ्य केंद्र से संपर्क करें। क्लीनब्रीथ केवल वायु गुणवत्ता और जीवनशैली मार्गदर्शन प्रदान करता है और कोई चिकित्सीय निदान नहीं दे सकता। कृपया तत्काल शारीरिक परिश्रम बंद करें और शुद्ध हवा में विश्राम करें।'
        : '⚠️ **Important Medical Advisory**: You mentioned symptoms like wheezing, coughing, or respiratory discomfort. Please consult a qualified doctor or healthcare provider immediately. CleanBreath provides environmental and lifestyle mitigation guidance and cannot diagnose medical conditions. Please rest in a clean indoor space and avoid any physical exertion.',
      hasMedicalConcern: true,
      isAiGenerated: false
    };
  }

  const q = query.toLowerCase();
  if (q.includes('kid') || q.includes('child') || q.includes('play') || q.includes('बच्चे') || q.includes('खेल')) {
    return {
      answer: isHindi
        ? `वर्तमान AQI **${aqi}** है। इस स्तर पर बच्चों के लिए बाहर खेलना सुरक्षित नहीं है। बच्चों की सांस लेने की दर वयस्कों से दोगुनी होती है और उनके फेफड़े विकसित हो रहे होते हैं। कृपया उन्हें आज घर के अंदर ही रखें और शाम को इनडोर खेल खेलने दें।`
        : `Current AQI is **${aqi}**. It is **not safe** for children to play outdoors right now. Children breathe twice as fast per pound of body weight and their airways are developing. Keep playtime indoors today and ensure bedroom air is filtered.`,
      hasMedicalConcern: false,
      isAiGenerated: false
    };
  }

  if (q.includes('purifier') || q.includes('filter') || q.includes('speed') || q.includes('प्यूरीफायर')) {
    return {
      answer: isHindi
        ? `वर्तमान AQI **${aqi}** के साथ, प्यूरीफायर को पहले 45 मिनट 'High/Turbo' मोड पर चलाएं ताकि हवा तेजी से साफ हो जाए, फिर रात को सोते समय 'Medium' या 'Auto' मोड पर छोड़ दें। दरवाजे और खिड़कियां बंद रखना सुनिश्चित करें।`
        : `With AQI at **${aqi}**, set your air purifier to **High or Turbo for the first 45 minutes** to scrub the room air quickly, then switch down to Medium or Auto for maintenance while sleeping. Keep bedroom doors and windows firmly shut.`,
      hasMedicalConcern: false,
      isAiGenerated: false
    };
  }

  return {
    answer: isHindi
      ? `वर्तमान में आपका AQI **${aqi}** (${aqiData.band?.hindiLabel || 'अस्वस्थ'}) है। सबसे महत्वपूर्ण कदम यह है कि सुबह 6 से 10 बजे के बीच बाहरी संपर्क कम से कम रखें, बाहर जाने पर N95 मास्क लगाएं, और दोपहर 12 से 3 बजे के बीच ही थोड़े समय के लिए वेंटिलेशन करें।`
      : `At the current AQI of **${aqi}** (${aqiData.band?.label || 'Unhealthy'}), the priority is minimizing outdoor exposure during morning/night inversion spikes, donning an N95 respirator if traveling, and confining home airing-out to the 12 PM - 3 PM afternoon window.`,
    hasMedicalConcern: false,
    isAiGenerated: false
  };
}

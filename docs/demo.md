# CleanBreath - 60-90 Second Hackathon Demo Script
**Google PromptWars Virtual: Challenge 6 ("Urban Air Quality Assistant")**
**Product**: CleanBreath (AI Urban Air Quality Assistant)

---

## Pitch Hook (0:00 - 0:15)
> "Every winter, over 100 million people across South Asia and global metropolitan basins wake up trapped under hazardous smog domes. Families are told the AQI is 300+, but they don't know what to actually do. Should kids play outside? Are air purifiers running correctly? Can a low-budget household protect themselves?
> 
> Meet **CleanBreath**: an empathetic, GenAI-powered urban air quality assistant built on Gemini 2.5 Flash and real-time open environmental APIs."

---

## Live Walkthrough (0:15 - 0:50)

### 1. Real-Time Grounded AQI & Atmospheric Science (0:15 - 0:25)
*(Action: Show the top banner for Delhi at AQI 171+)*
> "Here, CleanBreath automatically queries the Open-Meteo Air Quality API without needing API keys. We see the real-time US AQI, dominant pollutant PM2.5, and a color-coded severity banner that instantly informs older family members.
> 
> Below is the 24-hour diurnal trend chart. In severe winter smog, ground temperature inversions trap particulates morning and night. CleanBreath visualizes this curve so families understand exactly when atmospheric dispersion occurs."

### 2. Under-30-Second Lifestyle Profiling (0:25 - 0:35)
*(Action: Toggle 'Asthma / Respiratory Sensitive', select 'Two-Wheeler', and click 'Low Budget')*\n> "No generic advice. In under 30 seconds, a user sets their household: children, elderly, asthma vulnerability, commute mode, and budget tier. \n> \n> CleanBreath sends this profile alongside the exact live particulate readings into Gemini 2.5 Flash using strict JSON schema output."

### 3. AI Action Plan & Frugal IAQ Hacks (0:35 - 0:50)
*(Action: Click through tabs: Daily Routine, IAQ Hacks, Sustainable Swaps, Impact Explainer)*
> "Gemini generates five grounded sections:
> - **Daily Routine**: Time-blocked mitigation that shields commuters during morning smog peaks.
> - **IAQ Hacks**: Ranked by cost. For low-income homes, it prescribes a $30 DIY Corsi-Rosenthal box fan filter instead of expensive commercial purifiers, and busts the NASA houseplant myth with real science.
> - **Impact Explainer**: Quantifies every action—like avoiding ~1,400 grams of CO2 by switching to metro, or cutting personal PM2.5 exposure by ~90% with a sealed N95 mask."

---

## Impact Tracker & Follow-Up Safety Chat (0:50 - 1:15)
*(Action: Check off two action items; observe Clean Air Score jump from 58 to 78; then click the quick chat question: 'Is it safe for my kid to play outside?')*
> "Families stay motivated with our **Clean Air Action Tracker**. Ticking off completed daily protections dynamically recalculates a running Clean Air Score and saved emissions, persisted in local storage.
> 
> Finally, our conversational follow-up is strictly grounded in the live numbers. Watch this: when asked if a child can play outdoors at AQI 171, Gemini responds empathetically based on the child's respiratory profile. And if a user mentions medical distress like wheezing, our medical safety guardrail immediately advises consulting a doctor."

---

## Conclusion & Tech Stack (1:15 - 1:30)
*(Action: Click the language toggle to show instant English ⇄ Hindi localization)*
> "Built with React, Vite, Tailwind CSS, Express, and Google Gemini 2.5 Flash, with instant Hindi and regional language support. CleanBreath bridges atmospheric data science and daily family survival. Thank you!"

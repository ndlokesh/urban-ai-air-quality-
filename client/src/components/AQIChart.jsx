import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import { translations } from '../utils/translations';

export default function AQIChart({ trendData = [], language }) {
  const t = translations[language] || translations.en;
  const [metric, setMetric] = useState('aqi'); // 'aqi' | 'pm2_5' | 'pm10'

  if (!trendData || trendData.length === 0) return null;

  const metricConfig = {
    aqi: { label: t.trendAqi, stroke: '#F97316', fill: '#FFEDD5', unit: 'AQI' },
    pm2_5: { label: t.trendPm25, stroke: '#EF4444', fill: '#FEE2E2', unit: 'µg/m³' },
    pm10: { label: t.trendPm10, stroke: '#8B5CF6', fill: '#EDE9FE', unit: 'µg/m³' }
  };

  const currentConfig = metricConfig[metric];

  // Custom accessible tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-700 text-xs space-y-1">
          <div className="font-semibold text-slate-300">{label}</div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentConfig.stroke }} />
            <span className="font-bold text-sm">
              {data[metric]} {currentConfig.unit}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            PM2.5: {data.pm2_5} µg/m³ • PM10: {data.pm10} µg/m³
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.hoursTrend}</h3>
            <p className="text-xs text-slate-500">Hourly diurnal progression over the last 24 hours</p>
          </div>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMetric('aqi')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              metric === 'aqi' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.trendAqi}
          </button>
          <button
            type="button"
            onClick={() => setMetric('pm2_5')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              metric === 'pm2_5' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PM2.5
          </button>
          <button
            type="button"
            onClick={() => setMetric('pm10')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              metric === 'pm10' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PM10
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-56 sm:h-64 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentConfig.stroke} stopOpacity={0.35} />
                <stop offset="95%" stopColor={currentConfig.stroke} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748B' }}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 10', 'dataMax + 10']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={currentConfig.stroke}
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        <span>Typical diurnal pattern: Inversion peak morning (7-9 AM) & night (8-11 PM)</span>
        <span className="font-medium text-slate-500">Source: Open-Meteo</span>
      </div>
    </div>
  );
}

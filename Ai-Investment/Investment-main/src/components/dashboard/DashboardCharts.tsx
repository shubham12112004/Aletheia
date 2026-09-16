import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ResearchResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { LineChart as ChartIcon } from 'lucide-react';

type ChartMode = 'price' | 'financials' | 'sentiment';

const chartModes: Array<{ id: ChartMode; label: string }> = [
  { id: 'price', label: 'Price Trend' },
  { id: 'financials', label: 'Ratios & Valuation' },
  { id: 'sentiment', label: 'Sentiment Map' },
];

export function DashboardCharts({ result }: { result: ResearchResult }) {
  const [mode, setMode] = useState<ChartMode>('price');

  const revenueData = result?.revenueSeries?.length
    ? result.revenueSeries
    : [
        { quarter: 'Q1', revenue: 35, profit: 8 },
        { quarter: 'Q2', revenue: 42, profit: 11 },
        { quarter: 'Q3', revenue: 48, profit: 13 },
        { quarter: 'Q4', revenue: 55, profit: 16 },
      ];

  const priceData = revenueData.map((item, index) => ({
    quarter: item.quarter,
    price: Math.max(20, Math.round(item.revenue * 1.2 + index * 8)),
  }));

  const sentimentData = [
    { name: 'Positive Signals', value: Math.max(result?.pros?.length || 0, 3), color: '#10b981' },
    { name: 'Neutral Metrics', value: 2, color: '#3b82f6' },
    { name: 'Risk Factors', value: Math.max(result?.cons?.length || 0, 1), color: '#f43f5e' },
  ];

  const ratios = (result?.metrics || []).slice(0, 5).map((metric, index) => ({
    name: metric.label,
    value: Math.max(8, Math.min(100, Number.parseFloat(metric.value) || 22 + index * 11)),
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-[#090d16]/80 p-5 shadow-inner backdrop-blur-xl">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ChartIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-black text-zinc-100">Telemetry Chart Views</p>
            <p className="text-xs text-zinc-400 font-medium">Switch between price, financial metrics, and sentiment layers</p>
          </div>
        </div>

        <div className="flex rounded-xl border border-white/10 bg-black/40 p-1">
          {chartModes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-bold transition-all',
                mode === item.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[260px]">
        {mode === 'price' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#a1a1aa' }} stroke="#3f3f46" />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} stroke="#3f3f46" />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2.5} fill="url(#emeraldGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {mode === 'financials' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratios.length ? ratios : [{ name: 'P/E Ratio', value: 32 }, { name: 'EPS Growth', value: 58 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.5} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} stroke="#3f3f46" />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} stroke="#3f3f46" />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {mode === 'sentiment' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sentimentData} dataKey="value" innerRadius={68} outerRadius={96} paddingAngle={4}>
                {sentimentData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

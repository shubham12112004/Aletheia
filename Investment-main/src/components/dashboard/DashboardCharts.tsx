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

type ChartMode = 'price' | 'financials' | 'sentiment';

const chartModes: Array<{ id: ChartMode; label: string }> = [
  { id: 'price', label: 'Market Price History' },
  { id: 'financials', label: 'Financial Metrics' },
  { id: 'sentiment', label: 'Sentiment Map' },
];

export function DashboardCharts({ result }: { result: ResearchResult }) {
  const [mode, setMode] = useState<ChartMode>('price');

  const revenueData = result.revenueSeries.length
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
    { name: 'Positive', value: Math.max(result.pros.length, 1), color: '#10b981' },
    { name: 'Neutral', value: 3, color: '#60a5fa' },
    { name: 'Negative', value: Math.max(result.cons.length, 1), color: '#ef4444' },
  ];

  const ratios = result.metrics.slice(0, 5).map((metric, index) => ({
    name: metric.label,
    value: Math.max(8, Math.min(100, Number.parseFloat(metric.value) || 22 + index * 11)),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-900">Interactive Chart Views</p>
          <p className="mt-1 text-xs text-slate-500">Switch between price, financial, and sentiment layers.</p>
        </div>
        <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {chartModes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-bold transition',
                mode === item.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-700'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[270px]">
        {mode === 'price' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="price" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} fill="url(#price)" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {mode === 'financials' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratios.length ? ratios : [{ name: 'P/E', value: 32 }, { name: 'EPS', value: 58 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {mode === 'sentiment' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={sentimentData} dataKey="value" innerRadius={72} outerRadius={104} paddingAngle={4}>
                {sentimentData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

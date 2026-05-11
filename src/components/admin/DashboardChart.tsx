'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Clock } from "lucide-react";
import { getChartData } from "@/actions/orderActions";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

type TooltipValueType = number | string | Array<number | string>;
type TooltipNameType = number | string;

type Period = "day" | "week" | "month" | "year" | "custom";

export function DashboardChart() {
  const [period, setPeriod] = useState<Period>("month");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>('');
  const [data, setData] = useState<{
        date: string;
        orders: number;
        revenue: number;
    }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    if (period === 'custom' && (!customStart || !customEnd)) return;
    
    setLoading(true);
    const result = await getChartData(period, customStart, customEnd);
    if (result.success) {
       setData(result.data);
    }
    setLoading(false);
  }, [period, customStart, customEnd]);

  useEffect(() => {
    setTimeout(() => { loadData(); }, 0);
  }, [period, loadData]);

  const periods: { value: Period; label: string }[] = [
    { value: 'day', label: 'اليوم' },
    { value: 'week', label: 'أسبوع' },
    { value: 'month', label: 'شهر' },
    { value: 'year', label: 'سنة' },
    { value: 'custom', label: 'مخصص' },
  ];

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden p-0">
      <CardHeader className="bg-emerald-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          أداء المبيعات
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {period === 'custom' && (
            <div className="flex flex-col items-center gap-2 bg-emerald-900/30 p-1.5 rounded-xl border border-emerald-800/50">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent text-[10px] text-white outline-none border-none [color-scheme:dark] cursor-pointer"
              />
              <span className="text-emerald-500/50 text-[10px] font-bold">إلى</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent text-[10px] text-white outline-none border-none [color-scheme:dark] cursor-pointer"
              />
              <button 
                onClick={loadData}
                className="bg-emerald-500 hover:bg-emerald-400 text-white p-1 rounded-lg transition-colors"
                title="تحديث البيانات"
              >
                <Clock className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap bg-emerald-900/50 p-1 rounded-xl">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  period === p.value
                    ? 'bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 min-h-[380px]">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-zinc-400">
            <Calendar className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-bold">لا توجد بيانات لهذا النطاق الزمني</p>
          </div>
        ) : (
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 'bold' }}
                  tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
                  labelStyle={{ fontWeight: 'black', color: '#022c22', marginBottom: '4px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  formatter={(
                    value: TooltipValueType | undefined,
                    name: TooltipNameType | undefined
                  ): [React.ReactNode, React.ReactNode] => [
                    name === 'revenue' ? `${Number(value).toLocaleString()} ج.م` : value,
                    name === 'revenue' ? 'المبيعات' : 'الطلبات'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

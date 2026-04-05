"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { API_URL as API } from "@/lib/config";

type CategoryType = "INCOME" | "EXPENSE" | "BOTH";

interface TrendData {
  year: number;
  month: number;
  monthLabel: string;
  totalPaise: number;
  currency: string;
}

interface Category {
  id: number;
  name: string;
  type: CategoryType;
}

const formatRupees = (paise: number) => {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
};

export default function CategoryTrend() {
  const router = useRouter();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial Fetch - Categories
  useEffect(() => {
    async function fetchCategories() {
      const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const res = await fetch(`${API}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.success ? json.data : json;
          setCategories(Array.isArray(list) ? list : []);
          
          // Auto-select first category if available
          if (Array.isArray(list) && list.length > 0) {
            setSelectedCatId(list[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch Trend Data when selection changes
  useEffect(() => {
    if (selectedCatId === null) return;

    async function fetchTrend() {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
      const category = categories.find(c => c.id === selectedCatId);
      
      if (!category || !token) return;

      try {
        const res = await fetch(
          `${API}/dashboard/category-trend?type=${category.type}&categoryId=${selectedCatId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Could not fetch trend data");

        const json = await res.json();
        const rawData = json.success ? json.data : json;
        const mappedData = Array.isArray(rawData) ? rawData.map((d: TrendData) => ({
          ...d,
          totalINR: d.totalPaise / 100,
        })) : [];
        setTrendData(mappedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTrend();
  }, [selectedCatId, categories]);

  // Derived Metrics
  const metrics = useMemo(() => {
    if (trendData.length === 0) return { total: 0, avg: 0, peak: 0 };
    const total = trendData.reduce((sum, d) => sum + d.totalPaise, 0);
    const avg = total / trendData.length;
    const peak = Math.max(...trendData.map(d => d.totalPaise));
    return { total, avg, peak };
  }, [trendData]);

  const selectedCategory = categories.find(c => c.id === selectedCatId);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header & Category Picker */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Trend Analysis</h1>
          <p className="text-slate-500 dark:text-[#a0aec0] mt-2">Track the financial growth and movement of specific categories over time.</p>
        </div>

        <div className="min-w-[240px]">
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Category</label>
          <select 
            value={selectedCatId || ""}
            onChange={(e) => setSelectedCatId(Number(e.target.value))}
            className="w-full bg-white dark:bg-[#2a2d35] border border-slate-200 dark:border-[#2e3240] rounded-2xl px-5 py-3 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-semibold text-slate-700 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name} ({cat.type})</option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-rose-700 font-medium">
          ⚠️ {error}
        </div>
      ) : loading ? (
        <div className="h-[400px] flex items-center justify-center bg-white dark:bg-[#22252e] rounded-[2rem] border border-slate-100 dark:border-[#2e3240]">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-white dark:bg-[#22252e] p-8 rounded-[2rem] border border-slate-100 dark:border-[#2e3240] shadow-sm">
                <p className="text-slate-400 dark:text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">Total Volume</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-black text-slate-800 dark:text-white">{formatRupees(metrics.total)}</h3>
                </div>
             </div>
             <div className="bg-white dark:bg-[#22252e] p-8 rounded-[2rem] border border-slate-100 dark:border-[#2e3240] shadow-sm">
                <p className="text-slate-400 dark:text-slate-300 text-xs font-bold uppercase tracking-widest mb-4">Monthly Average</p>
                <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatRupees(metrics.avg)}</h3>
             </div>
             <div className="bg-white dark:bg-[#22252e] p-8 rounded-[2rem] border border-slate-100 dark:border-[#2e3240] shadow-sm overflow-hidden relative group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                <p className="text-slate-400 dark:text-slate-300 text-xs font-bold uppercase tracking-widest mb-4 relative z-10">Peak High</p>
                <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 relative z-10">{formatRupees(metrics.peak)}</h3>
             </div>
          </div>

          {/* Visualization */}
          <div className="bg-white dark:bg-[#22252e] p-10 rounded-[2.5rem] border border-slate-100 dark:border-[#2e3240] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {selectedCategory?.name} Trend <span className="text-slate-400 dark:text-slate-400 font-normal ml-2">({trendData.length} Months)</span>
                </h2>
             </div>

             <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 30, bottom: 40 }}>
                      <defs>
                         <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={selectedCategory?.type === 'INCOME' ? "#10b981" : selectedCategory?.type === 'EXPENSE' ? "#4f46e5" : "#f59e0b"} stopOpacity={0.15}/>
                            <stop offset="95%" stopColor={selectedCategory?.type === 'INCOME' ? "#10b981" : selectedCategory?.type === 'EXPENSE' ? "#4f46e5" : "#f59e0b"} stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="monthLabel" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 13 }}
                        tickFormatter={(val) => `₹${val >= 100000 ? (val/100000).toFixed(1) + 'L' : val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                        dx={-10}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                           if(active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border-none">
                                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                                   <p className="text-lg font-bold">
                                      {formatRupees(Number(payload[0].value) * 100)}
                                   </p>
                                </div>
                              )
                           }
                           return null;
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalPaise" 
                        stroke={selectedCategory?.type === 'INCOME' ? "#10b981" : selectedCategory?.type === 'EXPENSE' ? "#4f46e5" : "#f59e0b"} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                        animationDuration={1500}
                        dot={{ r: 4, fill: '#fff', stroke: selectedCategory?.type === 'INCOME' ? "#10b981" : selectedCategory?.type === 'EXPENSE' ? "#4f46e5" : "#f59e0b", strokeWidth: 2 }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3 }}
                      />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

import { API_URL as API } from "@/lib/config";

type CategoryType = "INCOME" | "EXPENSE";

interface BreakdownItem {
  categoryId: number;
  categoryName: string;
  categoryType: CategoryType;
  totalPaise: number;
  transactionCount: number;
}

interface MonthlyBreakdown {
  year: number;
  month: number;
  monthLabel: string;
  totalIncomePaise: number;
  totalExpensePaise: number;
  netBalancePaise: number;
  currency: string;
  incomeBreakdowns: BreakdownItem[];
  expenseBreakdowns: BreakdownItem[];
  recordCount: number;
}

interface Category {
  id: number;
  name: string;
  type: CategoryType;
}

// Helper: Indian currency formatting
const formatRupees = (paise: number) => {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
};

export default function BreakdownDashboard() {
  const router = useRouter();

  // State
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [breakdowns, setBreakdowns] = useState<MonthlyBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetching categories and breakdowns
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      // Following prompt specifically for "authToken" but fallback to "accessToken" for existing compatibility
      const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");

      if (!token) {
        setError("Unauthorized - Please log in to view performance data.");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        // Fetch categories (only once)
        if (categories.length === 0) {
          const catRes = await fetch(`${API}/categories`, { headers });
          if (catRes.ok) {
            const catData = await catRes.json();
            // Handle { success: true, data: [...] } or [...]
            const catList = catData.success ? catData.data : catData;
            setCategories(Array.isArray(catList) ? catList : []);
          }
        }

        // Fetch breakdowns
        const breakdownRes = await fetch(`${API}/dashboard/breakdown?year=${selectedYear}`, {
          headers,
        });

        if (breakdownRes.status === 401) {
          router.replace("/login");
          return;
        }

        if (!breakdownRes.ok) {
          throw new Error("Failed to fetch breakdown data");
        }

        const breakdownJson = await breakdownRes.json();
        const breakdownData = breakdownJson.success ? breakdownJson.data : breakdownJson;
        setBreakdowns(Array.isArray(breakdownData) ? breakdownData : []);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedYear, router]);

  // Derive chart data and summaries
  const { summaryCards, chartData } = useMemo(() => {
    if (breakdowns.length === 0) {
      return {
        summaryCards: { income: 0, expense: 0, net: 0 },
        chartData: [] as any[],
      };
    }

    if (selectedCategoryId === "all") {
      const totalIncome = breakdowns.reduce((sum, m) => sum + m.totalIncomePaise, 0);
      const totalExpense = breakdowns.reduce((sum, m) => sum + m.totalExpensePaise, 0);
      const net = breakdowns.reduce((sum, m) => sum + m.netBalancePaise, 0);

      const data = breakdowns.map((m) => ({
        month: m.monthLabel,
        Income: m.totalIncomePaise / 100,
        Expense: m.totalExpensePaise / 100,
      }));

      return {
        summaryCards: { income: totalIncome, expense: totalExpense, net: net },
        chartData: data,
      };
    } else {
      const catId = parseInt(selectedCategoryId);
      const category = categories.find((c) => c.id === catId);
      const isIncomeCat = category?.type === "INCOME";

      let totalIncome = 0;
      let totalExpense = 0;
      let totalCategory = 0;

      const data = breakdowns.map((m) => {
        const item = [...m.incomeBreakdowns, ...m.expenseBreakdowns].find(
          (b) => b.categoryId === catId
        );
        const valPaise = item ? item.totalPaise : 0;
        totalCategory += valPaise;

        if (isIncomeCat) totalIncome += valPaise;
        else totalExpense += valPaise;

        return {
          month: m.monthLabel,
          Value: valPaise / 100,
          type: isIncomeCat ? "INCOME" : "EXPENSE",
        };
      });

      return {
        summaryCards: {
          income: isIncomeCat ? totalCategory : 0,
          expense: !isIncomeCat ? totalCategory : 0,
          net: isIncomeCat ? totalCategory : -totalCategory,
        },
        chartData: data,
      };
    }
  }, [breakdowns, selectedCategoryId, categories]);

  if (loading && breakdowns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-[#1a1c24]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Fetching financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#1a1c24] text-slate-900 dark:text-white font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header and Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Breakdown Analysis</h1>
            <p className="text-slate-500 dark:text-slate-300 mt-2">Visualize your monthly financial flow and category performance.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Year Selector */}
            <div className="relative group">
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-200 uppercase tracking-widest mb-1.5 ml-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="appearance-none bg-white dark:bg-[#2a2d35] border border-slate-200 dark:border-[#2e3240] text-slate-700 dark:text-white px-5 py-2.5 pr-10 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer outline-none font-medium"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
              <div className="absolute right-4 bottom-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Category Selector */}
            <div className="relative group min-w-[180px]">
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-200 uppercase tracking-widest mb-1.5 ml-1">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="appearance-none bg-white dark:bg-[#2a2d35] border border-slate-200 dark:border-[#2e3240] text-slate-700 dark:text-white px-5 py-2.5 pr-10 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer outline-none font-medium w-full"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 bottom-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-xl">⚠️</span>
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-[#22252e] p-6 rounded-3xl border border-slate-100 dark:border-[#2e3240] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
             </div>
             <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Income</p>
             <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatRupees(summaryCards.income)}</h3>
          </div>

          <div className="bg-white dark:bg-[#22252e] p-6 rounded-3xl border border-slate-100 dark:border-[#2e3240] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                <svg className="w-16 h-16 text-rose-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
             </div>
             <p className="text-slate-400 dark:text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Expenses</p>
             <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatRupees(summaryCards.expense)}</h3>
          </div>

          <div className={`p-6 rounded-3xl border shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors ${summaryCards.net >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40" : "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/40"}`}>
             <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Net Balance</p>
             <h3 className={`text-2xl font-bold ${summaryCards.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                {formatRupees(summaryCards.net)}
             </h3>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white dark:bg-[#22252e] p-8 rounded-[2rem] border border-slate-100 dark:border-[#2e3240] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Monthly Performance</h2>
              <div className="px-3 py-1 bg-slate-100 dark:bg-[#2a2d35] text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-full">Interactive View</div>
          </div>
          
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {selectedCategoryId === "all" ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 13 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 10 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-50 animate-in zoom-in-95 duration-200">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">{label}</p>
                            <div className="space-y-2.5">
                              {payload.map((entry: any, index: number) => (
                                <div key={index} className="flex items-center justify-between gap-8">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-sm font-medium text-slate-600">{entry.name}</span>
                                  </div>
                                  <span className="text-sm font-bold text-slate-800">{formatRupees(Number(entry.value) * 100)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 0, paddingBottom: 40, fontSize: 12, fontWeight: 600, color: '#64748b' }}
                  />
                  <Bar 
                    dataKey="Income" 
                    name="Income"
                    fill="#10b981" 
                    radius={[10, 10, 0, 0]} 
                    barSize={28}
                  />
                  <Bar 
                    dataKey="Expense" 
                    name="Expenses"
                    fill="#f43f5e" 
                    radius={[10, 10, 0, 0]} 
                    barSize={28}
                  />
                </BarChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 13 }}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc', radius: 10 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-50">
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
                            <div className="flex items-center justify-between gap-8">
                                <span className="text-sm font-medium text-slate-600">Total</span>
                                <span className={`text-sm font-bold ${data.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatRupees(Number(payload[0].value) * 100)}
                                </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="Value" radius={[10, 10, 0, 0]} barSize={40}>
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.type === "INCOME" ? "#10b981" : "#f43f5e"} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

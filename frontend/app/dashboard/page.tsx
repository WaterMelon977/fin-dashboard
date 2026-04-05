"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, authHeaders, getUser } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { API_URL as API } from "@/lib/config";

interface MonthSummary {
  year: number;
  month: number;
  monthLabel: string;
  totalIncomePaise: number;
  totalExpensePaise: number;
  netBalancePaise: number;
  currency: string;
}

// Format paise → Indian rupee string
function formatRupees(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

// Compact version for chart tooltip
function formatRupeesCompact(paise: number): string {
  const rupees = paise / 100;
  if (Math.abs(rupees) >= 1_00_000)
    return `₹${(rupees / 1_00_000).toFixed(1)}L`;
  if (Math.abs(rupees) >= 1_000) return `₹${(rupees / 1000).toFixed(1)}k`;
  return `₹${rupees}`;
}

interface MetricCardProps {
  label: string;
  value: string;
  variant: "green" | "red" | "neutral";
  icon: string;
}

function MetricCard({ label, value, variant, icon }: MetricCardProps) {
  const variantClasses = {
    green: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400",
    neutral: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-400",
  };

  const valueClasses = {
    green: "text-emerald-800 dark:text-emerald-300",
    red: "text-red-800 dark:text-red-300",
    neutral: "text-indigo-800 dark:text-indigo-300",
  };

  return (
    <div className={`rounded-2xl border p-6 transition-colors duration-300 ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${variantClasses[variant]}`}>
          {label}
        </span>
      </div>
      <div className={`text-2xl font-bold ${valueClasses[variant]}`}>
        {value}
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#22252e] border border-slate-200 dark:border-[#2e3240] rounded-xl shadow-lg p-4 text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
          <span className="font-medium text-slate-800 dark:text-white">
            {formatRupeesCompact(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    setRole(getUser()?.role || null);

    async function fetchData() {
      try {
        const [sumRes, lastRes] = await Promise.all([
          fetch(`${API}/dashboard/summary`, { headers: authHeaders() as Record<string, string> }),
          fetch(`${API}/dashboard/last5`, { headers: authHeaders() as Record<string, string> })
        ]);

        if (sumRes.status === 401) {
          router.replace("/login");
          return;
        }

        const sumJson = await sumRes.json();
        const lastJson = await lastRes.json();

        if (sumRes.ok && sumJson.success) setSummaries(sumJson.data);
        if (lastRes.ok && lastJson.success) setRecent(lastJson.data);
      } catch {
        setError("Network error. Make sure the backend is running on port 8080.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  // Aggregate totals
  const totalIncome = summaries.reduce((sum, m) => sum + m.totalIncomePaise, 0);
  const totalExpense = summaries.reduce((sum, m) => sum + m.totalExpensePaise, 0);
  const netBalance = summaries.reduce((sum, m) => sum + m.netBalancePaise, 0);

  const chartData = summaries.map((m) => ({
    name: m.monthLabel,
    Income: m.totalIncomePaise,
    Expenses: m.totalExpensePaise,
    "Net Balance": m.netBalancePaise,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Synchronizing ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="animate-in slide-in-from-left duration-700">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight italic">
            FIN <span className="text-indigo-600 dark:text-indigo-400">DASH</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-300 mt-2 font-medium">Real-time overview of your financial health and movements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Vertical Metrics */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          <MetricCard
            label="Cumulative Income"
            value={formatRupees(totalIncome)}
            variant="green"
            icon="💰"
          />
          <MetricCard
            label="Global Expenses"
            value={formatRupees(totalExpense)}
            variant="red"
            icon="📉"
          />
          <MetricCard
            label="Current Net Balance"
            value={formatRupees(netBalance)}
            variant={netBalance >= 0 ? "green" : "red"}
            icon={netBalance >= 0 ? "✅" : "⚠️"}
          />
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-[#22252e] rounded-[2.5rem] border border-slate-100 dark:border-[#2e3240] shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10 flex flex-col h-full transition-colors duration-300">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Movements</h2>
            {role !== 'VIEWER' && (
              <button
                onClick={() => router.push('/dashboard/history')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >VIEW ALL HISTORY →</button>
            )}
          </div>

          <div className="flex-1 space-y-6">
            {recent.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 py-10">
                <p className="text-sm font-medium italic">No recent transactions found.</p>
              </div>
            ) : (
              recent.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${t.type === 'INCOME' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                      {t.type === 'INCOME' ? 'IN' : 'OUT'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{t.description}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">{t.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {t.type === 'INCOME' ? '+' : ''}{formatRupees(t.amountPaise)}
                    </p>
                    <p className="text-[9px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-tighter transition-colors">{new Date(t.transactionDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {summaries.length > 0 && (
        <div className="p-8 bg-white dark:bg-[#22252e] rounded-[2.5rem] border border-slate-100 dark:border-[#2e3240] shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Performance Trends</h3>
            <div className="px-4 py-1.5 bg-slate-50 dark:bg-[#1a1c24] border border-slate-100 dark:border-[#2e3240] rounded-full text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest">
              Analytics Engine
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "#2e3240" : "#f1f5f9"} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: 10, fontWeight: 600 }}
                  interval={0}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: theme === 'dark' ? "#94a3b8" : "#64748b", fontSize: 10 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }} />
                <Bar
                  name="Income"
                  dataKey="Income"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Bar
                  name="Expenses"
                  dataKey="Expenses"
                  fill="#ef4444"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Bar
                  name="Net Balance"
                  dataKey="Net Balance"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

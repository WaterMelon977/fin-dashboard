"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search as SearchIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  ArrowUpDown,
  Calendar,
  Layers,
  CircleDollarSign,
  Eraser,
  TrendingDown,
  TrendingUp,
  X,
  History
} from "lucide-react";
import { getUser } from "@/lib/auth";

import { API_URL as API } from "@/lib/config";

interface Transaction {
  id: number;
  userId: number;
  categoryId: number;
  categoryName: string;
  amountPaise: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  transactionDate: string;
  description: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
}

const formatRupees = (paise: number) => {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
};

export default function SearchPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // Filters
  const [type, setType] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  
  // Dual Range State
  const [fineRange, setFineRange] = useState({ min: 0, max: 10000000 });
  const [midRange, setMidRange] = useState({ min: 100000, max: 2000000 });
  const [lastActiveRange, setLastActiveRange] = useState<'fine' | 'mid'>('fine');

  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Results
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // User Hover Data
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const [userCache, setUserCache] = useState<Record<number, any>>({});
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const fetchUser = async (userId: number) => {
    if (userCache[userId]) return;
    const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setUserCache(prev => ({ ...prev, [userId]: json.data }));
      }
    } catch {}
  };

  const handleSearch = useCallback(async (pageNum: number) => {
    setLoading(true);
    const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
    if (!token) return;

    const params = new URLSearchParams({
      page: pageNum.toString(),
      size: "10",
      sort: "transactionDate,desc",
    });

    const activeMin = lastActiveRange === 'fine' ? fineRange.min : midRange.min;
    const activeMax = lastActiveRange === 'fine' ? fineRange.max : midRange.max;

    if (type) params.append("type", type);
    if (categoryId) params.append("categoryId", categoryId);
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (activeMin > 0) params.append("amountMin", activeMin.toString());
    params.append("amountMax", activeMax.toString());
    if (searchQuery) params.append("search", searchQuery);

    try {
      const res = await fetch(`${API}/records?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.success ? json.data : json;
        setTransactions(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  }, [type, categoryId, dateFrom, dateTo, fineRange, midRange, lastActiveRange, searchQuery]);

  // Initialization
  useEffect(() => {
    const userRole = getUser()?.role;
    if (userRole === "VIEWER" || !userRole) {
      router.replace("/dashboard");
      return;
    }
    setRole(userRole);

    const fetchCategories = async () => {
      const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
      try {
        const res = await fetch(`${API}/categories`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setCategories(json.success ? json.data : json);
        }
      } catch {}
    };
    fetchCategories();
  }, [router]);

  // Auto-fetch with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      handleSearch(0);
    }, 1000);

    return () => clearTimeout(timer);
  }, [type, categoryId, dateFrom, dateTo, fineRange, midRange, lastActiveRange, searchQuery, handleSearch]);

  const resetFilters = () => {
    setType(null);
    setCategoryId("");
    setDateFrom("");
    setDateTo("");
    setFineRange({ min: 0, max: 10000000 });
    setMidRange({ min: 100000, max: 2000000 });
    setLastActiveRange('fine');
    setSearchQuery("");
    setPage(0);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 min-h-screen">
      {/* Header */}
      <div className="flex items-end justify-between">
         <div className="fade-in">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200">
                <SearchIcon size={24} className="text-white" />
              </div>
              Advanced Search
            </h1>
            <p className="text-slate-500 dark:text-slate-300 mt-3 font-medium">Power-filter through your entire financial database with ease.</p>
         </div>
         <button 
           onClick={resetFilters}
           className="px-6 py-2.5 bg-white dark:bg-[#2a2d35] border border-slate-200 dark:border-[#2e3240] text-slate-600 dark:text-slate-300 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-[#22252e] transition-all text-sm"
         >
           <Eraser size={16} /> Reset
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
         {/* Filters Panel */}
         <div className="lg:col-span-1 space-y-8 bg-white dark:bg-[#22252e] p-8 rounded-[2.5rem] border border-slate-100 dark:border-[#2e3240] shadow-sm self-start sticky top-24">
            <div className="space-y-6">
               <div className="relative group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 mb-2 ml-1 flex items-center gap-2">
                    <SearchIcon size={12} /> Keyword
                  </label>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Reference, notes..."
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-[#2a2d35] border border-slate-100 dark:border-[#2e3240] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-semibold text-slate-700 dark:text-white placeholder:text-slate-400" 
                  />
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 mb-2 ml-1 block">Movement Type</label>
                  <div className="flex p-1 bg-slate-50 dark:bg-[#2a2d35] rounded-2xl border border-slate-100 dark:border-[#2e3240]">
                    <button 
                      onClick={() => setType(type === "INCOME" ? null : "INCOME")}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${type === "INCOME" ? "bg-white dark:bg-[#22252e] text-emerald-600 shadow-sm border border-slate-100 dark:border-[#2e3240]" : "text-slate-400 dark:text-slate-400"}`}
                    >INCOME</button>
                    <button 
                      onClick={() => setType(type === "EXPENSE" ? null : "EXPENSE")}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${type === "EXPENSE" ? "bg-white dark:bg-[#22252e] text-rose-600 shadow-sm border border-slate-100 dark:border-[#2e3240]" : "text-slate-400 dark:text-slate-400"}`}
                    >EXPENSE</button>
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 mb-2 ml-1 flex items-center gap-2">
                    <Layers size={12} /> Category
                  </label>
                  <select 
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-slate-50 dark:bg-[#2a2d35] border border-slate-100 dark:border-[#2e3240] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-semibold text-slate-700 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 mb-2 ml-1 flex items-center gap-2">
                       <Calendar size={12} /> From
                    </label>
                    <input 
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2a2d35] border border-slate-100 dark:border-[#2e3240] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-xs dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 mb-2 ml-1 flex items-center gap-2">
                       <Calendar size={12} /> To
                    </label>
                    <input 
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#2a2d35] border border-slate-100 dark:border-[#2e3240] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-xs dark:text-white"
                    />
                  </div>
               </div>

               <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 flex items-center gap-2">
                       <CircleDollarSign size={12} /> Fine Precision (0 - 1L)
                    </label>
                    <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 flex flex-col items-end">
                       <span>{formatRupees(lastActiveRange === 'fine' ? fineRange.min : midRange.min)}</span>
                       <span className="text-[8px] text-slate-300 dark:text-slate-500">to</span>
                       <span>{formatRupees(lastActiveRange === 'fine' ? fineRange.max : midRange.max)}</span>
                    </span>
                  </div>
                  
                  <div className="relative h-6 flex items-center group">
                    <div className="absolute h-1.5 w-full bg-slate-100 dark:bg-[#2a2d35] rounded-full" />
                    <div 
                      className="absolute h-1.5 bg-indigo-600 rounded-full pointer-events-none transition-opacity duration-300"
                      style={{
                        left: `${(fineRange.min / 10000000) * 100}%`,
                        width: `${((fineRange.max - fineRange.min) / 10000000) * 100}%`,
                        opacity: lastActiveRange === 'fine' ? 1 : 0.3
                      }}
                    />
                    <input 
                      type="range" min="0" max="10000000" step="50000"
                      value={fineRange.min}
                      onMouseDown={() => setLastActiveRange('fine')}
                      onChange={e => setFineRange(p => ({...p, min: Math.min(parseInt(e.target.value), fineRange.max - 100000)}))}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
                    />
                    <input 
                      type="range" min="0" max="10000000" step="50000"
                      value={fineRange.max}
                      onMouseDown={() => setLastActiveRange('fine')}
                      onChange={e => setFineRange(p => ({...p, max: Math.max(parseInt(e.target.value), fineRange.min + 100000)}))}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
                    />
                  </div>
               </div>

               <div className="pt-2">
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                       <ArrowUpDown size={12} /> Macro Range (1L - 20L)
                    </label>
                  </div>
                  
                  <div className="relative h-6 flex items-center">
                    <div className="absolute h-1.5 w-full bg-slate-100 dark:bg-[#2a2d35] rounded-full" />
                    <div 
                      className="absolute h-1.5 bg-indigo-600 rounded-full pointer-events-none transition-opacity duration-300"
                      style={{
                        left: `${((midRange.min - 10000000) / (200000000 - 10000000)) * 100}%`,
                        width: `${((midRange.max - midRange.min) / (200000000 - 10000000)) * 100}%`,
                        opacity: lastActiveRange === 'mid' ? 1 : 0.3
                      }}
                    />
                    <input 
                      type="range" min="10000000" max="200000000" step="100000"
                      value={midRange.min}
                      onMouseDown={() => setLastActiveRange('mid')}
                      onChange={e => setMidRange(p => ({...p, min: Math.min(parseInt(e.target.value), midRange.max - 500000)}))}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
                    />
                    <input 
                      type="range" min="10000000" max="200000000" step="100000"
                      value={midRange.max}
                      onMouseDown={() => setLastActiveRange('mid')}
                      onChange={e => setMidRange(p => ({...p, max: Math.max(parseInt(e.target.value), midRange.min + 500000)}))}
                      className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none"
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-[8px] font-black text-slate-300 dark:text-slate-400 uppercase tracking-tighter">
                     <span>₹1,00,000</span>
                     <span>MAX 20L</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Results Area */}
         <div className="lg:col-span-3 space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#22252e] rounded-3xl border border-slate-100 dark:border-[#2e3240] shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase">{totalElements} Records</div>
                  <span className="text-xs text-slate-400 dark:text-slate-300 font-medium tracking-tight whitespace-nowrap">Sorted by Transaction Date</span>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={() => {setPage(p => p - 1); handleSearch(page-1);}} disabled={page === 0} className="p-2 hover:bg-slate-50 dark:hover:bg-[#2a2d35] rounded-xl disabled:opacity-30"><ChevronLeft size={18} /></button>
                  <span className="text-[10px] font-black text-slate-800 dark:text-white">{page + 1} / {totalPages || 1}</span>
                  <button onClick={() => {setPage(p => p + 1); handleSearch(page+1);}} disabled={page === totalPages - 1} className="p-2 hover:bg-slate-50 dark:hover:bg-[#2a2d35] rounded-xl disabled:opacity-30"><ChevronRight size={18} /></button>
               </div>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-[#22252e] p-24 rounded-[3rem] border border-slate-50 dark:border-[#2e3240] flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="font-bold text-slate-400 dark:text-slate-500 animate-pulse uppercase tracking-[0.2em] text-[10px]">Scanning Ledger...</p>
              </div>
            ) : transactions.length === 0 ? (
               <div className="bg-white dark:bg-[#22252e] p-24 rounded-[3rem] border border-slate-50 dark:border-[#2e3240] flex flex-col items-center justify-center text-center space-y-4">
                 <div className="p-6 bg-slate-50 dark:bg-[#2a2d35] rounded-full text-4xl">🔎</div>
                 <h2 className="text-xl font-bold text-slate-800 dark:text-white">No matches found</h2>
                 <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mx-auto">We couldn't find any transactions matching your specific filter criteria.</p>
               </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                  {transactions.map(t => (
                    <div 
                      key={t.id} 
                      className="group bg-white dark:bg-[#22252e] p-6 rounded-3xl border border-slate-100 dark:border-[#2e3240] hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all cursor-help relative"
                      onMouseEnter={() => {setHoveredUserId(t.userId); fetchUser(t.userId);}}
                      onMouseLeave={() => setHoveredUserId(null)}
                      onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
                    >
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${t.type === 'INCOME' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                                {t.type === 'INCOME' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                             </div>
                             <div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white">{t.description}</h3>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">{t.categoryName} • {new Date(t.transactionDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className={`text-lg font-black ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {t.type === 'INCOME' ? '+' : ''}{formatRupees(t.amountPaise)}
                             </p>
                             <p className="text-[10px] font-bold text-slate-300 dark:text-slate-500">#{t.id}</p>
                          </div>
                       </div>
                       {t.notes && (
                         <div className="pt-4 border-t border-slate-50 dark:border-[#2e3240] text-[11px] text-slate-400 dark:text-slate-300 italic font-medium">
                           {t.notes}
                         </div>
                       )}
                    </div>
                  ))}
                </div>
            )}
         </div>
      </div>

       {/* User Preview Tooltip */}
       {hoveredUserId && userCache[hoveredUserId] && (
        <div 
          className="fixed z-[200] w-64 bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl pointer-events-none animate-in zoom-in-95 duration-200 border border-slate-700/50 backdrop-blur-xl"
          style={{ 
            top: cursorPos.y + 20, 
            left: cursorPos.x + 20,
            transform: 'translateX(min(0px, calc(100vw - 100% - 20px)))' 
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center font-black text-xl border border-indigo-500/30">
               {userCache[hoveredUserId].fullName[0].toUpperCase()}
            </div>
            <div>
               <p className="text-sm font-bold">{userCache[hoveredUserId].fullName}</p>
               <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{userCache[hoveredUserId].role}</p>
            </div>
          </div>
          <div className="space-y-2.5">
             <div className="flex items-center gap-2 text-slate-400">
                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                <span className="text-[11px] font-medium truncate">{userCache[hoveredUserId].email}</span>
             </div>
             <div className="flex items-center gap-2 text-slate-400">
                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                <span className="text-[11px] font-medium italic">Record created via console</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

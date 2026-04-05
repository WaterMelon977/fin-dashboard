"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut, 
  PlusCircle, 
  PieChart, 
  TrendingUp,
  History,
  Search
} from "lucide-react";
import { logout, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getUser()?.role ?? null);
  }, [pathname]);

  const sidebarLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "ANALYST", "VIEWER"],
    },
    {
      name: "Monthly Breakdown",
      href: "/dashboard/breakdown",
      icon: PieChart,
      roles: ["ADMIN", "ANALYST"],
    },
    {
      name: "Category Trends",
      href: "/dashboard/category-trend",
      icon: TrendingUp,
      roles: ["ADMIN", "ANALYST"],
    },
    {
      name: "History",
      href: "/dashboard/history",
      icon: History,
      roles: ["ADMIN", "ANALYST"],
    },
    {
      name: "Search",
      href: "/dashboard/search",
      icon: Search,
      roles: ["ADMIN", "ANALYST"],
    },
    {
      name: "Create Transaction",
      href: "#create",
      icon: PlusCircle,
      roles: ["ADMIN"],
      onClick: () => setIsCreateModalOpen(true),
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredLinks = sidebarLinks.filter(link => 
    !link.roles || (role && link.roles.includes(role))
  );

  return (
    <>
    <aside className="w-64 bg-white dark:bg-[#22252e] border-r border-slate-200 dark:border-[#2e3240] h-screen sticky top-0 flex flex-col pt-8 pb-6 transition-colors duration-300">
      {/* Brand */}
      <div className="px-8 flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
           <TrendingUp size={20} className="stroke-[2.5]" />
        </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-300">
          FinDash
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5">
        {filteredLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={(e) => {
                if (link.onClick) {
                  e.preventDefault();
                  link.onClick();
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                  : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2d35] hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Icon 
                size={20} 
                className={`${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"}`}
              />
              <span className={`font-semibold text-sm ${isActive ? "translate-x-1" : ""} transition-transform`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Account Info Bar (Sidebar Footer) */}
      <div className="px-4 mt-auto space-y-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>

    </aside>
    {/* Global portal-like rendering for modals */}
    {isCreateModalOpen && (
      <CreateTransactionModal 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    )}
    </>
  );
}

import { X, Save, CheckCircle2, AlertCircle } from "lucide-react";

function CreateTransactionModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    amount: "0.00",
    currency: "INR",
    type: "EXPENSE",
    transactionDate: new Date().toISOString().split('T')[0],
    categoryId: "",
    description: "",
    notes: ""
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ m: string; t: "s" | "e" } | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
      try {
        const res = await fetch("http://localhost:8080/categories", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.success ? json.data : json;
          setCategories(Array.isArray(list) ? list : []);
          if (list.length > 0) setFormData(p => ({...p, categoryId: list[0].id.toString()}));
        }
      } catch {}
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");

    const payload = {
      ...formData,
      amountPaise: Math.round(parseFloat(formData.amount) * 100),
      categoryId: parseInt(formData.categoryId)
    };

    try {
      const res = await fetch("http://localhost:8080/records", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setToast({ m: "Successfully recorded transaction!", t: "s" });
        setTimeout(() => onClose(), 1500);
      } else {
        setToast({ m: "Error while saving transaction.", t: "e" });
      }
    } catch {
      setToast({ m: "Network error.", t: "e" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
       {toast && (
          <div className={`fixed top-8 right-8 z-[10000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${
            toast.t === "s" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}>
            {toast.t === "s" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-semibold">{toast.m}</span>
          </div>
        )}

       <div className="bg-white dark:bg-[#22252e] w-full max-w-xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-10 py-8 bg-indigo-600 text-white flex items-center justify-between">
             <div>
                <h2 className="text-2xl font-bold">New Transaction</h2>
                <p className="text-indigo-100 text-xs mt-1 font-medium tracking-wide border-t border-indigo-400/30 pt-1">RECORD FINANCIAL ACTIVITY</p>
             </div>
             <button onClick={onClose} className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-full transition-colors">
                <X size={20} />
             </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
             <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Currency &amp; Amount (Rupee.paise)</label>
                  <div className="flex bg-slate-50 dark:bg-[#2a2d35] border border-slate-100 dark:border-[#2e3240] rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                     <select 
                        value={formData.currency}
                        onChange={e => setFormData({...formData, currency: e.target.value})}
                        className="bg-transparent px-4 py-3.5 border-r border-slate-100 dark:border-[#2e3240] text-slate-600 dark:text-slate-300 font-bold outline-none"
                     >
                        <option>INR</option>
                        <option>USD</option>
                        <option>GBP</option>
                        <option>EUR</option>
                     </select>
                     <input 
                        type="number" step="0.01" required
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: e.target.value})}
                        className="flex-1 bg-transparent px-4 py-3.5 font-bold outline-none text-slate-800 dark:text-white"
                        placeholder="0.00"
                     />
                  </div>
                </div>

                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Movement Type</label>
                   <div className="flex p-1 bg-slate-50 dark:bg-[#2a2d35] rounded-2xl border border-slate-100 dark:border-[#2e3240]">
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: "INCOME"})}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${formData.type === 'INCOME' ? "bg-white dark:bg-[#22252e] text-emerald-600 shadow-sm border border-slate-100 dark:border-[#2e3240]" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                      >INCOME</button>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: "EXPENSE"})}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${formData.type === 'EXPENSE' ? "bg-white dark:bg-[#22252e] text-rose-600 shadow-sm border border-slate-100 dark:border-[#2e3240]" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                      >EXPENSE</button>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8">
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Transactional Date</label>
                   <input 
                      type="date" required
                      value={formData.transactionDate}
                      onChange={e => setFormData({...formData, transactionDate: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#2a2d35] border border-slate-100 dark:border-[#2e3240] rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 dark:text-white"
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Category Classification</label>
                   <select 
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#2a2d35] border border-slate-100 dark:border-[#2e3240] rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 dark:text-white"
                   >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                   </select>
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 ml-1">Transaction Description</label>
                <input 
                   type="text" required
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full px-5 py-4 bg-slate-50 dark:bg-[#2a2d35] border border-slate-100 dark:border-[#2e3240] rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold text-slate-800 dark:text-white placeholder:font-normal placeholder:text-slate-400"
                   placeholder="e.g. Monthly rent, Client invoice..."
                />
             </div>

             <div className="flex gap-4 pt-6">
                 <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 px-6 py-4 rounded-2xl font-black text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2d35] transition-all"
                >DISCARD</button>
                 <button 
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50"
                >
                  <Save size={20} />
                  {isSubmitting ? "RECORDING..." : "CREATE RECORD"}
                </button>
             </div>
          </form>
       </div>
    </div>
  );
}

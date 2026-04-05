"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  History, 
  ChevronLeft, 
  ChevronRight, 
  Pencil, 
  Trash2, 
  Search,
  X,
  Save,
  CheckCircle2,
  AlertCircle
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

export default function HistoryPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  
  // Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const size = 10;

  // Hover User State
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const [userCache, setUserCache] = useState<Record<number, any>>({});
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Edit/Delete State
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch functions
  const fetchUser = async (userId: number) => {
    if (userCache[userId]) return;
    const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUserCache(prev => ({ ...prev, [userId]: json.data }));
        }
      }
    } catch (e) {
      console.error("Failed to fetch user:", e);
    }
  };
  const fetchRecent = useCallback(async (pageNum: number) => {
    setLoading(true);
    const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch(`${API}/dashboard/recent?page=${pageNum}&size=${size}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTransactions(json.data.content);
          setTotalPages(json.data.totalPages);
          setTotalElements(json.data.totalElements);
        }
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
    if (!token) return;
    try {
      const res = await fetch(`${API}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setCategories(json.success ? json.data : json);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  useEffect(() => {
    const userRole = getUser()?.role;
    if (userRole === "VIEWER" || !userRole) {
      router.replace("/dashboard");
      return;
    }
    setRole(userRole);
    fetchRecent(page);
    fetchCategories();
  }, [page, fetchRecent, fetchCategories, router]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Actions
  const handleEditClick = (item: Transaction) => {
    setEditingItem({ ...item });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);
    const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");

    try {
      const res = await fetch(`${API}/records/${editingItem.id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amountPaise: editingItem.amountPaise,
          categoryId: editingItem.categoryId,
          description: editingItem.description,
          notes: editingItem.notes
        })
      });

      if (res.ok) {
        showToast("Record updated successfully", "success");
        setIsEditModalOpen(false);
        fetchRecent(page);
      } else {
        showToast("Failed to update record", "error");
      }
    } catch {
      showToast("Network error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API}/records/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Record deleted", "success");
        setDeleteId(null);
        fetchRecent(page);
      } else {
        showToast("Failed to delete record", "error");
      }
    } catch {
      showToast("Network error occurred", "error");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 right-8 z-[10010] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        }`}>
          {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

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
                <span className="text-[11px] font-medium italic">Active since {new Date(userCache[hoveredUserId].createdAt).getFullYear()}</span>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
             <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <History className="text-indigo-600 dark:text-indigo-400" size={24} />
             </div>
             Transaction History
          </h1>
          <p className="text-slate-500 dark:text-slate-300 mt-1 ml-12">Manage and review all historical financial records.</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-[#2a2d35] rounded-2xl text-slate-500 dark:text-slate-400 text-sm font-medium border border-slate-200 dark:border-[#2e3240]">
           <Search size={16} />
           <span>Total {totalElements} Records</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#22252e] rounded-[2rem] border border-slate-100 dark:border-[#2e3240] shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#1a1c24]/40 border-b border-slate-100 dark:border-[#2e3240]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-300">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-300">Type / Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-300">Description</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-300 text-right">Amount</th>
                {role === "ADMIN" && (
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 dark:text-slate-300 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-[#2e3240]">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-4 bg-slate-100 dark:bg-[#2a2d35] rounded w-full"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-slate-400 dark:text-slate-500 font-medium italic">No transactions found.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr 
                    key={t.id} 
                    className="group hover:bg-slate-50/50 dark:hover:bg-[#1a1c24]/40 transition-colors cursor-help"
                    onMouseEnter={() => {
                      setHoveredUserId(t.userId);
                      fetchUser(t.userId);
                    }}
                    onMouseLeave={() => setHoveredUserId(null)}
                    onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
                  >
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{new Date(t.transactionDate).toLocaleDateString('en-GB')}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">#{t.id}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {t.type}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.categoryName}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm text-slate-600 dark:text-slate-200 font-medium line-clamp-1">{t.description}</p>
                      {t.notes && <p className="text-[11px] text-slate-400 dark:text-slate-400 italic line-clamp-1 mt-0.5">{t.notes}</p>}
                    </td>
                    <td className="px-8 py-5 text-right font-mono">
                       <span className={`text-base font-bold ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {t.type === 'INCOME' ? '+' : ''}{formatRupees(t.amountPaise)}
                       </span>
                    </td>
                    {role === "ADMIN" && (
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleEditClick(t)}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteId(t.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 dark:bg-[#1a1c24]/40 border-t border-slate-100 dark:border-[#2e3240]">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Page <span className="text-slate-800 dark:text-white">{page + 1}</span> of <span className="text-slate-800 dark:text-white">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                disabled={page === totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#22252e] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 dark:bg-[#1a1c24]/60 border-b border-slate-100 dark:border-[#2e3240] flex items-center justify-between">
               <h2 className="text-lg font-bold text-slate-800 dark:text-white">Edit Transaction</h2>
               <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Amount (INR)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={editingItem.amountPaise / 100}
                    onChange={(e) => setEditingItem({...editingItem, amountPaise: Math.round(parseFloat(e.target.value) * 100)})}
                    className="w-full px-5 py-3 bg-white dark:bg-[#2a2d35] border border-slate-200 dark:border-[#2e3240] text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Category</label>
                  <select 
                    value={editingItem.categoryId}
                    onChange={(e) => setEditingItem({...editingItem, categoryId: parseInt(e.target.value)})}
                    className="w-full px-5 py-3 bg-white dark:bg-[#2a2d35] border border-slate-200 dark:border-[#2e3240] text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Description</label>
                <input 
                  type="text"
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full px-5 py-3 bg-white dark:bg-[#2a2d35] border border-slate-200 dark:border-[#2e3240] text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-semibold"
                  placeholder="What was this for?"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">Notes (Optional)</label>
                <textarea 
                  value={editingItem.notes || ""}
                  onChange={(e) => setEditingItem({...editingItem, notes: e.target.value})}
                  className="w-full px-5 py-3 bg-white dark:bg-[#2a2d35] border border-slate-200 dark:border-[#2e3240] text-slate-800 dark:text-white rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-semibold h-24 resize-none"
                  placeholder="Extra context..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#2a2d35] hover:bg-slate-100 dark:hover:bg-[#1a1c24]/60 transition-all"
                >Cancel</button>
                 <button 
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSubmitting ? "Saving..." : "Update Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="bg-white dark:bg-[#22252e] max-w-sm w-full rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-6">
                 <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete Transaction?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">This action cannot be undone. Are you sure you want to remove record #{deleteId}?</p>
              
              <div className="flex gap-4">
                 <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#2a2d35] hover:bg-slate-100 dark:hover:bg-[#1a1c24]/60 transition-all"
                >Keep it</button>
                 <button 
                   onClick={() => deleteId && handleDelete(deleteId)}
                   className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
                >Delete</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

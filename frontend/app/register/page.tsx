"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, isLoggedIn, authHeaders } from "@/lib/auth";

const API = "http://localhost:8080";
const ROLES = ["ADMIN", "ANALYST", "VIEWER"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "ANALYST" | "VIEWER">("VIEWER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    if (getRole() !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: authHeaders() as Record<string, string>,
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message ?? json.error ?? "Registration failed.");
      } else {
        setSuccess(`User "${fullName}" registered successfully as ${role}.`);
        setFullName("");
        setEmail("");
        setPassword("");
        setRole("VIEWER");
      }
    } catch {
      setError("Network error. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-800">Register New User</h1>
            <p className="text-slate-500 text-sm mt-1">Admin-only — create a new team member account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
              />
            </div>

            <div>
              <label htmlFor="reg-role" className="block text-sm font-medium text-slate-700 mb-1.5">
                Role
              </label>
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow"
            >
              {loading ? "Registering…" : "Register User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

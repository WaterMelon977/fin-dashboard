"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getUser, isLoggedIn, logout, type User } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Sun, Moon } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
  ANALYST: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  VIEWER: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/40 dark:text-slate-300 dark:border-slate-600",
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getUser());
  }, [pathname]);

  function handleLogout() {
    logout();
    setLoggedIn(false);
    setUser(null);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#22252e] border-b border-slate-200 dark:border-[#2e3240] transition-colors duration-300">
      <div className="w-full px-8 h-16 flex items-center justify-end gap-4">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          style={{
            background: theme === "dark"
              ? "linear-gradient(to right, #EC4899, #8B5CF6)"
              : "#e2e8f0",
          }}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
              theme === "dark"
                ? "translate-x-7 bg-white text-purple-600"
                : "translate-x-0.5 bg-white text-slate-500"
            }`}
          >
            {theme === "dark" ? (
              <Moon size={13} strokeWidth={2.5} />
            ) : (
              <Sun size={13} strokeWidth={2.5} />
            )}
          </span>
        </button>

        {/* Right section */}
        <nav className="flex items-center gap-3">
          {loggedIn && user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/register"
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Register User
                </Link>
              )}

              <Link
                href="/dashboard"
                className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium px-3 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                Dashboard
              </Link>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user.fullName}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[user.role] ?? ROLE_COLORS["VIEWER"]}`}
                >
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-white bg-slate-700 dark:bg-slate-600 hover:bg-slate-800 dark:hover:bg-slate-500 px-4 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg transition-colors"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

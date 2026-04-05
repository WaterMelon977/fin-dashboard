"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 text-center">
      <div className="max-w-lg">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-3xl font-extrabold mb-6 shadow-lg">
          F
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-3">
          Welcome to FinDash
        </h1>
        <p className="text-slate-500 text-lg mb-8">
          Role-based financial analytics for your team. Track income, expenses,
          and net balance across months.
        </p>
        <Link
          href="/login"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow transition-colors text-base"
        >
          Get Started →
        </Link>
      </div>
    </div>
  );
}

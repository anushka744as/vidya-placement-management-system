"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { fetchUserRole } from "@/app/actions/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [roleChecked, setRoleChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    fetchUserRole(user.id).then((res) => {
      if (cancelled) return;
      if (res.role !== "admin") {
        router.replace("/login");
        return;
      }
      setIsAdmin(true);
      setRoleChecked(true);
    });
    return () => { cancelled = true; };
  }, [loading, user, router]);

  if (loading || !user || !roleChecked || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50/60">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-sm font-medium text-gray-500">
          {loading ? "Loading..." : !user ? "Redirecting to sign in..." : "Checking access..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

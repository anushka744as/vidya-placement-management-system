import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatusVariant = "blue" | "green" | "orange" | "red" | "purple" | "gray";

const variants: Record<StatusVariant, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  orange: "bg-orange-50 text-orange-700",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-700",
  gray: "bg-gray-100 text-gray-600",
};

const dotColors: Record<StatusVariant, string> = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  gray: "bg-gray-400",
};

const statusMap: Record<string, StatusVariant> = {
  Placed: "green",
  Retained: "blue",
  Interview: "purple",
  Shortlisted: "orange",
  Applied: "blue",
  Seeking: "gray",
  Selected: "green",
  Rejected: "red",
  Joined: "green",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = statusMap[status] || "gray";
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", variants[variant], className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
      {status}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "blue" | "orange" | "green" | "purple";
}) {
  const colors = {
    blue: "text-blue-600",
    orange: "text-orange-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <Icon size={22} className={colors[color]} />
        {trend && (
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

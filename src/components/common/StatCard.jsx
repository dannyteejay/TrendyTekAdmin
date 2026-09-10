import React from "react";

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = "up",
  color = "blue",
}) => {
  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40",
    green: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40",
    amber: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40",
    purple: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/40",
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </p>
        {icon && (
          <div className={`p-2.5 rounded-lg border text-lg ${colorMap[color] || colorMap.blue}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {value}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
                trendDirection === "up"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                  : trendDirection === "down"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {trendDirection === "up" ? "↑ " : trendDirection === "down" ? "↓ " : ""}
              {trend}
            </span>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
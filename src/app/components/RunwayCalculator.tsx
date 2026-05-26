"use client";

import { useState, useEffect } from "react";

interface RunwayData {
  monthlyIncome: string;
  fixedExpenses: string;
  variableExpenses: string;
  currentSavings: string;
}

const STORAGE_KEY = "runway_calculator_data";

export default function RunwayCalculator() {
  const [data, setData] = useState<RunwayData>({
    monthlyIncome: "",
    fixedExpenses: "",
    variableExpenses: "",
    currentSavings: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleChange = (field: keyof RunwayData, value: string) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const income = parseFloat(data.monthlyIncome) || 0;
  const fixed = parseFloat(data.fixedExpenses) || 0;
  const variable = parseFloat(data.variableExpenses) || 0;
  const savings = parseFloat(data.currentSavings) || 0;

  const totalMonthlyExpenses = fixed + variable;
  const netMonthlyBurn = totalMonthlyExpenses - income;
  const hasInputs = data.currentSavings !== "";

  let runwayMonths = 0;
  if (netMonthlyBurn <= 0) {
    runwayMonths = Infinity;
  } else if (savings > 0) {
    runwayMonths = savings / netMonthlyBurn;
  }

  const getStatus = () => {
    if (!hasInputs) return null;
    if (runwayMonths === Infinity) return "green";
    if (runwayMonths >= 6) return "green";
    if (runwayMonths >= 3) return "amber";
    return "red";
  };

  const status = getStatus();

  const statusConfig = {
    green: {
      label: "Stable",
      bg: "bg-emerald-950",
      border: "border-emerald-700",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
      message: runwayMonths === Infinity ? "You're cash-flow positive!" : `You have solid runway ahead.`,
    },
    amber: {
      label: "Caution",
      bg: "bg-amber-950",
      border: "border-amber-700",
      text: "text-amber-400",
      dot: "bg-amber-400",
      message: "Time to review your pivot signals.",
    },
    red: {
      label: "Critical",
      bg: "bg-red-950",
      border: "border-red-800",
      text: "text-red-400",
      dot: "bg-red-400",
      message: "Urgent action required.",
    },
  };

  const getTimelineMonths = () => {
    const maxMonths = Math.min(runwayMonths === Infinity ? 24 : Math.ceil(runwayMonths), 24);
    return Array.from({ length: maxMonths }, (_, i) => {
      const remainingAfterMonth = savings - netMonthlyBurn * (i + 1);
      const pct = Math.max(0, Math.min(100, (remainingAfterMonth / savings) * 100));
      return { month: i + 1, balance: Math.max(0, remainingAfterMonth), pct };
    });
  };

  const timelineData = hasInputs && netMonthlyBurn > 0 ? getTimelineMonths() : [];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const formatRunway = () => {
    if (runwayMonths === Infinity) return "∞";
    const months = Math.floor(runwayMonths);
    const days = Math.round((runwayMonths - months) * 30);
    if (months === 0) return `${days}d`;
    if (days === 0) return `${months}mo`;
    return `${months}mo ${days}d`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Runway Calculator</h2>
        <p className="text-sm text-gray-400">Enter your current financial situation to see how long your runway is.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputCard
          label="Monthly Income"
          sublabel="All income this month"
          value={data.monthlyIncome}
          onChange={(v) => handleChange("monthlyIncome", v)}
          icon="💰"
        />
        <InputCard
          label="Fixed Expenses"
          sublabel="Rent, subscriptions, etc."
          value={data.fixedExpenses}
          onChange={(v) => handleChange("fixedExpenses", v)}
          icon="📌"
        />
        <InputCard
          label="Variable Expenses"
          sublabel="Food, transport, misc."
          value={data.variableExpenses}
          onChange={(v) => handleChange("variableExpenses", v)}
          icon="🔀"
        />
        <InputCard
          label="Current Savings"
          sublabel="Total available capital"
          value={data.currentSavings}
          onChange={(v) => handleChange("currentSavings", v)}
          icon="🏦"
        />
      </div>

      {hasInputs && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile label="Total Monthly Expenses" value={formatCurrency(totalMonthlyExpenses)} />
            <StatTile
              label="Net Monthly Burn"
              value={netMonthlyBurn <= 0 ? `+${formatCurrency(Math.abs(netMonthlyBurn))}` : formatCurrency(netMonthlyBurn)}
              positive={netMonthlyBurn <= 0}
            />
            <StatTile label="Savings Balance" value={formatCurrency(savings)} />
            <StatTile label="Runway" value={formatRunway()} highlight />
          </div>

          {status && (
            <div
              className={`rounded-xl border p-4 flex items-center gap-3 ${
                statusConfig[status].bg
              } ${statusConfig[status].border}`}
            >
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  statusConfig[status].dot
                } shadow-lg`}
              />
              <div>
                <span className={`font-semibold text-sm ${statusConfig[status].text}`}>
                  {statusConfig[status].label}:
                </span>{" "}
                <span className="text-sm text-gray-300">{statusConfig[status].message}</span>
              </div>
            </div>
          )}

          {timelineData.length > 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Burn-Down Timeline</h3>
              <div className="flex items-end gap-1 h-24">
                {timelineData.slice(0, 18).map((d) => {
                  const barStatus =
                    d.balance === 0 ? "red" : d.pct > 50 ? "green" : d.pct > 25 ? "amber" : "red";
                  const barColor =
                    barStatus === "green"
                      ? "bg-emerald-500"
                      : barStatus === "amber"
                      ? "bg-amber-500"
                      : "bg-red-500";
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10">
                        <div className="bg-gray-800 text-xs text-white rounded px-2 py-1 whitespace-nowrap border border-gray-700">
                          Mo {d.month}: {formatCurrency(d.balance)}
                        </div>
                      </div>
                      <div
                        className={`w-full rounded-t transition-all ${barColor}`}
                        style={{ height: `${Math.max(d.pct, 2)}%` }}
                      />
                      {d.month % 3 === 0 && (
                        <span className="text-xs text-gray-600">{d.month}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Showing up to 18 months. Hover bars for balance details.
              </p>
            </div>
          )}

          {netMonthlyBurn <= 0 && (
            <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-4 text-sm text-emerald-300">
              🎉 You're cash-flow positive with a surplus of{" "}
              <strong>{formatCurrency(Math.abs(netMonthlyBurn))}/mo</strong>. No burn-down chart needed!
            </div>
          )}
        </>
      )}

      {!hasInputs && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <p className="text-gray-500 text-sm">Fill in your numbers above to see your runway.</p>
        </div>
      )}
    </div>
  );
}

function InputCard({
  label,
  sublabel,
  value,
  onChange,
  icon,
}: {
  label: string;
  sublabel: string;
  value: string;
  onChange: (v: string) => void;
  icon: string;
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <label className="block mb-2">
        <span className="text-xs text-gray-400 flex items-center gap-1.5">
          <span>{icon}</span>
          <span className="font-medium text-gray-200">{label}</span>
        </span>
        <span className="text-xs text-gray-500">{sublabel}</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
        <input
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-7 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  highlight,
  positive,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "bg-indigo-950 border-indigo-700"
          : "bg-gray-900 border-gray-800"
      }`}
    >
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p
        className={`text-lg font-bold ${
          highlight
            ? "text-indigo-300"
            : positive
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

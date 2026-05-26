"use client";

import { useState, useEffect } from "react";

interface Snapshot {
  id: string;
  period: string;
  income: string;
  totalSpent: string;
  savingsBalance: string;
  moraleNote: string;
  createdAt: string;
}

const STORAGE_KEY = "runway_snapshots";

const MORALE_OPTIONS = [
  { value: "5", label: "💪 Fired up", color: "text-emerald-400" },
  { value: "4", label: "😊 Optimistic", color: "text-green-400" },
  { value: "3", label: "😐 Holding steady", color: "text-yellow-400" },
  { value: "2", label: "😓 Struggling", color: "text-orange-400" },
  { value: "1", label: "😞 Rough patch", color: "text-red-400" },
];

export default function MonthlySnapshotLog() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    period: "",
    income: "",
    totalSpent: "",
    savingsBalance: "",
    moraleScore: "3",
    moraleNote: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSnapshots(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const saveSnapshots = (updated: Snapshot[]) => {
    setSnapshots(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetForm = () => {
    setForm({ period: "", income: "", totalSpent: "", savingsBalance: "", moraleScore: "3", moraleNote: "" });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.period) return;

    const moraleOption = MORALE_OPTIONS.find((o) => o.value === form.moraleScore);
    const moraleText = `${moraleOption?.label || ""} — ${form.moraleNote}`.trim().replace(/ — $/, "");

    if (editingId) {
      const updated = snapshots.map((s) =>
        s.id === editingId
          ? { ...s, period: form.period, income: form.income, totalSpent: form.totalSpent, savingsBalance: form.savingsBalance, moraleNote: moraleText }
          : s
      );
      saveSnapshots(updated);
    } else {
      const newSnapshot: Snapshot = {
        id: crypto.randomUUID(),
        period: form.period,
        income: form.income,
        totalSpent: form.totalSpent,
        savingsBalance: form.savingsBalance,
        moraleNote: moraleText,
        createdAt: new Date().toISOString(),
      };
      saveSnapshots([newSnapshot, ...snapshots]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (s: Snapshot) => {
    const moraleMatch = MORALE_OPTIONS.find((o) => s.moraleNote.startsWith(o.label));
    const scoreVal = moraleMatch?.value || "3";
    const noteText = moraleMatch ? s.moraleNote.replace(moraleMatch.label + " — ", "").replace(moraleMatch.label, "") : s.moraleNote;
    setForm({
      period: s.period,
      income: s.income,
      totalSpent: s.totalSpent,
      savingsBalance: s.savingsBalance,
      moraleScore: scoreVal,
      moraleNote: noteText,
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      saveSnapshots(snapshots.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const formatCurrency = (val: string) => {
    const n = parseFloat(val);
    if (isNaN(n)) return "—";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  };

  const getNetFlow = (s: Snapshot) => {
    const inc = parseFloat(s.income) || 0;
    const spent = parseFloat(s.totalSpent) || 0;
    return inc - spent;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Monthly Snapshot Log</h2>
          <p className="text-sm text-gray-400">Record each month's numbers and your morale. Your journey, written honestly.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
        >
          + Add Month
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-200">
            {editingId ? "Edit Snapshot" : "New Monthly Snapshot"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Month / Period</label>
              <input
                type="month"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Income Earned ($)</label>
              <input
                type="number"
                min="0"
                value={form.income}
                onChange={(e) => setForm({ ...form, income: e.target.value })}
                placeholder="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Total Spent ($)</label>
              <input
                type="number"
                min="0"
                value={form.totalSpent}
                onChange={(e) => setForm({ ...form, totalSpent: e.target.value })}
                placeholder="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Savings Balance ($)</label>
              <input
                type="number"
                min="0"
                value={form.savingsBalance}
                onChange={(e) => setForm({ ...form, savingsBalance: e.target.value })}
                placeholder="0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Morale Check-in</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {MORALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, moraleScore: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    form.moraleScore === opt.value
                      ? "border-indigo-500 bg-indigo-900 text-white"
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              value={form.moraleNote}
              onChange={(e) => setForm({ ...form, moraleNote: e.target.value })}
              placeholder="How are you feeling this month? What's working, what's not?"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!form.period}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
            >
              {editingId ? "Save Changes" : "Save Snapshot"}
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {snapshots.length === 0 && !showForm && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <p className="text-gray-500 text-sm">No snapshots yet. Add your first monthly check-in.</p>
        </div>
      )}

      <div className="space-y-3">
        {snapshots.map((snapshot) => {
          const net = getNetFlow(snapshot);
          const netPositive = net >= 0;
          const date = new Date(snapshot.period + "-01");
          const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

          return (
            <div
              key={snapshot.id}
              className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-white">{monthLabel}</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        netPositive
                          ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                          : "bg-red-950 border-red-800 text-red-400"
                      }`}
                    >
                      {netPositive ? "+" : ""}{formatCurrency(net.toString())} net
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Income</p>
                      <p className="text-sm font-medium text-emerald-400">{formatCurrency(snapshot.income)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Spent</p>
                      <p className="text-sm font-medium text-red-400">{formatCurrency(snapshot.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Savings</p>
                      <p className="text-sm font-medium text-blue-400">{formatCurrency(snapshot.savingsBalance)}</p>
                    </div>
                  </div>

                  {snapshot.moraleNote && (
                    <p className="text-xs text-gray-400 italic border-l-2 border-gray-700 pl-3">
                      {snapshot.moraleNote}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(snapshot)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition px-2 py-1 rounded hover:bg-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(snapshot.id)}
                    className={`text-xs transition px-2 py-1 rounded ${
                      deleteConfirm === snapshot.id
                        ? "text-red-400 hover:text-red-300 bg-red-950"
                        : "text-gray-500 hover:text-red-400 hover:bg-gray-800"
                    }`}
                  >
                    {deleteConfirm === snapshot.id ? "Confirm?" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

interface Signal {
  id: string;
  text: string;
  status: "pending" | "achieved" | "flagged";
  createdAt: string;
}

const STORAGE_KEY = "runway_pivot_signals";

const DEFAULT_SIGNALS: Signal[] = [
  { id: "default-1", text: "Land first paying client", status: "pending", createdAt: new Date().toISOString() },
  { id: "default-2", text: "Reach break-even for one month", status: "pending", createdAt: new Date().toISOString() },
  { id: "default-3", text: "Savings drop below $5,000", status: "pending", createdAt: new Date().toISOString() },
  { id: "default-4", text: "12 months without product-market fit signal", status: "pending", createdAt: new Date().toISOString() },
];

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: "⏳",
    borderColor: "border-gray-700",
    bg: "bg-gray-900",
    badgeBg: "bg-gray-800",
    badgeText: "text-gray-400",
    badgeBorder: "border-gray-700",
  },
  achieved: {
    label: "Achieved",
    icon: "✅",
    borderColor: "border-emerald-800",
    bg: "bg-emerald-950",
    badgeBg: "bg-emerald-900",
    badgeText: "text-emerald-400",
    badgeBorder: "border-emerald-700",
  },
  flagged: {
    label: "Red Flag",
    icon: "🚨",
    borderColor: "border-red-800",
    bg: "bg-red-950",
    badgeBg: "bg-red-900",
    badgeText: "text-red-400",
    badgeBorder: "border-red-800",
  },
};

export default function PivotSignalsChecklist() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [newSignalText, setNewSignalText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "achieved" | "flagged">("all");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSignals(parsed);
      } catch {
        setSignals(DEFAULT_SIGNALS);
      }
    } else {
      setSignals(DEFAULT_SIGNALS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SIGNALS));
    }
  }, []);

  const saveSignals = (updated: Signal[]) => {
    setSignals(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addSignal = () => {
    if (!newSignalText.trim()) return;
    const newSignal: Signal = {
      id: crypto.randomUUID(),
      text: newSignalText.trim(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveSignals([...signals, newSignal]);
    setNewSignalText("");
  };

  const cycleStatus = (id: string) => {
    const order: Signal["status"][] = ["pending", "achieved", "flagged"];
    const updated = signals.map((s) => {
      if (s.id !== id) return s;
      const currentIdx = order.indexOf(s.status);
      const nextStatus = order[(currentIdx + 1) % order.length];
      return { ...s, status: nextStatus };
    });
    saveSignals(updated);
  };

  const setStatus = (id: string, status: Signal["status"]) => {
    const updated = signals.map((s) => (s.id === id ? { ...s, status } : s));
    saveSignals(updated);
  };

  const startEdit = (s: Signal) => {
    setEditingId(s.id);
    setEditText(s.text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    const updated = signals.map((s) => (s.id === id ? { ...s, text: editText.trim() } : s));
    saveSignals(updated);
    setEditingId(null);
    setEditText("");
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      saveSignals(signals.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const filteredSignals = filter === "all" ? signals : signals.filter((s) => s.status === filter);

  const counts = {
    all: signals.length,
    pending: signals.filter((s) => s.status === "pending").length,
    achieved: signals.filter((s) => s.status === "achieved").length,
    flagged: signals.filter((s) => s.status === "flagged").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Pivot Signals Checklist</h2>
        <p className="text-sm text-gray-400">
          Define personal warning signs and milestones. Check them off, flag them red, or track them as you go.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "achieved", "flagged"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              filter === f
                ? "border-indigo-500 bg-indigo-900 text-white"
                : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-200"
            }`}
          >
            {f === "all" ? "All" : STATUS_CONFIG[f].icon + " " + STATUS_CONFIG[f].label}
            <span className="ml-1.5 text-xs opacity-60">{counts[f]}</span>
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSignalText}
            onChange={(e) => setNewSignalText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSignal()}
            placeholder="Add a new signal or milestone..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={addSignal}
            disabled={!newSignalText.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">Press Enter or click Add. Examples: 'Land 3 clients', 'Reach break-even', 'Exhaust savings below $2k'</p>
      </div>

      {filteredSignals.length === 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <p className="text-gray-500 text-sm">
            {filter === "all" ? "No signals yet. Add your first warning sign or milestone above." : `No ${filter} signals.`}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {filteredSignals.map((signal) => {
          const config = STATUS_CONFIG[signal.status];
          const isEditing = editingId === signal.id;

          return (
            <div
              key={signal.id}
              className={`rounded-xl border p-4 transition ${config.bg} ${config.borderColor}`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => cycleStatus(signal.id)}
                  title="Click to cycle status"
                  className="shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-base transition border border-gray-700"
                >
                  {config.icon}
                </button>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(signal.id);
                          if (e.key === "Escape") { setEditingId(null); setEditText(""); }
                        }}
                        autoFocus
                        className="flex-1 bg-gray-800 border border-indigo-500 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => saveEdit(signal.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditText(""); }}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs rounded-lg transition"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`text-sm ${
                        signal.status === "achieved" ? "line-through text-gray-400" : "text-gray-100"
                      }`}
                    >
                      {signal.text}
                    </p>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                      >
                        {config.icon} {config.label}
                      </span>
                      <div className="flex gap-1">
                        {(["pending", "achieved", "flagged"] as const).map((s) => (
                          signal.status !== s && (
                            <button
                              key={s}
                              onClick={() => setStatus(signal.id, s)}
                              className="text-xs text-gray-600 hover:text-gray-300 transition px-1.5 py-0.5 rounded hover:bg-gray-800"
                            >
                              → {STATUS_CONFIG[s].icon}
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(signal)}
                      className="text-xs text-gray-500 hover:text-gray-300 transition px-2 py-1 rounded hover:bg-gray-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(signal.id)}
                      className={`text-xs transition px-2 py-1 rounded ${
                        deleteConfirm === signal.id
                          ? "text-red-400 hover:text-red-300 bg-red-950"
                          : "text-gray-500 hover:text-red-400 hover:bg-gray-800"
                      }`}
                    >
                      {deleteConfirm === signal.id ? "Sure?" : "✕"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {signals.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Progress Summary</h4>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{counts.achieved}</p>
              <p className="text-xs text-emerald-400">Achieved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{counts.pending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{counts.flagged}</p>
              <p className="text-xs text-red-400">Red Flags</p>
            </div>
          </div>
          {signals.length > 0 && (
            <div className="mt-3">
              <div className="flex rounded-full overflow-hidden h-2 bg-gray-800">
                {counts.achieved > 0 && (
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${(counts.achieved / signals.length) * 100}%` }}
                  />
                )}
                {counts.flagged > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(counts.flagged / signals.length) * 100}%` }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

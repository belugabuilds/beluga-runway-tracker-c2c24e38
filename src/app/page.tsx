"use client";

import { useState, useEffect } from "react";
import RunwayCalculator from "./components/RunwayCalculator";
import MonthlySnapshotLog from "./components/MonthlySnapshotLog";
import PivotSignalsChecklist from "./components/PivotSignalsChecklist";

type Tab = "runway" | "snapshots" | "signals";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("runway");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "runway", label: "Runway Calculator", icon: "✈️" },
    { id: "snapshots", label: "Monthly Snapshots", icon: "📅" },
    { id: "signals", label: "Pivot Signals", icon: "🚦" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🛫</span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Runway Tracker</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Your private dashboard for the lean years of building.</p>
        </div>
      </header>

      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-2 border-b-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === "runway" && <RunwayCalculator />}
        {activeTab === "snapshots" && <MonthlySnapshotLog />}
        {activeTab === "signals" && <PivotSignalsChecklist />}
      </main>

      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-gray-600">
          All data stored locally in your browser. Nothing leaves your device.
        </div>
      </footer>
    </div>
  );
}

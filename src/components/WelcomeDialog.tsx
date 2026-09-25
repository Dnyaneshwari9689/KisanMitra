import { useState, useEffect } from 'react';
import { Sprout, X, Rocket, Users, Map, Brain, Wheat } from 'lucide-react';

const STORAGE_KEY = 'kisanmitra_welcome_seen';

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  function handleClose() {
    setOpen(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[95vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
            <Sprout size={32} />
          </div>
          <h1 className="text-2xl font-bold">Welcome to KrishiSense</h1>
          <p className="text-emerald-100 text-sm mt-1">Smart India Hackathon 2026</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Project info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-500">Problem ID</p>
              <p className="text-sm font-bold text-gray-900">SIH26132</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-500">Project</p>
              <p className="text-sm font-bold text-gray-900">KisanMitra</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-600">Status</p>
              <p className="text-sm font-bold text-amber-700">Under Development</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-600">Team Name</p>
              <p className="text-sm font-bold text-emerald-700">Vistara 1.0</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <p className="text-xs text-blue-500">Team ID</p>
            <p className="text-sm font-bold text-blue-700">133285</p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Rocket size={14} /> Explore the Prototype
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Browse all three dashboards</p>
                  <p className="text-xs text-gray-500">Farmer, Buyer, and Explore Market</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Brain size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Experience real-time farm monitoring</p>
                  <p className="text-xs text-gray-500">AI-powered price prediction and market intelligence</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

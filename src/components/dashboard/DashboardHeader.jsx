import React from "react";
import { Network, Database, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardHeader({ currentUser, logout, isFirebase }) {
  return (
    <header className="glass-panel border-b border-zinc-850 px-6 py-4 flex items-center justify-between z-10 bg-black/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-zinc-800 text-black shadow shadow-white/5">
          <Network className="w-5 h-5 text-black" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-2">
            Internet Routing Simulator
            <span className="text-[10px] bg-zinc-900 text-zinc-300 font-bold border border-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              v1.0.0
            </span>
          </h1>
          <p className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold">
            Simulation Control Console
          </p>
        </div>
      </div>

      {/* Center Title */}
      <div className="hidden md:flex flex-col items-center text-center">
        <h2 className="text-sm font-display font-extrabold tracking-widest text-zinc-100 uppercase">
          Internet Routing Simulator
        </h2>
        <p className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">
          Simulate • Traverse • Visualize
        </p>
      </div>

      {/* Right Info */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950 text-zinc-300 border border-zinc-800">
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            {isFirebase ? "Firebase Active" : "Local Mode"}
          </span>
        </div>

        <div className="flex flex-col items-end text-right">
          <span className="text-sm font-semibold text-white tracking-tight leading-tight">
            {currentUser?.displayName || "Guest User"}
          </span>
          <span className="text-[10px] text-zinc-550 truncate w-32 leading-none mt-0.5">
            {currentUser?.email || "guest@offline.local"}
          </span>
        </div>

        <Button 
          variant="outline" 
          onClick={logout} 
          size="sm"
          className="border-zinc-850 hover:bg-white hover:text-black text-zinc-300 py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit
        </Button>
      </div>
    </header>
  );
}

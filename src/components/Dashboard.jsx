import React from "react";
import { useAuth } from "../services/authContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, LogOut, Radio, Database, Hourglass } from "lucide-react";

export default function Dashboard() {
  const { currentUser, logout, isFirebase } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      
      {/* Header Panel */}
      <header className="glass-panel border-b border-zinc-850 px-6 py-4 flex items-center justify-between z-10">
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
            <p className="text-[10px] text-zinc-550 uppercase tracking-widest font-semibold">
              Simulation Control Console
            </p>
          </div>
        </div>

        {/* User Session Profile & Connection Mode */}
        <div className="flex items-center gap-6">
          {/* Mode Pill */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-950 text-zinc-300 border border-zinc-800">
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              Firebase Active
            </span>
          </div>

          {/* User Details */}
          <div className="flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-white tracking-tight leading-tight">
              {currentUser?.displayName}
            </span>
            <span className="text-[10px] text-zinc-500 truncate w-32 leading-none mt-0.5">
              {currentUser?.email}
            </span>
          </div>

          {/* Log Out */}
          <Button 
            variant="outline" 
            onClick={logout} 
            size="sm"
            className="border-zinc-800 hover:bg-white hover:text-black text-zinc-300 py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit
          </Button>
        </div>
      </header>

      {/* Center Landing Area */}
      <main className="flex-1 flex items-center justify-center p-6 select-none relative bg-black">
        {/* Subtle grayscale background lines */}
        <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <Card className="stark-card border-zinc-800 text-zinc-200 w-full max-w-[460px] text-center p-8 relative z-10 rounded-lg shadow-2xl">
          <CardHeader className="flex flex-col items-center space-y-2 pb-2">
            <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-2">
              <Hourglass className="w-7 h-7 text-zinc-400" />
            </div>
            <CardTitle className="font-display text-xl font-bold text-white tracking-tight">
              Simulation Workspace
            </CardTitle>
            <CardDescription className="text-zinc-500 text-[10px] tracking-wider uppercase font-bold">
              Internet Routing Simulator Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="inline-block px-4 py-1.5 rounded-md bg-white text-black text-xs font-bold uppercase tracking-widest border border-transparent shadow active:scale-[0.98]">
              In Progress
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-[320px] mx-auto pt-2">
              The graph visualizer is currently under construction.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer bar */}
      <footer className="glass-panel border-t border-zinc-850 py-3.5 px-6 text-center text-[9px] text-zinc-650 font-bold tracking-wider uppercase mt-auto">
        IEEE COMPUTER SOCIETY • INTERACTIVE ROUTING SIMULATOR
      </footer>
    </div>
  );
}

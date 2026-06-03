import React from "react";
import { useAuth } from "./services/authContext";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] text-white">
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Inner pulsating core */}
          <div className="absolute w-8 h-8 rounded-full bg-cyan-400 blur-sm animate-pulse"></div>
          {/* Outer rotating ring */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-indigo-500/40 animate-[spin_6s_linear_infinite]"></div>
          {/* Outer orbiting node */}
          <div className="absolute w-20 h-20 rounded-full border-t border-r border-indigo-400/20 animate-[spin_3s_linear_infinite]"></div>
        </div>
        <h2 className="mt-8 font-display text-xl font-semibold tracking-wider text-slate-200">
          Internet Routing Simulator
        </h2>
        <p className="mt-2 text-sm text-slate-400 animate-pulse">
          Bootstrapping simulation protocols...
        </p>
      </div>
    );
  }

  return currentUser ? <Dashboard /> : <Auth />;
}

export default App;

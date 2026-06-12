import React, { useState } from "react";
import { useAuth } from "../services/authContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Network } from "lucide-react";
import bwNetworkGraphic from "./bw_network_graphic.png";

export default function Auth() {
  const { loginWithGoogle, loginAsGuest, isFirebase } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState("");

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccess("Authenticated with Google successfully! Connecting you...");
    } catch (err) {
      console.error(err);
      setError(err.message || "Google authentication failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please enter a name to continue.");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await loginAsGuest(guestName.trim());
      setSuccess("Guest session initialized! Connecting you...");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to initialize guest session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-black text-white px-4 select-none">
      
      {/* Stark Simple Background Grid */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative w-full max-w-[420px] z-10">
        
        {/* Header Stark Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white text-black border border-zinc-800 shadow-sm mb-3">
            <Network className="w-6 h-6 text-black" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            Internet Routing Simulator
          </h1>
          <p className="text-[10px] text-zinc-550 mt-1 uppercase tracking-widest font-semibold">
            Simulate • Traverse • Visualize
          </p>
        </div>

        {/* Auth stark Card with Network Backdrop */}
        <Card className="relative overflow-hidden stark-card border-zinc-800 text-zinc-200 rounded-lg shadow-xl bg-black">
          
          {/* Visual Graphic Backdrop */}
          <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
            <img
              src={bwNetworkGraphic}
              alt="Network Routing Visual"
              className="w-full h-full object-cover select-none"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.85)_85%)] pointer-events-none"></div>
          </div>

          <CardHeader className="relative z-10 space-y-1.5 pb-4 border-b border-zinc-900 bg-black/40 backdrop-blur-[2px]">
            <CardTitle className="font-display text-lg font-bold tracking-tight text-white">
              Authentication Portal
            </CardTitle>
            <CardDescription className="text-zinc-400 text-xs">
              Log in to configure custom network topologies.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-4 pt-5">
            
            {/* Firebase or Local fallback Warning Pill */}
            {!isFirebase ? (
              <Alert className="bg-zinc-950/80 border-red-950/50 text-red-200 py-2.5 px-3.5 flex items-start gap-3 rounded-md backdrop-blur-sm">
                <Shield className="h-4 w-4 mt-0.5 text-red-400 animate-pulse" />
                <div>
                  <AlertTitle className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                    Authentication Protocol Failure
                  </AlertTitle>
                  <AlertDescription className="text-[11px] leading-relaxed text-zinc-400">
                    Firebase configuration is missing or incomplete. Registration and login systems are offline.
                  </AlertDescription>
                </div>
              </Alert>
            ) : (
              <Alert className="bg-zinc-950/80 border-zinc-800 text-zinc-300 py-2.5 px-3.5 flex items-start gap-3 rounded-md backdrop-blur-sm">
                <Shield className="h-4 w-4 mt-0.5 text-zinc-400" />
                <div>
                  <AlertTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-200">
                    Secure Mode Enabled
                  </AlertTitle>
                  <AlertDescription className="text-[11px] leading-relaxed text-zinc-400">
                    Firebase configuration detected. Authenticating against live secure database protocols.
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Error or Success notification */}
            {error && (
              <div className="bg-zinc-950 border border-zinc-850 text-zinc-200 rounded-md p-3 text-xs leading-relaxed font-semibold">
                Error: {error}
              </div>
            )}
            {success && (
              <div className="bg-zinc-950 border border-zinc-850 text-zinc-200 rounded-md p-3 text-xs leading-relaxed font-semibold">
                {success}
              </div>
            )}

            {!isFirebase ? (
              <form onSubmit={handleGuestSignIn} className="space-y-4">
                <div>
                  <label htmlFor="guest-name" className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest block mb-1.5">
                    Guest Name
                  </label>
                  <input
                    id="guest-name"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-md px-3 py-2 text-xs text-zinc-200 outline-none focus:border-white transition-colors placeholder:text-zinc-700"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full border border-zinc-850 bg-black/50 text-zinc-300 hover:bg-white hover:text-black font-semibold py-2.5 rounded-md transition-all flex items-center justify-center gap-2.5 cursor-pointer outline-none active:scale-[0.99] text-xs backdrop-blur-sm"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin"></span>
                  ) : (
                    "Enter Simulator as Guest"
                  )}
                </Button>
              </form>
            ) : (
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full border border-zinc-850 bg-black/50 text-zinc-300 hover:bg-white hover:text-black font-semibold py-2.5 rounded-md transition-all flex items-center justify-center gap-2.5 cursor-pointer outline-none active:scale-[0.99] text-xs mt-2 backdrop-blur-sm"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-400 rounded-full animate-spin"></span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.104C18.232 1.814 15.485 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.976 0-.743-.08-1.309-.176-1.714H12.24z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            )}
          </CardContent>
          <CardFooter className="relative z-10 flex flex-col border-t border-zinc-900 pt-4 pb-4 bg-black/40 backdrop-blur-[2px]">
            <span className="text-[9px] text-zinc-600 uppercase tracking-widest text-center font-bold">
              IEEE PROJECT CYCLE • SIMULATOR BUILDER
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

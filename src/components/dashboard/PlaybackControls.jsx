import React from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  ChevronLeft,
  Play,
  Pause,
  ChevronRight,
  ChevronsRight,
  Clock
} from "lucide-react";

export default function PlaybackControls({
  stepsCount,
  animationIndex,
  setAnimationIndex,
  isPlaying,
  setIsPlaying,
  playSpeed,
  setPlaySpeed
}) {
  // Safe bounds check for animationIndex
  const safeIndex = Math.max(0, Math.min(animationIndex, stepsCount - 1));

  return (
    <div className="pt-4 border-t border-zinc-850/50 mt-4 space-y-4">
      
      {/* Scrub Slider */}
      {stepsCount > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-zinc-500">
            Step {safeIndex + 1}/{stepsCount}
          </span>
          <input
            type="range"
            min="0"
            max={stepsCount - 1}
            value={safeIndex}
            onChange={(e) => {
              setAnimationIndex(parseInt(e.target.value));
              setIsPlaying(false);
            }}
            className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Play controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setAnimationIndex(0);
              setIsPlaying(false);
            }}
            disabled={stepsCount <= 1}
            className="h-8 w-8 border-zinc-850 hover:bg-zinc-900"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setAnimationIndex(prev => Math.max(0, prev - 1));
              setIsPlaying(false);
            }}
            disabled={safeIndex === 0}
            className="h-8 w-8 border-zinc-850 hover:bg-zinc-900"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          <Button
            onClick={() => {
              if (safeIndex >= stepsCount - 1) {
                setAnimationIndex(0);
                setIsPlaying(true);
              } else {
                setIsPlaying(!isPlaying);
              }
            }}
            disabled={stepsCount === 0}
            className="h-8 px-4 bg-white text-black hover:bg-zinc-200 font-bold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,255,255,0.1)]"
          >
            {isPlaying ? <Pause className="h-3 w-3 fill-black text-black" /> : <Play className="h-3 w-3 fill-black text-black" />}
            {isPlaying ? "Pause" : "Play Trace"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setAnimationIndex(prev => Math.min(stepsCount - 1, prev + 1));
              setIsPlaying(false);
            }}
            disabled={safeIndex >= stepsCount - 1}
            className="h-8 w-8 border-zinc-850 hover:bg-zinc-900"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setAnimationIndex(stepsCount - 1);
              setIsPlaying(false);
            }}
            disabled={safeIndex >= stepsCount - 1}
            className="h-8 w-8 border-zinc-850 hover:bg-zinc-900"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Playback speed controls */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          {[400, 1000, 2000].map((speed) => (
            <button
              key={`speed-${speed}`}
              onClick={() => setPlaySpeed(speed)}
              className={`px-2 py-1 text-[9px] font-bold rounded border uppercase ${
                playSpeed === speed
                  ? "bg-zinc-800 border-zinc-700 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              }`}
            >
              {speed === 400 ? "Fast" : speed === 1000 ? "Normal" : "Slow"}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}

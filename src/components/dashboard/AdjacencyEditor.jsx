import React, { useRef } from "react";
import { FileCode, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdjacencyEditor({ graphText, setGraphText, onRearrange }) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Synchronize textarea scroll with line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lines = graphText.split("\n");
  const lineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);

  return (
    <Card className="stark-card border-zinc-850 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm flex-1 flex flex-col">
      <CardHeader className="border-b border-zinc-850 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-2">
          <FileCode className="w-4 h-4 text-zinc-400" />
          Adjacency Editor
        </CardTitle>
        {onRearrange && (
          <button
            onClick={onRearrange}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            title="Recalculate layout coordinates using force-directed simulation"
          >
            <RefreshCw className="w-3 h-3" />
            Rearrange
          </button>
        )}
      </CardHeader>
      <CardContent className="p-0 flex-1 flex items-stretch">
        <div className="relative flex-1 flex overflow-hidden h-[600px]">
          {/* Lines Column */}
          <div
            ref={lineNumbersRef}
            className="w-10 bg-zinc-950/80 border-r border-zinc-850 py-3.5 select-none text-right pr-2 text-[10px] font-mono text-zinc-650 flex flex-col gap-0.5 overflow-hidden leading-5"
          >
            {lineNumbers.map((num) => (
              <div key={`ln-${num}`}>{num}</div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={graphText}
            onChange={(e) => setGraphText(e.target.value)}
            onScroll={handleScroll}
            spellCheck="false"
            className="flex-1 bg-transparent py-3.5 px-3 text-xs font-mono text-zinc-300 outline-none resize-none overflow-y-auto leading-5 overflow-x-hidden"
            placeholder="# Node Definition&#10;A&#10;&#10;# Edge definition: source dest weight&#10;A B 4"
          />
        </div>
      </CardContent>
    </Card>
  );
}

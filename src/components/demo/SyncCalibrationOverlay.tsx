import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGlobalOffset, setGlobalOffset, CUE_SHEET, CurrentCueState } from "@/hooks/useDemoSequence";

interface SyncCalibrationOverlayProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  currentCue: CurrentCueState;
  audioCurrentTime: number;
  isPlaying: boolean;
}

const SyncCalibrationOverlay = ({ 
  audioRef, 
  currentCue,
  audioCurrentTime,
  isPlaying 
}: SyncCalibrationOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [offset, setOffset] = useState(getGlobalOffset());

  // Toggle with 'D' key (dev mode only)
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const adjustOffset = useCallback((delta: number) => {
    const newOffset = Math.round((offset + delta) * 100) / 100;
    setOffset(newOffset);
    setGlobalOffset(newOffset);
  }, [offset]);

  const resetOffset = useCallback(() => {
    setOffset(0);
    setGlobalOffset(0);
  }, []);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time - getGlobalOffset();
    }
  }, [audioRef]);

  if (!import.meta.env.DEV) return null;

  const effectiveTime = audioCurrentTime + offset;
  const totalChunks = currentCue.cue?.chunks?.length ?? 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-4 right-4 z-50 bg-background/98 border border-border rounded-lg p-4 shadow-xl backdrop-blur-sm font-mono text-xs max-w-md"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="font-bold text-foreground">SYNC CALIBRATION</span>
            <span className="text-muted-foreground ml-auto">[D] toggle</span>
          </div>

          {/* Time Display */}
          <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-muted/30 rounded">
            <div>
              <span className="text-muted-foreground text-[10px]">RAW TIME</span>
              <div className="text-foreground font-bold text-sm">{audioCurrentTime.toFixed(2)}s</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px]">EFFECTIVE</span>
              <div className="text-primary font-bold text-sm">{effectiveTime.toFixed(2)}s</div>
            </div>
          </div>

          {/* Offset Controls */}
          <div className="mb-3 p-2 bg-muted/30 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-[10px]">GLOBAL OFFSET</span>
              <span className={`font-bold ${offset === 0 ? 'text-muted-foreground' : 'text-primary'}`}>
                {offset >= 0 ? '+' : ''}{offset.toFixed(2)}s
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => adjustOffset(-0.5)} className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 rounded text-red-400 transition-colors">-0.5</button>
              <button onClick={() => adjustOffset(-0.25)} className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 rounded text-red-400 transition-colors">-0.25</button>
              <button onClick={() => adjustOffset(-0.1)} className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 rounded text-red-400 transition-colors">-0.1</button>
              <button onClick={resetOffset} className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-foreground transition-colors">0</button>
              <button onClick={() => adjustOffset(0.1)} className="px-2 py-1 bg-green-500/20 hover:bg-green-500/40 rounded text-green-400 transition-colors">+0.1</button>
              <button onClick={() => adjustOffset(0.25)} className="px-2 py-1 bg-green-500/20 hover:bg-green-500/40 rounded text-green-400 transition-colors">+0.25</button>
              <button onClick={() => adjustOffset(0.5)} className="px-2 py-1 bg-green-500/20 hover:bg-green-500/40 rounded text-green-400 transition-colors">+0.5</button>
            </div>
          </div>

          {/* Chunk Info */}
          <div className="mb-3 p-2 bg-muted/30 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground text-[10px]">CUE + CHUNK STATE</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                currentCue.lifecycle === 'active' ? 'bg-green-500/20 text-green-400' :
                currentCue.lifecycle === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-muted text-muted-foreground'
              }`}>
                {currentCue.lifecycle.toUpperCase()}
              </span>
            </div>

            {currentCue.cue ? (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cue:</span>
                  <span className="text-foreground">{currentCue.cueIndex + 1} / {CUE_SHEET.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chunk:</span>
                  <span className="text-primary font-bold">
                    {currentCue.activeChunkIndex + 1} / {totalChunks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speaker:</span>
                  <span className={currentCue.cue.speaker === 'amelia' ? 'text-primary' : 'text-blue-400'}>
                    {currentCue.cue.speaker}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cue window:</span>
                  <span className="text-foreground">{currentCue.cue.startTime.toFixed(1)}s → {currentCue.cue.endTime.toFixed(1)}s</span>
                </div>
                
                {/* Next chunk time */}
                {currentCue.nextChunkTime !== null && (
                  <div className="flex justify-between pt-1 border-t border-border/50">
                    <span className="text-muted-foreground">Next chunk:</span>
                    <span className="text-yellow-400 font-bold">{currentCue.nextChunkTime.toFixed(2)}s</span>
                  </div>
                )}

                {/* Visible chunks count */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visible chunks:</span>
                  <span className="text-foreground">{currentCue.visibleChunks.length}</span>
                </div>

                {/* Current chunk text */}
                <div className="pt-1 border-t border-border/50">
                  <span className="text-muted-foreground text-[10px]">CURRENT CHUNK:</span>
                  <p className="text-foreground text-[10px] leading-relaxed mt-0.5">
                    "{currentCue.visibleChunks[currentCue.visibleChunks.length - 1]?.text ?? '-'}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground italic">
                No active cue (silence)
              </div>
            )}

            {currentCue.nextCueTime !== null && (
              <div className="flex justify-between mt-1 pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Next cue:</span>
                <span className="text-foreground">{currentCue.nextCueTime.toFixed(1)}s</span>
              </div>
            )}
          </div>

          {/* Quick Seek Buttons */}
          <div className="p-2 bg-muted/30 rounded">
            <span className="text-muted-foreground text-[10px] block mb-1">QUICK SEEK</span>
            <div className="flex gap-1 flex-wrap">
              {CUE_SHEET.slice(0, 6).map((cue, idx) => (
                <button
                  key={cue.id}
                  onClick={() => seekTo(cue.startTime)}
                  className={`px-2 py-1 rounded text-[10px] transition-colors ${
                    currentCue.cue?.id === cue.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  #{idx + 1}
                </button>
              ))}
              <button
                onClick={() => seekTo(0)}
                className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-foreground text-[10px] transition-colors"
              >
                ⟲ Reset
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
            <span className="text-muted-foreground text-[10px]">PLAYBACK</span>
            <span className={`text-[10px] font-medium ${isPlaying ? "text-green-400" : "text-red-400"}`}>
              {isPlaying ? "● PLAYING" : "○ PAUSED"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SyncCalibrationOverlay;

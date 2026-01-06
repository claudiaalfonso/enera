import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SyncCalibrationOverlayProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  currentPhrase: {
    id: string;
    speaker: "amelia" | "customer";
    text: string;
    startTime: number;
    duration: number;
  } | null;
  wordProgress: number;
  isPlaying: boolean;
}

const SyncCalibrationOverlay = ({ 
  audioRef, 
  currentPhrase, 
  wordProgress,
  isPlaying 
}: SyncCalibrationOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Toggle with 'D' key (dev mode only)
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        // Ignore if typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update current time display
  useEffect(() => {
    if (!audioRef.current || !isVisible) return;

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const interval = setInterval(updateTime, 50);
    return () => clearInterval(interval);
  }, [audioRef, isVisible]);

  // Only show in dev mode
  if (!import.meta.env.DEV) return null;

  const estimatedEnd = currentPhrase 
    ? currentPhrase.startTime + currentPhrase.duration 
    : 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="fixed top-4 right-4 z-50 bg-background/95 border border-border rounded-lg p-4 shadow-lg backdrop-blur-sm font-mono text-xs max-w-sm"
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="font-semibold text-foreground">DEV SYNC OVERLAY</span>
            <span className="text-muted-foreground ml-auto">[D] to toggle</span>
          </div>

          <div className="space-y-2 text-muted-foreground">
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="text-foreground font-medium">{currentTime.toFixed(2)}s</span>
            </div>
            
            <div className="flex justify-between">
              <span>Playing:</span>
              <span className={isPlaying ? "text-green-500" : "text-red-400"}>
                {isPlaying ? "Yes" : "No"}
              </span>
            </div>

            {currentPhrase ? (
              <>
                <div className="pt-2 border-t border-border/50">
                  <span className="text-muted-foreground">Phrase:</span>
                  <p className="text-foreground mt-1 text-[11px] leading-relaxed">
                    "{currentPhrase.text.slice(0, 60)}{currentPhrase.text.length > 60 ? '...' : ''}"
                  </p>
                </div>

                <div className="flex justify-between">
                  <span>Speaker:</span>
                  <span className={currentPhrase.speaker === 'amelia' ? 'text-primary' : 'text-blue-400'}>
                    {currentPhrase.speaker}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Start:</span>
                  <span className="text-foreground">{currentPhrase.startTime.toFixed(1)}s</span>
                </div>

                <div className="flex justify-between">
                  <span>Est. End:</span>
                  <span className="text-foreground">{estimatedEnd.toFixed(1)}s</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Word Progress:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-100"
                        style={{ width: `${wordProgress * 100}%` }}
                      />
                    </div>
                    <span className="text-foreground w-10 text-right">{(wordProgress * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-border/50 text-muted-foreground italic">
                No active phrase (silence/noise)
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SyncCalibrationOverlay;

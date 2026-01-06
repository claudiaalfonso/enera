import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlayMode } from "@/hooks/useDemoSequence";

interface PresentationControlsProps {
  isPlaying: boolean;
  isComplete: boolean;
  playMode: PlayMode;
  currentStep: number;
  totalSteps: number;
  isFullscreen: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSwitchMode: (mode: PlayMode) => void;
  onToggleFullscreen: () => void;
  onToggleMute: () => void;
  onReset: () => void;
}

const PresentationControls = ({
  isPlaying,
  isComplete,
  playMode,
  currentStep,
  totalSteps,
  isFullscreen,
  isMuted,
  onTogglePlay,
  onNext,
  onPrevious,
  onSwitchMode,
  onToggleFullscreen,
  onToggleMute,
  onReset
}: PresentationControlsProps) => {
  const progress = Math.max(0, ((currentStep + 1) / totalSteps) * 100);

  return (
    <motion.div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md",
        isFullscreen && "bg-card"
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Mode switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => onSwitchMode("auto")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                playMode === "auto" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Auto
            </button>
            <button
              onClick={() => onSwitchMode("manual")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                playMode === "manual" 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Manual
            </button>
          </div>
          
          <span className="text-xs text-muted-foreground ml-2">
            Step {Math.max(1, currentStep + 1)} of {totalSteps}
          </span>
        </div>

        {/* Center: Playback controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={currentStep <= 0}
            className="h-9 w-9 p-0"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={isComplete ? onReset : onTogglePlay}
            className="h-10 w-10 p-0 rounded-full"
          >
            {isComplete ? (
              <SkipBack className="h-4 w-4" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={isComplete}
            className="h-9 w-9 p-0"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Right: Audio & Fullscreen controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMute}
            className="h-9 w-9 p-0"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            className="h-9 w-9 p-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default PresentationControls;

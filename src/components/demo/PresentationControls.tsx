import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2, Volume2, VolumeX, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PresentationControlsProps {
  isPlaying: boolean;
  isComplete: boolean;
  currentStep: number;
  totalSteps: number;
  isFullscreen: boolean;
  isMuted: boolean;
  isCompact: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleFullscreen: () => void;
  onToggleMute: () => void;
  onToggleCompact: () => void;
  onReset: () => void;
}

const PresentationControls = ({
  isPlaying,
  isComplete,
  currentStep,
  totalSteps,
  isFullscreen,
  isMuted,
  isCompact,
  onTogglePlay,
  onNext,
  onPrevious,
  onToggleFullscreen,
  onToggleMute,
  onToggleCompact,
  onReset
}: PresentationControlsProps) => {
  const progress = Math.max(0, ((currentStep + 1) / totalSteps) * 100);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-md",
        isFullscreen && "bg-card"
      )}
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-muted/50">
        <motion.div
          className="h-full bg-enera-brand"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex items-center justify-between px-6 py-2.5">
        {/* Left: Step indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {Math.max(1, currentStep + 1)} / {totalSteps}
          </span>
        </div>

        {/* Center: Playback controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onPrevious}
            disabled={currentStep <= 0}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={isComplete ? onReset : onTogglePlay}
            className="h-9 w-9 p-0 rounded-full bg-enera-brand hover:bg-enera-brand/90 text-white"
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
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Right: Audio & Fullscreen controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMute}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
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
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Toggle fullscreen (F)"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCompact}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            title="Hide controls (C)"
          >
            {isCompact ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PresentationControls;


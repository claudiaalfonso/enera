import { cn } from "@/lib/utils";
import HeartbeatChip from "./HeartbeatChip";
import ConfirmationState from "./ConfirmationState";

interface SystemPanelProps {
  currentStatus: string;
  isProcessing: boolean;
  showConfirmation: boolean;
  isFullscreen?: boolean;
}

const SystemPanel = ({ currentStatus, isProcessing, showConfirmation, isFullscreen = false }: SystemPanelProps) => {
  const hasSignal = Boolean(currentStatus) || showConfirmation;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className={cn(
        "flex-shrink-0 border-b border-border/20 bg-card/20",
        isFullscreen ? "px-6 py-2" : "px-4 py-1.5"
      )}>
        <span className={cn(
          "font-medium text-muted-foreground/60",
          isFullscreen ? "text-xs" : "text-[11px]"
        )}>
          What's happening
        </span>
      </div>

      {/* Content - Centered heartbeat chips */}
      <div className={cn(
        "flex-1 flex flex-col items-center justify-center",
        isFullscreen ? "px-6 py-4" : "px-5 py-3"
      )}>
        {/* Silence/noise = clean screen */}
        {!hasSignal ? null : (
          <div className="flex flex-col items-center gap-3">
            <HeartbeatChip 
              status={currentStatus} 
              isVisible={Boolean(currentStatus) && !showConfirmation} 
              isFullscreen={isFullscreen} 
            />

            {/* Confirmation State */}
            {showConfirmation && (
              <ConfirmationState isVisible={showConfirmation} isFullscreen={isFullscreen} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemPanel;

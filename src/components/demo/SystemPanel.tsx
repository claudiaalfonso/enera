import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import LiveStatusCard from "./LiveStatusCard";
import ActionTimeline from "./ActionTimeline";
import ConfirmationState from "./ConfirmationState";
import { TimelineStep } from "./TimelineItem";

interface SystemPanelProps {
  currentStatus: string;
  isProcessing: boolean;
  steps: TimelineStep[];
  showConfirmation: boolean;
  isFullscreen?: boolean;
}

const SystemPanel = ({ currentStatus, isProcessing, steps, showConfirmation, isFullscreen = false }: SystemPanelProps) => {
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
          What’s happening
        </span>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 flex flex-col justify-center",
        isFullscreen ? "px-6 py-4" : "px-5 py-3"
      )}>
        {/* Silence/noise = clean screen */}
        {!hasSignal ? null : (
          <>
            <LiveStatusCard status={currentStatus} isProcessing={isProcessing} isFullscreen={isFullscreen} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
            >
              <ActionTimeline steps={steps} isFullscreen={isFullscreen} />
            </motion.div>

            {/* Confirmation State */}
            {showConfirmation && (
              <div className="mt-4">
                <ConfirmationState isVisible={showConfirmation} isFullscreen={isFullscreen} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SystemPanel;


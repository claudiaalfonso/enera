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
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Minimal Header */}
      <div className={cn(
        "flex-shrink-0 border-b border-border/30 bg-card/30 transition-all",
        isFullscreen ? "px-8 py-3" : "px-6 py-2.5"
      )}>
        <span className={cn(
          "font-medium text-muted-foreground/70 transition-all",
          isFullscreen ? "text-sm" : "text-xs"
        )}>
          System
        </span>
      </div>

      {/* Content - Minimal, voice-supportive */}
      <div className={cn(
        "flex-1 flex flex-col justify-center transition-all",
        isFullscreen ? "px-8 py-6" : "px-6 py-4"
      )}>
        <LiveStatusCard status={currentStatus} isProcessing={isProcessing} isFullscreen={isFullscreen} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ActionTimeline steps={steps} isFullscreen={isFullscreen} />
        </motion.div>

        {/* Confirmation State */}
        {showConfirmation && (
          <div className="mt-6">
            <ConfirmationState isVisible={showConfirmation} isFullscreen={isFullscreen} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemPanel;

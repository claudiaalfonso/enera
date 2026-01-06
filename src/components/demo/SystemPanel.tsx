import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
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
      {/* Header */}
      <div className={cn(
        "flex-shrink-0 border-b border-border/50 bg-card/50 transition-all",
        isFullscreen ? "px-8 py-4" : "px-6 py-3"
      )}>
        <div className="flex items-center gap-2 mb-0.5">
          <Cpu className={cn(
            "text-enera-brand transition-all",
            isFullscreen ? "w-5 h-5" : "w-4 h-4"
          )} />
          <h2 className={cn(
            "font-semibold text-foreground transition-all",
            isFullscreen ? "text-lg" : "text-sm"
          )}>
            What's happening
          </h2>
        </div>
        <p className={cn(
          "text-muted-foreground transition-all",
          isFullscreen ? "text-sm" : "text-xs"
        )}>
          Live system actions powered by Amelia
        </p>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-y-auto transition-all",
        isFullscreen ? "px-8 py-5" : "px-6 py-4"
      )}>
        <LiveStatusCard status={currentStatus} isProcessing={isProcessing} isFullscreen={isFullscreen} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ActionTimeline steps={steps} isFullscreen={isFullscreen} />
        </motion.div>

        {/* Confirmation State */}
        {showConfirmation && (
          <div className="mt-5">
            <ConfirmationState isVisible={showConfirmation} isFullscreen={isFullscreen} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemPanel;

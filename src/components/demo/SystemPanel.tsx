import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import LiveStatusCard from "./LiveStatusCard";
import ActionTimeline from "./ActionTimeline";
import ConfirmationState from "./ConfirmationState";
import { TimelineStep } from "./TimelineItem";

interface SystemPanelProps {
  currentStatus: string;
  isProcessing: boolean;
  steps: TimelineStep[];
  showConfirmation: boolean;
}

const SystemPanel = ({ currentStatus, isProcessing, steps, showConfirmation }: SystemPanelProps) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">What's happening</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Live system actions powered by Amelia
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <LiveStatusCard status={currentStatus} isProcessing={isProcessing} />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ActionTimeline steps={steps} />
        </motion.div>

        {/* Confirmation State */}
        {showConfirmation && (
          <div className="mt-6">
            <ConfirmationState isVisible={showConfirmation} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemPanel;

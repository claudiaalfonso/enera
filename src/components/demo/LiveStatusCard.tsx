import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveStatusCardProps {
  status: string;
  isProcessing: boolean;
  isFullscreen?: boolean;
}

const LiveStatusCard = ({ status, isProcessing, isFullscreen = false }: LiveStatusCardProps) => {
  return (
    <motion.div
      className={cn(
        "enera-card mb-5 transition-all",
        isFullscreen ? "p-5" : "p-4",
        isProcessing && "action-glow"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        {/* AI Pulse Indicator */}
        <div className="relative">
          <div className={cn(
            "rounded-xl bg-enera-brand/10 flex items-center justify-center transition-all",
            isFullscreen ? "w-12 h-12" : "w-10 h-10"
          )}>
            <Activity className={cn(
              "text-enera-brand transition-all",
              isFullscreen ? "w-6 h-6" : "w-5 h-5"
            )} />
          </div>
          {isProcessing && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-enera-brand/15"
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Status Text */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={status}
              className={cn(
                "font-medium text-foreground truncate transition-all",
                isFullscreen ? "text-base" : "text-sm"
              )}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
            >
              {status}
            </motion.p>
          </AnimatePresence>
          <p className={cn(
            "text-muted-foreground mt-0.5 transition-all",
            isFullscreen ? "text-sm" : "text-xs"
          )}>
            System status
          </p>
        </div>

        {/* Live Indicator */}
        {isProcessing && (
          <div className={cn(
            "flex items-center gap-1.5 rounded-full bg-success/8 border border-success/15 transition-all",
            isFullscreen ? "px-3 py-1.5" : "px-2.5 py-1"
          )}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className={cn(
              "font-medium text-success transition-all",
              isFullscreen ? "text-sm" : "text-xs"
            )}>
              Live
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveStatusCard;

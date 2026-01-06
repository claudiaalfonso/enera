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
        "flex items-center gap-3 mb-4 transition-all",
        isFullscreen ? "py-3" : "py-2"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Minimal indicator */}
      <div className="relative">
        <div className={cn(
          "rounded-lg bg-enera-brand/10 flex items-center justify-center transition-all",
          isFullscreen ? "w-9 h-9" : "w-8 h-8"
        )}>
          <Activity className={cn(
            "text-enera-brand transition-all",
            isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5"
          )} />
        </div>
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-enera-brand/10"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Status - single line */}
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          className={cn(
            "font-medium text-foreground transition-all",
            isFullscreen ? "text-base" : "text-sm"
          )}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {status}
        </motion.span>
      </AnimatePresence>

      {/* Live dot */}
      {isProcessing && (
        <span className="relative flex h-2 w-2 ml-auto">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-50"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
      )}
    </motion.div>
  );
};

export default LiveStatusCard;

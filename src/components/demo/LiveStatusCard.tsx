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
        "flex items-center gap-2.5 mb-3",
        isFullscreen ? "py-2" : "py-1.5"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Compact indicator */}
      <div className="relative">
        <div className={cn(
          "rounded-md bg-enera-brand/10 flex items-center justify-center",
          isFullscreen ? "w-8 h-8" : "w-7 h-7"
        )}>
          <Activity className={cn(
            "text-enera-brand",
            isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5"
          )} />
        </div>
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-md bg-enera-brand/10"
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Status - larger text */}
      <AnimatePresence mode="wait">
        <motion.span
          key={status}
          className={cn(
            "font-semibold text-foreground",
            isFullscreen ? "text-lg" : "text-base"
          )}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 4 }}
          transition={{ duration: 0.15 }}
        >
          {status}
        </motion.span>
      </AnimatePresence>

      {/* Live dot */}
      {isProcessing && (
        <span className="relative flex h-2 w-2 ml-auto">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-40"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
      )}
    </motion.div>
  );
};

export default LiveStatusCard;

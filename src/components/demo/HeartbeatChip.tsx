import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeartbeatChipProps {
  status: string;
  isVisible: boolean;
  isFullscreen?: boolean;
}

const HeartbeatChip = ({ status, isVisible, isFullscreen = false }: HeartbeatChipProps) => {
  return (
    <AnimatePresence mode="wait">
      {isVisible && status && (
        <motion.div
          key={status}
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -2 }}
          transition={{ 
            duration: 0.25, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full",
            "bg-primary/10 border border-primary/20",
            isFullscreen 
              ? "px-4 py-2 text-sm" 
              : "px-3 py-1.5 text-xs"
          )}
        >
          {/* Subtle pulse dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary/60" />
          </span>
          
          <span className={cn(
            "font-medium text-foreground/80",
            isFullscreen ? "text-sm" : "text-xs"
          )}>
            {status}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeartbeatChip;

import { motion } from "framer-motion";
import { CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationStateProps {
  isVisible: boolean;
  isFullscreen?: boolean;
}

const ConfirmationState = ({ isVisible, isFullscreen = false }: ConfirmationStateProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className={cn(
        "enera-card-elevated text-center enera-glow transition-all",
        isFullscreen ? "p-8" : "p-6"
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Success Icon */}
      <motion.div
        className={cn(
          "inline-flex items-center justify-center rounded-2xl bg-success/10 transition-all",
          isFullscreen ? "w-20 h-20 mb-5" : "w-16 h-16 mb-4"
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 25 }}
      >
        <CheckCircle2 className={cn(
          "text-success transition-all",
          isFullscreen ? "w-10 h-10" : "w-8 h-8"
        )} />
      </motion.div>

      {/* Text */}
      <motion.h3
        className={cn(
          "font-semibold text-foreground mb-1 transition-all",
          isFullscreen ? "text-xl" : "text-lg"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Session confirmed
      </motion.h3>
      <motion.p
        className={cn(
          "text-muted-foreground transition-all",
          isFullscreen ? "text-base" : "text-sm"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Driver charging successfully
      </motion.p>

      {/* Stats */}
      <motion.div
        className={cn(
          "flex items-center justify-center gap-4 border-t border-border transition-all",
          isFullscreen ? "mt-6 pt-6" : "mt-5 pt-5"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className={cn(
          "flex items-center gap-2 transition-all",
          isFullscreen ? "text-base" : "text-sm"
        )}>
          <Zap className={cn(
            "text-accent transition-all",
            isFullscreen ? "w-5 h-5" : "w-4 h-4"
          )} />
          <span className="text-muted-foreground">Active session</span>
        </div>
        <div className={cn(
          "w-px bg-border transition-all",
          isFullscreen ? "h-5" : "h-4"
        )} />
        <div className={cn("transition-all", isFullscreen ? "text-base" : "text-sm")}>
          <span className="font-medium text-success">35% saved</span>
          <span className="text-muted-foreground ml-1">via app promo</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationState;

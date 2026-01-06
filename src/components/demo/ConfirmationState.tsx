import { motion } from "framer-motion";
import { CheckCircle2, Zap } from "lucide-react";

interface ConfirmationStateProps {
  isVisible: boolean;
}

const ConfirmationState = ({ isVisible }: ConfirmationStateProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="enera-card-elevated p-6 text-center enera-glow"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Success Icon */}
      <motion.div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 25 }}
      >
        <CheckCircle2 className="w-8 h-8 text-success" />
      </motion.div>

      {/* Text */}
      <motion.h3
        className="text-lg font-semibold text-foreground mb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Session confirmed
      </motion.h3>
      <motion.p
        className="text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Driver charging successfully
      </motion.p>

      {/* Stats */}
      <motion.div
        className="flex items-center justify-center gap-4 mt-5 pt-5 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-muted-foreground">Active session</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="text-sm">
          <span className="font-medium text-success">35% saved</span>
          <span className="text-muted-foreground ml-1">via app promo</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationState;

import { motion } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  id: string;
  label: string;
  detail: string;
  status: "pending" | "active" | "completed";
  isValueMoment?: boolean;
}

interface TimelineItemProps {
  step: TimelineStep;
  index: number;
  isLast: boolean;
}

const TimelineItem = ({ step, index, isLast }: TimelineItemProps) => {
  const getIcon = () => {
    switch (step.status) {
      case "completed":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-6 h-6 rounded-full bg-success flex items-center justify-center"
          >
            <Check className="w-3.5 h-3.5 text-success-foreground" strokeWidth={3} />
          </motion.div>
        );
      case "active":
        return (
          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 text-accent-foreground animate-spin" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <Circle className="w-2.5 h-2.5 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <motion.div
      className="relative flex gap-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-border" />
      )}
      
      {/* Completed line overlay */}
      {!isLast && step.status === "completed" && (
        <motion.div
          className="absolute left-[11px] top-8 w-[2px] bg-success/40"
          initial={{ height: 0 }}
          animate={{ height: "100%" }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
      )}

      {/* Icon */}
      <div className="relative z-10 flex-shrink-0">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "completed" ? "text-foreground" : 
                step.status === "active" ? "text-foreground" : 
                "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {step.detail}
            </p>
          </div>
          
          {/* Value moment badge */}
          {step.isValueMoment && step.status === "completed" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
            >
              Value+
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineItem;

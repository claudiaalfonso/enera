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
  isFullscreen?: boolean;
}

const TimelineItem = ({ step, index, isLast, isFullscreen = false }: TimelineItemProps) => {
  const iconSize = isFullscreen ? "w-7 h-7" : "w-6 h-6";
  const checkSize = isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5";
  
  const getIcon = () => {
    switch (step.status) {
      case "completed":
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn("rounded-full bg-success flex items-center justify-center", iconSize)}
          >
            <Check className={cn("text-success-foreground", checkSize)} strokeWidth={3} />
          </motion.div>
        );
      case "active":
        return (
          <div className={cn("rounded-full bg-accent flex items-center justify-center", iconSize)}>
            <Loader2 className={cn("text-accent-foreground animate-spin", checkSize)} />
          </div>
        );
      default:
        return (
          <div className={cn("rounded-full bg-muted flex items-center justify-center", iconSize)}>
            <Circle className="w-2.5 h-2.5 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <motion.div
      className={cn("relative flex", isFullscreen ? "gap-5" : "gap-4")}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      {/* Timeline Line */}
      {!isLast && (
        <div className={cn(
          "absolute top-8 bottom-0 w-[2px] bg-border",
          isFullscreen ? "left-[13px]" : "left-[11px]"
        )} />
      )}
      
      {/* Completed line overlay */}
      {!isLast && step.status === "completed" && (
        <motion.div
          className={cn(
            "absolute top-8 w-[2px] bg-success/40",
            isFullscreen ? "left-[13px]" : "left-[11px]"
          )}
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
      <div className={cn("flex-1 min-w-0", isFullscreen ? "pb-7" : "pb-6")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "font-medium transition-all",
                isFullscreen ? "text-base" : "text-sm",
                step.status === "completed" ? "text-foreground" : 
                step.status === "active" ? "text-foreground" : 
                "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
            <p className={cn(
              "text-muted-foreground mt-0.5 leading-relaxed transition-all",
              isFullscreen ? "text-sm" : "text-xs"
            )}>
              {step.detail}
            </p>
          </div>
          
          {/* Value moment badge */}
          {step.isValueMoment && step.status === "completed" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex-shrink-0 font-medium rounded-full bg-accent/10 text-accent border border-accent/20 transition-all",
                isFullscreen ? "text-xs px-3 py-1" : "text-[10px] px-2 py-0.5"
              )}
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

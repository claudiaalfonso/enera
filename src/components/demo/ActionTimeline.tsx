import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { TimelineStep } from "./TimelineItem";
import { cn } from "@/lib/utils";

interface ActionTimelineProps {
  steps: TimelineStep[];
  isFullscreen?: boolean;
}

const ActionTimeline = ({ steps, isFullscreen = false }: ActionTimelineProps) => {
  // Only show active and last 2 completed steps (minimal, voice-first)
  const completedSteps = steps.filter(s => s.status === "completed");
  const activeStep = steps.find(s => s.status === "active");
  
  // Show only the last completed + active (max 2 items)
  const lastCompleted = completedSteps.slice(-1);
  const visibleSteps = [...lastCompleted, activeStep].filter(Boolean) as TimelineStep[];
  
  if (visibleSteps.length === 0) {
    return (
      <div className={cn(
        "flex items-center gap-3 py-6 transition-all",
        isFullscreen && "py-8"
      )}>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <p className={cn(
          "text-muted-foreground/60 transition-all",
          isFullscreen ? "text-sm" : "text-xs"
        )}>
          Waiting...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="popLayout">
        {visibleSteps.map((step) => (
          <motion.div
            key={step.id}
            className={cn(
              "flex items-center gap-3 transition-all",
              step.status === "active" ? "opacity-100" : "opacity-50"
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: step.status === "active" ? 1 : 0.5, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Icon */}
            <div className={cn(
              "flex-shrink-0 rounded-full flex items-center justify-center transition-all",
              isFullscreen ? "w-6 h-6" : "w-5 h-5",
              step.status === "completed" 
                ? "bg-success/20" 
                : "bg-enera-brand/20"
            )}>
              {step.status === "completed" ? (
                <Check className={cn(
                  "text-success transition-all",
                  isFullscreen ? "w-3.5 h-3.5" : "w-3 h-3"
                )} strokeWidth={3} />
              ) : (
                <Loader2 className={cn(
                  "text-enera-brand animate-spin transition-all",
                  isFullscreen ? "w-3.5 h-3.5" : "w-3 h-3"
                )} />
              )}
            </div>

            {/* Label - short and punchy */}
            <span className={cn(
              "font-medium transition-all",
              isFullscreen ? "text-sm" : "text-xs",
              step.status === "active" 
                ? "text-foreground" 
                : "text-muted-foreground"
            )}>
              {step.label}
              {step.detail && (
                <span className="text-muted-foreground/60 ml-1.5">
                  {step.detail}
                </span>
              )}
            </span>

            {/* Value badge - compact */}
            {step.isValueMoment && step.status === "completed" && (
              <span className={cn(
                "font-medium rounded-full bg-success/10 text-success px-2 py-0.5 transition-all",
                isFullscreen ? "text-[10px]" : "text-[9px]"
              )}>
                Revenue+
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActionTimeline;

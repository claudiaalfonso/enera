import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { TimelineStep } from "./TimelineItem";
import { cn } from "@/lib/utils";

interface ActionTimelineProps {
  steps: TimelineStep[];
  isFullscreen?: boolean;
}

const ActionTimeline = ({ steps, isFullscreen = false }: ActionTimelineProps) => {
  // Only show active step (minimal, voice-first)
  const activeStep = steps.find(s => s.status === "active");
  const lastCompleted = steps.filter(s => s.status === "completed").slice(-1)[0];

  // Show max 2: last completed (faded) + active
  const visibleSteps = [lastCompleted, activeStep].filter(Boolean) as TimelineStep[];

  // Silence/noise = clean screen
  if (visibleSteps.length === 0) return null;


  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="popLayout">
        {visibleSteps.map((step) => {
          const isActive = step.status === "active";
          
          return (
            <motion.div
              key={step.id}
              className={cn(
                "flex items-center gap-2.5",
                isActive ? "opacity-100" : "opacity-40"
              )}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: isActive ? 1 : 0.4, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon - Compact */}
              <div className={cn(
                "flex-shrink-0 rounded-full flex items-center justify-center",
                isFullscreen ? "w-5 h-5" : "w-4 h-4",
                step.status === "completed" 
                  ? "bg-success/15" 
                  : "bg-enera-brand/15"
              )}>
                {step.status === "completed" ? (
                  <Check className={cn(
                    "text-success",
                    isFullscreen ? "w-3 h-3" : "w-2.5 h-2.5"
                  )} strokeWidth={3} />
                ) : (
                  <Loader2 className={cn(
                    "text-enera-brand animate-spin",
                    isFullscreen ? "w-3 h-3" : "w-2.5 h-2.5"
                  )} />
                )}
              </div>

              {/* Label - Larger */}
              <span className={cn(
                "font-medium",
                isFullscreen ? "text-base" : "text-sm",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
                {step.detail && (
                  <span className="text-muted-foreground/50 ml-1">
                    {step.detail}
                  </span>
                )}
              </span>

              {/* Value badge */}
              {step.isValueMoment && step.status === "completed" && (
                <span className={cn(
                  "font-semibold rounded bg-success/10 text-success px-1.5 py-0.5",
                  isFullscreen ? "text-[10px]" : "text-[9px]"
                )}>
                  +Revenue
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActionTimeline;

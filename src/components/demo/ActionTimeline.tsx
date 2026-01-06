import { motion } from "framer-motion";
import TimelineItem, { TimelineStep } from "./TimelineItem";

interface ActionTimelineProps {
  steps: TimelineStep[];
}

const ActionTimeline = ({ steps }: ActionTimelineProps) => {
  const visibleSteps = steps.filter(s => s.status !== "pending");
  
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {visibleSteps.length === 0 ? (
        <div className="flex items-center gap-3 py-8 px-4">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-accent animate-dot-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-accent animate-dot-bounce" style={{ animationDelay: '160ms' }} />
            <span className="w-2 h-2 rounded-full bg-accent animate-dot-bounce" style={{ animationDelay: '320ms' }} />
          </div>
          <p className="text-sm text-muted-foreground">Waiting for interaction...</p>
        </div>
      ) : (
        <div className="space-y-0">
          {visibleSteps.map((step, index) => (
            <TimelineItem
              key={step.id}
              step={step}
              index={index}
              isLast={index === visibleSteps.length - 1}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ActionTimeline;

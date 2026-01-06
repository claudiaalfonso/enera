import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoHeaderProps {
  isFullscreen?: boolean;
}

const DemoHeader = ({ isFullscreen = false }: DemoHeaderProps) => {
  return (
    <motion.header
      className={cn(
        "flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm transition-all duration-300",
        isFullscreen ? "px-8 py-5" : "px-6 py-4"
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-enera transition-all",
          isFullscreen ? "w-11 h-11" : "w-9 h-9"
        )}>
          <Sparkles className={cn(
            "text-accent-foreground transition-all",
            isFullscreen ? "w-5 h-5" : "w-4 h-4"
          )} />
        </div>
        <div>
          <h1 className={cn(
            "font-semibold text-foreground tracking-tight transition-all",
            isFullscreen ? "text-xl" : "text-base"
          )}>
            enera
          </h1>
          <p className={cn(
            "text-muted-foreground uppercase tracking-wider transition-all",
            isFullscreen ? "text-xs" : "text-[10px]"
          )}>
            Voice AI Demo
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 transition-all",
          isFullscreen ? "px-4 py-2" : "px-3 py-1.5"
        )}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className={cn(
            "font-medium text-accent transition-all",
            isFullscreen ? "text-sm" : "text-xs"
          )}>
            Amelia Active
          </span>
        </div>
      </div>
    </motion.header>
  );
};

export default DemoHeader;

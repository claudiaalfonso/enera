import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const DemoHeader = () => {
  return (
    <motion.header
      className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-enera">
          <Sparkles className="w-4.5 h-4.5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground tracking-tight">
            enera
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Voice AI Demo
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-xs font-medium text-accent">Amelia Active</span>
        </div>
      </div>
    </motion.header>
  );
};

export default DemoHeader;

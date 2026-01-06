import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import eneraWaveIcon from "@/assets/enera-wave-icon.png";

interface DemoHeaderProps {
  isFullscreen?: boolean;
}

const DemoHeader = ({ isFullscreen = false }: DemoHeaderProps) => {
  return (
    <motion.header
      className={cn(
        "flex items-center justify-between border-b border-border/30 bg-card/60 backdrop-blur-sm",
        isFullscreen ? "px-6 py-3" : "px-4 py-2"
      )}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo - Compact */}
      <div className="flex items-center gap-2">
        <div className="bg-white rounded-lg shadow-sm p-1 border border-enera-brand/10">
          <img 
            src={eneraWaveIcon} 
            alt="" 
            className={cn(
              "object-contain",
              isFullscreen ? "h-6 w-6" : "h-5 w-5"
            )}
          />
        </div>
        <span className={cn(
          "font-semibold tracking-tight text-enera-brand",
          isFullscreen ? "text-base" : "text-sm"
        )}>
          Enera
        </span>
      </div>

      {/* Amelia status - Compact */}
      <div className={cn(
        "flex items-center gap-1.5 rounded-full bg-enera-brand/8 border border-enera-brand/15",
        isFullscreen ? "px-3 py-1.5" : "px-2.5 py-1"
      )}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-enera-brand opacity-50"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-enera-brand"></span>
        </span>
        <span className={cn(
          "font-medium text-enera-brand",
          isFullscreen ? "text-xs" : "text-[11px]"
        )}>
          Amelia
        </span>
      </div>
    </motion.header>
  );
};

export default DemoHeader;

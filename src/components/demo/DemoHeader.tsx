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
        "flex items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300",
        isFullscreen ? "px-8 py-5" : "px-6 py-3.5"
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        {/* Wave icon in styled container */}
        <div className="relative">
          <div className="bg-white rounded-xl shadow-sm shadow-enera-brand/5 p-1.5 border border-enera-brand/8">
            <img 
              src={eneraWaveIcon} 
              alt="" 
              className={cn(
                "object-contain transition-all",
                isFullscreen ? "h-8 w-8" : "h-6 w-6"
              )}
            />
          </div>
        </div>
        {/* Enera text */}
        <span className={cn(
          "font-medium tracking-tight text-enera-brand transition-all",
          isFullscreen ? "text-xl" : "text-lg"
        )}>
          Enera
        </span>
      </div>

      {/* Right side - Amelia status */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center gap-2 rounded-full bg-enera-brand/8 border border-enera-brand/15 transition-all",
          isFullscreen ? "px-4 py-2" : "px-3 py-1.5"
        )}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-enera-brand opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-enera-brand"></span>
          </span>
          <span className={cn(
            "font-medium text-enera-brand transition-all",
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

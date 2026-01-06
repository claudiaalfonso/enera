import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import eneraLogo from "@/assets/enera-logo.png";

interface WelcomeOverlayProps {
  onStart: () => void;
}

const WelcomeOverlay = ({ onStart }: WelcomeOverlayProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background page-gradient"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Subtle radial glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-enera-brand/5 blur-3xl" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <img 
            src={eneraLogo} 
            alt="Enera" 
            className="h-14 object-contain"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl md:text-3xl font-semibold text-foreground mb-3 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Amelia Voice AI Demo
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-base md:text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Watch Amelia resolve a real EV charging issue in real time
        </motion.p>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="h-12 px-8 rounded-full bg-enera-brand hover:bg-enera-brand/90 text-white font-medium shadow-lg shadow-enera-brand/20 transition-all hover:shadow-xl hover:shadow-enera-brand/25 hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Demo
          </Button>
        </motion.div>

        {/* Keyboard hint */}
        <motion.p
          className="text-xs text-muted-foreground/60 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Space</kbd> to start
        </motion.p>
      </motion.div>

      {/* Bottom tagline */}
      <motion.div
        className="absolute bottom-8 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p className="text-xs text-muted-foreground/50">
          Intelligent Driver Support for CPOs
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeOverlay;

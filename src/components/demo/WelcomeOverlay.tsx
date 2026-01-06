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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Subtle background gradient - barely perceptible */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 80% at 50% 20%, hsl(168 30% 96% / 0.6) 0%, transparent 50%),
              radial-gradient(ellipse 80% 60% at 80% 80%, hsl(168 25% 95% / 0.4) 0%, transparent 40%),
              radial-gradient(ellipse 60% 50% at 20% 90%, hsl(200 20% 96% / 0.3) 0%, transparent 40%)
            `
          }}
        />
      </div>

      {/* Content container with perfect vertical rhythm */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6 max-w-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo - anchoring presence */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <img 
            src={eneraLogo} 
            alt="Enera" 
            className="h-12 object-contain"
          />
        </motion.div>

        {/* Headline - confident but approachable */}
        <motion.h1
          className="text-[1.75rem] md:text-[2rem] font-medium text-foreground mb-4 tracking-[-0.02em] text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          Amelia Voice AI Demo
        </motion.h1>

        {/* Subheading - calm promise */}
        <motion.p
          className="text-base text-muted-foreground mb-12 text-center leading-relaxed max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          Watch Amelia resolve a real EV charging issue in real time
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          <Button
            size="lg"
            onClick={onStart}
            className="h-12 px-7 rounded-full bg-enera-brand hover:bg-enera-brand/90 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-enera-brand/15 active:scale-[0.98]"
          >
            <Play className="w-4 h-4 mr-2.5 fill-current" />
            Start Demo
          </Button>
        </motion.div>

        {/* Keyboard hint - refined and intentional */}
        <motion.p
          className="text-[13px] text-muted-foreground/50 mt-8 tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          or press{" "}
          <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground/70 font-mono text-[11px] tracking-normal">
            Space
          </kbd>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeOverlay;

import { motion } from "framer-motion";
import eneraWaveIcon from "@/assets/enera-wave-icon.png";

// Animated wave background component - defined first so it can be used in LoadingState
const WaveBackground = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(168 48% 40% / 0.04)" />
          <stop offset="100%" stopColor="hsl(168 48% 40% / 0.01)" />
        </linearGradient>
        <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(168 48% 40% / 0.03)" />
          <stop offset="100%" stopColor="hsl(168 48% 40% / 0.005)" />
        </linearGradient>
        <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(168 48% 40% / 0.02)" />
          <stop offset="100%" stopColor="hsl(168 48% 40% / 0)" />
        </linearGradient>
      </defs>

      {/* Wave 1 - Slow, large */}
      <motion.path
        d="M0,450 C360,350 720,550 1080,450 C1260,400 1380,420 1440,450 L1440,900 L0,900 Z"
        fill="url(#waveGradient1)"
        initial={{ d: "M0,450 C360,350 720,550 1080,450 C1260,400 1380,420 1440,450 L1440,900 L0,900 Z" }}
        animate={{
          d: [
            "M0,450 C360,350 720,550 1080,450 C1260,400 1380,420 1440,450 L1440,900 L0,900 Z",
            "M0,480 C360,400 720,500 1080,420 C1260,380 1380,450 1440,480 L1440,900 L0,900 Z",
            "M0,450 C360,350 720,550 1080,450 C1260,400 1380,420 1440,450 L1440,900 L0,900 Z",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Wave 2 - Medium speed */}
      <motion.path
        d="M0,550 C480,480 960,620 1440,550 L1440,900 L0,900 Z"
        fill="url(#waveGradient2)"
        initial={{ d: "M0,550 C480,480 960,620 1440,550 L1440,900 L0,900 Z" }}
        animate={{
          d: [
            "M0,550 C480,480 960,620 1440,550 L1440,900 L0,900 Z",
            "M0,520 C480,580 960,500 1440,560 L1440,900 L0,900 Z",
            "M0,550 C480,480 960,620 1440,550 L1440,900 L0,900 Z",
          ],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Wave 3 - Faster, smaller */}
      <motion.path
        d="M0,650 C360,600 720,700 1080,650 C1260,625 1380,660 1440,650 L1440,900 L0,900 Z"
        fill="url(#waveGradient3)"
        initial={{ d: "M0,650 C360,600 720,700 1080,650 C1260,625 1380,660 1440,650 L1440,900 L0,900 Z" }}
        animate={{
          d: [
            "M0,650 C360,600 720,700 1080,650 C1260,625 1380,660 1440,650 L1440,900 L0,900 Z",
            "M0,670 C360,720 720,640 1080,680 C1260,700 1380,650 1440,670 L1440,900 L0,900 Z",
            "M0,650 C360,600 720,700 1080,650 C1260,625 1380,660 1440,650 L1440,900 L0,900 Z",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </svg>
  );
};

const LoadingState = () => {
  return (
    <motion.div
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Wave background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <WaveBackground />
      </div>

      {/* Loading content */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {/* Pulsing wave icon */}
        <div className="relative mb-6">
          {/* Outer glow ring */}
          <motion.div
            className="absolute inset-0 bg-enera-brand/20 rounded-3xl blur-xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.15, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Icon container with pulse */}
          <motion.div
            className="relative bg-white rounded-2xl shadow-lg shadow-enera-brand/15 p-4 border border-enera-brand/10"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img 
              src={eneraWaveIcon} 
              alt="Enera" 
              className="h-12 w-12 object-contain"
            />
          </motion.div>
        </div>

        {/* Loading text */}
        <motion.p
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading demo...
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingState;

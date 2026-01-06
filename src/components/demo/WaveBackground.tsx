import { motion } from "framer-motion";

interface WaveBackgroundProps {
  opacity?: number;
}

const WaveBackground = ({ opacity = 1 }: WaveBackgroundProps) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgWaveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(168 48% 40% / 0.035)" />
            <stop offset="100%" stopColor="hsl(168 48% 40% / 0.01)" />
          </linearGradient>
          <linearGradient id="bgWaveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(168 48% 40% / 0.025)" />
            <stop offset="100%" stopColor="hsl(168 48% 40% / 0.005)" />
          </linearGradient>
          <linearGradient id="bgWaveGradient3" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(168 48% 40% / 0.02)" />
            <stop offset="100%" stopColor="hsl(168 48% 40% / 0)" />
          </linearGradient>
        </defs>

        {/* Top wave - gentle, slow */}
        <motion.path
          d="M0,120 C240,80 480,160 720,120 C960,80 1200,140 1440,100 L1440,0 L0,0 Z"
          fill="url(#bgWaveGradient1)"
          animate={{
            d: [
              "M0,120 C240,80 480,160 720,120 C960,80 1200,140 1440,100 L1440,0 L0,0 Z",
              "M0,100 C240,140 480,100 720,140 C960,120 1200,80 1440,120 L1440,0 L0,0 Z",
              "M0,120 C240,80 480,160 720,120 C960,80 1200,140 1440,100 L1440,0 L0,0 Z",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Bottom left wave */}
        <motion.path
          d="M0,750 C180,720 360,780 540,750 C720,720 900,760 1080,740 L1080,900 L0,900 Z"
          fill="url(#bgWaveGradient2)"
          animate={{
            d: [
              "M0,750 C180,720 360,780 540,750 C720,720 900,760 1080,740 L1080,900 L0,900 Z",
              "M0,740 C180,770 360,730 540,760 C720,750 900,720 1080,750 L1080,900 L0,900 Z",
              "M0,750 C180,720 360,780 540,750 C720,720 900,760 1080,740 L1080,900 L0,900 Z",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Right side wave */}
        <motion.path
          d="M1200,300 C1280,250 1360,350 1440,300 L1440,600 C1360,550 1280,650 1200,600 Z"
          fill="url(#bgWaveGradient3)"
          animate={{
            d: [
              "M1200,300 C1280,250 1360,350 1440,300 L1440,600 C1360,550 1280,650 1200,600 Z",
              "M1200,320 C1280,350 1360,280 1440,320 L1440,580 C1360,620 1280,560 1200,580 Z",
              "M1200,300 C1280,250 1360,350 1440,300 L1440,600 C1360,550 1280,650 1200,600 Z",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle center ripple */}
        <motion.ellipse
          cx="720"
          cy="450"
          rx="400"
          ry="200"
          fill="none"
          stroke="hsl(168 48% 40% / 0.02)"
          strokeWidth="1"
          animate={{
            rx: [400, 450, 400],
            ry: [200, 220, 200],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
};

export default WaveBackground;

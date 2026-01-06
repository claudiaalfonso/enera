import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DemoHeader from "@/components/demo/DemoHeader";
import SystemPanel from "@/components/demo/SystemPanel";
import ConversationPanel from "@/components/demo/ConversationPanel";
import PresentationControls from "@/components/demo/PresentationControls";
import WelcomeOverlay from "@/components/demo/WelcomeOverlay";
import LoadingState from "@/components/demo/LoadingState";
import WaveBackground from "@/components/demo/WaveBackground";
import SyncCalibrationOverlay from "@/components/demo/SyncCalibrationOverlay";
import { useDemoSequence } from "@/hooks/useDemoSequence";
import { cn } from "@/lib/utils";

// Staggered intro animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const leftPanelVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const rightPanelVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const controlsVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [demoStarted, setDemoStarted] = useState(false);

  const {
    messages,
    steps,
    currentStatus,
    isProcessing,
    showConfirmation,
    isComplete,
    isPlaying,
    currentStepIndex,
    totalSteps,
    currentCue,
    audioCurrentTime,
    reset,
    goToNext,
    goToPrevious,
    togglePlayPause,
    audioRef,
    startDemo
  } = useDemoSequence();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  // Simulate loading state for assets
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Handle compact mode toggle
  const toggleCompact = useCallback(() => {
    setIsCompact(prev => !prev);
  }, []);

  // Handle demo start
  const handleStartDemo = useCallback(() => {
    setShowWelcome(false);
    // Small delay for overlay fade out
    setTimeout(() => {
      setDemoStarted(true);
      startDemo();
    }, 300);
  }, [startDemo]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Sync fullscreen state with actual fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(audioRef.current.muted);
    }
  }, [audioRef]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Start demo with space if welcome is showing
      if (showWelcome && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        handleStartDemo();
        return;
      }

      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "ArrowRight" || e.key === "l") {
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        goToPrevious();
      } else if (e.key === "f") {
        toggleFullscreen();
      } else if (e.key === "m") {
        toggleMute();
      } else if (e.key === "c") {
        toggleCompact();
      } else if (e.key === "r") {
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWelcome, handleStartDemo, togglePlayPause, goToNext, goToPrevious, toggleFullscreen, toggleMute, toggleCompact, reset]);

  return (
    <div className={cn(
      "h-screen flex flex-col overflow-hidden bg-background",
      isFullscreen && "presentation-mode"
    )}>
      {/* Wave Background Animation */}
      <WaveBackground opacity={showWelcome || isLoading ? 0 : 0.8} />

      {/* SEO */}
      <title>Amelia Voice AI Demo | Enera</title>
      <meta name="description" content="Experience Amelia, Enera's intelligent Voice AI that resolves EV charging issues in real-time. Enterprise-grade support automation." />

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && <LoadingState />}
      </AnimatePresence>

      {/* Welcome Overlay */}
      <AnimatePresence>
        {!isLoading && showWelcome && (
          <WelcomeOverlay onStart={handleStartDemo} />
        )}
      </AnimatePresence>

      {/* Main Demo UI */}
      <motion.div
        className="flex flex-col h-full"
        variants={containerVariants}
        initial="hidden"
        animate={demoStarted ? "visible" : "hidden"}
      >
        {/* Header */}
        <motion.div variants={headerVariants}>
          <DemoHeader isFullscreen={isFullscreen} />
        </motion.div>

        {/* Main Content - Compact centered layout */}
        <main className={cn(
          "flex-1 flex justify-center items-stretch min-h-0",
          !isCompact && "pb-12"
        )}>
          <div className={cn(
            "flex w-full",
            isFullscreen ? "max-w-6xl" : "max-w-5xl",
            "mx-auto"
          )}>
            {/* Left Panel - System View (60%) */}
            <motion.div
              className="border-r border-border/30 bg-card/40 backdrop-blur-sm w-3/5"
              variants={leftPanelVariants}
            >
              <SystemPanel
                currentStatus={currentStatus}
                isProcessing={isProcessing}
                showConfirmation={showConfirmation}
                isFullscreen={isFullscreen}
              />
            </motion.div>

            {/* Right Panel - Conversation (40%) */}
            <motion.div
              className="bg-enera-surface-elevated/60 backdrop-blur-sm w-2/5"
              variants={rightPanelVariants}
            >
              <ConversationPanel
                messages={messages}
                isFullscreen={isFullscreen}
                audioRef={audioRef}
                isPlaying={isPlaying}
                currentCue={currentCue}
              />
            </motion.div>
          </div>
        </main>

        {/* Presentation Controls */}
        <AnimatePresence>
          {!isCompact && (
            <motion.div
              variants={controlsVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            >
              <PresentationControls
                isPlaying={isPlaying}
                isComplete={isComplete}
                currentStep={currentStepIndex}
                totalSteps={totalSteps}
                isFullscreen={isFullscreen}
                isMuted={isMuted}
                isCompact={isCompact}
                onTogglePlay={togglePlayPause}
                onNext={goToNext}
                onPrevious={goToPrevious}
                onToggleFullscreen={toggleFullscreen}
                onToggleMute={toggleMute}
                onToggleCompact={toggleCompact}
                onReset={reset}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Mode Indicator */}
        <AnimatePresence>
          {isCompact && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
            >
              <button
                onClick={toggleCompact}
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/80 backdrop-blur-md border border-border/30 shadow-lg hover:bg-card transition-colors group"
              >
                {/* Progress indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-enera-brand rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, ((currentStepIndex + 1) / totalSteps) * 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {Math.max(1, currentStepIndex + 1)}/{totalSteps}
                  </span>
                </div>
                
                <div className="w-px h-3 bg-border/50" />
                
                {/* Hint */}
                <span className="text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px] font-medium">C</kbd> to show controls
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev Sync Calibration Overlay */}
        <SyncCalibrationOverlay 
          audioRef={audioRef}
          currentCue={currentCue}
          audioCurrentTime={audioCurrentTime}
          isPlaying={isPlaying}
        />

        {/* Powered by Enera Footer Badge */}
        <motion.div
          className="fixed bottom-3 right-4 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <span className="text-[10px] text-muted-foreground/50 tracking-wide uppercase">
            Powered by <span className="text-enera-brand/60 font-medium">Enera</span>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;

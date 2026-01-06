import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DemoHeader from "@/components/demo/DemoHeader";
import SystemPanel from "@/components/demo/SystemPanel";
import ConversationPanel from "@/components/demo/ConversationPanel";
import PresentationControls from "@/components/demo/PresentationControls";
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
  const {
    messages,
    steps,
    currentStatus,
    isProcessing,
    showConfirmation,
    isComplete,
    isPlaying,
    playMode,
    currentStepIndex,
    totalSteps,
    reset,
    goToNext,
    goToPrevious,
    togglePlayPause,
    switchMode,
    audioRef
  } = useDemoSequence("auto");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isIntroComplete, setIsIntroComplete] = useState(false);

  // Mark intro as complete after animation
  useEffect(() => {
    const timer = setTimeout(() => setIsIntroComplete(true), 1200);
    return () => clearTimeout(timer);
  }, []);

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
      } else if (e.key === "r") {
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, goToNext, goToPrevious, toggleFullscreen, toggleMute, reset]);

  return (
    <motion.div 
      className={cn(
        "h-screen flex flex-col overflow-hidden bg-background page-gradient",
        isFullscreen && "presentation-mode"
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* SEO */}
      <title>Amelia Voice AI Demo | Enera</title>
      <meta name="description" content="Experience Amelia, Enera's intelligent Voice AI that resolves EV charging issues in real-time. Enterprise-grade support automation." />

      {/* Header */}
      <motion.div variants={headerVariants}>
        <DemoHeader isFullscreen={isFullscreen} />
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 flex min-h-0 pb-14">
        {/* Left Panel - System View (60%) */}
        <motion.div
          className={cn(
            "border-r border-border/50 bg-card/60 backdrop-blur-sm flex-shrink-0 transition-all duration-300",
            isFullscreen ? "w-[55%]" : "w-[60%]"
          )}
          variants={leftPanelVariants}
        >
          <SystemPanel
            currentStatus={currentStatus}
            isProcessing={isProcessing}
            steps={steps}
            showConfirmation={showConfirmation}
            isFullscreen={isFullscreen}
          />
        </motion.div>

        {/* Right Panel - Conversation (40%) */}
        <motion.div
          className={cn(
            "bg-enera-surface-elevated/80 backdrop-blur-sm flex-shrink-0 transition-all duration-300",
            isFullscreen ? "w-[45%]" : "w-[40%]"
          )}
          variants={rightPanelVariants}
        >
          <ConversationPanel messages={messages} isFullscreen={isFullscreen} />
        </motion.div>
      </main>

      {/* Presentation Controls */}
      <motion.div variants={controlsVariants}>
        <PresentationControls
          isPlaying={isPlaying}
          isComplete={isComplete}
          playMode={playMode}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          isFullscreen={isFullscreen}
          isMuted={isMuted}
          onTogglePlay={togglePlayPause}
          onNext={goToNext}
          onPrevious={goToPrevious}
          onSwitchMode={switchMode}
          onToggleFullscreen={toggleFullscreen}
          onToggleMute={toggleMute}
          onReset={reset}
        />
      </motion.div>
    </motion.div>
  );
};

export default Index;

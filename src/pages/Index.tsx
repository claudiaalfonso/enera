import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import DemoHeader from "@/components/demo/DemoHeader";
import SystemPanel from "@/components/demo/SystemPanel";
import ConversationPanel from "@/components/demo/ConversationPanel";
import PresentationControls from "@/components/demo/PresentationControls";
import { useDemoSequence } from "@/hooks/useDemoSequence";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "h-screen flex flex-col overflow-hidden bg-background transition-all duration-300",
      isFullscreen && "presentation-mode"
    )}>
      {/* SEO */}
      <title>Amelia Voice AI Demo | Enera</title>
      <meta name="description" content="Experience Amelia, Enera's intelligent Voice AI that resolves EV charging issues in real-time. Enterprise-grade support automation." />

      <DemoHeader isFullscreen={isFullscreen} />

      {/* Main Content */}
      <main className="flex-1 flex min-h-0 pb-16">
        {/* Left Panel - System View (60%) */}
        <motion.div
          className={cn(
            "border-r border-border bg-card flex-shrink-0 transition-all duration-300",
            isFullscreen ? "w-[55%]" : "w-[60%]"
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
            "bg-enera-surface-elevated flex-shrink-0 transition-all duration-300",
            isFullscreen ? "w-[45%]" : "w-[40%]"
          )}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ConversationPanel messages={messages} isFullscreen={isFullscreen} />
        </motion.div>
      </main>

      {/* Presentation Controls */}
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
    </div>
  );
};

export default Index;

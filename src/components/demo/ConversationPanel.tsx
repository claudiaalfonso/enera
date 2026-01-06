import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "./ChatMessage";
import AudioVisualizer from "./AudioVisualizer";
import { CurrentPhraseState } from "@/hooks/useDemoSequence";

interface ConversationPanelProps {
  messages: Message[];
  isFullscreen?: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
  currentPhrase?: CurrentPhraseState;
}

const ConversationPanel = ({ 
  messages, 
  isFullscreen = false,
  audioRef,
  isPlaying = false,
  currentPhrase
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevSpeaker, setPrevSpeaker] = useState<string | null>(null);
  const [speakerChangeKey, setSpeakerChangeKey] = useState(0);

  const currentSpeaker = currentPhrase?.role;
  const hasContent = currentPhrase && currentPhrase.visiblePhrases.length > 0;
  
  // Track speaker changes for transition effects
  useEffect(() => {
    if (currentSpeaker && currentSpeaker !== prevSpeaker) {
      setPrevSpeaker(currentSpeaker);
      setSpeakerChangeKey(k => k + 1);
    }
  }, [currentSpeaker, prevSpeaker]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentPhrase?.visiblePhrases.length]);

  // Kinetic caption animation - subtle pop with micro-bounce
  const phraseVariants = {
    initial: { 
      opacity: 0, 
      y: 6,
      scale: 0.98
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.1, 0.25, 1.0] as const,
      }
    },
    exit: { 
      opacity: 0.4,
      transition: { duration: 0.15 }
    }
  };

  // Latest phrase gets subtle emphasis
  const latestPhraseVariants = {
    initial: { 
      opacity: 0, 
      y: 8,
      scale: 0.96
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.34, 1.56, 0.64, 1] as const,
      }
    }
  };

  const isAmelia = currentPhrase?.role === "amelia";

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Border pulse effect on speaker change */}
      <AnimatePresence>
        {hasContent && (
          <motion.div
            key={`border-pulse-${speakerChangeKey}`}
            className={cn(
              "absolute inset-0 rounded-xl pointer-events-none z-10",
              isAmelia 
                ? "ring-2 ring-enera-brand/30" 
                : "ring-2 ring-muted-foreground/20"
            )}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 1.005 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Header - Compact */}
      <div className={cn(
        "flex-shrink-0 border-b border-border/20 bg-enera-surface-elevated/20 transition-all",
        isFullscreen ? "px-6 py-2" : "px-4 py-1.5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <Phone className={cn(
                "text-enera-brand",
                isFullscreen ? "w-3.5 h-3.5" : "w-3 h-3"
              )} />
              {hasContent && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-success rounded-full" />
              )}
            </div>
            <span className={cn(
              "font-medium text-foreground/70",
              isFullscreen ? "text-xs" : "text-[11px]"
            )}>
              Live
            </span>
          </div>

          {/* Audio Visualizer */}
          {audioRef && (
            <AudioVisualizer 
              audioRef={audioRef} 
              isPlaying={isPlaying} 
              isFullscreen={isFullscreen} 
            />
          )}
        </div>
      </div>

      {/* Messages - Kinetic captions */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 flex flex-col justify-center items-center",
          isFullscreen ? "px-8 py-6" : "px-6 py-4"
        )}
      >
        {!hasContent ? (
          // Empty state - NOTHING during silence
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={cn(
              "rounded-full bg-muted/20 flex items-center justify-center mb-2",
              isFullscreen ? "w-12 h-12" : "w-10 h-10"
            )}>
              <Phone className={cn(
                "text-muted-foreground/30",
                isFullscreen ? "w-5 h-5" : "w-4 h-4"
              )} />
            </div>
            <p className={cn(
              "text-muted-foreground/50",
              isFullscreen ? "text-sm" : "text-xs"
            )}>
              Waiting...
            </p>
          </motion.div>
        ) : (
          <div className="w-full max-w-md relative">
            {/* Enhanced background glow */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`glow-${currentPhrase?.role}-${speakerChangeKey}`}
                className={cn(
                  "absolute -inset-8 -z-10 rounded-3xl blur-3xl pointer-events-none",
                  isAmelia 
                    ? "bg-enera-brand" 
                    : "bg-muted-foreground"
                )}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ 
                  opacity: isAmelia ? 0.2 : 0.12,
                  scale: 1.1,
                  x: isAmelia ? "12%" : "-12%"
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </AnimatePresence>

            {/* Active message with kinetic phrases */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhrase?.messageId}
                initial={{ opacity: 0, x: isAmelia ? 15 : -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAmelia ? -10 : 10 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Speaker Label */}
                <motion.div 
                  className={cn(
                    "flex items-center gap-1.5 mb-2",
                    isAmelia ? "justify-end" : "justify-start"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.2 }}
                >
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest font-semibold",
                    isAmelia ? "text-enera-brand" : "text-muted-foreground/60"
                  )}>
                    {isAmelia ? "Amelia" : "Driver"}
                  </span>
                  <motion.span 
                    className="flex gap-0.5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      isAmelia ? "bg-enera-brand/80" : "bg-muted-foreground/40"
                    )} />
                    <span 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        isAmelia ? "bg-enera-brand/80" : "bg-muted-foreground/40"
                      )} 
                      style={{ animationDelay: "150ms" }} 
                    />
                  </motion.span>
                </motion.div>

                {/* Kinetic Phrase Display - only show last 2-3 phrases */}
                <div className={cn(
                  "space-y-1",
                  isAmelia ? "text-right" : "text-left"
                )}>
                  {currentPhrase?.visiblePhrases.slice(-3).map((phrase, idx) => {
                    const actualIdx = (currentPhrase?.visiblePhrases.length ?? 0) - 3 + idx;
                    const isLatest = actualIdx === currentPhrase?.latestPhraseIndex;
                    const isOlder = actualIdx < (currentPhrase?.latestPhraseIndex ?? 0);
                    
                    return (
                      <motion.p
                        key={`${currentPhrase?.messageId}-${actualIdx}`}
                        className={cn(
                          "leading-relaxed font-medium",
                          isFullscreen ? "text-xl" : "text-lg",
                          isAmelia ? "text-foreground" : "text-foreground/90",
                          isOlder && "opacity-50"
                        )}
                        variants={isLatest ? latestPhraseVariants : phraseVariants}
                        initial="initial"
                        animate="animate"
                      >
                        {isLatest ? (
                          // Latest phrase with subtle highlight
                          <motion.span
                            className="relative inline"
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {phrase}
                            {/* Subtle glow on latest phrase */}
                            <motion.span
                              className={cn(
                                "absolute -inset-1 -z-10 blur-md rounded-lg",
                                isAmelia ? "bg-enera-brand/15" : "bg-foreground/5"
                              )}
                              initial={{ opacity: 0.5, scale: 1.05 }}
                              animate={{ opacity: 0, scale: 1 }}
                              transition={{ duration: 0.6 }}
                            />
                          </motion.span>
                        ) : (
                          phrase
                        )}
                      </motion.p>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;

import { useEffect, useRef, useMemo, useState } from "react";
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

// Estimate lines based on character count and container width
// More conservative estimate for larger text
const estimateLines = (text: string, charsPerLine: number = 40): number => {
  if (!text) return 0;
  return Math.ceil(text.length / charsPerLine);
};

const ConversationPanel = ({ 
  messages, 
  isFullscreen = false,
  audioRef,
  isPlaying = false,
  currentPhrase
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track accumulated display text separately from phrase data
  // This allows us to control when resets happen based on 4-line rule
  const [displayState, setDisplayState] = useState<{
    key: number;
    accumulatedText: string;
    role: "driver" | "amelia" | null;
  }>({ key: 0, accumulatedText: "", role: null });
  
  const prevRoleRef = useRef<string | null>(null);
  const lastFullTextRef = useRef<string>("");

  // Check if we have content to show
  const hasContent = currentPhrase && currentPhrase.state !== "hidden" && 
    (currentPhrase.accumulatedText || currentPhrase.currentPhraseText);
  
  // Calculate the full text that would be shown
  const { allWords, latestWordIndex, totalText } = useMemo(() => {
    if (!currentPhrase || currentPhrase.state === "hidden") {
      return { allWords: [], latestWordIndex: -1, totalText: "" };
    }
    
    // For completed state, show all text immediately
    if (currentPhrase.state === "completed") {
      const words = currentPhrase.accumulatedText
        ? currentPhrase.accumulatedText.split(" ").filter(w => w.length > 0)
        : [];
      return { 
        allWords: words, 
        latestWordIndex: words.length - 1,
        totalText: currentPhrase.accumulatedText 
      };
    }
    
    // Active state - progressive reveal
    const accumulatedWords = currentPhrase.accumulatedText
      ? currentPhrase.accumulatedText.split(" ").filter(w => w.length > 0)
      : [];
    
    const currentPhraseWords = currentPhrase.currentPhraseText
      ? currentPhrase.currentPhraseText.split(" ").filter(w => w.length > 0)
      : [];
    
    // Use wordProgress to determine how many words to reveal
    const progress = currentPhrase.wordProgress ?? 0;
    const wordsToReveal = Math.ceil(progress * currentPhraseWords.length);
    const revealedCurrentWords = currentPhraseWords.slice(0, Math.max(1, wordsToReveal));
    
    const allWords = [...accumulatedWords, ...revealedCurrentWords];
    const totalText = allWords.join(" ");
    
    return { 
      allWords, 
      latestWordIndex: allWords.length - 1,
      totalText
    };
  }, [currentPhrase?.accumulatedText, currentPhrase?.currentPhraseText, currentPhrase?.wordProgress, currentPhrase?.state]);

  // 4-line rule: Gentle reset when NEXT content would exceed 4 lines
  // Reset happens BETWEEN thoughts (on speaker change or when lines would exceed)
  useEffect(() => {
    if (!currentPhrase || currentPhrase.state === "hidden") {
      // Clear display on silence
      if (displayState.accumulatedText !== "") {
        setDisplayState({ key: displayState.key, accumulatedText: "", role: null });
      }
      prevRoleRef.current = null;
      lastFullTextRef.current = "";
      return;
    }

    const currentRole = currentPhrase.role;
    const currentLines = estimateLines(totalText);
    
    // Check if we need a reset:
    // 1. Speaker changed (natural paragraph break)
    // 2. Text would exceed 4 lines
    const speakerChanged = prevRoleRef.current !== null && prevRoleRef.current !== currentRole;
    const wouldExceedLines = currentLines > 4;
    
    if (speakerChanged || wouldExceedLines) {
      // Trigger gentle fade reset
      setDisplayState(prev => ({
        key: prev.key + 1,
        accumulatedText: "",
        role: currentRole
      }));
      prevRoleRef.current = currentRole;
      lastFullTextRef.current = "";
    } else {
      // Continue accumulating
      prevRoleRef.current = currentRole;
      lastFullTextRef.current = totalText;
      
      // Update role if needed
      if (displayState.role !== currentRole) {
        setDisplayState(prev => ({ ...prev, role: currentRole }));
      }
    }
  }, [currentPhrase?.role, currentPhrase?.state, totalText]);

  const isAmelia = currentPhrase?.role === "amelia";
  const isCompleted = currentPhrase?.state === "completed";

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
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

      {/* Messages - Word-by-word kinetic reveal with 4-line max */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 flex flex-col justify-center items-center",
          isFullscreen ? "px-8 py-6" : "px-6 py-4"
        )}
      >
        {/* Silence/noise = clean screen */}
        <AnimatePresence mode="wait">
          {!hasContent ? null : (
            <motion.div 
              key={displayState.key}
              className="w-full max-w-lg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.3, ease: "easeOut" } }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Speaker Label */}
              <motion.div
                className={cn(
                  "flex items-center gap-2 mb-3",
                  isAmelia ? "justify-end" : "justify-start"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <span className={cn(
                  "text-[10px] uppercase tracking-widest font-semibold",
                  isAmelia ? "text-enera-brand" : "text-muted-foreground/60"
                )}>
                  {isAmelia ? "Amelia" : "Driver"}
                </span>
                <span className="flex gap-1">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isAmelia ? "bg-enera-brand/70" : "bg-muted-foreground/35"
                  )} />
                  {!isCompleted && (
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      isAmelia ? "bg-enera-brand/35" : "bg-muted-foreground/20"
                    )} />
                  )}
                </span>
              </motion.div>

              {/* Word-by-word reveal - stable, forward-only */}
              <p className={cn(
                "leading-relaxed font-medium",
                isFullscreen ? "text-2xl" : "text-xl",
                isAmelia ? "text-right text-foreground" : "text-left text-foreground/90"
              )}>
                {allWords.map((word, idx) => {
                  const isLatest = idx === latestWordIndex && !isCompleted;
                  const isRecent = idx >= latestWordIndex - 2 || isCompleted;

                  return (
                    <motion.span
                      key={`word-${idx}-${word}`}
                      className={cn(
                        "inline-block mr-[0.25em]",
                        isCompleted ? "opacity-100" : (!isRecent && "opacity-60")
                      )}
                      initial={isCompleted ? false : { opacity: 0, y: 3 }}
                      animate={{ 
                        opacity: isCompleted ? 1 : (isRecent ? 1 : 0.6), 
                        y: 0 
                      }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                    >
                      {isLatest ? (
                        <span className={cn(isAmelia ? "text-enera-brand" : "text-foreground")}>
                          {word}
                        </span>
                      ) : (
                        word
                      )}
                    </motion.span>
                  );
                })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConversationPanel;

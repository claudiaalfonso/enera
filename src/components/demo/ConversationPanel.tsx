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
const estimateLines = (text: string, charsPerLine: number = 35): number => {
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
  const [displayKey, setDisplayKey] = useState(0);

  // Track when to do a clean reset
  const prevMessageIdRef = useRef<string | null>(null);

  // Check if we have content to show
  const hasContent = currentPhrase && currentPhrase.state !== "hidden" && 
    (currentPhrase.accumulatedText || currentPhrase.currentPhraseText);
  
  // Calculate words to show - FORWARD ONLY, never shrinks
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
    // Always show at least 1 word once active, and accelerate reveal
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

  // 4-line max rule: Clean reset when switching messages if content would exceed
  useEffect(() => {
    if (!currentPhrase?.messageId) return;
    
    if (prevMessageIdRef.current !== currentPhrase.messageId) {
      // New message starting - check if we need a clean reset
      const currentLines = estimateLines(totalText);
      if (currentLines > 4 || prevMessageIdRef.current !== null) {
        // Trigger clean reset with new key
        setDisplayKey(k => k + 1);
      }
      prevMessageIdRef.current = currentPhrase.messageId;
    }
  }, [currentPhrase?.messageId, totalText]);

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
              key={`${currentPhrase?.messageId}-${displayKey}`}
              className="w-full max-w-lg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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


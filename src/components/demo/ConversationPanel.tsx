import { useRef, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "./ChatMessage";
import AudioVisualizer from "./AudioVisualizer";
import { CurrentCueState } from "@/hooks/useDemoSequence";

interface ConversationPanelProps {
  messages: Message[];
  isFullscreen?: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
  currentCue?: CurrentCueState;
}

// Estimate lines based on character count
const estimateLines = (text: string, charsPerLine: number = 50): number => {
  if (!text) return 0;
  return Math.ceil(text.length / charsPerLine);
};

const ConversationPanel = ({ 
  messages, 
  isFullscreen = false,
  audioRef,
  isPlaying = false,
  currentCue
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Track display blocks for 4-line rule
  // Each block is a "paragraph" that can hold up to 4 lines
  const [displayBlock, setDisplayBlock] = useState<{
    key: number;
    speaker: "driver" | "amelia" | null;
    text: string;
    startCueId: string | null;
  }>({ key: 0, speaker: null, text: "", startCueId: null });

  const prevCueIdRef = useRef<string | null>(null);

  // Determine what to show based on currentCue
  const hasContent = currentCue && currentCue.cue && currentCue.lifecycle !== "hidden";

  // 4-line rule: Reset block when speaker changes OR text would exceed 4 lines
  useEffect(() => {
    if (!currentCue?.cue) {
      // No cue = silence, clear after a moment of no activity
      if (displayBlock.text && currentCue?.lifecycle === "hidden") {
        setDisplayBlock(prev => ({ ...prev, text: "", speaker: null, startCueId: null }));
      }
      return;
    }

    const cue = currentCue.cue;
    const cueId = cue.id;
    
    // Same cue - just update text if it changed (shouldn't in our deterministic model)
    if (prevCueIdRef.current === cueId) {
      return;
    }

    // New cue detected
    prevCueIdRef.current = cueId;

    // Check if we need to reset block:
    // 1. Speaker changed
    // 2. Adding this text would exceed 4 lines
    const speakerChanged = displayBlock.speaker !== null && displayBlock.speaker !== cue.speaker;
    const potentialText = displayBlock.text ? `${displayBlock.text} ${cue.text}` : cue.text;
    const wouldExceedLines = estimateLines(potentialText) > 4;

    if (speakerChanged || wouldExceedLines) {
      // Start new block with this cue's text
      setDisplayBlock({
        key: displayBlock.key + 1,
        speaker: cue.speaker,
        text: cue.text,
        startCueId: cueId
      });
    } else {
      // Append to current block (same speaker, within line limit)
      setDisplayBlock(prev => ({
        ...prev,
        speaker: cue.speaker,
        text: prev.text ? `${prev.text} ${cue.text}` : cue.text
      }));
    }
  }, [currentCue?.cue?.id, currentCue?.lifecycle]);

  const isAmelia = currentCue?.cue?.speaker === "amelia";
  const isCompleted = currentCue?.lifecycle === "completed";

  // Split text into words for display
  const words = useMemo(() => {
    return displayBlock.text.split(" ").filter(w => w.length > 0);
  }, [displayBlock.text]);

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

      {/* Messages - Word display with 4-line max */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 flex flex-col justify-center items-center",
          isFullscreen ? "px-8 py-6" : "px-6 py-4"
        )}
      >
        {/* Silence/noise = clean screen */}
        <AnimatePresence mode="wait">
          {!hasContent || words.length === 0 ? null : (
            <motion.div 
              key={displayBlock.key}
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

              {/* Text display - stable, forward-only */}
              <p className={cn(
                "leading-relaxed font-medium",
                isFullscreen ? "text-2xl" : "text-xl",
                isAmelia ? "text-right text-foreground" : "text-left text-foreground/90"
              )}>
                {words.map((word, idx) => (
                  <motion.span
                    key={`${displayBlock.key}-word-${idx}`}
                    className="inline-block mr-[0.25em]"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.15, 
                      ease: "easeOut",
                      delay: idx * 0.02 // Subtle stagger for new words
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConversationPanel;

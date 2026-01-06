import { useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "./ChatMessage";
import AudioVisualizer from "./AudioVisualizer";
import { CurrentCueState, PhraseChunk } from "@/hooks/useDemoSequence";

interface ConversationPanelProps {
  messages: Message[];
  isFullscreen?: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
  currentCue?: CurrentCueState;
}

// Estimate lines based on character count (conservative for larger text)
const estimateLines = (text: string, charsPerLine: number = 42): number => {
  if (!text) return 0;
  return Math.ceil(text.length / charsPerLine);
};

// Get visible chunks that fit within maxLines, but always keep at least minChunks
const getDisplayChunks = (
  chunks: PhraseChunk[], 
  maxLines: number = 6, 
  minChunks: number = 4
): PhraseChunk[] => {
  if (chunks.length === 0) return [];
  
  // Always show at least the last minChunks
  const guaranteedStart = Math.max(0, chunks.length - minChunks);
  
  // Build text from end, keeping only what fits in maxLines
  let startIndex = chunks.length - 1;
  
  // Work backwards to find what fits
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunkText = chunks.slice(i).map(c => c.text).join(" ");
    const lines = estimateLines(chunkText);
    
    if (lines <= maxLines) {
      startIndex = i;
    } else {
      break;
    }
  }
  
  // Use the earlier of: line-based start OR guaranteed minimum chunks
  const finalStart = Math.min(startIndex, guaranteedStart);
  
  return chunks.slice(finalStart);
};

const ConversationPanel = ({ 
  messages, 
  isFullscreen = false,
  audioRef,
  isPlaying = false,
  currentCue
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Determine what to show based on currentCue
  const hasContent = currentCue && currentCue.cue && currentCue.lifecycle !== "hidden";
  const visibleChunks = currentCue?.visibleChunks ?? [];
  
  // Apply subtitle swap: show only chunks that fit within 4 lines
  const displayChunks = useMemo(() => {
    return getDisplayChunks(visibleChunks, 4);
  }, [visibleChunks]);

  const isAmelia = currentCue?.cue?.speaker === "amelia";
  const isActive = currentCue?.lifecycle === "active";

  // Create stable key for the utterance
  const utteranceKey = currentCue?.cue?.id ?? "none";

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

      {/* Messages - Progressive chunk reveal with subtitle swap */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 flex flex-col justify-center items-center",
          isFullscreen ? "px-8 py-6" : "px-6 py-4"
        )}
      >
        <AnimatePresence mode="wait">
          {!hasContent || displayChunks.length === 0 ? null : (
            <motion.div 
              key={utteranceKey}
              className="w-full max-w-lg"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.25, ease: "easeOut" } }}
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
                  {isActive && (
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      isAmelia ? "bg-enera-brand/35" : "bg-muted-foreground/20"
                    )} />
                  )}
                </span>
              </motion.div>

              {/* Phrase chunks - progressive reveal */}
              <div
                className={cn(
                  "leading-relaxed font-medium space-y-1",
                  isFullscreen ? "text-2xl" : "text-xl",
                  isAmelia ? "text-right text-foreground" : "text-left text-foreground/90"
                )}
              >
                <AnimatePresence mode="popLayout">
                  {displayChunks.map((chunk) => (
                    <motion.div
                      key={`${utteranceKey}-chunk-${chunk.t}`}
                      className="block"
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      transition={{
                        duration: 0.2,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    >
                      {chunk.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConversationPanel;

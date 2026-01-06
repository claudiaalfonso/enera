import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "./ChatMessage";
import AudioVisualizer from "./AudioVisualizer";

interface ConversationPanelProps {
  messages: Message[];
  isFullscreen?: boolean;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
  revealProgress?: number;
}

// Split long text into readable chunks (2-4 lines each)
const chunkText = (text: string, maxWordsPerChunk: number = 12): string[] => {
  const words = text.split(" ");
  if (words.length <= maxWordsPerChunk) return [text];
  
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += maxWordsPerChunk) {
    chunks.push(words.slice(i, i + maxWordsPerChunk).join(" "));
  }
  return chunks;
};

const ConversationPanel = ({ 
  messages, 
  isFullscreen = false,
  audioRef,
  isPlaying = false,
  revealProgress = 1
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevSpeaker, setPrevSpeaker] = useState<string | null>(null);
  const [speakerChangeKey, setSpeakerChangeKey] = useState(0);

  const currentMessage = messages[messages.length - 1];
  const currentSpeaker = currentMessage?.role;
  
  // Track speaker changes for transition effects
  const isSpeakerChange = prevSpeaker !== null && prevSpeaker !== currentSpeaker;
  
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
  }, [messages]);

  // Calculate revealed text based on progress
  const revealedContent = useMemo(() => {
    if (!currentMessage) return { chunks: [], currentChunkIndex: 0, chunkProgress: 0 };
    
    const chunks = chunkText(currentMessage.content, 14);
    const totalChunks = chunks.length;
    
    // Calculate which chunk and how much of it to show
    const exactPosition = revealProgress * totalChunks;
    const currentChunkIndex = Math.min(Math.floor(exactPosition), totalChunks - 1);
    const chunkProgress = exactPosition - currentChunkIndex;
    
    return { chunks, currentChunkIndex, chunkProgress };
  }, [currentMessage, revealProgress]);

  // Get words to reveal in current chunk
  const getRevealedWords = (chunk: string, progress: number): { revealed: string; cursor: boolean } => {
    const words = chunk.split(" ");
    const wordsToShow = Math.ceil(progress * words.length);
    const revealed = words.slice(0, wordsToShow).join(" ");
    const cursor = progress < 1 && progress > 0;
    return { revealed, cursor };
  };

  // Animation variants for smooth speaker transitions
  const messageVariants = {
    initial: (isAmelia: boolean) => ({
      opacity: 0,
      x: isAmelia ? 20 : -20,
      scale: 0.97,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: (isAmelia: boolean) => ({
      opacity: 0,
      x: isAmelia ? -10 : 10,
      scale: 0.98,
    }),
  };

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Border pulse effect on speaker change */}
      <AnimatePresence>
        {currentMessage && (
          <motion.div
            key={`border-pulse-${speakerChangeKey}`}
            className={cn(
              "absolute inset-0 rounded-xl pointer-events-none z-10",
              currentMessage.role === "amelia" 
                ? "ring-2 ring-enera-brand/40" 
                : "ring-2 ring-muted-foreground/30"
            )}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
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
              {messages.length > 0 && (
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

      {/* Messages - Compact, centered with better padding */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 flex flex-col justify-center items-center",
          isFullscreen ? "px-8 py-6" : "px-6 py-4"
        )}
      >
        {messages.length === 0 ? (
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
            {/* Enhanced background glow - increased intensity */}
            <AnimatePresence mode="wait">
              {currentMessage && (
                <motion.div
                  key={`glow-${currentMessage.role}-${speakerChangeKey}`}
                  className={cn(
                    "absolute -inset-8 -z-10 rounded-3xl blur-3xl pointer-events-none",
                    currentMessage.role === "amelia" 
                      ? "bg-enera-brand" 
                      : "bg-muted-foreground"
                  )}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ 
                    opacity: currentMessage.role === "amelia" ? 0.25 : 0.15,
                    scale: 1.1,
                    x: currentMessage.role === "amelia" ? "15%" : "-15%"
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              {currentMessage && (
                <motion.div
                  key={currentMessage.id}
                  custom={currentMessage.role === "amelia"}
                  variants={messageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ 
                    duration: isSpeakerChange ? 0.4 : 0.25,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                >
                  {/* Speaker Label with fade */}
                  <motion.div 
                    className={cn(
                      "flex items-center gap-1.5 mb-2",
                      currentMessage.role === "amelia" ? "justify-end" : "justify-start"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <span className={cn(
                      "text-[10px] uppercase tracking-widest font-semibold transition-colors duration-300",
                      currentMessage.role === "amelia" ? "text-enera-brand" : "text-muted-foreground/60"
                    )}>
                      {currentMessage.role === "amelia" ? "Amelia" : "Driver"}
                    </span>
                    <motion.span 
                      className="flex gap-0.5"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15, duration: 0.2 }}
                    >
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        currentMessage.role === "amelia" ? "bg-enera-brand/80" : "bg-muted-foreground/40"
                      )} />
                      <span 
                        className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          currentMessage.role === "amelia" ? "bg-enera-brand/80" : "bg-muted-foreground/40"
                        )} 
                        style={{ animationDelay: "150ms" }} 
                      />
                    </motion.span>
                  </motion.div>

                  {/* Progressive Text Reveal - Chunked */}
                  <div className="space-y-2">
                    {revealedContent.chunks.map((chunk, idx) => {
                      // Determine visibility and progress for this chunk
                      const isCompleted = idx < revealedContent.currentChunkIndex;
                      const isCurrent = idx === revealedContent.currentChunkIndex;
                      const isHidden = idx > revealedContent.currentChunkIndex;
                      
                      if (isHidden) return null;
                      
                      const { revealed, cursor } = isCurrent 
                        ? getRevealedWords(chunk, revealedContent.chunkProgress)
                        : { revealed: chunk, cursor: false };
                      
                      if (!revealed && isCurrent) return null;
                      
                      return (
                        <motion.p 
                          key={`chunk-${idx}`}
                          className={cn(
                            "leading-relaxed font-medium transition-opacity duration-200",
                            isFullscreen ? "text-xl" : "text-lg",
                            currentMessage.role === "amelia" 
                              ? "text-right text-foreground" 
                              : "text-left text-foreground/90",
                            isCompleted && "opacity-60"
                          )}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: isCompleted ? 0.6 : 1, y: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                        >
                          {revealed}
                          {cursor && (
                            <motion.span
                              className={cn(
                                "inline-block w-0.5 h-5 ml-0.5 align-middle rounded-full",
                                currentMessage.role === "amelia" ? "bg-enera-brand" : "bg-muted-foreground"
                              )}
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            />
                          )}
                        </motion.p>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;
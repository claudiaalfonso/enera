import { useEffect, useRef, useState, useMemo } from "react";
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

  // Calculate words to show based on audio-synced progress
  const { wordsToShow, latestWordIndex } = useMemo(() => {
    if (!currentPhrase?.visiblePhrases || currentPhrase.visiblePhrases.length === 0) {
      return { wordsToShow: [], latestWordIndex: -1 };
    }
    
    // Get all completed phrases (full words)
    const completedPhrases = currentPhrase.visiblePhrases.slice(0, -1);
    const completedWords = completedPhrases.flatMap(p => p.split(" "));
    
    // Get current phrase and calculate partial word reveal
    const currentPhraseText = currentPhrase.visiblePhrases[currentPhrase.visiblePhrases.length - 1];
    const currentPhraseWords = currentPhraseText.split(" ");
    
    // Use wordProgress to determine how many words of current phrase to show
    const progress = currentPhrase.wordProgress ?? 1;
    const wordsInCurrentPhrase = Math.ceil(progress * currentPhraseWords.length);
    const revealedCurrentWords = currentPhraseWords.slice(0, wordsInCurrentPhrase);
    
    const allWords = [...completedWords, ...revealedCurrentWords];
    
    return { 
      wordsToShow: allWords, 
      latestWordIndex: allWords.length - 1 
    };
  }, [currentPhrase?.visiblePhrases, currentPhrase?.wordProgress]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [wordsToShow.length]);

  const isAmelia = currentPhrase?.role === "amelia";

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

      {/* Messages - Word-by-word kinetic reveal */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 flex flex-col justify-center items-center",
          isFullscreen ? "px-8 py-6" : "px-6 py-4"
        )}
      >
        {/* Silence/noise = clean screen */}
        {!hasContent ? null : (
          <div className="w-full max-w-md">
            <motion.div
              key={currentPhrase?.messageId}
              initial={{ opacity: 0, x: isAmelia ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAmelia ? -10 : 10 }}
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
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isAmelia ? "bg-enera-brand/35" : "bg-muted-foreground/20"
                  )} />
                </span>
              </motion.div>

              {/* Word-by-word reveal synced to audio */}
              <p className={cn(
                "leading-relaxed font-medium",
                isFullscreen ? "text-xl" : "text-lg",
                isAmelia ? "text-right text-foreground" : "text-left text-foreground/90"
              )}>
                {wordsToShow.map((word, idx) => {
                  const isLatest = idx === latestWordIndex;
                  const isRecent = idx >= latestWordIndex - 2;

                  return (
                    <motion.span
                      key={`${currentPhrase?.messageId}-word-${idx}`}
                      className={cn(
                        "inline-block mr-[0.25em]",
                        !isRecent && "opacity-60"
                      )}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: isRecent ? 1 : 0.6, y: 0 }}
                      transition={{ duration: 0.14, ease: "easeOut" }}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;


import { useEffect, useRef, useState } from "react";
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
}

const ConversationPanel = ({ 
  messages, 
  isFullscreen = false,
  audioRef,
  isPlaying = false
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevSpeaker, setPrevSpeaker] = useState<string | null>(null);

  const currentMessage = messages[messages.length - 1];
  const currentSpeaker = currentMessage?.role;
  
  // Track speaker changes for transition effects
  const isSpeakerChange = prevSpeaker !== null && prevSpeaker !== currentSpeaker;
  
  useEffect(() => {
    if (currentSpeaker) {
      setPrevSpeaker(currentSpeaker);
    }
  }, [currentSpeaker]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

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
    <div className="h-full flex flex-col overflow-hidden">
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
            {/* Subtle background glow that shifts with speaker */}
            <AnimatePresence mode="wait">
              {currentMessage && (
                <motion.div
                  key={`glow-${currentMessage.role}`}
                  className={cn(
                    "absolute inset-0 -z-10 rounded-2xl blur-3xl opacity-20 pointer-events-none",
                    currentMessage.role === "amelia" 
                      ? "bg-enera-brand" 
                      : "bg-muted-foreground"
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: currentMessage.role === "amelia" ? 0.15 : 0.08,
                    scale: 1 
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    transform: currentMessage.role === "amelia" 
                      ? "translateX(20%)" 
                      : "translateX(-20%)",
                  }}
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
                      "flex items-center gap-1.5 mb-1.5",
                      currentMessage.role === "amelia" ? "justify-end" : "justify-start"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <span className={cn(
                      "text-[9px] uppercase tracking-widest font-semibold transition-colors duration-300",
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
                        "w-1 h-1 rounded-full animate-pulse",
                        currentMessage.role === "amelia" ? "bg-enera-brand/80" : "bg-muted-foreground/40"
                      )} />
                      <span 
                        className={cn(
                          "w-1 h-1 rounded-full animate-pulse",
                          currentMessage.role === "amelia" ? "bg-enera-brand/80" : "bg-muted-foreground/40"
                        )} 
                        style={{ animationDelay: "150ms" }} 
                      />
                    </motion.span>
                  </motion.div>

                  {/* Message Text - NEVER truncate spoken dialogue */}
                  <motion.p 
                    className={cn(
                      "leading-relaxed font-medium",
                      isFullscreen ? "text-xl" : "text-lg",
                      currentMessage.role === "amelia" 
                        ? "text-right text-foreground" 
                        : "text-left text-foreground/90"
                    )}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.25 }}
                  >
                    {currentMessage.content}
                  </motion.p>
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

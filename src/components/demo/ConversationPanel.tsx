import { useEffect, useRef } from "react";
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

  // Get only the last 2 messages (current speaker context)
  const visibleMessages = messages.slice(-2);
  const currentMessage = messages[messages.length - 1];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Minimal with visualizer */}
      <div className={cn(
        "flex-shrink-0 border-b border-border/30 bg-enera-surface-elevated/30 transition-all",
        isFullscreen ? "px-8 py-3" : "px-6 py-2.5"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Phone className={cn(
                "text-enera-brand transition-all",
                isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5"
              )} />
              {messages.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse" />
              )}
            </div>
            <span className={cn(
              "font-medium text-foreground/80 transition-all",
              isFullscreen ? "text-sm" : "text-xs"
            )}>
              Live Call
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

      {/* Messages - Show only current context */}
      <div
        ref={scrollRef}
        className="flex-1 flex flex-col justify-center items-center px-8 py-6"
      >
        {messages.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={cn(
              "rounded-full bg-muted/30 flex items-center justify-center mb-3 transition-all",
              isFullscreen ? "w-14 h-14" : "w-12 h-12"
            )}>
              <Phone className={cn(
                "text-muted-foreground/40 transition-all",
                isFullscreen ? "w-6 h-6" : "w-5 h-5"
              )} />
            </div>
            <p className={cn(
              "text-muted-foreground/60 transition-all",
              isFullscreen ? "text-sm" : "text-xs"
            )}>
              Waiting for call...
            </p>
          </motion.div>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <AnimatePresence mode="popLayout">
              {visibleMessages.map((msg) => {
                const isAmelia = msg.role === "amelia";
                const isCurrent = msg.id === currentMessage?.id;
                
                return (
                  <motion.div
                    key={msg.id}
                    className={cn(
                      "transition-all",
                      !isCurrent && "opacity-30"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: isCurrent ? 1 : 0.3, 
                      y: 0,
                      scale: isCurrent ? 1 : 0.95
                    }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Speaker Label */}
                    <div className={cn(
                      "flex items-center gap-2 mb-2",
                      isAmelia ? "justify-end" : "justify-start"
                    )}>
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest font-medium",
                        isAmelia ? "text-enera-brand" : "text-muted-foreground/70"
                      )}>
                        {isAmelia ? "Amelia" : "Driver"}
                      </span>
                      {isCurrent && (
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-enera-brand animate-pulse" />
                          <span className="w-1 h-1 rounded-full bg-enera-brand animate-pulse" style={{ animationDelay: "150ms" }} />
                          <span className="w-1 h-1 rounded-full bg-enera-brand animate-pulse" style={{ animationDelay: "300ms" }} />
                        </span>
                      )}
                    </div>

                    {/* Message Text - Truncated for voice-first */}
                    <p className={cn(
                      "leading-relaxed transition-all",
                      isFullscreen ? "text-lg" : "text-base",
                      isAmelia ? "text-right text-foreground" : "text-left text-foreground/80",
                      isCurrent && "font-medium"
                    )}>
                      {msg.content.length > 120 
                        ? msg.content.slice(0, 120) + "..." 
                        : msg.content
                      }
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;

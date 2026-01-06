import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatMessage, { Message } from "./ChatMessage";

interface ConversationPanelProps {
  messages: Message[];
  isFullscreen?: boolean;
}

const ConversationPanel = ({ messages, isFullscreen = false }: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

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
      {/* Header */}
      <div className={cn(
        "flex-shrink-0 border-b border-border bg-enera-surface-elevated transition-all",
        isFullscreen ? "px-8 py-5" : "px-6 py-4"
      )}>
        <div className="flex items-center gap-2">
          <MessageSquare className={cn(
            "text-accent transition-all",
            isFullscreen ? "w-5 h-5" : "w-4 h-4"
          )} />
          <h2 className={cn(
            "font-semibold text-foreground transition-all",
            isFullscreen ? "text-lg" : "text-sm"
          )}>
            Live conversation
          </h2>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto transition-all",
          isFullscreen ? "px-8 py-6 space-y-5" : "px-6 py-5 space-y-4"
        )}
      >
        {messages.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={cn(
              "rounded-2xl bg-muted flex items-center justify-center mb-3 transition-all",
              isFullscreen ? "w-16 h-16" : "w-12 h-12"
            )}>
              <MessageSquare className={cn(
                "text-muted-foreground transition-all",
                isFullscreen ? "w-8 h-8" : "w-6 h-6"
              )} />
            </div>
            <p className={cn(
              "text-muted-foreground transition-all",
              isFullscreen ? "text-base" : "text-sm"
            )}>
              Conversation will appear here...
            </p>
          </motion.div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={msg.id} message={msg} index={index} isFullscreen={isFullscreen} />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;

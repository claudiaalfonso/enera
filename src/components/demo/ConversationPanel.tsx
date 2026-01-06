import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import ChatMessage, { Message } from "./ChatMessage";

interface ConversationPanelProps {
  messages: Message[];
}

const ConversationPanel = ({ messages }: ConversationPanelProps) => {
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
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-enera-surface-elevated">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Live conversation</h2>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
      >
        {messages.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Conversation will appear here...
            </p>
          </motion.div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={msg.id} message={msg} index={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationPanel;

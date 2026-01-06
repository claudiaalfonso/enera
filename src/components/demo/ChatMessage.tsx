import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

export interface Message {
  id: string;
  role: "driver" | "amelia";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  index: number;
  isFullscreen?: boolean;
}

const ChatMessage = ({ message, index, isFullscreen = false }: ChatMessageProps) => {
  const isAmelia = message.role === "amelia";

  return (
    <motion.div
      className={cn(
        "flex flex-col gap-1.5",
        isAmelia ? "items-end" : "items-start"
      )}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.35, 
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {/* Label */}
      <span className={cn(
        "font-medium uppercase tracking-wider px-1 transition-all",
        isFullscreen ? "text-xs" : "text-[10px]",
        isAmelia ? "text-accent" : "text-muted-foreground"
      )}>
        {isAmelia ? (
          <span className="flex items-center gap-1">
            <Bot className={cn("transition-all", isFullscreen ? "w-4 h-4" : "w-3 h-3")} />
            Amelia (AI)
          </span>
        ) : (
          "Driver"
        )}
      </span>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[90%] leading-relaxed transition-all",
          isFullscreen ? "text-base px-5 py-4" : "text-sm px-4 py-3",
          isAmelia ? "message-bubble-amelia" : "message-bubble-driver"
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
};

export default ChatMessage;

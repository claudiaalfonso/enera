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
}

const ChatMessage = ({ message, index }: ChatMessageProps) => {
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
        "text-[10px] font-medium uppercase tracking-wider px-1",
        isAmelia ? "text-accent" : "text-muted-foreground"
      )}>
        {isAmelia ? (
          <span className="flex items-center gap-1">
            <Bot className="w-3 h-3" />
            Amelia (AI)
          </span>
        ) : (
          "Driver"
        )}
      </span>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[90%] text-sm leading-relaxed",
          isAmelia ? "message-bubble-amelia" : "message-bubble-driver"
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
};

export default ChatMessage;

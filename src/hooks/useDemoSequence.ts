import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/components/demo/ChatMessage";
import { TimelineStep } from "@/components/demo/TimelineItem";

const CONVERSATION: Message[] = [
  {
    id: "1",
    role: "driver",
    content: "Hi there. I'm trying to use the charger at the Church Street car park in Market Harborough, but I'm not having much luck. I've tried tapping my contactless card a few times now and the screen isn't changing at all."
  },
  {
    id: "2",
    role: "amelia",
    content: "I'm sorry you're having trouble. Let me look into that for you. You're in Market Harborough, can you just confirm the charger ID is MH-102-B?"
  },
  {
    id: "3",
    role: "driver",
    content: "Yes, that's the one. MH-102-B."
  },
  {
    id: "4",
    role: "amelia",
    content: "Perfect, thanks. Let me just look into what's happening there. I've just run a diagnostic and it looks like the card reader module is frozen, although the charger itself is healthy. I'm going to trigger a remote reset on the reader for you now. It should take about 45 seconds to reboot and come back online."
  },
  {
    id: "5",
    role: "driver",
    content: "Right, okay. I'll hang on."
  },
  {
    id: "6",
    role: "amelia",
    content: "While we're waiting for that to cycle, I noticed you're using a guest payment. Did you know that if you used our app, you'd actually get a 35% discount for charging during this off-peak window? It's a fair bit cheaper than the standard contactless rate."
  },
  {
    id: "7",
    role: "driver",
    content: "Oh, I wasn't aware of that. I'll have to give the app a go next time, then."
  },
  {
    id: "8",
    role: "amelia",
    content: "It's definitely worth it for the savings. Okay, the card reader has finished rebooting and is showing as 'Available' again. Could you give your card another tap for me? It should authorize straight away now."
  },
  {
    id: "9",
    role: "driver",
    content: "Right, let's see... yeah, that's worked. It says 'Preparing' and the cable has locked. Brilliant, thanks for that."
  },
  {
    id: "10",
    role: "amelia",
    content: "You're very welcome. I can see the session has successfully initialized on my end, too. Is there anything else I can help you with today?"
  },
  {
    id: "11",
    role: "driver",
    content: "No, that's all. Thanks for your help."
  },
  {
    id: "12",
    role: "amelia",
    content: "No problem at all. Have a lovely day and enjoy the rest of your drive."
  }
];

const createInitialSteps = (): TimelineStep[] => [
  { id: "1", label: "Incoming request", detail: "Driver support request detected", status: "pending" },
  { id: "2", label: "Location detected", detail: "Market Harborough, Church Street", status: "pending" },
  { id: "3", label: "Charger ID confirmed", detail: "MH-102-B", status: "pending" },
  { id: "4", label: "Diagnostic complete", detail: "Charger healthy, reader frozen", status: "pending" },
  { id: "5", label: "Remote reset initiated", detail: "Card reader module rebooting", status: "pending" },
  { id: "6", label: "Value opportunity", detail: "35% off-peak app discount identified", status: "pending", isValueMoment: true },
  { id: "7", label: "Reader available", detail: "Reboot complete, system ready", status: "pending" },
  { id: "8", label: "Session initialized", detail: "Charging session active", status: "pending" }
];

const STATUS_MESSAGES = [
  "Listening for requests...",
  "Incoming driver request detected",
  "Identifying charger location",
  "Location: Market Harborough confirmed",
  "Charger ID: MH-102-B confirmed",
  "Running remote diagnostics...",
  "Diagnostic: Card reader frozen",
  "Triggering remote reset...",
  "Monitoring reboot (45s)",
  "Identifying revenue opportunity",
  "Charger available",
  "Session confirmed"
];

interface SequenceAction {
  messageIndex: number | null;
  statusIndex: number;
  stepUpdates: { id: string; status: "active" | "completed" }[];
  delay: number;
}

const SEQUENCE: SequenceAction[] = [
  { messageIndex: null, statusIndex: 1, stepUpdates: [{ id: "1", status: "active" }], delay: 1500 },
  { messageIndex: 0, statusIndex: 2, stepUpdates: [{ id: "1", status: "completed" }, { id: "2", status: "active" }], delay: 2500 },
  { messageIndex: 1, statusIndex: 3, stepUpdates: [{ id: "2", status: "completed" }], delay: 2000 },
  { messageIndex: 2, statusIndex: 4, stepUpdates: [{ id: "3", status: "active" }], delay: 1500 },
  { messageIndex: 3, statusIndex: 5, stepUpdates: [{ id: "3", status: "completed" }, { id: "4", status: "active" }], delay: 3500 },
  { messageIndex: null, statusIndex: 6, stepUpdates: [{ id: "4", status: "completed" }, { id: "5", status: "active" }], delay: 1500 },
  { messageIndex: 4, statusIndex: 7, stepUpdates: [], delay: 1500 },
  { messageIndex: null, statusIndex: 8, stepUpdates: [], delay: 2500 },
  { messageIndex: 5, statusIndex: 9, stepUpdates: [{ id: "5", status: "completed" }, { id: "6", status: "active" }], delay: 3500 },
  { messageIndex: 6, statusIndex: 9, stepUpdates: [{ id: "6", status: "completed" }], delay: 2000 },
  { messageIndex: 7, statusIndex: 10, stepUpdates: [{ id: "7", status: "active" }], delay: 3000 },
  { messageIndex: null, statusIndex: 10, stepUpdates: [{ id: "7", status: "completed" }], delay: 1000 },
  { messageIndex: 8, statusIndex: 11, stepUpdates: [{ id: "8", status: "active" }], delay: 2500 },
  { messageIndex: 9, statusIndex: 11, stepUpdates: [{ id: "8", status: "completed" }], delay: 2000 },
  { messageIndex: 10, statusIndex: 11, stepUpdates: [], delay: 1500 },
  { messageIndex: 11, statusIndex: 11, stepUpdates: [], delay: 1500 }
];

export const useDemoSequence = (autoPlay: boolean = true) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<TimelineStep[]>(createInitialSteps());
  const [currentStatus, setCurrentStatus] = useState(STATUS_MESSAGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const sequenceIndexRef = useRef(0);
  const hasStartedRef = useRef(false);

  const runSequence = useCallback(() => {
    const runStep = () => {
      const idx = sequenceIndexRef.current;
      
      if (idx >= SEQUENCE.length) {
        setIsComplete(true);
        setShowConfirmation(true);
        setIsProcessing(false);
        return;
      }

      const action = SEQUENCE[idx];
      
      // Update status
      setCurrentStatus(STATUS_MESSAGES[action.statusIndex]);
      setIsProcessing(true);

      // Add message if present
      if (action.messageIndex !== null) {
        setMessages(prev => [...prev, CONVERSATION[action.messageIndex!]]);
      }

      // Update timeline steps
      if (action.stepUpdates.length > 0) {
        setSteps(prev => prev.map(s => {
          const update = action.stepUpdates.find(u => u.id === s.id);
          return update ? { ...s, status: update.status } : s;
        }));
      }

      sequenceIndexRef.current += 1;
      
      // Schedule next step
      if (sequenceIndexRef.current < SEQUENCE.length) {
        setTimeout(runStep, action.delay);
      } else {
        setTimeout(() => {
          setIsComplete(true);
          setShowConfirmation(true);
          setIsProcessing(false);
        }, action.delay);
      }
    };

    // Start after initial delay
    setTimeout(runStep, 1200);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setSteps(createInitialSteps());
    setCurrentStatus(STATUS_MESSAGES[0]);
    setIsProcessing(false);
    setShowConfirmation(false);
    setIsComplete(false);
    sequenceIndexRef.current = 0;
    hasStartedRef.current = false;
    
    // Restart sequence
    setTimeout(() => {
      hasStartedRef.current = true;
      runSequence();
    }, 100);
  }, [runSequence]);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay && !hasStartedRef.current) {
      hasStartedRef.current = true;
      runSequence();
    }
  }, [autoPlay, runSequence]);

  return {
    messages,
    steps,
    currentStatus,
    isProcessing,
    showConfirmation,
    isComplete,
    reset
  };
};

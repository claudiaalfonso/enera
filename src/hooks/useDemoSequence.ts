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
  { id: "1", label: "Request received", detail: "", status: "pending" },
  { id: "2", label: "Location identified", detail: "", status: "pending" },
  { id: "3", label: "Charger confirmed", detail: "MH-102-B", status: "pending" },
  { id: "4", label: "Diagnostics run", detail: "", status: "pending" },
  { id: "5", label: "Reset triggered", detail: "", status: "pending" },
  { id: "6", label: "Upsell offered", detail: "35% discount", status: "pending", isValueMoment: true },
  { id: "7", label: "Charger available", detail: "", status: "pending" },
  { id: "8", label: "Session started", detail: "", status: "pending" }
];

const STATUS_MESSAGES = [
  "Listening...",
  "Request received",
  "Locating charger",
  "Market Harborough",
  "MH-102-B",
  "Running diagnostics",
  "Reader frozen",
  "Resetting...",
  "Rebooting",
  "Upsell opportunity",
  "Available",
  "Session active"
];

export interface SequenceAction {
  messageIndex: number | null;
  statusIndex: number;
  stepUpdates: { id: string; status: "active" | "completed" }[];
  delay: number;
  audioTime: number;
}

const SEQUENCE: SequenceAction[] = [
  { messageIndex: null, statusIndex: 1, stepUpdates: [{ id: "1", status: "active" }], delay: 1500, audioTime: 0 },
  { messageIndex: 0, statusIndex: 2, stepUpdates: [{ id: "1", status: "completed" }, { id: "2", status: "active" }], delay: 2500, audioTime: 11 },
  { messageIndex: 1, statusIndex: 3, stepUpdates: [{ id: "2", status: "completed" }], delay: 2000, audioTime: 25 },
  { messageIndex: 2, statusIndex: 4, stepUpdates: [{ id: "3", status: "active" }], delay: 1500, audioTime: 34 },
  { messageIndex: 3, statusIndex: 5, stepUpdates: [{ id: "3", status: "completed" }, { id: "4", status: "active" }], delay: 3500, audioTime: 39 },
  { messageIndex: null, statusIndex: 6, stepUpdates: [{ id: "4", status: "completed" }, { id: "5", status: "active" }], delay: 1500, audioTime: 50 },
  { messageIndex: 4, statusIndex: 7, stepUpdates: [], delay: 1500, audioTime: 58 },
  { messageIndex: null, statusIndex: 8, stepUpdates: [], delay: 2500, audioTime: 61 },
  { messageIndex: 5, statusIndex: 9, stepUpdates: [{ id: "5", status: "completed" }, { id: "6", status: "active" }], delay: 3500, audioTime: 63 },
  { messageIndex: 6, statusIndex: 9, stepUpdates: [{ id: "6", status: "completed" }], delay: 2000, audioTime: 78 },
  { messageIndex: 7, statusIndex: 10, stepUpdates: [{ id: "7", status: "active" }], delay: 3000, audioTime: 86 },
  { messageIndex: null, statusIndex: 10, stepUpdates: [{ id: "7", status: "completed" }], delay: 1000, audioTime: 93 },
  { messageIndex: 8, statusIndex: 11, stepUpdates: [{ id: "8", status: "active" }], delay: 2500, audioTime: 98 },
  { messageIndex: 9, statusIndex: 11, stepUpdates: [{ id: "8", status: "completed" }], delay: 2000, audioTime: 109 },
  { messageIndex: 10, statusIndex: 11, stepUpdates: [], delay: 1500, audioTime: 117 },
  { messageIndex: 11, statusIndex: 11, stepUpdates: [], delay: 1500, audioTime: 123 }
];

export type PlayMode = "auto" | "manual";

export const useDemoSequence = (initialMode: PlayMode = "auto") => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<TimelineStep[]>(createInitialSteps());
  const [currentStatus, setCurrentStatus] = useState(STATUS_MESSAGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>(initialMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [hasStarted, setHasStarted] = useState(false);
  
  const sequenceIndexRef = useRef(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio - ensure it's loud and foreground
  useEffect(() => {
    audioRef.current = new Audio("/audio/demo-conversation.m4a");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 1.0; // Full volume
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const applyStep = useCallback((idx: number) => {
    if (idx < 0 || idx >= SEQUENCE.length) return;
    
    const action = SEQUENCE[idx];
    
    setCurrentStatus(STATUS_MESSAGES[action.statusIndex]);
    setIsProcessing(true);

    // Build messages up to this step
    const messagesUpToStep: Message[] = [];
    for (let i = 0; i <= idx; i++) {
      const msgIdx = SEQUENCE[i].messageIndex;
      if (msgIdx !== null) {
        messagesUpToStep.push(CONVERSATION[msgIdx]);
      }
    }
    setMessages(messagesUpToStep);

    // Build timeline state up to this step
    const newSteps = createInitialSteps();
    for (let i = 0; i <= idx; i++) {
      SEQUENCE[i].stepUpdates.forEach(update => {
        const stepIndex = newSteps.findIndex(s => s.id === update.id);
        if (stepIndex !== -1) {
          newSteps[stepIndex] = { ...newSteps[stepIndex], status: update.status };
        }
      });
    }
    setSteps(newSteps);
    
    sequenceIndexRef.current = idx;
    setCurrentStepIndex(idx);

    // Sync audio
    if (audioRef.current && isPlaying) {
      audioRef.current.currentTime = action.audioTime;
      audioRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  const goToNext = useCallback(() => {
    const nextIdx = sequenceIndexRef.current + 1;
    if (nextIdx >= SEQUENCE.length) {
      setIsComplete(true);
      setShowConfirmation(true);
      setIsProcessing(false);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      return;
    }
    applyStep(nextIdx);
  }, [applyStep]);

  const goToPrevious = useCallback(() => {
    if (sequenceIndexRef.current <= 0) return;
    const prevIdx = sequenceIndexRef.current - 1;
    setIsComplete(false);
    setShowConfirmation(false);
    applyStep(prevIdx);
  }, [applyStep]);

  const togglePlayPause = useCallback(() => {
    if (isComplete) {
      // Restart
      reset();
      return;
    }
    
    setIsPlaying(prev => {
      const newPlaying = !prev;
      if (audioRef.current) {
        if (newPlaying) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
      return newPlaying;
    });
  }, [isComplete]);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setMessages([]);
    setSteps(createInitialSteps());
    setCurrentStatus(STATUS_MESSAGES[0]);
    setIsProcessing(false);
    setShowConfirmation(false);
    setIsComplete(false);
    setCurrentStepIndex(-1);
    sequenceIndexRef.current = -1;
    setHasStarted(false);
    setIsPlaying(false);
  }, []);

  const switchMode = useCallback((mode: PlayMode) => {
    setPlayMode(mode);
    if (mode === "manual") {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    }
  }, []);

  // Start demo function - called when user clicks Start Demo
  const startDemo = useCallback(() => {
    setHasStarted(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (!hasStarted || playMode !== "auto" || !isPlaying || isComplete) return;

    const scheduleNext = () => {
      const currentIdx = sequenceIndexRef.current;
      const delay = currentIdx < 0 ? 1200 : SEQUENCE[currentIdx]?.delay || 2000;
      
      timerRef.current = setTimeout(() => {
        goToNext();
      }, delay);
    };
    
    scheduleNext();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [hasStarted, playMode, isPlaying, isComplete, currentStepIndex, goToNext]);

  return {
    messages,
    steps,
    currentStatus,
    isProcessing,
    showConfirmation,
    isComplete,
    isPlaying,
    playMode,
    currentStepIndex,
    totalSteps: SEQUENCE.length,
    reset,
    goToNext,
    goToPrevious,
    togglePlayPause,
    switchMode,
    audioRef,
    startDemo
  };
};

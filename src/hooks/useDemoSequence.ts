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

// Audio timestamps in seconds for each sequence step
const AUDIO_TIMESTAMPS = [
  0,    // Step 0: Intro (Amelia greeting)
  11,   // Step 1: Driver explains problem
  25,   // Step 2: Amelia asks for confirmation
  34,   // Step 3: Driver confirms charger ID
  39,   // Step 4: Amelia runs diagnostic
  50,   // Step 5: Remote reset trigger
  58,   // Step 6: Driver waits
  63,   // Step 7: Monitoring
  63,   // Step 8: Value pitch
  78,   // Step 9: Driver response to app
  86,   // Step 10: Reader ready
  93,   // Step 11: Success
  98,   // Step 12: Driver confirms working
  109,  // Step 13: Amelia confirms
  117,  // Step 14: Driver thanks
  123,  // Step 15: Final goodbye
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
  const [isPlaying, setIsPlaying] = useState(initialMode === "auto");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  
  const sequenceIndexRef = useRef(-1);
  const hasStartedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/audio/demo-conversation.m4a");
    audioRef.current.preload = "auto";
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
    hasStartedRef.current = false;
    setIsPlaying(playMode === "auto");
  }, [playMode]);

  const switchMode = useCallback((mode: PlayMode) => {
    setPlayMode(mode);
    if (mode === "manual") {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    }
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (playMode !== "auto" || !isPlaying || isComplete) return;

    const scheduleNext = () => {
      const currentIdx = sequenceIndexRef.current;
      const delay = currentIdx < 0 ? 1200 : SEQUENCE[currentIdx]?.delay || 2000;
      
      timerRef.current = setTimeout(() => {
        goToNext();
      }, delay);
    };

    // Start or continue auto-play
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    }
    
    scheduleNext();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [playMode, isPlaying, isComplete, currentStepIndex, goToNext]);

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
    audioRef
  };
};

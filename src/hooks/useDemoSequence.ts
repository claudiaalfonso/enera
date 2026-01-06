import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/components/demo/ChatMessage";
import { TimelineStep } from "@/components/demo/TimelineItem";

// Script matched EXACTLY to the recording timestamps
const CONVERSATION: Message[] = [
  {
    id: "1",
    role: "amelia",
    content: "Hello, my name is Amelia, and I'm with Enera Support. How can I help you today?"
  },
  {
    id: "2",
    role: "driver",
    content: "Hi, I'm trying to use the charger at the Church Street car park in Market Harborough, but I'm not having much luck. I've tried tapping my contactless card a few times now, and it looks like the screen isn't changing at all."
  },
  {
    id: "3",
    role: "amelia",
    content: "I'm sorry you're having trouble. Let me look into that for you. You're in Market Harborough. Can you just confirm the charger ID is MH-102-B?"
  },
  {
    id: "4",
    role: "driver",
    content: "Yeah, that's the one. MH-102-B."
  },
  {
    id: "5",
    role: "amelia",
    content: "Perfect, thanks. Let me just look into what's happening there. I've just run a diagnostic, and it looks like the card reader module is frozen, although the charger itself is healthy. I'm going to trigger a remote reset on the reader for you now. It should take about 45 seconds to reboot and come back online."
  },
  {
    id: "6",
    role: "driver",
    content: "Great, okay, I'll hang on."
  },
  {
    id: "7",
    role: "amelia",
    content: "While we're waiting for that to cycle, I noticed you're using a guest payment. Did you know that if you used our app, you'd actually get a 35% discount for charging during this off-peak window? It's a fair bit cheaper than the standard contactless rate."
  },
  {
    id: "8",
    role: "driver",
    content: "Oh, interesting. I wasn't aware of that. I will give the app a go next time. Thanks."
  },
  {
    id: "9",
    role: "amelia",
    content: "It's definitely worth it for the savings. Okay, the card reader has finished rebooting and is showing as available again. Could you give your card another tap for me? It should authorize straight away now."
  },
  {
    id: "10",
    role: "driver",
    content: "Yeah, let me try that. Okay, oh yeah, it's worked. It says preparing, and it sounds like the cable's locked, so I think we're good. Thank you."
  },
  {
    id: "11",
    role: "amelia",
    content: "You're very welcome. I can see the session has successfully initialized on my end, too. Is there anything else I can help you with today?"
  },
  {
    id: "12",
    role: "driver",
    content: "No, that's it. Thanks for everything."
  },
  {
    id: "13",
    role: "amelia",
    content: "No problem at all. Have a lovely day, and enjoy the rest of your drive."
  }
];

const createInitialSteps = (): TimelineStep[] => [
  { id: "1", label: "Call connected", detail: "", status: "pending" },
  { id: "2", label: "Issue reported", detail: "", status: "pending" },
  { id: "3", label: "Location confirmed", detail: "", status: "pending" },
  { id: "4", label: "Charger ID verified", detail: "MH-102-B", status: "pending" },
  { id: "5", label: "Diagnostics run", detail: "Reader frozen", status: "pending" },
  { id: "6", label: "Reset triggered", detail: "", status: "pending" },
  { id: "7", label: "Upsell offered", detail: "35% discount", status: "pending", isValueMoment: true },
  { id: "8", label: "Charger available", detail: "", status: "pending" },
  { id: "9", label: "Session started", detail: "", status: "pending" }
];

const STATUS_MESSAGES = [
  "Listening...",
  "Call connected",
  "Issue received",
  "Locating charger",
  "MH-102-B confirmed",
  "Running diagnostics",
  "Reader frozen",
  "Resetting reader",
  "Upsell opportunity",
  "Charger available",
  "Session active",
  "Call complete"
];

export interface SequenceAction {
  messageIndex: number | null;
  statusIndex: number;
  stepUpdates: { id: string; status: "active" | "completed" }[];
  audioTime: number;
  // Duration for this message (calculated from next message start)
  duration?: number;
}

// Timestamps matched EXACTLY to audio recording
// IMPORTANT: First speech starts at ~3s (there's noise before that)
const SEQUENCE: SequenceAction[] = [
  // 3s - Amelia intro (first actual speech, after initial noise)
  { messageIndex: 0, statusIndex: 1, stepUpdates: [{ id: "1", status: "active" }], audioTime: 3, duration: 8 },
  // 11s - Driver reports issue
  { messageIndex: 1, statusIndex: 2, stepUpdates: [{ id: "1", status: "completed" }, { id: "2", status: "active" }], audioTime: 11, duration: 14 },
  // 25s - Amelia asks for charger ID
  { messageIndex: 2, statusIndex: 3, stepUpdates: [{ id: "2", status: "completed" }, { id: "3", status: "active" }], audioTime: 25, duration: 9 },
  // 34s - Driver confirms ID
  { messageIndex: 3, statusIndex: 4, stepUpdates: [{ id: "3", status: "completed" }, { id: "4", status: "active" }], audioTime: 34, duration: 5 },
  // 39s - Amelia runs diagnostic, triggers reset
  { messageIndex: 4, statusIndex: 5, stepUpdates: [{ id: "4", status: "completed" }, { id: "5", status: "active" }], audioTime: 39, duration: 19 },
  // 58s - Driver acknowledges
  { messageIndex: 5, statusIndex: 7, stepUpdates: [{ id: "5", status: "completed" }, { id: "6", status: "active" }], audioTime: 58, duration: 5 },
  // 63s - Amelia offers upsell
  { messageIndex: 6, statusIndex: 8, stepUpdates: [{ id: "6", status: "completed" }, { id: "7", status: "active" }], audioTime: 63, duration: 15 },
  // 78s - Driver interested in app
  { messageIndex: 7, statusIndex: 8, stepUpdates: [{ id: "7", status: "completed" }], audioTime: 78, duration: 8 },
  // 86s - Amelia confirms charger ready
  { messageIndex: 8, statusIndex: 9, stepUpdates: [{ id: "8", status: "active" }], audioTime: 86, duration: 12 },
  // 98s - Driver confirms it worked
  { messageIndex: 9, statusIndex: 10, stepUpdates: [{ id: "8", status: "completed" }, { id: "9", status: "active" }], audioTime: 98, duration: 11 },
  // 109s - Amelia confirms session
  { messageIndex: 10, statusIndex: 10, stepUpdates: [{ id: "9", status: "completed" }], audioTime: 109, duration: 8 },
  // 117s - Driver says goodbye
  { messageIndex: 11, statusIndex: 11, stepUpdates: [], audioTime: 117, duration: 6 },
  // 123s - Amelia closing
  { messageIndex: 12, statusIndex: 11, stepUpdates: [], audioTime: 123, duration: 7 }
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
  const [revealProgress, setRevealProgress] = useState(0); // 0-1 progress for current message reveal
  const [currentMessageStartTime, setCurrentMessageStartTime] = useState(0);
  const [currentMessageDuration, setCurrentMessageDuration] = useState(0);
  
  const sequenceIndexRef = useRef(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/audio/demo-conversation.m4a");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 1.0;
    
    const handleEnded = () => {
      setIsComplete(true);
      setShowConfirmation(true);
      setIsProcessing(false);
      setIsPlaying(false);
    };
    
    audioRef.current.addEventListener("ended", handleEnded);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const applyStepState = useCallback((idx: number) => {
    if (idx < 0 || idx >= SEQUENCE.length) return;
    
    const action = SEQUENCE[idx];
    
    setCurrentStatus(STATUS_MESSAGES[action.statusIndex]);
    setIsProcessing(true);
    
    // Set timing for progressive reveal
    setCurrentMessageStartTime(action.audioTime);
    setCurrentMessageDuration(action.duration || 5);
    setRevealProgress(0);

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
  }, []);

  // Audio-driven sync loop
  useEffect(() => {
    if (!hasStarted || !isPlaying || isComplete || playMode !== "auto") return;

    const syncWithAudio = () => {
      if (!audioRef.current) return;
      
      const currentTime = audioRef.current.currentTime;
      const currentIdx = sequenceIndexRef.current;
      
      // Find which step we should be on based on audio time
      let targetIdx = -1;
      for (let i = SEQUENCE.length - 1; i >= 0; i--) {
        if (currentTime >= SEQUENCE[i].audioTime) {
          targetIdx = i;
          break;
        }
      }
      
      // Advance if we're behind
      if (targetIdx > currentIdx) {
        applyStepState(targetIdx);
      }
      
      // Calculate reveal progress for current message
      if (currentIdx >= 0 && currentIdx < SEQUENCE.length) {
        const action = SEQUENCE[currentIdx];
        const elapsed = currentTime - action.audioTime;
        const duration = action.duration || 5;
        const progress = Math.min(1, Math.max(0, elapsed / duration));
        setRevealProgress(progress);
      }
      
      // Check for completion
      if (currentTime >= 130) {
        setIsComplete(true);
        setShowConfirmation(true);
        setIsProcessing(false);
        return;
      }
      
      rafRef.current = requestAnimationFrame(syncWithAudio);
    };
    
    rafRef.current = requestAnimationFrame(syncWithAudio);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [hasStarted, isPlaying, isComplete, playMode, applyStepState]);

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
    applyStepState(nextIdx);
    if (audioRef.current) {
      audioRef.current.currentTime = SEQUENCE[nextIdx].audioTime;
    }
  }, [applyStepState]);

  const goToPrevious = useCallback(() => {
    if (sequenceIndexRef.current <= 0) return;
    const prevIdx = sequenceIndexRef.current - 1;
    setIsComplete(false);
    setShowConfirmation(false);
    applyStepState(prevIdx);
    if (audioRef.current) {
      audioRef.current.currentTime = SEQUENCE[prevIdx].audioTime;
    }
  }, [applyStepState]);

  const togglePlayPause = useCallback(() => {
    if (isComplete) {
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
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
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
    setRevealProgress(0);
    setCurrentMessageStartTime(0);
    setCurrentMessageDuration(0);
  }, []);

  const switchMode = useCallback((mode: PlayMode) => {
    setPlayMode(mode);
    if (mode === "manual") {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, []);

  const startDemo = useCallback(() => {
    setHasStarted(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);

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
    revealProgress,
    reset,
    goToNext,
    goToPrevious,
    togglePlayPause,
    switchMode,
    audioRef,
    startDemo
  };
};

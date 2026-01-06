import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/components/demo/ChatMessage";
import { TimelineStep } from "@/components/demo/TimelineItem";

// ============================================================
// DETERMINISTIC CUE SHEET - Audio timestamps are the ONLY truth
// ============================================================

export interface Cue {
  id: string;
  speaker: "driver" | "amelia";
  startTime: number;  // When speech begins (seconds)
  endTime: number;    // When speech ends (seconds)
  text: string;
}

// Master global offset - adjustable via D-toggle calibration
// Positive = text appears later, Negative = text appears earlier
let GLOBAL_OFFSET = 0;

export const getGlobalOffset = () => GLOBAL_OFFSET;
export const setGlobalOffset = (offset: number) => {
  GLOBAL_OFFSET = offset;
};

// CUE SHEET: Exact timestamps for each utterance
// These are the ONLY source of truth for text display
const CUE_SHEET: Cue[] = [
  { id: "1", speaker: "amelia", startTime: 6.3, endTime: 12.0, text: "Hello, my name is Amelia, and I'm with Enera Support. How can I help you today?" },
  { id: "2", speaker: "driver", startTime: 13.0, endTime: 27.0, text: "Hi, I'm trying to use the charger at the Church Street car park in Market Harborough, but I'm not having much luck. I've tried tapping my contactless card a few times now, and it looks like the screen isn't changing at all." },
  { id: "3", speaker: "amelia", startTime: 27.5, endTime: 36.5, text: "I'm sorry you're having trouble. Let me look into that for you. You're in Market Harborough. Can you just confirm the charger ID is MH-102-B?" },
  { id: "4", speaker: "driver", startTime: 37.0, endTime: 40.5, text: "Yeah, that's the one. MH-102-B." },
  { id: "5", speaker: "amelia", startTime: 41.5, endTime: 61.0, text: "Perfect, thanks. Let me just look into what's happening there. I've just run a diagnostic, and it looks like the card reader module is frozen, although the charger itself is healthy. I'm going to trigger a remote reset on the reader for you now. It should take about 45 seconds to reboot and come back online." },
  { id: "6", speaker: "driver", startTime: 61.5, endTime: 64.5, text: "Great, okay, I'll hang on." },
  { id: "7", speaker: "amelia", startTime: 65.5, endTime: 81.0, text: "While we're waiting for that to cycle, I noticed you're using a guest payment. Did you know that if you used our app, you'd actually get a 35% discount for charging during this off-peak window? It's a fair bit cheaper than the standard contactless rate." },
  { id: "8", speaker: "driver", startTime: 81.5, endTime: 89.0, text: "Oh, interesting. I wasn't aware of that. I will give the app a go next time. Thanks." },
  { id: "9", speaker: "amelia", startTime: 89.5, endTime: 101.5, text: "It's definitely worth it for the savings. Okay, the card reader has finished rebooting and is showing as available again. Could you give your card another tap for me? It should authorize straight away now." },
  { id: "10", speaker: "driver", startTime: 102.0, endTime: 113.0, text: "Yeah, let me try that. Okay, oh yeah, it's worked. It says preparing, and it sounds like the cable's locked, so I think we're good. Thank you." },
  { id: "11", speaker: "amelia", startTime: 113.5, endTime: 122.0, text: "You're very welcome. I can see the session has successfully initialized on my end, too. Is there anything else I can help you with today?" },
  { id: "12", speaker: "driver", startTime: 122.5, endTime: 126.0, text: "No, that's it. Thanks for everything." },
  { id: "13", speaker: "amelia", startTime: 127.5, endTime: 134.0, text: "No problem at all. Have a lovely day, and enjoy the rest of your drive." },
];

// SYSTEM STATE CUES - tied to audio moments
interface SystemCue {
  time: number;
  status: string;
}

const SYSTEM_CUES: SystemCue[] = [
  { time: 12.0, status: "Listening to driver" },
  { time: 27.0, status: "Understanding the issue" },
  { time: 30.5, status: "Locating charger station" },
  { time: 40.0, status: "Charger MH-102-B identified" },
  { time: 47.0, status: "Running remote diagnostics" },
  { time: 49.5, status: "Card reader unresponsive" },
  { time: 56.5, status: "Resetting payment module" },
  { time: 74.5, status: "Discount offer presented" },
  { time: 96.5, status: "Charger available again" },
  { time: 105.5, status: "Charging session confirmed" },
  { time: 128.5, status: "Issue resolved" },
];

// TIMELINE STEP TRIGGERS
const STEP_TRIGGERS: { stepId: string; activateAt: number; completeAt: number }[] = [
  { stepId: "1", activateAt: 6.3, completeAt: 13.0 },
  { stepId: "2", activateAt: 13.0, completeAt: 27.5 },
  { stepId: "3", activateAt: 27.5, completeAt: 37.0 },
  { stepId: "4", activateAt: 37.0, completeAt: 41.5 },
  { stepId: "5", activateAt: 46.0, completeAt: 53.5 },
  { stepId: "6", activateAt: 55.5, completeAt: 65.5 },
  { stepId: "7", activateAt: 73.0, completeAt: 81.5 },
  { stepId: "8", activateAt: 95.5, completeAt: 102.0 },
  { stepId: "9", activateAt: 107.0, completeAt: 136.5 },
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

// ============================================================
// CUE STATE - Strict lifecycle: Hidden → Active → Completed
// ============================================================

export type CueLifecycle = "hidden" | "active" | "completed";

export interface CurrentCueState {
  cue: Cue | null;
  lifecycle: CueLifecycle;
  // For debug overlay
  cueIndex: number;
  nextCueTime: number | null;
}

// ============================================================
// HOOK
// ============================================================

export const useDemoSequence = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<TimelineStep[]>(createInitialSteps());
  const [currentStatus, setCurrentStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [hasStarted, setHasStarted] = useState(false);

  // Current cue state - deterministic, no heuristics
  const [currentCue, setCurrentCue] = useState<CurrentCueState>({
    cue: null,
    lifecycle: "hidden",
    cueIndex: -1,
    nextCueTime: CUE_SHEET[0]?.startTime ?? null
  });

  // For exposing to debug overlay
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Track last completed cue to maintain persistence
  const lastCompletedCueRef = useRef<Cue | null>(null);

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

  // ============================================================
  // DETERMINISTIC SYNC LOOP - Audio currentTime drives EVERYTHING
  // ============================================================
  useEffect(() => {
    if (!hasStarted || !isPlaying || isComplete) return;

    const syncWithAudio = () => {
      if (!audioRef.current) return;

      // Get current time with offset applied
      const rawTime = audioRef.current.currentTime;
      const currentTime = rawTime + GLOBAL_OFFSET;
      setAudioCurrentTime(rawTime);

      // Find active cue based on timestamps
      let activeCueIndex = -1;
      let activeCue: Cue | null = null;

      for (let i = 0; i < CUE_SHEET.length; i++) {
        const cue = CUE_SHEET[i];
        if (currentTime >= cue.startTime && currentTime < cue.endTime) {
          activeCueIndex = i;
          activeCue = cue;
          break;
        }
      }

      // Determine next cue time for debug overlay
      const nextCueTime = activeCueIndex >= 0 
        ? CUE_SHEET[activeCueIndex + 1]?.startTime ?? null
        : CUE_SHEET.find(c => c.startTime > currentTime)?.startTime ?? null;

      // BEFORE FIRST CUE: Show nothing
      if (currentTime < CUE_SHEET[0].startTime) {
        setCurrentCue({
          cue: null,
          lifecycle: "hidden",
          cueIndex: -1,
          nextCueTime: CUE_SHEET[0].startTime
        });
        setCurrentStatus("");
        setIsProcessing(false);
        setMessages([]);
        rafRef.current = requestAnimationFrame(syncWithAudio);
        return;
      }

      // ACTIVE CUE: Show current text
      if (activeCue) {
        lastCompletedCueRef.current = activeCue;
        setCurrentCue({
          cue: activeCue,
          lifecycle: "active",
          cueIndex: activeCueIndex,
          nextCueTime
        });
        setIsProcessing(true);
      } else {
        // BETWEEN CUES: Show last completed cue as completed (frozen)
        if (lastCompletedCueRef.current) {
          const lastIdx = CUE_SHEET.findIndex(c => c.id === lastCompletedCueRef.current!.id);
          setCurrentCue({
            cue: lastCompletedCueRef.current,
            lifecycle: "completed",
            cueIndex: lastIdx,
            nextCueTime
          });
        }
        setIsProcessing(false);
      }

      // UPDATE SYSTEM STATUS - timestamp driven
      let newStatus = "";
      for (const trigger of SYSTEM_CUES) {
        if (currentTime >= trigger.time) {
          newStatus = trigger.status;
        }
      }
      setCurrentStatus(newStatus);

      // UPDATE TIMELINE STEPS
      const newSteps = createInitialSteps();
      for (const trigger of STEP_TRIGGERS) {
        const stepIndex = newSteps.findIndex(s => s.id === trigger.stepId);
        if (stepIndex !== -1) {
          if (currentTime >= trigger.completeAt) {
            newSteps[stepIndex] = { ...newSteps[stepIndex], status: "completed" };
          } else if (currentTime >= trigger.activateAt) {
            newSteps[stepIndex] = { ...newSteps[stepIndex], status: "active" };
          }
        }
      }
      setSteps(newSteps);

      // Track step index for progress
      let stepIdx = -1;
      for (let i = STEP_TRIGGERS.length - 1; i >= 0; i--) {
        if (currentTime >= STEP_TRIGGERS[i].activateAt) {
          stepIdx = i;
          break;
        }
      }
      setCurrentStepIndex(stepIdx);

      // Build completed messages for reference
      const completedMsgs: Message[] = [];
      for (const cue of CUE_SHEET) {
        if (currentTime >= cue.endTime) {
          completedMsgs.push({
            id: cue.id,
            role: cue.speaker,
            content: cue.text
          });
        }
      }
      setMessages(completedMsgs);

      rafRef.current = requestAnimationFrame(syncWithAudio);
    };

    rafRef.current = requestAnimationFrame(syncWithAudio);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [hasStarted, isPlaying, isComplete]);

  const goToNext = useCallback(() => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime + GLOBAL_OFFSET;

    for (const cue of CUE_SHEET) {
      if (cue.startTime > currentTime + 0.5) {
        audioRef.current.currentTime = cue.startTime - GLOBAL_OFFSET;
        return;
      }
    }

    setIsComplete(true);
    setShowConfirmation(true);
    setIsProcessing(false);
    setIsPlaying(false);
    audioRef.current.pause();
  }, []);

  const goToPrevious = useCallback(() => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime + GLOBAL_OFFSET;

    let prevTime = 0;
    for (const cue of CUE_SHEET) {
      if (cue.startTime < currentTime - 1) {
        prevTime = cue.startTime;
      } else {
        break;
      }
    }

    audioRef.current.currentTime = prevTime - GLOBAL_OFFSET;
    setIsComplete(false);
    setShowConfirmation(false);
  }, []);

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
    setCurrentStatus("");
    setIsProcessing(false);
    setShowConfirmation(false);
    setIsComplete(false);
    setCurrentStepIndex(-1);
    setHasStarted(false);
    setIsPlaying(false);
    setCurrentCue({
      cue: null,
      lifecycle: "hidden",
      cueIndex: -1,
      nextCueTime: CUE_SHEET[0]?.startTime ?? null
    });
    lastCompletedCueRef.current = null;
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
    currentStepIndex,
    totalSteps: STEP_TRIGGERS.length,
    currentCue,
    audioCurrentTime,
    reset,
    goToNext,
    goToPrevious,
    togglePlayPause,
    audioRef,
    startDemo
  };
};

// Export CUE_SHEET for debug overlay
export { CUE_SHEET };

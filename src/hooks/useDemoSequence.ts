import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/components/demo/ChatMessage";
import { TimelineStep } from "@/components/demo/TimelineItem";
import { getGlobalOffset, getEffectiveTime } from "./useGlobalOffset";

// ============================================================
// DETERMINISTIC CUE SHEET - Audio timestamps are the ONLY truth
// Phrase chunks for natural progressive reveal
// ============================================================

export interface PhraseChunk {
  t: number;      // Timestamp when this chunk appears
  text: string;   // 2-7 words
}

export interface Cue {
  id: string;
  speaker: "driver" | "amelia";
  startTime: number;
  endTime: number;
  chunks: PhraseChunk[];
}

// CUE SHEET with phrase chunks (2-7 words each)
// Each chunk has its own timestamp for progressive reveal
const CUE_SHEET: Cue[] = [
  { 
    id: "1", 
    speaker: "amelia", 
    startTime: 5.68, 
    endTime: 10.9, 
    chunks: [
      { t: 5.68, text: "Hello," },
      { t: 5.8, text: "my name is Amelia," },
      { t: 6.9, text: "and I'm with Enera Support." },
      { t: 8.9, text: "How can I help you today?" }
    ]
  },
  { 
    id: "2", 
    speaker: "driver", 
    startTime: 10.97, 
    endTime: 23.5, 
    chunks: [
      { t: 10.97, text: "Hi, I'm trying to use" },
      { t: 12.17, text: "the charger at the Church Street car park" },
      { t: 13.97, text: "in Market Harborough," },
      { t: 15.17, text: "but I'm not having much luck." },
      { t: 16.97, text: "I've tried tapping my contactless card" },
      { t: 18.97, text: "a few times now," },
      { t: 20.17, text: "and it looks like the screen" },
      { t: 21.97, text: "isn't changing at all." }
    ]
  },
  { 
    id: "3", 
    speaker: "amelia", 
    startTime: 24.9, 
    endTime: 34.5, 
    chunks: [
      { t: 24.9, text: "I'm sorry you're having trouble." },
      { t: 26.5, text: "Let me look into that for you." },
      { t: 28.0, text: "You're in Market Harborough." },
      { t: 29.95, text: "Can you just confirm" },
      { t: 31.2, text: "the charger ID is MH-102-B?" }
    ]
  },
  { 
    id: "4", 
    speaker: "driver", 
    startTime: 34.0, 
    endTime: 39.0, 
    chunks: [
      { t: 34.0, text: "Uh, yeah, that's the one." },
      { t: 35.0, text: "MH-102-B." },
      { t: 39.0, text: "Thanks, let me..." }
    ]
  },
  { 
    id: "5", 
    speaker: "amelia", 
    startTime: 39.0, 
    endTime: 57.5, 
    chunks: [
      { t: 39.0, text: "Perfect." },
      { t: 39.9, text: "Thanks." },
      { t: 40.78, text: "Let me just look into what's happening there." },
      { t: 43.2, text: "I've just run a diagnostic," },
      { t: 45.0, text: "and it looks like the card reader module" },
      { t: 47.0, text: "although the charger itself is healthy." },
      { t: 49.8, text: "I'm going to trigger a remote reset" },
      { t: 52.9, text: "on the reader for you now." },
      { t: 54.76, text: "It should take about 45 seconds" },
      { t: 56.82, text: "to reboot and come back online." }
    ]
  },
  { 
    id: "6", 
    speaker: "driver", 
    startTime: 57.9, 
    endTime: 61.5, 
    chunks: [
      { t: 57.9, text: "Uh, great, okay," },
      { t: 59.0, text: "I'll hang on." }
    ]
  },
  { 
    id: "7", 
    speaker: "amelia", 
    startTime: 62.0, 
    endTime: 81.0, 
    chunks: [
      { t: 62.0, text: "While we're waiting for that to cycle," },
      { t: 64.0, text: "I noticed you're using a guest payment." },
      { t: 66.8, text: "Did you know that if you used our app," },
      { t: 69.5, text: "you'd actually get a 35% discount" },
      { t: 71.0, text: "for charging during this off-peak window?" },
      { t: 73.9, text: "It's a fair bit cheaper" },
      { t: 75.0, text: "than the standard contactless rate." }
    ]
  },
  { 
    id: "8", 
    speaker: "driver", 
    startTime: 77.89, 
    endTime: 84.0, 
    chunks: [
      { t: 77.89, text: "Oh, interesting." },
      { t: 79.5, text: "I wasn't aware of that." },
      { t: 81.0, text: "I will give the app a go next time." },
      { t: 82.9, text: "Thanks." }
    ]
  },
  { 
    id: "9", 
    speaker: "amelia", 
    startTime: 84.5, 
    endTime: 101.5, 
    chunks: [
      { t: 84.5, text: "It's definitely" },
      { t: 85.9, text: "worth it for the savings." },
      { t: 90.0, text: "Okay, and it shows the card reader has finished rebooting" },
      { t: 94.5, text: "and is showing as available again." },
      { t: 96.5, text: "Could you give your card" },
      { t: 98.0, text: "another tap for me?" },
      { t: 99.5, text: "It should authorize straight away now." }
    ]
  },
  { 
    id: "10", 
    speaker: "driver", 
    startTime: 102.0, 
    endTime: 113.0, 
    chunks: [
      { t: 102.0, text: "Yeah, let me try that." },
      { t: 104.0, text: "Okay, oh yeah, it's worked." },
      { t: 106.0, text: "It says preparing," },
      { t: 107.5, text: "and it sounds like the cable's locked," },
      { t: 109.5, text: "so I think we're good." },
      { t: 111.0, text: "Thank you." }
    ]
  },
  { 
    id: "11", 
    speaker: "amelia", 
    startTime: 113.5, 
    endTime: 122.0, 
    chunks: [
      { t: 113.5, text: "You're very welcome." },
      { t: 115.0, text: "I can see the session" },
      { t: 116.5, text: "has successfully initialized on my end, too." },
      { t: 119.0, text: "Is there anything else" },
      { t: 120.5, text: "I can help you with today?" }
    ]
  },
  { 
    id: "12", 
    speaker: "driver", 
    startTime: 122.5, 
    endTime: 126.0, 
    chunks: [
      { t: 122.5, text: "No, that's it." },
      { t: 124.0, text: "Thanks for everything." }
    ]
  },
  { 
    id: "13", 
    speaker: "amelia", 
    startTime: 127.5, 
    endTime: 134.0, 
    chunks: [
      { t: 127.5, text: "No problem at all." },
      { t: 129.0, text: "Have a lovely day," },
      { t: 130.5, text: "and enjoy the rest of your drive." }
    ]
  },
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
// CUE STATE - Strict lifecycle with chunk tracking
// ============================================================

export type CueLifecycle = "hidden" | "active" | "completed";

export interface CurrentCueState {
  cue: Cue | null;
  lifecycle: CueLifecycle;
  cueIndex: number;
  // Chunk tracking for progressive reveal
  activeChunkIndex: number;        // Which chunk we're on (0-based)
  visibleChunks: PhraseChunk[];    // All chunks visible so far
  nextChunkTime: number | null;    // When the next chunk will appear
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

  // Current cue state with chunk tracking
  const [currentCue, setCurrentCue] = useState<CurrentCueState>({
    cue: null,
    lifecycle: "hidden",
    cueIndex: -1,
    activeChunkIndex: -1,
    visibleChunks: [],
    nextChunkTime: null,
    nextCueTime: CUE_SHEET[0]?.startTime ?? null
  });

  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Track last completed cue for persistence
  const lastCompletedCueRef = useRef<{cue: Cue; chunks: PhraseChunk[]} | null>(null);

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
  // DETERMINISTIC SYNC LOOP - Chunk-level progressive reveal
  // ============================================================
  useEffect(() => {
    if (!hasStarted || !isPlaying || isComplete) return;

    const syncWithAudio = () => {
      if (!audioRef.current) return;

      const rawTime = audioRef.current.currentTime;
      // Use centralized effective time calculation
      const currentTime = getEffectiveTime(rawTime);
      setAudioCurrentTime(rawTime);

      // Find active cue
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

      const nextCueTime = activeCueIndex >= 0 
        ? CUE_SHEET[activeCueIndex + 1]?.startTime ?? null
        : CUE_SHEET.find(c => c.startTime > currentTime)?.startTime ?? null;

      // BEFORE FIRST CUE: Show nothing
      if (currentTime < CUE_SHEET[0].startTime) {
        setCurrentCue({
          cue: null,
          lifecycle: "hidden",
          cueIndex: -1,
          activeChunkIndex: -1,
          visibleChunks: [],
          nextChunkTime: CUE_SHEET[0].chunks[0]?.t ?? null,
          nextCueTime: CUE_SHEET[0].startTime
        });
        setCurrentStatus("");
        setIsProcessing(false);
        setMessages([]);
        rafRef.current = requestAnimationFrame(syncWithAudio);
        return;
      }

      // ACTIVE CUE: Progressive chunk reveal
      if (activeCue) {
        // Find which chunks are visible based on timestamps
        const visibleChunks: PhraseChunk[] = [];
        let activeChunkIndex = -1;

        for (let i = 0; i < activeCue.chunks.length; i++) {
          if (currentTime >= activeCue.chunks[i].t) {
            visibleChunks.push(activeCue.chunks[i]);
            activeChunkIndex = i;
          }
        }

        // Find next chunk time
        const nextChunkTime = activeChunkIndex < activeCue.chunks.length - 1
          ? activeCue.chunks[activeChunkIndex + 1]?.t ?? null
          : null;

        lastCompletedCueRef.current = { cue: activeCue, chunks: visibleChunks };

        setCurrentCue({
          cue: activeCue,
          lifecycle: "active",
          cueIndex: activeCueIndex,
          activeChunkIndex,
          visibleChunks,
          nextChunkTime,
          nextCueTime
        });
        setIsProcessing(true);
      } else {
        // BETWEEN CUES: Show last completed cue frozen
        if (lastCompletedCueRef.current) {
          const lastIdx = CUE_SHEET.findIndex(c => c.id === lastCompletedCueRef.current!.cue.id);
          setCurrentCue({
            cue: lastCompletedCueRef.current.cue,
            lifecycle: "completed",
            cueIndex: lastIdx,
            activeChunkIndex: lastCompletedCueRef.current.chunks.length - 1,
            visibleChunks: lastCompletedCueRef.current.chunks,
            nextChunkTime: null,
            nextCueTime
          });
        }
        setIsProcessing(false);
      }

      // UPDATE SYSTEM STATUS
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

      // Track step index
      let stepIdx = -1;
      for (let i = STEP_TRIGGERS.length - 1; i >= 0; i--) {
        if (currentTime >= STEP_TRIGGERS[i].activateAt) {
          stepIdx = i;
          break;
        }
      }
      setCurrentStepIndex(stepIdx);

      // Build completed messages
      const completedMsgs: Message[] = [];
      for (const cue of CUE_SHEET) {
        if (currentTime >= cue.endTime) {
          completedMsgs.push({
            id: cue.id,
            role: cue.speaker,
            content: cue.chunks.map(c => c.text).join(" ")
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
    const rawTime = audioRef.current.currentTime;
    const currentTime = getEffectiveTime(rawTime);
    const offset = getGlobalOffset();

    for (const cue of CUE_SHEET) {
      if (cue.startTime > currentTime + 0.5) {
        audioRef.current.currentTime = cue.startTime - offset;
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
    const rawTime = audioRef.current.currentTime;
    const currentTime = getEffectiveTime(rawTime);
    const offset = getGlobalOffset();

    let prevTime = 0;
    for (const cue of CUE_SHEET) {
      if (cue.startTime < currentTime - 1) {
        prevTime = cue.startTime;
      } else {
        break;
      }
    }

    audioRef.current.currentTime = prevTime - offset;
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
      activeChunkIndex: -1,
      visibleChunks: [],
      nextChunkTime: null,
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

export { CUE_SHEET };

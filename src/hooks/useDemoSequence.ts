import { useState, useEffect, useCallback, useRef } from "react";
import { Message } from "@/components/demo/ChatMessage";
import { TimelineStep } from "@/components/demo/TimelineItem";

// Phrase segments with exact timestamps for kinetic captions
// Each phrase is timed to appear exactly when spoken
export interface PhraseSegment {
  text: string;
  startTime: number; // When this phrase starts in audio
}

export interface TimedMessage {
  id: string;
  role: "driver" | "amelia";
  phrases: PhraseSegment[];
}

// Phrase-level transcript with exact audio timestamps
// Fine-tuned for precise voice sync - text appears WITH the spoken word
const TIMED_TRANSCRIPT: TimedMessage[] = [
  {
    id: "1",
    role: "amelia",
    phrases: [
      { text: "Hello, my name is Amelia,", startTime: 4.8 },
      { text: "and I'm with Enera Support.", startTime: 7.0 },
      { text: "How can I help you today?", startTime: 9.2 },
    ]
  },
  {
    id: "2",
    role: "driver",
    phrases: [
      { text: "Hi, I'm trying to use the charger", startTime: 11.5 },
      { text: "at the Church Street car park", startTime: 14.0 },
      { text: "in Market Harborough,", startTime: 16.2 },
      { text: "but I'm not having much luck.", startTime: 18.0 },
      { text: "I've tried tapping my contactless card", startTime: 20.0 },
      { text: "a few times now,", startTime: 22.2 },
      { text: "and it looks like the screen isn't changing at all.", startTime: 23.5 },
    ]
  },
  {
    id: "3",
    role: "amelia",
    phrases: [
      { text: "I'm sorry you're having trouble.", startTime: 26.0 },
      { text: "Let me look into that for you.", startTime: 28.2 },
      { text: "You're in Market Harborough.", startTime: 30.5 },
      { text: "Can you just confirm the charger ID", startTime: 32.0 },
      { text: "is MH-102-B?", startTime: 34.0 },
    ]
  },
  {
    id: "4",
    role: "driver",
    phrases: [
      { text: "Yeah, that's the one.", startTime: 35.5 },
      { text: "MH-102-B.", startTime: 37.5 },
    ]
  },
  {
    id: "5",
    role: "amelia",
    phrases: [
      { text: "Perfect, thanks.", startTime: 40.0 },
      { text: "Let me just look into what's happening there.", startTime: 41.5 },
      { text: "I've just run a diagnostic,", startTime: 44.5 },
      { text: "and it looks like the card reader module is frozen,", startTime: 46.5 },
      { text: "although the charger itself is healthy.", startTime: 49.5 },
      { text: "I'm going to trigger a remote reset", startTime: 52.0 },
      { text: "on the reader for you now.", startTime: 54.0 },
      { text: "It should take about 45 seconds", startTime: 56.0 },
      { text: "to reboot and come back online.", startTime: 58.0 },
    ]
  },
  {
    id: "6",
    role: "driver",
    phrases: [
      { text: "Great, okay, I'll hang on.", startTime: 60.0 },
    ]
  },
  {
    id: "7",
    role: "amelia",
    phrases: [
      { text: "While we're waiting for that to cycle,", startTime: 64.0 },
      { text: "I noticed you're using a guest payment.", startTime: 66.5 },
      { text: "Did you know that if you used our app,", startTime: 69.0 },
      { text: "you'd actually get a 35% discount", startTime: 71.5 },
      { text: "for charging during this off-peak window?", startTime: 74.0 },
      { text: "It's a fair bit cheaper", startTime: 76.5 },
      { text: "than the standard contactless rate.", startTime: 78.0 },
    ]
  },
  {
    id: "8",
    role: "driver",
    phrases: [
      { text: "Oh, interesting.", startTime: 80.0 },
      { text: "I wasn't aware of that.", startTime: 82.0 },
      { text: "I will give the app a go next time.", startTime: 84.0 },
      { text: "Thanks.", startTime: 86.5 },
    ]
  },
  {
    id: "9",
    role: "amelia",
    phrases: [
      { text: "It's definitely worth it for the savings.", startTime: 88.0 },
      { text: "Okay, the card reader has finished rebooting", startTime: 91.0 },
      { text: "and is showing as available again.", startTime: 94.0 },
      { text: "Could you give your card another tap for me?", startTime: 96.0 },
      { text: "It should authorize straight away now.", startTime: 98.5 },
    ]
  },
  {
    id: "10",
    role: "driver",
    phrases: [
      { text: "Yeah, let me try that.", startTime: 100.5 },
      { text: "Okay, oh yeah, it's worked.", startTime: 103.0 },
      { text: "It says preparing,", startTime: 105.5 },
      { text: "and it sounds like the cable's locked,", startTime: 107.5 },
      { text: "so I think we're good. Thank you.", startTime: 109.5 },
    ]
  },
  {
    id: "11",
    role: "amelia",
    phrases: [
      { text: "You're very welcome.", startTime: 112.0 },
      { text: "I can see the session has successfully initialized", startTime: 114.0 },
      { text: "on my end, too.", startTime: 117.0 },
      { text: "Is there anything else I can help you with today?", startTime: 118.5 },
    ]
  },
  {
    id: "12",
    role: "driver",
    phrases: [
      { text: "No, that's it.", startTime: 121.0 },
      { text: "Thanks for everything.", startTime: 123.0 },
    ]
  },
  {
    id: "13",
    role: "amelia",
    phrases: [
      { text: "No problem at all.", startTime: 126.0 },
      { text: "Have a lovely day,", startTime: 128.0 },
      { text: "and enjoy the rest of your drive.", startTime: 130.0 },
    ]
  }
];

type FlatPhraseBase = {
  messageId: string;
  role: "driver" | "amelia";
  phraseIndex: number;
  text: string;
  startTime: number;
};

type FlatPhrase = FlatPhraseBase & {
  nextStartTime: number | null;
};

const FLAT_PHRASES_BASE: FlatPhraseBase[] = TIMED_TRANSCRIPT.flatMap((msg) =>
  msg.phrases.map((p, phraseIndex) => ({
    messageId: msg.id,
    role: msg.role,
    phraseIndex,
    text: p.text,
    startTime: p.startTime,
  }))
);

const FLAT_PHRASES: FlatPhrase[] = FLAT_PHRASES_BASE.map((p, idx) => ({
  ...p,
  nextStartTime: FLAT_PHRASES_BASE[idx + 1]?.startTime ?? null,
}));

const estimateSpeechDuration = (text: string, role: "driver" | "amelia") => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Amelia is slightly slower/more deliberate in the recording.
  const secondsPerWord = role === "amelia" ? 0.31 : 0.28;
  return Math.min(5, Math.max(0.8, words * secondsPerWord));
};

// Build flat message array for compatibility
const CONVERSATION: Message[] = TIMED_TRANSCRIPT.map(tm => ({
  id: tm.id,
  role: tm.role,
  content: tm.phrases.map(p => p.text).join(" ")
}));

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
  "", // Empty - nothing during silence
  "Call connected",
  "Issue received",
  "Locating charger",
  "MH-102-B confirmed",
  "Running diagnostics",
  "Reader frozen",
  "Resetting reader",
  "Upsell offered",
  "Charger available",
  "Session active",
  "Call complete"
];

// Timeline step triggers - when each step activates (AFTER speech, synced to new timestamps)
const STEP_TRIGGERS: { stepId: string; activateAt: number; completeAt: number }[] = [
  { stepId: "1", activateAt: 4.8, completeAt: 11.5 },    // Call connected
  { stepId: "2", activateAt: 11.5, completeAt: 26 },     // Issue reported
  { stepId: "3", activateAt: 26, completeAt: 35.5 },     // Location confirmed
  { stepId: "4", activateAt: 35.5, completeAt: 40 },     // Charger ID verified
  { stepId: "5", activateAt: 44.5, completeAt: 52 },     // Diagnostics run
  { stepId: "6", activateAt: 54, completeAt: 64 },       // Reset triggered
  { stepId: "7", activateAt: 71.5, completeAt: 80 },     // Upsell offered
  { stepId: "8", activateAt: 94, completeAt: 100.5 },    // Charger available
  { stepId: "9", activateAt: 105.5, completeAt: 135 },   // Session started
];

// Status update triggers - synced to new timestamps
const STATUS_TRIGGERS: { statusIndex: number; time: number }[] = [
  { statusIndex: 1, time: 4.8 },   // Call connected
  { statusIndex: 2, time: 11.5 },  // Issue received
  { statusIndex: 3, time: 26 },    // Locating charger
  { statusIndex: 4, time: 35.5 },  // MH-102-B confirmed
  { statusIndex: 5, time: 44.5 },  // Running diagnostics
  { statusIndex: 6, time: 49.5 },  // Reader frozen
  { statusIndex: 7, time: 54 },    // Resetting reader
  { statusIndex: 8, time: 71.5 },  // Upsell offered
  { statusIndex: 9, time: 94 },    // Charger available
  { statusIndex: 10, time: 105.5 },// Session active
  { statusIndex: 11, time: 126 },  // Call complete
];

// Current phrase display state
export interface CurrentPhraseState {
  messageId: string | null;
  role: "driver" | "amelia" | null;
  visiblePhrases: string[]; // Phrases currently visible
  latestPhraseIndex: number; // Index of the most recent phrase (for highlighting)
  wordProgress: number; // 0-1 progress within current phrase for word reveal
  currentPhraseStartTime: number; // Start time of current phrase
  nextPhraseStartTime: number | null; // Start time of next phrase (for interpolation)
}

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

  // Phrase-level state for kinetic captions
  const [currentPhrase, setCurrentPhrase] = useState<CurrentPhraseState>({
    messageId: null,
    role: null,
    visiblePhrases: [],
    latestPhraseIndex: -1,
    wordProgress: 0,
    currentPhraseStartTime: 0,
    nextPhraseStartTime: null
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

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

  // Audio-driven sync loop - phrase-level precision
  useEffect(() => {
    if (!hasStarted || !isPlaying || isComplete) return;

    const syncWithAudio = () => {
      if (!audioRef.current) return;

      const currentTime = audioRef.current.currentTime;

      // RULE: Before first speech (< 4.5s), show NOTHING (background noise)
      if (currentTime < 4.5) {
        setCurrentPhrase({
          messageId: null,
          role: null,
          visiblePhrases: [],
          latestPhraseIndex: -1,
          wordProgress: 0,
          currentPhraseStartTime: 0,
          nextPhraseStartTime: null
        });
        setCurrentStatus("");
        setIsProcessing(false);
        setMessages([]);
        rafRef.current = requestAnimationFrame(syncWithAudio);
        return;
      }

      // Find the currently speaking phrase.
      // If nobody is speaking (silence/noise), show NOTHING.
      let activePhrase: FlatPhrase | null = null;
      for (const phrase of FLAT_PHRASES) {
        if (currentTime < phrase.startTime) break;

        const estimatedDuration = estimateSpeechDuration(phrase.text, phrase.role);
        const hardEnd = phrase.nextStartTime ?? Infinity;
        const endTime = Math.min(hardEnd, phrase.startTime + estimatedDuration);

        if (currentTime >= phrase.startTime && currentTime < endTime) {
          activePhrase = phrase;
        }
      }

      if (!activePhrase) {
        setCurrentPhrase({
          messageId: null,
          role: null,
          visiblePhrases: [],
          latestPhraseIndex: -1,
          wordProgress: 0,
          currentPhraseStartTime: 0,
          nextPhraseStartTime: null
        });
        setCurrentStatus("");
        setIsProcessing(false);
        rafRef.current = requestAnimationFrame(syncWithAudio);
        return;
      }

      // Build phrase window (max 2 phrases) for current message
      const activeMessage = TIMED_TRANSCRIPT.find(m => m.id === activePhrase!.messageId) ?? null;
      const latestPhraseIndex = activePhrase.phraseIndex;

      const visiblePhrases = activeMessage
        ? activeMessage.phrases
            .slice(Math.max(0, latestPhraseIndex - 1), latestPhraseIndex + 1)
            .map(p => p.text)
        : [activePhrase.text];

      const estimatedDuration = estimateSpeechDuration(activePhrase.text, activePhrase.role);
      const elapsed = currentTime - activePhrase.startTime;
      const wordProgress = Math.min(1, Math.max(0, elapsed / estimatedDuration));

      setCurrentPhrase({
        messageId: activePhrase.messageId,
        role: activePhrase.role,
        visiblePhrases,
        latestPhraseIndex,
        wordProgress,
        currentPhraseStartTime: activePhrase.startTime,
        nextPhraseStartTime: activePhrase.nextStartTime
      });

      // Build completed messages (all messages before current)
      if (activePhrase.messageId !== lastMessageIdRef.current) {
        const completedMessages: Message[] = [];
        for (const msg of TIMED_TRANSCRIPT) {
          if (msg.id === activePhrase.messageId) break;
          const firstPhraseTime = msg.phrases[0]?.startTime ?? Infinity;
          if (currentTime >= firstPhraseTime) {
            completedMessages.push({
              id: msg.id,
              role: msg.role,
              content: msg.phrases.map(p => p.text).join(" ")
            });
          }
        }
        setMessages(completedMessages);
        lastMessageIdRef.current = activePhrase.messageId;
      }

      setIsProcessing(true);

      // Update status based on time (AFTER speech)
      let newStatusIndex = 0;
      for (const trigger of STATUS_TRIGGERS) {
        if (currentTime >= trigger.time) {
          newStatusIndex = trigger.statusIndex;
        }
      }
      setCurrentStatus(STATUS_MESSAGES[newStatusIndex]);

      // Update timeline steps
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
  }, [hasStarted, isPlaying, isComplete]);

  const goToNext = useCallback(() => {
    // Find next message start time
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;

    for (const msg of TIMED_TRANSCRIPT) {
      const firstPhraseTime = msg.phrases[0]?.startTime ?? Infinity;
      if (firstPhraseTime > currentTime + 0.5) {
        audioRef.current.currentTime = firstPhraseTime;
        return;
      }
    }

    // No more messages, go to end
    setIsComplete(true);
    setShowConfirmation(true);
    setIsProcessing(false);
    setIsPlaying(false);
    audioRef.current.pause();
  }, []);

  const goToPrevious = useCallback(() => {
    if (!audioRef.current) return;
    const currentTime = audioRef.current.currentTime;

    // Find previous message start
    let prevTime = 0;
    for (const msg of TIMED_TRANSCRIPT) {
      const firstPhraseTime = msg.phrases[0]?.startTime ?? Infinity;
      if (firstPhraseTime < currentTime - 1) {
        prevTime = firstPhraseTime;
      } else {
        break;
      }
    }

    audioRef.current.currentTime = prevTime;
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
    setCurrentPhrase({
      messageId: null,
      role: null,
      visiblePhrases: [],
      latestPhraseIndex: -1,
      wordProgress: 0,
      currentPhraseStartTime: 0,
      nextPhraseStartTime: null
    });
    lastMessageIdRef.current = null;
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
    currentPhrase,
    reset,
    goToNext,
    goToPrevious,
    togglePlayPause,
    audioRef,
    startDemo
  };
};


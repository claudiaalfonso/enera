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
      { text: "Hello, my name is Amelia,", startTime: 6.3 },
      { text: "and I'm with Enera Support.", startTime: 8.5 },
      { text: "How can I help you today?", startTime: 10.7 },
    ]
  },
  {
    id: "2",
    role: "driver",
    phrases: [
      { text: "Hi, I'm trying to use the charger", startTime: 13.0 },
      { text: "at the Church Street car park", startTime: 15.5 },
      { text: "in Market Harborough,", startTime: 17.7 },
      { text: "but I'm not having much luck.", startTime: 19.5 },
      { text: "I've tried tapping my contactless card", startTime: 21.5 },
      { text: "a few times now,", startTime: 23.7 },
      { text: "and it looks like the screen isn't changing at all.", startTime: 25.0 },
    ]
  },
  {
    id: "3",
    role: "amelia",
    phrases: [
      { text: "I'm sorry you're having trouble.", startTime: 27.5 },
      { text: "Let me look into that for you.", startTime: 29.7 },
      { text: "You're in Market Harborough.", startTime: 32.0 },
      { text: "Can you just confirm the charger ID", startTime: 33.5 },
      { text: "is MH-102-B?", startTime: 35.5 },
    ]
  },
  {
    id: "4",
    role: "driver",
    phrases: [
      { text: "Yeah, that's the one.", startTime: 37.0 },
      { text: "MH-102-B.", startTime: 39.0 },
    ]
  },
  {
    id: "5",
    role: "amelia",
    phrases: [
      { text: "Perfect, thanks.", startTime: 41.5 },
      { text: "Let me just look into what's happening there.", startTime: 43.0 },
      { text: "I've just run a diagnostic,", startTime: 46.0 },
      { text: "and it looks like the card reader module is frozen,", startTime: 48.0 },
      { text: "although the charger itself is healthy.", startTime: 51.0 },
      { text: "I'm going to trigger a remote reset", startTime: 53.5 },
      { text: "on the reader for you now.", startTime: 55.5 },
      { text: "It should take about 45 seconds", startTime: 57.5 },
      { text: "to reboot and come back online.", startTime: 59.5 },
    ]
  },
  {
    id: "6",
    role: "driver",
    phrases: [
      { text: "Great, okay, I'll hang on.", startTime: 61.5 },
    ]
  },
  {
    id: "7",
    role: "amelia",
    phrases: [
      { text: "While we're waiting for that to cycle,", startTime: 65.5 },
      { text: "I noticed you're using a guest payment.", startTime: 68.0 },
      { text: "Did you know that if you used our app,", startTime: 70.5 },
      { text: "you'd actually get a 35% discount", startTime: 73.0 },
      { text: "for charging during this off-peak window?", startTime: 75.5 },
      { text: "It's a fair bit cheaper", startTime: 78.0 },
      { text: "than the standard contactless rate.", startTime: 79.5 },
    ]
  },
  {
    id: "8",
    role: "driver",
    phrases: [
      { text: "Oh, interesting.", startTime: 81.5 },
      { text: "I wasn't aware of that.", startTime: 83.5 },
      { text: "I will give the app a go next time.", startTime: 85.5 },
      { text: "Thanks.", startTime: 88.0 },
    ]
  },
  {
    id: "9",
    role: "amelia",
    phrases: [
      { text: "It's definitely worth it for the savings.", startTime: 89.5 },
      { text: "Okay, the card reader has finished rebooting", startTime: 92.5 },
      { text: "and is showing as available again.", startTime: 95.5 },
      { text: "Could you give your card another tap for me?", startTime: 97.5 },
      { text: "It should authorize straight away now.", startTime: 100.0 },
    ]
  },
  {
    id: "10",
    role: "driver",
    phrases: [
      { text: "Yeah, let me try that.", startTime: 102.0 },
      { text: "Okay, oh yeah, it's worked.", startTime: 104.5 },
      { text: "It says preparing,", startTime: 107.0 },
      { text: "and it sounds like the cable's locked,", startTime: 109.0 },
      { text: "so I think we're good. Thank you.", startTime: 111.0 },
    ]
  },
  {
    id: "11",
    role: "amelia",
    phrases: [
      { text: "You're very welcome.", startTime: 113.5 },
      { text: "I can see the session has successfully initialized", startTime: 115.5 },
      { text: "on my end, too.", startTime: 118.5 },
      { text: "Is there anything else I can help you with today?", startTime: 120.0 },
    ]
  },
  {
    id: "12",
    role: "driver",
    phrases: [
      { text: "No, that's it.", startTime: 122.5 },
      { text: "Thanks for everything.", startTime: 124.5 },
    ]
  },
  {
    id: "13",
    role: "amelia",
    phrases: [
      { text: "No problem at all.", startTime: 127.5 },
      { text: "Have a lovely day,", startTime: 129.5 },
      { text: "and enjoy the rest of your drive.", startTime: 131.5 },
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

// Human-readable system states - calm, explanatory, not technical
const STATUS_MESSAGES = [
  "", // Empty - nothing during silence
  "Listening to driver",
  "Understanding the issue",
  "Locating charger station",
  "Charger MH-102-B identified",
  "Running remote diagnostics",
  "Card reader unresponsive",
  "Resetting payment module",
  "Discount offer presented",
  "Charger available again",
  "Charging session confirmed",
  "Issue resolved"
];

// Timeline step triggers - when each step activates (AFTER speech, synced to +1.5s global offset)
const STEP_TRIGGERS: { stepId: string; activateAt: number; completeAt: number }[] = [
  { stepId: "1", activateAt: 6.3, completeAt: 13.0 },    // Call connected
  { stepId: "2", activateAt: 13.0, completeAt: 27.5 },   // Issue reported
  { stepId: "3", activateAt: 27.5, completeAt: 37.0 },   // Location confirmed
  { stepId: "4", activateAt: 37.0, completeAt: 41.5 },   // Charger ID verified
  { stepId: "5", activateAt: 46.0, completeAt: 53.5 },   // Diagnostics run
  { stepId: "6", activateAt: 55.5, completeAt: 65.5 },   // Reset triggered
  { stepId: "7", activateAt: 73.0, completeAt: 81.5 },   // Upsell offered
  { stepId: "8", activateAt: 95.5, completeAt: 102.0 },  // Charger available
  { stepId: "9", activateAt: 107.0, completeAt: 136.5 }, // Session started
];

// Status update triggers - appear AFTER Amelia references each action (+1.5s global offset)
const STATUS_TRIGGERS: { statusIndex: number; time: number }[] = [
  { statusIndex: 1, time: 12.0 },  // "Listening to driver" - after "How can I help you today?"
  { statusIndex: 2, time: 27.0 },  // "Understanding the issue" - after driver finishes explaining
  { statusIndex: 3, time: 30.5 },  // "Locating charger station" - after "Let me look into that"
  { statusIndex: 4, time: 40.0 },  // "Charger MH-102-B identified" - after driver confirms ID
  { statusIndex: 5, time: 47.0 },  // "Running remote diagnostics" - after "run a diagnostic"
  { statusIndex: 6, time: 49.5 },  // "Card reader unresponsive" - after "card reader module is frozen"
  { statusIndex: 7, time: 56.5 },  // "Resetting payment module" - after "trigger a remote reset"
  { statusIndex: 8, time: 74.5 },  // "Discount offer presented" - after "35% discount"
  { statusIndex: 9, time: 96.5 },  // "Charger available again" - after "available again"
  { statusIndex: 10, time: 105.5 },// "Charging session confirmed" - after "it's worked"
  { statusIndex: 11, time: 128.5 },// "Issue resolved" - after "No problem at all"
];

// Current phrase display state - strict lifecycle: Hidden → Active → Completed
export interface CurrentPhraseState {
  messageId: string | null;
  role: "driver" | "amelia" | null;
  // Full accumulated text - NEVER shrinks, only grows forward
  accumulatedText: string;
  // Current phrase being revealed
  currentPhraseText: string;
  wordProgress: number; // 0-1 progress within current phrase for word reveal
  currentPhraseStartTime: number;
  nextPhraseStartTime: number | null;
  // Lifecycle state
  state: "hidden" | "active" | "completed";
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
    accumulatedText: "",
    currentPhraseText: "",
    wordProgress: 0,
    currentPhraseStartTime: 0,
    nextPhraseStartTime: null,
    state: "hidden"
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  
  // Smooth text persistence refs - prevent popping between phrases
  const lastPhraseEndTimeRef = useRef<number>(0);
  const lastPhraseStateRef = useRef<CurrentPhraseState | null>(null);

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

  // Track completed messages for persistence between speakers
  const completedMessagesRef = useRef<Message[]>([]);
  const lastCompletedMessageRef = useRef<{ id: string; text: string } | null>(null);

  // Audio-driven sync loop - phrase-level precision
  useEffect(() => {
    if (!hasStarted || !isPlaying || isComplete) return;

    const syncWithAudio = () => {
      if (!audioRef.current) return;

      const currentTime = audioRef.current.currentTime;
      
      // Get first phrase start time dynamically
      const firstPhraseStart = FLAT_PHRASES[0]?.startTime ?? 5.0;

      // RULE: Before first speech, show NOTHING (background noise)
      // Use actual first phrase time, not hardcoded value
      if (currentTime < firstPhraseStart) {
        setCurrentPhrase({
          messageId: null,
          role: null,
          accumulatedText: "",
          currentPhraseText: "",
          wordProgress: 0,
          currentPhraseStartTime: 0,
          nextPhraseStartTime: null,
          state: "hidden"
        });
        setCurrentStatus("");
        setIsProcessing(false);
        setMessages([]);
        rafRef.current = requestAnimationFrame(syncWithAudio);
        return;
      }

      // Find the currently speaking phrase
      let activePhrase: FlatPhrase | null = null;
      let lastCompletedPhrase: FlatPhrase | null = null;
      
      for (const phrase of FLAT_PHRASES) {
        const estimatedDuration = estimateSpeechDuration(phrase.text, phrase.role);
        const hardEnd = phrase.nextStartTime ?? Infinity;
        const endTime = Math.min(hardEnd, phrase.startTime + estimatedDuration);

        if (currentTime >= phrase.startTime && currentTime < endTime) {
          activePhrase = phrase;
          break;
        } else if (currentTime >= endTime) {
          lastCompletedPhrase = phrase;
        }
      }

      // Update status based on time - ALWAYS, regardless of phrase state
      let newStatusIndex = 0;
      for (const trigger of STATUS_TRIGGERS) {
        if (currentTime >= trigger.time) {
          newStatusIndex = trigger.statusIndex;
        }
      }
      setCurrentStatus(STATUS_MESSAGES[newStatusIndex]);

      if (!activePhrase) {
        // NO ACTIVE SPEECH - but maintain last completed message until next speaker
        // This prevents text from disappearing between utterances
        
        if (lastCompletedPhrase && lastPhraseStateRef.current) {
          // Keep showing the COMPLETED state of the last phrase
          const completedMessage = TIMED_TRANSCRIPT.find(m => m.id === lastCompletedPhrase!.messageId);
          if (completedMessage) {
            // Show full message text as completed
            const fullText = completedMessage.phrases.map(p => p.text).join(" ");
            
            // Check if we need to update the completed message ref
            if (!lastCompletedMessageRef.current || lastCompletedMessageRef.current.id !== completedMessage.id) {
              lastCompletedMessageRef.current = { id: completedMessage.id, text: fullText };
            }
            
            // Show completed state - frozen, no animation
            setCurrentPhrase({
              messageId: completedMessage.id,
              role: completedMessage.role,
              accumulatedText: fullText,
              currentPhraseText: "",
              wordProgress: 1,
              currentPhraseStartTime: lastCompletedPhrase.startTime,
              nextPhraseStartTime: null,
              state: "completed"
            });
            setIsProcessing(false);
          }
        } else {
          // Genuine silence at start - hide everything
          setCurrentPhrase({
            messageId: null,
            role: null,
            accumulatedText: "",
            currentPhraseText: "",
            wordProgress: 0,
            currentPhraseStartTime: 0,
            nextPhraseStartTime: null,
            state: "hidden"
          });
          setIsProcessing(false);
        }
        
        rafRef.current = requestAnimationFrame(syncWithAudio);
        return;
      }

      // ACTIVE SPEECH - Build accumulated text for this message
      const activeMessage = TIMED_TRANSCRIPT.find(m => m.id === activePhrase!.messageId) ?? null;
      const latestPhraseIndex = activePhrase.phraseIndex;

      // All completed phrases so far (full text)
      const completedPhraseTexts = activeMessage
        ? activeMessage.phrases.slice(0, latestPhraseIndex).map(p => p.text)
        : [];
      
      // Current phrase being revealed
      const currentPhraseText = activePhrase.text;
      
      // Calculate word progress - FASTER reveal to ensure full visibility
      // Use 0.7x duration so text is fully revealed before speech ends
      const estimatedDuration = estimateSpeechDuration(activePhrase.text, activePhrase.role);
      const revealDuration = estimatedDuration * 0.7; // Faster reveal
      const elapsed = currentTime - activePhrase.startTime;
      const wordProgress = Math.min(1, Math.max(0, elapsed / revealDuration));
      
      // Accumulated text = all completed phrases joined
      const accumulatedText = completedPhraseTexts.join(" ");

      const newPhraseState: CurrentPhraseState = {
        messageId: activePhrase.messageId,
        role: activePhrase.role,
        accumulatedText,
        currentPhraseText,
        wordProgress,
        currentPhraseStartTime: activePhrase.startTime,
        nextPhraseStartTime: activePhrase.nextStartTime,
        state: "active"
      };
      
      setCurrentPhrase(newPhraseState);
      
      // Track for persistence
      lastPhraseEndTimeRef.current = activePhrase.startTime + estimatedDuration;
      lastPhraseStateRef.current = newPhraseState;

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

      // Note: Status is already updated at the top of the sync loop (line 373)

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

      // Completion is handled by 'ended' event - no hardcoded time check

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
      accumulatedText: "",
      currentPhraseText: "",
      wordProgress: 0,
      currentPhraseStartTime: 0,
      nextPhraseStartTime: null,
      state: "hidden"
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


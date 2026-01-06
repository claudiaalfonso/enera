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
const TIMED_TRANSCRIPT: TimedMessage[] = [
  {
    id: "1",
    role: "amelia",
    phrases: [
      { text: "Hello, my name is Amelia,", startTime: 3.0 },
      { text: "and I'm with Enera Support.", startTime: 5.2 },
      { text: "How can I help you today?", startTime: 7.5 },
    ]
  },
  {
    id: "2",
    role: "driver",
    phrases: [
      { text: "Hi, I'm trying to use the charger", startTime: 11.0 },
      { text: "at the Church Street car park", startTime: 13.5 },
      { text: "in Market Harborough,", startTime: 15.8 },
      { text: "but I'm not having much luck.", startTime: 17.5 },
      { text: "I've tried tapping my contactless card", startTime: 19.5 },
      { text: "a few times now,", startTime: 21.8 },
      { text: "and it looks like the screen isn't changing at all.", startTime: 23.0 },
    ]
  },
  {
    id: "3",
    role: "amelia",
    phrases: [
      { text: "I'm sorry you're having trouble.", startTime: 25.0 },
      { text: "Let me look into that for you.", startTime: 27.2 },
      { text: "You're in Market Harborough.", startTime: 29.5 },
      { text: "Can you just confirm the charger ID", startTime: 31.0 },
      { text: "is MH-102-B?", startTime: 33.0 },
    ]
  },
  {
    id: "4",
    role: "driver",
    phrases: [
      { text: "Yeah, that's the one.", startTime: 34.0 },
      { text: "MH-102-B.", startTime: 36.5 },
    ]
  },
  {
    id: "5",
    role: "amelia",
    phrases: [
      { text: "Perfect, thanks.", startTime: 39.0 },
      { text: "Let me just look into what's happening there.", startTime: 40.5 },
      { text: "I've just run a diagnostic,", startTime: 43.5 },
      { text: "and it looks like the card reader module is frozen,", startTime: 45.5 },
      { text: "although the charger itself is healthy.", startTime: 48.5 },
      { text: "I'm going to trigger a remote reset", startTime: 51.0 },
      { text: "on the reader for you now.", startTime: 53.0 },
      { text: "It should take about 45 seconds", startTime: 55.0 },
      { text: "to reboot and come back online.", startTime: 57.0 },
    ]
  },
  {
    id: "6",
    role: "driver",
    phrases: [
      { text: "Great, okay, I'll hang on.", startTime: 58.0 },
    ]
  },
  {
    id: "7",
    role: "amelia",
    phrases: [
      { text: "While we're waiting for that to cycle,", startTime: 63.0 },
      { text: "I noticed you're using a guest payment.", startTime: 65.5 },
      { text: "Did you know that if you used our app,", startTime: 68.0 },
      { text: "you'd actually get a 35% discount", startTime: 70.5 },
      { text: "for charging during this off-peak window?", startTime: 73.0 },
      { text: "It's a fair bit cheaper", startTime: 75.5 },
      { text: "than the standard contactless rate.", startTime: 77.0 },
    ]
  },
  {
    id: "8",
    role: "driver",
    phrases: [
      { text: "Oh, interesting.", startTime: 78.0 },
      { text: "I wasn't aware of that.", startTime: 80.0 },
      { text: "I will give the app a go next time.", startTime: 82.0 },
      { text: "Thanks.", startTime: 84.5 },
    ]
  },
  {
    id: "9",
    role: "amelia",
    phrases: [
      { text: "It's definitely worth it for the savings.", startTime: 86.0 },
      { text: "Okay, the card reader has finished rebooting", startTime: 89.0 },
      { text: "and is showing as available again.", startTime: 92.0 },
      { text: "Could you give your card another tap for me?", startTime: 94.0 },
      { text: "It should authorize straight away now.", startTime: 96.5 },
    ]
  },
  {
    id: "10",
    role: "driver",
    phrases: [
      { text: "Yeah, let me try that.", startTime: 98.0 },
      { text: "Okay, oh yeah, it's worked.", startTime: 100.5 },
      { text: "It says preparing,", startTime: 103.0 },
      { text: "and it sounds like the cable's locked,", startTime: 105.0 },
      { text: "so I think we're good. Thank you.", startTime: 107.0 },
    ]
  },
  {
    id: "11",
    role: "amelia",
    phrases: [
      { text: "You're very welcome.", startTime: 109.0 },
      { text: "I can see the session has successfully initialized", startTime: 111.0 },
      { text: "on my end, too.", startTime: 114.0 },
      { text: "Is there anything else I can help you with today?", startTime: 115.5 },
    ]
  },
  {
    id: "12",
    role: "driver",
    phrases: [
      { text: "No, that's it.", startTime: 117.0 },
      { text: "Thanks for everything.", startTime: 119.0 },
    ]
  },
  {
    id: "13",
    role: "amelia",
    phrases: [
      { text: "No problem at all.", startTime: 123.0 },
      { text: "Have a lovely day,", startTime: 125.0 },
      { text: "and enjoy the rest of your drive.", startTime: 127.0 },
    ]
  }
];

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
  "Upsell opportunity",
  "Charger available",
  "Session active",
  "Call complete"
];

// Timeline step triggers - when each step activates (AFTER Amelia says it)
const STEP_TRIGGERS: { stepId: string; activateAt: number; completeAt: number }[] = [
  { stepId: "1", activateAt: 3, completeAt: 11 },      // Call connected
  { stepId: "2", activateAt: 11, completeAt: 25 },     // Issue reported
  { stepId: "3", activateAt: 25, completeAt: 34 },     // Location confirmed
  { stepId: "4", activateAt: 34, completeAt: 39 },     // Charger ID verified
  { stepId: "5", activateAt: 43, completeAt: 51 },     // Diagnostics run (after Amelia says it)
  { stepId: "6", activateAt: 53, completeAt: 63 },     // Reset triggered
  { stepId: "7", activateAt: 70, completeAt: 78 },     // Upsell offered (after discount mentioned)
  { stepId: "8", activateAt: 92, completeAt: 98 },     // Charger available
  { stepId: "9", activateAt: 103, completeAt: 130 },   // Session started
];

// Status update triggers
const STATUS_TRIGGERS: { statusIndex: number; time: number }[] = [
  { statusIndex: 1, time: 3 },    // Call connected
  { statusIndex: 2, time: 11 },   // Issue received
  { statusIndex: 3, time: 25 },   // Locating charger
  { statusIndex: 4, time: 34 },   // MH-102-B confirmed
  { statusIndex: 5, time: 43 },   // Running diagnostics
  { statusIndex: 6, time: 48 },   // Reader frozen
  { statusIndex: 7, time: 53 },   // Resetting reader
  { statusIndex: 8, time: 70 },   // Upsell opportunity
  { statusIndex: 9, time: 92 },   // Charger available
  { statusIndex: 10, time: 103 }, // Session active
  { statusIndex: 11, time: 123 }, // Call complete
];

export type PlayMode = "auto" | "manual";

// Current phrase display state
export interface CurrentPhraseState {
  messageId: string | null;
  role: "driver" | "amelia" | null;
  visiblePhrases: string[]; // Phrases currently visible
  latestPhraseIndex: number; // Index of the most recent phrase (for highlighting)
}

export const useDemoSequence = (initialMode: PlayMode = "auto") => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<TimelineStep[]>(createInitialSteps());
  const [currentStatus, setCurrentStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>(initialMode);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [hasStarted, setHasStarted] = useState(false);
  
  // Phrase-level state for kinetic captions
  const [currentPhrase, setCurrentPhrase] = useState<CurrentPhraseState>({
    messageId: null,
    role: null,
    visiblePhrases: [],
    latestPhraseIndex: -1
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
    if (!hasStarted || !isPlaying || isComplete || playMode !== "auto") return;

    const syncWithAudio = () => {
      if (!audioRef.current) return;
      
      const currentTime = audioRef.current.currentTime;
      
      // RULE: Before first speech (< 3s), show NOTHING
      if (currentTime < 3) {
        setCurrentPhrase({
          messageId: null,
          role: null,
          visiblePhrases: [],
          latestPhraseIndex: -1
        });
        setCurrentStatus("");
        setMessages([]);
        rafRef.current = requestAnimationFrame(syncWithAudio);
        return;
      }
      
      // Find current message and visible phrases based on time
      let activeMessage: TimedMessage | null = null;
      let visiblePhrases: string[] = [];
      let latestPhraseIndex = -1;
      
      for (const msg of TIMED_TRANSCRIPT) {
        const firstPhraseTime = msg.phrases[0]?.startTime ?? Infinity;
        const lastPhraseTime = msg.phrases[msg.phrases.length - 1]?.startTime ?? 0;
        
        // Check if we're within this message's time window
        if (currentTime >= firstPhraseTime) {
          // Find which phrases are visible
          const phrases: string[] = [];
          let lastVisibleIdx = -1;
          
          for (let i = 0; i < msg.phrases.length; i++) {
            if (currentTime >= msg.phrases[i].startTime) {
              phrases.push(msg.phrases[i].text);
              lastVisibleIdx = i;
            }
          }
          
          if (phrases.length > 0) {
            activeMessage = msg;
            visiblePhrases = phrases;
            latestPhraseIndex = lastVisibleIdx;
          }
        }
      }
      
      // Update phrase state
      if (activeMessage) {
        setCurrentPhrase({
          messageId: activeMessage.id,
          role: activeMessage.role,
          visiblePhrases,
          latestPhraseIndex
        });
        
        // Build completed messages (all messages before current)
        if (activeMessage.id !== lastMessageIdRef.current) {
          const completedMessages: Message[] = [];
          for (const msg of TIMED_TRANSCRIPT) {
            if (msg.id === activeMessage.id) break;
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
          lastMessageIdRef.current = activeMessage.id;
        }
        
        setIsProcessing(true);
      }
      
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
  }, [hasStarted, isPlaying, isComplete, playMode]);

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
      latestPhraseIndex: -1
    });
    lastMessageIdRef.current = null;
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
    totalSteps: STEP_TRIGGERS.length,
    currentPhrase,
    reset,
    goToNext,
    goToPrevious,
    togglePlayPause,
    switchMode,
    audioRef,
    startDemo
  };
};

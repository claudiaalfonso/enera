import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  isFullscreen?: boolean;
}

const AudioVisualizer = ({ audioRef, isPlaying, isFullscreen = false }: AudioVisualizerProps) => {
  const [levels, setLevels] = useState<number[]>(new Array(7).fill(0.12));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    if (!audioRef.current || connectedRef.current) return;

    const setupAnalyzer = () => {
      try {
        audioContextRef.current = new AudioContext();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 32;
        analyzerRef.current.smoothingTimeConstant = 0.75;

        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current!);
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
        connectedRef.current = true;
      } catch (e) {
        console.warn("Audio analyzer setup failed:", e);
      }
    };

    const handlePlay = () => {
      if (!connectedRef.current) {
        setupAnalyzer();
      }
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
    };

    audioRef.current.addEventListener("play", handlePlay);

    return () => {
      audioRef.current?.removeEventListener("play", handlePlay);
    };
  }, [audioRef]);

  useEffect(() => {
    if (!isPlaying || !analyzerRef.current) {
      setLevels(new Array(7).fill(0.12));
      return;
    }

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);

    const updateLevels = () => {
      if (!analyzerRef.current) return;
      
      analyzerRef.current.getByteFrequencyData(dataArray);
      
      // Sample 7 frequency bands for more detail
      const bands = [
        dataArray[1] / 255,
        dataArray[2] / 255,
        dataArray[3] / 255,
        dataArray[4] / 255,
        dataArray[5] / 255,
        dataArray[6] / 255,
        dataArray[7] / 255,
      ];
      
      const normalized = bands.map(v => Math.max(0.12, Math.min(1, v * 1.3)));
      setLevels(normalized);
      
      rafRef.current = requestAnimationFrame(updateLevels);
    };

    rafRef.current = requestAnimationFrame(updateLevels);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className={cn(
      "flex items-center justify-center gap-[2px]",
      isFullscreen ? "h-5" : "h-4"
    )}>
      {levels.map((level, i) => (
        <motion.div
          key={i}
          className="bg-enera-brand/70 rounded-full"
          style={{
            width: isFullscreen ? 2 : 1.5,
          }}
          animate={{
            height: `${level * (isFullscreen ? 20 : 16)}px`,
            opacity: 0.5 + level * 0.5,
          }}
          transition={{
            duration: 0.06,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;

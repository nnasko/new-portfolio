"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./Toast";
import dynamic from "next/dynamic";

// Lazy load RainEffect only when needed
const RainEffect = dynamic(() => import("./RainEffect").then(mod => ({ default: mod.RainEffect })), {
  ssr: false,
});

interface SoundContextType {
  playClick: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isAmbientPlaying: boolean;
  toggleAmbient: () => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
};

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);
  const rainSoundRef = useRef<HTMLAudioElement | null>(null);
  const soundsLoadedRef = useRef(false);
  const { showToast } = useToast();

  // Lazy load sounds only when first needed
  const loadSounds = useCallback(async () => {
    if (soundsLoadedRef.current) return;
    
    try {
      const [clickAudio, rainAudio] = await Promise.all([
        new Promise<HTMLAudioElement>((resolve) => {
          const audio = new Audio("/sounds/click.wav");
          audio.volume = 0.15;
          audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
          audio.load();
        }),
        new Promise<HTMLAudioElement>((resolve) => {
          const audio = new Audio("/sounds/rain.wav");
          audio.volume = 0.05;
          audio.loop = true;
          audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
          audio.load();
        })
      ]);

      clickSoundRef.current = clickAudio;
      rainSoundRef.current = rainAudio;
      soundsLoadedRef.current = true;
    } catch (error) {
      console.error("Error loading sounds:", error);
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (clickSoundRef.current) {
        clickSoundRef.current.pause();
        clickSoundRef.current.remove();
      }
      if (rainSoundRef.current) {
        rainSoundRef.current.pause();
        rainSoundRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (rainSoundRef.current) {
      try {
        if (isAmbientPlaying && !isMuted) {
          rainSoundRef.current.currentTime = 0;
          const playPromise = rainSoundRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error playing rain sound:", error);
            });
          }
        } else {
          rainSoundRef.current.pause();
          rainSoundRef.current.currentTime = 0;
        }
      } catch (error) {
        console.error("Error with rain sound:", error);
      }
    }
  }, [isAmbientPlaying, isMuted]);

  const playClick = useCallback(async () => {
    if (isMuted) return;
    
    // Load sounds on first interaction
    if (!soundsLoadedRef.current) {
      await loadSounds();
    }
    
    if (clickSoundRef.current) {
      try {
        const sound = clickSoundRef.current.cloneNode() as HTMLAudioElement;
        sound.volume = 0.15;
        sound.play().catch((error) => {
          console.error("Error playing click sound:", error);
        });
      } catch (error) {
        console.error("Error with click sound:", error);
      }
    }
  }, [isMuted, loadSounds]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    showToast(isMuted ? "Sound enabled" : "Sound disabled");
  }, [isMuted, showToast]);

  const toggleAmbient = useCallback(async () => {
    // Load sounds on first interaction
    if (!soundsLoadedRef.current) {
      await loadSounds();
    }
    
    setIsAmbientPlaying((prev) => !prev);
    showToast(isAmbientPlaying ? "Rain disabled" : "Rain enabled");
    playClick();
  }, [isAmbientPlaying, showToast, playClick, loadSounds]);

  return (
    <SoundContext.Provider
      value={{
        playClick,
        isMuted,
        toggleMute,
        isAmbientPlaying,
        toggleAmbient,
      }}
    >
      {children}
      <AnimatePresence>
        {isAmbientPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RainEffect />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed bottom-6 right-24 z-50 flex gap-4">
        <motion.button
          onClick={toggleAmbient}
          className="p-3 rounded-none transition-all duration-300 shadow-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="Toggle rain effect"
        >
          {!isAmbientPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 7L19 19"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"
              />
            </svg>
          )}
        </motion.button>
        <motion.button
          onClick={toggleMute}
          className="p-3 rounded-none transition-all duration-300 shadow-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="Toggle sound"
        >
          {isMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
              />
            </svg>
          )}
        </motion.button>
      </div>
    </SoundContext.Provider>
  );
};

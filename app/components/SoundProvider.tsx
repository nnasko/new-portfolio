"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

interface SoundContextType {
  playHover: () => void;
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
  const [hoverSound, setHoverSound] = useState<HTMLAudioElement | null>(null);
  const [clickSound, setClickSound] = useState<HTMLAudioElement | null>(null);
  const [rainSound, setRainSound] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const hover = new Audio("/sounds/hover.wav");
    const click = new Audio("/sounds/click.wav");
    const rain = new Audio("/sounds/rain.wav");
    
    // Configure sounds
    hover.volume = 0.1;
    click.volume = 0.15;
    rain.volume = 0.05;
    rain.loop = true;

    // Preload sounds
    const preloadSounds = async () => {
      try {
        await Promise.all([
          hover.load(),
          click.load(),
          rain.load()
        ]);
        console.log('Sounds loaded successfully');
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };
    
    preloadSounds();
    
    setHoverSound(hover);
    setClickSound(click);
    setRainSound(rain);

    return () => {
      hover.pause();
      click.pause();
      rain.pause();
      hover.remove();
      click.remove();
      rain.remove();
    };
  }, []);

  useEffect(() => {
    if (rainSound) {
      try {
        if (!isMuted && isAmbientPlaying) {
          const playPromise = rainSound.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error playing rain sound:', error);
            });
          }
        } else {
          rainSound.pause();
        }
      } catch (error) {
        console.error('Error with rain sound:', error);
      }
    }
  }, [isMuted, isAmbientPlaying, rainSound]);

  const playHover = useCallback(() => {
    if (!isMuted && hoverSound) {
      try {
        const sound = hoverSound.cloneNode() as HTMLAudioElement;
        sound.volume = 0.1;
        const playPromise = sound.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing hover sound:', error);
          });
        }
      } catch (error) {
        console.error('Error with hover sound:', error);
      }
    }
  }, [isMuted, hoverSound]);

  const playClick = useCallback(() => {
    if (!isMuted && clickSound) {
      try {
        const sound = clickSound.cloneNode() as HTMLAudioElement;
        sound.volume = 0.15;
        const playPromise = sound.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing click sound:', error);
          });
        }
      } catch (error) {
        console.error('Error with click sound:', error);
      }
    }
  }, [isMuted, clickSound]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleAmbient = () => {
    setIsAmbientPlaying(!isAmbientPlaying);
  };

  return (
    <SoundContext.Provider value={{ playHover, playClick, isMuted, toggleMute, isAmbientPlaying, toggleAmbient }}>
      {children}
      <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-4">
        <motion.button
          onClick={toggleAmbient}
          className="p-3 rounded-full transition-all duration-300 shadow-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="Toggle ambient sound"
          onMouseEnter={playHover}
          onMouseDown={playClick}
        >
          {isAmbientPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            </svg>
          )}
        </motion.button>
        <motion.button
          onClick={toggleMute}
          className="p-3 rounded-full transition-all duration-300 shadow-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          aria-label="Toggle UI sounds"
          onMouseEnter={playHover}
          onMouseDown={playClick}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
          )}
        </motion.button>
      </div>
    </SoundContext.Provider>
  );
}; 
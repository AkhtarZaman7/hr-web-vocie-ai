'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  VideoCameraIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  CameraIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/solid';

interface CameraState {
  isMinimized: boolean;
  isEnabled: boolean;
  error: string | null;
}

export function FloatingCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [state, setState] = useState<CameraState>({
    isMinimized: true,
    isEnabled: false,
    error: null,
  });

  const stopCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStream(mediaStream);
      setState(prev => ({ ...prev, error: null }));
    } catch (err) {
      console.error('Camera error:', err);
      setState(prev => ({
        ...prev,
        error: 'Unable to access camera',
        isEnabled: false
      }));
    }
  };

  const toggleCamera = async () => {
    if (state.isEnabled) {
      await stopCamera();
    }
    setState(prev => ({
      ...prev,
      isEnabled: !prev.isEnabled,
      error: null
    }));
  };

  // Handle camera state changes
  useEffect(() => {
    let mounted = true;

    const handleCamera = async () => {
      if (state.isEnabled) {
        try {
          await startCamera();
        } catch{
          if (mounted) {
            setState(prev => ({
              ...prev,
              error: 'Failed to start camera',
              isEnabled: false
            }));
          }
        }
      } else {
        await stopCamera();
      }
    };

    handleCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [state.isEnabled]);

  const toggleMinimize = () => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    setPosition({ x: 0, y: 0 });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="camera-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: position.x,
          y: position.y,
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className={`fixed touch-none select-none ${
          state.isMinimized 
            ? 'bottom-24 right-4 sm:bottom-8'
            : 'top-4 right-4'
        } z-[100]`}
        drag
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        dragElastic={0.2}
        whileDrag={{ scale: 1.02 }}
        onDragEnd={(event, info) => {
          setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y });
        }}
        layout
      >
        <div className="relative group cursor-move">
          <motion.div
            layout
            className={`overflow-hidden rounded-xl bg-[#2C2C2E] border border-[#48484A] shadow-xl
              ${state.isMinimized 
                ? 'w-16 h-16 sm:w-20 sm:h-20'
                : 'w-64 h-[144px] sm:w-80 sm:h-[180px]'
              }
              transition-[width,height] duration-300
            `}
          >
            {state.isEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform ${
                  state.isMinimized ? 'scale-150' : 'scale-100'
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1C1C1E]">
                {state.error ? (
                  <div className="text-center p-4">
                    <NoSymbolIcon className="w-8 h-8 text-[#FF453A] mx-auto mb-2" />
                    <p className="text-xs text-[#EBEBF599]">{state.error}</p>
                  </div>
                ) : (
                  <CameraIcon className="w-8 h-8 text-[#EBEBF599]" />
                )}
              </div>
            )}
            
            {/* Controls overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-2 right-2 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleCamera}
                  className="p-1.5 rounded-lg bg-[#2C2C2E]/80 hover:bg-[#48484A]/80 text-white/80 backdrop-blur-sm
                    transition-colors"
                >
                  <VideoCameraIcon 
                    className={`w-4 h-4 ${!state.isEnabled && 'text-[#FF453A]'}`}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMinimize}
                  className="p-1.5 rounded-lg bg-[#2C2C2E]/80 hover:bg-[#48484A]/80 text-white/80 backdrop-blur-sm
                    transition-colors"
                >
                  {state.isMinimized ? (
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                  ) : (
                    <ArrowsPointingInIcon className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 
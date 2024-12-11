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
  isCameraAvailable: boolean;
  hasPermission: boolean;
  error: string | null;
}

interface CameraError extends Error {
  name: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' | 'OverconstrainedError' | 'TypeError' | string;
  message: string;
}

export function FloatingCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>({
    isMinimized: false,
    isEnabled: true,
    isCameraAvailable: false,
    hasPermission: false,
    error: null,
  });

  // Check camera availability
  useEffect(() => {
    async function checkCamera() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        setState(prev => ({ ...prev, isCameraAvailable: hasCamera }));
      } catch (err) {
        console.error('Error checking camera:', err);
        setState(prev => ({ 
          ...prev, 
          isCameraAvailable: false,
          error: 'Unable to detect camera devices'
        }));
      }
    }
    checkCamera();
  }, []);

  // Handle camera setup
  useEffect(() => {
    async function setupCamera() {
      if (!state.isEnabled || !state.isCameraAvailable) return;

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
            aspectRatio: 16/9,
          } 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setState(prev => ({ 
          ...prev, 
          hasPermission: true,
          error: null 
        }));
      } catch (err: unknown) {
        console.error('Error accessing camera:', err);
        const cameraError = err as CameraError;
        setState(prev => ({ 
          ...prev, 
          hasPermission: false,
          error: cameraError.name === 'NotAllowedError' 
            ? 'Camera access denied. Please allow camera access.'
            : 'Unable to access camera'
        }));
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [state.isEnabled, state.isCameraAvailable]);

  const toggleCamera = () => {
    if (state.isEnabled) {
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  const toggleMinimize = () => {
    setState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className={`fixed ${state.isMinimized ? 'bottom-4 right-4' : 'top-4 right-4'} z-50`}
      >
        <div className="relative group">
          <motion.div
            layout
            className={`overflow-hidden rounded-xl bg-[#2C2C2E] border border-[#48484A] shadow-lg
              ${state.isMinimized ? 'w-20 h-20' : 'w-80 h-[180px]'}`}
          >
            {state.isEnabled && state.hasPermission ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform ${state.isMinimized ? 'scale-150' : 'scale-100'}`}
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
                  <VideoCameraIcon className={`w-4 h-4 ${!state.isEnabled && 'text-[#FF453A]'}`} />
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
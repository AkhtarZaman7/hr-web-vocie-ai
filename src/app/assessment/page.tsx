'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/solid';
import { FloatingCamera } from './components/FloatingCamera';

const CircleAnimation = dynamic(
  () =>
    import('./components/CircleAnimation').then((mod) => mod.CircleAnimation),
  { ssr: false }
);

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

export default function VoiceAssessment() {
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('connected');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getAnimationColor = () => {
    if (connectionStatus === 'error') return '#FF453A';
    if (connectionStatus === 'connected' && !isSpeaking) return '#4ADE80';
    if (isSpeaking) return '#A855F7';
    return '#6B7280';
  };

  const getStatusMessage = () => {
    if (error) return error;
    switch (connectionStatus) {
      case 'connecting':
        return 'Preparing your interview...';
      case 'connected':
        return isSpeaking
          ? 'Interviewer is speaking...'
          : 'Interview in progress';
      case 'error':
        return 'Connection interrupted';
      default:
        return 'Setting up your interview...';
    }
  };

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full flex flex-col px-4 py-8 relative">
        {/* Main content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#A855F7] to-[#4ADE80]">
              Hirewise Interview
            </h1>
            <p className="mt-2 text-sm text-[#EBEBF599] px-6">
              Experience a professional interview with our intelligent assessment system
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-12 relative z-10">
          {/* Status Badge - Updated colors */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-3 py-1.5 rounded-full text-sm ${
                connectionStatus === 'connected'
                  ? 'bg-[#4ADE80]/20 text-[#4ADE80]'
                  : connectionStatus === 'error'
                  ? 'bg-[#FF453A]/20 text-[#FF453A]'
                  : 'bg-[#A855F7]/20 text-[#A855F7]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-[#4ADE80]'
                    : connectionStatus === 'error'
                    ? 'bg-[#FF453A]'
                    : 'bg-[#A855F7]'
                } ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`} />
                {getStatusMessage()}
              </span>
            </motion.div>
          </div>

          {/* Circle Animation Container - Updated background */}
          <div className="relative w-72 h-72">
            {/* Background blur */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-[#A855F7]/10 to-[#4ADE80]/10 blur-3xl rounded-full"
              style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }}
            />
            
            {/* Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <CircleAnimation
                isActive={connectionStatus === 'connected'}
                color={getAnimationColor()}
                size={288}
                isSpeaking={isSpeaking}
              />
            </div>

            {/* Center Icon - Updated colors */}
            <div className="absolute inset-0 flex items-center justify-center">
              {error ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <ExclamationTriangleIcon className="w-10 h-10 text-[#FF453A]" />
                  <p className="text-[#FF453A] text-center text-sm max-w-[180px]">{error}</p>
                </motion.div>
              ) : (
                connectionStatus === 'connected' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 rounded-full bg-[#2C2C2E]/50 backdrop-blur-sm"
                  >
                    {isSpeaking ? (
                      <SpeakerWaveIcon className="w-10 h-10 text-[#A855F7]" />
                    ) : (
                      <MicrophoneIcon className="w-10 h-10 text-[#4ADE80]" />
                    )}
                  </motion.div>
                )
              )}
            </div>
          </div>

        </div>

        {/* Dev Controls - Make it absolute positioned */}
        {true && (
          <div className="absolute bottom-4 left-4 right-4 space-y-3 backdrop-blur-sm bg-[#2C2C2E]/50 p-4 rounded-xl border border-[#48484A] z-20">
            <p className="text-xs text-[#EBEBF599] font-medium mb-2">Dev Controls</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConnectionStatus('idle')}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#3A3A3C] hover:bg-[#48484A] transition-colors"
              >
                Idle
              </button>
              <button
                onClick={() => setConnectionStatus('connecting')}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#3A3A3C] hover:bg-[#48484A] transition-colors"
              >
                Connecting
              </button>
              <button
                onClick={() => setConnectionStatus('connected')}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#3A3A3C] hover:bg-[#48484A] transition-colors"
              >
                Connected
              </button>
              <button
                onClick={() => setConnectionStatus('error')}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#3A3A3C] hover:bg-[#48484A] transition-colors"
              >
                Error
              </button>
              <button
                onClick={() => setIsSpeaking(!isSpeaking)}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#3A3A3C] hover:bg-[#48484A] transition-colors col-span-2"
              >
                Toggle Speaking
              </button>
              <button
                onClick={() => setError(error ? null : 'Test error message')}
                className="px-3 py-1.5 text-sm rounded-lg bg-[#3A3A3C] hover:bg-[#48484A] transition-colors col-span-2"
              >
                Toggle Error
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Camera component moved outside main content */}
      <FloatingCamera />
    </div>
  );
}

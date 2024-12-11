'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/solid';

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
    if (connectionStatus === 'error') return '#ef4444';
    if (connectionStatus === 'connected' && !isSpeaking) return '#22c55e';
    if (isSpeaking) return '#3b82f6';
    return '#94a3b8';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="h-screen flex flex-col px-4 py-8">
        {/* Header - Compact for mobile */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Hirewise Interview
          </h1>
          <p className="mt-2 text-sm text-gray-400 px-6">
            Experience a professional interview with our intelligent assessment system
          </p>
        </div>

        {/* Interview Info - Mobile optimized */}
        <div className="flex justify-center gap-3 text-xs text-gray-500 mt-4">
          <span className="flex items-center gap-1">
            <MicrophoneIcon className="w-3 h-3" />
            Speak naturally
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span>15-20 min</span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-12">
          {/* Status Badge */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-3 py-1.5 rounded-full text-sm ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : connectionStatus === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-400'
                    : connectionStatus === 'error'
                    ? 'bg-red-400'
                    : 'bg-blue-400'
                } ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`} />
                {getStatusMessage()}
              </span>
            </motion.div>
          </div>

          {/* Circle Animation Container */}
          <div className="relative w-72 h-72">
            {/* Background blur */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 blur-3xl rounded-full"
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

            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {error ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <ExclamationTriangleIcon className="w-10 h-10 text-red-400" />
                  <p className="text-red-400 text-center text-sm max-w-[180px]">{error}</p>
                </motion.div>
              ) : (
                connectionStatus === 'connected' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 rounded-full bg-gray-800/50 backdrop-blur-sm"
                  >
                    {isSpeaking ? (
                      <SpeakerWaveIcon className="w-10 h-10 text-blue-400" />
                    ) : (
                      <MicrophoneIcon className="w-10 h-10 text-emerald-400" />
                    )}
                  </motion.div>
                )
              )}
            </div>
          </div>

        </div>

        {/* Dev Controls */}
        {true&& (
          <div className="space-y-3 backdrop-blur-sm bg-gray-800/50 p-4 rounded-xl border border-gray-700 mx-2 mt-auto">
            <p className="text-xs text-gray-400 font-medium mb-2">Dev Controls</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setConnectionStatus('idle')}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Idle
              </button>
              <button
                onClick={() => setConnectionStatus('connecting')}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Connecting
              </button>
              <button
                onClick={() => setConnectionStatus('connected')}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Connected
              </button>
              <button
                onClick={() => setConnectionStatus('error')}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Error
              </button>
              <button
                onClick={() => setIsSpeaking(!isSpeaking)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors col-span-2"
              >
                Toggle Speaking
              </button>
              <button
                onClick={() => setError(error ? null : 'Test error message')}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors col-span-2"
              >
                Toggle Error
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

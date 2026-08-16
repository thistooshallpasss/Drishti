'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface declarations for TypeScript
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export interface UseSpeechToTextOptions {
  lang?: string;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { lang = 'en-US' } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef('');
  const lastInterimRef = useRef('');
  const isUserActiveListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            currentFinal += text + ' ';
          } else {
            currentInterim += text;
          }
        }

        if (currentFinal.trim()) {
          finalTranscriptRef.current = (
            finalTranscriptRef.current + ' ' + currentFinal.trim()
          ).trim();
          setTranscript(finalTranscriptRef.current);
          lastInterimRef.current = '';
        } else {
          lastInterimRef.current = currentInterim;
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('[SpeechRecognition Error]', event.error);
        if (event.error === 'no-speech') {
          // Normal on mobile between sentences - ignore and keep active
          return;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
          isUserActiveListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If mobile browser auto-ended while user is still actively recording, restart seamlessly!
        if (lastInterimRef.current.trim()) {
          finalTranscriptRef.current = (
            finalTranscriptRef.current + ' ' + lastInterimRef.current.trim()
          ).trim();
          setTranscript(finalTranscriptRef.current);
          lastInterimRef.current = '';
        }
        setInterimTranscript('');

        if (isUserActiveListeningRef.current) {
          // Mobile auto-restart
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isUserActiveListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                setIsListening(true);
              } catch (e) {
                // Already started or restarting
              }
            }
          }, 80);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization error', e);
      setIsSupported(false);
    }

    return () => {
      isUserActiveListeningRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    setError(null);
    finalTranscriptRef.current = '';
    lastInterimRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    isUserActiveListeningRef.current = true;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn('Start listening exception', e);
    }
  }, []);

  const stopListening = useCallback(() => {
    isUserActiveListeningRef.current = false;
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

    if (lastInterimRef.current.trim()) {
      finalTranscriptRef.current = (
        finalTranscriptRef.current + ' ' + lastInterimRef.current.trim()
      ).trim();
      setTranscript(finalTranscriptRef.current);
      lastInterimRef.current = '';
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setInterimTranscript('');

    return finalTranscriptRef.current.trim();
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    lastInterimRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    fullLiveTranscript: (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim(),
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

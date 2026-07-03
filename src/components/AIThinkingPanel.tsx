import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIThinkingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamComplete: (result: any) => void;
  onError: (error: string) => void;
  requestData?: any;
}

export interface AIThinkingPanelRef {
  startStreaming: (data: any) => void;
}

export const AIThinkingPanel = forwardRef<AIThinkingPanelRef, AIThinkingPanelProps>(({
  isOpen,
  onClose,
  onStreamComplete,
  onError,
  requestData
}, ref) => {
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentThought, setCurrentThought] = useState('');
  const [accumulatedText, setAccumulatedText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts, currentThought]);

  useEffect(() => {
    if (isOpen && requestData) {
      startStreaming(requestData);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, requestData]);

  const startStreaming = async (data: any) => {
    setIsStreaming(true);
    setThoughts([]);
    setCurrentThought('');
    setAccumulatedText('');
    
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/format-selection-stream.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const dataStr = line.trim().slice(6);
            
            if (dataStr === '[DONE]') {
              setIsStreaming(false);
              return;
            }

            try {
              const parsed = JSON.parse(dataStr);
              
              if (parsed.error) {
                onError(parsed.error);
                setIsStreaming(false);
                return;
              }

              // ChatGPT-style: Display text chunks in real-time
              if (parsed.text) {
                setAccumulatedText(prev => prev + parsed.text);
                setCurrentThought(prev => prev + parsed.text);
              }

              // Only parse JSON at the end
              if (parsed.done && parsed.result) {
                onStreamComplete(parsed.result);
                setIsStreaming(false);
                return;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Streaming error:', error);
        onError('Failed to connect to AI stream');
      }
      setIsStreaming(false);
    }
  };

  useImperativeHandle(ref, () => ({
    startStreaming
  }));

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-stone-200 dark:border-stone-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Brain className="w-8 h-8" />
                    <Sparkles className="w-4 h-4 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">AI Thinking Process</h2>
                    <p className="text-blue-100 text-sm">Watch the AI format your content in real-time</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]" ref={scrollRef}>
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400 mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              )}

              <div className="space-y-4">
                {thoughts.map((thought, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-stone-50 dark:bg-stone-800 rounded-lg p-4 border-l-4 border-blue-500"
                  >
                    <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                      {thought}
                    </p>
                  </motion.div>
                ))}

                {currentThought && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50 rounded-lg p-4 border-l-4 border-purple-500"
                  >
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                        {currentThought}
                        <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {!isStreaming && thoughts.length === 0 && !currentThought && (
                <div className="text-center py-12 text-stone-400 dark:text-stone-600">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Waiting for AI to start thinking...</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-stone-50 dark:bg-stone-800 px-6 py-4 border-t border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
                <span>Real-time AI processing</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

AIThinkingPanel.displayName = 'AIThinkingPanel';

import React from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

export interface FormattingProgress {
  active: boolean;
  currentChunk: number;
  totalChunks: number;
  stage: 'processing' | 'retrying' | 'fallback';
}

interface FormattingProgressProps {
  progress: FormattingProgress;
}

export const FormattingProgress: React.FC<FormattingProgressProps> = ({ progress }) => {
  if (!progress.active) return null;
  
  const percentage = progress.totalChunks > 1 
    ? (progress.currentChunk / progress.totalChunks) * 100 
    : 50;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3 mb-4">
          {progress.stage === 'retrying' && (
            <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />
          )}
          {progress.stage === 'fallback' && (
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          )}
          {progress.stage === 'processing' && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          <span className="font-medium text-stone-900 dark:text-stone-100">
            {progress.stage === 'retrying' && 'Retrying...'}
            {progress.stage === 'fallback' && 'Using fallback...'}
            {progress.stage === 'processing' && 'Formatting...'}
          </span>
        </div>
        
        {progress.totalChunks > 1 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-stone-600 dark:text-stone-400">
              <span>Chunk {progress.currentChunk} of {progress.totalChunks}</span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
        
        {progress.stage === 'retrying' && (
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-3">
            Server is busy. Retrying with exponential backoff...
          </p>
        )}
        
        {progress.stage === 'fallback' && (
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-3">
            Using simplified formatting for better reliability.
          </p>
        )}
        
        {progress.stage === 'processing' && progress.totalChunks === 1 && (
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-3">
            AI is formatting your content. This may take a moment...
          </p>
        )}
      </div>
    </div>
  );
};

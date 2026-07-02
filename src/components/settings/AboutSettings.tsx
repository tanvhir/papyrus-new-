import React from 'react';

export const AboutSettings: React.FC = () => {
  return (
    <div className="space-y-8 w-full">
      <div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">About</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400">Application information</p>
      </div>
      <div className="p-4 rounded-lg bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800">
        <p className="text-sm text-stone-600 dark:text-stone-400">Papyrus v1.0</p>
      </div>
    </div>
  );
};

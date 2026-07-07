import React from 'react';
import { motion } from 'motion/react';
import { Database, AlertTriangle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InstallerOverlay: React.FC = () => {
  const handleLaunchInstaller = () => {
    window.location.href = '/install/index.php';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f1ea] dark:bg-[#121212] px-4 py-8 transition-colors duration-300">
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-transparent opacity-20 dark:opacity-5 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle, #8c6d4f 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px]"
      >
        <div className="bg-[#fffcf5] dark:bg-[#1c1c1a] border border-[#e6e0d3] dark:border-[#2d2d2a] rounded-2xl shadow-xl overflow-hidden p-8 sm:p-10 text-center transition-colors duration-300">
          
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-6 border border-amber-500/20">
            <Database className="w-7 h-7" />
          </div>

          <h1 className="font-display text-2xl font-bold text-[#8c6d4f] dark:text-[#c8a27c]">
            Database Needed
          </h1>
          <p className="text-sm text-[#5e5e5e] dark:text-[#a0a0a0] mt-3 font-sans leading-relaxed">
            Papyrus study platform has not been compiled on your MySQL database yet. Let's launch the automatic cPanel installation wizard to get your cloud synced data running in under a minute!
          </p>

          <div className="bg-[#fcfbf9] dark:bg-[#151514] border border-[#e6e0d3]/50 dark:border-[#2d2d2a]/50 p-4 rounded-xl text-left my-6 space-y-3">
            <div className="flex gap-2.5 items-start text-xs text-[#5e5e5e] dark:text-[#a0a0a0]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Saves user settings, notebooks, active papers, folders, and statistics safely under secure SQL.</span>
            </div>
            <div className="flex gap-2.5 items-start text-xs text-[#5e5e5e] dark:text-[#a0a0a0]">
              <AlertTriangle className="w-4 h-4 text-[#8c6d4f] shrink-0 mt-0.5" />
              <span>Will secure your administration account and write configuration credentials inside <code>/config/app.php</code>.</span>
            </div>
          </div>

          <Button
            onClick={handleLaunchInstaller}
            className="w-full h-11 bg-[#8c6d4f] hover:bg-[#755a40] text-white font-medium rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:translate-y-[-1px] active:translate-y-[1px] duration-200"
          >
            <span>Launch Installation Wizard</span>
            <ArrowUpRight className="w-4.5 h-4.5" />
          </Button>

          <div className="mt-5 text-[11px] text-[#5e5e5e]/80 dark:text-[#a0a0a0]/60 font-mono">
            Shared Hosting Ready &bull; GoDaddy Hostinger cPanel compatible
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { Feather, Mail, Lock, AlertCircle, Loader, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@domain.com');
  const [password, setPassword] = useState('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setErrorMsg('Authentication failed. Check your security entries.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network lookup failed. Confirm backend server is up and database is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f1ea] dark:bg-[#121212] px-4 py-8 select-none transition-colors duration-300">
      
      {/* Background elegant grid texture */}
      <div className="absolute inset-0 bg-transparent opacity-30 dark:opacity-5 pointer-events-none" 
        style={{
          backgroundImage: `
            radial-gradient(circle, #8c6d4f 1.5px, transparent 1.5px)
          `,
          backgroundSize: '24px 24px'
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="bg-[#fffcf5] dark:bg-[#1c1c1a] border border-[#e6e0d3] dark:border-[#2d2d2a] rounded-2xl shadow-xl overflow-hidden p-8 sm:p-10 transition-colors duration-300">
          
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-[#8c6d4f]/10 dark:bg-[#c8a27c]/10 rounded-full flex items-center justify-center text-[#8c6d4f] dark:text-[#c8a27c] mb-4 border border-[#8c6d4f]/20">
              <Feather className="w-6 h-6 rotate-12" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#8c6d4f] dark:text-[#c8a27c]">
              PAPYRUS
            </h1>
            <p className="text-sm text-[#5e5e5e] dark:text-[#a0a0a0] mt-1 font-sans">
              Enter credentials to securely sync your studies
            </p>
            
            <div className="w-full mt-5 p-3.5 bg-[#8c6d4f]/5 dark:bg-[#c8a27c]/5 border border-[#8c6d4f]/15 dark:border-[#c8a27c]/15 rounded-xl text-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8c6d4f] dark:text-[#c8a27c] bg-[#8c6d4f]/10 dark:bg-[#c8a27c]/10 px-2 py-0.5 rounded-full inline-block mb-1.5">
                ⚡ AI Studio Sandbox Active
              </span>
              <p className="text-xs text-[#6e6358] dark:text-[#b49f8a] font-sans leading-relaxed">
                Database integration is bypassed. We've filled working credentials below for easy one-click access.
              </p>
              <div className="mt-2 text-[11px] font-mono text-[#5e5e5e] dark:text-[#a0a0a0] flex justify-center items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@domain.com');
                    setPassword('admin');
                  }}
                  className="px-2 py-0.5 bg-[#8c6d4f]/10 hover:bg-[#8c6d4f]/25 dark:bg-[#c8a27c]/10 dark:hover:bg-[#c8a27c]/25 border border-[#8c6d4f]/20 dark:border-[#c8a27c]/20 text-[#8c6d4f] dark:text-[#c8a27c] rounded font-semibold cursor-pointer transition select-none uppercase tracking-wide text-[9px]"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800 dark:text-red-200 font-sans tracking-wide">
                    {errorMsg}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Email Address</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#5e5e5e] dark:text-[#a0a0a0]">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@domain.com"
                  className="pl-10 h-11 bg-white/50 dark:bg-[#121212]/50 border-[#e6e0d3] dark:border-[#2d2d2a] focus-visible:ring-[#8c6d4f]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Security Password</Label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#5e5e5e] dark:text-[#a0a0a0]">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  className="pl-10 h-11 bg-white/50 dark:bg-[#121212]/50 border-[#e6e0d3] dark:border-[#2d2d2a] focus-visible:ring-[#8c6d4f]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                id="login-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#8c6d4f] hover:bg-[#755a40] text-white font-medium rounded-lg shadow-sm border border-[#8c6d4f]/10 flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4.5 h-4.5 animate-spin" />
                    <span>Synchronizing Portal...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Cloud Sync</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="text-center mt-6 text-[11px] font-mono text-[#5e5e5e] dark:text-[#a0a0a0]">
            Papyrus Database Integration &bull; Securing Cookies
          </div>
        </div>
      </motion.div>
    </div>
  );
};

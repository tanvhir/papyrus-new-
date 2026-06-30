import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { Mail, Lock, AlertCircle, Loader, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PapyrusLogo = () => (
  <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="leafGrad" x1="6" y1="0" x2="30" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#66BB6A"/>
        <stop offset="20%" stopColor="#43A047"/>
        <stop offset="45%" stopColor="#2E7D32"/>
        <stop offset="70%" stopColor="#1B5E20"/>
        <stop offset="100%" stopColor="#0B2E10"/>
      </linearGradient>
      <linearGradient id="vMid" x1="30" y1="4" x2="11" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1B5E20" stopOpacity="0.35"/>
        <stop offset="100%" stopColor="#0B2E10" stopOpacity="0.3"/>
      </linearGradient>
      <linearGradient id="vSide" x1="20" y1="20" x2="5" y2="20" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#A5D6A7" stopOpacity="0.55"/>
        <stop offset="100%" stopColor="#A5D6A7" stopOpacity="0.3"/>
      </linearGradient>
      <radialGradient id="gloss" cx="50%" cy="50%" r="50%" gradientTransform="translate(0.32 0.18) rotate(35) scale(0.42 0.95)">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55"/>
        <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.12"/>
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="rim" cx="20%" cy="10%" r="90%">
        <stop offset="0%" stopColor="#A5D6A7" stopOpacity="0.5"/>
        <stop offset="40%" stopColor="#A5D6A7" stopOpacity="0"/>
      </radialGradient>
      <clipPath id="leafClip">
        <path d="M32 2C32 2 20 0 10 10C4 16 2 24 3 30C4 34 7 37 11 38C15 39 20 38 24 35C30 30 34 22 34 14C34 8 32 2 32 2Z"/>
      </clipPath>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="1" floodColor="#0B2E10" floodOpacity="0.35"/>
      </filter>
    </defs>
    <g filter="url(#softShadow)">
      <path d="M32 2C32 2 20 0 10 10C4 16 2 24 3 30C4 34 7 37 11 38C15 39 20 38 24 35C30 30 34 22 34 14C34 8 32 2 32 2Z" fill="url(#leafGrad)"/>
      <g clipPath="url(#leafClip)">
        <path d="M10 10C4 16 2 24 3 30" stroke="url(#rim)" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <g fill="none" strokeLinecap="round">
          <path d="M30 4 C26 12, 20 24, 11 38" stroke="url(#vMid)" strokeWidth="1"/>
          <path d="M28.7 6.5 Q25.8 4.2 23.5 4.7" stroke="url(#vSide)" strokeWidth="0.6"/>
          <path d="M28.7 6.5 Q31.3 4.8 33 6" stroke="url(#vSide)" strokeWidth="0.6"/>
          <path d="M26.3 11 Q20 8 16.5 8.3" stroke="url(#vSide)" strokeWidth="0.85"/>
          <path d="M26.3 11 Q30.5 9.3 33.2 10.8" stroke="url(#vSide)" strokeWidth="0.85"/>
          <path d="M23.6 16 Q15 12.7 9 13" stroke="url(#vSide)" strokeWidth="1"/>
          <path d="M23.6 16 Q29.5 14 33 15.5" stroke="url(#vSide)" strokeWidth="1"/>
          <path d="M20.7 21.3 Q12 18.5 5.7 19.3" stroke="url(#vSide)" strokeWidth="0.95"/>
          <path d="M20.7 21.3 Q27 19.3 31.5 21" stroke="url(#vSide)" strokeWidth="0.95"/>
          <path d="M17.8 26.5 Q10.5 24.7 5 26.5" stroke="url(#vSide)" strokeWidth="0.85"/>
          <path d="M17.8 26.5 Q24.5 25.3 28.8 27.2" stroke="url(#vSide)" strokeWidth="0.85"/>
          <path d="M15 31.5 Q9.5 30 6.5 32.5" stroke="url(#vSide)" strokeWidth="0.7"/>
          <path d="M15 31.5 Q20.5 31 24.3 33.3" stroke="url(#vSide)" strokeWidth="0.7"/>
          <path d="M12.5 35.8 Q9.8 34.8 8.7 36.8" stroke="url(#vSide)" strokeWidth="0.55"/>
          <path d="M12.5 35.8 Q15.8 36 18 37.5" stroke="url(#vSide)" strokeWidth="0.55"/>
        </g>
        <ellipse cx="18" cy="14" rx="16" ry="20" fill="url(#gloss)" style={{mixBlendMode: 'screen'}}/>
      </g>
    </g>
    <path d="M11 38C9 40 6 42 3 43" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M3 43C1 43 0 42 0.5 40.5C1 39 2.5 39.5 2 40.5" stroke="#1B5E20" strokeWidth="1" strokeLinecap="round" fill="none"/>
  </svg>
);

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@domain.com');
  const [password, setPassword] = useState('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

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
        setErrorMsg('Authentication failed. Check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network lookup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#0A0A0A]">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md mx-auto w-full"
        >
          {/* Logo */}
          <div className="mb-8">
            <PapyrusLogo />
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
              Welcome back
            </h1>
            <p className="text-base text-stone-500 dark:text-stone-400 mt-2">
              Sign in to access your notes and continue where you left off.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  {errorMsg}
                </div>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-12 border-stone-300 dark:border-stone-700 focus-visible:ring-2 focus-visible:ring-stone-900 dark:focus-visible:ring-stone-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 border-stone-300 dark:border-stone-700 focus-visible:ring-2 focus-visible:ring-stone-900 dark:focus-visible:ring-stone-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="relative inline-flex h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-stone-300 dark:border-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
              >
                {rememberMe && (
                  <Check className="h-3.5 w-3.5 text-stone-900 dark:text-stone-100 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </button>
              <Label htmlFor="remember" className="text-sm text-stone-600 dark:text-stone-400 cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 font-medium rounded-lg shadow-lg shadow-stone-900/10 dark:shadow-stone-100/10 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-stone-900 dark:text-stone-100 font-medium hover:underline transition-colors"
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Demo Credentials Notice */}
          <div className="mt-8 p-4 bg-stone-50 dark:bg-stone-900/50 rounded-lg border border-stone-200 dark:border-stone-800">
            <p className="text-xs text-stone-600 dark:text-stone-400 mb-2">
              Demo credentials pre-filled for testing:
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@domain.com');
                setPassword('admin');
              }}
              className="text-xs font-mono text-stone-900 dark:text-stone-100 hover:underline"
            >
              Reset to defaults
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-stone-900 dark:to-stone-950 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-stone-200/50 dark:bg-stone-800/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-stone-300/50 dark:bg-stone-700/30 rounded-full blur-3xl" />
          
          {/* Central Illustration */}
          <div className="relative z-10 text-center px-12">
            <div className="w-32 h-40 mx-auto mb-8 drop-shadow-2xl">
              <PapyrusLogo />
            </div>
            <h2 className="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-4">
              Your notes, organized
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-md mx-auto">
              Capture ideas, organize thoughts, and boost productivity with AI-powered note-taking.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

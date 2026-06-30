import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { AlertCircle, Loader } from 'lucide-react';
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
    <div className="min-h-screen w-full flex bg-white">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 lg:py-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md mx-auto w-full"
        >
          {/* Logo */}
          <div className="mb-10">
            <PapyrusLogo />
            <h1 className="text-3xl font-semibold text-gray-900 mt-4">
              Sign in to your account
            </h1>
            <p className="text-base text-gray-600 mt-2">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  {errorMsg}
                </div>
              </div>
            </motion.div>
          )}

          {/* Social Login Buttons (Disabled) */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              disabled
              className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center gap-3 bg-gray-50 text-gray-400 cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium">Sign in with Google</span>
            </button>
            <button
              type="button"
              disabled
              className="w-full h-12 border border-gray-300 rounded-lg flex items-center justify-center gap-3 bg-gray-50 text-gray-400 cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-sm font-medium">Sign in with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="h-12 border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
              />
              <Label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-gray-900 font-medium hover:underline transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Demo Credentials Notice */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              Demo credentials pre-filled for testing:
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@domain.com');
                setPassword('admin');
              }}
              className="text-xs font-mono text-gray-900 hover:underline"
            >
              Reset to defaults
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Splash Illustration */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-50 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img 
            src="/splash.svg" 
            alt="Papyrus Illustration" 
            className="w-full h-full object-contain p-8"
          />
        </motion.div>
      </div>
    </div>
  );
};

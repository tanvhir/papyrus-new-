import React, { useState } from 'react';
import { useAuth } from '@/src/context/AuthContext';

const PapyrusLogo = () => (
  <svg width="100" height="100" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const AppleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.0039 7.65962C19.8821 7.75412 17.7315 8.96595 17.7315 11.6605C17.7315 14.7772 20.468 15.8798 20.55 15.9071C20.5374 15.9743 20.1152 17.4172 19.1071 18.8873C18.2082 20.1811 17.2694 21.4727 15.8413 21.4727C14.4131 21.4727 14.0456 20.6431 12.3969 20.6431C10.7903 20.6431 10.219 21.5 8.91269 21.5C7.60636 21.5 6.69487 20.3029 5.64687 18.8327C4.43295 17.1064 3.45215 14.4244 3.45215 11.8789C3.45215 7.79613 6.10681 5.63081 8.71947 5.63081C10.1077 5.63081 11.2649 6.5423 12.1365 6.5423C12.9661 6.5423 14.2598 5.57621 15.8392 5.57621C16.4377 5.57621 18.5884 5.63081 20.0039 7.65962ZM15.0894 3.84773C15.7426 3.07276 16.2046 1.99745 16.2046 0.922142C16.2046 0.773027 16.192 0.621812 16.1647 0.5C15.102 0.539904 13.8377 1.20777 13.0753 2.09196C12.4768 2.77243 11.9181 3.84773 11.9181 4.93774C11.9181 5.10156 11.9454 5.26538 11.958 5.31788C12.0252 5.33048 12.1344 5.34518 12.2436 5.34518C13.1971 5.34518 14.3963 4.70672 15.0894 3.84773Z" fill="currentColor"/>
  </svg>
);

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between">
      <div className="flex h-screen w-full">
        {/* Left Side - Form */}
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="w-full max-w-[600px] px-6 py-2 text-center md:px-12 md:pb-16">
            <div className="flex flex-col items-center space-y-2">
              <PapyrusLogo />
              <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
                Welcome to Papyrus!
              </h1>
              <p className="text-sm text-gray-900">
                Sign up and start taking notes.
              </p>
            </div>
            
            <div className="relative z-20 flex flex-col space-y-4 pt-8 md:pt-10">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col space-y-4">
                  <input
                    id="email"
                    autoComplete="off"
                    placeholder="Email address"
                    className="border-gray-300 rounded-sm border py-3 pl-3 pr-2 text-base text-gray-900 placeholder:text-gray-400"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <input
                    id="password"
                    placeholder="Password"
                    className="border-gray-300 rounded-sm border py-3 pl-3 pr-2 text-base text-gray-900 placeholder:text-gray-400"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !email || !password}
                  className="flex justify-center transition-all p-3 w-full rounded-sm border disabled:bg-gray-200 disabled:border-gray-200 disabled:cursor-not-allowed bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700 text-white mt-4"
                >
                 Continue
                </button>
              </form>

              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-4 text-sm text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <div className="flex w-full flex-col justify-center items-center gap-2 md:flex-row text-base px-0">
                <button
                  type="button"
                  disabled
                  className="flex justify-center transition-all p-3 w-full rounded-sm border disabled:bg-gray-200 disabled:border-gray-200 disabled:cursor-not-allowed bg-transparent text-gray-600 hover:bg-gray-100 border-gray-300 py-2 rounded-sm w-full"
                >
                  <span className="whitespace-nowrap text-base flex items-center justify-center">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </span>
                </button>
                
                <button
                  type="button"
                  disabled
                  className="flex justify-center transition-all p-3 w-full rounded-sm border disabled:bg-gray-200 disabled:border-gray-200 disabled:cursor-not-allowed bg-transparent text-gray-600 hover:bg-gray-100 border-gray-300 py-2 rounded-sm w-full"
                >
                  <span className="whitespace-nowrap text-base text-gray-600 flex items-center justify-center">
                    <AppleIcon />
                    Continue with Apple
                  </span>
                </button>
              </div>

              <div className="flex flex-col space-y-6">
                <div className="block w-full px-6 text-xs text-gray-500">
                  By creating an account, you are agreeing to our{' '}
                  <a className="font-medium text-green-600" target="_blank" href="#">
                    Terms of Service
                  </a>{' '}
                  and acknowledging receipt of our{' '}
                  <a className="font-medium text-green-600" target="_blank" href="#">
                    Privacy Policy
                  </a>.
                </div>
                <a className="block w-full px-6 py-2 text-sm text-gray-500" href="#">
                  Already have an account?{' '}
                  <span className="font-semibold text-green-600">Log in</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Splash Image */}
        <div className="relative hidden h-full w-full lg:block bg-gray-50">
          <img
            alt="splash screen"
            decoding="async"
            src="/splash.svg"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bottom-0 left-0 -z-0 w-full px-5 py-8 md:py-12 lg:absolute lg:px-10">
        <div className="text-gray-500 flex flex-col items-center justify-between space-y-4 text-xs md:flex-row md:space-y-0">
          <span className="text-center">© 2026 Papyrus. All rights reserved.</span>
          <div className="flex space-x-8">
            <a target="_blank" className="hover:text-gray-400 hover:underline" href="#">
              Security
            </a>
            <a target="_blank" className="hover:text-gray-400 hover:underline" href="#">
              Legal
            </a>
            <a target="_blank" className="hover:text-gray-400 hover:underline" href="#">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

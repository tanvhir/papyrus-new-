import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { Lock, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setErrorMsg('Invalid email or password combination.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <main className="relative flex min-h-screen flex-col items-center justify-between">
        <div className="flex h-screen w-full">
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="w-full max-w-[600px] px-6 py-2 text-center md:px-12 md:pb-16">
              <div className="flex flex-col items-center space-y-2">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[72px] w-[72px] md:h-[100px] md:w-[100px]">
                  <path fillRule="evenodd" clipRule="evenodd" d="M40.7913 19.5448C42.8582 17.3874 45.8335 16.3492 48.7946 16.7521C50.7934 17.0242 52.6504 17.9364 54.0875 19.3514L55.5622 20.8032H57.5272C68.4658 20.8033 77.3333 29.6675 77.3333 40.6017V61.9209H77.3225C77.3204 70.217 75.2947 71.0014 79.1752C65.4831 84.3465 54.7911 84.8288 48.5831 79.8645C46.1413 77.9119 44.523 75.7275 42.7986 71.9354L52.5754 68.2073C52.9104 68.9389 53.5425 70.1518 54.5587 71.2457C56.64 73.4862 61.0091 73.4974 62.7239 71.9354C66.8624 68.1655 63.3226 61.9226 56.038 61.9226L41.2641 61.9209C31.6667 61.9208 23.7044 54.9235 22.2043 45.754C22.2056 45.756 22.207 45.758 22.2083 45.7599C21.3806 40.244 23.0707 38.4998 26.3775 38.4997H35.3344C42.6689 38.4997 44.6604 35.4273 44.6604 29.9045V27.0725H43.3328C43.3328 27.0725 43.1561 28.5289 42.6189 29.9045C41.4807 32.8194 40.3839 34.9281 36.1012 34.9282C34.1798 34.9282 32.1344 34.9237 30.3367 34.9225C28.9085 34.9216 27.4803 34.9225 26.0521 34.9285L28.8578 32.0001L40.7913 19.5448ZM62.9053 45.0466C60.2976 45.0467 58.1838 46.7687 58.1837 48.8926H67.6272C67.6272 46.7686 65.5131 45.0466 62.9053 45.0466Z" fill="#00A82D"/>
                </svg>
                <h1 className="text-sb24 text-grey-15 md:text-sb32">Sign in</h1>
                <p className="text-r14 text-grey-15">to continue to your Papyrus account.</p>
              </div>
              
              <div className="relative z-20 flex flex-col space-y-4 pt-8 md:pt-10">
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col space-y-4">
                    <input
                      id="email"
                      autocapitalize="off"
                      placeholder="Email address or Username"
                      className="border-grey-80 rounded-s border py-3 pl-3 pr-2 text-r15 text-grey-15 placeholder:text-grey-65 w-full bg-white dark:bg-stone-800"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-4 mt-4">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className="border-grey-80 rounded-s border py-3 pl-10 pr-10 text-r15 text-grey-15 placeholder:text-grey-65 w-full bg-white dark:bg-stone-800"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    {errorMsg && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md p-3 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-800 dark:text-red-200">{errorMsg}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={cn(
                      "flex justify-center transition-all p-3 w-full rounded-sm border disabled:cursor-not-allowed false bg-secondary-blue-400 border-secondary-blue-400 hover:bg-secondary-blue-500 hover:border-secondary-blue-500 text-button-content-fill-primary-default mt-4",
                      isSubmitting && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    <span className="whitespace-nowrap text-sb16">
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin mr-2 inline" />
                          Signing In...
                        </>
                      ) : 'Continue'}
                    </span>
                  </button>
                </form>
                
                <div className="flex items-center">
                  <div className="flex-grow border-t border-grey-65"></div>
                  <span className="px-4 text-r14 text-grey-65">or</span>
                  <div className="flex-grow border-t border-grey-65"></div>
                </div>
                
                <div className="flex w-full flex-col justify-center items-center gap-2 md:flex-row text-r20 px-0">
                  <div className="w-full max-w-[268px] opacity-50 cursor-not-allowed">
                    <div className="flex justify-center items-center h-11 rounded-sm border border-grey-80 bg-gray-50">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.51-1.68 2.85-3.38 3.47V21h6.57c2.27-.95 3.43-2.55 3.43-4.51 0-1.4-.64-2.77-1.84-3.6z"/>
                        <path fill="#34A853" d="M12 22c2.97 0 5.46-.87 7.46-2.37l-6.57-5.01c-.89.66-1.99 1.1-3.13 1.1-2.91 0-5.25-1.75-6.12-4.1H2.09v4.37C4.09 19.53 7.87 22 12 22z"/>
                        <path fill="#FBBC05" d="M6.12 13.5c-.23-.67-.36-1.41-.36-2.18s.13-1.51.36-2.18V5.93H2.09A11.99 11.99 0 0 0 12 2c2.97 0 5.46.87 7.46 2.37l-3.26 2.64c-.9-.66-2-.99-3.2-.99-2.91 0-5.25 1.75-6.12 4.1"/>
                        <path fill="#EA4335" d="M12 7.38c1.7-.01 3.24.63 4.24 1.43l2.85-2.85C17.36 4.35 14.89 3.5 12 3.5c-4.11 0-7.89 2.47-9.91 6.07L6.12 11.2c.87-2.35 3.21-3.82 5.88-3.82z"/>
                      </svg>
                      <span className="text-m14 text-grey-25">Continue with Google</span>
                    </div>
                  </div>
                  <button type="button" className="flex justify-center transition-all p-3 w-full rounded-sm border disabled:bg-grey-80 disabled:border-grey-80 disabled:cursor-not-allowed undefined bg-transparent text-button-content-fill-secondary-default shadow-components-button-base-secondary-enabled hover:bg-button-base-fill-secondary-hover border-transparent border-grey-85 py-2 !rounded-xs w-full opacity-50 cursor-not-allowed">
                    <span className="whitespace-nowrap text-sb16 !text-m14 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5 text-icon-fill-secondary-enabled">
                        <path d="M20.0039 7.65962C19.8821 7.75412 17.7315 8.96595 17.7315 11.6605C17.7315 14.7772 20.468 15.8798 20.55 15.9071C20.5374 15.9743 20.1152 17.4172 19.1071 18.8873C18.2082 20.1811 17.2694 21.4727 15.8413 21.4727C14.4131 21.4727 14.0456 20.6431 12.3969 20.6431C10.7903 20.6431 10.219 21.5 8.91269 21.5C7.60636 21.5 6.69487 20.3029 5.64687 18.8327C4.43295 17.1064 3.45215 14.4244 3.45215 11.8789C3.45215 7.79613 6.10681 5.63081 8.71947 5.63081C10.1077 5.63081 11.2649 6.5423C12.1365 6.5423C12.9661 5.57621 15.8392 5.57621C16.4377 5.57621 18.5884 5.63081 20.0039 7.65962ZM15.0894 3.84773C15.7426 3.07276 16.2046 1.99745 16.2046 0.922142C16.2046 0.773027 16.192 0.621812 16.1647 0.5C15.102 0.539904 13.8377 1.20777 13.0753 2.09196C12.4768 2.77243 11.9181 3.84773 11.9181 4.93774C11.9181 5.10156 11.9454 5.26538 11.958 5.31788C12.0252 5.33048 12.1344 5.34518 12.2436 5.34518C13.1971 5.34518 14.3963 4.70672 15.0894 3.84773Z" fill="currentColor"/>
                      </svg>
                      Continue with Apple
                    </span>
                  </button>
                </div>
                
                <div className="flex flex-col space-y-6">
                  <p className="block w-full px-6 text-r13 text-grey-45">
                    By signing in, you agree to our{' '}
                    <a className="font-medium text-secondary-blue-400" target="_blank" href="/terms">Terms of Service</a>
                    {' '}and acknowledging receipt of our{' '}
                    <a className="font-medium text-secondary-blue-400" target="_blank" href="/privacy">Privacy Policy</a>.
                  </p>
                  <a className="block w-full px-6 py-2 text-m14 text-grey-45" href="/install">
                    Don't have an account? <span className="font-semibold text-secondary-blue-400">Sign up</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="bottom-0 left-0 -z-0 w-full px-5 py-8 md:py-12 lg:absolute lg:px-10">
          <div className="text-gray-45 flex flex-col items-center justify-between space-y-4 text-r12 text-grey-65 md:flex-row md:space-y-0">
            <span className="text-center">© 2026 Papyrus Study. All rights reserved.</span>
            <div className="flex space-x-8">
              <a target="_blank" className="hover:text-grey-45 hover:underline" href="/privacy">Privacy</a>
              <a target="_blank" className="hover:text-grey-45 hover:underline" href="/terms">Terms</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';
import { Mail, Lock, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative flex-1 flex items-center justify-center px-4">
        <svg width="325" height="490" viewBox="0 0 325 490" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-1/4 -mt-12 hidden lg:block opacity-60">
          <path fillRule="evenodd" clipRule="evenodd" d="M170.35 62.1166L93.0755 41.411L66.3055 141.318L14.5898 51.7439L-54.6923 91.7438L-2.97645 181.318L-102.884 154.548L-123.589 231.822L-23.6822 258.592L-113.256 310.307L-73.2564 379.59L16.318 327.874L-10.4521 427.781L66.8219 448.487L93.5921 348.579L145.308 438.155L214.59 398.155L162.873 308.58L262.781 335.35L283.487 258.076L183.579 231.306L273.154 179.59L233.155 110.308L143.58 162.024L170.35 62.1166Z" fill="#96D347"/>
        </svg>
        <svg width="300" height="490" viewBox="0 0 300 490" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute right-0 top-1/2 -mt-12 hidden lg:block opacity-60">
          <path fillRule="evenodd" clipRule="evenodd" d="M144.95 71.7439C120.397 85.9193 106.156 111.096 104.857 137.452C79.7347 145.528 59.1022 165.801 51.7645 193.185C44.4269 220.569 52.159 248.442 69.8774 267.998C57.8239 291.473 57.5692 320.396 71.7443 344.95C85.9201 369.501 111.096 383.743 137.453 385.043C145.529 410.165 165.801 430.797 193.186 438.134C220.57 445.472 248.443 437.74 267.999 420.022C291.473 432.075 320.397 432.329 344.95 418.155C369.502 403.978 383.743 378.803 385.043 352.447C410.165 344.37 430.797 324.097 438.135 296.713C445.473 269.328 437.741 241.456 420.023 221.9C432.075 198.425 432.33 169.502 418.155 144.949C403.979 120.396 378.803 106.155 352.447 104.857C344.37 79.734 324.097 59.1013 296.713 51.7638C269.329 44.4261 241.456 52.1582 221.901 69.8767C198.426 57.8233 169.502 57.5685 144.95 71.7439Z" fill="#F5BFF0"/>
        </svg>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="bg-card dark:bg-card border border-border rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center mb-6 space-y-2">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[72px] w-[72px]">
                <path fillRule="evenodd" clipRule="evenodd" d="M40.7913 19.5448C42.8582 17.3874 45.8335 16.3492 48.7946 16.7521C50.7934 17.0242 52.6504 17.9364 54.0875 19.3514L55.5622 20.8032H57.5272C68.4658 20.8033 77.3333 29.6675 77.3333 40.6017V61.9209H77.3225C77.3204 70.217 75.2947 71.0014 79.1752C65.4831 84.3465 54.7911 84.8288 48.5831 79.8645C46.1413 77.9119 44.523 75.7275 42.7986 71.9354L52.5754 68.2073C52.9104 68.9389 53.5425 70.1518 54.5587 71.2457C56.64 73.4862 61.0091 73.4974 62.7239 71.9354C66.8624 68.1655 63.3226 61.9226 56.038 61.9226L41.2641 61.9209C31.6667 61.9208 23.7044 54.9235 22.2043 45.754C22.2056 45.756 22.207 45.758 22.2083 45.7599C21.3806 40.244 23.0707 38.4998 26.3775 38.4997H35.3344C42.6689 38.4997 44.6604 35.4273 44.6604 29.9045V27.0725H43.3328C43.3328 27.0725 43.1561 28.5289 42.6189 29.9045C41.4807 32.8194 40.3839 34.9281 36.1012 34.9282C34.1798 34.9282 32.1344 34.9237 30.3367 34.9225C28.9085 34.9216 27.4803 34.9225 26.0521 34.9285L28.8578 32.0001L40.7913 19.5448ZM62.9053 45.0466C60.2976 45.0467 58.1838 46.7687 58.1837 48.8926H67.6272C67.6272 46.7686 65.5131 45.0466 62.9053 45.0466Z" fill="#00A82D"/>
              </svg>
              <h1 className="text-2xl font-bold text-foreground">
                Sign in
              </h1>
              <p className="text-sm text-muted-foreground">to continue to your Papyrus account.</p>
            </div>
            
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800 dark:text-red-200">{errorMsg}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email address"
                    className="pl-10 h-11 bg-muted border border-border rounded-md w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="pl-10 pr-10 h-11 bg-muted border border-border rounded-md w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "flex justify-center transition-all p-3 w-full rounded-md border font-medium",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  isSubmitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : 'Continue'}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Don't have an account? <span className="font-semibold text-primary">Contact Administrator</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
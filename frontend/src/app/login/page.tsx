'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle, 
  KeyRound,
  Loader,
  ArrowLeft,
  RefreshCw,
  Clock
} from 'lucide-react';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const { login, register, requestOTP, verifyOTP, resendOTP, googleLogin, user } = useAuth();

  // Tab State: 'login' | 'signup' | 'otp'
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'otp'>('login');

  // Multi-step Auth state for OTP Verification
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpFlowType, setOtpFlowType] = useState<'register' | 'login'>('login');

  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // 6 separate OTP input boxes state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Status Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // OTP Countdown timer (60 seconds)
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Redirect if user already logged in
  useEffect(() => {
    if (user) {
      router.push(redirect ? `/${redirect}` : '/');
    }
  }, [user, redirect, router]);

  // Handle OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifyingOTP && countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            setCanResend(true);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifyingOTP, countdown]);

  // Auto-focus first input when entering OTP verification state
  useEffect(() => {
    if (isVerifyingOTP) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [isVerifyingOTP]);

  // Client-side validations
  const validateFormInputs = (isRegister: boolean = false): boolean => {
    setErrorMsg('');
    setSuccessMsg('');

    // Reject blank or phone-number-only input in the email field
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return false;
    }
    if (/^[\d\s\-+()]+$/.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address, not a phone number.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email address (e.g. name@example.com).');
      return false;
    }

    if (isRegister) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        return false;
      }
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return false;
      }
    }

    return true;
  };

  // 1. Password-based Traditional Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormInputs(false)) return;

    setIsSubmitLoading(true);
    const res = await login(email, password);
    setIsSubmitLoading(false);

    if (res.success) {
      setSuccessMsg('Logged in successfully!');
      router.push(redirect ? `/${redirect}` : '/');
    } else {
      setErrorMsg(res.message || 'Login failed. Check credentials.');
    }
  };

  // 2. Init Registration: request OTP first
  const handleSignupInit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormInputs(true)) return;

    setIsSubmitLoading(true);
    const res = await requestOTP(email);
    setIsSubmitLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'OTP verification code sent to your email.');
      setOtpFlowType('register');
      setIsVerifyingOTP(true);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
    } else {
      setErrorMsg(res.message || 'Failed to request OTP code.');
    }
  };

  // 3. Init OTP Login: request OTP first
  const handleOTPRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFormInputs(false)) return;

    setIsSubmitLoading(true);
    const res = await requestOTP(email);
    setIsSubmitLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'OTP verification code sent to your email.');
      setOtpFlowType('login');
      setIsVerifyingOTP(true);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
    } else {
      setErrorMsg(res.message || 'Failed to request OTP code.');
    }
  };

  // 4. Verification & Registration Completion
  const handleOTPVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtpCode = otpDigits.join('');
    if (fullOtpCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsSubmitLoading(true);
    const res = await verifyOTP(email, fullOtpCode);

    if (res.success) {
      if (res.isNewUser) {
        // If OTP is validated, but they are registering (signup flow)
        if (otpFlowType === 'register') {
          const regRes = await register(name, email, phone, password);
          setIsSubmitLoading(false);
          if (regRes.success) {
            setSuccessMsg('Account registered successfully!');
            router.push(redirect ? `/${redirect}` : '/');
          } else {
            setErrorMsg(regRes.message || 'Registration completion failed.');
          }
        } else {
          // They requested OTP login but are a new user. 
          // Pre-fill email, switch to register view, and notify them.
          setIsSubmitLoading(false);
          setIsVerifyingOTP(false);
          setActiveTab('signup');
          setSuccessMsg('Email verified successfully! Please complete registration details.');
        }
      } else {
        // User logged in directly via OTP code verification
        setIsSubmitLoading(false);
        setSuccessMsg('OTP verified successfully!');
        router.push(redirect ? `/${redirect}` : '/');
      }
    } else {
      setIsSubmitLoading(false);
      setErrorMsg(res.message || 'Invalid verification code.');
    }
  };

  // 5. Resend OTP handler
  const handleOTPResend = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitLoading(true);

    const res = await resendOTP(email);
    setIsSubmitLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || 'A new verification code has been sent to your email.');
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setErrorMsg(res.message || 'Failed to resend verification OTP.');
    }
  };

  // 6. Social Google SSO Profile Mock (Instant Test)
  const handleGoogleLoginMock = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitLoading(true);

    const mockEmail = 'telugu.culture@gmail.com';
    const mockName = 'Telugu Couture Lover';
    const mockGoogleId = 'google_1122334455';

    const res = await googleLogin(mockName, mockEmail, mockGoogleId);
    setIsSubmitLoading(false);

    if (res.success) {
      setSuccessMsg('Google login successful!');
      router.push(redirect ? `/${redirect}` : '/');
    } else {
      setErrorMsg(res.message || 'Google Auth failed.');
    }
  };

  // Helper function to manage 6 digit changes
  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric inputs
    if (val && !/^\d$/.test(val)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    // Auto-focus next field
    if (val !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Helper function to handle backspaces
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = '';
        setOtpDigits(newDigits);
      }
    }
  };

  // Clipboard paste helper
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteContent = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasteContent)) {
      const splitDigits = pasteContent.split('');
      setOtpDigits(splitDigits);
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-sans-lux">
      <div className="bg-card-custom border border-card-border p-8 rounded-2xl shadow-xl space-y-6 relative overflow-hidden">
        
        {/* Loading Spinner Overlay */}
        {isSubmitLoading && (
          <div className="absolute inset-0 bg-bg-custom/75 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-3 animate-in fade-in-20 duration-200">
            <Loader className="w-8 h-8 text-gold animate-spin" />
            <p className="text-xs uppercase tracking-widest gold-text-gradient font-bold animate-pulse">Processing Request...</p>
          </div>
        )}

        {/* Brand header */}
        <div className="text-center space-y-1.5">
          <h1 className="font-serif-lux text-xl sm:text-2xl font-bold tracking-wider gold-text-gradient">
            Sri Sakthi Sarees
          </h1>
          <p className="text-[10px] text-fg-custom/50 font-light uppercase tracking-widest">Customer Portal</p>
        </div>

        {!isVerifyingOTP ? (
          <>
            {/* Tab triggers */}
            <div className="grid grid-cols-3 border-b border-card-border pb-1 gap-1 text-center">
              <button
                onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`text-xs pb-2 font-bold uppercase transition-colors ${
                  activeTab === 'login' ? 'text-gold border-b-2 border-gold' : 'text-fg-custom/40 hover:text-fg-custom/75'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`text-xs pb-2 font-bold uppercase transition-colors ${
                  activeTab === 'signup' ? 'text-gold border-b-2 border-gold' : 'text-fg-custom/40 hover:text-fg-custom/75'
                }`}
              >
                Register
              </button>
              <button
                onClick={() => { setActiveTab('otp'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`text-xs pb-2 font-bold uppercase transition-colors ${
                  activeTab === 'otp' ? 'text-gold border-b-2 border-gold' : 'text-fg-custom/40 hover:text-fg-custom/75'
                }`}
              >
                OTP Code
              </button>
            </div>

            {/* Status alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs flex items-center space-x-1.5 font-medium border border-red-500/15">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-500/10 text-green-500 rounded-lg text-xs flex items-center space-x-1.5 font-medium border border-green-500/15">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. PASSWORD LOGIN TAB */}
            {activeTab === 'login' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4" autoComplete="off">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-fg-custom/60">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-fg-custom/40" />
                    <input
                      type="email"
                      name="login-email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="username"
                      className="w-full text-xs bg-bg-custom border border-card-border rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:border-gold text-fg-custom font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[10px] uppercase font-bold text-fg-custom/60">Password</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('otp')}
                      className="text-[9px] font-bold text-gold hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-fg-custom/40" />
                    <input
                      type="password"
                      name="login-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full text-xs bg-bg-custom border border-card-border rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:border-gold text-fg-custom font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full shimmer-btn maroon-gradient text-white border border-gold/15 font-bold uppercase text-xs tracking-wider py-3.5 rounded-lg shadow hover:opacity-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Log In</span>
                </button>
              </form>
            )}

            {/* 2. REGISTRATION SIGNUP TAB */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupInit} className="space-y-4" autoComplete="off">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-fg-custom/60">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-fg-custom/40" />
                    <input
                      type="text"
                      name="register-name"
                      placeholder="e.g. Jaswanth "
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="w-full text-xs bg-bg-custom border border-card-border rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:border-gold text-fg-custom font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-fg-custom/60">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-fg-custom/40" />
                    <input
                      type="email"
                      name="register-email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full text-xs bg-bg-custom border border-card-border rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:border-gold text-fg-custom font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-fg-custom/60">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-fg-custom/40" />
                    <input
                      type="tel"
                      name="register-phone"
                      placeholder="e.g. 9988776655"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      className="w-full text-xs bg-bg-custom border border-card-border rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:border-gold text-fg-custom font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-fg-custom/60">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-fg-custom/40" />
                    <input
                      type="password"
                      name="register-password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full text-xs bg-bg-custom border border-card-border rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:border-gold text-fg-custom font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full shimmer-btn maroon-gradient text-white border border-gold/15 font-bold uppercase text-xs tracking-wider py-3.5 rounded-lg shadow hover:opacity-95 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Verify Email via OTP</span>
                </button>
              </form>
            )}

            {/* 3. OTP VERIFICATION TAB (EMAIL REQUEST) */}
            {activeTab === 'otp' && (
              <form onSubmit={handleOTPRequest} className="space-y-4" autoComplete="off">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-fg-custom/60">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-fg-custom/40" />
                    <input
                      type="email"
                      name="otp-email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full text-xs bg-bg-custom border border-card-border rounded-lg pl-9 pr-3 py-3 focus:outline-none focus:border-gold text-fg-custom font-medium"
                      required
                    />
                  </div>
                </div>

                <p className="text-[10px] text-fg-custom/50 font-light leading-relaxed">
                  If this email is already registered, you will be logged in instantly. Otherwise, you will verify the email and proceed to registration.
                </p>

                <button
                  type="submit"
                  className="w-full gold-gradient text-maroon-950 font-bold uppercase text-xs tracking-wider py-3.5 rounded-lg shadow hover:opacity-90 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Request Verification OTP</span>
                </button>
              </form>
            )}

            {/* Divider separator */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-card-border"></div>
              <span className="flex-shrink mx-4 text-[9px] text-fg-custom/40 uppercase font-light">Or Continue With</span>
              <div className="flex-grow border-t border-card-border"></div>
            </div>

            {/* Social Google log mock button */}
            <button
              onClick={handleGoogleLoginMock}
              className="w-full flex items-center justify-center space-x-2 border border-card-border rounded-lg py-3 text-xs font-bold hover:bg-gold/5 hover:border-gold transition-colors text-fg-custom cursor-pointer"
            >
              <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.444-2.89-6.444-6.443s2.89-6.444 6.444-6.444c1.623 0 3.097.604 4.227 1.625l3.056-3.056C19.347 2.458 15.937 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.786 0 10.74-4.114 11.737-9.59H12.24z"/>
              </svg>
              <span>Google Login (Instant Test)</span>
            </button>
          </>
        ) : (
          /* OTP VERIFICATION VIEW WITH 6 DIGIT BOXES & TIMER */
          <form onSubmit={handleOTPVerify} className="space-y-6 animate-in fade-in-30 duration-200">
            
            {/* Header / Back button */}
            <div className="flex items-center space-x-2 border-b border-card-border pb-3">
              <button
                type="button"
                onClick={() => { setIsVerifyingOTP(false); setErrorMsg(''); setSuccessMsg(''); }}
                className="p-1.5 text-fg-custom/60 hover:text-gold hover:bg-gold/5 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-xs uppercase font-bold text-fg-custom/80">Verify Your Email</h3>
                <p className="text-[9px] text-fg-custom/40 lowercase">{email}</p>
              </div>
            </div>

            {/* Status alerts */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-xs flex items-center space-x-1.5 font-medium border border-red-500/15">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-green-500/10 text-green-500 rounded-lg text-xs flex items-center space-x-1.5 font-medium border border-green-500/15">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center space-x-1.5">
                <KeyRound className="w-4 h-4 text-gold" />
                <span className="text-[10px] uppercase font-bold text-fg-custom/60">Enter 6-Digit OTP Code</span>
              </div>
              
              {/* 6 separate input boxes */}
              <div className="grid grid-cols-6 gap-2 sm:gap-3 max-w-[280px] mx-auto">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-10 h-12 text-center text-lg font-bold bg-bg-custom border border-card-border rounded-lg focus:outline-none focus:border-gold text-fg-custom shadow-inner"
                    autoComplete="off"
                    inputMode="numeric"
                  />
                ))}
              </div>
            </div>

            {/* Resend and Countdown display */}
            <div className="flex flex-col items-center space-y-2 border-t border-card-border/60 pt-4 text-center">
              {countdown > 0 ? (
                <div className="flex items-center space-x-1.5 text-[10px] text-fg-custom/50 font-light">
                  <Clock className="w-3.5 h-3.5 text-fg-custom/30 animate-pulse" />
                  <span>Resend OTP code in <strong>{countdown}s</strong></span>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={handleOTPResend}
                  className="text-[10px] font-bold text-gold hover:underline flex items-center space-x-1 hover:text-gold-light transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 animate-spin duration-[4000ms]" />
                  <span>Resend OTP Code</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full shimmer-btn maroon-gradient text-white border border-gold/15 font-bold uppercase text-xs tracking-wider py-3.5 rounded-lg shadow hover:opacity-95 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Verify & Access Account</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto py-20 text-center text-xs font-light space-y-3">
        <Loader className="w-6 h-6 animate-spin text-gold mx-auto" />
        <p className="text-fg-custom/40">Loading Auth Portal...</p>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

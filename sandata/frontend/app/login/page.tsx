'use client';

import { FormEvent, ReactNode, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { MusicToggle } from '@/components/MusicToggle';
import api from '@/lib/api';
import { cn } from '@/lib/cn';
import { useStore } from '@/store/useStore';
import { ui } from '@/lib/assets';
import { hasSupabaseConfig } from '@/lib/supabase';
import { registerWithSupabase, signInWithSupabase } from '@/lib/supabaseData';

type AuthMode = 'login' | 'register';

interface AuthFieldProps {
  autoComplete?: string;
  className?: string;
  icon: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  trailing?: ReactNode;
  type?: string;
  value: string;
}

function AuthField({
  autoComplete,
  className,
  icon,
  label,
  onChange,
  placeholder,
  required = true,
  trailing,
  type = 'text',
  value,
}: AuthFieldProps) {
  return (
    <label className={cn('block', className)}>
      <span className="sr-only">{label}</span>
      <div className="auth-input flex h-11 items-center gap-3 px-4 sm:h-12">
        <Image src={icon} alt="" width={21} height={21} className="h-5 w-5 shrink-0 object-contain" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-bold tracking-[0] text-[#201136] outline-none placeholder:text-[#9e99a8] sm:text-[15px]"
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          required={required}
        />
        {trailing}
      </div>
    </label>
  );
}

function SocialButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button type="button" className="grid h-12 w-20 place-items-center rounded-md border border-[#6b4d87]/45 bg-white/42 text-2xl font-black text-ube-deep shadow-[0_3px_0_rgba(35,16,61,0.12)] transition hover:-translate-y-0.5 hover:bg-white/70" aria-label={label}>
      {children}
    </button>
  );
}

function Corner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  return <span aria-hidden className={cn('auth-corner', `auth-corner-${position}`)} />;
}

function getAuthErrorMessage(err: unknown) {
  if (err && typeof err === 'object' && 'response' in err) {
    const responseError = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
    if (responseError) return responseError;
  }
  if (err instanceof Error) return err.message;
  return undefined;
}

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shieldId, setShieldId] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setShowPassword(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'register' && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (mode === 'register' && !acceptedTerms) {
      toast.error('Please accept the Terms of Service');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      if (hasSupabaseConfig) {
        if (mode === 'register') {
          const result = await registerWithSupabase(username, email, password);
          if (result.needsEmailConfirmation) {
            toast.success('Account created. Check your email to confirm it.');
            return;
          }
          setToken(result.token);
          setUser(result.user);
        } else {
          const result = await signInWithSupabase(email, password);
          setToken(result.token);
          setUser(result.user);
        }
      } else {
        const payload = mode === 'register' ? { username, email, password } : { email, password };
        const { data } = await api.post(`/auth/${mode}`, payload);
        setToken(data.token);
        setUser(data.user);
      }
      toast.success(mode === 'register' ? 'Account created' : 'Welcome back');
      router.push('/dashboard');
    } catch (err: unknown) {
      toast.error(getAuthErrorMessage(err) || (mode === 'register' ? 'Unable to create account' : 'Unable to sign in'));
    } finally {
      setLoading(false);
    }
  }

  const passwordToggle = (
    <button type="button" onClick={() => setShowPassword((current) => !current)} className="grid h-8 w-8 place-items-center text-ube-royal" aria-label={showPassword ? 'Hide password' : 'Show password'}>
      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );

  return (
    <main className="auth-scene relative min-h-screen overflow-hidden text-[#1d1136]">
      <MusicToggle className="absolute right-4 top-4 z-20 sm:right-8 sm:top-7" src={ui.audio.login} label="Login Music" />
      <div className="relative z-10 flex min-h-screen flex-col px-4 py-5 sm:px-8 sm:py-7">
        <div className="flex justify-center xl:absolute xl:left-8 xl:top-8 xl:justify-start">
          <Image
            src={ui.logo}
            alt="SanData"
            width={320}
            height={100}
            priority
            className="h-auto w-[180px] object-contain sm:w-[220px]"
          />
        </div>

        <section className="flex flex-1 items-center justify-center pb-8 pt-8 lg:pt-0">
          <div className="auth-panel relative w-full max-w-[780px] px-5 pb-6 pt-16 sm:px-11 sm:pb-8 sm:pt-20 lg:h-[680px]">
            <Corner position="top-left" />
            <Corner position="top-right" />
            <Corner position="bottom-left" />
            <Corner position="bottom-right" />
            <span aria-hidden className="auth-crest"><span>S</span></span>
            <span aria-hidden className="auth-banner auth-banner-left"><span /></span>
            <span aria-hidden className="auth-banner auth-banner-right"><span /></span>

            <div className="text-center">
              {mode === 'login' ? (
                <>
                  <p className="font-pixel text-[14px] leading-7 text-[#201136] sm:text-[16px]">Welcome back,</p>
                  <h1 className="mt-1 font-pixel text-[22px] leading-10 text-[#d89113] sm:text-[28px]">Shield Agent!</h1>
                </>
              ) : (
                <>
                  <h1 className="font-pixel text-[18px] leading-8 text-[#201136] sm:text-[22px]">Create your account</h1>
                  <p className="mt-2 text-sm font-black text-[#5f5c67] sm:text-base">Join SanData and protect what matters.</p>
                </>
              )}
              <div className="mx-auto mt-3 flex max-w-[240px] items-center gap-4">
                <span className="h-px flex-1 bg-[#9b8aa4]" />
                <span className="h-2 w-2 rotate-45 border border-[#d89113]" />
                <span className="h-px flex-1 bg-[#9b8aa4]" />
              </div>
            </div>

            <div className="mx-auto mt-4 grid max-w-[520px] grid-cols-2 border-b border-[#8f8195]/45 text-center sm:mt-5">
              {(['login', 'register'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => switchMode(item)}
                  className={cn('border-b-2 px-4 py-3 text-sm font-black capitalize transition focus-visible:outline-none sm:text-base', mode === item ? 'border-ube-deep text-ube-deep' : 'border-transparent text-[#6d6874] hover:text-ube-deep')}
                >
                  {item}
                </button>
              ))}
            </div>

            <form className={cn('mx-auto mt-5 grid gap-3.5 sm:mt-6', mode === 'login' ? 'max-w-[520px]' : 'max-w-[650px] sm:grid-cols-2')} onSubmit={submit}>
              {mode === 'register' ? (
                <>
                  <AuthField icon={ui.icons.profile} label="Full Name" value={fullName} onChange={setFullName} placeholder="Full Name" autoComplete="name" />
                  <AuthField icon={ui.icons.envelope} label="Email" value={email} onChange={setEmail} placeholder="Email" type="email" autoComplete="email" />
                  <AuthField icon={ui.icons.profile} label="Username" value={username} onChange={setUsername} placeholder="Username" autoComplete="username" />
                  <AuthField icon={ui.icons.lock} label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" trailing={passwordToggle} />
                  <AuthField icon={ui.icons.lock} label="Password" value={password} onChange={setPassword} placeholder="Password (8+ characters)" type={showPassword ? 'text' : 'password'} autoComplete="new-password" trailing={passwordToggle} />
                  <AuthField icon={ui.icons.shield} label="Shield ID" value={shieldId} onChange={setShieldId} placeholder="Shield ID (Optional)" required={false} />
                  <label className="flex items-center gap-3 py-2 text-xs font-bold leading-5 text-[#4f4a58] sm:col-span-2 sm:text-sm">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      className="h-4 w-4 shrink-0 accent-ube-deep"
                    />
                    <span>I agree to the <a href="#" className="text-ube-deep">Terms of Service</a> and <a href="#" className="text-ube-deep">Privacy Policy</a></span>
                  </label>
                </>
              ) : (
                <>
                  <AuthField icon={ui.icons.profile} label="Email or Username" value={email} onChange={setEmail} placeholder="Email or Username" autoComplete="email" />
                  <AuthField icon={ui.icons.lock} label="Password" value={password} onChange={setPassword} placeholder="Password (8+ characters)" type={showPassword ? 'text' : 'password'} autoComplete="current-password" trailing={passwordToggle} />
                  <div className="flex items-center justify-between text-sm font-black">
                    <a href="#" className="text-ube-deep hover:underline">Forgot password?</a>
                    <button type="button" onClick={() => switchMode('register')} className="text-ube-deep hover:underline">
                      Register
                    </button>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn('auth-submit mt-1 h-14 w-full px-5 font-pixel text-[13px] uppercase leading-5 text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60', mode === 'register' && 'sm:col-span-2 sm:mx-auto sm:max-w-[520px]')}
              >
                {loading ? 'Please wait' : mode === 'login' ? 'Login' : 'Register'} <span aria-hidden className="text-gold">&gt;</span>
              </button>
            </form>

            {mode === 'login' ? (
              <div className="mx-auto max-w-[520px]">
                <div className="my-5 flex items-center gap-4">
                  <div className="h-px flex-1 bg-[#8f8195]/55" />
                  <span className="text-sm font-black">or</span>
                  <div className="h-px flex-1 bg-[#8f8195]/55" />
                </div>

                <div className="flex justify-center gap-7">
                  <SocialButton label="Google login"><span className="text-[#4285f4]">G</span></SocialButton>
                  <SocialButton label="Facebook login"><span className="text-[#3155b7]">f</span></SocialButton>
                  <SocialButton label="Email login"><Image src={ui.icons.envelope} alt="" width={32} height={32} className="h-8 w-8 object-contain" /></SocialButton>
                </div>
              </div>
            ) : null}

            <p className="mt-5 text-center text-sm font-black text-[#4f4a58]">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="font-black text-ube-deep hover:underline">
                {mode === 'login' ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

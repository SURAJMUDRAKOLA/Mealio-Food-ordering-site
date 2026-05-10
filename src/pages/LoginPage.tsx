import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import anime from 'animejs/lib/anime.es.js';
import { Flame, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ParticleCanvas from '../components/visual/ParticleCanvas';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const cardRef = useRef<HTMLDivElement | null>(null);

  const { signIn, signInWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e: { email?: string; password?: string } = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email is invalid';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const shakeCard = () => {
    if (!cardRef.current) return;
    anime({ targets: cardRef.current, translateX: [0, -10, 10, -8, 8, 0], duration: 460, easing: 'easeInOutSine' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { shakeCard(); return; }
    try {
      await signIn(email, password);
      navigate('/');
    } catch { shakeCard(); }
  };

  const handleGoogle = async () => {
    try { await signInWithGoogle(); }
    catch { /* error toast shown in store */ }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gourmet-bg px-4 py-12">
      <ParticleCanvas variant="auth" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,107,53,.18),transparent_28rem)]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[.95fr_1.05fr]">
        <div className="hidden lg:block">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-gourmet-accent">Member access</p>
          <h1 className="mt-4 font-display text-6xl font-bold leading-none text-gourmet-cream">Welcome back to Mealio.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gourmet-muted">
            Return to saved carts, faster checkout, and order history. Secured by Supabase Auth.
          </p>
          <div className="mt-8 grid max-w-lg gap-3">
            {['Real Supabase auth — email + password', 'One-click Google sign-in', 'Wrong credentials trigger an Anime.js shake'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-gourmet-line bg-gourmet-surface/55 p-4">
                <ShieldCheck size={18} className="text-gourmet-primary" />
                <span className="text-sm font-semibold text-gourmet-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, rotateY: -16, y: 28 }}
          animate={{ opacity: 1, rotateY: 0, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="mx-auto w-full max-w-md rounded-lg border border-gourmet-line bg-gourmet-surface/82 p-7 shadow-card backdrop-blur-xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-md bg-gourmet-primary text-white shadow-glow">
              <Flame size={28} />
            </span>
            <h2 className="font-display text-4xl font-bold text-gourmet-cream">Sign in</h2>
            <p className="mt-2 text-sm text-gourmet-muted">
              New here?{' '}
              <Link to="/signup" className="font-bold text-gourmet-primary hover:text-gourmet-accent">Create an account</Link>
            </p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-md border border-gourmet-line px-4 py-3 text-sm font-bold text-gourmet-muted transition-colors hover:bg-gourmet-cream/10 hover:text-gourmet-cream"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gourmet-line" />
            <span className="text-xs font-semibold text-gourmet-dim">or email</span>
            <span className="h-px flex-1 bg-gourmet-line" />
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input id="email" name="email" type="email" autoComplete="email" label="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} fullWidth />
            <div className="relative">
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" label="Password"
                value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} fullWidth />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-9 text-gourmet-muted transition-colors hover:text-gourmet-cream"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gourmet-muted">
                <input type="checkbox" className="h-4 w-4 rounded border-gourmet-line bg-gourmet-bg accent-gourmet-primary" />
                Remember me
              </label>
              <a href="#" className="font-semibold text-gourmet-primary hover:text-gourmet-accent">Forgot password?</a>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>Sign in</Button>

            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-md border border-gourmet-line px-4 py-3 text-sm font-bold text-gourmet-muted transition-colors hover:bg-gourmet-cream/10 hover:text-gourmet-cream">
              <Mail size={17} />
              Send magic link
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

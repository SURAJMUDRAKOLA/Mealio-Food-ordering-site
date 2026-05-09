import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import anime from 'animejs/lib/anime.es.js';
import { Flame, Sparkles, UserPlus } from 'lucide-react';
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

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const cardRef = useRef<HTMLDivElement | null>(null);

  const { signUp, signInWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email is invalid';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const pulseCard = () => {
    if (!cardRef.current) return;
    anime({ targets: cardRef.current, scale: [1, 1.015, 1], duration: 420, easing: 'easeOutSine' });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) { pulseCard(); return; }
    try {
      await signUp(name.trim(), email, password);
      navigate('/');
    } catch { pulseCard(); }
  };

  const handleGoogle = async () => {
    try { await signInWithGoogle(); }
    catch { /* toast shown in store */ }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gourmet-bg px-4 py-12">
      <ParticleCanvas variant="auth" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(244,165,35,.16),transparent_28rem)]" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, rotateY: 16, y: 28 }}
          animate={{ opacity: 1, rotateY: 0, y: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="mx-auto w-full max-w-md rounded-lg border border-gourmet-line bg-gourmet-surface/82 p-7 shadow-card backdrop-blur-xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="mb-6 text-center">
            <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-md bg-gourmet-primary text-white shadow-glow">
              <Flame size={28} />
            </span>
            <h2 className="font-display text-4xl font-bold text-gourmet-cream">Create account</h2>
            <p className="mt-2 text-sm text-gourmet-muted">
              Already a member?{' '}
              <Link to="/login" className="font-bold text-gourmet-primary hover:text-gourmet-accent">Sign in</Link>
            </p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-md border border-gourmet-line px-4 py-3 text-sm font-bold text-gourmet-muted transition-colors hover:bg-gourmet-cream/10 hover:text-gourmet-cream"
          >
            <GoogleIcon />
            Sign up with Google
          </button>

          <div className="mb-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-gourmet-line" />
            <span className="text-xs font-semibold text-gourmet-dim">or email</span>
            <span className="h-px flex-1 bg-gourmet-line" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input id="name" name="name" type="text" autoComplete="name" label="Full name"
              value={name} onChange={(e) => setName(e.target.value)} error={errors.name} fullWidth />
            <Input id="email" name="email" type="email" autoComplete="email" label="Email address"
              value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} fullWidth />
            <Input id="password" name="password" type="password" autoComplete="new-password" label="Password"
              value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} fullWidth />
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" label="Confirm password"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} fullWidth />

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              <UserPlus size={18} />
              Create account
            </Button>
          </form>
        </motion.div>

        <div className="hidden lg:block">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-gourmet-accent">Start ordering</p>
          <h1 className="mt-4 font-display text-6xl font-bold leading-none text-gourmet-cream">Build your Mealio profile.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-gourmet-muted">
            Profiles, saved addresses, order history, and live tracking — all connected to Supabase.
          </p>
          <div className="mt-8 rounded-lg border border-gourmet-line bg-gourmet-surface/60 p-6">
            <Sparkles className="mb-5 text-gourmet-primary" size={28} />
            <h3 className="text-xl font-extrabold text-gourmet-cream">What you get</h3>
            <ul className="mt-4 space-y-2 text-sm text-gourmet-muted">
              {['Saved addresses for faster checkout', 'Real-time order tracking', 'Full order history', 'Personalized picks'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gourmet-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

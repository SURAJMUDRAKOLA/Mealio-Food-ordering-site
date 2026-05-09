import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import anime from 'animejs/lib/anime.es.js';
import { CheckCircle, CreditCard, Lock, X, XCircle } from 'lucide-react';
import { formatPrice } from '../../utils/price';

type PaymentStage = 'form' | 'processing' | 'success' | 'failed';

interface Props {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const TEST_CARD = '4111 1111 1111 1111';

function formatCardNumber(val: string) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

const MockRazorpayModal: React.FC<Props> = ({ amount, onSuccess, onClose }) => {
  const [stage, setStage] = useState<PaymentStage>('form');
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processingText, setProcessingText] = useState('Processing payment…');
  const modalRef = useRef<HTMLDivElement>(null);

  const shakeModal = () => {
    if (!modalRef.current) return;
    anime({ targets: modalRef.current, translateX: [0, -12, 12, -8, 8, 0], duration: 480, easing: 'easeInOutSine' });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Cardholder name is required';
    const rawCard = card.replace(/\s/g, '');
    if (rawCard.length !== 16) e.card = 'Enter a valid 16-digit card number';
    if (expiry.length < 5) e.expiry = 'Enter a valid expiry (MM/YY)';
    if (cvv.length < 3) e.cvv = 'Enter a valid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) { shakeModal(); return; }

    const rawCard = card.replace(/\s/g, '');
    const isSuccess = rawCard === TEST_CARD.replace(/\s/g, '');

    setStage('processing');
    const steps = ['Processing payment…', 'Verifying with bank…', isSuccess ? 'Payment confirmed ✓' : 'Payment declined ✗'];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 900));
      setProcessingText(steps[i]);
    }
    await new Promise((r) => setTimeout(r, 600));
    setStage(isSuccess ? 'success' : 'failed');

    if (isSuccess) {
      await new Promise((r) => setTimeout(r, 1400));
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={stage === 'form' ? onClose : undefined}
      />

      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative z-10 w-full max-w-md rounded-xl border border-gourmet-line bg-gourmet-surface/95 p-6 shadow-card backdrop-blur-xl"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#072654]">
              <CreditCard size={20} className="text-white" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gourmet-accent">Razorpay</p>
              <p className="text-sm font-bold text-gourmet-cream">Secure Checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-gourmet-line bg-gourmet-bg/60 px-3 py-1.5">
              <Lock size={12} className="text-gourmet-success" />
              <span className="text-xs font-semibold text-gourmet-muted">256-bit SSL</span>
            </div>
            {stage === 'form' && (
              <button onClick={onClose} className="text-gourmet-muted hover:text-gourmet-cream">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="mb-6 rounded-lg border border-gourmet-line bg-gourmet-bg/50 p-4 text-center">
          <p className="text-xs font-semibold text-gourmet-muted">Total amount</p>
          <p className="mt-1 font-display text-3xl font-bold text-gourmet-cream">{formatPrice(amount)}</p>
          <p className="mt-1 text-xs text-gourmet-dim">Mealio Food Delivery</p>
        </div>

        {/* States */}
        <AnimatePresence mode="wait">
          {stage === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gourmet-muted">Card Number</label>
                <input
                  value={card}
                  onChange={(e) => setCard(formatCardNumber(e.target.value))}
                  placeholder="4111 1111 1111 1111"
                  className="w-full rounded-md border border-gourmet-line bg-gourmet-bg px-4 py-3 font-mono text-sm text-gourmet-cream placeholder:text-gourmet-dim outline-none focus:border-gourmet-primary transition-colors"
                />
                {errors.card && <p className="mt-1 text-xs text-gourmet-danger">{errors.card}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gourmet-muted">Cardholder Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name on card"
                  className="w-full rounded-md border border-gourmet-line bg-gourmet-bg px-4 py-3 text-sm text-gourmet-cream placeholder:text-gourmet-dim outline-none focus:border-gourmet-primary transition-colors"
                />
                {errors.name && <p className="mt-1 text-xs text-gourmet-danger">{errors.name}</p>}
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gourmet-muted">Expiry</label>
                  <input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    className="w-full rounded-md border border-gourmet-line bg-gourmet-bg px-4 py-3 font-mono text-sm text-gourmet-cream placeholder:text-gourmet-dim outline-none focus:border-gourmet-primary transition-colors"
                  />
                  {errors.expiry && <p className="mt-1 text-xs text-gourmet-danger">{errors.expiry}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gourmet-muted">CVV</label>
                  <input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    type="password"
                    className="w-full rounded-md border border-gourmet-line bg-gourmet-bg px-4 py-3 font-mono text-sm text-gourmet-cream placeholder:text-gourmet-dim outline-none focus:border-gourmet-primary transition-colors"
                  />
                  {errors.cvv && <p className="mt-1 text-xs text-gourmet-danger">{errors.cvv}</p>}
                </div>
              </div>

              <p className="text-center text-xs text-gourmet-dim">
                Test: <span className="font-mono text-gourmet-accent">{TEST_CARD}</span> → success. Any other card → fail.
              </p>

              <button
                onClick={handlePay}
                className="w-full rounded-md bg-[#072654] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#0d3a7a] active:scale-[0.98]"
              >
                Pay {formatPrice(amount)}
              </button>
            </motion.div>
          )}

          {stage === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8 text-center">
              <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-gourmet-line border-t-[#072654]" />
              <p className="font-semibold text-gourmet-cream">{processingText}</p>
              <p className="mt-2 text-xs text-gourmet-dim">Please do not close this window</p>
            </motion.div>
          )}

          {stage === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
              <CheckCircle size={56} className="mx-auto mb-4 text-gourmet-success" />
              <p className="text-xl font-bold text-gourmet-cream">Payment Successful!</p>
              <p className="mt-2 text-sm text-gourmet-muted">Redirecting to order tracking…</p>
            </motion.div>
          )}

          {stage === 'failed' && (
            <motion.div key="failed" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <XCircle size={56} className="mx-auto mb-4 text-gourmet-danger" />
              <p className="text-xl font-bold text-gourmet-cream">Payment Failed</p>
              <p className="mt-2 text-sm text-gourmet-muted">Your card was declined. Please try the test card.</p>
              <button onClick={() => setStage('form')} className="mt-5 rounded-md border border-gourmet-line px-6 py-2.5 text-sm font-bold text-gourmet-cream hover:bg-gourmet-cream/10">
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MockRazorpayModal;

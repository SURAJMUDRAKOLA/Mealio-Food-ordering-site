import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/utils/price';

describe('formatPrice', () => {
  it('formats a round number in INR', () => {
    expect(formatPrice(349)).toMatch(/₹/);
    expect(formatPrice(349)).toMatch(/349/);
  });

  it('formats zero as ₹0', () => {
    const result = formatPrice(0);
    expect(result).toMatch(/₹/);
    expect(result).toMatch(/0/);
  });

  it('strips decimals (maximumFractionDigits: 0)', () => {
    // 149.99 should round and not show .99
    const result = formatPrice(149.99);
    expect(result).not.toMatch(/\./);
  });

  it('formats large amounts correctly', () => {
    const result = formatPrice(1500);
    expect(result).toMatch(/₹/);
    expect(result).toMatch(/1[,.]?500/); // locale may use comma or period
  });

  it('handles negative values without crashing', () => {
    expect(() => formatPrice(-50)).not.toThrow();
  });
});

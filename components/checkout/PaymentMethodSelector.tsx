'use client';

import { Card, CardContent } from '@/components/ui/card';

export type PaymentMethod = 'paystack' | 'stripe' | 'momo';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  momoEnabled?: boolean;
  stripeEnabled?: boolean;
}

export default function PaymentMethodSelector({
  value,
  onChange,
  momoEnabled = false,  // Disabled - using Paystack only
  stripeEnabled = false,  // Disabled - using Paystack only
}: PaymentMethodSelectorProps) {
  // Auto-select paystack since other methods are disabled
  if (value !== 'paystack') {
    onChange('paystack');
  }

  // Only Paystack is enabled - payment method selector hidden
  // Payment processing will automatically use Paystack
  return null;
}

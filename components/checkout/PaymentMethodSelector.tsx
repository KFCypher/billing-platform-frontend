'use client';

import React from 'react';

export type PaymentMethod = 'paystack' | 'stripe' | 'momo';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  momoEnabled?: boolean;
  stripeEnabled?: boolean;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  value,
  onChange,
}) => {
  // Auto-select paystack since other methods are disabled
  if (value !== 'paystack') {
    onChange('paystack');
  }

  // Only Paystack is enabled - payment method selector hidden
  // Payment processing will automatically use Paystack
  return null;
};

export default PaymentMethodSelector;

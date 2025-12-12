'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone } from 'lucide-react';

export type PaymentMethod = 'stripe' | 'momo';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  momoEnabled?: boolean;
  stripeEnabled?: boolean;
}

export default function PaymentMethodSelector({
  value,
  onChange,
  momoEnabled = true,
  stripeEnabled = true,
}: PaymentMethodSelectorProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue as PaymentMethod);
  };

  // If only one method is enabled, auto-select it
  if (stripeEnabled && !momoEnabled && value !== 'stripe') {
    onChange('stripe');
  }
  if (momoEnabled && !stripeEnabled && value !== 'momo') {
    onChange('momo');
  }

  // If no methods enabled, show error
  if (!stripeEnabled && !momoEnabled) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-sm text-red-600">
            No payment methods are currently available. Please contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If only one method is enabled, don't show selector
  if ((stripeEnabled && !momoEnabled) || (momoEnabled && !stripeEnabled)) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">Payment Method</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stripeEnabled && (
          <Card
            className={`cursor-pointer transition-all ${
              value === 'stripe'
                ? 'border-blue-500 ring-2 ring-blue-500'
                : 'hover:border-gray-400'
            }`}
            onClick={() => onChange('stripe')}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <input 
                  type="radio" 
                  value="stripe" 
                  id="stripe" 
                  checked={value === 'stripe'}
                  onChange={() => onChange('stripe')}
                  className="mt-1 h-4 w-4" 
                />
                <div className="flex-1">
                  <Label
                    htmlFor="stripe"
                    className="flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <CreditCard className="h-5 w-5" />
                    Card Payment
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Pay securely with credit or debit card via Stripe
                  </p>
                  <div className="flex gap-2 mt-2">
                    <img src="/visa.svg" alt="Visa" className="h-6" />
                    <img src="/mastercard.svg" alt="Mastercard" className="h-6" />
                    <img src="/amex.svg" alt="Amex" className="h-6" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {momoEnabled && (
          <Card
            className={`cursor-pointer transition-all ${
              value === 'momo'
                ? 'border-yellow-500 ring-2 ring-yellow-500'
                : 'hover:border-gray-400'
            }`}
            onClick={() => onChange('momo')}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <input 
                  type="radio" 
                  value="momo" 
                  id="momo" 
                  checked={value === 'momo'}
                  onChange={() => onChange('momo')}
                  className="mt-1 h-4 w-4" 
                />
                <div className="flex-1">
                  <Label
                    htmlFor="momo"
                    className="flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <Smartphone className="h-5 w-5" />
                    Mobile Money
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Pay with MTN, Vodafone, or AirtelTigo
                  </p>
                  <div className="flex gap-1 mt-2 text-xs text-gray-600">
                    <span>MTN</span>
                    <span>•</span>
                    <span>Vodafone</span>
                    <span>•</span>
                    <span>AirtelTigo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

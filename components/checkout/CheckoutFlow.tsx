'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import PaymentMethodSelector, { PaymentMethod } from './PaymentMethodSelector';
import PhoneInput from './PhoneInput';
import { useCreateSubscription } from '@/lib/hooks/useSubscriptions';
import { useInitiateMoMoPayment, useMoMoPaymentStatus } from '@/lib/hooks/useMoMo';
import { toast } from 'sonner';

interface Plan {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  billing_interval: 'day' | 'week' | 'month' | 'year';
  trial_days?: number;
  features: string[];
}

interface CheckoutFlowProps {
  plan: Plan;
  customerId: number;
  momoEnabled?: boolean;
  stripeEnabled?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CheckoutFlow({
  plan,
  customerId,
  momoEnabled = true,
  stripeEnabled = true,
  onSuccess,
  onCancel,
}: CheckoutFlowProps) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('GH');
  const [momoTransactionId, setMomoTransactionId] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string>('');

  const createSubscription = useCreateSubscription();
  const initiateMoMo = useInitiateMoMoPayment();
  const { data: paymentStatus, isLoading: isCheckingStatus } = useMoMoPaymentStatus(
    momoTransactionId || '',
    { enabled: !!momoTransactionId, refetchInterval: 3000 }
  );

  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const validatePhone = (): boolean => {
    if (paymentMethod === 'momo' && !phoneNumber) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (paymentMethod === 'momo' && phoneNumber.length < 10) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleStripeCheckout = async () => {
    try {
      const result = await createSubscription.mutateAsync({
        customer_id: customerId,
        plan_id: plan.id,
        quantity: 1,
      });

      if (result.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkout_url;
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
    }
  };

  const handleMoMoCheckout = async () => {
    if (!validatePhone()) return;

    try {
      const result = await initiateMoMo.mutateAsync({
        plan_id: plan.id,
        customer_id: customerId,
        phone_number: phoneNumber,
        country_code: countryCode,
      });

      if (result.transaction_id) {
        setMomoTransactionId(result.transaction_id);
        toast.info('Payment request sent to your phone. Please approve the transaction.');
      }
    } catch (error) {
      console.error('MoMo payment error:', error);
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === 'stripe') {
      handleStripeCheckout();
    } else {
      handleMoMoCheckout();
    }
  };

  // Handle MoMo payment status changes
  if (momoTransactionId && paymentStatus) {
    if (paymentStatus.status === 'SUCCESS') {
      toast.success('Payment successful!');
      onSuccess?.();
      return (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Payment Successful!</h3>
                <p className="text-sm text-green-700">
                  Your subscription has been activated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (paymentStatus.status === 'failed') {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Payment Failed</h3>
                <p className="text-sm text-red-700">
                  {paymentStatus.failure_reason || 'The payment could not be processed.'}
                </p>
              </div>
            </div>
            <Button onClick={() => setMomoTransactionId(null)} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Payment is pending
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div>
              <h3 className="font-semibold text-lg">Waiting for Payment</h3>
              <p className="text-sm text-gray-600 mt-2">
                Please check your phone and approve the payment request from your Mobile Money
                provider.
              </p>
              <Badge variant="outline" className="mt-3">
                Status: {paymentStatus.status}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMomoTransactionId(null)}
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {formatPrice(plan.price_cents, plan.currency)}
            </span>
            <span className="text-gray-500">/ {plan.billing_interval}</span>
          </div>

          {plan.trial_days && plan.trial_days > 0 && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {plan.trial_days} day free trial
            </Badge>
          )}

          {plan.features && plan.features.length > 0 && (
            <div className="pt-4 space-y-2">
              <p className="text-sm font-medium">Includes:</p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <PaymentMethodSelector
        value={paymentMethod}
        onChange={setPaymentMethod}
        momoEnabled={momoEnabled}
        stripeEnabled={stripeEnabled}
      />

      {/* Phone Input for Mobile Money */}
      {paymentMethod === 'momo' && (
        <Card>
          <CardHeader>
            <CardTitle>Mobile Money Details</CardTitle>
            <CardDescription>
              Enter the phone number registered with your Mobile Money account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhoneInput
              value={phoneNumber}
              onChange={setPhoneNumber}
              countryCode={countryCode}
              onCountryChange={setCountryCode}
              error={phoneError}
              required
            />
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleCheckout}
          disabled={createSubscription.isPending || initiateMoMo.isPending}
          className="flex-1"
          size="lg"
        >
          {createSubscription.isPending || initiateMoMo.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : paymentMethod === 'stripe' ? (
            <>
              Continue to Payment
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          ) : (
            'Send Payment Request'
          )}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} size="lg">
            Cancel
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <p className="text-xs text-gray-600 text-center">
            Your payment information is secure. {paymentMethod === 'stripe' ? 'Stripe' : 'Mobile Money providers'} use industry-standard encryption to protect your data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

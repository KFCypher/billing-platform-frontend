'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutFlow from '@/components/checkout/CheckoutFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutDemoPage() {
  const router = useRouter();
  const [selectedPlan] = useState({
    id: 1,
    name: 'Professional Plan',
    price_cents: 2999,
    currency: 'USD',
    billing_interval: 'monthly',
    description: 'Perfect for growing businesses',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/plans">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Checkout Demo</h1>
            <p className="text-gray-600 mt-1">
              Test the Mobile Money and Stripe checkout flow
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Demo Mode</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <p className="mb-2">
              This is a demo checkout page. The checkout flow supports:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Stripe card payments (redirects to Stripe Checkout)</li>
              <li>Mobile Money payments (MTN, Vodafone, AirtelTigo)</li>
              <li>Phone number validation for 8 African countries</li>
              <li>Real-time payment status polling</li>
            </ul>
            <p className="mt-3 font-medium">
              To test: Configure your payment methods in Settings first!
            </p>
          </CardContent>
        </Card>

        {/* Checkout Component */}
        <CheckoutFlow
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price_cents}
          currency={selectedPlan.currency}
          billingInterval={selectedPlan.billing_interval as 'monthly' | 'yearly'}
          onSuccess={(data) => {
            console.log('Payment success:', data);
            router.push('/dashboard/subscriptions');
          }}
          onCancel={() => {
            console.log('Payment cancelled');
            router.push('/dashboard/plans');
          }}
        />
      </div>
    </div>
  );
}

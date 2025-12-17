'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, ArrowLeft, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  billing_interval: z.enum(['monthly', 'yearly']),
  features: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [paystackConnected, setPaystackConnected] = useState(false);
  const [, setFirstPlanCreated] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      billing_interval: 'monthly',
    },
  });

  const steps = [
    { number: 1, title: 'Connect Paystack', description: 'Link your Paystack account' },
    { number: 2, title: 'Create First Plan', description: 'Set up your first subscription plan' },
    { number: 3, title: 'Integration Code', description: 'Get your API integration code' },
    { number: 4, title: 'Configure Webhook', description: 'Set up webhook for events' },
  ];

  const handlePaystackConnect = () => {
    // Redirect to Paystack settings
    router.push('/dashboard/settings?tab=paystack');
  };

  const onSubmitPlan = async (data: PlanFormData) => {
    try {
      // Parse features from comma-separated string
      const features = data.features 
        ? data.features.split(',').map(f => f.trim()).filter(Boolean)
        : [];

      const planData = {
        ...data,
        price: parseFloat(data.price),
        features,
      };

      // API call would go here
      console.log('Creating plan:', planData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFirstPlanCreated(true);
      toast.success('First plan created successfully!');
      setCurrentStep(3);
    } catch {
      toast.error('Failed to create plan');
    }
  };

  const integrationCode = `// Install the SDK
npm install @yourbilling/sdk

// Initialize the SDK
import BillingSDK from '@yourbilling/sdk';

const billing = new BillingSDK({
  apiKey: 'YOUR_API_KEY',
  environment: 'production'
});

// Create a subscription
const subscription = await billing.subscriptions.create({
  customerId: 'customer_id',
  planId: 'plan_id',
  paymentMethod: 'payment_method_id'
});`;

  const webhookUrl = 'https://your-domain.com/api/webhooks/billing';

  const copyToClipboard = (text: string, type: 'code' | 'webhook') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  const handleFinish = () => {
    toast.success('Setup complete! Redirecting to dashboard...');
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Your Billing Platform</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let&apos;s get you set up in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${currentStep > step.number 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : currentStep === step.number
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-gray-300 text-gray-400'
                    }
                  `}>
                    {currentStep > step.number ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <span className="font-medium">{step.number}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center hidden sm:block">
                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-full mx-2 transition-colors ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Connect Paystack */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M0 13.7v-3.4l7.7-7.7h3.4L0 13.7zm0 10.3v-3.4l18.3-18.3h3.4L0 24zm8.4 0L24 8.4V12L12 24H8.4z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Connect Your Paystack Account</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                    Configure your Paystack credentials to start accepting payments in Ghana Cedis (GHS).
                  </p>
                  
                  {!paystackConnected ? (
                    <Button onClick={handlePaystackConnect} size="lg" className="gap-2">
                      <ExternalLink size={16} />
                      Configure Paystack
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 size={20} />
                      <span className="font-medium">Paystack Connected</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setCurrentStep(2)} 
                    disabled={!paystackConnected}
                    className="gap-2"
                  >
                    Continue <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Create First Plan */}
            {currentStep === 2 && (
              <form onSubmit={handleSubmit(onSubmitPlan)} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Plan Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Basic, Pro, Enterprise"
                      {...register('name')}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this plan"
                      {...register('description')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="29.99"
                        {...register('price')}
                      />
                      {errors.price && (
                        <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="billing_interval">Billing Interval *</Label>
                      <select
                        id="billing_interval"
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        {...register('billing_interval')}
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="features">Features (comma-separated)</Label>
                    <Textarea
                      id="features"
                      placeholder="Unlimited users, 24/7 support, Advanced analytics"
                      {...register('features')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter features separated by commas
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                    className="gap-2"
                  >
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? 'Creating...' : 'Create Plan'} <ArrowRight size={16} />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Integration Code */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your API Integration Code</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Use this code to integrate billing into your application.
                  </p>
                  
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{integrationCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(integrationCode, 'code')}
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Next Steps:</h4>
                  <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <li>• Install the SDK in your project</li>
                    <li>• Replace YOUR_API_KEY with your actual API key from Settings</li>
                    <li>• Test the integration in your development environment</li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(2)}
                    className="gap-2"
                  >
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button onClick={() => setCurrentStep(4)} className="gap-2">
                    Continue <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Configure Webhook */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Webhook Configuration</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Configure your webhook endpoint to receive real-time event notifications.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <Label>Your Webhook URL</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={webhookUrl}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                        >
                          {copiedWebhook ? <Check size={16} /> : <Copy size={16} />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Add this URL to your webhook configuration in Settings
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-medium mb-2">Events You&apos;ll Receive:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant="outline">subscription.created</Badge>
                        <Badge variant="outline">subscription.updated</Badge>
                        <Badge variant="outline">subscription.cancelled</Badge>
                        <Badge variant="outline">payment.succeeded</Badge>
                        <Badge variant="outline">payment.failed</Badge>
                        <Badge variant="outline">customer.created</Badge>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Important:</h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Make sure your webhook endpoint is publicly accessible and can handle POST requests. 
                        You can configure and test webhooks anytime from the Webhooks page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(3)}
                    className="gap-2"
                  >
                    <ArrowLeft size={16} /> Back
                  </Button>
                  <Button onClick={handleFinish} size="lg" className="gap-2">
                    <CheckCircle2 size={16} />
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Need help? Check out our{' '}
            <button 
              onClick={() => router.push('/dashboard/developers')}
              className="text-blue-600 hover:underline"
            >
              documentation
            </button>
            {' '}or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { stripeApi } from '@/lib/api-client';
import { ExternalLink, CheckCircle, XCircle, Loader2, Smartphone, ArrowRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  const { data: stripeStatus, isLoading, refetch } = useQuery({
    queryKey: ['stripe-status'],
    queryFn: () => stripeApi.getStatus(),
  });

  const isConnected = stripeStatus?.data?.is_connected || false;

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    try {
      console.log('Requesting Stripe Connect URL...');
      const response = await stripeApi.getConnectUrl();
      console.log('Stripe Connect response:', response.data);
      
      const connectUrl = response.data?.url;
      
      if (!connectUrl) {
        throw new Error('No connect URL returned from server');
      }
      
      // Open Stripe Connect in new window
      const stripeWindow = window.open(connectUrl, '_blank', 'width=800,height=900');
      
      if (!stripeWindow) {
        toast.error('Please allow popups to connect with Stripe');
        setIsConnecting(false);
        return;
      }
      
      toast.info('Complete the connection in the new window');
      
      // Poll for connection status
      const pollInterval = setInterval(async () => {
        try {
          const status = await stripeApi.getStatus();
          console.log('Polling Stripe status:', status.data);
          
          if (status.data?.is_connected) {
            clearInterval(pollInterval);
            refetch();
            toast.success('Stripe account connected successfully!');
            setIsConnecting(false);
            
            // Close the Stripe window if still open
            if (stripeWindow && !stripeWindow.closed) {
              stripeWindow.close();
            }
          }
        } catch (pollError) {
          console.error('Error polling status:', pollError);
        }
      }, 3000);

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isConnecting) {
          toast.info('Polling stopped. Please refresh the page to check connection status.');
          setIsConnecting(false);
        }
      }, 300000);
    } catch (error: unknown) {
      console.error('Stripe Connect error:', error);
      let errorMessage = 'Failed to connect Stripe';
      
      // Check for specific error types
      const apiError = error && typeof error === 'object' && 'response' in error ? error as { response?: { data?: { error?: string; details?: string } } } : null;
      
      if (apiError?.response?.data?.error?.message?.includes('No application matches')) {
        errorMessage = 'Stripe Connect not configured correctly. Please check your STRIPE_CONNECT_CLIENT_ID in the backend .env file. It should start with "ca_" and can be found at: Stripe Dashboard → Settings → Connect';
      } else if (apiError?.response?.data?.error) {
        errorMessage = apiError.response.data.error;
      } else if (apiError?.response?.data?.details) {
        errorMessage = apiError.response.data.details;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      
      toast.error(errorMessage, { duration: 8000 });
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account and integration settings
        </p>
      </div>

      <Tabs defaultValue="paystack">
        <TabsList>
          {/* Stripe and MoMo hidden - using Paystack only */}
          {/* <TabsTrigger value="stripe">Stripe Integration</TabsTrigger> */}
          {/* <TabsTrigger value="mobile-money">Mobile Money</TabsTrigger> */}
          <TabsTrigger value="paystack">Paystack</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Stripe Integration Tab - Hidden */}
        <TabsContent value="stripe" className="space-y-6 mt-6" style={{display: 'none'}}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Stripe Account</CardTitle>
                  <CardDescription>
                    Connect your Stripe account to process payments
                  </CardDescription>
                </div>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : isConnected ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="mr-1 h-3 w-3" />
                    Not Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Your Stripe account is successfully connected and ready to process payments.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Stripe Account ID</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stripeStatus?.data?.stripe_account_id || 'N/A'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" asChild>
                      <a 
                        href="https://dashboard.stripe.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        Open Stripe Dashboard
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" onClick={() => refetch()}>
                      Refresh Status
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                      <strong>Important:</strong> You need to connect your Stripe account to start accepting payments.
                    </p>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                      <li>Process credit card payments securely</li>
                      <li>Manage subscriptions automatically</li>
                      <li>Handle recurring billing</li>
                      <li>Access detailed payment analytics</li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleConnectStripe}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Connect Stripe Account
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time updates from Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Webhook URL</p>
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                      {process.env.NEXT_PUBLIC_API_URL}/api/v1/webhooks/stripe
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/webhooks/stripe`);
                        toast.success('Webhook URL copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add this URL to your Stripe webhook settings to receive payment and subscription events.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Money Tab */}
        <TabsContent value="mobile-money" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Money Payments
              </CardTitle>
              <CardDescription>
                Accept payments via MTN Mobile Money, Vodafone Cash, and AirtelTigo Money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    <strong>Mobile Money Integration</strong>
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                    <li>Accept payments from 8 African countries</li>
                    <li>Support for MTN, Vodafone, and AirtelTigo</li>
                    <li>Real-time payment verification</li>
                    <li>Automatic webhook notifications</li>
                    <li>Sandbox testing available</li>
                  </ul>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => router.push('/dashboard/settings/mobile-money')}
                    className="w-full sm:w-auto"
                  >
                    Configure Mobile Money
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-sm text-gray-500">
                    Set up your Mobile Money provider credentials to start accepting payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Providers</CardTitle>
              <CardDescription>
                Mobile Money services supported by the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">MTN Mobile Money</h3>
                  <p className="text-sm text-gray-600">
                    Available in Ghana, Uganda, Nigeria, and more
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Vodafone Cash</h3>
                  <p className="text-sm text-gray-600">
                    Available in Ghana and select regions
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">AirtelTigo Money</h3>
                  <p className="text-sm text-gray-600">
                    Available in Ghana and West Africa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paystack Tab */}
        <TabsContent value="paystack" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paystack Payments
              </CardTitle>
              <CardDescription>
                Accept payments via Paystack for African markets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                    <strong>Paystack Integration</strong>
                  </p>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 list-disc list-inside space-y-1">
                    <li>Accept cards, bank transfers, and mobile money</li>
                    <li>Support for Nigerian, Ghanaian, South African, and Kenyan payments</li>
                    <li>Real-time payment verification</li>
                    <li>Automatic recurring billing</li>
                    <li>Test mode available</li>
                  </ul>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => router.push('/dashboard/settings/paystack')}
                    className="w-full sm:w-auto"
                  >
                    Configure Paystack
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-sm text-gray-500">
                    Set up your Paystack API keys to start accepting payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported Payment Methods</CardTitle>
              <CardDescription>
                Payment methods available through Paystack
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Cards</h3>
                  <p className="text-sm text-gray-600">
                    Visa, Mastercard, Verve, and more
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Bank Transfer</h3>
                  <p className="text-sm text-gray-600">
                    Direct bank transfers and USSD
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Mobile Money</h3>
                  <p className="text-sm text-gray-600">
                    MTN, Vodafone, Tigo, Airtel
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        {/* General Tab */}
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your company details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Company settings will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when you want to receive email notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Notification preferences will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Billing information will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

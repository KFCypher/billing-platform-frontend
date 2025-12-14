'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { paystackConfigApi } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PaystackConfig {
  enabled: boolean;
  has_credentials: boolean;
  public_key?: string;
  test_mode?: boolean;
}

const paystackSchema = z.object({
  secret_key: z.string().min(1, 'Secret key is required'),
  public_key: z.string().min(1, 'Public key is required'),
  test_mode: z.boolean().default(true),
});

type PaystackFormData = z.infer<typeof paystackSchema>;

export default function PaystackConfigPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<PaystackConfig | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaystackFormData>({
    resolver: zodResolver(paystackSchema),
    defaultValues: {
      test_mode: true,
    },
  });

  const testMode = watch('test_mode');

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      const response = await paystackConfigApi.get();
      const config = response.data;
      
      setCurrentConfig(config);
      setIsConfigured(config.enabled && config.has_credentials);
      
      if (config.public_key) {
        setValue('public_key', config.public_key);
      }
      
      if (config.test_mode !== undefined) {
        setValue('test_mode', config.test_mode);
      }
    } catch (error) {
      console.error('Error loading Paystack config:', error);
    }
  };

  const onSubmit = async (data: PaystackFormData) => {
    setIsLoading(true);
    try {
      const response = await paystackConfigApi.configure(data);
      toast.success('Paystack configured successfully!');
      setIsConfigured(true);
      
      // Reload configuration
      await loadCurrentConfig();
      
      // Clear sensitive fields after successful save
      setValue('secret_key', '');
      
      // Notify other tabs/windows about the configuration change
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('paystack_configured', Date.now().toString());
      }
    } catch (error: any) {
      console.error('Paystack config error:', error);
      
      let errorMessage = 'Failed to configure Paystack';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!isConfigured) {
      toast.error('Please configure Paystack first');
      return;
    }

    setIsTesting(true);
    try {
      const response = await paystackConfigApi.test();
      toast.success('Connection test successful!');
    } catch (error: any) {
      console.error('Test error:', error);
      
      let errorMessage = 'Connection test failed';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable Paystack? This will prevent new payments through Paystack.')) {
      return;
    }

    try {
      await paystackConfigApi.disable();
      toast.success('Paystack disabled');
      setIsConfigured(false);
      
      // Reload configuration
      await loadCurrentConfig();
      
      // Clear form
      setValue('secret_key', '');
      setValue('public_key', '');
      
      // Notify other tabs/windows
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('paystack_configured', Date.now().toString());
      }
    } catch (error: any) {
      console.error('Disable error:', error);
      toast.error('Failed to disable Paystack');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Paystack Configuration</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Configure your Paystack API keys to accept payments
            </p>
          </div>
          {isConfigured && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Configured
            </Badge>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {isConfigured ? (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Paystack is configured and ready to accept payments.
            {currentConfig?.test_mode && ' (Currently in test mode)'}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Paystack is not configured. Add your API keys below to start accepting payments.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started with Paystack</CardTitle>
          <CardDescription>
            Follow these steps to get your Paystack API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Sign up or log in to your{' '}
              <a
                href="https://dashboard.paystack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Paystack Dashboard
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Navigate to Settings → API Keys & Webhooks</li>
            <li>Copy your Public Key and Secret Key</li>
            <li>For testing, use Test keys (starts with pk_test_ and sk_test_)</li>
            <li>For production, use Live keys (starts with pk_live_ and sk_live_)</li>
          </ol>
        </CardContent>
      </Card>

      {/* Webhook Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Configure this webhook URL in your Paystack dashboard to receive payment notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Webhook URL</Label>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm break-all">
                  {process.env.NEXT_PUBLIC_API_URL}/api/v1/webhooks/paystack
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/webhooks/paystack`;
                    navigator.clipboard.writeText(url);
                    toast.success('Webhook URL copied!');
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p><strong>To add this webhook to Paystack:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to Paystack Dashboard → Settings → Webhooks</li>
                <li>Paste the webhook URL above</li>
                <li>Select events you want to receive (charge.success, subscription.*)</li>
                <li>Save the webhook</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Enter your Paystack API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="test_mode" className="text-base">
                  Test Mode
                </Label>
                <p className="text-sm text-gray-500">
                  Use test API keys for development and testing
                </p>
              </div>
              <Switch
                id="test_mode"
                checked={testMode}
                onCheckedChange={(checked) => setValue('test_mode', checked)}
              />
            </div>

            {/* Public Key */}
            <div className="space-y-2">
              <Label htmlFor="public_key">
                Public Key
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="public_key"
                placeholder={testMode ? 'pk_test_...' : 'pk_live_...'}
                {...register('public_key')}
              />
              {errors.public_key && (
                <p className="text-sm text-red-600">{errors.public_key.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Your Paystack public key (used on the frontend)
              </p>
            </div>

            {/* Secret Key */}
            <div className="space-y-2">
              <Label htmlFor="secret_key">
                Secret Key
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="secret_key"
                type="password"
                placeholder={testMode ? 'sk_test_...' : 'sk_live_...'}
                {...register('secret_key')}
              />
              {errors.secret_key && (
                <p className="text-sm text-red-600">{errors.secret_key.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Your Paystack secret key (stored securely on the backend)
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
              
              {isConfigured && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTest}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDisable}
                  >
                    Disable Paystack
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Security Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Note:</strong> Your secret key is encrypted and stored securely on our servers.
          Never share your secret key or commit it to version control.
        </AlertDescription>
      </Alert>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, CheckCircle2, XCircle, Smartphone } from 'lucide-react';
import { 
  useMoMoConfig, 
  useConfigureMoMo, 
  useDisableMoMo, 
  useTestMoMo 
} from '@/lib/hooks/useMoMo';

const momoConfigSchema = z.object({
  merchant_id: z.string().min(1, 'Merchant ID is required'),
  api_key: z.string().min(1, 'API key is required'),
  provider: z.enum(['mtn', 'vodafone', 'airteltigo']),
  sandbox: z.boolean(),
  country_code: z.string().optional(),
});

type MoMoConfigFormData = z.infer<typeof momoConfigSchema>;

export default function MobileMoneySettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  
  const { data: config, isLoading: isLoadingConfig } = useMoMoConfig();
  const configureMoMo = useConfigureMoMo();
  const disableMoMo = useDisableMoMo();
  const testMoMo = useTestMoMo();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MoMoConfigFormData>({
    resolver: zodResolver(momoConfigSchema),
    defaultValues: {
      provider: 'mtn',
      sandbox: true,
      country_code: 'GH',
    },
  });

  const provider = watch('provider');
  const sandbox = watch('sandbox');

  const onSubmit = async (data: MoMoConfigFormData) => {
    await configureMoMo.mutateAsync(data);
  };

  const handleDisable = async () => {
    if (confirm('Are you sure you want to disable Mobile Money payments?')) {
      await disableMoMo.mutateAsync();
    }
  };

  const handleTest = async () => {
    await testMoMo.mutateAsync();
  };

  if (isLoadingConfig) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mobile Money Settings</h1>
        <p className="text-gray-500 mt-2">
          Configure MTN Mobile Money, Vodafone Cash, or AirtelTigo Money payments
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Money Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                {config?.enabled ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-500">Disabled</span>
                  </>
                )}
              </div>
              {config?.enabled && config.provider && (
                <div className="mt-2 text-sm text-gray-500">
                  Provider: <span className="font-medium uppercase">{config.provider}</span>
                  {' • '}
                  Mode: <span className="font-medium">{config.sandbox ? 'Sandbox' : 'Production'}</span>
                  {config.merchant_id && (
                    <>
                      {' • '}
                      Merchant ID: <span className="font-mono">{config.merchant_id}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            {config?.enabled && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={testMoMo.isPending}
                >
                  {testMoMo.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test Connection'
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisable}
                  disabled={disableMoMo.isPending}
                >
                  {disableMoMo.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Disable'
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Configure your Mobile Money provider credentials. You can get these from your provider's developer portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={provider}
                onValueChange={(value) => setValue('provider', value as 'mtn' | 'vodafone' | 'airteltigo')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                  <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                  <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                </SelectContent>
              </Select>
              {errors.provider && (
                <p className="text-sm text-red-500">{errors.provider.message}</p>
              )}
            </div>

            {/* Merchant ID */}
            <div className="space-y-2">
              <Label htmlFor="merchant_id">Merchant ID / User ID</Label>
              <Input
                id="merchant_id"
                placeholder="your-merchant-id"
                {...register('merchant_id')}
              />
              {errors.merchant_id && (
                <p className="text-sm text-red-500">{errors.merchant_id.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Your merchant or user ID from the provider
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="api_key">API Key / Subscription Key</Label>
              <div className="relative">
                <Input
                  id="api_key"
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="your-api-key-here"
                  {...register('api_key')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </Button>
              </div>
              {errors.api_key && (
                <p className="text-sm text-red-500">{errors.api_key.message}</p>
              )}
              <p className="text-sm text-gray-500">
                Your API key or subscription key from the provider portal
              </p>
            </div>

            {/* Country Code */}
            <div className="space-y-2">
              <Label htmlFor="country_code">Country Code</Label>
              <Select
                value={watch('country_code') || 'GH'}
                onValueChange={(value) => setValue('country_code', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GH">🇬🇭 Ghana (233)</SelectItem>
                  <SelectItem value="UG">🇺🇬 Uganda (256)</SelectItem>
                  <SelectItem value="NG">🇳🇬 Nigeria (234)</SelectItem>
                  <SelectItem value="ZA">🇿🇦 South Africa (27)</SelectItem>
                  <SelectItem value="KE">🇰🇪 Kenya (254)</SelectItem>
                  <SelectItem value="TZ">🇹🇿 Tanzania (255)</SelectItem>
                  <SelectItem value="RW">🇷🇼 Rwanda (250)</SelectItem>
                  <SelectItem value="CI">🇨🇮 Ivory Coast (225)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sandbox Mode */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="sandbox" className="text-base">
                  Sandbox Mode
                </Label>
                <p className="text-sm text-gray-500">
                  Use test environment for development. Disable for production.
                </p>
              </div>
              <Switch
                id="sandbox"
                checked={sandbox}
                onCheckedChange={(checked) => setValue('sandbox', checked)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={configureMoMo.isPending}
                className="flex-1"
              >
                {configureMoMo.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">MTN Mobile Money</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Register at <a href="https://momodeveloper.mtn.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">momodeveloper.mtn.com</a></li>
              <li>Subscribe to Collections API</li>
              <li>Copy your Primary Key (API key)</li>
              <li>Generate API User (for sandbox)</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Important Notes</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Test in sandbox mode first before going to production</li>
              <li>API keys are encrypted and stored securely</li>
              <li>You can switch between sandbox and production anytime</li>
              <li>Use the Test Connection button to verify your credentials</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

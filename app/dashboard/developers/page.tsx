'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Eye, EyeOff, Code, Book, Key } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

export default function DevelopersPage() {
  const [apiKeys, setApiKeys] = useState<{ live: string; test: string } | null>(null);
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);

  useEffect(() => {
    // In a real app, fetch API keys from backend
    // For now, get from localStorage if available
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      const tenantData = JSON.parse(tenant);
      // These would come from the registration response
      setApiKeys({
        live: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
        test: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx'
      });
    }
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 12)}${'•'.repeat(20)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          API documentation and integration guides
        </p>
      </div>

      <Tabs defaultValue="quickstart">
        <TabsList>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Quick Start Tab */}
        <TabsContent value="quickstart" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Integrate our billing API into your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">1. Install the SDK</h3>
                <div className="bg-gray-900 rounded-lg p-4 relative group">
                  <code className="text-green-400 text-sm">
                    npm install @billing-platform/sdk
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard('npm install @billing-platform/sdk', 'Command')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">2. Initialize the Client</h3>
                <div className="bg-gray-900 rounded-lg p-4 relative group">
                  <pre className="text-green-400 text-sm overflow-x-auto">
{`import { BillingClient } from '@billing-platform/sdk';

const client = new BillingClient({
  apiKey: 'your_api_key',
  environment: 'test' // or 'live'
});`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(`import { BillingClient } from '@billing-platform/sdk';\n\nconst client = new BillingClient({\n  apiKey: 'your_api_key',\n  environment: 'test'\n});`, 'Code')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">3. Create a Subscription</h3>
                <div className="bg-gray-900 rounded-lg p-4 relative group">
                  <pre className="text-green-400 text-sm overflow-x-auto">
{`// Create a customer
const customer = await client.customers.create({
  email: 'customer@example.com',
  name: 'John Doe'
});

// Create a subscription
const subscription = await client.subscriptions.create({
  customer_id: customer.id,
  plan_id: 'plan_xxxxx',
  payment_method: 'pm_xxxxx'
});`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard('const customer = await client.customers.create({...});', 'Code')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Tip:</strong> Always use test API keys during development. Switch to live keys only when you're ready to go to production.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Your API Keys
              </CardTitle>
              <CardDescription>
                Use these keys to authenticate your API requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Live Key */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Live API Key</h3>
                    <Badge variant="default">Production</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLiveKey(!showLiveKey)}
                  >
                    {showLiveKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                    {showLiveKey ? (apiKeys?.live || 'Not available') : maskApiKey(apiKeys?.live || 'pk_live_xxxx')}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(apiKeys?.live || '', 'Live API key')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ⚠️ Keep this key secret. Only use it on your server, never in client-side code.
                </p>
              </div>

              <Separator />

              {/* Test Key */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Test API Key</h3>
                    <Badge variant="secondary">Development</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTestKey(!showTestKey)}
                  >
                    {showTestKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                    {showTestKey ? (apiKeys?.test || 'Not available') : maskApiKey(apiKeys?.test || 'pk_test_xxxx')}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(apiKeys?.test || '', 'Test API key')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Use this key for development and testing. No real charges will be made.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Security Note:</strong> Never commit API keys to your repository or expose them in client-side code. Use environment variables instead.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Reference Tab */}
        <TabsContent value="api-reference" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                API Endpoints
              </CardTitle>
              <CardDescription>
                Complete reference for all available endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plans Endpoints */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Plans</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        GET
                      </Badge>
                      <code className="text-sm">/api/v1/plans</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">List all subscription plans</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                        POST
                      </Badge>
                      <code className="text-sm">/api/v1/plans</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create a new subscription plan</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                        PATCH
                      </Badge>
                      <code className="text-sm">/api/v1/plans/:id</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update a subscription plan</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customers Endpoints */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Customers</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        GET
                      </Badge>
                      <code className="text-sm">/api/v1/customers</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">List all customers</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                        POST
                      </Badge>
                      <code className="text-sm">/api/v1/customers</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create a new customer</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subscriptions Endpoints */}
              <div>
                <h3 className="font-semibold mb-3 text-lg">Subscriptions</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        GET
                      </Badge>
                      <code className="text-sm">/api/v1/subscriptions</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">List all subscriptions</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                        POST
                      </Badge>
                      <code className="text-sm">/api/v1/subscriptions</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create a new subscription</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                        DELETE
                      </Badge>
                      <code className="text-sm">/api/v1/subscriptions/:id/cancel</code>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cancel a subscription</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Events</CardTitle>
              <CardDescription>
                Subscribe to events and get notified in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Available Events</h3>
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg">
                    <code className="text-sm font-mono">subscription.created</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Triggered when a new subscription is created
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <code className="text-sm font-mono">subscription.updated</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Triggered when a subscription is modified
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <code className="text-sm font-mono">subscription.cancelled</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Triggered when a subscription is cancelled
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <code className="text-sm font-mono">payment.succeeded</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Triggered when a payment is successful
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <code className="text-sm font-mono">payment.failed</code>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Triggered when a payment fails
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

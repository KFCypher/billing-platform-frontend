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
  const [apiKeys, setApiKeys] = useState<{ live: string; test: string; live_secret?: string; test_secret?: string } | null>(null);
  const [showLiveKey, setShowLiveKey] = useState(false);
  const [showTestKey, setShowTestKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch API keys from backend
    const fetchApiKeys = async () => {
      try {
        setLoading(true);
        
        // Get tenant ID from localStorage (stored as JSON object)
        let tenantId: string | null = null;
        
        // Try getting from tenant object first
        const tenantData = localStorage.getItem('tenant');
        if (tenantData) {
          try {
            const tenant = JSON.parse(tenantData);
            tenantId = tenant.id?.toString();
          } catch (e) {
            console.error('Failed to parse tenant data:', e);
          }
        }
        
        // Fallback to user.tenant_id
        if (!tenantId) {
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const user = JSON.parse(userData);
              tenantId = user.tenant_id?.toString();
            } catch (e) {
              console.error('Failed to parse user data:', e);
            }
          }
        }
        
        if (!tenantId) {
          setError('No tenant ID found. Please log in again.');
          setLoading(false);
          return;
        }

        console.log('Fetching API keys for tenant:', tenantId);

        const response = await fetch('http://localhost:8000/api/v1/auth/tenants/api-keys/', {
          headers: {
            'X-Tenant-ID': tenantId,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch API keys: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API keys response:', data);
        
        // Parse the keys from the response
        const keysMap: { live: string; test: string; live_secret?: string; test_secret?: string } = {
          live: '',
          test: ''
        };

        data.keys.forEach((keyObj: { type: string; key: string }) => {
          if (keyObj.type === 'live_public') {
            keysMap.live = keyObj.key;
          } else if (keyObj.type === 'test_public') {
            keysMap.test = keyObj.key;
          } else if (keyObj.type === 'live_secret') {
            keysMap.live_secret = keyObj.key;
          } else if (keyObj.type === 'test_secret') {
            keysMap.test_secret = keyObj.key;
          }
        });

        setApiKeys(keysMap);
        setError(null);
      } catch (err) {
        console.error('Error fetching API keys:', err);
        setError('Failed to load API keys. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApiKeys();
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

      <Tabs defaultValue="widget">
        <TabsList>
          <TabsTrigger value="widget">Widget Integration</TabsTrigger>
          <TabsTrigger value="quickstart">Quick Start</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="api-reference">API Reference</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Widget Integration Tab */}
        <TabsContent value="widget" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Embeddable Billing Widget
              </CardTitle>
              <CardDescription>
                Add subscription pricing to your website with just a few lines of code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">1. Add the Widget Script</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Add this script tag to your website&apos;s HTML, just before the closing &lt;/body&gt; tag:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 relative group">
                  <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
{`<script src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/billing-widget.js"></script>`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(`<script src="${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/billing-widget.js"></script>`, 'Script tag')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">2. Initialize the Widget</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Add this code where you want the pricing plans to appear:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 relative group">
                  <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
{`<div id="billing-widget"></div>

<script>
  BillingWidget.init({
    apiKey: '${apiKeys?.test || 'YOUR_API_KEY'}',
    containerId: 'billing-widget',
    environment: 'test', // or 'live'
    theme: 'light', // or 'dark'
    onSuccess: function(data) {
      console.log('Subscription created:', data);
      // Redirect user to success page
      window.location.href = '/success';
    },
    onError: function(error) {
      console.error('Error:', error);
      alert('Failed to create subscription');
    }
  });
</script>`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => copyToClipboard(`<div id="billing-widget"></div>\n\n<script>\n  BillingWidget.init({\n    apiKey: '${apiKeys?.test || 'YOUR_API_KEY'}',\n    containerId: 'billing-widget',\n    environment: 'test',\n    theme: 'light',\n    onSuccess: function(data) {\n      window.location.href = '/success';\n    },\n    onError: function(error) {\n      console.error('Error:', error);\n    }\n  });\n</script>`, 'Widget code')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">3. Configuration Options</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">apiKey</code>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your API key (test or live mode)
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">containerId</code>
                      <Badge variant="outline">Required</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID of the HTML element where the widget will be rendered
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">environment</code>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      &apos;test&apos; or &apos;live&apos; (defaults to &apos;test&apos;)
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">theme</code>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      &apos;light&apos; or &apos;dark&apos; (defaults to &apos;light&apos;)
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">onSuccess</code>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Callback function called when subscription is created successfully
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono">onError</code>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Callback function called when an error occurs
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>✅ That&apos;s it!</strong> The widget will automatically display all your active subscription plans with working checkout functionality.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>💡 Live Demo:</strong> Want to see it in action? The widget file is located at:
                </p>
                <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">
                  {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/billing-widget.js
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <strong>💡 Tip:</strong> Always use test API keys during development. Switch to live keys only when you&apos;re ready to go to production.
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-3 text-gray-600">Loading API keys...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              ) : (
                <>
                  {/* Live Public Key */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Live Public Key</h3>
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
                        onClick={() => copyToClipboard(apiKeys?.live || '', 'Live public key')}
                        disabled={!apiKeys?.live}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Use this key for widget integration and client-side code in production.
                    </p>
                  </div>

                  <Separator />

                  {/* Test Public Key */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Test Public Key</h3>
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
                        onClick={() => copyToClipboard(apiKeys?.test || '', 'Test public key')}
                        disabled={!apiKeys?.test}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Use this key for development and testing. No real charges will be made.
                    </p>
                  </div>
                </>
              )}

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

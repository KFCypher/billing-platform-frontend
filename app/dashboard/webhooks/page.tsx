'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { webhookApi, webhooksApi } from '@/lib/api-client';
import { Webhook, CheckCircle, XCircle, Loader2, Copy, Send, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function WebhooksPage() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const { data: webhookConfig, isLoading, refetch } = useQuery({
    queryKey: ['webhook-config'],
    queryFn: () => webhookApi.getConfig(),
  });

  const config = webhookConfig?.data;

  const handleSaveWebhook = async () => {
    setIsSaving(true);
    try {
      await webhookApi.setConfig(webhookUrl);
      toast.success('Webhook URL saved successfully!');
      refetch();
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'Failed to save webhook URL');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setIsTesting(true);
    try {
      await webhookApi.test({ event_type: 'test.webhook' });
      toast.success('Test webhook sent successfully!');
      refetchEvents();
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'Failed to send test webhook');
    } finally {
      setIsTesting(false);
    }
  };

  // Fetch webhook events
  const { data: eventsData, refetch: refetchEvents } = useQuery({
    queryKey: ['webhook-events'],
    queryFn: () => webhooksApi.getAll({ page_size: 10 }),
    enabled: !!config?.is_active,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure webhooks to receive real-time event notifications
        </p>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhook Endpoint
              </CardTitle>
              <CardDescription className="mt-2">
                Enter your endpoint URL to receive webhook events
              </CardDescription>
            </div>
            {config?.is_active ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="mr-1 h-3 w-3" />
                Inactive
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-domain.com/webhooks/billing"
                    value={webhookUrl || config?.url || ''}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <Button
                    onClick={handleSaveWebhook}
                    disabled={isSaving || !webhookUrl}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This URL will receive POST requests for all webhook events
                </p>
              </div>

              {config?.url && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Current Endpoint</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-mono">
                        {config.url}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(config.url);
                        toast.success('Webhook URL copied!');
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  {config.secret && (
                    <div className="space-y-2">
                      <Label>Signing Secret</Label>
                      <div className="flex gap-2">
                        <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                          {config.secret}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(config.secret);
                            toast.success('Secret copied!');
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Use this secret to verify webhook signatures
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleTestWebhook}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Test Event
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Webhook Events Card */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>
            These events will trigger webhook notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">subscription.created</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sent when a new subscription is created
                </p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">subscription.updated</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sent when a subscription is modified
                </p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">subscription.cancelled</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sent when a subscription is cancelled
                </p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">payment.succeeded</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sent when a payment is successful
                </p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">payment.failed</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sent when a payment fails
                </p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">customer.created</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sent when a new customer is created
                </p>
              </div>
              <Badge variant="outline">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Deliveries Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deliveries</CardTitle>
          <CardDescription>
            Webhook delivery history and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!config?.is_active ? (
            <div className="text-center py-12 text-gray-400">
              <Webhook className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Configure a webhook URL to see delivery history</p>
            </div>
          ) : !eventsData?.data?.results || eventsData.data.results.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Webhook className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No webhook deliveries yet</p>
              <p className="text-sm mt-2">
                Delivery history will appear here once events are triggered
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventsData.data.results.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{event.event_type}</p>
                      {event.status === 'sent' ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Success
                        </Badge>
                      ) : event.status === 'failed' ? (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="mr-1 h-3 w-3" />
                          {event.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(event.created_at).toLocaleString()}</span>
                      {event.response_code && <span>HTTP {event.response_code}</span>}
                      <span>{event.attempts} attempt(s)</span>
                    </div>
                  </div>
                  {event.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await webhooksApi.retry(event.id);
                          toast.success('Webhook retry queued');
                          refetchEvents();
                        } catch (error) {
                          toast.error('Failed to retry webhook');
                        }
                      }}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Info */}
      <Alert>
        <AlertDescription>
          <strong>🔒 Security Best Practice:</strong> Always verify webhook signatures using the signing secret to ensure requests are coming from our servers.
        </AlertDescription>
      </Alert>
    </div>
  );
}

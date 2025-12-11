'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, User, Calendar, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscriptions } from '@/lib/hooks/useSubscriptions';
import { Badge } from '@/components/ui/badge';

const statusColors = {
  active: 'bg-green-500',
  trialing: 'bg-blue-500',
  past_due: 'bg-yellow-500',
  canceled: 'bg-red-500',
  incomplete: 'bg-gray-500',
  incomplete_expired: 'bg-gray-500',
  unpaid: 'bg-orange-500',
};

const statusLabels = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Past Due',
  canceled: 'Cancelled',
  incomplete: 'Incomplete',
  incomplete_expired: 'Expired',
  unpaid: 'Unpaid',
};

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const statusFilter = activeTab === 'all' ? undefined : activeTab;
  const { data, isLoading, error } = useSubscriptions({ status: statusFilter, page_size: 20 });

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Loading subscriptions...</p>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Failed to load subscriptions. Please try again.</p>
          </CardContent>
        </Card>
      );
    }

    if (!data || !data.results || data.results.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
              <CreditCard className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No {activeTab !== 'all' ? activeTab : ''} subscriptions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Subscriptions will appear here once customers sign up
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {data.results.length} of {data.count} subscriptions
          </p>
        </div>

        <div className="grid gap-4">
          {data.results.map((subscription) => (
            <Card key={subscription.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                      <Badge 
                        className={statusColors[subscription.status]}
                      >
                        {statusLabels[subscription.status]}
                      </Badge>
                      {subscription.cancel_at_period_end && (
                        <Badge variant="outline" className="text-orange-600">
                          Cancels at period end
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{subscription.customer.full_name || 'No name'}</p>
                          <p className="text-xs">{subscription.customer.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <div>
                          <p className="font-medium">
                            {formatPrice(subscription.plan.price_cents, subscription.plan.currency)}
                          </p>
                          <p className="text-xs">/{subscription.plan.billing_interval}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Current Period</p>
                          <p className="text-xs">
                            {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                          </p>
                        </div>
                      </div>

                      {subscription.trial_end && subscription.status === 'trialing' && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <div>
                            <p className="font-medium">Trial Ends</p>
                            <p className="text-xs">{formatDate(subscription.trial_end)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {subscription.cancellation_reason && (
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <span className="font-medium">Cancellation reason:</span> {subscription.cancellation_reason}
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-500">
                      Platform Fee: {formatPrice(subscription.platform_fee_cents, subscription.plan.currency)} • 
                      Quantity: {subscription.quantity} • 
                      Created: {formatDate(subscription.created_at)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track and manage all customer subscriptions
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trialing">Trial</TabsTrigger>
          <TabsTrigger value="canceled">Cancelled</TabsTrigger>
          <TabsTrigger value="past_due">Past Due</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

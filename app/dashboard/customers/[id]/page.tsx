'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  CreditCard, 
  Package,
  MoreVertical,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// This would come from your API
const fetchCustomer = async (id: string) => {
  // Simulated API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id,
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    phone: '+1 (555) 123-4567',
    company: 'Acme Corp',
    address: {
      line1: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105',
      country: 'US',
    },
    subscription: {
      id: 'sub_123',
      plan_name: 'Professional',
      status: 'active',
      current_period_start: '2024-12-01T00:00:00Z',
      current_period_end: '2025-01-01T00:00:00Z',
      price: 49.99,
      interval: 'monthly',
    },
    payment_method: {
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      exp_month: 12,
      exp_year: 2025,
    },
    payments: [
      {
        id: 'pay_1',
        amount: 49.99,
        status: 'succeeded',
        created_at: '2024-12-01T00:00:00Z',
        description: 'Professional Plan - December 2024',
      },
      {
        id: 'pay_2',
        amount: 49.99,
        status: 'succeeded',
        created_at: '2024-11-01T00:00:00Z',
        description: 'Professional Plan - November 2024',
      },
      {
        id: 'pay_3',
        amount: 49.99,
        status: 'succeeded',
        created_at: '2024-10-01T00:00:00Z',
        description: 'Professional Plan - October 2024',
      },
    ],
    metrics: {
      lifetime_value: 299.94,
      total_payments: 6,
      failed_payments: 0,
      subscription_duration_months: 6,
    },
  };
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => fetchCustomer(customerId),
  });

  const handleCancelSubscription = () => {
    toast.success('Subscription cancelled successfully');
  };

  const handleChangePlan = () => {
    toast.info('Plan change functionality coming soon');
  };

  const handleDeleteCustomer = () => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      toast.success('Customer deleted successfully');
      router.push('/dashboard/customers');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      active: { variant: 'default', icon: CheckCircle2 },
      cancelled: { variant: 'secondary', icon: XCircle },
      past_due: { variant: 'destructive', icon: Clock },
      trialing: { variant: 'outline', icon: Clock },
    };

    const config = variants[status] || variants.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={12} />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      succeeded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
        <Button onClick={() => router.push('/dashboard/customers')} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/customers')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customer since {formatDate(customer.created_at)}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
              <Edit size={16} className="mr-2" />
              Edit Customer
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteCustomer} className="text-red-600">
              <Trash2 size={16} className="mr-2" />
              Delete Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(customer.metrics.lifetime_value)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.metrics.total_payments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.metrics.failed_payments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Subscription Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.metrics.subscription_duration_months} mo</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                  </div>
                </div>

                {customer.phone && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</p>
                    </div>
                  </div>
                )}

                {customer.company && (
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{customer.company}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {customer.address.line1}<br />
                      {customer.address.city}, {customer.address.state} {customer.address.postal_code}<br />
                      {customer.address.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{customer.payment_method.brand} •••• {customer.payment_method.last4}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expires {customer.payment_method.exp_month}/{customer.payment_method.exp_year}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Manage the customer's subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{customer.subscription.plan_name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(customer.subscription.price)}/{customer.subscription.interval}
                  </p>
                </div>
                {getStatusBadge(customer.subscription.status)}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Period</p>
                  <p className="text-sm mt-1">
                    {formatDate(customer.subscription.current_period_start)} - {formatDate(customer.subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Billing Date</p>
                  <p className="text-sm mt-1">{formatDate(customer.subscription.current_period_end)}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleChangePlan}>Change Plan</Button>
                <Button 
                  variant="outline" 
                  onClick={handleCancelSubscription}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payments from this customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customer.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(payment.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                      {getPaymentStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}

                {customer.payments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No payment history yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

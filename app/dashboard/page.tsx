'use client';

import { MetricCard } from '@/components/dashboard/metric-card';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Users, TrendingDown, AlertCircle, Plus, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';
import { useAnalyticsOverview, useRevenueAnalytics } from '@/lib/hooks/useAnalytics';
import { useSubscriptions } from '@/lib/hooks/useSubscriptions';
import { formatDistanceToNow } from 'date-fns';


export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  
  // Fetch analytics data
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriptions({ 
    page_size: 5
  });

  // Handle nested data structure from API response
  const metrics = overview?.data?.data || overview?.data || {};
  const recentSubs = subscriptions?.results || [];
  
  // Transform revenue data for chart
  const revenueChartData = (revenueData?.data?.time_series || []).map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: (item.mrr_cents || 0) / 100
  }));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', icon: React.ElementType }> = {
      active: { variant: 'default', icon: CheckCircle },
      trialing: { variant: 'secondary', icon: Clock },
      past_due: { variant: 'destructive', icon: AlertCircle },
      canceled: { variant: 'secondary', icon: XCircle },
    };

    const config = variants[status] || variants.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {user?.first_name || user?.email || 'User'}! Here&apos;s what&apos;s happening with your billing.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Monthly Recurring Revenue"
              value={metrics.mrr?.formatted || `$${((metrics.mrr?.cents || 0) / 100).toFixed(2)}`}
              change={{ value: Number(metrics.growth_rate || 0), isPositive: Number(metrics.growth_rate || 0) >= 0 }}
              icon={DollarSign}
            />
            <MetricCard
              title="Active Subscribers"
              value={Number(metrics.active_subscribers || 0).toString()}
              change={{ value: 0, isPositive: true }}
              icon={Users}
            />
            <MetricCard
              title="Churn Rate"
              value={`${Number(metrics.churn_rate || 0).toFixed(1)}%`}
              change={{ value: 0, isPositive: Number(metrics.churn_rate || 0) <= 5 }}
              icon={TrendingDown}
            />
            <MetricCard
              title="Failed Payments"
              value={Number(metrics.failed_payments || 0).toString()}
              icon={AlertCircle}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your monthly revenue for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <RevenueChart data={revenueChartData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Subscriptions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Subscriptions</CardTitle>
            <CardDescription>Latest subscription activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/subscriptions">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {subscriptionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentSubs.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No subscriptions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubs.map((sub: any) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {sub.customer_email || 'N/A'}
                    </TableCell>
                    <TableCell>{sub.plan_name}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>${(sub.amount_cents / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/plans/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Plan
              </Button>
            </Link>
            <Link href="/dashboard/customers">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                View Customers
              </Button>
            </Link>
            <Link href="/dashboard/developers">
              <Button variant="outline" className="w-full justify-start">
                <ArrowRight className="mr-2 h-4 w-4" />
                API Documentation
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Complete these steps to set up your billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium">Connect Stripe Account</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Link your Stripe account to start processing payments
                </p>
                <Link href="/dashboard/settings?tab=stripe">
                  <Button size="sm" variant="link" className="px-0">
                    Connect now →
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium">Create Your First Plan</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set up a subscription plan for your customers
                </p>
                <Link href="/plans/new">
                  <Button size="sm" variant="link" className="px-0">
                    Create plan →
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium">Integrate with Your App</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use our API to start accepting subscriptions
                </p>
                <Link href="/developers">
                  <Button size="sm" variant="link" className="px-0">
                    View docs →
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
          <CardDescription>Your latest subscription activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No subscriptions yet</p>
            <p className="text-sm mt-2">Subscriptions will appear here once customers start subscribing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { MetricCard } from '@/components/dashboard/metric-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, TrendingDown, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';


export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);

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
        <MetricCard
          title="Monthly Recurring Revenue"
          value="$0"
          change={{ value: 0, isPositive: true }}
          icon={DollarSign}
        />
        <MetricCard
          title="Active Subscribers"
          value="0"
          change={{ value: 0, isPositive: true }}
          icon={Users}
        />
        <MetricCard
          title="Churn Rate"
          value="0%"
          change={{ value: 0, isPositive: false }}
          icon={TrendingDown}
        />
        <MetricCard
          title="Failed Payments"
          value="0"
          icon={AlertCircle}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/plans/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create New Plan
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                View Customers
              </Button>
            </Link>
            <Link href="/developers">
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
                <Link href="/settings?tab=stripe">
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

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Insights and metrics for your billing performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-green-600 mt-1">+0% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-green-600 mt-1">+0% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-gray-600 mt-1">Month over month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Churn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly recurring revenue (MRR) trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No revenue data available yet</p>
                  <p className="text-sm mt-2">Charts will appear once you have active subscriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>Distribution across subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px] text-gray-400">
                  <p className="text-sm">No data available</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Success Rate</CardTitle>
                <CardDescription>Successful vs failed payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[200px] text-gray-400">
                  <p className="text-sm">No data available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Growth</CardTitle>
              <CardDescription>New customers over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No customer data available yet</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value</CardTitle>
                <CardDescription>Average LTV per customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$0.00</div>
                <p className="text-sm text-gray-600 mt-2">No data yet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Revenue Per User</CardTitle>
                <CardDescription>ARPU</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$0.00</div>
                <p className="text-sm text-gray-600 mt-2">No data yet</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Popularity</CardTitle>
              <CardDescription>Number of subscribers per plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No subscription data available yet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Analysis</CardTitle>
              <CardDescription>Customer retention by signup month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>Cohort data will be available soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

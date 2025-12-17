'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Users, DollarSign, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { 
  useAnalyticsOverview, 
  useRevenueAnalytics, 
  useCustomerAnalytics,
  usePlanAnalytics 
} from '@/lib/hooks/useAnalytics';

const cohortData = [
  { cohort: 'Jan 2024', month1: 100, month2: 85, month3: 78, month4: 72, month5: 68, month6: 65 },
  { cohort: 'Feb 2024', month1: 100, month2: 88, month3: 82, month4: 76, month5: 71 },
  { cohort: 'Mar 2024', month1: 100, month2: 90, month3: 84, month4: 79 },
  { cohort: 'Apr 2024', month1: 100, month2: 87, month3: 81 },
  { cohort: 'May 2024', month1: 100, month2: 92 },
  { cohort: 'Jun 2024', month1: 100 },
];

export default function AnalyticsPage() {
  // Fetch real analytics data
  const { data: overview, isLoading: overviewLoading } = useAnalyticsOverview();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics();
  const { data: customerData, isLoading: customerLoading } = useCustomerAnalytics();
  const { data: planData, isLoading: planLoading } = usePlanAnalytics();

  const metrics = overview?.data || {};
  const isLoading = overviewLoading || revenueLoading || customerLoading || planLoading;
  
  // Transform revenue data for chart - last 30 days only
  const revenueChartData = (revenueData?.data?.time_series || [])
    .slice(-30) // Only last 30 days
    .map((item: { date: string; mrr_cents?: number }) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mrr: (item.mrr_cents || 0) / 100,
      arr: ((item.mrr_cents || 0) / 100) * 12
    }));
  
  // Transform customer data for chart - last 30 days only
  const customerGrowthChartData = (customerData?.data?.growth_data || [])
    .slice(-30) // Only last 30 days
    .map((item: { date: string; new_customers?: number; churned_customers?: number }) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      new: item.new_customers || 0,
      churned: item.churned_customers || 0
    }));
  
  // Transform plan data for chart
  const planPerformanceChartData = (planData?.data?.plan_breakdown || []).map((item: { plan_name: string; subscriber_count?: number; mrr_cents?: number }, index: number) => ({
    plan_name: item.plan_name,
    name: item.plan_name,
    subscribers: item.subscriber_count || 0,
    revenue: (item.mrr_cents || 0) / 100,
    color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5],
    fill: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]
  }));
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  const formatCurrency = (value: number) => {
    return `GH₵${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

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
            <div className="text-2xl font-bold">
              {metrics.mrr?.formatted || `GH₵${((metrics.mrr?.cents || 0) / 100).toFixed(2)}`}
            </div>
            <p className={`text-xs mt-1 flex items-center gap-1 ${(metrics.growth_rate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(metrics.growth_rate || 0) >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(metrics.growth_rate || 0).toFixed(1)}% from last month
            </p>
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
            <div className="text-2xl font-bold">{metrics.active_customers || 0}</div>
            <p className={`text-xs mt-1 flex items-center gap-1 ${(customerData?.data?.new_customers_this_month || 0) >= 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {(customerData?.data?.new_customers_this_month || 0) >= 0 && <ArrowUp size={12} />}
              +{customerData?.data?.new_customers_this_month || 0} from last month
            </p>
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
            <div className="text-2xl font-bold">{(metrics.growth_rate || 0).toFixed(1)}%</div>
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
            <div className="text-2xl font-bold">{(metrics.churn_rate || 0).toFixed(1)}%</div>
            <p className={`text-xs mt-1 flex items-center gap-1 ${(metrics.churn_rate || 0) > 5 ? 'text-red-600' : 'text-green-600'}`}>
              <ArrowDown size={12} />
              -1.2% from last month
            </p>
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
              <CardDescription>Monthly recurring revenue (MRR) and annual recurring revenue (ARR) trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    stroke="#888888"
                  />
                  <YAxis 
                    className="text-xs"
                    stroke="#888888"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="mrr" 
                    name="MRR"
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="arr" 
                    name="ARR"
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Current month revenue by plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={planPerformanceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {planPerformanceChartData.map((entry: { plan_name: string; subscriptions: number; revenue: number; fill: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
                <CardDescription>Key revenue indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">ARR</span>
                    <span className="text-sm font-medium">
                      {metrics.arr?.formatted || `GH₵${((metrics.arr?.cents || 0) / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">ARPU</span>
                    <span className="text-sm font-medium">
                      {metrics.arpu?.formatted || `GH₵${((metrics.arpu?.cents || 0) / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '65%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">LTV</span>
                    <span className="text-sm font-medium">
                      {metrics.ltv?.formatted || `GH₵${((metrics.ltv?.cents || 0) / 100).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: '75%' }} />
                  </div>
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
              <CardDescription>New customers vs churned customers over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={customerGrowthChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    stroke="#888888"
                  />
                  <YAxis 
                    className="text-xs"
                    stroke="#888888"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="new" name="New Customers" fill="#10b981" />
                  <Bar dataKey="churned" name="Churned" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.active_customers || 0}</div>
                <p className="text-xs text-green-600 mt-1">+{customerData?.data?.new_customers_this_month || 0} this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">New This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerData?.data?.new_customers_this_month || 0}</div>
                <p className="text-xs text-gray-600 mt-1">Growth trend</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Churned This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customerData?.data?.churned_customers_this_month || 0}</div>
                <p className="text-xs text-gray-600 mt-1">{(metrics.churn_rate || 0).toFixed(1)}% churn rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Performance</CardTitle>
              <CardDescription>Subscriber count and revenue by plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {planPerformanceChartData.map((plan) => (
                  <div key={plan.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: plan.color }}
                        />
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(plan.revenue)}</p>
                        <p className="text-sm text-gray-600">{plan.subscribers} subscribers</p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all" 
                        style={{ 
                          width: `${(metrics.active_customers && plan.subscribers) ? (plan.subscribers / (metrics.active_customers || 1)) * 100 : 0}%`,
                          backgroundColor: plan.color
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Percentage of customers on each plan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={planPerformanceChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="subscribers"
                    >
                      {planPerformanceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Metrics</CardTitle>
                <CardDescription>Average metrics per plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {planPerformanceChartData.map((plan: { plan_name: string; subscriptions: number; revenue: number; fill: string }) => {
                  const avgRevenue = plan.subscribers > 0 ? plan.revenue / plan.subscribers : 0;
                  return (
                    <div key={plan.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">{plan.name} ARPU</span>
                        <span className="text-sm font-medium">{formatCurrency(avgRevenue)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all" 
                          style={{ 
                            width: `${avgRevenue > 0 ? Math.min((avgRevenue / 200) * 100, 100) : 0}%`,
                            backgroundColor: plan.color
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Matrix</CardTitle>
              <CardDescription>Customer retention rates by signup cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium">Cohort</th>
                      <th className="text-center py-2 px-3 font-medium">Month 1</th>
                      <th className="text-center py-2 px-3 font-medium">Month 2</th>
                      <th className="text-center py-2 px-3 font-medium">Month 3</th>
                      <th className="text-center py-2 px-3 font-medium">Month 4</th>
                      <th className="text-center py-2 px-3 font-medium">Month 5</th>
                      <th className="text-center py-2 px-3 font-medium">Month 6</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort) => (
                      <tr key={cohort.cohort} className="border-b">
                        <td className="py-2 px-3 font-medium">{cohort.cohort}</td>
                        {[cohort.month1, cohort.month2, cohort.month3, cohort.month4, cohort.month5, cohort.month6].map((value, idx) => {
                          if (!value) return <td key={idx} className="py-2 px-3 text-center text-gray-400">-</td>;
                          
                          const bgColor = 
                            value >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            value >= 80 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            value >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
                          
                          return (
                            <td key={idx} className="py-2 px-3 text-center">
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${bgColor}`}>
                                {value}%
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">30-Day Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">88%</div>
                <p className="text-xs text-green-600 mt-1">+2% from last cohort</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">90-Day Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-green-600 mt-1">+1% from last cohort</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">180-Day Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72%</div>
                <p className="text-xs text-gray-600 mt-1">Stable</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

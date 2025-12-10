'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data?: Array<{ date: string; revenue: number }>;
  height?: number;
}

export function RevenueChart({ data = [], height = 300 }: RevenueChartProps) {
  // Sample data if none provided
  const chartData = data.length > 0 ? data : [
    { date: 'Jan 1', revenue: 1200 },
    { date: 'Jan 8', revenue: 1800 },
    { date: 'Jan 15', revenue: 2200 },
    { date: 'Jan 22', revenue: 2800 },
    { date: 'Jan 29', revenue: 3200 },
    { date: 'Feb 5', revenue: 3800 },
    { date: 'Feb 12', revenue: 4200 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              stroke="#888888"
            />
            <YAxis 
              className="text-xs"
              stroke="#888888"
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`$${value}`, 'Revenue']}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

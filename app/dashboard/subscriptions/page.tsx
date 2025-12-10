'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track and manage all customer subscriptions
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by customer or plan..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trial">Trial</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
                <CreditCard className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Active subscriptions will appear here once customers sign up
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              No active subscriptions
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial">
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              No trial subscriptions
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              No cancelled subscriptions
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              No expired subscriptions
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

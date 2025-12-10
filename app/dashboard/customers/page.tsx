'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users as UsersIcon } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your customer base and subscriptions
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
            <UsersIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Customers will appear here once they subscribe to your plans
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Customer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

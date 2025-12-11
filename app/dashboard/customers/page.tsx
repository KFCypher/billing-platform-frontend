'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users as UsersIcon, Mail, Phone, MapPin } from 'lucide-react';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateCustomerDialog } from '@/components/dashboard/CreateCustomerDialog';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useCustomers({ search, page_size: 20 });

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
        <CreateCustomerDialog />
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Loading customers...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Failed to load customers. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data || !data.results || data.results.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
              <UsersIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Customers will appear here once they subscribe to your plans
            </p>
            <CreateCustomerDialog />
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      {!isLoading && !error && data && data.results && data.results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {data.results.length} of {data.count} customers
            </p>
          </div>

          <div className="grid gap-4">
            {data.results.map((customer) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {customer.full_name || 'No name'}
                        </h3>
                        <Badge variant="outline">
                          {customer.stripe_customer_id ? 'Synced' : 'Local'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                          </div>
                        )}
                        {(customer.city || customer.country) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {[customer.city, customer.country].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>

                      {(customer.utm_source || customer.utm_medium) && (
                        <div className="mt-3 flex gap-2">
                          {customer.utm_source && (
                            <Badge variant="secondary" className="text-xs">
                              Source: {customer.utm_source}
                            </Badge>
                          )}
                          {customer.utm_medium && (
                            <Badge variant="secondary" className="text-xs">
                              Medium: {customer.utm_medium}
                            </Badge>
                          )}
                        </div>
                      )}
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
      )}
    </div>
  );
}

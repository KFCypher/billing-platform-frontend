'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet, Search, Download, Filter, CreditCard, Smartphone, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type PaymentProvider = 'all' | 'stripe' | 'momo';
type MoMoProvider = 'all' | 'mtn' | 'vodafone' | 'airteltigo';

export default function PaymentsPage() {
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('all');
  const [momoProvider, setMoMoProvider] = useState<MoMoProvider>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const clearFilters = () => {
    setPaymentProvider('all');
    setMoMoProvider('all');
    setSearchQuery('');
  };

  const hasActiveFilters = paymentProvider !== 'all' || momoProvider !== 'all' || searchQuery !== '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track all payment transactions and history
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-gray-600 mt-1">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Successful Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-gray-600 mt-1">This month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <p className="text-xs text-gray-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by customer, amount, phone, or ID..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {[paymentProvider !== 'all', momoProvider !== 'all', searchQuery !== ''].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    Filters
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 px-2"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                    )}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">

                  <div className="space-y-2">
                    <Label>Payment Provider</Label>
                    <Select value={paymentProvider} onValueChange={(v) => setPaymentProvider(v as PaymentProvider)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        <SelectItem value="stripe">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Stripe
                          </div>
                        </SelectItem>
                        <SelectItem value="momo">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Mobile Money
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentProvider === 'momo' && (
                    <div className="space-y-2">
                      <Label>Mobile Money Provider</Label>
                      <Select value={momoProvider} onValueChange={(v) => setMoMoProvider(v as MoMoProvider)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Providers</SelectItem>
                          <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                          <SelectItem value="vodafone">Vodafone Cash</SelectItem>
                          <SelectItem value="airteltigo">AirtelTigo Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {paymentProvider !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Provider: {paymentProvider === 'stripe' ? 'Stripe' : 'Mobile Money'}
                  <button
                    onClick={() => setPaymentProvider('all')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {momoProvider !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  MoMo: {momoProvider.toUpperCase()}
                  <button
                    onClick={() => setMoMoProvider('all')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Payments</TabsTrigger>
          <TabsTrigger value="succeeded">Succeeded</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="refunded">Refunded</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
                <Wallet className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Payment transactions will appear here once customers start subscribing
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="succeeded">
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              No successful payments yet
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed">
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              No failed payments
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunded">
          <Card>
            <CardContent className="py-12 text-center text-gray-600">
              No refunded payments
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

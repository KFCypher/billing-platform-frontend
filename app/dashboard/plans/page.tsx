'use client';


import { useQuery } from '@tanstack/react-query';
import { planApi } from '@/lib/api-client';
import { Plan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Copy, Archive, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';


export default function PlansPage() {

  const { data: plansResponse, isLoading, refetch } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planApi.list(),
  });

  const plans = Array.isArray(plansResponse?.data) 
    ? plansResponse.data 
    : Array.isArray(plansResponse?.data?.results) 
    ? plansResponse.data.results 
    : [];

  const handleDuplicate = async (planId: number, planName: string) => {
    try {
      const newName = `${planName} (Copy)`;
      await planApi.duplicate(planId, { name: newName, price_cents: 0 });
      toast.success('Plan duplicated successfully');
      refetch();
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'Failed to duplicate plan');
    }
  };

  const handleDeactivate = async (planId: number) => {
    try {
      await planApi.deactivate(planId);
      toast.success('Plan deactivated successfully');
      refetch();
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      toast.error(axiosError.response?.data?.error || 'Failed to deactivate plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your subscription plans and pricing
          </p>
        </div>
        <Link href="/plans/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </Button>
        </Link>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No plans yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Get started by creating your first subscription plan
            </p>
            <Link href="/plans/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Plan
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: Plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {plan.name}
                      {!plan.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {plan.is_featured && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {plan.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">
                      ${plan.price}
                      <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                        /{plan.billing_period}
                      </span>
                    </div>
                    {plan.trial_period_days && plan.trial_period_days > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {plan.trial_period_days} day free trial
                      </p>
                    )}
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      {plan.features.slice(0, 3).map((feature: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          +{plan.features.length - 3} more features
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/plans/${plan.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(plan.id, plan.name)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {plan.is_active ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivate(plan.id)}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

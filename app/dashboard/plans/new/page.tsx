'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { planApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const planSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Price must be a valid positive number',
  }),
  billing_period: z.enum(['monthly', 'yearly']),
  trial_period_days: z.string().optional(),
  features: z.array(z.object({ value: z.string() })).optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function NewPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      billing_period: 'monthly' as const,
      features: [],
      is_active: true,
      is_featured: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  });

  const onSubmit = async (data: PlanFormData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price_cents: Math.round(Number(data.price) * 100),
        currency: 'USD',
        billing_interval: data.billing_period === 'monthly' ? 'month' as const : 'year' as const,
        trial_days: data.trial_period_days ? Number(data.trial_period_days) : undefined,
        features_json: data.features?.map((f: { value: string }) => f.value).filter(Boolean) || [],
        is_visible: data.is_active,
      };

      await planApi.create(payload);
      toast.success('Plan created successfully!');
      router.push('/dashboard/plans');
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
      const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || 'Failed to create plan';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/plans">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Plan</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Set up a new subscription plan for your customers
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>
              Configure the basic information for your subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Professional Plan"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what's included in this plan..."
                rows={3}
                {...register('description')}
                disabled={isLoading}
              />
            </div>

            <Separator />

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="29.99"
                  {...register('price')}
                  disabled={isLoading}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_period">Billing Period *</Label>
                <Select
                  value={watch('billing_period')}
                  onValueChange={(value) => setValue('billing_period', value as 'monthly' | 'yearly')}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trial Period */}
            <div className="space-y-2">
              <Label htmlFor="trial_period_days">Trial Period (Days)</Label>
              <Input
                id="trial_period_days"
                type="number"
                placeholder="14"
                {...register('trial_period_days')}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leave empty for no trial period
              </p>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ value: '' })}
                  disabled={isLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>

              {fields.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No features added yet. Click &quot;Add Feature&quot; to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder="e.g., Unlimited users"
                        {...register(`features.${index}.value`)}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Status Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Make this plan available for subscription
                  </p>
                </div>
                <input
                  id="is_active"
                  type="checkbox"
                  {...register('is_active')}
                  disabled={isLoading}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_featured">Featured</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Highlight this plan as recommended
                  </p>
                </div>
                <input
                  id="is_featured"
                  type="checkbox"
                  {...register('is_featured')}
                  disabled={isLoading}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Plan'
            )}
          </Button>
          <Link href="/dashboard/plans">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

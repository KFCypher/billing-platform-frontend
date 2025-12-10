'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PlanCardProps {
  id?: string;
  name: string;
  description?: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features?: PlanFeature[];
  isPopular?: boolean;
  subscriberCount?: number;
  onSelect?: (planId: string) => void;
}

export function PlanCard({
  id = '',
  name,
  description,
  price,
  interval,
  features = [],
  isPopular = false,
  subscriberCount = 0,
  onSelect,
}: PlanCardProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-500">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>{name}</span>
          {subscriberCount > 0 && (
            <Badge variant="outline" className="font-normal">
              {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
            </Badge>
          )}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{formatPrice(price)}</span>
            <span className="text-gray-600 dark:text-gray-400">
              /{interval === 'monthly' ? 'mo' : 'yr'}
            </span>
          </div>
          {interval === 'yearly' && (
            <p className="text-sm text-green-600 mt-1">
              Save {formatPrice(price * 12 * 0.2)} per year
            </p>
          )}
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check 
                  className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    feature.included 
                      ? 'text-green-600' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`} 
                />
                <span className={`text-sm ${
                  feature.included 
                    ? 'text-gray-900 dark:text-gray-100' 
                    : 'text-gray-500 line-through'
                }`}>
                  {feature.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        {onSelect && (
          <Button 
            className="w-full" 
            variant={isPopular ? 'default' : 'outline'}
            onClick={() => onSelect(id)}
          >
            Select Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

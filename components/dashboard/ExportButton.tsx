import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { analyticsApi } from '@/lib/api-client';

interface ExportButtonProps {
  type: 'customers' | 'subscriptions' | 'metrics';
  startDate?: string;
  endDate?: string;
  disabled?: boolean;
}

export function ExportButton({ type, startDate, endDate, disabled }: ExportButtonProps) {
  const handleExport = async () => {
    try {
      const params = {
        start_date: startDate,
        end_date: endDate,
        format: 'csv',
      };

      let response;
      let filename;

      switch (type) {
        case 'customers':
          response = await analyticsApi.exportCustomers(params);
          filename = `customers-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'subscriptions':
          response = await analyticsApi.exportSubscriptions(params);
          filename = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'metrics':
          response = await analyticsApi.exportMetrics(params);
          filename = `metrics-${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          throw new Error('Invalid export type');
      }

      // Create blob from response
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${type} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${type}`);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled}
    >
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  );
}

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, RefreshCw, Database } from 'lucide-react';
import { useScrapeListings, useTestNotification } from '../hooks/useListings';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

export const DevTools: React.FC = () => {
  const [zipCode, setZipCode] = useState('');
  const { toast } = useToast();
  
  const scrapeMutation = useScrapeListings();
  const testNotificationMutation = useTestNotification();
  const { permission, sendTestNotification } = usePushNotifications();

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode.trim()) {
      toast({
        title: "ZIP Code Required",
        description: "Please enter a ZIP code to scrape",
        variant: "destructive"
      });
      return;
    }

    try {
      await scrapeMutation.mutateAsync({
        zipCode: zipCode.trim(),
        sources: ['zillow', 'foreclosure']
      });
      
      toast({
        title: "🔍 LEO Started Scraping",
        description: `Scraping properties in ${zipCode}. Check back in a few minutes for results.`,
      });
    } catch (error) {
      toast({
        title: "Scrape Failed",
        description: "Could not start scraping job. Check if the backend is running.",
        variant: "destructive"
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast({
        title: "🔔 Test Notification Sent",
        description: "Check for the notification in your system",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Could not send test notification",
        variant: "destructive"
      });
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Card className="mt-8 border-dashed border-orange-300 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
          <Database className="w-4 h-4" />
          LEO Developer Tools
          <Badge variant="secondary" className="text-xs">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scraping Controls */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Test Property Scraping
          </label>
          <form onSubmit={handleScrape} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter ZIP code (e.g., 90210)"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="sm" 
              disabled={scrapeMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {scrapeMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-600 mt-1">
            This will trigger LEO to scrape properties in the specified ZIP code
          </p>
        </div>

        {/* Notification Testing */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Test Push Notifications
          </label>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleTestNotification}
              size="sm"
              variant="outline"
              disabled={permission !== 'granted'}
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Test
            </Button>
            <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
              {permission === 'granted' ? 'Notifications Enabled' : 'Notifications Disabled'}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Send a test notification to verify Firebase integration
          </p>
        </div>

        {/* API Status */}
        <div className="pt-2 border-t border-orange-200">
          <p className="text-xs text-orange-700">
            <strong>Backend API:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
          </p>
          <p className="text-xs text-orange-700">
            Make sure the backend server is running on port 8000
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
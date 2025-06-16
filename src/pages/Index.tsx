
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ListingCard } from '../components/ListingCard';
import { EmailDraftModal } from '../components/EmailDraftModal';
import { generateMockListings } from '../utils/mockData';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Listing } from '../types/listing';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    sendNewListingNotification 
  } = usePushNotifications();

  useEffect(() => {
    // Load initial listings
    const mockListings = generateMockListings();
    setListings(mockListings);
    
    // Simulate real-time updates (in production, this would be WebSocket or polling)
    const interval = setInterval(() => {
      console.log('Checking for new listings...');
      // In production, this would fetch new listings from your backend
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEmailDraft = (listing: Listing) => {
    setSelectedListing(listing);
    setIsEmailModalOpen(true);
  };

  const handleNotificationSetup = async () => {
    if (permission === 'granted') {
      toast({
        title: "Notifications Active",
        description: "You'll be notified of new matching listings",
      });
    } else {
      const granted = await requestPermission();
      if (granted) {
        toast({
          title: "Notifications Enabled!",
          description: "You'll now receive alerts for new matching listings",
        });
        
        // Send a test notification
        setTimeout(() => {
          sendNewListingNotification("1234 Test Street, Test City", 85);
        }, 2000);
      } else {
        toast({
          title: "Notifications Blocked",
          description: "Enable notifications in your browser settings to stay updated",
          variant: "destructive"
        });
      }
    }
  };

  const matchedListings = listings.filter(listing => listing.match_score >= 40);
  const highMatchListings = listings.filter(listing => listing.match_score >= 60);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        totalListings={listings.length} 
        matchedListings={matchedListings.length}
      />
      
      <HeroSection />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* Notification Setup */}
        {isSupported && permission !== 'granted' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-1">Stay Updated</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Get instant notifications when new matching properties are found.
                </p>
                <Button 
                  onClick={handleNotificationSetup}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Enable Notifications
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* High Priority Matches */}
        {highMatchListings.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900">🎯 Top Matches</h2>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                {highMatchListings.length} urgent
              </span>
            </div>
            <div className="space-y-4">
              {highMatchListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onEmailDraft={handleEmailDraft}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Matches */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📋 All Opportunities ({matchedListings.length})
          </h2>
          <div className="space-y-4">
            {matchedListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEmailDraft={handleEmailDraft}
              />
            ))}
          </div>
        </section>

        {matchedListings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Home className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 text-sm">
              We're actively scanning for new listings that match your criteria. 
              Check back soon or enable notifications to stay updated.
            </p>
          </div>
        )}

        {/* Notification Status */}
        {isSupported && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {permission === 'granted' ? (
                <>
                  <Bell className="w-4 h-4 text-green-600" />
                  <span>Notifications enabled - you'll be alerted to new matches</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-gray-400" />
                  <span>Enable notifications to never miss a match</span>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <EmailDraftModal
        listing={selectedListing}
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedListing(null);
        }}
      />
    </div>
  );
};

export default Index;

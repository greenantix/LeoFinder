
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmailDraftModal } from '../components/EmailDraftModal';
import { LeoMissionBriefing } from '../components/LeoMissionBriefing';
import { DevTools } from '../components/DevTools';
import { useGetListings, useLogOutreach } from '../hooks/useListings';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Listing } from '../types/listing';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Home, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch listings from API
  const { data: listings = [], isLoading, isError, refetch } = useGetListings({
    limit: 50,
    minScore: 40 // Only show qualified opportunities
  });
  
  // API mutations
  const logOutreachMutation = useLogOutreach();
  
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    sendNewListingNotification 
  } = usePushNotifications();

  const handleEmailDraft = (listing: Listing) => {
    setSelectedListing(listing);
    setIsEmailModalOpen(true);
  };

  const handleContact = async (listing: Listing, method: 'email' | 'phone' | 'visit') => {
    switch (method) {
      case 'email':
        const emailContent = listing.emailTemplate || listing.emailDraft || '';
        const recipientEmail = listing.contactEmail || listing.contact_info?.email;
        
        if (!recipientEmail) {
          toast({
            title: "No Email Available",
            description: "LEO suggests visiting the original listing to contact seller",
            variant: "destructive"
          });
          return;
        }

        const subject = encodeURIComponent(`Interested in ${listing.address}`);
        const body = encodeURIComponent(emailContent);
        
        // Log outreach using API
        logOutreachMutation.mutate({
          listingId: listing.id,
          method: 'email',
          content: `Email sent to: ${recipientEmail}\n\n${emailContent}`,
          wasSent: true
        });
        
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        
        toast({
          title: "LEO's Email Opened",
          description: "Mail app opened with pre-filled message",
        });
        break;

      case 'phone':
        const phone = listing.contact_info?.phone;
        if (!phone) return;
        
        // Log outreach using API
        logOutreachMutation.mutate({
          listingId: listing.id,
          method: 'phone',
          content: `Phone copied: ${phone}`,
          wasSent: true
        });
        
        navigator.clipboard.writeText(phone);
        toast({
          title: "Phone Copied",
          description: "Phone number copied to clipboard",
        });
        break;

      case 'visit':
        // Log outreach using API
        logOutreachMutation.mutate({
          listingId: listing.id,
          method: 'email', // Use email as closest match for visit tracking
          content: `Visited original listing: ${listing.url}`,
          wasSent: true
        });
        
        window.open(listing.url, '_blank');
        break;
    }
  };

  const handleNotificationSetup = async () => {
    if (permission === 'granted') {
      toast({
        title: "LEO's Notifications Active",
        description: "You'll be notified of new matching opportunities",
      });
    } else {
      const granted = await requestPermission();
      if (granted) {
        toast({
          title: "LEO's Alerts Enabled!",
          description: "You'll now receive alerts for new opportunities",
        });
        
        setTimeout(() => {
          sendNewListingNotification("1234 Test Street, Test City", 85);
        }, 2000);
      } else {
        toast({
          title: "Notifications Blocked",
          description: "Enable notifications to let LEO alert you of opportunities",
          variant: "destructive"
        });
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">LEO is scanning for opportunities...</h2>
          <p className="text-gray-600">This may take a moment while LEO analyzes properties</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-400 mb-4">
            <Home className="w-16 h-16 mx-auto mb-4" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">LEO Can't Connect</h2>
          <p className="text-gray-600 mb-4">
            LEO can't reach the server right now. Make sure the backend is running on port 8000.
          </p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Filter active listings and calculate stats
  const activeListings = listings.filter(listing => {
    if (!listing.expiresAt) return true;
    return new Date(listing.expiresAt) >= new Date();
  });

  // All listings returned are already qualified (minScore: 40)
  const qualifiedOpportunities = activeListings;
  const highValueOpportunities = activeListings.filter(listing => listing.match_score >= 60);
  const topMatchScore = Math.max(...qualifiedOpportunities.map(l => l.match_score), 0);
  
  const newOpportunitiesToday = qualifiedOpportunities.filter(listing => {
    const listingDate = new Date(listing.listing_date);
    const today = new Date();
    return listingDate.toDateString() === today.toDateString();
  }).length;

  // Calculate emails sent today from outreach data (this would need to be enhanced with API call)
  const emailsSentToday = 0; // TODO: Add API endpoint for today's outreach count

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        totalListings={activeListings.length} 
        matchedListings={qualifiedOpportunities.length}
      />
      
      <HeroSection />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {/* LEO Mission Briefing */}
        <LeoMissionBriefing 
          newLeadsCount={newOpportunitiesToday}
          emailsSentToday={emailsSentToday}
          highMatchCount={highValueOpportunities.length}
          topMatchScore={topMatchScore > 0 ? topMatchScore : undefined}
        />

        {/* Notification Setup */}
        {isSupported && permission !== 'granted' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-1">Let LEO Alert You</h3>
                <p className="text-sm text-yellow-700 mb-3">
                  Get instant notifications when LEO finds new opportunities.
                </p>
                <Button 
                  onClick={handleNotificationSetup}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Enable LEO Alerts
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* High-Value Opportunities */}
        {highValueOpportunities.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900">🎯 LEO's Top Picks</h2>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                {highValueOpportunities.length} urgent
              </span>
            </div>
            <div className="space-y-4">
              {highValueOpportunities.map(listing => (
                <OpportunityCard
                  key={listing.id}
                  listing={listing}
                  onEmailDraft={handleEmailDraft}
                  onContact={handleContact}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Qualified Opportunities */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            📋 All Opportunities ({qualifiedOpportunities.length})
          </h2>
          <div className="space-y-4">
            {qualifiedOpportunities.map(listing => (
              <OpportunityCard
                key={listing.id}
                listing={listing}
                onEmailDraft={handleEmailDraft}
                onContact={handleContact}
              />
            ))}
          </div>
        </section>

        {qualifiedOpportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Home className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">LEO is hunting...</h3>
            <p className="text-gray-600 text-sm">
              No qualified opportunities yet, but LEO is actively scanning for new listings. 
              Check back soon or enable notifications to stay updated.
            </p>
          </div>
        )}

        {/* LEO Status */}
        {isSupported && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {permission === 'granted' ? (
                <>
                  <Bell className="w-4 h-4 text-green-600" />
                  <span>LEO alerts active - you'll be notified of new opportunities</span>
                </>
              ) : (
                <>
                  <BellOff className="w-4 h-4 text-gray-400" />
                  <span>Enable notifications to let LEO alert you of opportunities</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Developer Tools */}
        <DevTools />
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

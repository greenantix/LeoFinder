
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmailDraftModal } from '../components/EmailDraftModal';
import { LeoMissionBriefing } from '../components/LeoMissionBriefing';
import { generateMockListings } from '../utils/mockData';
import { getTodayEmailCount, logOutreach } from '../utils/outreachLogger';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Listing } from '../types/listing';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailsSentToday, setEmailsSentToday] = useState(0);
  const { toast } = useToast();
  
  const { 
    permission, 
    isSupported, 
    requestPermission, 
    sendNewListingNotification 
  } = usePushNotifications();

  useEffect(() => {
    const mockListings = generateMockListings();
    setListings(mockListings);
    setEmailsSentToday(getTodayEmailCount());
    
    const interval = setInterval(() => {
      console.log('LEO is checking for new listings...');
      setEmailsSentToday(getTodayEmailCount());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
        
        await logOutreach(listing.id, `Email sent to: ${recipientEmail}\n\n${emailContent}`, 'email');
        window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        
        toast({
          title: "LEO's Email Opened",
          description: "Mail app opened with pre-filled message",
        });
        break;

      case 'phone':
        const phone = listing.contact_info?.phone;
        if (!phone) return;
        
        await logOutreach(listing.id, `Phone copied: ${phone}`, 'phone');
        navigator.clipboard.writeText(phone);
        toast({
          title: "Phone Copied",
          description: "Phone number copied to clipboard",
        });
        break;

      case 'visit':
        await logOutreach(listing.id, `Visited original listing: ${listing.url}`, 'visit');
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

  // Filter active listings and calculate stats
  const activeListings = listings.filter(listing => {
    if (!listing.expiresAt) return true;
    return new Date(listing.expiresAt) >= new Date();
  });

  const qualifiedOpportunities = activeListings.filter(listing => listing.match_score >= 40);
  const highValueOpportunities = activeListings.filter(listing => listing.match_score >= 60);
  const topMatchScore = Math.max(...qualifiedOpportunities.map(l => l.match_score), 0);
  
  const newOpportunitiesToday = qualifiedOpportunities.filter(listing => {
    const listingDate = new Date(listing.listing_date);
    const today = new Date();
    return listingDate.toDateString() === today.toDateString();
  }).length;

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

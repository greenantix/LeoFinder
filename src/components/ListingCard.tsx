
import React, { useState } from 'react';
import { Listing } from '../types/listing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, Home, Calendar, Mail, Phone, ExternalLink, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClaudeInsights } from './ClaudeInsights';
import { useLogOutreach } from '@/hooks/useListings';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ListingCardProps {
  listing: Listing;
  onEmailDraft: (listing: Listing) => void;
  onReAnalyze?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onEmailDraft, onReAnalyze }) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const logOutreachMutation = useLogOutreach();

  // Check if listing is expired (older than 7 days)
  const isExpired = () => {
    if (!listing.expiresAt) return false;
    return new Date(listing.expiresAt) < new Date();
  };

  const getFlagBadges = () => {
    const badges = [];
    if (listing.flags.va_eligible) badges.push({ text: 'VA Eligible', variant: 'default' as const });
    if (listing.flags.owner_finance) badges.push({ text: 'Owner Finance', variant: 'secondary' as const });
    if (listing.flags.lease_to_own) badges.push({ text: 'Lease to Own', variant: 'outline' as const });
    if (listing.flags.contract_for_deed) badges.push({ text: 'Contract for Deed', variant: 'destructive' as const });
    if (listing.flags.no_credit_check) badges.push({ text: 'No Credit Check', variant: 'secondary' as const });
    if (listing.flags.usda_eligible) badges.push({ text: 'USDA Eligible', variant: 'outline' as const });
    
    return badges;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const sendMessage = async () => {
    const emailContent = listing.emailTemplate || listing.emailDraft || '';
    const recipientEmail = listing.contactEmail || listing.contact_info?.email;
    
    if (!recipientEmail) {
      toast({
        title: "No Email Available",
        description: "Visit original listing to contact seller",
        variant: "destructive"
      });
      return;
    }

    const subject = encodeURIComponent(`Interested in ${listing.address}`);
    const body = encodeURIComponent(emailContent);
    
    // Log the outreach with method
    logOutreachMutation.mutate({
      listingId: listing.id,
      method: 'email',
      content: emailContent,
      wasSent: true
    });
    
    // Open mail app
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    
    toast({
      title: "Email Opened",
      description: "Mail app opened with pre-filled message",
    });
  };

  const handlePhoneContact = () => {
    const phone = listing.contact_info?.phone;
    if (!phone) return;
    
    logOutreachMutation.mutate({
      listingId: listing.id,
      method: 'phone',
      content: `Phone contacted: ${phone}`,
      wasSent: true
    });
    copyToClipboard(phone, 'Phone number');
  };

  const handleVisitListing = () => {
    logOutreachMutation.mutate({
      listingId: listing.id,
      method: 'email',
      content: `Visited original listing: ${listing.url}`,
      wasSent: false
    });
    window.open(listing.url, '_blank');
  };

  const handleReAnalyze = () => {
    if (onReAnalyze) {
      onReAnalyze(listing);
      toast({
        title: "Re-analyzing...",
        description: "Claude is reviewing this listing again",
      });
    }
  };

  if (isExpired()) {
    return null; // Hide expired listings
  }

  const hasContactEmail = listing.contactEmail || listing.contact_info?.email;
  const hasContactPhone = listing.contact_info?.phone;

  return (
    <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{listing.address}</h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{listing.source} • {listing.listing_date}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(listing.match_score)}`}>
            {listing.match_score}% Match
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {getFlagBadges().map((badge, index) => (
            <Badge key={index} variant={badge.variant} className="text-xs">
              {badge.text}
            </Badge>
          ))}
        </div>

        <div className="text-2xl font-bold text-blue-600 mb-2">
          ${listing.price.toLocaleString()}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Home className="w-4 h-4 mr-1" />
            {listing.bedrooms}BR/{listing.bathrooms}BA
          </div>
          <div>{listing.sqft?.toLocaleString()} sq ft</div>
          {listing.year_built && <div>Built {listing.year_built}</div>}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {listing.images && listing.images.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={listing.images[0]} 
              alt={listing.address}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {listing.ai_summary && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">{listing.ai_summary}</p>
          </div>
        )}

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{listing.description}</p>

        {/* Contact Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {hasContactEmail ? (
            <Button 
              onClick={sendMessage}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          ) : hasContactPhone ? (
            <Button 
              variant="outline" 
              onClick={handlePhoneContact}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Copy Phone
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleVisitListing}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Original Listing
            </Button>
          )}
          
          {hasContactPhone && hasContactEmail && (
            <Button 
              variant="outline" 
              onClick={handlePhoneContact}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Copy Phone
            </Button>
          )}
        </div>

        {/* Expandable section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between mb-2">
              <span>More Details & Analysis</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <ClaudeInsights insights={listing.claudeInsights} />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEmailDraft(listing)}
                className="flex-1"
              >
                View Email Draft
              </Button>
              
              {onReAnalyze && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleReAnalyze}
                      className="flex-1"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Re-Analyze
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Have Claude re-analyze this listing with updated criteria</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleVisitListing}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View Listing
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Listing } from '../types/listing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Home, ChevronDown, ChevronUp, Mail, Phone, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { calculateOpportunityScore } from '../utils/leoPersona';
import { ClaudeInsights } from './ClaudeInsights';

interface OpportunityCardProps {
  listing: Listing;
  onEmailDraft: (listing: Listing) => void;
  onContact: (listing: Listing, method: 'email' | 'phone' | 'visit') => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ 
  listing, 
  onEmailDraft, 
  onContact 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const opportunityScore = calculateOpportunityScore(listing);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getFlagBadges = () => {
    const badges = [];
    if (listing.flags.va_eligible) badges.push({ text: 'VA Eligible', variant: 'default' as const });
    if (listing.flags.owner_finance) badges.push({ text: 'Owner Finance', variant: 'secondary' as const });
    if (listing.flags.lease_to_own) badges.push({ text: 'Lease to Own', variant: 'outline' as const });
    if (listing.flags.contract_for_deed) badges.push({ text: 'Contract for Deed', variant: 'destructive' as const });
    return badges;
  };

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
          <div className={`px-3 py-1 rounded-lg border text-sm font-medium ${getScoreColor(opportunityScore.percentage)}`}>
            LEO Score: {opportunityScore.percentage}%
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
            <h4 className="font-medium text-blue-900 mb-1">🐾 LEO's Take:</h4>
            <p className="text-sm text-blue-800">{listing.ai_summary}</p>
          </div>
        )}

        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{listing.description}</p>

        {/* Quick Contact Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          {hasContactEmail ? (
            <Button 
              onClick={() => onContact(listing, 'email')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          ) : hasContactPhone ? (
            <Button 
              variant="outline" 
              onClick={() => onContact(listing, 'phone')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Copy Phone
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => onContact(listing, 'visit')}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Listing
            </Button>
          )}
        </div>

        {/* Expandable LEO Analysis */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>LEO's Full Analysis</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="mt-4 space-y-4">
              <ClaudeInsights insights={listing.claudeInsights} />
              
              <div className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 mb-2">Opportunity Breakdown:</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Creative Financing:</span>
                    <span className="font-medium">{opportunityScore.breakdown.creativeFinancing}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seller Motivation:</span>
                    <span className="font-medium">{opportunityScore.breakdown.sellerMotivation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dog Friendliness:</span>
                    <span className="font-medium">{opportunityScore.breakdown.dogFriendliness}%</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={() => onEmailDraft(listing)}
                className="w-full"
              >
                View LEO's Email Draft
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

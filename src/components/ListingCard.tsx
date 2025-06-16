
import React from 'react';
import { Listing } from '../types/listing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Home, Calendar, Mail, Phone, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ListingCardProps {
  listing: Listing;
  onEmailDraft: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onEmailDraft }) => {
  const { toast } = useToast();

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

  const openMailApp = () => {
    const subject = encodeURIComponent(`Interest in Property: ${listing.address}`);
    const body = encodeURIComponent(listing.emailDraft || '');
    const email = listing.contact_info?.email || '';
    
    if (email) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      toast({
        title: "No Email Available",
        description: "Contact information doesn't include email. Try calling instead.",
        variant: "destructive"
      });
    }
  };

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

        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            onClick={openMailApp}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          
          {listing.contact_info?.phone && (
            <Button 
              variant="outline" 
              onClick={() => copyToClipboard(listing.contact_info!.phone!, 'Phone number')}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Copy Phone
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEmailDraft(listing)}
            className="flex-1"
          >
            View Email Draft
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(listing.url, '_blank')}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Listing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

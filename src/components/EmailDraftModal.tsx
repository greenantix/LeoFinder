
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Mail, Heart } from 'lucide-react';
import { Listing } from '../types/listing';
import { useToast } from '@/hooks/use-toast';

interface EmailDraftModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({ listing, isOpen, onClose }) => {
  const { toast } = useToast();

  if (!listing) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(listing.emailDraft || '');
    toast({
      title: "Copied!",
      description: "LEO's email draft copied to clipboard",
    });
  };

  const openMailApp = () => {
    const subject = encodeURIComponent(`Interest in Property: ${listing.address}`);
    const body = encodeURIComponent(listing.emailDraft || '');
    const email = listing.contact_info?.email || listing.contactEmail || '';
    
    if (email) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      onClose();
    } else {
      toast({
        title: "No Email Available",
        description: "LEO suggests copying the text and contacting via the original listing",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-600" />
            LEO's Email Draft for {listing.address}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              🐾 LEO has crafted this personalized message based on the property details and your preferences.
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              To: {listing.contact_info?.email || listing.contactEmail || listing.contact_info?.name || 'Property Owner'}
            </label>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Subject: Interest in Property: {listing.address}
            </label>
          </div>
          
          <Textarea
            value={listing.emailDraft || ''}
            readOnly
            className="min-h-[200px] text-sm"
            placeholder="LEO's email draft will appear here..."
          />
          
          {listing.contact_info?.phone && (
            <div className="text-sm text-gray-600">
              <strong>Phone:</strong> {listing.contact_info.phone}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={copyToClipboard}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Text
          </Button>
          
          <Button 
            onClick={openMailApp}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!listing.contact_info?.email && !listing.contactEmail}
          >
            <Mail className="w-4 h-4 mr-2" />
            {(listing.contact_info?.email || listing.contactEmail) ? 'Send Email' : 'No Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

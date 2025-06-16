
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Mail, Heart, RefreshCw, Sparkles } from 'lucide-react';
import { Listing } from '../types/listing';
import { useToast } from '@/hooks/use-toast';
import { useGenerateEmail } from '../hooks/useListings';

interface EmailDraftModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EmailDraftModal: React.FC<EmailDraftModalProps> = ({ listing, isOpen, onClose }) => {
  const { toast } = useToast();
  const [currentEmailDraft, setCurrentEmailDraft] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  
  // API mutation for generating email
  const generateEmailMutation = useGenerateEmail();

  useEffect(() => {
    if (listing) {
      setCurrentEmailDraft(listing.emailDraft || '');
      setEmailSubject(`Interest in Property: ${listing.address}`);
    }
  }, [listing]);

  if (!listing) return null;

  const handleGenerateEmail = async () => {
    try {
      const result = await generateEmailMutation.mutateAsync({
        listingId: listing.id,
        userPersona: "a veteran with two dogs looking for a home with no money down and flexible financing options"
      });
      
      setCurrentEmailDraft(result.body);
      setEmailSubject(result.subject);
      
      toast({
        title: "✨ LEO Generated New Email",
        description: "Personalized message created based on property details",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "LEO couldn't generate an email right now. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentEmailDraft);
    toast({
      title: "Copied!",
      description: "LEO's email draft copied to clipboard",
    });
  };

  const openMailApp = () => {
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(currentEmailDraft);
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
              🐾 LEO crafts personalized messages based on property details and your preferences.
            </p>
          </div>

          {!currentEmailDraft && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <p className="text-gray-600 mb-4">No email draft yet. Let LEO generate one for you!</p>
              <Button 
                onClick={handleGenerateEmail} 
                disabled={generateEmailMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {generateEmailMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    LEO is thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Email
                  </>
                )}
              </Button>
            </div>
          )}

          {currentEmailDraft && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700 block">
                    To: {listing.contact_info?.email || listing.contactEmail || listing.contact_info?.name || 'Property Owner'}
                  </label>
                  <label className="text-sm font-medium text-gray-700 block">
                    Subject: {emailSubject}
                  </label>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleGenerateEmail}
                  disabled={generateEmailMutation.isPending}
                >
                  {generateEmailMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <Textarea
                value={currentEmailDraft}
                onChange={(e) => setCurrentEmailDraft(e.target.value)}
                className="min-h-[200px] text-sm"
                placeholder="LEO's email draft will appear here..."
              />
            </>
          )}
          
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
            disabled={!currentEmailDraft}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Text
          </Button>
          
          <Button 
            onClick={openMailApp}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!currentEmailDraft || (!listing.contact_info?.email && !listing.contactEmail)}
          >
            <Mail className="w-4 h-4 mr-2" />
            {(listing.contact_info?.email || listing.contactEmail) ? 'Send Email' : 'No Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

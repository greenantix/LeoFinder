import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Listing } from '../types/listing';

// API response interfaces
interface ListingsResponse {
  success: boolean;
  data: Listing[];
  count: number;
  filters?: any;
}

interface EmailResponse {
  success: boolean;
  data: {
    subject: string;
    body: string;
    tone: string;
    keyPoints: string[];
  };
}

interface OutreachRequest {
  listingId: string;
  method: 'email' | 'phone';
  content: string;
  wasSent: boolean;
}

interface ScrapeRequest {
  zipCode: string;
  sources?: string[];
}

// Fetch all listings
export const useGetListings = (filters?: {
  zipCode?: string;
  minScore?: number;
  maxScore?: number;
  source?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery<Listing[], Error>({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.zipCode) params.append('zipCode', filters.zipCode);
      if (filters?.minScore !== undefined) params.append('minScore', filters.minScore.toString());
      if (filters?.maxScore !== undefined) params.append('maxScore', filters.maxScore.toString());
      if (filters?.source) params.append('source', filters.source);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const queryString = params.toString();
      const url = queryString ? `/api/listings?${queryString}` : '/api/listings';
      
      const response: ListingsResponse = await apiClient.get(url);
      return response.data || response; // Handle both wrapped and direct responses
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Get a specific listing by ID
export const useGetListing = (listingId: string) => {
  return useQuery<Listing, Error>({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/listings/${listingId}`);
      return response.data || response;
    },
    enabled: !!listingId,
  });
};

// Generate an email for a specific listing
export const useGenerateEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation<EmailResponse['data'], Error, { listingId: string; userPersona?: string }>({
    mutationFn: async ({ listingId, userPersona }) => {
      const response: EmailResponse = await apiClient.post('/api/generate-email', { 
        listingId, 
        userPersona 
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update the listing cache with the generated email
      queryClient.setQueryData(['listing', variables.listingId], (old: Listing | undefined) => {
        if (old) {
          return { ...old, emailDraft: data.body };
        }
        return old;
      });
      
      // Also update in the listings cache
      queryClient.setQueryData(['listings'], (old: Listing[] | undefined) => {
        if (old) {
          return old.map(listing => 
            listing.id === variables.listingId 
              ? { ...listing, emailDraft: data.body }
              : listing
          );
        }
        return old;
      });
    },
  });
};

// Log an outreach attempt
export const useLogOutreach = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, OutreachRequest>({
    mutationFn: async (outreachData) => {
      await apiClient.post('/api/log-outreach', outreachData);
    },
    onSuccess: () => {
      // Invalidate listings to update status
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

// Start a scraping job
export const useScrapeListings = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, ScrapeRequest>({
    mutationFn: async (scrapeData) => {
      await apiClient.post('/api/scrape', scrapeData);
    },
    onSuccess: () => {
      // Invalidate listings after starting scrape job
      // The actual new listings will come in via the periodic refetch
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

// Test notification
export const useTestNotification = () => {
  return useMutation<void, Error, { listingId?: string }>({
    mutationFn: async (data) => {
      await apiClient.post('/api/notifications/test', data);
    },
  });
};

// Subscribe to notifications
export const useSubscribeNotifications = () => {
  return useMutation<void, Error, { token: string; topic?: string }>({
    mutationFn: async ({ token, topic = 'high_score_listings' }) => {
      await apiClient.post('/api/notifications/subscribe', { token, topic });
    },
  });
};
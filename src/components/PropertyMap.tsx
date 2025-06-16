import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut, Home } from 'lucide-react';
import { Listing } from '../types/listing';
import { toast } from 'sonner';

interface PropertyMapProps {
  listings: Listing[];
  selectedListing?: Listing;
  onListingSelect: (listing: Listing) => void;
  height?: string;
}

interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({ 
  listings, 
  selectedListing, 
  onListingSelect,
  height = "400px" 
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 33.4484, lng: -112.0740 }); // Phoenix default
  const [zoom, setZoom] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Simulate geocoding for demo (in production, use Google Geocoding API)
  const getCoordinatesFromAddress = (address: string): { lat: number; lng: number } => {
    // Simple demo logic - in production, use proper geocoding
    const addressLower = address.toLowerCase();
    
    if (addressLower.includes('phoenix')) {
      return { lat: 33.4484 + (Math.random() - 0.5) * 0.2, lng: -112.0740 + (Math.random() - 0.5) * 0.2 };
    } else if (addressLower.includes('tucson')) {
      return { lat: 32.2217 + (Math.random() - 0.5) * 0.2, lng: -110.9265 + (Math.random() - 0.5) * 0.2 };
    } else if (addressLower.includes('mesa')) {
      return { lat: 33.4152 + (Math.random() - 0.5) * 0.2, lng: -111.8315 + (Math.random() - 0.5) * 0.2 };
    } else {
      // Default to Phoenix area with some randomization
      return { lat: 33.4484 + (Math.random() - 0.5) * 0.5, lng: -112.0740 + (Math.random() - 0.5) * 0.5 };
    }
  };

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setMapCenter(userPos);
          toast.success('📍 Location found! Showing properties near you.');
        },
        (error) => {
          console.log('Geolocation error:', error);
          toast.info('Using default location (Phoenix). Enable location for better results.');
        }
      );
    }
  }, []);

  const calculateMapBounds = (): MapBounds => {
    if (listings.length === 0) {
      return {
        north: mapCenter.lat + 0.1,
        south: mapCenter.lat - 0.1,
        east: mapCenter.lng + 0.1,
        west: mapCenter.lng - 0.1
      };
    }

    const coords = listings.map(listing => getCoordinatesFromAddress(listing.address));
    
    return {
      north: Math.max(...coords.map(c => c.lat)) + 0.01,
      south: Math.min(...coords.map(c => c.lat)) - 0.01,
      east: Math.max(...coords.map(c => c.lng)) + 0.01,
      west: Math.min(...coords.map(c => c.lng)) - 0.01
    };
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const centerOnListings = () => {
    if (listings.length === 0) return;
    
    const coords = listings.map(listing => getCoordinatesFromAddress(listing.address));
    const avgLat = coords.reduce((sum, coord) => sum + coord.lat, 0) / coords.length;
    const avgLng = coords.reduce((sum, coord) => sum + coord.lng, 0) / coords.length;
    
    setMapCenter({ lat: avgLat, lng: avgLng });
    setZoom(12);
    toast.info('🎯 Centered on all properties');
  };

  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setZoom(14);
      toast.info('📍 Centered on your location');
    } else {
      toast.error('Location not available. Please enable GPS.');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property Map
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={centerOnUser}>
              <Navigation className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={centerOnListings}>
              <Layers className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map Container */}
        <div 
          className="relative bg-gray-100 rounded-lg border overflow-hidden"
          style={{ height }}
        >
          {/* Map Placeholder (in production, use Google Maps or Mapbox) */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map</h3>
              <p className="text-sm text-gray-500">
                {listings.length} properties in the area
              </p>
            </div>
          </div>

          {/* Property Markers Overlay */}
          <div className="absolute inset-0">
            {listings.map((listing, index) => {
              const coords = getCoordinatesFromAddress(listing.address);
              
              // Convert coordinates to pixel positions (simplified)
              const x = ((coords.lng - mapCenter.lng + 0.1) / 0.2) * 100;
              const y = ((mapCenter.lat - coords.lat + 0.1) / 0.2) * 100;
              
              if (x < 0 || x > 100 || y < 0 || y > 100) return null;
              
              return (
                <div
                  key={listing.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 ${
                    selectedListing?.id === listing.id ? 'scale-125 z-10' : 'z-0'
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                  onClick={() => onListingSelect(listing)}
                >
                  {/* Score Badge */}
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: getScoreColor(listing.score || 0) }}
                  >
                    {listing.score || 0}
                  </div>
                  
                  {/* Property Info Tooltip */}
                  {selectedListing?.id === listing.id && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-64 z-20 border">
                      <div className="text-sm font-semibold truncate">
                        {listing.address}
                      </div>
                      <div className="text-lg font-bold text-green-600">
                        ${listing.price?.toLocaleString()}
                      </div>
                      <div className="flex gap-1 mt-2">
                        {listing.creativeFinancing?.ownerFinancing && (
                          <Badge variant="secondary" className="text-xs">Owner Finance</Badge>
                        )}
                        {listing.listingType === 'Foreclosure' && (
                          <Badge variant="outline" className="text-xs">Foreclosure</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* User Location Marker */}
          {userLocation && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-5"
              style={{
                left: '50%',
                top: '50%',
              }}
            >
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
                <div className="w-8 h-8 bg-blue-200 rounded-full absolute -top-2 -left-2 animate-ping opacity-75"></div>
              </div>
            </div>
          )}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setZoom(Math.min(zoom + 1, 18))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setZoom(Math.max(zoom - 1, 1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Map Legend */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>High Score (80+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>Good Score (60+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Lower Score</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Click markers for details
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
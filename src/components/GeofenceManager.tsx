import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Zap,
  Target,
  Radio,
  Bell,
  Navigation,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface Geofence {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  radius: number; // in meters
  isActive: boolean;
  alertTypes: {
    newListings: boolean;
    priceDrops: boolean;
    statusChanges: boolean;
    highScoreProperties: boolean;
  };
  criteria: {
    maxPrice?: number;
    minScore?: number;
    propertyTypes?: string[];
    creativeFinancing?: boolean;
  };
  createdAt: Date;
  triggeredCount: number;
  lastTriggered?: Date;
}

interface GeofenceHit {
  id: string;
  geofenceId: string;
  listingId: string;
  propertyAddress: string;
  triggerType: string;
  distance: number;
  timestamp: Date;
}

export const GeofenceManager: React.FC = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [recentHits, setRecentHits] = useState<GeofenceHit[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newGeofence, setNewGeofence] = useState({
    name: '',
    address: '',
    radius: 5000, // 5km default
    maxPrice: 500000,
    minScore: 60,
    creativeFinancing: false
  });

  useEffect(() => {
    loadGeofences();
    getUserLocation();
    
    // Simulate real-time monitoring
    const interval = setInterval(checkGeofenceHits, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadGeofences = () => {
    // Load from localStorage or use demo data
    const saved = localStorage.getItem('leo_geofences');
    if (saved) {
      const parsed = JSON.parse(saved);
      setGeofences(parsed.map((g: any) => ({
        ...g,
        createdAt: new Date(g.createdAt),
        lastTriggered: g.lastTriggered ? new Date(g.lastTriggered) : undefined
      })));
    } else {
      // Demo geofences
      setGeofences([
        {
          id: 'geo_1',
          name: 'Phoenix Downtown',
          center: { lat: 33.4484, lng: -112.0740 },
          radius: 3000,
          isActive: true,
          alertTypes: {
            newListings: true,
            priceDrops: true,
            statusChanges: false,
            highScoreProperties: true
          },
          criteria: {
            maxPrice: 400000,
            minScore: 70,
            creativeFinancing: true
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          triggeredCount: 12,
          lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 'geo_2',
          name: 'Veteran Community Area',
          center: { lat: 33.5269, lng: -112.2626 },
          radius: 5000,
          isActive: true,
          alertTypes: {
            newListings: true,
            priceDrops: false,
            statusChanges: true,
            highScoreProperties: true
          },
          criteria: {
            maxPrice: 350000,
            minScore: 60
          },
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          triggeredCount: 8,
          lastTriggered: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      ]);
    }

    // Demo recent hits
    setRecentHits([
      {
        id: 'hit_1',
        geofenceId: 'geo_1',
        listingId: 'listing_123',
        propertyAddress: '1234 Central Ave, Phoenix, AZ',
        triggerType: 'New Listing',
        distance: 850,
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        id: 'hit_2',
        geofenceId: 'geo_2',
        listingId: 'listing_456',
        propertyAddress: '5678 Veterans Blvd, Phoenix, AZ',
        triggerType: 'High Score Property',
        distance: 1200,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ]);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    // Simulate geocoding (in production, use Google Geocoding API)
    const phoenixCoords = { lat: 33.4484, lng: -112.0740 };
    const tucsonCoords = { lat: 32.2217, lng: -110.9265 };
    
    if (address.toLowerCase().includes('tucson')) {
      return tucsonCoords;
    }
    return phoenixCoords;
  };

  const createGeofence = async () => {
    if (!newGeofence.name || !newGeofence.address) {
      toast.error('Please fill in name and address');
      return;
    }

    const coordinates = await geocodeAddress(newGeofence.address);
    if (!coordinates) {
      toast.error('Could not geocode address');
      return;
    }

    const geofence: Geofence = {
      id: `geo_${Date.now()}`,
      name: newGeofence.name,
      center: coordinates,
      radius: newGeofence.radius,
      isActive: true,
      alertTypes: {
        newListings: true,
        priceDrops: true,
        statusChanges: false,
        highScoreProperties: true
      },
      criteria: {
        maxPrice: newGeofence.maxPrice,
        minScore: newGeofence.minScore,
        creativeFinancing: newGeofence.creativeFinancing
      },
      createdAt: new Date(),
      triggeredCount: 0
    };

    const updated = [...geofences, geofence];
    setGeofences(updated);
    localStorage.setItem('leo_geofences', JSON.stringify(updated));
    
    setIsCreating(false);
    setNewGeofence({
      name: '',
      address: '',
      radius: 5000,
      maxPrice: 500000,
      minScore: 60,
      creativeFinancing: false
    });

    toast.success('🎯 Geofence created! LEO is now monitoring this area.');
  };

  const toggleGeofence = (id: string) => {
    const updated = geofences.map(geo => 
      geo.id === id ? { ...geo, isActive: !geo.isActive } : geo
    );
    setGeofences(updated);
    localStorage.setItem('leo_geofences', JSON.stringify(updated));
    
    const geofence = updated.find(g => g.id === id);
    toast.success(
      geofence?.isActive 
        ? `📡 Monitoring activated for ${geofence.name}`
        : `⏸️ Monitoring paused for ${geofence?.name}`
    );
  };

  const deleteGeofence = (id: string) => {
    const geofence = geofences.find(g => g.id === id);
    const updated = geofences.filter(geo => geo.id !== id);
    setGeofences(updated);
    localStorage.setItem('leo_geofences', JSON.stringify(updated));
    
    toast.success(`🗑️ Deleted geofence: ${geofence?.name}`);
  };

  const checkGeofenceHits = () => {
    // Simulate checking for new properties in geofenced areas
    const activeGeofences = geofences.filter(g => g.isActive);
    
    if (activeGeofences.length > 0 && Math.random() > 0.7) {
      const randomGeo = activeGeofences[Math.floor(Math.random() * activeGeofences.length)];
      const triggerTypes = ['New Listing', 'Price Drop', 'High Score Property'];
      const randomTrigger = triggerTypes[Math.floor(Math.random() * triggerTypes.length)];
      
      const newHit: GeofenceHit = {
        id: `hit_${Date.now()}`,
        geofenceId: randomGeo.id,
        listingId: `listing_${Date.now()}`,
        propertyAddress: `${Math.floor(Math.random() * 9999)} Random St, Phoenix, AZ`,
        triggerType: randomTrigger,
        distance: Math.floor(Math.random() * randomGeo.radius),
        timestamp: new Date()
      };
      
      setRecentHits(prev => [newHit, ...prev.slice(0, 9)]);
      
      // Update geofence stats
      const updated = geofences.map(geo => 
        geo.id === randomGeo.id 
          ? { 
              ...geo, 
              triggeredCount: geo.triggeredCount + 1,
              lastTriggered: new Date()
            }
          : geo
      );
      setGeofences(updated);
      
      toast.success(`🎯 ${randomTrigger} in ${randomGeo.name}!`);
    }
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="space-y-6">
      {/* Create New Geofence */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Geofence Management
              <Badge variant="outline">{geofences.length} active zones</Badge>
            </CardTitle>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Zone
            </Button>
          </div>
        </CardHeader>
        {isCreating && (
          <CardContent className="border-t">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Zone Name</Label>
                  <Input
                    value={newGeofence.name}
                    onChange={(e) => setNewGeofence(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Downtown Phoenix"
                  />
                </div>
                <div>
                  <Label>Address/Area</Label>
                  <Input
                    value={newGeofence.address}
                    onChange={(e) => setNewGeofence(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Phoenix, AZ or specific address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Radius: {formatDistance(newGeofence.radius)}</Label>
                  <input
                    type="range"
                    min="500"
                    max="25000"
                    step="500"
                    value={newGeofence.radius}
                    onChange={(e) => setNewGeofence(prev => ({ ...prev, radius: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Max Price</Label>
                  <Input
                    type="number"
                    value={newGeofence.maxPrice}
                    onChange={(e) => setNewGeofence(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Min Score</Label>
                  <Input
                    type="number"
                    value={newGeofence.minScore}
                    onChange={(e) => setNewGeofence(prev => ({ ...prev, minScore: Number(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <Switch
                    checked={newGeofence.creativeFinancing}
                    onCheckedChange={(checked) => setNewGeofence(prev => ({ ...prev, creativeFinancing: checked }))}
                  />
                  Creative Financing Only
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createGeofence}>
                  <Target className="w-4 h-4 mr-2" />
                  Create Geofence
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Active Geofences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {geofences.map((geofence) => (
          <Card key={geofence.id} className={`${geofence.isActive ? 'border-green-200' : 'border-gray-200'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${geofence.isActive ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
                  <h3 className="font-semibold">{geofence.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGeofence(geofence.id)}
                  >
                    {geofence.isActive ? <Zap className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteGeofence(geofence.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Radius:</span>
                    <div className="font-medium">{formatDistance(geofence.radius)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Price:</span>
                    <div className="font-medium">${geofence.criteria.maxPrice?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Min Score:</span>
                    <div className="font-medium">{geofence.criteria.minScore}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Triggered:</span>
                    <div className="font-medium">{geofence.triggeredCount} times</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {geofence.alertTypes.newListings && (
                    <Badge variant="secondary" className="text-xs">New Listings</Badge>
                  )}
                  {geofence.alertTypes.priceDrops && (
                    <Badge variant="secondary" className="text-xs">Price Drops</Badge>
                  )}
                  {geofence.alertTypes.highScoreProperties && (
                    <Badge variant="secondary" className="text-xs">High Score</Badge>
                  )}
                  {geofence.criteria.creativeFinancing && (
                    <Badge variant="outline" className="text-xs">Creative Financing</Badge>
                  )}
                </div>
                
                {geofence.lastTriggered && (
                  <div className="text-xs text-gray-500">
                    Last triggered: {geofence.lastTriggered.toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Hits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Geofence Hits
            <Badge variant="outline">{recentHits.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentHits.map((hit) => {
              const geofence = geofences.find(g => g.id === hit.geofenceId);
              return (
                <div key={hit.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">{hit.propertyAddress}</div>
                      <div className="text-xs text-gray-500">
                        {hit.triggerType} • {formatDistance(hit.distance)} from {geofence?.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {hit.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
            
            {recentHits.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Navigation className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent geofence hits</p>
                <p className="text-sm">LEO is monitoring your zones for new opportunities</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
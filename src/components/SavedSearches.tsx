import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookmarkPlus, 
  Search, 
  Bell, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  MapPin,
  DollarSign,
  Home
} from 'lucide-react';
import { toast } from 'sonner';

interface SavedSearch {
  id: string;
  name: string;
  zipCode: string;
  maxPrice: number;
  minScore: number;
  propertyTypes: string[];
  creativeFinancing: boolean;
  vaEligible: boolean;
  isActive: boolean;
  alertsEnabled: boolean;
  lastRun: string;
  resultsCount: number;
  createdAt: string;
}

interface Watchlist {
  id: string;
  listingId: string;
  address: string;
  price: number;
  score: number;
  notes: string;
  addedAt: string;
  priceAlerts: boolean;
  statusAlerts: boolean;
}

export const SavedSearches: React.FC = () => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSearch, setNewSearch] = useState({
    name: '',
    zipCode: '',
    maxPrice: 500000,
    minScore: 40,
    propertyTypes: [] as string[],
    creativeFinancing: false,
    vaEligible: false,
    alertsEnabled: true
  });

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('leo_saved_searches');
    const watchlistData = localStorage.getItem('leo_watchlist');
    
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    } else {
      // Demo data
      setSavedSearches([
        {
          id: '1',
          name: 'Phoenix Veterans Housing',
          zipCode: '85001',
          maxPrice: 350000,
          minScore: 70,
          propertyTypes: ['house', 'townhouse'],
          creativeFinancing: true,
          vaEligible: true,
          isActive: true,
          alertsEnabled: true,
          lastRun: new Date().toISOString(),
          resultsCount: 12,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2', 
          name: 'Tucson Owner Finance',
          zipCode: '85701',
          maxPrice: 300000,
          minScore: 60,
          propertyTypes: ['house'],
          creativeFinancing: true,
          vaEligible: false,
          isActive: false,
          alertsEnabled: false,
          lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          resultsCount: 8,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    }
    
    if (watchlistData) {
      setWatchlist(JSON.parse(watchlistData));
    } else {
      // Demo watchlist data
      setWatchlist([
        {
          id: '1',
          listingId: 'sample-1',
          address: '123 Veterans Way, Phoenix, AZ',
          price: 285000,
          score: 85,
          notes: 'Great owner financing terms, close to base',
          addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          priceAlerts: true,
          statusAlerts: true
        },
        {
          id: '2',
          listingId: 'sample-2', 
          address: '456 Liberty Lane, Tucson, AZ',
          price: 320000,
          score: 92,
          notes: 'Zero down option - perfect!',
          addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          priceAlerts: true,
          statusAlerts: true
        }
      ]);
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('leo_saved_searches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  useEffect(() => {
    localStorage.setItem('leo_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const createSavedSearch = () => {
    if (!newSearch.name || !newSearch.zipCode) {
      toast.error('Please fill in search name and ZIP code');
      return;
    }

    const search: SavedSearch = {
      id: Date.now().toString(),
      ...newSearch,
      isActive: true,
      lastRun: new Date().toISOString(),
      resultsCount: 0,
      createdAt: new Date().toISOString()
    };

    setSavedSearches(prev => [...prev, search]);
    setIsCreateDialogOpen(false);
    setNewSearch({
      name: '',
      zipCode: '',
      maxPrice: 500000,
      minScore: 40,
      propertyTypes: [],
      creativeFinancing: false,
      vaEligible: false,
      alertsEnabled: true
    });
    
    toast.success('🔍 Saved search created! LEO will start hunting.');
  };

  const toggleSearchActive = (id: string) => {
    setSavedSearches(prev => 
      prev.map(search => 
        search.id === id 
          ? { ...search, isActive: !search.isActive }
          : search
      )
    );
    
    const search = savedSearches.find(s => s.id === id);
    toast.success(
      search?.isActive 
        ? '⏸️ Search paused' 
        : '▶️ Search resumed - LEO is hunting!'
    );
  };

  const deleteSearch = (id: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== id));
    toast.success('🗑️ Search deleted');
  };

  const runSearch = (search: SavedSearch) => {
    // Update last run time and simulate results
    setSavedSearches(prev => 
      prev.map(s => 
        s.id === search.id 
          ? { ...s, lastRun: new Date().toISOString(), resultsCount: Math.floor(Math.random() * 20) + 5 }
          : s
      )
    );
    
    toast.success(`🔍 Running "${search.name}" - Found new opportunities!`);
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
    toast.success('❌ Removed from watchlist');
  };

  const toggleWatchlistAlerts = (id: string, type: 'price' | 'status') => {
    setWatchlist(prev => 
      prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              [type === 'price' ? 'priceAlerts' : 'statusAlerts']: 
                !item[type === 'price' ? 'priceAlerts' : 'statusAlerts']
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Saved Searches */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Saved Searches
              <Badge variant="outline">{savedSearches.length}</Badge>
            </CardTitle>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  New Search
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Saved Search</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Search Name</Label>
                    <Input
                      value={newSearch.name}
                      onChange={(e) => setNewSearch(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Phoenix Veterans Housing"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>ZIP Code</Label>
                      <Input
                        value={newSearch.zipCode}
                        onChange={(e) => setNewSearch(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="85001"
                      />
                    </div>
                    <div>
                      <Label>Max Price</Label>
                      <Input
                        type="number"
                        value={newSearch.maxPrice}
                        onChange={(e) => setNewSearch(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Minimum LEO Score: {newSearch.minScore}</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newSearch.minScore}
                      onChange={(e) => setNewSearch(prev => ({ ...prev, minScore: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newSearch.creativeFinancing}
                        onChange={(e) => setNewSearch(prev => ({ ...prev, creativeFinancing: e.target.checked }))}
                      />
                      Creative Financing
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newSearch.vaEligible}
                        onChange={(e) => setNewSearch(prev => ({ ...prev, vaEligible: e.target.checked }))}
                      />
                      VA Eligible Only
                    </label>
                  </div>
                  
                  <Button onClick={createSavedSearch} className="w-full">
                    Create Search
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {savedSearches.map((search) => (
              <div key={search.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{search.name}</h3>
                    <div className="flex gap-1">
                      {search.isActive ? (
                        <Badge variant="default" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Paused</Badge>
                      )}
                      {search.alertsEnabled && (
                        <Badge variant="outline" className="text-xs">
                          <Bell className="w-3 h-3 mr-1" />
                          Alerts
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runSearch(search)}
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSearchActive(search.id)}
                    >
                      {search.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSearch(search.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {search.zipCode}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Up to ${search.maxPrice.toLocaleString()}
                  </div>
                  <div>Min Score: {search.minScore}</div>
                  <div>{search.resultsCount} results</div>
                </div>
                
                <div className="flex gap-1">
                  {search.creativeFinancing && (
                    <Badge variant="secondary" className="text-xs">Creative Financing</Badge>
                  )}
                  {search.vaEligible && (
                    <Badge variant="secondary" className="text-xs">VA Eligible</Badge>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  Last run: {new Date(search.lastRun).toLocaleDateString()}
                </div>
              </div>
            ))}
            
            {savedSearches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No saved searches yet</p>
                <p className="text-sm">Create your first search to let LEO hunt automatically</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Watchlist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Watchlist
            <Badge variant="outline">{watchlist.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {watchlist.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{item.address}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="font-semibold text-green-600">
                        ${item.price.toLocaleString()}
                      </span>
                      <span>LEO Score: {item.score}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromWatchlist(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {item.notes && (
                  <p className="text-sm text-gray-600 mb-3">{item.notes}</p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                  
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={item.priceAlerts}
                      onChange={() => toggleWatchlistAlerts(item.id, 'price')}
                      className="w-3 h-3"
                    />
                    Price alerts
                  </label>
                  
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={item.statusAlerts}
                      onChange={() => toggleWatchlistAlerts(item.id, 'status')}
                      className="w-3 h-3"
                    />
                    Status alerts
                  </label>
                </div>
              </div>
            ))}
            
            {watchlist.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No properties in watchlist</p>
                <p className="text-sm">Add properties to track price and status changes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
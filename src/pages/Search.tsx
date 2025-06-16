import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, MapPin, DollarSign, Filter, Target } from 'lucide-react';
import { useGetListings, useScrapeListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/ListingCard';
import { toast } from 'sonner';

export default function Search() {
  const [filters, setFilters] = useState({
    zipCode: '',
    minScore: 40,
    maxPrice: 500000,
    source: '',
    status: '',
    propertyTypes: [] as string[]
  });

  const [scrapeZipCode, setScrapeZipCode] = useState('');
  
  const { data: listings = [], isLoading, refetch } = useGetListings(filters);
  const scrapeMutation = useScrapeListings();

  const handleSearch = () => {
    refetch();
    toast.info('LEO is searching for opportunities...');
  };

  const handleScrape = () => {
    if (!scrapeZipCode) {
      toast.error('Please enter a ZIP code to scrape');
      return;
    }
    
    scrapeMutation.mutate(
      { zipCode: scrapeZipCode, sources: ['foreclosure', 'zillow'] },
      {
        onSuccess: () => {
          toast.success('LEO has started hunting in ' + scrapeZipCode + '!');
          setTimeout(() => refetch(), 2000);
        },
        onError: () => {
          toast.error('Failed to start scraping');
        }
      }
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <SearchIcon className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Advanced Search</h1>
      </div>

      {/* Search Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search Filters
          </CardTitle>
          <CardDescription>Fine-tune your search criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={filters.zipCode}
                onChange={(e) => setFilters(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder="e.g., 90210"
              />
            </div>
            <div>
              <Label>Source</Label>
              <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sources</SelectItem>
                  <SelectItem value="foreclosure">Foreclosure.com</SelectItem>
                  <SelectItem value="zillow">Zillow</SelectItem>
                  <SelectItem value="craigslist">Craigslist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>LEO Score: {filters.minScore}+</Label>
            <Slider
              value={[filters.minScore]}
              onValueChange={([value]) => setFilters(prev => ({ ...prev, minScore: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Max Price: ${filters.maxPrice.toLocaleString()}</Label>
            <Slider
              value={[filters.maxPrice]}
              onValueChange={([value]) => setFilters(prev => ({ ...prev, maxPrice: value }))}
              max={1000000}
              min={50000}
              step={25000}
              className="mt-2"
            />
          </div>

          <Button onClick={handleSearch} className="w-full">
            <SearchIcon className="w-4 h-4 mr-2" />
            Search Properties
          </Button>
        </CardContent>
      </Card>

      {/* Scrape New Data */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Hunt for New Opportunities
          </CardTitle>
          <CardDescription>Send LEO to hunt for fresh listings in a specific area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={scrapeZipCode}
              onChange={(e) => setScrapeZipCode(e.target.value)}
              placeholder="Enter ZIP code to hunt in"
            />
            <Button 
              onClick={handleScrape} 
              disabled={scrapeMutation.isPending}
            >
              {scrapeMutation.isPending ? 'LEO is hunting...' : 'Start Hunt'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Search Results</h2>
          <Badge variant="outline">{listings.length} opportunities found</Badge>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p>LEO is searching...</p>
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No opportunities found. Try adjusting your filters or start a new hunt!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
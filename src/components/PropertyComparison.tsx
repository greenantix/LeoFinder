import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GitCompare, 
  X, 
  Star,
  DollarSign,
  Home,
  MapPin,
  TrendingUp,
  Check,
  Minus
} from 'lucide-react';
import { Listing } from '../types/listing';

interface PropertyComparisonProps {
  listings: Listing[];
  selectedListings?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

interface ComparisonRow {
  label: string;
  key: keyof Listing | string;
  type: 'text' | 'price' | 'number' | 'boolean' | 'badge' | 'score';
  category: 'basic' | 'financial' | 'features' | 'location';
}

const comparisonRows: ComparisonRow[] = [
  // Basic Info
  { label: 'Address', key: 'address', type: 'text', category: 'basic' },
  { label: 'Price', key: 'price', type: 'price', category: 'basic' },
  { label: 'Bedrooms', key: 'bedrooms', type: 'number', category: 'basic' },
  { label: 'Bathrooms', key: 'bathrooms', type: 'number', category: 'basic' },
  { label: 'Square Feet', key: 'sqft', type: 'number', category: 'basic' },
  { label: 'Year Built', key: 'yearBuilt', type: 'number', category: 'basic' },
  { label: 'Property Type', key: 'propertyType', type: 'text', category: 'basic' },
  
  // Financial
  { label: 'LEO Score', key: 'score', type: 'score', category: 'financial' },
  { label: 'Listing Type', key: 'listingType', type: 'badge', category: 'financial' },
  { label: 'Down Payment %', key: 'creativeFinancing.downPaymentPercent', type: 'number', category: 'financial' },
  
  // Features
  { label: 'VA Eligible', key: 'flags.va_eligible', type: 'boolean', category: 'features' },
  { label: 'Owner Financing', key: 'creativeFinancing.ownerFinancing', type: 'boolean', category: 'features' },
  { label: 'Lease to Own', key: 'creativeFinancing.leaseToOwn', type: 'boolean', category: 'features' },
  { label: 'No Credit Check', key: 'flags.no_credit_check', type: 'boolean', category: 'features' },
  { label: 'USDA Eligible', key: 'flags.usda_eligible', type: 'boolean', category: 'features' },
  
  // Location
  { label: 'ZIP Code', key: 'zipCode', type: 'text', category: 'location' },
  { label: 'Source', key: 'source', type: 'badge', category: 'location' },
  { label: 'Status', key: 'status', type: 'badge', category: 'location' },
];

export const PropertyComparison: React.FC<PropertyComparisonProps> = ({ 
  listings, 
  selectedListings = [],
  onSelectionChange 
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedListings);
  const [activeCategory, setActiveCategory] = useState<'all' | 'basic' | 'financial' | 'features' | 'location'>('all');

  const selectedProperties = listings.filter(listing => selectedIds.includes(listing.id));
  const availableListings = listings.filter(listing => !selectedIds.includes(listing.id));

  const handleSelectionToggle = (listingId: string) => {
    const newSelection = selectedIds.includes(listingId)
      ? selectedIds.filter(id => id !== listingId)
      : [...selectedIds, listingId].slice(0, 4); // Max 4 properties
    
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const removeProperty = (listingId: string) => {
    const newSelection = selectedIds.filter(id => id !== listingId);
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  };

  const getValue = (listing: Listing, key: string) => {
    const keys = key.split('.');
    let value: any = listing;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value;
  };

  const renderValue = (value: any, type: string, listing?: Listing) => {
    switch (type) {
      case 'price':
        return value ? `$${value.toLocaleString()}` : '-';
      case 'number':
        return value || value === 0 ? value.toLocaleString() : '-';
      case 'boolean':
        return value ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Minus className="w-4 h-4 text-gray-400" />
        );
      case 'badge':
        return value ? (
          <Badge variant="outline" className="text-xs">
            {value}
          </Badge>
        ) : '-';
      case 'score':
        const score = value || 0;
        const color = score >= 80 ? 'text-green-600' : 
                     score >= 60 ? 'text-yellow-600' : 
                     score >= 40 ? 'text-orange-600' : 'text-red-600';
        return (
          <div className={`font-bold ${color}`}>
            {score}/100
          </div>
        );
      case 'text':
      default:
        return value || '-';
    }
  };

  const getWinner = (row: ComparisonRow) => {
    if (selectedProperties.length < 2) return null;
    
    const values = selectedProperties.map(listing => getValue(listing, row.key));
    
    switch (row.type) {
      case 'price':
        const minPrice = Math.min(...values.filter(v => v));
        return values.findIndex(v => v === minPrice);
      case 'score':
        const maxScore = Math.max(...values.filter(v => v));
        return values.findIndex(v => v === maxScore);
      case 'number':
        if (row.key === 'bedrooms' || row.key === 'bathrooms' || row.key === 'sqft') {
          const maxValue = Math.max(...values.filter(v => v));
          return values.findIndex(v => v === maxValue);
        }
        return null;
      case 'boolean':
        return values.findIndex(v => v === true);
      default:
        return null;
    }
  };

  const filteredRows = activeCategory === 'all' 
    ? comparisonRows 
    : comparisonRows.filter(row => row.category === activeCategory);

  const categories = [
    { key: 'all', label: 'All', icon: GitCompare },
    { key: 'basic', label: 'Basic Info', icon: Home },
    { key: 'financial', label: 'Financial', icon: DollarSign },
    { key: 'features', label: 'Features', icon: Star },
    { key: 'location', label: 'Location', icon: MapPin }
  ];

  return (
    <div className="space-y-6">
      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            Property Comparison
            <Badge variant="outline">{selectedIds.length}/4</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Available Properties */}
          {availableListings.length > 0 && selectedIds.length < 4 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Add Properties to Compare:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableListings.slice(0, 6).map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSelectionToggle(listing.id)}
                  >
                    <Checkbox 
                      checked={false}
                      onChange={() => {}}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.address}</p>
                      <p className="text-xs text-gray-500">
                        ${listing.price?.toLocaleString()} • Score: {listing.score}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Properties */}
          {selectedProperties.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Comparing {selectedProperties.length} Properties:</h4>
              <div className="flex gap-2 flex-wrap">
                {selectedProperties.map((listing) => (
                  <Badge key={listing.id} variant="secondary" className="max-w-xs">
                    <span className="truncate">
                      {listing.address.split(',')[0]}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeProperty(listing.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedProperties.length >= 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.key}
                    variant={activeCategory === category.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.key as any)}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Feature</th>
                    {selectedProperties.map((listing, index) => (
                      <th key={listing.id} className="text-center p-3 min-w-48">
                        <div className="space-y-1">
                          <div className="font-medium text-sm truncate">
                            {listing.address.split(',')[0]}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${listing.price?.toLocaleString()}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              (listing.score || 0) >= 80 ? 'text-green-600' : 
                              (listing.score || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}
                          >
                            {listing.score}/100
                          </Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, rowIndex) => {
                    const winnerIndex = getWinner(row);
                    
                    return (
                      <tr key={row.key} className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="p-3 font-medium text-sm">{row.label}</td>
                        {selectedProperties.map((listing, colIndex) => {
                          const value = getValue(listing, row.key);
                          const isWinner = winnerIndex === colIndex;
                          
                          return (
                            <td 
                              key={`${listing.id}-${row.key}`} 
                              className={`p-3 text-center text-sm ${
                                isWinner ? 'bg-green-50 font-semibold' : ''
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {renderValue(value, row.type, listing)}
                                {isWinner && (
                                  <TrendingUp className="w-3 h-3 text-green-600" />
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedProperties.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <GitCompare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Compare Properties Side by Side
            </h3>
            <p className="text-gray-600 mb-4">
              Select 2-4 properties to see a detailed comparison of features, pricing, and financing options.
            </p>
            <p className="text-sm text-gray-500">
              Choose properties from the list above to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
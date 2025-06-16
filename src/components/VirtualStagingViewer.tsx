import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  Eye, 
  Download, 
  Share2, 
  RotateCcw,
  Palette,
  Home,
  DollarSign,
  ShoppingCart,
  Clock,
  Zap,
  Star,
  Users,
  Accessibility,
  Flag,
  Image as ImageIcon,
  ArrowRight,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { virtualStagingEngine } from '../services/virtualStagingEngine';
import { Listing } from '../types/listing';

interface VirtualStagingViewerProps {
  listing: Listing;
  initialImage?: string;
}

export const VirtualStagingViewer: React.FC<VirtualStagingViewerProps> = ({ 
  listing, 
  initialImage 
}) => {
  const [stagingResult, setStagingResult] = useState<any>(null);
  const [isStaging, setIsStaging] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('living_room');
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedBudget, setSelectedBudget] = useState('medium');
  const [showComparison, setShowComparison] = useState(false);
  const [preferences, setPreferences] = useState({
    colorScheme: 'neutral',
    accessibility: false,
    veteranThemes: false,
    petFriendly: false,
    smartHome: false
  });
  const [selectedAlternative, setSelectedAlternative] = useState<number | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  useEffect(() => {
    if (initialImage) {
      checkExistingStaging();
    }
  }, [listing, selectedRoom, selectedStyle, selectedBudget]);

  const checkExistingStaging = () => {
    const existing = virtualStagingEngine.getCachedStaging(
      listing.id,
      selectedRoom,
      selectedStyle,
      selectedBudget
    );
    
    if (existing) {
      setStagingResult(existing);
    }
  };

  const handleStageProperty = async () => {
    if (!initialImage) {
      toast.error('Please provide a property image first');
      return;
    }

    setIsStaging(true);
    
    try {
      const request = {
        propertyId: listing.id,
        roomType: selectedRoom as any,
        style: selectedStyle as any,
        budget: selectedBudget as any,
        targetDemographic: 'veteran' as any,
        originalImageUrl: initialImage,
        preferences: {
          colorScheme: preferences.colorScheme as any,
          accessibility: preferences.accessibility,
          veteranThemes: preferences.veteranThemes,
          petFriendly: preferences.petFriendly,
          smartHome: preferences.smartHome
        }
      };

      const result = await virtualStagingEngine.stageProperty(request);
      setStagingResult(result);
      
      toast.success('🎨 Virtual staging complete! Property transformed with AI magic.');
      
    } catch (error) {
      toast.error('Failed to stage property: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsStaging(false);
    }
  };

  const handleDownloadStaging = () => {
    if (stagingResult) {
      // Simulate download
      toast.success('📱 Staging images downloaded successfully');
    }
  };

  const handleShareStaging = () => {
    if (stagingResult) {
      navigator.clipboard.writeText(stagingResult.stagedImage);
      toast.success('🔗 Staging link copied to clipboard');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRoomIcon = (room: string) => {
    const icons: Record<string, any> = {
      living_room: Home,
      bedroom: Home,
      kitchen: Home,
      dining_room: Home,
      bathroom: Home,
      office: Home,
      outdoor: Home
    };
    const IconComponent = icons[room] || Home;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStyleBadgeColor = (style: string) => {
    const colors: Record<string, string> = {
      modern: 'bg-blue-100 text-blue-800',
      traditional: 'bg-green-100 text-green-800',
      rustic: 'bg-orange-100 text-orange-800',
      minimalist: 'bg-gray-100 text-gray-800',
      luxury: 'bg-purple-100 text-purple-800',
      veteran_friendly: 'bg-red-100 text-red-800'
    };
    return colors[style] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Staging Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Virtual Staging
            <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100">
              Powered by LEO AI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Room and Style Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Room Type</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="living_room">Living Room</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="dining_room">Dining Room</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="outdoor">Outdoor Space</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Design Style</Label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="traditional">Traditional</SelectItem>
                  <SelectItem value="rustic">Rustic</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="family_friendly">Family Friendly</SelectItem>
                  <SelectItem value="veteran_friendly">Veteran Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">Budget Range</Label>
              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low ($500 - $2,000)</SelectItem>
                  <SelectItem value="medium">Medium ($2,000 - $5,000)</SelectItem>
                  <SelectItem value="high">High ($5,000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="accessibility"
                checked={preferences.accessibility}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, accessibility: checked }))
                }
              />
              <Label htmlFor="accessibility" className="text-sm flex items-center gap-1">
                <Accessibility className="w-3 h-3" />
                Accessible
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="veteran"
                checked={preferences.veteranThemes}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, veteranThemes: checked }))
                }
              />
              <Label htmlFor="veteran" className="text-sm flex items-center gap-1">
                <Flag className="w-3 h-3" />
                Veteran
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="smart"
                checked={preferences.smartHome}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, smartHome: checked }))
                }
              />
              <Label htmlFor="smart" className="text-sm flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Smart Home
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="pet"
                checked={preferences.petFriendly}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, petFriendly: checked }))
                }
              />
              <Label htmlFor="pet" className="text-sm">Pet Friendly</Label>
            </div>
            
            <div>
              <Select 
                value={preferences.colorScheme} 
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, colorScheme: value }))
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">Warm Colors</SelectItem>
                  <SelectItem value="cool">Cool Colors</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="bold">Bold Colors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Staging Button */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleStageProperty}
              disabled={isStaging || !initialImage}
              className="flex-1"
            >
              {isStaging ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Staging in Progress...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Virtual Staging
                </>
              )}
            </Button>
            
            {stagingResult && (
              <Button variant="outline" onClick={() => setShowComparison(!showComparison)}>
                <Eye className="w-4 h-4 mr-2" />
                {showComparison ? 'Hide' : 'Show'} Comparison
              </Button>
            )}
          </div>

          {/* Processing Progress */}
          {isStaging && (
            <div className="space-y-2">
              <Progress value={75} className="h-2" />
              <p className="text-sm text-gray-600 text-center">
                LEO AI is analyzing the space and applying {selectedStyle} design elements...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staging Results */}
      {stagingResult && (
        <div className="space-y-6">
          {/* Before/After Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Virtual Staging Results
                  <Badge className={getStyleBadgeColor(selectedStyle)}>
                    {selectedStyle.replace('_', ' ').toUpperCase()}
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadStaging}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShareStaging}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showComparison ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Original
                    </h4>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
                      <div className="text-center text-gray-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Original Property Image</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      AI Staged
                      <Badge variant="outline" className="text-xs">
                        {stagingResult.confidence}% Confidence
                      </Badge>
                    </h4>
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-blue-200">
                      <div className="text-center">
                        <Wand2 className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                        <p className="text-blue-700 font-medium">AI Generated Staging</p>
                        <p className="text-sm text-blue-600">{selectedRoom.replace('_', ' ')} • {selectedStyle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    AI Staged Result
                    <Badge variant="outline">{stagingResult.confidence}% AI Confidence</Badge>
                  </h4>
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-blue-200">
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                      <h3 className="text-xl font-semibold text-green-700 mb-2">Staging Complete!</h3>
                      <p className="text-blue-700 font-medium">{selectedRoom.replace('_', ' ')} • {selectedStyle} Style</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Processed in {(stagingResult.processingTime / 1000).toFixed(1)}s
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staging Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Furniture & Decor</span>
                  <span className="font-medium">{formatCurrency(stagingResult.stagingDetails.totalValue * 0.7)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paint & Materials</span>
                  <span className="font-medium">{formatCurrency(stagingResult.stagingDetails.totalValue * 0.2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Labor & Installation</span>
                  <span className="font-medium">{formatCurrency(stagingResult.stagingDetails.totalValue * 0.1)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Investment</span>
                    <span className="text-lg">{formatCurrency(stagingResult.stagingDetails.estimatedCost)}</span>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm text-green-800">
                    <strong>ROI Potential:</strong> +15-25% property value increase
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staging Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="w-5 h-5" />
                  Staging Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Furniture Items</span>
                  <span className="font-medium">{stagingResult.stagingDetails.furnitureAdded.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Color Changes</span>
                  <span className="font-medium">{stagingResult.stagingDetails.colorChanges.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lighting Updates</span>
                  <span className="font-medium">{stagingResult.stagingDetails.lightingImprovements.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Decorative Elements</span>
                  <span className="font-medium">{stagingResult.stagingDetails.decorativeElements.length}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Processing Cost</span>
                    <span className="font-medium">{formatCurrency(stagingResult.cost)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alternative Staging Options */}
          {stagingResult.alternatives && stagingResult.alternatives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Alternative Staging Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stagingResult.alternatives.map((alt: any, index: number) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAlternative === index 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAlternative(selectedAlternative === index ? null : index)}
                    >
                      <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">{alt.style} Preview</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={getStyleBadgeColor(alt.style)}>
                            {alt.style}
                          </Badge>
                          {alt.veteranFriendly && (
                            <Badge variant="outline" className="text-xs">
                              <Flag className="w-3 h-3 mr-1" />
                              Veteran
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">{alt.description}</p>
                        <p className="text-sm text-gray-600">
                          Est. Cost: {formatCurrency(alt.estimatedCost)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shopping List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Implementation Shopping List
                  <Badge variant="outline">{stagingResult.stagingDetails.shoppingList.length} items</Badge>
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowShoppingList(!showShoppingList)}
                >
                  {showShoppingList ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </CardHeader>
            {showShoppingList && (
              <CardContent>
                <div className="space-y-3">
                  {stagingResult.stagingDetails.shoppingList.slice(0, 6).map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          {item.urgency === 'high' && (
                            <Badge variant="destructive" className="text-xs">High Priority</Badge>
                          )}
                        </div>
                        <p className="font-medium text-sm">{item.item}</p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} • {item.retailer}
                        </p>
                        {item.diyAlternative && (
                          <p className="text-xs text-blue-600">💡 DIY: {item.diyAlternative}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(item.priceRange.min)} - {formatCurrency(item.priceRange.max)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {stagingResult.stagingDetails.shoppingList.length > 6 && (
                    <div className="text-center text-sm text-gray-600 pt-2">
                      +{stagingResult.stagingDetails.shoppingList.length - 6} more items...
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Export Shopping List
                </Button>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Find Contractors
                </Button>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
                <Button variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Save to Favorites
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Image State */}
      {!initialImage && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Upload Property Images</h3>
            <p className="text-gray-600 mb-4">
              Upload photos of the property to start virtual staging with LEO AI
            </p>
            <Button>
              <ImageIcon className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
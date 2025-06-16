import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Play, 
  Maximize, 
  Share2,
  Download,
  Heart,
  X
} from 'lucide-react';
import { Listing } from '../types/listing';

interface PhotoGalleryProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

interface MediaItem {
  type: 'photo' | 'video' | 'virtual_tour';
  url: string;
  thumbnail?: string;
  caption?: string;
  is360?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ listing, isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Generate demo media items (in production, this would come from the listing data)
  const mediaItems: MediaItem[] = [
    { type: 'photo', url: '/placeholder.svg', caption: 'Front exterior view' },
    { type: 'photo', url: '/placeholder.svg', caption: 'Living room with fireplace' },
    { type: 'photo', url: '/placeholder.svg', caption: 'Modern kitchen with granite counters' },
    { type: 'photo', url: '/placeholder.svg', caption: 'Master bedroom' },
    { type: 'photo', url: '/placeholder.svg', caption: 'Master bathroom' },
    { type: 'virtual_tour', url: '/placeholder.svg', caption: '360° Virtual Tour', is360: true },
    { type: 'video', url: '/placeholder.svg', caption: 'Property walkthrough video' },
    { type: 'photo', url: '/placeholder.svg', caption: 'Backyard and patio' },
  ];

  const currentItem = mediaItems[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const toggleFavorite = (url: string) => {
    setFavorites(prev => 
      prev.includes(url) 
        ? prev.filter(fav => fav !== url)
        : [...prev, url]
    );
  };

  const shareImage = () => {
    if (navigator.share) {
      navigator.share({
        title: `Property Photo - ${listing.address}`,
        text: `Check out this photo from ${listing.address}`,
        url: currentItem.url
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = currentItem.url;
    link.download = `${listing.address.replace(/[^a-zA-Z0-9]/g, '_')}_${currentIndex + 1}.jpg`;
    link.click();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <div className="flex h-full">
          {/* Main Image Area */}
          <div className="flex-1 relative bg-black">
            {/* Image/Media Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              {currentItem.type === 'photo' && (
                <img
                  src={currentItem.url}
                  alt={currentItem.caption}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              
              {currentItem.type === 'virtual_tour' && (
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                  <div className="text-center text-white">
                    <Play className="w-24 h-24 mx-auto mb-4 opacity-75" />
                    <h3 className="text-2xl font-bold mb-2">360° Virtual Tour</h3>
                    <p className="text-lg opacity-75">Click to start immersive experience</p>
                    <Button className="mt-4" variant="secondary">
                      Launch Virtual Tour
                    </Button>
                  </div>
                </div>
              )}
              
              {currentItem.type === 'video' && (
                <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    <Play className="w-24 h-24 mx-auto mb-4 opacity-75" />
                    <h3 className="text-2xl font-bold mb-2">Property Walkthrough</h3>
                    <p className="text-lg opacity-75">Professional video tour</p>
                    <Button className="mt-4" variant="secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Play Video
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={prevImage}
              disabled={mediaItems.length <= 1}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
              onClick={nextImage}
              disabled={mediaItems.length <= 1}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-black/50 text-white">
                  {currentIndex + 1} / {mediaItems.length}
                </Badge>
                {currentItem.is360 && (
                  <Badge variant="outline" className="bg-black/50 text-white border-white">
                    360°
                  </Badge>
                )}
                {currentItem.type === 'video' && (
                  <Badge variant="outline" className="bg-black/50 text-white border-white">
                    Video
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={() => toggleFavorite(currentItem.url)}
                >
                  <Heart 
                    className={`w-4 h-4 ${
                      favorites.includes(currentItem.url) ? 'fill-red-500 text-red-500' : ''
                    }`} 
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={shareImage}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={downloadImage}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Caption */}
            {currentItem.caption && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 text-white p-3 rounded-lg">
                  <p className="text-sm">{currentItem.caption}</p>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Sidebar */}
          <div className="w-64 bg-gray-50 border-l flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-sm text-gray-900 mb-1">
                Property Photos
              </h3>
              <p className="text-xs text-gray-500">
                {listing.address}
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-2 gap-2">
                {mediaItems.map((item, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                      {item.type === 'photo' && (
                        <Camera className="w-6 h-6 text-gray-400" />
                      )}
                      {item.type === 'video' && (
                        <Play className="w-6 h-6 text-gray-400" />
                      )}
                      {item.type === 'virtual_tour' && (
                        <div className="text-center">
                          <Maximize className="w-6 h-6 text-gray-400 mx-auto" />
                          <div className="text-xs text-gray-400 mt-1">360°</div>
                        </div>
                      )}
                    </div>
                    
                    {favorites.includes(item.url) && (
                      <Heart className="absolute top-1 right-1 w-3 h-3 fill-red-500 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer with property info */}
            <div className="p-4 border-t bg-white">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Score: {listing.score}/100</div>
                <div>Price: ${listing.price?.toLocaleString()}</div>
                <div className="flex gap-1 mt-2">
                  {listing.creativeFinancing?.ownerFinancing && (
                    <Badge variant="secondary" className="text-xs">Owner Finance</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
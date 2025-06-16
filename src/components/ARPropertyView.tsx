import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Scan, 
  Target, 
  Info, 
  X,
  Maximize,
  RotateCcw,
  Zap,
  MapPin,
  DollarSign
} from 'lucide-react';
import { Listing } from '../types/listing';
import { toast } from 'sonner';

interface ARPropertyViewProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

interface AROverlay {
  id: string;
  x: number;
  y: number;
  type: 'info' | 'price' | 'score' | 'feature';
  content: string;
  color: string;
}

export const ARPropertyView: React.FC<ARPropertyViewProps> = ({ 
  listing, 
  isOpen, 
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [overlays, setOverlays] = useState<AROverlay[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setupDeviceOrientation();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      removeDeviceOrientation();
    };
  }, [isOpen]);

  const setupDeviceOrientation = () => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        setDeviceOrientation({
          alpha: event.alpha || 0,
          beta: event.beta || 0,
          gamma: event.gamma || 0
        });
      };

      // Request permission for iOS devices
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((response: string) => {
            if (response === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(() => {
            toast.info('📱 Device orientation access denied. AR features limited.');
          });
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
  };

  const removeDeviceOrientation = () => {
    window.removeEventListener('deviceorientation', () => {});
  };

  const startCamera = async () => {
    try {
      // Request camera with AR-optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsStreaming(true);
        
        // Generate AR overlays after camera starts
        setTimeout(() => {
          generateAROverlays();
        }, 1000);

        toast.success('📱 AR Camera activated! Point at the property.');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('📱 Camera access denied. AR features unavailable.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setOverlays([]);
  };

  const generateAROverlays = () => {
    // Simulate AI-detected property features with dynamic positioning
    const newOverlays: AROverlay[] = [
      {
        id: '1',
        x: 20 + Math.random() * 10,
        y: 30 + Math.random() * 10,
        type: 'price',
        content: `$${listing.price?.toLocaleString()}`,
        color: '#10b981'
      },
      {
        id: '2',
        x: 70 + Math.random() * 10,
        y: 25 + Math.random() * 10,
        type: 'score',
        content: `LEO Score: ${listing.score}/100`,
        color: getScoreColor(listing.score || 0)
      },
      {
        id: '3',
        x: 30 + Math.random() * 10,
        y: 60 + Math.random() * 10,
        type: 'info',
        content: `${listing.bedrooms}BR/${listing.bathrooms}BA`,
        color: '#3b82f6'
      },
      {
        id: '4',
        x: 60 + Math.random() * 10,
        y: 70 + Math.random() * 10,
        type: 'feature',
        content: listing.creativeFinancing?.ownerFinancing ? 'Owner Financing!' : 'Creative Financing Available',
        color: '#f59e0b'
      }
    ];

    // Add extra overlays based on property features
    if (listing.listingType === 'Foreclosure') {
      newOverlays.push({
        id: '5',
        x: 40 + Math.random() * 10,
        y: 80 + Math.random() * 10,
        type: 'feature',
        content: 'Foreclosure Property',
        color: '#ef4444'
      });
    }

    setOverlays(newOverlays);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const scanProperty = () => {
    setIsScanning(true);
    toast.info('🔍 AI scanning property features...');
    
    // Simulate AI analysis
    setTimeout(() => {
      generateAROverlays();
      setIsScanning(false);
      toast.success('✨ Property features detected!');
    }, 2000);
  };

  const captureARPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame
        ctx.drawImage(video, 0, 0);
        
        // Draw AR overlays on canvas
        overlays.forEach(overlay => {
          const x = (overlay.x / 100) * canvas.width;
          const y = (overlay.y / 100) * canvas.height;
          
          // Draw overlay background
          ctx.fillStyle = overlay.color;
          ctx.globalAlpha = 0.8;
          ctx.fillRect(x - 5, y - 25, 120, 30);
          
          // Draw overlay text
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 1;
          ctx.font = '16px Arial';
          ctx.fillText(overlay.content, x, y - 5);
        });
        
        // Convert to downloadable image
        const link = document.createElement('a');
        link.download = `ar_${listing.address.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        toast.success('📸 AR photo saved!');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* AR Camera View */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* AR Overlays */}
        {isStreaming && overlays.map((overlay) => (
          <div
            key={overlay.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
            }}
          >
            <div
              className="px-3 py-1 rounded-lg text-white text-sm font-semibold shadow-lg animate-pulse"
              style={{ backgroundColor: overlay.color }}
            >
              {overlay.content}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                   style={{ borderTopColor: overlay.color }}>
              </div>
            </div>
          </div>
        ))}

        {/* Scanning Effect */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-500 animate-ping"></div>
            <div className="absolute top-1/4 left-1/2 w-32 h-32 border-2 border-blue-500 rounded-full animate-spin transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        )}

        {/* AR Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <Badge variant="secondary" className="bg-black/50 text-white border-white">
              🔮 AR Mode
            </Badge>
            {deviceOrientation.alpha !== 0 && (
              <Badge variant="outline" className="bg-black/50 text-white border-white text-xs">
                📱 {Math.round(deviceOrientation.alpha)}°
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Property Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-black/80 text-white border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{listing.address}</h3>
                <Badge variant="outline" className="text-white border-white">
                  LEO Score: {listing.score}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>${listing.price?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{listing.bedrooms}BR/{listing.bathrooms}BA</span>
                </div>
              </div>
              
              {listing.creativeFinancing?.ownerFinancing && (
                <Badge variant="secondary" className="mt-2">
                  🏦 Owner Financing Available
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AR Action Buttons */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={scanProperty}
            disabled={isScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isScanning ? (
              <Target className="w-6 h-6 animate-spin" />
            ) : (
              <Scan className="w-6 h-6" />
            )}
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={captureARPhoto}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Camera className="w-6 h-6" />
          </Button>
        </div>

        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-8 h-8 border-2 border-white rounded-full opacity-50">
            <div className="w-1 h-1 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <Zap className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold mb-2">Activating AR Camera</h3>
            <p className="text-gray-300">Point your camera at the property</p>
          </div>
        </div>
      )}
    </div>
  );
};
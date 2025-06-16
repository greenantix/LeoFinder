
import React from 'react';
import { Shield, Heart, Target } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-white/10 p-3 rounded-full">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Home Awaits</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Finding veteran-friendly homes with zero down payment options. 
            You've served our country - now let us serve you.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="bg-white/10 p-2 rounded-lg mb-2 mx-auto w-fit">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-xs font-medium">Smart Matching</div>
            <div className="text-xs text-blue-200">AI-powered search</div>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 p-2 rounded-lg mb-2 mx-auto w-fit">
              <Heart className="w-5 h-5" />
            </div>
            <div className="text-xs font-medium">Pet Friendly</div>
            <div className="text-xs text-blue-200">Your dogs welcome</div>
          </div>
          
          <div className="text-center">
            <div className="bg-white/10 p-2 rounded-lg mb-2 mx-auto w-fit">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-xs font-medium">Veteran Focus</div>
            <div className="text-xs text-blue-200">Made for heroes</div>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <div className="text-sm font-medium mb-1">🎯 Today's Mission Status</div>
          <div className="text-xs text-blue-100">
            Scanning for new opportunities • Email templates ready • Your next home is out there
          </div>
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import { Home, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  totalListings: number;
  matchedListings: number;
}

export const Header: React.FC<HeaderProps> = ({ totalListings, matchedListings }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ZeroDownHero</h1>
            <p className="text-xs text-gray-600">Finding your home, zero down required</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">
              <span className="font-semibold text-blue-600">{matchedListings}</span> matches
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{totalListings} total</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
            Live updates
          </div>
        </div>
      </div>
    </header>
  );
};

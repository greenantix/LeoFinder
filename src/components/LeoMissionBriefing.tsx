
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Target, Mail, TrendingUp, Heart } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generateLeoMessage } from '../utils/leoPersona';

interface LeoMissionBriefingProps {
  newLeadsCount: number;
  emailsSentToday: number;
  highMatchCount: number;
  topMatchScore?: number;
}

export const LeoMissionBriefing: React.FC<LeoMissionBriefingProps> = ({ 
  newLeadsCount, 
  emailsSentToday, 
  highMatchCount,
  topMatchScore 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const briefings = [
    newLeadsCount > 0 && {
      icon: Target,
      message: generateLeoMessage('briefing', { count: newLeadsCount }),
      variant: 'success'
    },
    emailsSentToday > 0 && {
      icon: Mail,
      message: generateLeoMessage('celebration', { count: emailsSentToday }),
      variant: 'info'
    },
    topMatchScore && topMatchScore >= 80 && {
      icon: TrendingUp,
      message: generateLeoMessage('alert', { score: topMatchScore }),
      variant: 'urgent'
    }
  ].filter(Boolean);

  if (briefings.length === 0) {
    briefings.push({
      icon: Heart,
      message: { content: "LEO here! I'm actively hunting for your next opportunity. Stay tuned!" },
      variant: 'neutral'
    });
  }

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'success': return 'border-green-200 bg-green-50 text-green-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'urgent': return 'border-red-200 bg-red-50 text-red-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-4 border-2 border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-900">LEO's Mission Briefing</span>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="space-y-2">
              {briefings.map((briefing, index) => {
                const IconComponent = briefing.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${getVariantStyles(briefing.variant)}`}
                  >
                    <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm font-medium">{briefing.message.content}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

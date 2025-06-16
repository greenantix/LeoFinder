
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Target, Mail, TrendingUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MissionFeedProps {
  newLeadsCount: number;
  emailsSentToday: number;
  highMatchCount: number;
  topMatchScore?: number;
}

export const MissionFeed: React.FC<MissionFeedProps> = ({ 
  newLeadsCount, 
  emailsSentToday, 
  highMatchCount,
  topMatchScore 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const getMissionBriefing = () => {
    const briefings = [];
    
    if (newLeadsCount > 0) {
      briefings.push({
        icon: Target,
        text: `${newLeadsCount} new leads flagged today. Tap to view.`,
        variant: 'success' as const
      });
    }
    
    if (emailsSentToday > 0) {
      briefings.push({
        icon: Mail,
        text: `${emailsSentToday} email${emailsSentToday > 1 ? 's' : ''} sent today. Great work!`,
        variant: 'info' as const
      });
    }
    
    if (topMatchScore && topMatchScore >= 80) {
      briefings.push({
        icon: TrendingUp,
        text: `Claude flagged a high match at ${topMatchScore}% — don't miss this one.`,
        variant: 'urgent' as const
      });
    }

    if (briefings.length === 0) {
      briefings.push({
        icon: Target,
        text: "Mission ready. Standing by for new opportunities.",
        variant: 'neutral' as const
      });
    }

    return briefings;
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'urgent':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const briefings = getMissionBriefing();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-4 border-2 border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-900">Mission Briefing</span>
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
                    <span className="text-sm font-medium">{briefing.text}</span>
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

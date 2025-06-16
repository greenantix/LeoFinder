
export interface LeoPersona {
  mission: string;
  personality: {
    loyal: boolean;
    efficient: boolean;
    optimistic: boolean;
  };
  currentMood: 'hunting' | 'analyzing' | 'alerting' | 'celebrating';
}

export interface LeoMessage {
  id: string;
  type: 'briefing' | 'alert' | 'celebration' | 'analysis';
  content: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface OpportunityScore {
  percentage: number;
  breakdown: {
    creativeFinancing: number;
    sellerMotivation: number;
    dogFriendliness: number;
    marketConditions: number;
  };
  confidence: 'low' | 'medium' | 'high';
}

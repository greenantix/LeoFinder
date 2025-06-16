
import { LeoPersona, LeoMessage, OpportunityScore } from '../types/leo';

export const createLeoPersona = (): LeoPersona => ({
  mission: "To tirelessly hunt for the best real estate opportunities that meet your specific criteria",
  personality: {
    loyal: true,
    efficient: true,
    optimistic: true
  },
  currentMood: 'hunting'
});

export const generateLeoMessage = (
  type: LeoMessage['type'], 
  data: any
): LeoMessage => {
  const messages = {
    briefing: [
      `I've found ${data.count} new potential deals for you today`,
      `Your next home is out there - I'm on the hunt!`,
      `Mission status: ${data.count} opportunities flagged for review`
    ],
    alert: [
      `🎯 High-value opportunity detected at ${data.address}!`,
      `New foreclosure listing matches your criteria - act fast!`,
      `Motivated seller alert: ${data.address} shows strong indicators`
    ],
    celebration: [
      `Great work! Email sent for ${data.address}`,
      `Another lead contacted - you're building your portfolio!`,
      `Mission accomplished: ${data.count} properties contacted today`
    ],
    analysis: [
      `I've analyzed ${data.address} - ${data.score}% match for your criteria`,
      `This property shows strong creative financing potential`,
      `Dog-friendly location confirmed with nearby amenities`
    ]
  };

  const messageArray = messages[type];
  const content = messageArray[Math.floor(Math.random() * messageArray.length)];

  return {
    id: Date.now().toString(),
    type,
    content,
    timestamp: new Date().toISOString(),
    priority: type === 'alert' ? 'urgent' : 'medium'
  };
};

export const calculateOpportunityScore = (listing: any): OpportunityScore => {
  const description = listing.description?.toLowerCase() || '';
  
  // Creative financing keywords
  const creativeFinancingKeywords = [
    'owner financing', 'seller financing', 'lease option', 'rent to own',
    'contract for deed', 'subject to', 'no bank', 'flexible terms'
  ];
  
  // Seller motivation keywords
  const motivationKeywords = [
    'motivated seller', 'must sell', 'needs tlc', 'as-is', 'investor special',
    'quick sale', 'below market', 'priced to sell'
  ];

  const creativeFinancing = creativeFinancingKeywords.reduce((score, keyword) => {
    return description.includes(keyword) ? score + 25 : score;
  }, 0);

  const sellerMotivation = motivationKeywords.reduce((score, keyword) => {
    return description.includes(keyword) ? score + 20 : score;
  }, 0);

  const dogFriendliness = (listing.lot_size && listing.lot_size.includes('acre')) ? 30 : 
                         description.includes('fenced') ? 25 : 
                         description.includes('yard') ? 15 : 0;

  const marketConditions = listing.source === 'foreclosure' ? 20 : 
                          listing.source === 'craigslist' ? 15 : 10;

  const totalScore = Math.min(100, creativeFinancing + sellerMotivation + dogFriendliness + marketConditions);

  return {
    percentage: totalScore,
    breakdown: {
      creativeFinancing,
      sellerMotivation,
      dogFriendliness,
      marketConditions
    },
    confidence: totalScore >= 70 ? 'high' : totalScore >= 40 ? 'medium' : 'low'
  };
};

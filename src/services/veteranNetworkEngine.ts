import { Listing } from '../types/listing';

interface VeteranProfile {
  id: string;
  username: string;
  displayName: string;
  branch: 'army' | 'navy' | 'air_force' | 'marines' | 'coast_guard' | 'space_force';
  rank?: string;
  serviceYears: { start: number; end?: number };
  specialties: string[];
  location: {
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  interests: PropertyInterest[];
  expertise: VeteranExpertise[];
  connections: string[]; // User IDs
  reputation: {
    score: number; // 0-100
    reviewCount: number;
    helpfulVotes: number;
  };
  preferences: {
    shareLocation: boolean;
    allowMessages: boolean;
    publicProfile: boolean;
    mentoring: boolean;
    notifications: NotificationSettings;
  };
  createdAt: Date;
  lastActive: Date;
  verified: boolean;
}

interface PropertyInterest {
  type: 'buying' | 'selling' | 'investing' | 'renting';
  budget?: { min: number; max: number };
  locations: string[]; // ZIP codes or cities
  criteria: {
    propertyTypes: string[];
    minBedrooms?: number;
    maxBedrooms?: number;
    features: string[];
  };
  timeline: 'immediate' | 'within_3_months' | 'within_6_months' | 'within_year' | 'exploring';
  priority: 'high' | 'medium' | 'low';
}

interface VeteranExpertise {
  category: 'real_estate' | 'home_improvement' | 'financing' | 'legal' | 'moving' | 'career' | 'benefits';
  skills: string[];
  experience: 'beginner' | 'intermediate' | 'expert' | 'professional';
  certifications?: string[];
  willingToHelp: boolean;
  rateType: 'free' | 'volunteer' | 'discounted' | 'professional';
}

interface NotificationSettings {
  newConnections: boolean;
  propertyMatches: boolean;
  messages: boolean;
  groupUpdates: boolean;
  marketAlerts: boolean;
  communityEvents: boolean;
}

interface VeteranGroup {
  id: string;
  name: string;
  description: string;
  type: 'local' | 'interest' | 'branch' | 'professional' | 'support';
  location?: string;
  tags: string[];
  memberCount: number;
  privacy: 'public' | 'private' | 'invite_only';
  admins: string[];
  members: GroupMember[];
  discussions: Discussion[];
  events: CommunityEvent[];
  resources: Resource[];
  createdAt: Date;
  rules: string[];
}

interface GroupMember {
  userId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
  contributions: number;
  lastActivity: Date;
}

interface Discussion {
  id: string;
  title: string;
  category: 'general' | 'properties' | 'advice' | 'resources' | 'events';
  author: string;
  content: string;
  tags: string[];
  replies: Reply[];
  likes: number;
  views: number;
  pinned: boolean;
  locked: boolean;
  createdAt: Date;
  lastActivity: Date;
}

interface Reply {
  id: string;
  author: string;
  content: string;
  likes: number;
  helpful: boolean;
  createdAt: Date;
  edited?: Date;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'virtual' | 'in_person' | 'hybrid';
  category: 'education' | 'networking' | 'social' | 'volunteer' | 'professional';
  organizer: string;
  location?: {
    address: string;
    city: string;
    state: string;
    virtual?: boolean;
    meetingLink?: string;
  };
  dateTime: {
    start: Date;
    end: Date;
    timezone: string;
  };
  capacity?: number;
  attendees: EventAttendee[];
  requirements?: string[];
  benefits: string[];
  cost: number;
  veteranOnly: boolean;
  tags: string[];
  createdAt: Date;
}

interface EventAttendee {
  userId: string;
  status: 'attending' | 'maybe' | 'declined';
  registeredAt: Date;
  checkedIn?: Date;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'link' | 'video' | 'tool' | 'contact';
  category: 'va_benefits' | 'home_buying' | 'financing' | 'legal' | 'career' | 'education';
  url?: string;
  fileUrl?: string;
  tags: string[];
  author: string;
  rating: number;
  downloads: number;
  verified: boolean;
  veteranSpecific: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NetworkMatch {
  user1: string;
  user2: string;
  matchType: 'location' | 'interests' | 'expertise' | 'branch' | 'timeline';
  score: number; // 0-100
  commonFactors: string[];
  suggestedActions: string[];
  introduced: boolean;
  introducedAt?: Date;
}

interface MentorshipPair {
  id: string;
  mentor: string;
  mentee: string;
  focus: string[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  sessions: MentorshipSession[];
  goals: string[];
  progress: {
    goalsCompleted: number;
    sessionsHeld: number;
    menteeRating?: number;
    mentorRating?: number;
  };
}

interface MentorshipSession {
  id: string;
  scheduledDate: Date;
  duration: number; // minutes
  type: 'video' | 'phone' | 'in_person' | 'text';
  topics: string[];
  notes?: string;
  completed: boolean;
  rating?: number;
}

interface PropertyRecommendation {
  listingId: string;
  targetUser: string;
  score: number;
  reasons: string[];
  sharedBy?: string;
  sharedAt?: Date;
  viewed: boolean;
  saved: boolean;
  feedback?: 'interested' | 'not_interested' | 'contacted';
}

export class VeteranNetworkEngine {
  private users = new Map<string, VeteranProfile>();
  private groups = new Map<string, VeteranGroup>();
  private matches = new Map<string, NetworkMatch[]>();
  private mentorships = new Map<string, MentorshipPair>();
  private recommendations = new Map<string, PropertyRecommendation[]>();
  private events = new Map<string, CommunityEvent>();

  constructor() {
    this.initializeSampleData();
  }

  // User Management
  async createVeteranProfile(userData: Partial<VeteranProfile>): Promise<VeteranProfile> {
    const profile: VeteranProfile = {
      id: `vet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: userData.username || `veteran_${Math.floor(Math.random() * 10000)}`,
      displayName: userData.displayName || 'Anonymous Veteran',
      branch: userData.branch || 'army',
      serviceYears: userData.serviceYears || { start: 2000 },
      specialties: userData.specialties || [],
      location: userData.location || { city: 'Phoenix', state: 'AZ', zipCode: '85001' },
      interests: userData.interests || [],
      expertise: userData.expertise || [],
      connections: [],
      reputation: { score: 50, reviewCount: 0, helpfulVotes: 0 },
      preferences: {
        shareLocation: true,
        allowMessages: true,
        publicProfile: true,
        mentoring: false,
        notifications: {
          newConnections: true,
          propertyMatches: true,
          messages: true,
          groupUpdates: true,
          marketAlerts: false,
          communityEvents: true
        }
      },
      createdAt: new Date(),
      lastActive: new Date(),
      verified: false
    };

    this.users.set(profile.id, profile);
    
    // Find potential matches
    setTimeout(() => {
      this.findNetworkMatches(profile.id);
    }, 1000);

    return profile;
  }

  async updateVeteranProfile(userId: string, updates: Partial<VeteranProfile>): Promise<VeteranProfile> {
    const profile = this.users.get(userId);
    if (!profile) {
      throw new Error('User not found');
    }

    const updatedProfile = { ...profile, ...updates };
    this.users.set(userId, updatedProfile);
    
    return updatedProfile;
  }

  // Network Matching
  async findNetworkMatches(userId: string): Promise<NetworkMatch[]> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const matches: NetworkMatch[] = [];
    const allUsers = Array.from(this.users.values()).filter(u => u.id !== userId);

    for (const otherUser of allUsers) {
      const match = this.calculateUserMatch(user, otherUser);
      if (match.score >= 60) { // Minimum match threshold
        matches.push(match);
      }
    }

    // Sort by score
    matches.sort((a, b) => b.score - a.score);
    
    // Store matches
    this.matches.set(userId, matches.slice(0, 10)); // Keep top 10 matches
    
    return matches;
  }

  private calculateUserMatch(user1: VeteranProfile, user2: VeteranProfile): NetworkMatch {
    let score = 0;
    const commonFactors: string[] = [];
    const suggestedActions: string[] = [];

    // Branch compatibility (20 points)
    if (user1.branch === user2.branch) {
      score += 20;
      commonFactors.push(`Both served in ${user1.branch}`);
    }

    // Location proximity (25 points)
    const distance = this.calculateDistance(user1.location, user2.location);
    if (distance <= 25) { // Within 25 miles
      score += 25;
      commonFactors.push('Located nearby');
      suggestedActions.push('Meet for coffee or property viewing');
    } else if (distance <= 50) {
      score += 15;
      commonFactors.push('Same metro area');
    }

    // Interest overlap (30 points)
    const interestOverlap = this.calculateInterestOverlap(user1.interests, user2.interests);
    score += interestOverlap * 30;
    if (interestOverlap > 0.3) {
      commonFactors.push('Similar property interests');
      suggestedActions.push('Share property recommendations');
    }

    // Expertise complementarity (25 points)
    const expertiseMatch = this.calculateExpertiseMatch(user1.expertise, user2.expertise);
    score += expertiseMatch * 25;
    if (expertiseMatch > 0.5) {
      commonFactors.push('Complementary expertise');
      suggestedActions.push('Offer mutual assistance');
    }

    // Determine match type
    let matchType: NetworkMatch['matchType'] = 'interests';
    if (distance <= 25) matchType = 'location';
    else if (user1.branch === user2.branch) matchType = 'branch';
    else if (expertiseMatch > 0.5) matchType = 'expertise';

    return {
      user1: user1.id,
      user2: user2.id,
      matchType,
      score: Math.round(score),
      commonFactors,
      suggestedActions,
      introduced: false
    };
  }

  private calculateDistance(loc1: VeteranProfile['location'], loc2: VeteranProfile['location']): number {
    // Simplified distance calculation (in production, use proper geolocation)
    if (loc1.zipCode === loc2.zipCode) return 0;
    if (loc1.city === loc2.city) return Math.random() * 15;
    if (loc1.state === loc2.state) return 25 + Math.random() * 100;
    return 200 + Math.random() * 500;
  }

  private calculateInterestOverlap(interests1: PropertyInterest[], interests2: PropertyInterest[]): number {
    if (interests1.length === 0 || interests2.length === 0) return 0;

    let commonInterests = 0;
    let totalInterests = 0;

    for (const interest1 of interests1) {
      for (const interest2 of interests2) {
        totalInterests++;
        
        // Check type overlap
        if (interest1.type === interest2.type) commonInterests += 0.3;
        
        // Check location overlap
        const locationOverlap = interest1.locations.some(loc => interest2.locations.includes(loc));
        if (locationOverlap) commonInterests += 0.4;
        
        // Check timeline compatibility
        if (interest1.timeline === interest2.timeline) commonInterests += 0.3;
      }
    }

    return totalInterests > 0 ? commonInterests / totalInterests : 0;
  }

  private calculateExpertiseMatch(expertise1: VeteranExpertise[], expertise2: VeteranExpertise[]): number {
    if (expertise1.length === 0 || expertise2.length === 0) return 0;

    let matchScore = 0;
    let comparisons = 0;

    for (const exp1 of expertise1) {
      for (const exp2 of expertise2) {
        comparisons++;
        
        // Same category, different experience levels = good mentorship match
        if (exp1.category === exp2.category && exp1.experience !== exp2.experience) {
          matchScore += 0.8;
        }
        
        // Complementary categories
        if (this.isComplementaryExpertise(exp1.category, exp2.category)) {
          matchScore += 0.6;
        }
      }
    }

    return comparisons > 0 ? matchScore / comparisons : 0;
  }

  private isComplementaryExpertise(cat1: string, cat2: string): boolean {
    const complementaryPairs = [
      ['real_estate', 'financing'],
      ['home_improvement', 'real_estate'],
      ['legal', 'real_estate'],
      ['career', 'benefits'],
      ['moving', 'real_estate']
    ];

    return complementaryPairs.some(pair => 
      (pair[0] === cat1 && pair[1] === cat2) || 
      (pair[1] === cat1 && pair[0] === cat2)
    );
  }

  // Group Management
  async createVeteranGroup(groupData: Partial<VeteranGroup>, creatorId: string): Promise<VeteranGroup> {
    const group: VeteranGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: groupData.name || 'New Veteran Group',
      description: groupData.description || '',
      type: groupData.type || 'interest',
      location: groupData.location,
      tags: groupData.tags || [],
      memberCount: 1,
      privacy: groupData.privacy || 'public',
      admins: [creatorId],
      members: [{
        userId: creatorId,
        role: 'admin',
        joinedAt: new Date(),
        contributions: 0,
        lastActivity: new Date()
      }],
      discussions: [],
      events: [],
      resources: [],
      createdAt: new Date(),
      rules: groupData.rules || [
        'Treat all members with respect',
        'No spam or self-promotion',
        'Keep discussions relevant to the group topic',
        'Help fellow veterans when possible'
      ]
    };

    this.groups.set(group.id, group);
    return group;
  }

  async joinGroup(groupId: string, userId: string): Promise<boolean> {
    const group = this.groups.get(groupId);
    const user = this.users.get(userId);
    
    if (!group || !user) {
      throw new Error('Group or user not found');
    }

    // Check if already a member
    if (group.members.some(member => member.userId === userId)) {
      return false;
    }

    group.members.push({
      userId,
      role: 'member',
      joinedAt: new Date(),
      contributions: 0,
      lastActivity: new Date()
    });

    group.memberCount++;
    this.groups.set(groupId, group);
    
    return true;
  }

  // Property Recommendations
  async generatePropertyRecommendations(userId: string, listings: Listing[]): Promise<PropertyRecommendation[]> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const recommendations: PropertyRecommendation[] = [];

    for (const listing of listings) {
      const score = this.calculatePropertyMatch(user, listing);
      
      if (score >= 70) { // High match threshold
        recommendations.push({
          listingId: listing.id,
          targetUser: userId,
          score,
          reasons: this.generateMatchReasons(user, listing, score),
          viewed: false,
          saved: false
        });
      }
    }

    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);
    
    // Store recommendations
    this.recommendations.set(userId, recommendations.slice(0, 20));
    
    return recommendations;
  }

  private calculatePropertyMatch(user: VeteranProfile, listing: Listing): number {
    let score = 0;
    
    for (const interest of user.interests) {
      // Location match
      if (interest.locations.includes(listing.zipCode || '')) {
        score += 30;
      }
      
      // Budget match
      if (interest.budget && listing.price) {
        if (listing.price >= interest.budget.min && listing.price <= interest.budget.max) {
          score += 25;
        }
      }
      
      // Property type match
      if (interest.criteria.propertyTypes.includes(listing.propertyType || '')) {
        score += 20;
      }
      
      // Bedroom requirements
      if (interest.criteria.minBedrooms && listing.bedrooms && 
          listing.bedrooms >= interest.criteria.minBedrooms) {
        score += 15;
      }
      
      // VA eligibility bonus
      if (listing.flags?.va_eligible) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  private generateMatchReasons(user: VeteranProfile, listing: Listing, score: number): string[] {
    const reasons: string[] = [];
    
    if (listing.flags?.va_eligible) {
      reasons.push('VA loan eligible');
    }
    
    if (listing.creativeFinancing?.ownerFinancing) {
      reasons.push('Owner financing available');
    }
    
    if (score >= 90) {
      reasons.push('Excellent match for your criteria');
    } else if (score >= 80) {
      reasons.push('Good match for your needs');
    }
    
    // Check user interests
    for (const interest of user.interests) {
      if (interest.locations.includes(listing.zipCode || '')) {
        reasons.push('In your preferred area');
      }
      
      if (interest.timeline === 'immediate') {
        reasons.push('Available for immediate purchase');
      }
    }
    
    return reasons.slice(0, 4); // Limit to top 4 reasons
  }

  // Mentorship
  async createMentorshipPair(mentorId: string, menteeId: string, focus: string[]): Promise<MentorshipPair> {
    const mentor = this.users.get(mentorId);
    const mentee = this.users.get(menteeId);
    
    if (!mentor || !mentee) {
      throw new Error('Mentor or mentee not found');
    }

    const pair: MentorshipPair = {
      id: `mentor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mentor: mentorId,
      mentee: menteeId,
      focus,
      status: 'active',
      startDate: new Date(),
      sessions: [],
      goals: this.generateMentorshipGoals(focus),
      progress: {
        goalsCompleted: 0,
        sessionsHeld: 0
      }
    };

    this.mentorships.set(pair.id, pair);
    return pair;
  }

  private generateMentorshipGoals(focus: string[]): string[] {
    const goalTemplates: Record<string, string[]> = {
      'home_buying': [
        'Understand VA loan benefits and process',
        'Learn property evaluation techniques',
        'Develop negotiation skills',
        'Create a home buying timeline'
      ],
      'real_estate_investing': [
        'Identify investment opportunities',
        'Understand financing options',
        'Learn market analysis',
        'Develop investment strategy'
      ],
      'career_transition': [
        'Translate military skills to civilian market',
        'Build professional network',
        'Develop interview skills',
        'Create career development plan'
      ]
    };

    const goals: string[] = [];
    for (const area of focus) {
      const areaGoals = goalTemplates[area] || ['Gain knowledge in ' + area];
      goals.push(...areaGoals);
    }

    return goals.slice(0, 6); // Limit to 6 goals
  }

  // Events
  async createCommunityEvent(eventData: Partial<CommunityEvent>, organizerId: string): Promise<CommunityEvent> {
    const event: CommunityEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: eventData.title || 'Veteran Community Event',
      description: eventData.description || '',
      type: eventData.type || 'virtual',
      category: eventData.category || 'networking',
      organizer: organizerId,
      location: eventData.location,
      dateTime: eventData.dateTime || {
        start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours
        timezone: 'America/Phoenix'
      },
      capacity: eventData.capacity,
      attendees: [],
      requirements: eventData.requirements,
      benefits: eventData.benefits || [],
      cost: eventData.cost || 0,
      veteranOnly: eventData.veteranOnly || true,
      tags: eventData.tags || [],
      createdAt: new Date()
    };

    this.events.set(event.id, event);
    return event;
  }

  // Helper methods
  private initializeSampleData(): void {
    // Create sample veteran profiles
    const sampleProfiles: Partial<VeteranProfile>[] = [
      {
        username: 'phoenix_vet_22',
        displayName: 'Mike Rodriguez',
        branch: 'army',
        serviceYears: { start: 2010, end: 2018 },
        location: { city: 'Phoenix', state: 'AZ', zipCode: '85001' },
        interests: [{
          type: 'buying',
          budget: { min: 200000, max: 400000 },
          locations: ['85001', '85021', '85033'],
          criteria: { propertyTypes: ['Single Family'], minBedrooms: 3, features: ['garage', 'yard'] },
          timeline: 'within_3_months',
          priority: 'high'
        }],
        expertise: [{
          category: 'home_improvement',
          skills: ['plumbing', 'electrical', 'carpentry'],
          experience: 'expert',
          willingToHelp: true,
          rateType: 'volunteer'
        }]
      },
      {
        username: 'desert_sailor',
        displayName: 'Sarah Johnson',
        branch: 'navy',
        serviceYears: { start: 2015, end: 2023 },
        location: { city: 'Scottsdale', state: 'AZ', zipCode: '85260' },
        interests: [{
          type: 'investing',
          budget: { min: 150000, max: 300000 },
          locations: ['85260', '85251', '85254'],
          criteria: { propertyTypes: ['Condo', 'Townhouse'], features: ['pool', 'fitness'] },
          timeline: 'within_6_months',
          priority: 'medium'
        }],
        expertise: [{
          category: 'financing',
          skills: ['VA loans', 'investment analysis', 'credit repair'],
          experience: 'professional',
          willingToHelp: true,
          rateType: 'discounted'
        }]
      }
    ];

    // Create profiles
    sampleProfiles.forEach(profile => {
      this.createVeteranProfile(profile);
    });

    // Create sample groups
    const sampleGroups: Partial<VeteranGroup>[] = [
      {
        name: 'Phoenix Area Veterans Home Buyers',
        description: 'Supporting veterans in the Phoenix metro area with home buying guidance and community',
        type: 'local',
        location: 'Phoenix, AZ',
        tags: ['home-buying', 'phoenix', 'va-loans'],
        privacy: 'public'
      },
      {
        name: 'Military Real Estate Investors',
        description: 'Veterans building wealth through real estate investment',
        type: 'interest',
        tags: ['investing', 'real-estate', 'wealth-building'],
        privacy: 'public'
      }
    ];

    // Create first user as admin for sample groups
    const firstUserId = Array.from(this.users.keys())[0];
    if (firstUserId) {
      sampleGroups.forEach(group => {
        this.createVeteranGroup(group, firstUserId);
      });
    }
  }

  // Public interface methods
  getUser(userId: string): VeteranProfile | null {
    return this.users.get(userId) || null;
  }

  getMatches(userId: string): NetworkMatch[] {
    return this.matches.get(userId) || [];
  }

  getGroups(): VeteranGroup[] {
    return Array.from(this.groups.values());
  }

  getGroup(groupId: string): VeteranGroup | null {
    return this.groups.get(groupId) || null;
  }

  getRecommendations(userId: string): PropertyRecommendation[] {
    return this.recommendations.get(userId) || [];
  }

  getEvents(): CommunityEvent[] {
    return Array.from(this.events.values());
  }

  getNetworkStats(): {
    totalUsers: number;
    totalGroups: number;
    totalConnections: number;
    totalMentorships: number;
    activeEvents: number;
  } {
    const totalConnections = Array.from(this.users.values())
      .reduce((sum, user) => sum + user.connections.length, 0);
    
    const activeEvents = Array.from(this.events.values())
      .filter(event => event.dateTime.start > new Date()).length;

    return {
      totalUsers: this.users.size,
      totalGroups: this.groups.size,
      totalConnections,
      totalMentorships: this.mentorships.size,
      activeEvents
    };
  }

  async connectUsers(userId1: string, userId2: string): Promise<boolean> {
    const user1 = this.users.get(userId1);
    const user2 = this.users.get(userId2);
    
    if (!user1 || !user2) {
      throw new Error('One or both users not found');
    }

    // Add connection if not already connected
    if (!user1.connections.includes(userId2)) {
      user1.connections.push(userId2);
    }
    if (!user2.connections.includes(userId1)) {
      user2.connections.push(userId1);
    }

    // Mark match as introduced
    const matches = this.matches.get(userId1) || [];
    const match = matches.find(m => m.user2 === userId2);
    if (match) {
      match.introduced = true;
      match.introducedAt = new Date();
    }

    return true;
  }

  clearCache(): void {
    // Clear any cached data if needed
  }
}

export const veteranNetworkEngine = new VeteranNetworkEngine();
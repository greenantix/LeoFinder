import { Listing } from '../types/listing';

interface UserFeedback {
  userId: string;
  listingId: string;
  action: 'viewed' | 'saved' | 'contacted' | 'dismissed' | 'purchased' | 'rated';
  rating?: number; // 1-10 scale
  timestamp: Date;
  sessionId: string;
  timeSpent?: number; // seconds
  context: FeedbackContext;
}

interface FeedbackContext {
  searchQuery?: string;
  filters?: any;
  pagePosition?: number;
  previousActions?: string[];
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek?: string;
}

interface UserProfile {
  userId: string;
  preferences: UserPreferences;
  behaviorPatterns: BehaviorPattern[];
  demographicInfo: DemographicInfo;
  interactionHistory: UserFeedback[];
  lastModelUpdate: Date;
  personalizedWeights: FeatureWeight[];
  confidence: number; // How well we understand this user
}

interface UserPreferences {
  priceRange: { min: number; max: number };
  locations: string[];
  propertyTypes: string[];
  features: string[];
  priorities: PreferencePriority[];
  dealBreakers: string[];
  flexibilityScore: number; // How willing to compromise
}

interface PreferencePriority {
  feature: string;
  importance: number; // 0-1
  adaptability: number; // How much this can change
}

interface BehaviorPattern {
  pattern: string;
  frequency: number;
  confidence: number;
  context: string[];
  lastObserved: Date;
}

interface DemographicInfo {
  veteranStatus: boolean;
  branch?: string;
  familySize?: number;
  income?: 'low' | 'medium' | 'high';
  experience?: 'first_time' | 'experienced' | 'investor';
  timeline?: 'immediate' | 'flexible' | 'exploring';
}

interface FeatureWeight {
  feature: string;
  weight: number;
  confidence: number;
  lastUpdated: Date;
  updateCount: number;
}

interface LearningModel {
  modelId: string;
  userId: string;
  modelType: 'collaborative_filtering' | 'content_based' | 'deep_learning' | 'ensemble';
  weights: number[];
  bias: number;
  lastTrained: Date;
  accuracy: number;
  sampleSize: number;
  version: number;
}

interface AdaptationResult {
  originalScore: number;
  adaptedScore: number;
  confidenceBoost: number;
  adaptationFactors: string[];
  modelVersion: number;
  userId: string;
}

interface LearningSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  feedbackCount: number;
  learningEvents: LearningEvent[];
  modelUpdates: ModelUpdate[];
  performance: SessionPerformance;
}

interface LearningEvent {
  eventId: string;
  type: 'feedback_received' | 'pattern_detected' | 'preference_updated' | 'weight_adjusted';
  timestamp: Date;
  data: any;
  impact: number; // How much this affected the model
}

interface ModelUpdate {
  updateId: string;
  timestamp: Date;
  updateType: 'incremental' | 'batch' | 'complete_retrain';
  affectedFeatures: string[];
  performanceChange: number;
  confidence: number;
}

interface SessionPerformance {
  avgTimeSpent: number;
  engagementRate: number;
  conversionRate: number;
  satisfactionScore: number;
  clickThroughRate: number;
}

export class AdaptiveLearningEngine {
  private userProfiles = new Map<string, UserProfile>();
  private userModels = new Map<string, LearningModel>();
  private learningSessions = new Map<string, LearningSession>();
  private feedbackQueue: UserFeedback[] = [];
  private isProcessing = false;
  private globalFeatureImportance = new Map<string, number>();

  constructor() {
    this.initializeGlobalFeatures();
    this.startLearningLoop();
  }

  // User Profile Management
  async createUserProfile(userId: string, initialData?: Partial<UserProfile>): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      preferences: {
        priceRange: { min: 0, max: 1000000 },
        locations: [],
        propertyTypes: [],
        features: [],
        priorities: [],
        dealBreakers: [],
        flexibilityScore: 0.5
      },
      behaviorPatterns: [],
      demographicInfo: {
        veteranStatus: false
      },
      interactionHistory: [],
      lastModelUpdate: new Date(),
      personalizedWeights: this.initializePersonalizedWeights(),
      confidence: 0.1, // Start with low confidence
      ...initialData
    };

    this.userProfiles.set(userId, profile);
    await this.initializeUserModel(userId);
    
    return profile;
  }

  private initializePersonalizedWeights(): FeatureWeight[] {
    const features = [
      'price', 'sqft', 'bedrooms', 'bathrooms', 'yearBuilt', 'location_score',
      'school_rating', 'crime_rate', 'commute_time', 'va_eligible',
      'creative_financing', 'pool', 'garage', 'yard_size', 'condition'
    ];

    return features.map(feature => ({
      feature,
      weight: this.globalFeatureImportance.get(feature) || 0.5,
      confidence: 0.1,
      lastUpdated: new Date(),
      updateCount: 0
    }));
  }

  private async initializeUserModel(userId: string): Promise<void> {
    const model: LearningModel = {
      modelId: `user_${userId}_${Date.now()}`,
      userId,
      modelType: 'ensemble',
      weights: new Array(15).fill(0).map(() => Math.random() * 0.1 - 0.05), // Small random weights
      bias: 0,
      lastTrained: new Date(),
      accuracy: 0.5,
      sampleSize: 0,
      version: 1
    };

    this.userModels.set(userId, model);
  }

  // Feedback Processing
  async processFeedback(feedback: UserFeedback): Promise<void> {
    this.feedbackQueue.push(feedback);
    
    // Process immediately if it's high-value feedback
    if (feedback.action === 'purchased' || feedback.action === 'rated') {
      await this.processHighValueFeedback(feedback);
    }
  }

  private async processHighValueFeedback(feedback: UserFeedback): Promise<void> {
    const profile = this.userProfiles.get(feedback.userId);
    if (!profile) return;

    // Add to interaction history
    profile.interactionHistory.push(feedback);
    
    // Limit history size
    if (profile.interactionHistory.length > 1000) {
      profile.interactionHistory = profile.interactionHistory.slice(-1000);
    }

    // Extract preferences from feedback
    await this.extractPreferences(feedback, profile);
    
    // Update behavior patterns
    await this.updateBehaviorPatterns(feedback, profile);
    
    // Retrain user model
    await this.retrainUserModel(feedback.userId);
    
    profile.lastModelUpdate = new Date();
    this.userProfiles.set(feedback.userId, profile);
  }

  private async extractPreferences(feedback: UserFeedback, profile: UserProfile): Promise<void> {
    // This would integrate with the listing service to get property details
    // For simulation, we'll create synthetic property data
    const property = this.getListingDetails(feedback.listingId);
    
    if (!property) return;

    const learningRate = 0.1;
    const reinforcement = this.calculateReinforcement(feedback);

    // Update price preferences
    if (property.price) {
      this.updatePricePreferences(profile, property.price, reinforcement, learningRate);
    }

    // Update location preferences
    if (property.zipCode) {
      this.updateLocationPreferences(profile, property.zipCode, reinforcement);
    }

    // Update feature preferences
    this.updateFeaturePreferences(profile, property, reinforcement, learningRate);

    // Update personalized feature weights
    this.updatePersonalizedWeights(profile, property, reinforcement, learningRate);

    // Increase confidence
    profile.confidence = Math.min(1.0, profile.confidence + 0.01);
  }

  private calculateReinforcement(feedback: UserFeedback): number {
    // Convert user actions to reinforcement signals
    const reinforcements: Record<string, number> = {
      'viewed': 0.1,
      'saved': 0.3,
      'contacted': 0.7,
      'dismissed': -0.2,
      'purchased': 1.0,
      'rated': feedback.rating ? (feedback.rating - 5) / 5 : 0 // Convert 1-10 to -0.8 to 1.0
    };

    let baseReinforcement = reinforcements[feedback.action] || 0;

    // Time spent reinforcement
    if (feedback.timeSpent) {
      const timeBonus = Math.min(0.3, feedback.timeSpent / 300); // Up to 5 minutes
      baseReinforcement += timeBonus;
    }

    return Math.max(-1.0, Math.min(1.0, baseReinforcement));
  }

  private updatePricePreferences(profile: UserProfile, price: number, reinforcement: number, learningRate: number): void {
    if (reinforcement > 0) {
      // Positive feedback - expand range toward this price
      const currentRange = profile.preferences.priceRange;
      const targetMin = Math.min(currentRange.min, price * 0.9);
      const targetMax = Math.max(currentRange.max, price * 1.1);
      
      profile.preferences.priceRange.min = 
        currentRange.min + learningRate * reinforcement * (targetMin - currentRange.min);
      profile.preferences.priceRange.max = 
        currentRange.max + learningRate * reinforcement * (targetMax - currentRange.max);
    } else {
      // Negative feedback - contract range away from this price
      const currentRange = profile.preferences.priceRange;
      const rangeSize = currentRange.max - currentRange.min;
      
      if (price < currentRange.min + rangeSize * 0.3) {
        // Price is in lower third - move min up
        profile.preferences.priceRange.min = 
          currentRange.min + learningRate * Math.abs(reinforcement) * rangeSize * 0.1;
      } else if (price > currentRange.max - rangeSize * 0.3) {
        // Price is in upper third - move max down
        profile.preferences.priceRange.max = 
          currentRange.max - learningRate * Math.abs(reinforcement) * rangeSize * 0.1;
      }
    }
  }

  private updateLocationPreferences(profile: UserProfile, zipCode: string, reinforcement: number): void {
    const locations = profile.preferences.locations;
    
    if (reinforcement > 0) {
      // Add location if not already preferred
      if (!locations.includes(zipCode)) {
        locations.push(zipCode);
      }
    } else {
      // Remove location if strongly negative
      if (reinforcement < -0.5) {
        const index = locations.indexOf(zipCode);
        if (index > -1) {
          locations.splice(index, 1);
        }
        
        // Add to deal breakers if very negative
        if (reinforcement < -0.8 && !profile.preferences.dealBreakers.includes(`location_${zipCode}`)) {
          profile.preferences.dealBreakers.push(`location_${zipCode}`);
        }
      }
    }
  }

  private updateFeaturePreferences(profile: UserProfile, property: any, reinforcement: number, learningRate: number): void {
    const features = this.extractPropertyFeatures(property);
    
    for (const feature of features) {
      let priority = profile.preferences.priorities.find(p => p.feature === feature);
      
      if (!priority) {
        priority = {
          feature,
          importance: 0.5,
          adaptability: 0.8
        };
        profile.preferences.priorities.push(priority);
      }
      
      // Update importance based on feedback
      const delta = learningRate * reinforcement * priority.adaptability;
      priority.importance = Math.max(0, Math.min(1, priority.importance + delta));
      
      // Reduce adaptability over time (become more stable)
      priority.adaptability = Math.max(0.1, priority.adaptability * 0.99);
    }
  }

  private updatePersonalizedWeights(profile: UserProfile, property: any, reinforcement: number, learningRate: number): void {
    for (const weight of profile.personalizedWeights) {
      const featureValue = this.getFeatureValue(property, weight.feature);
      
      if (featureValue !== null) {
        // Update weight based on feature correlation with feedback
        const delta = learningRate * reinforcement * featureValue * (1 - weight.confidence);
        weight.weight += delta;
        
        // Increase confidence
        weight.confidence = Math.min(1.0, weight.confidence + 0.01);
        weight.updateCount++;
        weight.lastUpdated = new Date();
      }
    }
  }

  private async updateBehaviorPatterns(feedback: UserFeedback, profile: UserProfile): Promise<void> {
    // Detect time-based patterns
    const timePattern = this.detectTimePattern(feedback);
    if (timePattern) {
      this.updatePatternFrequency(profile, timePattern);
    }

    // Detect sequence patterns
    const sequencePattern = this.detectSequencePattern(feedback, profile.interactionHistory);
    if (sequencePattern) {
      this.updatePatternFrequency(profile, sequencePattern);
    }

    // Detect preference patterns
    const preferencePattern = this.detectPreferencePattern(feedback, profile);
    if (preferencePattern) {
      this.updatePatternFrequency(profile, preferencePattern);
    }
  }

  private detectTimePattern(feedback: UserFeedback): string | null {
    const hour = feedback.timestamp.getHours();
    const day = feedback.timestamp.getDay();
    
    // Detect active time patterns
    if (feedback.action === 'contacted' || feedback.action === 'saved') {
      if (hour >= 9 && hour <= 17) return 'business_hours_active';
      if (hour >= 18 && hour <= 22) return 'evening_active';
      if (day === 0 || day === 6) return 'weekend_active';
    }
    
    return null;
  }

  private detectSequencePattern(feedback: UserFeedback, history: UserFeedback[]): string | null {
    const recentActions = history
      .filter(f => f.timestamp.getTime() > Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      .map(f => f.action)
      .slice(-5); // Last 5 actions
    
    // Common sequences
    if (recentActions.includes('viewed') && recentActions.includes('saved') && feedback.action === 'contacted') {
      return 'deliberate_buyer';
    }
    
    if (recentActions.filter(a => a === 'viewed').length > 3 && feedback.action === 'dismissed') {
      return 'comparison_shopper';
    }
    
    return null;
  }

  private detectPreferencePattern(feedback: UserFeedback, profile: UserProfile): string | null {
    const property = this.getListingDetails(feedback.listingId);
    if (!property) return null;
    
    // Detect budget patterns
    if (property.price && feedback.action === 'contacted') {
      const priceRatio = property.price / ((profile.preferences.priceRange.min + profile.preferences.priceRange.max) / 2);
      
      if (priceRatio < 0.8) return 'below_budget_preference';
      if (priceRatio > 1.2) return 'above_budget_preference';
    }
    
    return null;
  }

  private updatePatternFrequency(profile: UserProfile, patternName: string): void {
    let pattern = profile.behaviorPatterns.find(p => p.pattern === patternName);
    
    if (!pattern) {
      pattern = {
        pattern: patternName,
        frequency: 1,
        confidence: 0.1,
        context: [],
        lastObserved: new Date()
      };
      profile.behaviorPatterns.push(pattern);
    } else {
      pattern.frequency++;
      pattern.confidence = Math.min(1.0, pattern.confidence + 0.05);
      pattern.lastObserved = new Date();
    }
  }

  // Model Training
  private async retrainUserModel(userId: string): Promise<void> {
    const profile = this.userProfiles.get(userId);
    const model = this.userModels.get(userId);
    
    if (!profile || !model) return;

    // Prepare training data from interaction history
    const trainingData = this.prepareTrainingData(profile.interactionHistory);
    
    if (trainingData.length < 5) return; // Need minimum data

    // Online learning update
    await this.performOnlineLearning(model, trainingData);
    
    // Update model version and performance
    model.version++;
    model.lastTrained = new Date();
    model.sampleSize = trainingData.length;
    
    this.userModels.set(userId, model);
  }

  private prepareTrainingData(history: UserFeedback[]): Array<{ features: number[]; label: number }> {
    return history
      .filter(feedback => feedback.action !== 'viewed') // Exclude passive views
      .map(feedback => {
        const property = this.getListingDetails(feedback.listingId);
        if (!property) return null;
        
        const features = this.extractNumericalFeatures(property);
        const label = this.calculateReinforcement(feedback);
        
        return { features, label };
      })
      .filter(item => item !== null) as Array<{ features: number[]; label: number }>;
  }

  private async performOnlineLearning(model: LearningModel, trainingData: Array<{ features: number[]; label: number }>): Promise<void> {
    const learningRate = 0.01;
    
    // Stochastic Gradient Descent
    for (const sample of trainingData) {
      const prediction = this.predict(model, sample.features);
      const error = sample.label - prediction;
      
      // Update weights
      for (let i = 0; i < model.weights.length && i < sample.features.length; i++) {
        model.weights[i] += learningRate * error * sample.features[i];
      }
      
      // Update bias
      model.bias += learningRate * error;
    }
    
    // Calculate accuracy on recent data
    let correct = 0;
    const testData = trainingData.slice(-Math.min(50, trainingData.length));
    
    for (const sample of testData) {
      const prediction = this.predict(model, sample.features);
      const predictedClass = prediction > 0 ? 1 : -1;
      const actualClass = sample.label > 0 ? 1 : -1;
      
      if (predictedClass === actualClass) correct++;
    }
    
    model.accuracy = testData.length > 0 ? correct / testData.length : 0.5;
  }

  private predict(model: LearningModel, features: number[]): number {
    let prediction = model.bias;
    
    for (let i = 0; i < model.weights.length && i < features.length; i++) {
      prediction += model.weights[i] * features[i];
    }
    
    return Math.tanh(prediction); // Squash to [-1, 1]
  }

  // Property Scoring Adaptation
  async adaptPropertyScore(listing: Listing, userId: string, baseScore: number): Promise<AdaptationResult> {
    const profile = this.userProfiles.get(userId);
    const model = this.userModels.get(userId);
    
    if (!profile || !model) {
      return {
        originalScore: baseScore,
        adaptedScore: baseScore,
        confidenceBoost: 0,
        adaptationFactors: ['No user profile available'],
        modelVersion: 0,
        userId
      };
    }

    const adaptationFactors: string[] = [];
    let adaptedScore = baseScore;
    let confidenceBoost = 0;

    // Apply personalized feature weights
    const personalizedAdjustment = this.applyPersonalizedWeights(listing, profile);
    adaptedScore += personalizedAdjustment * 0.3;
    if (Math.abs(personalizedAdjustment) > 0.1) {
      adaptationFactors.push(`Personalized preferences: ${personalizedAdjustment > 0 ? '+' : ''}${Math.round(personalizedAdjustment * 100)}%`);
    }

    // Apply behavioral pattern adjustments
    const behaviorAdjustment = this.applyBehaviorPatterns(listing, profile);
    adaptedScore += behaviorAdjustment * 0.2;
    if (Math.abs(behaviorAdjustment) > 0.1) {
      adaptationFactors.push(`Behavior patterns: ${behaviorAdjustment > 0 ? '+' : ''}${Math.round(behaviorAdjustment * 100)}%`);
    }

    // Apply ML model prediction
    const features = this.extractNumericalFeatures(listing);
    const mlPrediction = this.predict(model, features);
    const mlAdjustment = mlPrediction * 0.2;
    adaptedScore += mlAdjustment;
    if (Math.abs(mlAdjustment) > 0.1) {
      adaptationFactors.push(`ML model: ${mlAdjustment > 0 ? '+' : ''}${Math.round(mlAdjustment * 100)}%`);
    }

    // Apply preference matching
    const preferenceMatch = this.calculatePreferenceMatch(listing, profile);
    adaptedScore += preferenceMatch * 0.3;
    if (Math.abs(preferenceMatch) > 0.1) {
      adaptationFactors.push(`Preference match: ${preferenceMatch > 0 ? '+' : ''}${Math.round(preferenceMatch * 100)}%`);
    }

    // Calculate confidence boost
    confidenceBoost = profile.confidence * model.accuracy;

    // Ensure score stays in bounds
    adaptedScore = Math.max(0, Math.min(100, adaptedScore));

    return {
      originalScore: baseScore,
      adaptedScore: Math.round(adaptedScore * 100) / 100,
      confidenceBoost,
      adaptationFactors,
      modelVersion: model.version,
      userId
    };
  }

  private applyPersonalizedWeights(listing: Listing, profile: UserProfile): number {
    let adjustment = 0;
    let totalWeight = 0;

    for (const weight of profile.personalizedWeights) {
      const featureValue = this.getFeatureValue(listing, weight.feature);
      if (featureValue !== null) {
        const normalizedValue = this.normalizeFeatureValue(weight.feature, featureValue);
        adjustment += weight.weight * normalizedValue * weight.confidence;
        totalWeight += weight.confidence;
      }
    }

    return totalWeight > 0 ? adjustment / totalWeight : 0;
  }

  private applyBehaviorPatterns(listing: Listing, profile: UserProfile): number {
    let adjustment = 0;
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    for (const pattern of profile.behaviorPatterns) {
      let patternApplies = false;
      let patternStrength = pattern.confidence;

      switch (pattern.pattern) {
        case 'business_hours_active':
          patternApplies = currentHour >= 9 && currentHour <= 17;
          break;
        case 'evening_active':
          patternApplies = currentHour >= 18 && currentHour <= 22;
          break;
        case 'weekend_active':
          patternApplies = currentDay === 0 || currentDay === 6;
          break;
        case 'deliberate_buyer':
          patternStrength *= 1.5; // Boost for serious buyers
          patternApplies = true;
          break;
        case 'comparison_shopper':
          patternStrength *= 0.8; // Slight penalty for indecisive behavior
          patternApplies = true;
          break;
      }

      if (patternApplies) {
        adjustment += patternStrength * 0.1;
      }
    }

    return adjustment;
  }

  private calculatePreferenceMatch(listing: Listing, profile: UserProfile): number {
    let matchScore = 0;
    let totalImportance = 0;

    // Price match
    const price = listing.price || 0;
    const priceRange = profile.preferences.priceRange;
    if (price >= priceRange.min && price <= priceRange.max) {
      matchScore += 0.3;
    } else {
      const deviation = Math.min(
        Math.abs(price - priceRange.min) / priceRange.min,
        Math.abs(price - priceRange.max) / priceRange.max
      );
      matchScore -= Math.min(0.3, deviation * 0.3);
    }

    // Location match
    if (listing.zipCode && profile.preferences.locations.includes(listing.zipCode)) {
      matchScore += 0.2;
    }

    // Property type match
    if (listing.propertyType && profile.preferences.propertyTypes.includes(listing.propertyType)) {
      matchScore += 0.1;
    }

    // Feature priority matching
    for (const priority of profile.preferences.priorities) {
      const hasFeature = this.listingHasFeature(listing, priority.feature);
      if (hasFeature) {
        matchScore += priority.importance * 0.4;
      }
      totalImportance += priority.importance;
    }

    // Deal breaker check
    for (const dealBreaker of profile.preferences.dealBreakers) {
      if (this.listingHasFeature(listing, dealBreaker)) {
        matchScore -= 0.5;
      }
    }

    return matchScore;
  }

  // Learning Loop
  private startLearningLoop(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.feedbackQueue.length > 0) {
        this.isProcessing = true;
        
        try {
          const batchSize = Math.min(10, this.feedbackQueue.length);
          const batch = this.feedbackQueue.splice(0, batchSize);
          
          for (const feedback of batch) {
            await this.processHighValueFeedback(feedback);
          }
          
        } catch (error) {
          console.error('Learning loop error:', error);
        } finally {
          this.isProcessing = false;
        }
      }
    }, 5000); // Process every 5 seconds
  }

  // Helper Methods
  private initializeGlobalFeatures(): void {
    const features = [
      'price', 'sqft', 'bedrooms', 'bathrooms', 'yearBuilt', 'location_score',
      'school_rating', 'crime_rate', 'commute_time', 'va_eligible',
      'creative_financing', 'pool', 'garage', 'yard_size', 'condition'
    ];

    features.forEach(feature => {
      this.globalFeatureImportance.set(feature, Math.random() * 0.4 + 0.3); // 0.3-0.7
    });
  }

  private getListingDetails(listingId: string): Listing | null {
    // This would integrate with the listing service
    // For simulation, return mock data
    return {
      id: listingId,
      address: '123 Mock St',
      price: 300000 + Math.random() * 200000,
      sqft: 1500 + Math.random() * 1000,
      bedrooms: 2 + Math.floor(Math.random() * 4),
      bathrooms: 1 + Math.floor(Math.random() * 3),
      yearBuilt: 1990 + Math.floor(Math.random() * 30),
      zipCode: ['85001', '85021', '85033'][Math.floor(Math.random() * 3)],
      propertyType: ['Single Family', 'Condo', 'Townhouse'][Math.floor(Math.random() * 3)],
      description: 'Mock property for testing',
      score: 70 + Math.random() * 30,
      flags: {
        va_eligible: Math.random() > 0.5
      },
      creativeFinancing: {
        ownerFinancing: Math.random() > 0.7,
        leaseToOwn: Math.random() > 0.8
      }
    };
  }

  private extractPropertyFeatures(property: any): string[] {
    const features: string[] = [];
    
    if (property.price < 200000) features.push('budget_friendly');
    if (property.price > 500000) features.push('luxury');
    if (property.sqft > 2000) features.push('spacious');
    if (property.bedrooms >= 4) features.push('large_family');
    if (property.yearBuilt > 2010) features.push('new_construction');
    if (property.flags?.va_eligible) features.push('va_eligible');
    if (property.creativeFinancing?.ownerFinancing) features.push('owner_financing');
    
    return features;
  }

  private extractNumericalFeatures(property: any): number[] {
    return [
      (property.price || 0) / 1000000, // Normalize price
      (property.sqft || 0) / 5000, // Normalize sqft
      (property.bedrooms || 0) / 6, // Normalize bedrooms
      (property.bathrooms || 0) / 4, // Normalize bathrooms
      ((property.yearBuilt || 2000) - 1950) / 70, // Normalize year built
      property.flags?.va_eligible ? 1 : 0,
      property.creativeFinancing?.ownerFinancing ? 1 : 0,
      (property.score || 0) / 100 // Normalize score
    ];
  }

  private getFeatureValue(listing: Listing, featureName: string): number | null {
    const featureMap: Record<string, () => number | null> = {
      'price': () => listing.price || null,
      'sqft': () => listing.sqft || null,
      'bedrooms': () => listing.bedrooms || null,
      'bathrooms': () => listing.bathrooms || null,
      'yearBuilt': () => listing.yearBuilt || null,
      'va_eligible': () => listing.flags?.va_eligible ? 1 : 0,
      'creative_financing': () => listing.creativeFinancing?.ownerFinancing ? 1 : 0
    };

    return featureMap[featureName]?.() || null;
  }

  private normalizeFeatureValue(featureName: string, value: number): number {
    const normalizers: Record<string, (val: number) => number> = {
      'price': (val) => Math.min(1, val / 1000000),
      'sqft': (val) => Math.min(1, val / 5000),
      'bedrooms': (val) => Math.min(1, val / 6),
      'bathrooms': (val) => Math.min(1, val / 4),
      'yearBuilt': (val) => (val - 1950) / 70
    };

    return normalizers[featureName]?.(value) || value;
  }

  private listingHasFeature(listing: Listing, feature: string): boolean {
    const features = this.extractPropertyFeatures(listing);
    return features.includes(feature) || 
           feature.startsWith('location_') && listing.zipCode === feature.replace('location_', '');
  }

  // Public Interface
  getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  getUserModel(userId: string): LearningModel | null {
    return this.userModels.get(userId) || null;
  }

  getLearningStats(): {
    totalUsers: number;
    averageConfidence: number;
    totalFeedback: number;
    modelAccuracy: number;
    activePatterns: number;
  } {
    const profiles = Array.from(this.userProfiles.values());
    const models = Array.from(this.userModels.values());
    
    const avgConfidence = profiles.length > 0 ? 
      profiles.reduce((sum, p) => sum + p.confidence, 0) / profiles.length : 0;
    
    const avgAccuracy = models.length > 0 ?
      models.reduce((sum, m) => sum + m.accuracy, 0) / models.length : 0;
    
    const totalFeedback = profiles.reduce((sum, p) => sum + p.interactionHistory.length, 0);
    const totalPatterns = profiles.reduce((sum, p) => sum + p.behaviorPatterns.length, 0);

    return {
      totalUsers: profiles.length,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      totalFeedback,
      modelAccuracy: Math.round(avgAccuracy * 100) / 100,
      activePatterns: totalPatterns
    };
  }

  async resetUserModel(userId: string): Promise<boolean> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return false;

    profile.personalizedWeights = this.initializePersonalizedWeights();
    profile.behaviorPatterns = [];
    profile.confidence = 0.1;
    profile.lastModelUpdate = new Date();

    await this.initializeUserModel(userId);
    return true;
  }

  clearFeedbackQueue(): void {
    this.feedbackQueue.length = 0;
  }
}

export const adaptiveLearningEngine = new AdaptiveLearningEngine();
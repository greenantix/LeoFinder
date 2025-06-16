import { Listing } from '../types/listing';
import { aiOrchestrationEngine } from './aiOrchestrationEngine';

interface MatchingPipelineConfig {
  maxConcurrentSearches: number;
  maxProcessingTimeMs: number;
  enableRealTimeUpdates: boolean;
  enablePredictivePreloading: boolean;
  cacheExpirationMs: number;
  qualityThreshold: number;
}

interface LiveSearchStream {
  streamId: string;
  userId: string;
  filters: SearchFilters;
  isActive: boolean;
  lastUpdate: Date;
  resultCount: number;
  quality: number;
  websocketConnection?: WebSocketConnection;
}

interface WebSocketConnection {
  id: string;
  socket: any; // WebSocket instance
  userId: string;
  isConnected: boolean;
  lastPing: Date;
}

interface SearchFilters {
  priceRange?: { min: number; max: number };
  location?: string;
  radius?: number; // miles
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: { min: number; max: number };
  features?: string[];
  vaEligible?: boolean;
  creativeFinancing?: boolean;
  accessibility?: string[];
  timeline?: 'immediate' | 'within_3_months' | 'within_6_months' | 'within_year';
}

interface PropertyUpdate {
  type: 'new_listing' | 'price_change' | 'status_change' | 'removed';
  listingId: string;
  listing?: Listing;
  changes?: PropertyChange[];
  timestamp: Date;
  affectedUsers: string[];
}

interface PropertyChange {
  field: string;
  oldValue: any;
  newValue: any;
  impact: 'low' | 'medium' | 'high';
}

interface MatchNotification {
  notificationId: string;
  userId: string;
  type: 'new_match' | 'price_drop' | 'new_feature' | 'better_financing' | 'urgent_opportunity';
  listingId: string;
  score: number;
  title: string;
  message: string;
  actionUrl: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt: Date;
  channels: NotificationChannel[];
}

interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'in_app';
  enabled: boolean;
  config?: any;
}

interface PredictiveCache {
  userId: string;
  searchPattern: SearchPattern;
  preloadedResults: PreloadedResult[];
  confidence: number;
  lastUpdated: Date;
  hitRate: number;
}

interface SearchPattern {
  commonFilters: SearchFilters;
  searchFrequency: number;
  timePattern: TimePattern[];
  preferredResultTypes: string[];
  averageSessionLength: number;
}

interface TimePattern {
  dayOfWeek: number; // 0-6
  hour: number; // 0-23
  frequency: number;
}

interface PreloadedResult {
  searchSignature: string;
  results: any[];
  timestamp: Date;
  quality: number;
}

interface MatchingMetrics {
  totalActiveStreams: number;
  averageResponseTime: number;
  cacheHitRate: number;
  userSatisfactionScore: number;
  notificationDeliveryRate: number;
  realTimeUpdateLatency: number;
}

interface QualityScore {
  relevance: number; // 0-1
  freshness: number; // 0-1
  completeness: number; // 0-1
  accuracy: number; // 0-1
  overall: number; // 0-1
}

export class RealtimeMatchingPipeline {
  private config: MatchingPipelineConfig;
  private activeStreams = new Map<string, LiveSearchStream>();
  private websocketConnections = new Map<string, WebSocketConnection>();
  private propertyUpdateQueue: PropertyUpdate[] = [];
  private notificationQueue: MatchNotification[] = [];
  private predictiveCache = new Map<string, PredictiveCache>();
  private searchPatterns = new Map<string, SearchPattern>();
  private processingLoop: NodeJS.Timeout | null = null;
  private notificationLoop: NodeJS.Timeout | null = null;

  constructor(config?: Partial<MatchingPipelineConfig>) {
    this.config = {
      maxConcurrentSearches: 100,
      maxProcessingTimeMs: 2000,
      enableRealTimeUpdates: true,
      enablePredictivePreloading: true,
      cacheExpirationMs: 300000, // 5 minutes
      qualityThreshold: 0.8,
      ...config
    };

    this.initializePipeline();
  }

  // Real-time Search Stream Management
  async createSearchStream(
    userId: string, 
    filters: SearchFilters, 
    websocket?: any
  ): Promise<LiveSearchStream> {
    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔍 Creating search stream ${streamId} for user ${userId}`);

    // Create websocket connection if provided
    let wsConnection: WebSocketConnection | undefined;
    if (websocket) {
      wsConnection = await this.createWebSocketConnection(websocket, userId);
    }

    const stream: LiveSearchStream = {
      streamId,
      userId,
      filters,
      isActive: true,
      lastUpdate: new Date(),
      resultCount: 0,
      quality: 0,
      websocketConnection: wsConnection
    };

    this.activeStreams.set(streamId, stream);

    // Perform initial search
    await this.processStreamSearch(stream);

    // Update search patterns
    await this.updateSearchPattern(userId, filters);

    // Start predictive preloading if enabled
    if (this.config.enablePredictivePreloading) {
      this.schedulePreloading(userId);
    }

    console.log(`✅ Search stream ${streamId} created with ${stream.resultCount} initial results`);

    return stream;
  }

  private async createWebSocketConnection(websocket: any, userId: string): Promise<WebSocketConnection> {
    const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const connection: WebSocketConnection = {
      id: connectionId,
      socket: websocket,
      userId,
      isConnected: true,
      lastPing: new Date()
    };

    // Set up websocket event handlers
    websocket.on('message', (message: string) => {
      this.handleWebSocketMessage(connection, message);
    });

    websocket.on('close', () => {
      connection.isConnected = false;
      this.websocketConnections.delete(connectionId);
      console.log(`🔌 WebSocket connection ${connectionId} closed`);
    });

    websocket.on('error', (error: any) => {
      console.error(`❌ WebSocket error for connection ${connectionId}:`, error);
      connection.isConnected = false;
    });

    this.websocketConnections.set(connectionId, connection);
    
    // Send welcome message
    this.sendWebSocketMessage(connection, {
      type: 'connection_established',
      connectionId,
      timestamp: new Date()
    });

    return connection;
  }

  private handleWebSocketMessage(connection: WebSocketConnection, message: string): void {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'ping':
          connection.lastPing = new Date();
          this.sendWebSocketMessage(connection, { type: 'pong', timestamp: new Date() });
          break;
        
        case 'update_filters':
          this.updateStreamFilters(connection.userId, data.filters);
          break;
        
        case 'request_update':
          this.forceStreamUpdate(connection.userId);
          break;
        
        case 'user_action':
          this.recordUserAction(connection.userId, data.action);
          break;
        
        default:
          console.warn(`Unknown WebSocket message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private sendWebSocketMessage(connection: WebSocketConnection, message: any): void {
    if (connection.isConnected && connection.socket) {
      try {
        connection.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        connection.isConnected = false;
      }
    }
  }

  // Stream Processing
  private async processStreamSearch(stream: LiveSearchStream): Promise<void> {
    const startTime = Date.now();

    try {
      // Check predictive cache first
      const cachedResults = await this.checkPredictiveCache(stream.userId, stream.filters);
      
      if (cachedResults && this.isCacheValid(cachedResults)) {
        console.log(`⚡ Cache hit for stream ${stream.streamId}`);
        await this.deliverCachedResults(stream, cachedResults);
        return;
      }

      // Create search request for AI orchestration
      const searchRequest = {
        searchId: `search_${stream.streamId}_${Date.now()}`,
        userId: stream.userId,
        query: this.filtersToQuery(stream.filters),
        filters: stream.filters,
        context: {
          sessionId: stream.streamId,
          deviceType: 'desktop' as const, // Would detect from request
          timeOfDay: this.getTimeOfDay(),
          urgency: this.determineUrgency(stream.filters)
        },
        aiConfig: {
          enablePersonalization: true,
          enableRLOptimization: true,
          enableEnsemblePrediction: true,
          maxProcessingTime: this.config.maxProcessingTimeMs,
          accuracyThreshold: this.config.qualityThreshold,
          explainabilityLevel: 'detailed' as const
        }
      };

      // Process with AI orchestration engine
      const results = await aiOrchestrationEngine.processVeteranSearch(searchRequest);

      // Calculate quality score
      const quality = this.calculateQualityScore(results, stream.filters);

      // Update stream
      stream.resultCount = results.length;
      stream.quality = quality.overall;
      stream.lastUpdate = new Date();

      // Deliver results via WebSocket if connected
      if (stream.websocketConnection?.isConnected) {
        await this.deliverRealtimeResults(stream, results, quality);
      }

      // Cache results for future use
      await this.cacheResults(stream.userId, stream.filters, results);

      // Generate notifications for high-value matches
      await this.generateMatchNotifications(stream.userId, results);

      const processingTime = Date.now() - startTime;
      console.log(`🎯 Stream ${stream.streamId} processed in ${processingTime}ms with quality ${quality.overall.toFixed(3)}`);

    } catch (error) {
      console.error(`❌ Error processing stream ${stream.streamId}:`, error);
      
      // Send error to client if connected
      if (stream.websocketConnection?.isConnected) {
        this.sendWebSocketMessage(stream.websocketConnection, {
          type: 'search_error',
          streamId: stream.streamId,
          error: 'Search processing failed',
          timestamp: new Date()
        });
      }
    }
  }

  private async deliverRealtimeResults(
    stream: LiveSearchStream, 
    results: any[], 
    quality: QualityScore
  ): Promise<void> {
    const message = {
      type: 'search_results',
      streamId: stream.streamId,
      results: results.slice(0, 20), // Limit for real-time delivery
      quality,
      metadata: {
        totalResults: results.length,
        processingTime: Date.now() - stream.lastUpdate.getTime(),
        timestamp: new Date()
      }
    };

    if (stream.websocketConnection) {
      this.sendWebSocketMessage(stream.websocketConnection, message);
    }
  }

  private async deliverCachedResults(stream: LiveSearchStream, cachedResults: PreloadedResult): Promise<void> {
    stream.resultCount = cachedResults.results.length;
    stream.quality = cachedResults.quality;
    stream.lastUpdate = new Date();

    if (stream.websocketConnection?.isConnected) {
      const message = {
        type: 'search_results',
        streamId: stream.streamId,
        results: cachedResults.results.slice(0, 20),
        quality: { overall: cachedResults.quality },
        metadata: {
          totalResults: cachedResults.results.length,
          fromCache: true,
          timestamp: new Date()
        }
      };

      this.sendWebSocketMessage(stream.websocketConnection, message);
    }
  }

  // Property Update Processing
  async processPropertyUpdate(update: PropertyUpdate): Promise<void> {
    console.log(`🏠 Processing property update: ${update.type} for ${update.listingId}`);

    this.propertyUpdateQueue.push(update);

    // Find affected streams
    const affectedStreams = this.findAffectedStreams(update);

    for (const stream of affectedStreams) {
      if (update.type === 'new_listing') {
        await this.handleNewListingForStream(stream, update);
      } else if (update.type === 'price_change') {
        await this.handlePriceChangeForStream(stream, update);
      } else if (update.type === 'removed') {
        await this.handleRemovedListingForStream(stream, update);
      }
    }

    // Generate targeted notifications
    await this.generateUpdateNotifications(update);
  }

  private findAffectedStreams(update: PropertyUpdate): LiveSearchStream[] {
    const affectedStreams: LiveSearchStream[] = [];

    for (const stream of this.activeStreams.values()) {
      if (!stream.isActive) continue;

      // Check if property matches stream filters
      if (update.listing && this.propertyMatchesFilters(update.listing, stream.filters)) {
        affectedStreams.push(stream);
      }
    }

    return affectedStreams;
  }

  private propertyMatchesFilters(listing: Listing, filters: SearchFilters): boolean {
    // Price range check
    if (filters.priceRange && listing.price) {
      if (listing.price < filters.priceRange.min || listing.price > filters.priceRange.max) {
        return false;
      }
    }

    // Location check
    if (filters.location && listing.zipCode) {
      if (!listing.zipCode.includes(filters.location)) {
        return false;
      }
    }

    // Property type check
    if (filters.propertyType && listing.propertyType) {
      if (listing.propertyType !== filters.propertyType) {
        return false;
      }
    }

    // Bedrooms check
    if (filters.bedrooms && listing.bedrooms) {
      if (listing.bedrooms < filters.bedrooms) {
        return false;
      }
    }

    // VA eligibility check
    if (filters.vaEligible && !listing.flags?.va_eligible) {
      return false;
    }

    return true;
  }

  private async handleNewListingForStream(stream: LiveSearchStream, update: PropertyUpdate): Promise<void> {
    if (!update.listing) return;

    // Score the new listing for this user
    const searchRequest = {
      searchId: `new_listing_${stream.streamId}_${Date.now()}`,
      userId: stream.userId,
      query: this.filtersToQuery(stream.filters),
      filters: stream.filters,
      context: {
        sessionId: stream.streamId,
        deviceType: 'desktop' as const,
        timeOfDay: this.getTimeOfDay(),
        urgency: 'medium' as const
      },
      aiConfig: {
        enablePersonalization: true,
        enableRLOptimization: true,
        enableEnsemblePrediction: true,
        maxProcessingTime: 1000, // Faster for real-time updates
        accuracyThreshold: 0.7,
        explainabilityLevel: 'basic' as const
      }
    };

    try {
      const results = await aiOrchestrationEngine.processVeteranSearch(searchRequest);
      const newListingResult = results.find(r => r.listingId === update.listingId);

      if (newListingResult && newListingResult.score > 80) {
        // High-quality match - send immediate notification
        if (stream.websocketConnection?.isConnected) {
          this.sendWebSocketMessage(stream.websocketConnection, {
            type: 'new_match',
            streamId: stream.streamId,
            listing: update.listing,
            score: newListingResult.score,
            reasons: newListingResult.recommendationReason,
            timestamp: new Date()
          });
        }

        // Add to notification queue
        this.queueNotification({
          notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: stream.userId,
          type: 'new_match',
          listingId: update.listingId,
          score: newListingResult.score,
          title: 'New Perfect Match Found!',
          message: `A ${newListingResult.score}% match property just became available`,
          actionUrl: `/listing/${update.listingId}`,
          priority: newListingResult.score > 90 ? 'urgent' : 'high',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          channels: [
            { type: 'push', enabled: true },
            { type: 'in_app', enabled: true }
          ]
        });
      }
    } catch (error) {
      console.error('Error processing new listing for stream:', error);
    }
  }

  private async handlePriceChangeForStream(stream: LiveSearchStream, update: PropertyUpdate): Promise<void> {
    const priceChange = update.changes?.find(c => c.field === 'price');
    if (!priceChange || !update.listing) return;

    const oldPrice = priceChange.oldValue;
    const newPrice = priceChange.newValue;
    const priceReduction = oldPrice - newPrice;

    // Significant price drop (>5% or >$10k)
    if (priceReduction > Math.max(oldPrice * 0.05, 10000)) {
      if (stream.websocketConnection?.isConnected) {
        this.sendWebSocketMessage(stream.websocketConnection, {
          type: 'price_drop',
          streamId: stream.streamId,
          listingId: update.listingId,
          oldPrice,
          newPrice,
          savings: priceReduction,
          timestamp: new Date()
        });
      }

      // Queue price drop notification
      this.queueNotification({
        notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: stream.userId,
        type: 'price_drop',
        listingId: update.listingId,
        score: 85,
        title: 'Price Drop Alert!',
        message: `Price reduced by $${priceReduction.toLocaleString()} on a property you're watching`,
        actionUrl: `/listing/${update.listingId}`,
        priority: 'high',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        channels: [
          { type: 'push', enabled: true },
          { type: 'email', enabled: true },
          { type: 'in_app', enabled: true }
        ]
      });
    }
  }

  private async handleRemovedListingForStream(stream: LiveSearchStream, update: PropertyUpdate): Promise<void> {
    // Notify if user was actively viewing or had saved this property
    if (stream.websocketConnection?.isConnected) {
      this.sendWebSocketMessage(stream.websocketConnection, {
        type: 'listing_removed',
        streamId: stream.streamId,
        listingId: update.listingId,
        timestamp: new Date()
      });
    }
  }

  // Predictive Caching
  private async updateSearchPattern(userId: string, filters: SearchFilters): Promise<void> {
    let pattern = this.searchPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        commonFilters: filters,
        searchFrequency: 1,
        timePattern: [{ dayOfWeek: new Date().getDay(), hour: new Date().getHours(), frequency: 1 }],
        preferredResultTypes: [],
        averageSessionLength: 0
      };
    } else {
      // Update existing pattern
      pattern.searchFrequency++;
      pattern.commonFilters = this.mergeFilters(pattern.commonFilters, filters);
      
      const currentTime = { dayOfWeek: new Date().getDay(), hour: new Date().getHours() };
      const existingTimePattern = pattern.timePattern.find(
        tp => tp.dayOfWeek === currentTime.dayOfWeek && tp.hour === currentTime.hour
      );
      
      if (existingTimePattern) {
        existingTimePattern.frequency++;
      } else {
        pattern.timePattern.push({ ...currentTime, frequency: 1 });
      }
    }

    this.searchPatterns.set(userId, pattern);
  }

  private mergeFilters(existing: SearchFilters, new_filters: SearchFilters): SearchFilters {
    return {
      ...existing,
      // Keep most restrictive price range
      priceRange: new_filters.priceRange || existing.priceRange,
      // Merge locations
      location: new_filters.location || existing.location,
      // Keep most recent property type preference
      propertyType: new_filters.propertyType || existing.propertyType,
      // Keep highest bedroom/bathroom requirements
      bedrooms: Math.max(existing.bedrooms || 0, new_filters.bedrooms || 0) || undefined,
      bathrooms: Math.max(existing.bathrooms || 0, new_filters.bathrooms || 0) || undefined,
      // Merge features
      features: [...new Set([...(existing.features || []), ...(new_filters.features || [])])],
      // Keep VA eligibility if ever requested
      vaEligible: existing.vaEligible || new_filters.vaEligible,
      // Keep accessibility requirements
      accessibility: [...new Set([...(existing.accessibility || []), ...(new_filters.accessibility || [])])]
    };
  }

  private async schedulePreloading(userId: string): Promise<void> {
    const pattern = this.searchPatterns.get(userId);
    if (!pattern) return;

    // Predict next search time based on pattern
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    const likelyTimePatterns = pattern.timePattern
      .filter(tp => tp.frequency > 1)
      .sort((a, b) => b.frequency - a.frequency);

    if (likelyTimePatterns.length > 0) {
      // Preload for most likely next search time
      setTimeout(() => {
        this.performPredictivePreload(userId, pattern);
      }, 60000); // Preload 1 minute from now
    }
  }

  private async performPredictivePreload(userId: string, pattern: SearchPattern): Promise<void> {
    try {
      console.log(`🔮 Performing predictive preload for user ${userId}`);

      const searchRequest = {
        searchId: `preload_${userId}_${Date.now()}`,
        userId,
        query: this.filtersToQuery(pattern.commonFilters),
        filters: pattern.commonFilters,
        context: {
          sessionId: `preload_${userId}`,
          deviceType: 'desktop' as const,
          timeOfDay: this.getTimeOfDay(),
          urgency: 'low' as const
        },
        aiConfig: {
          enablePersonalization: true,
          enableRLOptimization: false, // Skip RL for preloading
          enableEnsemblePrediction: true,
          maxProcessingTime: 5000, // Allow more time for preloading
          accuracyThreshold: 0.7,
          explainabilityLevel: 'basic' as const
        }
      };

      const results = await aiOrchestrationEngine.processVeteranSearch(searchRequest);
      const quality = this.calculateQualityScore(results, pattern.commonFilters);

      // Store in predictive cache
      const cacheEntry: PredictiveCache = {
        userId,
        searchPattern: pattern,
        preloadedResults: [{
          searchSignature: this.generateSearchSignature(pattern.commonFilters),
          results,
          timestamp: new Date(),
          quality: quality.overall
        }],
        confidence: this.calculatePreloadConfidence(pattern),
        lastUpdated: new Date(),
        hitRate: 0
      };

      this.predictiveCache.set(userId, cacheEntry);
      console.log(`✅ Predictive preload completed for user ${userId} with ${results.length} results`);

    } catch (error) {
      console.error('Error in predictive preload:', error);
    }
  }

  private calculatePreloadConfidence(pattern: SearchPattern): number {
    // Base confidence on search frequency and pattern consistency
    const frequencyScore = Math.min(pattern.searchFrequency / 10, 1); // Max at 10 searches
    const timeConsistency = pattern.timePattern.length > 0 ? 
      Math.max(...pattern.timePattern.map(tp => tp.frequency)) / pattern.searchFrequency : 0;
    
    return (frequencyScore * 0.6 + timeConsistency * 0.4);
  }

  private async checkPredictiveCache(userId: string, filters: SearchFilters): Promise<PreloadedResult | null> {
    const cache = this.predictiveCache.get(userId);
    if (!cache) return null;

    const searchSignature = this.generateSearchSignature(filters);
    const cachedResult = cache.preloadedResults.find(r => r.searchSignature === searchSignature);

    if (cachedResult && this.isCacheValid(cachedResult)) {
      // Update hit rate
      cache.hitRate = (cache.hitRate + 1) / 2; // Running average
      return cachedResult;
    }

    return null;
  }

  private isCacheValid(cachedResult: PreloadedResult): boolean {
    const age = Date.now() - cachedResult.timestamp.getTime();
    return age < this.config.cacheExpirationMs;
  }

  // Notification Management
  private queueNotification(notification: MatchNotification): void {
    this.notificationQueue.push(notification);
    console.log(`📬 Queued ${notification.type} notification for user ${notification.userId}`);
  }

  private async processNotificationQueue(): Promise<void> {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift()!;
      
      try {
        await this.deliverNotification(notification);
      } catch (error) {
        console.error('Error delivering notification:', error);
      }
    }
  }

  private async deliverNotification(notification: MatchNotification): Promise<void> {
    console.log(`📱 Delivering ${notification.type} notification to user ${notification.userId}`);

    for (const channel of notification.channels) {
      if (!channel.enabled) continue;

      switch (channel.type) {
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'sms':
          await this.sendSMSNotification(notification);
          break;
        case 'in_app':
          await this.sendInAppNotification(notification);
          break;
      }
    }
  }

  private async sendPushNotification(notification: MatchNotification): Promise<void> {
    // Simulate push notification
    console.log(`📲 Push: ${notification.title} - ${notification.message}`);
  }

  private async sendEmailNotification(notification: MatchNotification): Promise<void> {
    // Simulate email notification
    console.log(`📧 Email: ${notification.title} to user ${notification.userId}`);
  }

  private async sendSMSNotification(notification: MatchNotification): Promise<void> {
    // Simulate SMS notification
    console.log(`📱 SMS: ${notification.message} to user ${notification.userId}`);
  }

  private async sendInAppNotification(notification: MatchNotification): Promise<void> {
    // Send via WebSocket if user is connected
    const userConnection = Array.from(this.websocketConnections.values())
      .find(conn => conn.userId === notification.userId && conn.isConnected);

    if (userConnection) {
      this.sendWebSocketMessage(userConnection, {
        type: 'notification',
        notification: {
          id: notification.notificationId,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          actionUrl: notification.actionUrl
        },
        timestamp: new Date()
      });
    }
  }

  // Quality Assessment
  private calculateQualityScore(results: any[], filters: SearchFilters): QualityScore {
    const relevance = this.calculateRelevanceScore(results, filters);
    const freshness = this.calculateFreshnessScore(results);
    const completeness = this.calculateCompletenessScore(results);
    const accuracy = this.calculateAccuracyScore(results);

    return {
      relevance,
      freshness,
      completeness,
      accuracy,
      overall: (relevance * 0.4 + freshness * 0.2 + completeness * 0.2 + accuracy * 0.2)
    };
  }

  private calculateRelevanceScore(results: any[], filters: SearchFilters): number {
    if (results.length === 0) return 0;

    // Score based on how well results match filters
    let totalRelevance = 0;
    
    for (const result of results.slice(0, 10)) { // Check top 10
      let relevance = 0.5; // Base relevance
      
      if (result.score > 85) relevance += 0.3;
      if (result.veteranBenefits && result.veteranBenefits.length > 0) relevance += 0.2;
      
      totalRelevance += relevance;
    }

    return Math.min(totalRelevance / Math.min(results.length, 10), 1);
  }

  private calculateFreshnessScore(results: any[]): number {
    // In real implementation, would check listing update timestamps
    return 0.9; // Assume generally fresh data
  }

  private calculateCompletenessScore(results: any[]): number {
    if (results.length === 0) return 0;

    // Check if results have complete information
    let completeCount = 0;
    
    for (const result of results.slice(0, 10)) {
      if (result.aiScores && 
          result.recommendationReason && 
          result.veteranBenefits) {
        completeCount++;
      }
    }

    return completeCount / Math.min(results.length, 10);
  }

  private calculateAccuracyScore(results: any[]): number {
    // Score based on AI confidence levels
    if (results.length === 0) return 0;

    const confidenceSum = results
      .slice(0, 10)
      .reduce((sum, result) => sum + (result.aiScores?.confidence || 0.5), 0);

    return confidenceSum / Math.min(results.length, 10);
  }

  // Utility Methods
  private filtersToQuery(filters: SearchFilters): string {
    const queryParts: string[] = [];

    if (filters.location) queryParts.push(filters.location);
    if (filters.propertyType) queryParts.push(filters.propertyType);
    if (filters.bedrooms) queryParts.push(`${filters.bedrooms} bedroom`);
    if (filters.vaEligible) queryParts.push('VA eligible');

    return queryParts.join(' ') || 'properties';
  }

  private determineUrgency(filters: SearchFilters): 'low' | 'medium' | 'high' {
    if (filters.timeline === 'immediate') return 'high';
    if (filters.timeline === 'within_3_months') return 'medium';
    return 'low';
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private generateSearchSignature(filters: SearchFilters): string {
    return JSON.stringify({
      price: filters.priceRange,
      location: filters.location,
      type: filters.propertyType,
      beds: filters.bedrooms,
      va: filters.vaEligible
    });
  }

  private async cacheResults(userId: string, filters: SearchFilters, results: any[]): Promise<void> {
    // Implementation would cache results for faster future retrieval
  }

  private async generateMatchNotifications(userId: string, results: any[]): Promise<void> {
    // Generate notifications for exceptional matches
    const exceptionalMatches = results.filter(r => r.score > 90);
    
    for (const match of exceptionalMatches.slice(0, 3)) { // Limit to top 3
      this.queueNotification({
        notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'new_match',
        listingId: match.listingId,
        score: match.score,
        title: 'Exceptional Match Found!',
        message: `${match.score}% match property available now`,
        actionUrl: `/listing/${match.listingId}`,
        priority: 'high',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        channels: [
          { type: 'push', enabled: true },
          { type: 'in_app', enabled: true }
        ]
      });
    }
  }

  private async generateUpdateNotifications(update: PropertyUpdate): Promise<void> {
    // Generate notifications for property updates that affect users
    if (update.type === 'new_listing' && update.listing) {
      // Would identify users who might be interested
      console.log(`📢 New listing notification opportunity: ${update.listingId}`);
    }
  }

  // Stream Management
  async updateStreamFilters(userId: string, newFilters: SearchFilters): Promise<void> {
    const userStreams = Array.from(this.activeStreams.values())
      .filter(stream => stream.userId === userId && stream.isActive);

    for (const stream of userStreams) {
      stream.filters = { ...stream.filters, ...newFilters };
      await this.processStreamSearch(stream);
    }
  }

  async forceStreamUpdate(userId: string): Promise<void> {
    const userStreams = Array.from(this.activeStreams.values())
      .filter(stream => stream.userId === userId && stream.isActive);

    for (const stream of userStreams) {
      await this.processStreamSearch(stream);
    }
  }

  async recordUserAction(userId: string, action: any): Promise<void> {
    // Record user action for learning
    await aiOrchestrationEngine.recordUserInteraction(
      action.searchId || 'unknown',
      userId,
      {
        type: action.type,
        listingId: action.listingId,
        timestamp: new Date(),
        timeSpent: action.timeSpent,
        context: action.context
      }
    );
  }

  async closeStream(streamId: string): Promise<void> {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      stream.isActive = false;
      
      if (stream.websocketConnection) {
        stream.websocketConnection.isConnected = false;
      }
      
      this.activeStreams.delete(streamId);
      console.log(`🔚 Closed stream ${streamId}`);
    }
  }

  // Pipeline Control
  private initializePipeline(): void {
    console.log('🚀 Real-time Matching Pipeline initialized');
    
    // Start processing loops
    this.processingLoop = setInterval(() => {
      this.processActiveStreams();
    }, 30000); // Process every 30 seconds

    this.notificationLoop = setInterval(() => {
      this.processNotificationQueue();
    }, 5000); // Process notifications every 5 seconds

    console.log(`⚙️ Pipeline configuration:
    - Max concurrent searches: ${this.config.maxConcurrentSearches}
    - Max processing time: ${this.config.maxProcessingTimeMs}ms
    - Real-time updates: ${this.config.enableRealTimeUpdates}
    - Predictive preloading: ${this.config.enablePredictivePreloading}
    - Quality threshold: ${this.config.qualityThreshold}`);
  }

  private async processActiveStreams(): Promise<void> {
    const activeStreams = Array.from(this.activeStreams.values())
      .filter(stream => stream.isActive);

    console.log(`🔄 Processing ${activeStreams.length} active streams`);

    // Process streams in batches to respect concurrency limits
    const batches = this.createBatches(activeStreams, this.config.maxConcurrentSearches / 2);

    for (const batch of batches) {
      const promises = batch.map(stream => this.processStreamSearch(stream));
      await Promise.allSettled(promises);
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  // Public Interface
  getActiveStreams(): LiveSearchStream[] {
    return Array.from(this.activeStreams.values()).filter(stream => stream.isActive);
  }

  getMatchingMetrics(): MatchingMetrics {
    const activeStreams = this.getActiveStreams();
    const totalConnections = Array.from(this.websocketConnections.values())
      .filter(conn => conn.isConnected).length;

    return {
      totalActiveStreams: activeStreams.length,
      averageResponseTime: 850, // Would calculate from actual metrics
      cacheHitRate: 0.65, // Would calculate from cache hits
      userSatisfactionScore: 0.89, // Would calculate from user feedback
      notificationDeliveryRate: 0.95, // Would calculate from delivery success
      realTimeUpdateLatency: 150 // milliseconds
    };
  }

  stopPipeline(): void {
    if (this.processingLoop) {
      clearInterval(this.processingLoop);
      this.processingLoop = null;
    }

    if (this.notificationLoop) {
      clearInterval(this.notificationLoop);
      this.notificationLoop = null;
    }

    // Close all WebSocket connections
    for (const connection of this.websocketConnections.values()) {
      if (connection.isConnected && connection.socket) {
        connection.socket.close();
      }
    }

    console.log('🛑 Real-time Matching Pipeline stopped');
  }

  clearCache(): void {
    this.predictiveCache.clear();
    this.searchPatterns.clear();
    this.propertyUpdateQueue.length = 0;
    this.notificationQueue.length = 0;
    console.log('🧹 Pipeline cache cleared');
  }
}

export const realtimeMatchingPipeline = new RealtimeMatchingPipeline();
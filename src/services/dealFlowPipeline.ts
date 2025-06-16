import { Listing } from '../types/listing';
import { mlValuationEngine } from './mlValuationEngine';

interface DealStage {
  id: string;
  name: string;
  description: string;
  criteria: DealCriteria;
  actions: DealAction[];
}

interface DealCriteria {
  minScore?: number;
  maxPrice?: number;
  requiredFeatures?: string[];
  financingTypes?: string[];
  dealQuality?: string[];
}

interface DealAction {
  type: 'email' | 'notification' | 'analysis' | 'watchlist' | 'alert';
  trigger: 'immediate' | 'delayed' | 'scheduled';
  delay?: number; // in minutes
  config: any;
}

interface DealFlow {
  id: string;
  listingId: string;
  currentStage: string;
  stageHistory: StageEntry[];
  priority: number;
  estimatedValue?: number;
  dealQuality?: string;
  autoActions: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StageEntry {
  stage: string;
  enteredAt: Date;
  completedAt?: Date;
  actions: ActionResult[];
}

interface ActionResult {
  actionType: string;
  status: 'pending' | 'completed' | 'failed';
  executedAt?: Date;
  result?: any;
}

export class DealFlowPipeline {
  private stages: DealStage[] = [
    {
      id: 'discovery',
      name: 'Property Discovery',
      description: 'New property identified by scraping',
      criteria: {},
      actions: [
        {
          type: 'analysis',
          trigger: 'immediate',
          config: { includeValuation: true, includeComps: true }
        }
      ]
    },
    {
      id: 'qualification',
      name: 'Initial Qualification',
      description: 'Basic criteria screening',
      criteria: {
        minScore: 40,
        maxPrice: 500000
      },
      actions: [
        {
          type: 'notification',
          trigger: 'immediate',
          config: { 
            title: 'New Property Qualified',
            urgency: 'low'
          }
        }
      ]
    },
    {
      id: 'evaluation',
      name: 'Deep Evaluation',
      description: 'Comprehensive analysis and valuation',
      criteria: {
        minScore: 60,
        requiredFeatures: ['creative_financing', 'va_eligible'],
        dealQuality: ['good', 'excellent']
      },
      actions: [
        {
          type: 'analysis',
          trigger: 'immediate',
          config: { 
            deepAnalysis: true,
            marketComparison: true,
            investmentProjection: true
          }
        },
        {
          type: 'email',
          trigger: 'delayed',
          delay: 15,
          config: {
            template: 'property_evaluation',
            priority: 'high'
          }
        }
      ]
    },
    {
      id: 'hot_lead',
      name: 'Hot Lead',
      description: 'High-priority opportunities requiring immediate action',
      criteria: {
        minScore: 80,
        dealQuality: ['excellent'],
        financingTypes: ['owner_financing', 'lease_to_own']
      },
      actions: [
        {
          type: 'notification',
          trigger: 'immediate',
          config: {
            title: '🔥 HOT DEAL ALERT',
            urgency: 'critical',
            sound: true,
            push: true
          }
        },
        {
          type: 'email',
          trigger: 'immediate',
          config: {
            template: 'urgent_opportunity',
            priority: 'critical'
          }
        },
        {
          type: 'watchlist',
          trigger: 'immediate',
          config: {
            autoAdd: true,
            priceAlerts: true,
            statusAlerts: true
          }
        }
      ]
    },
    {
      id: 'under_contract',
      name: 'Under Contract',
      description: 'Property is under contract or being pursued',
      criteria: {},
      actions: [
        {
          type: 'alert',
          trigger: 'scheduled',
          config: {
            schedule: 'daily',
            trackingMode: true
          }
        }
      ]
    },
    {
      id: 'closed',
      name: 'Closed',
      description: 'Deal completed successfully',
      criteria: {},
      actions: [
        {
          type: 'notification',
          trigger: 'immediate',
          config: {
            title: '🎉 Deal Closed Successfully!',
            celebratory: true
          }
        }
      ]
    },
    {
      id: 'archived',
      name: 'Archived',
      description: 'Deal did not proceed or property no longer available',
      criteria: {},
      actions: []
    }
  ];

  private activeFlows = new Map<string, DealFlow>();
  private stageTimeouts = new Map<string, NodeJS.Timeout>();

  async procesNewListing(listing: Listing): Promise<DealFlow> {
    const dealFlow: DealFlow = {
      id: `deal_${listing.id}_${Date.now()}`,
      listingId: listing.id,
      currentStage: 'discovery',
      stageHistory: [],
      priority: this.calculatePriority(listing),
      autoActions: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activeFlows.set(dealFlow.id, dealFlow);
    
    // Start the pipeline
    await this.advanceToStage(dealFlow.id, 'discovery');
    
    return dealFlow;
  }

  async advanceToStage(dealFlowId: string, targetStage: string): Promise<void> {
    const dealFlow = this.activeFlows.get(dealFlowId);
    if (!dealFlow) throw new Error('Deal flow not found');

    const stage = this.stages.find(s => s.id === targetStage);
    if (!stage) throw new Error('Stage not found');

    // Complete current stage
    if (dealFlow.stageHistory.length > 0) {
      const currentHistory = dealFlow.stageHistory[dealFlow.stageHistory.length - 1];
      if (!currentHistory.completedAt) {
        currentHistory.completedAt = new Date();
      }
    }

    // Enter new stage
    const stageEntry: StageEntry = {
      stage: targetStage,
      enteredAt: new Date(),
      actions: []
    };

    dealFlow.currentStage = targetStage;
    dealFlow.stageHistory.push(stageEntry);
    dealFlow.updatedAt = new Date();

    // Execute stage actions
    await this.executeStageActions(dealFlow, stage);

    // Check for automatic advancement
    setTimeout(() => {
      this.checkAutoAdvancement(dealFlowId);
    }, 5000);
  }

  private async executeStageActions(dealFlow: DealFlow, stage: DealStage): Promise<void> {
    const listing = await this.getListingById(dealFlow.listingId);
    if (!listing) return;

    // Check if listing meets stage criteria
    if (!this.meetsStageriteria(listing, stage.criteria)) {
      // Move to archived if doesn't meet criteria
      if (stage.id !== 'archived') {
        await this.advanceToStage(dealFlow.id, 'archived');
      }
      return;
    }

    const currentStageEntry = dealFlow.stageHistory[dealFlow.stageHistory.length - 1];

    for (const action of stage.actions) {
      const actionResult: ActionResult = {
        actionType: action.type,
        status: 'pending'
      };

      currentStageEntry.actions.push(actionResult);

      if (action.trigger === 'immediate') {
        await this.executeAction(dealFlow, listing, action, actionResult);
      } else if (action.trigger === 'delayed' && action.delay) {
        setTimeout(async () => {
          await this.executeAction(dealFlow, listing, action, actionResult);
        }, action.delay * 60 * 1000);
      }
    }
  }

  private async executeAction(
    dealFlow: DealFlow, 
    listing: Listing, 
    action: DealAction, 
    actionResult: ActionResult
  ): Promise<void> {
    try {
      actionResult.executedAt = new Date();

      switch (action.type) {
        case 'analysis':
          const valuation = await mlValuationEngine.valuateProperty(listing);
          dealFlow.estimatedValue = valuation.estimatedValue;
          dealFlow.dealQuality = valuation.dealQuality;
          actionResult.result = valuation;
          break;

        case 'notification':
          await this.sendNotification(listing, action.config);
          actionResult.result = { sent: true };
          break;

        case 'email':
          await this.generateEmail(listing, action.config);
          actionResult.result = { generated: true };
          break;

        case 'watchlist':
          await this.addToWatchlist(listing, action.config);
          actionResult.result = { added: true };
          break;

        case 'alert':
          await this.setupAlert(listing, action.config);
          actionResult.result = { alertSet: true };
          break;
      }

      actionResult.status = 'completed';
    } catch (error) {
      actionResult.status = 'failed';
      actionResult.result = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private meetsStageriteria(listing: Listing, criteria: DealCriteria): boolean {
    if (criteria.minScore && (listing.score || 0) < criteria.minScore) return false;
    if (criteria.maxPrice && (listing.price || 0) > criteria.maxPrice) return false;
    
    if (criteria.requiredFeatures) {
      for (const feature of criteria.requiredFeatures) {
        switch (feature) {
          case 'creative_financing':
            if (!listing.creativeFinancing?.ownerFinancing && !listing.creativeFinancing?.leaseToOwn) {
              return false;
            }
            break;
          case 'va_eligible':
            if (!listing.flags?.va_eligible) return false;
            break;
        }
      }
    }

    return true;
  }

  private calculatePriority(listing: Listing): number {
    let priority = 50; // Base priority

    // Score-based priority
    const score = listing.score || 0;
    priority += score * 0.3;

    // Creative financing bonus
    if (listing.creativeFinancing?.ownerFinancing) priority += 15;
    if (listing.creativeFinancing?.leaseToOwn) priority += 10;
    
    // VA eligibility bonus
    if (listing.flags?.va_eligible) priority += 10;

    // Foreclosure bonus (higher opportunity)
    if (listing.listingType === 'Foreclosure') priority += 5;

    return Math.min(100, Math.max(0, priority));
  }

  private async checkAutoAdvancement(dealFlowId: string): Promise<void> {
    const dealFlow = this.activeFlows.get(dealFlowId);
    if (!dealFlow || !dealFlow.autoActions) return;

    const listing = await this.getListingById(dealFlow.listingId);
    if (!listing) return;

    // Auto-advancement logic
    switch (dealFlow.currentStage) {
      case 'discovery':
        await this.advanceToStage(dealFlowId, 'qualification');
        break;

      case 'qualification':
        if ((listing.score || 0) >= 60) {
          await this.advanceToStage(dealFlowId, 'evaluation');
        }
        break;

      case 'evaluation':
        if ((listing.score || 0) >= 80 && dealFlow.dealQuality === 'excellent') {
          await this.advanceToStage(dealFlowId, 'hot_lead');
        }
        break;
    }
  }

  // Action implementations
  private async sendNotification(listing: Listing, config: any): Promise<void> {
    console.log(`📱 Notification: ${config.title} for ${listing.address}`);
    // In production: integrate with push notification service
  }

  private async generateEmail(listing: Listing, config: any): Promise<void> {
    console.log(`📧 Email generated: ${config.template} for ${listing.address}`);
    // In production: integrate with AI email service
  }

  private async addToWatchlist(listing: Listing, config: any): Promise<void> {
    console.log(`👁️ Added to watchlist: ${listing.address}`);
    // In production: integrate with watchlist service
  }

  private async setupAlert(listing: Listing, config: any): Promise<void> {
    console.log(`🚨 Alert setup: ${config.schedule} for ${listing.address}`);
    // In production: integrate with alert service
  }

  private async getListingById(listingId: string): Promise<Listing | null> {
    // In production: fetch from database
    return null;
  }

  // Public interface methods
  getDealFlow(dealFlowId: string): DealFlow | undefined {
    return this.activeFlows.get(dealFlowId);
  }

  getAllActiveFlows(): DealFlow[] {
    return Array.from(this.activeFlows.values());
  }

  getFlowsByStage(stageId: string): DealFlow[] {
    return Array.from(this.activeFlows.values()).filter(flow => flow.currentStage === stageId);
  }

  async manualAdvancement(dealFlowId: string, targetStage: string): Promise<void> {
    await this.advanceToStage(dealFlowId, targetStage);
  }

  pauseAutoActions(dealFlowId: string): void {
    const dealFlow = this.activeFlows.get(dealFlowId);
    if (dealFlow) {
      dealFlow.autoActions = false;
    }
  }

  resumeAutoActions(dealFlowId: string): void {
    const dealFlow = this.activeFlows.get(dealFlowId);
    if (dealFlow) {
      dealFlow.autoActions = true;
    }
  }

  getStages(): DealStage[] {
    return this.stages;
  }

  getPipelineStats(): {
    totalActive: number;
    byStage: Record<string, number>;
    hotLeads: number;
    averageTimeInStage: Record<string, number>;
  } {
    const flows = Array.from(this.activeFlows.values());
    const byStage: Record<string, number> = {};
    
    // Count by stage
    this.stages.forEach(stage => {
      byStage[stage.id] = flows.filter(flow => flow.currentStage === stage.id).length;
    });

    return {
      totalActive: flows.length,
      byStage,
      hotLeads: byStage['hot_lead'] || 0,
      averageTimeInStage: this.calculateAverageTimeInStage(flows)
    };
  }

  private calculateAverageTimeInStage(flows: DealFlow[]): Record<string, number> {
    const stageTimes: Record<string, number[]> = {};
    
    flows.forEach(flow => {
      flow.stageHistory.forEach(entry => {
        if (entry.completedAt) {
          const timeInStage = entry.completedAt.getTime() - entry.enteredAt.getTime();
          if (!stageTimes[entry.stage]) stageTimes[entry.stage] = [];
          stageTimes[entry.stage].push(timeInStage / (1000 * 60)); // Convert to minutes
        }
      });
    });

    const averages: Record<string, number> = {};
    Object.keys(stageTimes).forEach(stage => {
      const times = stageTimes[stage];
      averages[stage] = times.reduce((sum, time) => sum + time, 0) / times.length;
    });

    return averages;
  }
}

export const dealFlowPipeline = new DealFlowPipeline();
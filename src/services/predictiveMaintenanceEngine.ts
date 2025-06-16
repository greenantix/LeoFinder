import { Listing } from '../types/listing';

interface MaintenanceItem {
  id: string;
  category: 'roofing' | 'hvac' | 'plumbing' | 'electrical' | 'exterior' | 'interior' | 'landscaping' | 'structural';
  component: string;
  description: string;
  urgency: 'immediate' | 'high' | 'medium' | 'low' | 'preventive';
  predictedDate: Date;
  estimatedCost: { min: number; max: number };
  lifespan: number; // years remaining
  riskLevel: 'critical' | 'high' | 'moderate' | 'low';
  factors: MaintenanceFactor[];
  impact: 'safety' | 'comfort' | 'efficiency' | 'value' | 'compliance';
  diyPossible: boolean;
  seasonalOptimal: 'spring' | 'summer' | 'fall' | 'winter' | 'any';
  veteranDiscount: boolean;
}

interface MaintenanceFactor {
  type: 'age' | 'climate' | 'usage' | 'quality' | 'maintenance_history';
  impact: number; // 0-100
  description: string;
}

interface MaintenanceSchedule {
  propertyId: string;
  generatedDate: Date;
  totalScore: number;
  riskProfile: 'low_maintenance' | 'moderate_maintenance' | 'high_maintenance' | 'fixer_upper';
  immediateNeeds: MaintenanceItem[];
  shortTerm: MaintenanceItem[]; // 0-2 years
  mediumTerm: MaintenanceItem[]; // 2-5 years
  longTerm: MaintenanceItem[]; // 5+ years
  annualBudget: {
    year1: number;
    year2: number;
    year3: number;
    year4: number;
    year5: number;
    total: number;
  };
  recommendations: MaintenanceRecommendation[];
  veteranResources: VeteranResource[];
}

interface MaintenanceRecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  reasoning: string;
  costSavings: number;
  energySavings?: number;
  veteranSpecific: boolean;
}

interface VeteranResource {
  type: 'loan' | 'grant' | 'discount' | 'service';
  program: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  contactInfo: string;
  maxBenefit?: number;
}

interface PropertyCondition {
  overall: number; // 0-100
  structural: number;
  mechanical: number;
  electrical: number;
  plumbing: number;
  exterior: number;
  interior: number;
  landscaping: number;
}

interface ClimateImpact {
  region: 'desert_southwest' | 'mountain' | 'valley' | 'coastal';
  extremeHeat: boolean;
  freezing: boolean;
  monsoons: boolean;
  windStorms: boolean;
  hailRisk: boolean;
  uvExposure: 'extreme' | 'high' | 'moderate';
}

export class PredictiveMaintenanceEngine {
  private maintenanceDatabase = new Map<string, MaintenanceItem[]>();
  private climateData = new Map<string, ClimateImpact>();
  private veteranPrograms: VeteranResource[] = [];
  private analysisCache = new Map<string, MaintenanceSchedule>();

  constructor() {
    this.initializeMaintenanceDatabase();
    this.initializeClimateData();
    this.initializeVeteranPrograms();
  }

  async generateMaintenanceSchedule(listing: Listing): Promise<MaintenanceSchedule> {
    const cacheKey = this.generateCacheKey(listing);
    
    // Check cache first
    if (this.analysisCache.has(cacheKey)) {
      const cached = this.analysisCache.get(cacheKey)!;
      if (this.isCacheValid(cached)) {
        return cached;
      }
    }

    try {
      // 1. Assess property condition
      const condition = this.assessPropertyCondition(listing);
      
      // 2. Identify climate impacts
      const climate = this.getClimateImpact(listing.zipCode || '85001');
      
      // 3. Generate maintenance items
      const maintenanceItems = await this.generateMaintenanceItems(listing, condition, climate);
      
      // 4. Categorize by timeline
      const categorized = this.categorizeByTimeline(maintenanceItems);
      
      // 5. Calculate costs and budgets
      const annualBudget = this.calculateAnnualBudgets(categorized);
      
      // 6. Generate recommendations
      const recommendations = this.generateRecommendations(listing, maintenanceItems, condition);
      
      // 7. Find veteran resources
      const veteranResources = this.findApplicableVeteranResources(maintenanceItems);
      
      // 8. Calculate overall scores
      const totalScore = this.calculateMaintenanceScore(condition, maintenanceItems);
      const riskProfile = this.determineRiskProfile(totalScore, maintenanceItems);

      const schedule: MaintenanceSchedule = {
        propertyId: listing.id,
        generatedDate: new Date(),
        totalScore,
        riskProfile,
        immediateNeeds: categorized.immediate,
        shortTerm: categorized.shortTerm,
        mediumTerm: categorized.mediumTerm,
        longTerm: categorized.longTerm,
        annualBudget,
        recommendations,
        veteranResources
      };

      // Cache the result
      this.analysisCache.set(cacheKey, schedule);
      
      return schedule;
      
    } catch (error) {
      throw new Error(`Maintenance analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private assessPropertyCondition(listing: Listing): PropertyCondition {
    const yearBuilt = listing.yearBuilt || 2000;
    const currentYear = new Date().getFullYear();
    const age = currentYear - yearBuilt;
    
    // Base condition scoring (newer = better condition)
    let baseScore = Math.max(30, 100 - (age * 1.5));
    
    // Adjust based on listing information
    if (listing.description) {
      const desc = listing.description.toLowerCase();
      
      // Positive indicators
      if (desc.includes('updated') || desc.includes('renovated') || desc.includes('remodeled')) {
        baseScore += 15;
      }
      if (desc.includes('new') && (desc.includes('roof') || desc.includes('hvac') || desc.includes('kitchen'))) {
        baseScore += 10;
      }
      
      // Negative indicators
      if (desc.includes('needs work') || desc.includes('fixer') || desc.includes('as-is')) {
        baseScore -= 25;
      }
      if (desc.includes('original') && age > 20) {
        baseScore -= 10;
      }
    }
    
    // Arizona-specific adjustments
    if (age > 15) {
      baseScore -= 5; // HVAC stress from heat
    }
    if (age > 25) {
      baseScore -= 10; // Roof degradation from UV
    }
    
    const overall = Math.max(20, Math.min(95, baseScore));
    
    return {
      overall,
      structural: overall + (Math.random() - 0.5) * 10,
      mechanical: Math.max(20, overall - age * 0.8), // HVAC degrades faster in AZ
      electrical: overall + (Math.random() - 0.5) * 8,
      plumbing: overall + (Math.random() - 0.5) * 12,
      exterior: Math.max(25, overall - age * 1.2), // UV damage in AZ
      interior: overall + (Math.random() - 0.5) * 15,
      landscaping: overall + (Math.random() - 0.5) * 20
    };
  }

  private getClimateImpact(zipCode: string): ClimateImpact {
    if (this.climateData.has(zipCode)) {
      return this.climateData.get(zipCode)!;
    }

    // Default Arizona climate impacts
    return {
      region: 'desert_southwest',
      extremeHeat: true,
      freezing: false,
      monsoons: true,
      windStorms: true,
      hailRisk: false,
      uvExposure: 'extreme'
    };
  }

  private async generateMaintenanceItems(
    listing: Listing, 
    condition: PropertyCondition, 
    climate: ClimateImpact
  ): Promise<MaintenanceItem[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const items: MaintenanceItem[] = [];
    const yearBuilt = listing.yearBuilt || 2000;
    const age = new Date().getFullYear() - yearBuilt;
    
    // Roofing items
    items.push(...this.generateRoofingItems(age, condition.exterior, climate));
    
    // HVAC items
    items.push(...this.generateHVACItems(age, condition.mechanical, climate));
    
    // Plumbing items
    items.push(...this.generatePlumbingItems(age, condition.plumbing, climate));
    
    // Electrical items
    items.push(...this.generateElectricalItems(age, condition.electrical));
    
    // Exterior items
    items.push(...this.generateExteriorItems(age, condition.exterior, climate));
    
    // Interior items
    items.push(...this.generateInteriorItems(age, condition.interior));
    
    // Landscaping items
    items.push(...this.generateLandscapingItems(condition.landscaping, climate));
    
    return items.sort((a, b) => {
      const urgencyOrder = { immediate: 0, high: 1, medium: 2, low: 3, preventive: 4 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  private generateRoofingItems(age: number, condition: number, climate: ClimateImpact): MaintenanceItem[] {
    const items: MaintenanceItem[] = [];
    
    // Arizona roofs typically last 15-20 years due to UV exposure
    const roofLifespan = 18;
    const timeToReplacement = Math.max(0, roofLifespan - age);
    
    if (timeToReplacement <= 2) {
      items.push({
        id: 'roof_replacement',
        category: 'roofing',
        component: 'Roof System',
        description: 'Complete roof replacement due to age and UV damage',
        urgency: timeToReplacement === 0 ? 'immediate' : 'high',
        predictedDate: new Date(Date.now() + timeToReplacement * 365 * 24 * 60 * 60 * 1000),
        estimatedCost: { min: 12000, max: 25000 },
        lifespan: timeToReplacement,
        riskLevel: timeToReplacement === 0 ? 'critical' : 'high',
        factors: [
          { type: 'age', impact: 80, description: 'Roof approaching end of lifespan' },
          { type: 'climate', impact: 90, description: 'Extreme UV exposure in Arizona' }
        ],
        impact: 'safety',
        diyPossible: false,
        seasonalOptimal: 'fall',
        veteranDiscount: true
      });
    } else {
      items.push({
        id: 'roof_maintenance',
        category: 'roofing',
        component: 'Roof Inspection & Repair',
        description: 'Annual roof inspection and minor repairs',
        urgency: 'preventive',
        predictedDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        estimatedCost: { min: 300, max: 800 },
        lifespan: timeToReplacement,
        riskLevel: 'low',
        factors: [
          { type: 'climate', impact: 70, description: 'Monsoon and UV damage prevention' }
        ],
        impact: 'value',
        diyPossible: false,
        seasonalOptimal: 'spring',
        veteranDiscount: true
      });
    }
    
    return items;
  }

  private generateHVACItems(age: number, condition: number, climate: ClimateImpact): MaintenanceItem[] {
    const items: MaintenanceItem[] = [];
    
    // HVAC systems work harder in Arizona heat
    const hvacLifespan = 12; // Shorter lifespan due to extreme use
    const timeToReplacement = Math.max(0, hvacLifespan - age);
    
    if (timeToReplacement <= 1) {
      items.push({
        id: 'hvac_replacement',
        category: 'hvac',
        component: 'HVAC System',
        description: 'Replace aging HVAC system with high-efficiency unit',
        urgency: timeToReplacement === 0 ? 'immediate' : 'high',
        predictedDate: new Date(Date.now() + timeToReplacement * 365 * 24 * 60 * 60 * 1000),
        estimatedCost: { min: 8000, max: 15000 },
        lifespan: timeToReplacement,
        riskLevel: 'critical',
        factors: [
          { type: 'age', impact: 85, description: 'System nearing end of life' },
          { type: 'climate', impact: 95, description: 'Extreme heat stress accelerates wear' }
        ],
        impact: 'comfort',
        diyPossible: false,
        seasonalOptimal: 'spring',
        veteranDiscount: true
      });
    }
    
    // Regular maintenance items
    items.push({
      id: 'hvac_tune_up',
      category: 'hvac',
      component: 'HVAC Maintenance',
      description: 'Bi-annual HVAC tune-up and filter replacement',
      urgency: 'medium',
      predictedDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      estimatedCost: { min: 150, max: 300 },
      lifespan: 10,
      riskLevel: 'low',
      factors: [
        { type: 'climate', impact: 80, description: 'Critical for Arizona summer survival' }
      ],
      impact: 'efficiency',
      diyPossible: false,
      seasonalOptimal: 'spring',
      veteranDiscount: true
    });
    
    return items;
  }

  private generatePlumbingItems(age: number, condition: number, climate: ClimateImpact): MaintenanceItem[] {
    const items: MaintenanceItem[] = [];
    
    // Water heater replacement
    const waterHeaterLifespan = 10;
    const timeToWHReplacement = Math.max(0, waterHeaterLifespan - age);
    
    if (timeToWHReplacement <= 2) {
      items.push({
        id: 'water_heater_replacement',
        category: 'plumbing',
        component: 'Water Heater',
        description: 'Replace aging water heater with energy-efficient model',
        urgency: timeToWHReplacement <= 1 ? 'high' : 'medium',
        predictedDate: new Date(Date.now() + timeToWHReplacement * 365 * 24 * 60 * 60 * 1000),
        estimatedCost: { min: 1200, max: 3000 },
        lifespan: timeToWHReplacement,
        riskLevel: timeToWHReplacement <= 1 ? 'high' : 'moderate',
        factors: [
          { type: 'age', impact: 75, description: 'Typical water heater lifespan' }
        ],
        impact: 'comfort',
        diyPossible: false,
        seasonalOptimal: 'any',
        veteranDiscount: true
      });
    }
    
    // Pipe maintenance for older homes
    if (age > 30) {
      items.push({
        id: 'pipe_inspection',
        category: 'plumbing',
        component: 'Plumbing System',
        description: 'Inspect and potentially replace aging copper/galvanized pipes',
        urgency: 'medium',
        predictedDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
        estimatedCost: { min: 3000, max: 8000 },
        lifespan: 5,
        riskLevel: 'moderate',
        factors: [
          { type: 'age', impact: 60, description: 'Older pipes may need replacement' }
        ],
        impact: 'value',
        diyPossible: false,
        seasonalOptimal: 'any',
        veteranDiscount: true
      });
    }
    
    return items;
  }

  private generateElectricalItems(age: number, condition: number): MaintenanceItem[] {
    const items: MaintenanceItem[] = [];
    
    // Electrical panel upgrade for older homes
    if (age > 25) {
      items.push({
        id: 'electrical_panel_upgrade',
        category: 'electrical',
        component: 'Electrical Panel',
        description: 'Upgrade electrical panel to modern standards and capacity',
        urgency: 'medium',
        predictedDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000),
        estimatedCost: { min: 2000, max: 4000 },
        lifespan: 8,
        riskLevel: 'moderate',
        factors: [
          { type: 'age', impact: 70, description: 'Older panels may not meet current needs' },
          { type: 'compliance', impact: 60, description: 'Safety and code compliance' }
        ],
        impact: 'safety',
        diyPossible: false,
        seasonalOptimal: 'any',
        veteranDiscount: true
      });
    }
    
    return items;
  }

  private generateExteriorItems(age: number, condition: number, climate: ClimateImpact): MaintenanceItem[] {
    const items: MaintenanceItem[] = [];
    
    // Exterior painting - more frequent in Arizona due to UV
    const paintLifespan = 5; // Shorter due to UV exposure
    const timeToPaint = paintLifespan - (age % paintLifespan);
    
    items.push({
      id: 'exterior_painting',
      category: 'exterior',
      component: 'Exterior Paint',
      description: 'Repaint exterior surfaces to protect from UV damage',
      urgency: timeToPaint <= 1 ? 'medium' : 'low',
      predictedDate: new Date(Date.now() + timeToPaint * 365 * 24 * 60 * 60 * 1000),
      estimatedCost: { min: 3500, max: 8000 },
      lifespan: timeToPaint,
      riskLevel: 'low',
      factors: [
        { type: 'climate', impact: 85, description: 'Extreme UV exposure in Arizona' }
      ],
      impact: 'value',
      diyPossible: true,
      seasonalOptimal: 'fall',
      veteranDiscount: true
    });
    
    return items;
  }

  private generateInteriorItems(age: number, condition: number): MaintenanceItem[] {
    const items: MaintenanceItem[] = [];
    
    // Flooring replacement
    if (age > 15) {
      items.push({
        id: 'flooring_update',
        category: 'interior',
        component: 'Flooring',
        description: 'Update worn flooring throughout home',
        urgency: 'low',
        predictedDate: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000),
        estimatedCost: { min: 5000, max: 15000 },
        lifespan: 12,
        riskLevel: 'low',
        factors: [
          { type: 'age', impact: 40, description: 'Normal wear and style updates' }
        ],
        impact: 'value',
        diyPossible: true,
        seasonalOptimal: 'any',
        veteranDiscount: false
      });
    }
    
    return items;
  }

  private generateLandscapingItems(condition: number, climate: ClimateImpact): MaintenanceItem[] {
    const items: MaintenanceItem[] = [];
    
    // Desert landscaping conversion
    items.push({
      id: 'xeriscaping',
      category: 'landscaping',
      component: 'Landscaping',
      description: 'Convert to drought-resistant desert landscaping',
      urgency: 'low',
      predictedDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
      estimatedCost: { min: 2000, max: 6000 },
      lifespan: 10,
      riskLevel: 'low',
      factors: [
        { type: 'climate', impact: 90, description: 'Water conservation in desert climate' }
      ],
      impact: 'efficiency',
      diyPossible: true,
      seasonalOptimal: 'fall',
      veteranDiscount: false
    });
    
    return items;
  }

  private categorizeByTimeline(items: MaintenanceItem[]): {
    immediate: MaintenanceItem[];
    shortTerm: MaintenanceItem[];
    mediumTerm: MaintenanceItem[];
    longTerm: MaintenanceItem[];
  } {
    const now = Date.now();
    const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
    const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
    const fiveYears = 5 * 365 * 24 * 60 * 60 * 1000;
    
    return {
      immediate: items.filter(item => 
        item.urgency === 'immediate' || 
        (item.predictedDate.getTime() - now) <= sixMonths
      ),
      shortTerm: items.filter(item => {
        const timeUntil = item.predictedDate.getTime() - now;
        return timeUntil > sixMonths && timeUntil <= twoYears;
      }),
      mediumTerm: items.filter(item => {
        const timeUntil = item.predictedDate.getTime() - now;
        return timeUntil > twoYears && timeUntil <= fiveYears;
      }),
      longTerm: items.filter(item => {
        const timeUntil = item.predictedDate.getTime() - now;
        return timeUntil > fiveYears;
      })
    };
  }

  private calculateAnnualBudgets(categorized: any): MaintenanceSchedule['annualBudget'] {
    const calculateYearCost = (items: MaintenanceItem[], year: number): number => {
      const yearStart = Date.now() + (year - 1) * 365 * 24 * 60 * 60 * 1000;
      const yearEnd = Date.now() + year * 365 * 24 * 60 * 60 * 1000;
      
      return items
        .filter(item => {
          const itemTime = item.predictedDate.getTime();
          return itemTime >= yearStart && itemTime < yearEnd;
        })
        .reduce((sum, item) => sum + (item.estimatedCost.min + item.estimatedCost.max) / 2, 0);
    };
    
    const year1 = calculateYearCost([...categorized.immediate, ...categorized.shortTerm], 1);
    const year2 = calculateYearCost(categorized.shortTerm, 2);
    const year3 = calculateYearCost([...categorized.shortTerm, ...categorized.mediumTerm], 3);
    const year4 = calculateYearCost(categorized.mediumTerm, 4);
    const year5 = calculateYearCost([...categorized.mediumTerm, ...categorized.longTerm], 5);
    
    return {
      year1: Math.round(year1),
      year2: Math.round(year2),
      year3: Math.round(year3),
      year4: Math.round(year4),
      year5: Math.round(year5),
      total: Math.round(year1 + year2 + year3 + year4 + year5)
    };
  }

  private generateRecommendations(
    listing: Listing, 
    items: MaintenanceItem[], 
    condition: PropertyCondition
  ): MaintenanceRecommendation[] {
    const recommendations: MaintenanceRecommendation[] = [];
    
    // High priority items
    const criticalItems = items.filter(item => item.riskLevel === 'critical');
    if (criticalItems.length > 0) {
      recommendations.push({
        category: 'Safety',
        priority: 'high',
        action: 'Address critical maintenance items immediately',
        reasoning: 'Critical items pose safety risks and can lead to emergency situations',
        costSavings: 0,
        veteranSpecific: false
      });
    }
    
    // Energy efficiency
    const hvacItems = items.filter(item => item.category === 'hvac');
    if (hvacItems.length > 0) {
      recommendations.push({
        category: 'Energy Efficiency',
        priority: 'high',
        action: 'Upgrade to high-efficiency HVAC system',
        reasoning: 'Arizona heat requires efficient cooling for comfort and cost savings',
        costSavings: 2000,
        energySavings: 30,
        veteranSpecific: true
      });
    }
    
    // Preventive maintenance
    recommendations.push({
      category: 'Preventive Care',
      priority: 'medium',
      action: 'Establish annual maintenance schedule',
      reasoning: 'Regular maintenance prevents costly emergency repairs',
      costSavings: 5000,
      veteranSpecific: false
    });
    
    return recommendations;
  }

  private findApplicableVeteranResources(items: MaintenanceItem[]): VeteranResource[] {
    return this.veteranPrograms.filter(program => {
      // Match programs to maintenance needs
      if (program.type === 'loan' && items.some(item => item.estimatedCost.max > 5000)) {
        return true;
      }
      if (program.type === 'grant' && items.some(item => item.impact === 'efficiency')) {
        return true;
      }
      if (program.type === 'discount' && items.some(item => item.veteranDiscount)) {
        return true;
      }
      return false;
    });
  }

  private calculateMaintenanceScore(condition: PropertyCondition, items: MaintenanceItem[]): number {
    let score = condition.overall;
    
    // Penalize for critical items
    const criticalCount = items.filter(item => item.riskLevel === 'critical').length;
    score -= criticalCount * 15;
    
    // Penalize for immediate needs
    const immediateCount = items.filter(item => item.urgency === 'immediate').length;
    score -= immediateCount * 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private determineRiskProfile(score: number, items: MaintenanceItem[]): MaintenanceSchedule['riskProfile'] {
    const immediateItems = items.filter(item => item.urgency === 'immediate').length;
    const criticalItems = items.filter(item => item.riskLevel === 'critical').length;
    
    if (score < 40 || immediateItems > 3 || criticalItems > 2) {
      return 'fixer_upper';
    } else if (score < 60 || immediateItems > 1) {
      return 'high_maintenance';
    } else if (score < 80) {
      return 'moderate_maintenance';
    } else {
      return 'low_maintenance';
    }
  }

  // Helper methods
  private initializeMaintenanceDatabase(): void {
    // Pre-loaded maintenance knowledge base would go here
    // For now, this is handled in the generation methods
  }

  private initializeClimateData(): void {
    // Arizona climate zones
    this.climateData.set('85001', {
      region: 'desert_southwest',
      extremeHeat: true,
      freezing: false,
      monsoons: true,
      windStorms: true,
      hailRisk: false,
      uvExposure: 'extreme'
    });
  }

  private initializeVeteranPrograms(): void {
    this.veteranPrograms = [
      {
        type: 'loan',
        program: 'VA Home Improvement Loan',
        description: 'Low-interest loans for home improvements and repairs',
        eligibility: ['Veteran', 'Active Duty', 'Reserve'],
        benefits: ['Low interest rates', 'No down payment', 'Up to $40,000'],
        contactInfo: 'va.gov/housing-assistance',
        maxBenefit: 40000
      },
      {
        type: 'grant',
        program: 'Disabled Veterans Energy Grant',
        description: 'Grants for energy-efficient home improvements',
        eligibility: ['Disabled Veteran', '30%+ Disability Rating'],
        benefits: ['Up to $15,000 grant', 'Energy efficiency focus'],
        contactInfo: 'energy.gov/veterans',
        maxBenefit: 15000
      },
      {
        type: 'discount',
        program: 'Veteran Contractor Network',
        description: 'Network of contractors offering veteran discounts',
        eligibility: ['All Veterans', 'Military Spouses'],
        benefits: ['10-20% contractor discounts', 'Vetted professionals'],
        contactInfo: 'veterancontractors.org'
      },
      {
        type: 'service',
        program: 'Veteran Home Repair Corps',
        description: 'Volunteer veteran groups providing home repair assistance',
        eligibility: ['Veterans in need', 'Low income'],
        benefits: ['Free labor', 'Material cost only', 'Community support'],
        contactInfo: 'veteranrepair.org'
      }
    ];
  }

  private generateCacheKey(listing: Listing): string {
    return `${listing.id}_${listing.yearBuilt}_${listing.zipCode}`;
  }

  private isCacheValid(schedule: MaintenanceSchedule): boolean {
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days
    return Date.now() - schedule.generatedDate.getTime() < maxAge;
  }

  // Public interface methods
  async batchAnalyzeProperties(listings: Listing[]): Promise<Map<string, MaintenanceSchedule>> {
    const results = new Map<string, MaintenanceSchedule>();
    
    // Process in batches
    const batchSize = 5;
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      const batchPromises = batch.map(listing => this.generateMaintenanceSchedule(listing));
      const batchResults = await Promise.all(batchPromises);
      
      batch.forEach((listing, index) => {
        results.set(listing.id, batchResults[index]);
      });
    }
    
    return results;
  }

  getCachedSchedule(propertyId: string): MaintenanceSchedule | null {
    const cached = Array.from(this.analysisCache.values()).find(
      schedule => schedule.propertyId === propertyId
    );
    
    return cached && this.isCacheValid(cached) ? cached : null;
  }

  getMaintenanceStats(): {
    totalAnalyzed: number;
    averageScore: number;
    highMaintenanceProperties: number;
    averageAnnualCost: number;
    veteranResourcesAvailable: number;
  } {
    const schedules = Array.from(this.analysisCache.values());
    
    return {
      totalAnalyzed: schedules.length,
      averageScore: schedules.length > 0 ? 
        Math.round(schedules.reduce((sum, s) => sum + s.totalScore, 0) / schedules.length) : 0,
      highMaintenanceProperties: schedules.filter(s => 
        s.riskProfile === 'high_maintenance' || s.riskProfile === 'fixer_upper'
      ).length,
      averageAnnualCost: schedules.length > 0 ? 
        Math.round(schedules.reduce((sum, s) => sum + s.annualBudget.year1, 0) / schedules.length) : 0,
      veteranResourcesAvailable: this.veteranPrograms.length
    };
  }

  getVeteranPrograms(): VeteranResource[] {
    return this.veteranPrograms;
  }

  clearCache(): void {
    this.analysisCache.clear();
  }
}

export const predictiveMaintenanceEngine = new PredictiveMaintenanceEngine();
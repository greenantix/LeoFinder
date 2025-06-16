import { Listing } from '../types/listing';

interface SatelliteImageRequest {
  propertyId: string;
  coordinates: { lat: number; lng: number };
  zoomLevel: number; // 15-20 for property analysis
  imageType: 'optical' | 'infrared' | 'composite' | 'change_detection';
  timeRange?: { start: Date; end: Date };
  analysisType: 'property_assessment' | 'environmental' | 'development' | 'disaster_risk';
}

interface SatelliteAnalysisResult {
  propertyId: string;
  imageUrl: string;
  analysisDate: Date;
  confidence: number;
  propertyAnalysis: PropertySatelliteAnalysis;
  environmentalFactors: EnvironmentalAnalysis;
  riskAssessment: RiskAssessment;
  marketInsights: MarketInsights;
  changeDetection?: ChangeAnalysis;
  recommendations: string[];
}

interface PropertySatelliteAnalysis {
  propertyBounds: {
    area: number; // square feet
    dimensions: { width: number; length: number };
    shape: 'rectangular' | 'irregular' | 'corner_lot' | 'flag_lot';
  };
  structures: {
    mainBuilding: StructureAnalysis;
    outbuildings: StructureAnalysis[];
    totalCoverage: number; // percentage of lot covered
  };
  landscaping: {
    vegetation: VegetationAnalysis;
    hardscaping: HardscapeAnalysis;
    irrigationDetected: boolean;
  };
  access: {
    driveway: DrivewayAnalysis;
    parking: ParkingAnalysis;
    streetAccess: 'direct' | 'private_road' | 'shared_access';
  };
  utilities: {
    powerLinesVisible: boolean;
    solarPanelsDetected: boolean;
    poolDetected: boolean;
    shedDetected: boolean;
  };
}

interface StructureAnalysis {
  type: 'residential' | 'commercial' | 'agricultural' | 'storage';
  footprint: number; // square feet
  roofMaterial: 'asphalt' | 'tile' | 'metal' | 'composite' | 'unknown';
  roofCondition: 'excellent' | 'good' | 'fair' | 'poor';
  orientation: number; // degrees from north
  shadowAnalysis: ShadowAnalysis;
}

interface ShadowAnalysis {
  morningShade: number; // percentage
  afternoonShade: number;
  optimalSolarPotential: boolean;
  surroundingObstructions: string[];
}

interface VegetationAnalysis {
  treeCount: number;
  treeHealth: 'excellent' | 'good' | 'fair' | 'poor';
  canopyCoverage: number; // percentage
  lawnArea: number; // square feet
  gardenAreas: number;
  vegetationDensity: 'sparse' | 'moderate' | 'dense';
}

interface HardscapeAnalysis {
  pavedAreas: number; // square feet
  walkways: boolean;
  patio: boolean;
  deck: boolean;
  fencing: 'none' | 'partial' | 'complete';
  retainingWalls: boolean;
}

interface DrivewayAnalysis {
  present: boolean;
  material: 'concrete' | 'asphalt' | 'gravel' | 'paved_stone' | 'dirt';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  length: number; // feet
  width: number; // feet
}

interface ParkingAnalysis {
  spaces: number;
  garageDetected: boolean;
  carportDetected: boolean;
  additionalParking: boolean;
}

interface EnvironmentalAnalysis {
  proximityFactors: {
    waterBodies: ProximityFactor[];
    forests: ProximityFactor[];
    openSpaces: ProximityFactor[];
    industrial: ProximityFactor[];
    commercial: ProximityFactor[];
  };
  airQuality: {
    score: number; // 0-100
    sources: string[];
  };
  noiseFactors: {
    trafficNoise: 'low' | 'moderate' | 'high';
    airportProximity: number; // miles
    railwayProximity: number; // miles
  };
  naturalLighting: {
    morningLight: 'excellent' | 'good' | 'fair' | 'poor';
    afternoonLight: 'excellent' | 'good' | 'fair' | 'poor';
    obstructions: string[];
  };
}

interface ProximityFactor {
  type: string;
  distance: number; // feet
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
}

interface RiskAssessment {
  naturalDisasters: {
    floodRisk: RiskLevel;
    fireRisk: RiskLevel;
    earthquakeRisk: RiskLevel;
    hurricaneRisk: RiskLevel;
  };
  environmental: {
    erosionRisk: RiskLevel;
    landslideRisk: RiskLevel;
    droughtRisk: RiskLevel;
  };
  development: {
    overdevelopmentRisk: RiskLevel;
    infrastructureStrain: RiskLevel;
    zonningChanges: RiskLevel;
  };
  overallRiskScore: number; // 0-100
}

interface RiskLevel {
  level: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  score: number; // 0-100
  factors: string[];
  mitigation: string[];
}

interface MarketInsights {
  neighborhood: {
    developmentTrend: 'declining' | 'stable' | 'growing' | 'rapid_growth';
    propertyDensity: 'sparse' | 'moderate' | 'dense';
    averageLotSize: number;
    buildingAge: 'new' | 'modern' | 'established' | 'historic';
  };
  comparableProperties: {
    count: number;
    averageSize: number;
    priceIndicators: string[];
  };
  futureValue: {
    projectedGrowth: number; // percentage over 5 years
    factors: string[];
  };
}

interface ChangeAnalysis {
  timespan: string;
  changes: PropertyChange[];
  significantChanges: boolean;
  developmentActivity: boolean;
}

interface PropertyChange {
  type: 'structure_added' | 'structure_removed' | 'vegetation_change' | 'access_change';
  description: string;
  impact: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

interface SatelliteProvider {
  name: string;
  resolution: number; // meters per pixel
  updateFrequency: string;
  coverage: string;
  dataTypes: string[];
}

export class SatelliteAnalysisEngine {
  private providers: SatelliteProvider[] = [
    {
      name: 'Maxar WorldView',
      resolution: 0.3,
      updateFrequency: 'Daily',
      coverage: 'Global',
      dataTypes: ['optical', 'infrared', 'stereo']
    },
    {
      name: 'Planet Labs',
      resolution: 3,
      updateFrequency: 'Daily',
      coverage: 'Global',
      dataTypes: ['optical', 'change_detection']
    },
    {
      name: 'Google Earth Engine',
      resolution: 10,
      updateFrequency: 'Weekly',
      coverage: 'Global',
      dataTypes: ['optical', 'infrared', 'radar']
    }
  ];

  private analysisCache = new Map<string, SatelliteAnalysisResult>();
  private aiModels = {
    propertyDetection: 'PropertyVision-v2.1',
    vegetationAnalysis: 'VegAI-Pro',
    changeDetection: 'ChangeNet-v3.0',
    riskAssessment: 'RiskAnalyzer-v1.8'
  };

  async analyzeProperty(listing: Listing): Promise<SatelliteAnalysisResult> {
    const coordinates = this.extractCoordinates(listing);
    if (!coordinates) {
      throw new Error('Unable to determine property coordinates');
    }

    const request: SatelliteImageRequest = {
      propertyId: listing.id,
      coordinates,
      zoomLevel: 18,
      imageType: 'composite',
      analysisType: 'property_assessment'
    };

    return this.performSatelliteAnalysis(request);
  }

  async performSatelliteAnalysis(request: SatelliteImageRequest): Promise<SatelliteAnalysisResult> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.analysisCache.has(cacheKey)) {
      const cached = this.analysisCache.get(cacheKey)!;
      if (this.isCacheValid(cached)) {
        return cached;
      }
    }

    try {
      // 1. Acquire satellite imagery
      const imageUrl = await this.acquireSatelliteImage(request);
      
      // 2. Perform AI analysis
      const propertyAnalysis = await this.analyzePropertyFeatures(imageUrl, request);
      
      // 3. Environmental analysis
      const environmentalFactors = await this.analyzeEnvironmentalFactors(request.coordinates);
      
      // 4. Risk assessment
      const riskAssessment = await this.assessRisks(request.coordinates, propertyAnalysis);
      
      // 5. Market insights
      const marketInsights = await this.generateMarketInsights(request.coordinates, propertyAnalysis);
      
      // 6. Change detection (if timeRange provided)
      const changeDetection = request.timeRange ? 
        await this.performChangeDetection(request) : undefined;
      
      // 7. Generate recommendations
      const recommendations = this.generateRecommendations(
        propertyAnalysis, 
        environmentalFactors, 
        riskAssessment
      );

      const result: SatelliteAnalysisResult = {
        propertyId: request.propertyId,
        imageUrl,
        analysisDate: new Date(),
        confidence: this.calculateOverallConfidence(propertyAnalysis),
        propertyAnalysis,
        environmentalFactors,
        riskAssessment,
        marketInsights,
        changeDetection,
        recommendations
      };

      // Cache the result
      this.analysisCache.set(cacheKey, result);
      
      return result;
      
    } catch (error) {
      throw new Error(`Satellite analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractCoordinates(listing: Listing): { lat: number; lng: number } | null {
    // Try to extract coordinates from listing data
    if (listing.coordinates) {
      return listing.coordinates;
    }
    
    // Fallback: geocode from address
    if (listing.address && listing.zipCode) {
      return this.geocodeAddress(listing.address, listing.zipCode);
    }
    
    return null;
  }

  private geocodeAddress(address: string, zipCode: string): { lat: number; lng: number } {
    // Simplified geocoding (in production, use real geocoding service)
    const zipCodeNum = parseInt(zipCode) || 85001;
    const baseLatitude = 33.4484; // Phoenix, AZ base
    const baseLongitude = -112.0740;
    
    // Add some variation based on ZIP code
    const latOffset = ((zipCodeNum % 1000) - 500) / 10000;
    const lngOffset = ((zipCodeNum % 1000) - 500) / 8000;
    
    return {
      lat: baseLatitude + latOffset,
      lng: baseLongitude + lngOffset
    };
  }

  private async acquireSatelliteImage(request: SatelliteImageRequest): Promise<string> {
    // Simulate satellite image acquisition
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const provider = this.selectOptimalProvider(request);
    const timestamp = Date.now();
    
    return `https://satellite-api.leofinder.com/${provider.name.toLowerCase()}/${request.propertyId}_${request.zoomLevel}_${timestamp}.jpg`;
  }

  private selectOptimalProvider(request: SatelliteImageRequest): SatelliteProvider {
    // Select provider based on requirements
    if (request.analysisType === 'change_detection') {
      return this.providers.find(p => p.name === 'Planet Labs')!;
    }
    
    if (request.zoomLevel > 18) {
      return this.providers.find(p => p.name === 'Maxar WorldView')!;
    }
    
    return this.providers[0]; // Default to highest resolution
  }

  private async analyzePropertyFeatures(imageUrl: string, request: SatelliteImageRequest): Promise<PropertySatelliteAnalysis> {
    // Simulate AI analysis of property features
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const lotArea = 8000 + Math.random() * 12000; // 8,000-20,000 sq ft
    const mainBuildingFootprint = lotArea * (0.15 + Math.random() * 0.25); // 15-40% coverage
    
    return {
      propertyBounds: {
        area: Math.round(lotArea),
        dimensions: {
          width: Math.sqrt(lotArea * 0.8),
          length: Math.sqrt(lotArea * 1.2)
        },
        shape: ['rectangular', 'irregular', 'corner_lot'][Math.floor(Math.random() * 3)] as any
      },
      structures: {
        mainBuilding: {
          type: 'residential',
          footprint: Math.round(mainBuildingFootprint),
          roofMaterial: ['asphalt', 'tile', 'metal'][Math.floor(Math.random() * 3)] as any,
          roofCondition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
          orientation: Math.floor(Math.random() * 360),
          shadowAnalysis: {
            morningShade: Math.random() * 40,
            afternoonShade: Math.random() * 30,
            optimalSolarPotential: Math.random() > 0.3,
            surroundingObstructions: this.generateObstructions()
          }
        },
        outbuildings: this.generateOutbuildings(),
        totalCoverage: Math.round(((mainBuildingFootprint + 500) / lotArea) * 100)
      },
      landscaping: {
        vegetation: {
          treeCount: Math.floor(Math.random() * 15) + 5,
          treeHealth: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
          canopyCoverage: Math.random() * 60,
          lawnArea: lotArea * (0.3 + Math.random() * 0.4),
          gardenAreas: Math.floor(Math.random() * 4),
          vegetationDensity: ['sparse', 'moderate', 'dense'][Math.floor(Math.random() * 3)] as any
        },
        hardscaping: {
          pavedAreas: lotArea * (0.1 + Math.random() * 0.2),
          walkways: Math.random() > 0.3,
          patio: Math.random() > 0.4,
          deck: Math.random() > 0.6,
          fencing: ['none', 'partial', 'complete'][Math.floor(Math.random() * 3)] as any,
          retainingWalls: Math.random() > 0.7
        },
        irrigationDetected: Math.random() > 0.5
      },
      access: {
        driveway: {
          present: Math.random() > 0.1,
          material: ['concrete', 'asphalt', 'gravel'][Math.floor(Math.random() * 3)] as any,
          condition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
          length: 20 + Math.random() * 80,
          width: 8 + Math.random() * 8
        },
        parking: {
          spaces: Math.floor(Math.random() * 6) + 2,
          garageDetected: Math.random() > 0.3,
          carportDetected: Math.random() > 0.7,
          additionalParking: Math.random() > 0.5
        },
        streetAccess: ['direct', 'private_road', 'shared_access'][Math.floor(Math.random() * 3)] as any
      },
      utilities: {
        powerLinesVisible: Math.random() > 0.4,
        solarPanelsDetected: Math.random() > 0.8,
        poolDetected: Math.random() > 0.7,
        shedDetected: Math.random() > 0.6
      }
    };
  }

  private generateObstructions(): string[] {
    const possible = ['tall_trees', 'neighboring_buildings', 'hills', 'power_lines'];
    const count = Math.floor(Math.random() * 3);
    const selected: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const obstruction = possible[Math.floor(Math.random() * possible.length)];
      if (!selected.includes(obstruction)) {
        selected.push(obstruction);
      }
    }
    
    return selected;
  }

  private generateOutbuildings(): StructureAnalysis[] {
    const count = Math.floor(Math.random() * 3);
    const buildings: StructureAnalysis[] = [];
    
    for (let i = 0; i < count; i++) {
      buildings.push({
        type: ['storage', 'agricultural'][Math.floor(Math.random() * 2)] as any,
        footprint: 100 + Math.random() * 400,
        roofMaterial: 'metal',
        roofCondition: ['good', 'fair'][Math.floor(Math.random() * 2)] as any,
        orientation: Math.floor(Math.random() * 360),
        shadowAnalysis: {
          morningShade: Math.random() * 20,
          afternoonShade: Math.random() * 20,
          optimalSolarPotential: false,
          surroundingObstructions: []
        }
      });
    }
    
    return buildings;
  }

  private async analyzeEnvironmentalFactors(coordinates: { lat: number; lng: number }): Promise<EnvironmentalAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      proximityFactors: {
        waterBodies: this.generateProximityFactors('water'),
        forests: this.generateProximityFactors('forest'),
        openSpaces: this.generateProximityFactors('park'),
        industrial: this.generateProximityFactors('industrial'),
        commercial: this.generateProximityFactors('commercial')
      },
      airQuality: {
        score: 60 + Math.random() * 35,
        sources: this.generateAirQualitySources()
      },
      noiseFactors: {
        trafficNoise: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as any,
        airportProximity: Math.random() * 50,
        railwayProximity: Math.random() * 20
      },
      naturalLighting: {
        morningLight: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
        afternoonLight: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
        obstructions: this.generateObstructions()
      }
    };
  }

  private generateProximityFactors(type: string): ProximityFactor[] {
    const count = Math.floor(Math.random() * 3) + 1;
    const factors: ProximityFactor[] = [];
    
    for (let i = 0; i < count; i++) {
      const distance = Math.random() * 5000 + 100; // 100-5100 feet
      let impact: 'positive' | 'neutral' | 'negative' = 'neutral';
      
      if (type === 'water' || type === 'forest' || type === 'park') {
        impact = distance < 1000 ? 'positive' : 'neutral';
      } else if (type === 'industrial') {
        impact = distance < 500 ? 'negative' : 'neutral';
      }
      
      factors.push({
        type: `${type}_${i + 1}`,
        distance: Math.round(distance),
        impact,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} area ${Math.round(distance / 100) * 100} feet away`
      });
    }
    
    return factors;
  }

  private generateAirQualitySources(): string[] {
    const possible = ['traffic', 'industrial', 'construction', 'natural', 'agricultural'];
    const count = Math.floor(Math.random() * 3) + 1;
    const selected: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const source = possible[Math.floor(Math.random() * possible.length)];
      if (!selected.includes(source)) {
        selected.push(source);
      }
    }
    
    return selected;
  }

  private async assessRisks(coordinates: { lat: number; lng: number }, propertyAnalysis: PropertySatelliteAnalysis): Promise<RiskAssessment> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Arizona-specific risk assessment
    const riskAssessment: RiskAssessment = {
      naturalDisasters: {
        floodRisk: this.generateRiskLevel('flood', coordinates),
        fireRisk: this.generateRiskLevel('fire', coordinates),
        earthquakeRisk: this.generateRiskLevel('earthquake', coordinates),
        hurricaneRisk: this.generateRiskLevel('hurricane', coordinates)
      },
      environmental: {
        erosionRisk: this.generateRiskLevel('erosion', coordinates),
        landslideRisk: this.generateRiskLevel('landslide', coordinates),
        droughtRisk: this.generateRiskLevel('drought', coordinates)
      },
      development: {
        overdevelopmentRisk: this.generateRiskLevel('overdevelopment', coordinates),
        infrastructureStrain: this.generateRiskLevel('infrastructure', coordinates),
        zonningChanges: this.generateRiskLevel('zoning', coordinates)
      },
      overallRiskScore: 0
    };

    // Calculate overall risk score
    const allRisks = [
      ...Object.values(riskAssessment.naturalDisasters),
      ...Object.values(riskAssessment.environmental),
      ...Object.values(riskAssessment.development)
    ];
    
    riskAssessment.overallRiskScore = Math.round(
      allRisks.reduce((sum, risk) => sum + risk.score, 0) / allRisks.length
    );

    return riskAssessment;
  }

  private generateRiskLevel(riskType: string, coordinates: { lat: number; lng: number }): RiskLevel {
    const azRisks: Record<string, { baseScore: number; factors: string[]; mitigation: string[] }> = {
      flood: {
        baseScore: 15, // Low in most of Arizona
        factors: ['Flash flood zones', 'Wash proximity', 'Elevation'],
        mitigation: ['Flood insurance', 'Elevation certificates', 'Drainage improvements']
      },
      fire: {
        baseScore: 65, // High in Arizona
        factors: ['Wildland interface', 'Vegetation density', 'Fire history'],
        mitigation: ['Defensible space', 'Fire-resistant materials', 'Sprinkler systems']
      },
      earthquake: {
        baseScore: 25, // Moderate in Arizona
        factors: ['Fault proximity', 'Soil type', 'Building age'],
        mitigation: ['Seismic retrofitting', 'Foundation bolting', 'Insurance']
      },
      drought: {
        baseScore: 75, // High in Arizona
        factors: ['Water source reliability', 'Conservation measures', 'Climate trends'],
        mitigation: ['Water harvesting', 'Xeriscaping', 'Efficient fixtures']
      }
    };

    const riskInfo = azRisks[riskType] || { baseScore: 30, factors: [], mitigation: [] };
    const score = Math.max(0, Math.min(100, riskInfo.baseScore + (Math.random() - 0.5) * 30));
    
    let level: RiskLevel['level'] = 'moderate';
    if (score < 20) level = 'very_low';
    else if (score < 40) level = 'low';
    else if (score < 60) level = 'moderate';
    else if (score < 80) level = 'high';
    else level = 'very_high';

    return {
      level,
      score: Math.round(score),
      factors: riskInfo.factors,
      mitigation: riskInfo.mitigation
    };
  }

  private async generateMarketInsights(coordinates: { lat: number; lng: number }, propertyAnalysis: PropertySatelliteAnalysis): Promise<MarketInsights> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      neighborhood: {
        developmentTrend: ['stable', 'growing', 'rapid_growth'][Math.floor(Math.random() * 3)] as any,
        propertyDensity: ['sparse', 'moderate'][Math.floor(Math.random() * 2)] as any,
        averageLotSize: propertyAnalysis.propertyBounds.area * (0.8 + Math.random() * 0.4),
        buildingAge: ['modern', 'established'][Math.floor(Math.random() * 2)] as any
      },
      comparableProperties: {
        count: Math.floor(Math.random() * 20) + 15,
        averageSize: propertyAnalysis.structures.mainBuilding.footprint * (0.9 + Math.random() * 0.2),
        priceIndicators: ['stable_pricing', 'moderate_appreciation', 'high_demand']
      },
      futureValue: {
        projectedGrowth: 2 + Math.random() * 8, // 2-10% over 5 years
        factors: ['Population growth', 'Infrastructure development', 'Economic indicators']
      }
    };
  }

  private async performChangeDetection(request: SatelliteImageRequest): Promise<ChangeAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const changes: PropertyChange[] = [];
    const changeTypes = ['structure_added', 'vegetation_change', 'access_change'];
    const changeCount = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < changeCount; i++) {
      changes.push({
        type: changeTypes[Math.floor(Math.random() * changeTypes.length)] as any,
        description: `Change detected in ${changeTypes[i]} analysis`,
        impact: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as any,
        confidence: 70 + Math.random() * 25
      });
    }
    
    return {
      timespan: '2 years',
      changes,
      significantChanges: changes.length > 1,
      developmentActivity: Math.random() > 0.6
    };
  }

  private generateRecommendations(
    propertyAnalysis: PropertySatelliteAnalysis,
    environmentalFactors: EnvironmentalAnalysis,
    riskAssessment: RiskAssessment
  ): string[] {
    const recommendations: string[] = [];
    
    // Property-based recommendations
    if (propertyAnalysis.structures.mainBuilding.shadowAnalysis.optimalSolarPotential) {
      recommendations.push('🌞 Excellent solar potential - consider solar panel installation');
    }
    
    if (propertyAnalysis.landscaping.vegetation.treeCount < 5) {
      recommendations.push('🌳 Consider planting more trees for shade and property value');
    }
    
    if (!propertyAnalysis.utilities.poolDetected && propertyAnalysis.propertyBounds.area > 10000) {
      recommendations.push('🏊 Large lot suitable for pool installation');
    }
    
    // Risk-based recommendations
    if (riskAssessment.naturalDisasters.fireRisk.level === 'high' || riskAssessment.naturalDisasters.fireRisk.level === 'very_high') {
      recommendations.push('🔥 High fire risk area - implement defensible space measures');
    }
    
    if (riskAssessment.naturalDisasters.droughtRisk.level === 'high') {
      recommendations.push('💧 Consider drought-resistant landscaping and water conservation');
    }
    
    // Environmental recommendations
    if (environmentalFactors.airQuality.score < 70) {
      recommendations.push('🌬️ Consider air filtration systems due to air quality concerns');
    }
    
    return recommendations;
  }

  // Helper methods
  private calculateOverallConfidence(propertyAnalysis: PropertySatelliteAnalysis): number {
    // Base confidence on various factors
    let confidence = 85; // Base confidence
    
    // Adjust based on property complexity
    if (propertyAnalysis.propertyBounds.shape === 'irregular') confidence -= 5;
    if (propertyAnalysis.structures.outbuildings.length > 2) confidence -= 3;
    if (propertyAnalysis.landscaping.vegetation.vegetationDensity === 'dense') confidence -= 2;
    
    return Math.max(70, Math.min(95, confidence));
  }

  private generateCacheKey(request: SatelliteImageRequest): string {
    return `${request.propertyId}_${request.coordinates.lat.toFixed(4)}_${request.coordinates.lng.toFixed(4)}_${request.imageType}`;
  }

  private isCacheValid(result: SatelliteAnalysisResult): boolean {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    return Date.now() - result.analysisDate.getTime() < maxAge;
  }

  // Public interface methods
  async batchAnalyzeProperties(listings: Listing[]): Promise<Map<string, SatelliteAnalysisResult>> {
    const results = new Map<string, SatelliteAnalysisResult>();
    
    // Process in batches to manage API limits
    const batchSize = 3;
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      const batchPromises = batch.map(listing => this.analyzeProperty(listing));
      const batchResults = await Promise.all(batchPromises);
      
      batch.forEach((listing, index) => {
        results.set(listing.id, batchResults[index]);
      });
    }
    
    return results;
  }

  getCachedAnalysis(propertyId: string): SatelliteAnalysisResult | null {
    const cached = Array.from(this.analysisCache.values()).find(
      result => result.propertyId === propertyId
    );
    
    return cached && this.isCacheValid(cached) ? cached : null;
  }

  getAnalysisStats(): {
    totalAnalyzed: number;
    averageConfidence: number;
    highRiskProperties: number;
    solarPotentialProperties: number;
  } {
    const results = Array.from(this.analysisCache.values());
    
    return {
      totalAnalyzed: results.length,
      averageConfidence: results.length > 0 ? 
        Math.round(results.reduce((sum, r) => sum + r.confidence, 0) / results.length) : 0,
      highRiskProperties: results.filter(r => r.riskAssessment.overallRiskScore > 70).length,
      solarPotentialProperties: results.filter(r => 
        r.propertyAnalysis.structures.mainBuilding.shadowAnalysis.optimalSolarPotential
      ).length
    };
  }

  getProviderInfo(): SatelliteProvider[] {
    return this.providers;
  }

  clearCache(): void {
    this.analysisCache.clear();
  }
}

export const satelliteAnalysisEngine = new SatelliteAnalysisEngine();
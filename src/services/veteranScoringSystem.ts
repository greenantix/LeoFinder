import { Listing } from '../types/listing';
import { liveAICoordinator } from './liveAICoordinator';

interface VeteranProfile {
  userId: string;
  veteranInfo: VeteranServiceInfo;
  housingNeeds: VeteranHousingNeeds;
  disabilities: DisabilityProfile;
  benefits: VeteranBenefits;
  preferences: ScoringPreferences;
  history: VeteranHistory;
}

interface VeteranServiceInfo {
  branch: 'army' | 'navy' | 'air_force' | 'marines' | 'coast_guard' | 'space_force';
  rank: string;
  mos: string; // Military Occupational Specialty
  serviceYears: { start: number; end?: number };
  deployments: Deployment[];
  commendations: string[];
  security_clearance?: 'confidential' | 'secret' | 'top_secret';
  discharge_type: 'honorable' | 'general' | 'other_than_honorable' | 'bad_conduct' | 'dishonorable';
}

interface Deployment {
  location: string;
  startDate: Date;
  endDate: Date;
  type: 'combat' | 'peacekeeping' | 'training' | 'humanitarian';
}

interface VeteranHousingNeeds {
  timeline: 'immediate' | 'within_3_months' | 'within_6_months' | 'within_year' | 'exploring';
  budget: VeteranBudget;
  familyComposition: FamilyComposition;
  accessibility: AccessibilityNeeds;
  location: LocationPreferences;
  propertyRequirements: PropertyRequirements;
  specialRequirements: SpecialRequirement[];
}

interface VeteranBudget {
  monthlyIncome: number;
  vaCompensation: number;
  otherIncome: number;
  maxMonthlyPayment: number;
  downPaymentAvailable: number;
  emergencyFund: number;
  debtToIncomeRatio: number;
}

interface FamilyComposition {
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  dependents: Dependent[];
  pets: Pet[];
  caregiving: CaregivingNeeds;
}

interface Dependent {
  relationship: 'spouse' | 'child' | 'parent' | 'other';
  age: number;
  specialNeeds: boolean;
  schoolAge: boolean;
}

interface Pet {
  type: 'dog' | 'cat' | 'other';
  size: 'small' | 'medium' | 'large';
  serviceAnimal: boolean;
  emotional_support: boolean;
}

interface CaregivingNeeds {
  elderly_parent: boolean;
  disabled_family_member: boolean;
  childcare_needs: boolean;
  respite_care: boolean;
}

interface DisabilityProfile {
  vaRating: number;
  conditions: DisabilityCondition[];
  accommodations: AccommodationNeed[];
  mobility: MobilityProfile;
  cognitive: CognitiveProfile;
  sensory: SensoryProfile;
  mentalHealth: MentalHealthProfile;
}

interface DisabilityCondition {
  condition: string;
  rating: number;
  serviceConnected: boolean;
  static: boolean;
  bodySystem: 'musculoskeletal' | 'neurological' | 'mental' | 'respiratory' | 'cardiovascular' | 'other';
}

interface AccommodationNeed {
  type: string;
  priority: 'critical' | 'important' | 'preferred';
  description: string;
  cost_estimate: number;
  funding_available: boolean;
}

interface MobilityProfile {
  wheelchair: boolean;
  walker: boolean;
  cane: boolean;
  mobility_scooter: boolean;
  stairs_difficulty: 'none' | 'mild' | 'moderate' | 'severe';
  walking_distance: number; // max comfortable distance in feet
}

interface CognitiveProfile {
  tbi: boolean; // Traumatic Brain Injury
  memory_issues: boolean;
  concentration_difficulty: boolean;
  executive_function: boolean;
  processing_speed: 'normal' | 'slow' | 'very_slow';
}

interface SensoryProfile {
  vision: VisionProfile;
  hearing: HearingProfile;
  other_sensory: string[];
}

interface VisionProfile {
  legally_blind: boolean;
  low_vision: boolean;
  night_blindness: boolean;
  color_blind: boolean;
  assistive_technology: string[];
}

interface HearingProfile {
  hearing_loss: 'none' | 'mild' | 'moderate' | 'severe' | 'profound';
  hearing_aids: boolean;
  cochlear_implant: boolean;
  sign_language: boolean;
  assistive_listening: string[];
}

interface MentalHealthProfile {
  ptsd: boolean;
  depression: boolean;
  anxiety: boolean;
  substance_abuse: boolean;
  social_anxiety: boolean;
  triggers: string[];
  coping_strategies: string[];
  support_needs: string[];
}

interface VeteranBenefits {
  va_loan_eligibility: VALoanEligibility;
  disability_compensation: DisabilityCompensation;
  housing_grants: HousingGrant[];
  property_tax_exemptions: PropertyTaxExemption[];
  utility_assistance: UtilityAssistance;
  vocational_rehab: VocationalRehab;
  education: EducationBenefits;
}

interface VALoanEligibility {
  eligible: boolean;
  entitlement_amount: number;
  remaining_entitlement: number;
  prior_use: boolean;
  funding_fee_exempt: boolean;
  certificate_of_eligibility: boolean;
}

interface DisabilityCompensation {
  monthly_amount: number;
  rating: number;
  individual_unemployability: boolean;
  special_monthly_compensation: number;
  dependents_allowance: number;
}

interface HousingGrant {
  type: 'sha' | 'sah' | 'hisa'; // Specially Adapted Housing, Special Home Adaptation, Home Improvements and Structural Alterations
  eligible: boolean;
  amount_available: number;
  amount_used: number;
  restrictions: string[];
  application_status: 'not_applied' | 'pending' | 'approved' | 'denied';
}

interface PropertyTaxExemption {
  state: string;
  type: 'full' | 'partial' | 'homestead';
  eligibility_rating: number;
  annual_savings: number;
  application_required: boolean;
}

interface UtilityAssistance {
  liheap_eligible: boolean; // Low Income Home Energy Assistance Program
  weatherization: boolean;
  emergency_assistance: boolean;
  veteran_specific_programs: string[];
}

interface VocationalRehab {
  chapter31_eligible: boolean;
  housing_allowance: number;
  subsistence_allowance: number;
  program_status: 'not_enrolled' | 'enrolled' | 'completed';
}

interface EducationBenefits {
  gibill_type: 'post_911' | 'montgomery' | 'survivors' | 'none';
  remaining_months: number;
  housing_allowance_rate: number;
  yellow_ribbon: boolean;
  dependents_transfer: boolean;
}

interface LocationPreferences {
  preferredStates: string[];
  avoidStates: string[];
  proximityToVA: ProximityRequirement;
  proximityToFamily: ProximityRequirement;
  proximityToEmployment: ProximityRequirement;
  climate: ClimatePreference;
  urbanization: 'urban' | 'suburban' | 'rural';
  veteran_community: boolean;
}

interface ProximityRequirement {
  required: boolean;
  max_distance: number; // miles
  importance: 'critical' | 'important' | 'preferred';
}

interface ClimatePreference {
  avoid_cold: boolean;
  avoid_heat: boolean;
  avoid_humidity: boolean;
  seasonal_affective: boolean;
  preferred_seasons: string[];
}

interface PropertyRequirements {
  property_types: string[];
  min_bedrooms: number;
  min_bathrooms: number;
  min_sqft: number;
  max_sqft?: number;
  stories: 'single' | 'multi' | 'no_preference';
  yard: YardRequirements;
  parking: ParkingRequirements;
  age_preference: AgePreference;
}

interface YardRequirements {
  required: boolean;
  fenced: boolean;
  size: 'small' | 'medium' | 'large';
  maintenance: 'low' | 'medium' | 'high';
  garden_space: boolean;
}

interface ParkingRequirements {
  spaces_needed: number;
  garage_preferred: boolean;
  accessible_parking: boolean;
  covered_parking: boolean;
}

interface AgePreference {
  prefer_new: boolean;
  avoid_old: boolean;
  min_year_built?: number;
  historic_ok: boolean;
}

interface SpecialRequirement {
  type: string;
  description: string;
  priority: 'must_have' | 'strongly_preferred' | 'nice_to_have';
  cost_impact: number;
}

interface ScoringPreferences {
  scoring_weights: ScoringWeights;
  deal_breakers: string[];
  nice_to_haves: string[];
  flexibility_level: number; // 0-1, how willing to compromise
  explanation_detail: 'minimal' | 'standard' | 'detailed';
}

interface ScoringWeights {
  va_benefits: number;
  accessibility: number;
  affordability: number;
  location: number;
  property_condition: number;
  veteran_community: number;
  family_needs: number;
  investment_potential: number;
  safety: number;
  proximity_services: number;
}

interface VeteranHistory {
  previous_homes: PreviousHome[];
  search_history: VeteranSearchHistory[];
  property_interactions: PropertyInteraction[];
  feedback_given: VeteranFeedback[];
  preferences_evolution: PreferenceEvolution[];
}

interface PreviousHome {
  address: string;
  ownership_type: 'owned' | 'rented' | 'military_housing';
  duration: { start: Date; end: Date };
  satisfaction: number; // 0-10
  reasons_for_leaving: string[];
  modifications_made: HomeModification[];
}

interface HomeModification {
  modification: string;
  cost: number;
  satisfaction: number;
  va_funded: boolean;
}

interface VeteranSearchHistory {
  search_date: Date;
  criteria: any;
  results_viewed: number;
  properties_contacted: number;
  offers_made: number;
  search_satisfaction: number;
}

interface PropertyInteraction {
  listing_id: string;
  interaction_type: 'viewed' | 'saved' | 'contacted' | 'visited' | 'offered' | 'purchased';
  timestamp: Date;
  notes: string;
  satisfaction: number;
  veteran_specific_notes: string;
}

interface VeteranFeedback {
  property_id: string;
  overall_rating: number;
  veteran_suitability: number;
  accessibility_rating: number;
  va_benefits_clarity: number;
  recommendation_quality: number;
  comments: string;
  improvement_suggestions: string[];
}

interface PreferenceEvolution {
  date: Date;
  changed_preferences: string[];
  reasons: string[];
  life_events: string[];
}

interface VeteranScoringResult {
  listingId: string;
  overallScore: number;
  categoryScores: CategoryScores;
  veteranSpecificFactors: VeteranFactor[];
  accessibilityAnalysis: AccessibilityAnalysis;
  financialAnalysis: VeteranFinancialAnalysis;
  riskAssessment: VeteranRiskAssessment;
  benefitsAnalysis: BenefitsAnalysis;
  recommendationLevel: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding';
  actionItems: ActionItem[];
  warnings: VeteranWarning[];
  explanations: ScoringExplanation[];
  confidence: number;
}

interface CategoryScores {
  va_benefits: number;
  accessibility: number;
  affordability: number;
  location: number;
  property_condition: number;
  veteran_community: number;
  family_suitability: number;
  investment_potential: number;
  safety_security: number;
  proximity_services: number;
}

interface VeteranFactor {
  factor: string;
  impact: number; // -100 to +100
  weight: number;
  explanation: string;
  category: 'positive' | 'negative' | 'neutral';
  veteran_specific: boolean;
}

interface AccessibilityAnalysis {
  overall_accessibility: number;
  current_accessibility: CurrentAccessibility;
  required_modifications: RequiredModification[];
  potential_funding: AccessibilityFunding[];
  timeline_estimate: string;
  total_cost: number;
  funding_coverage: number;
}

interface CurrentAccessibility {
  entrance_accessibility: number;
  interior_accessibility: number;
  bathroom_accessibility: number;
  kitchen_accessibility: number;
  bedroom_accessibility: number;
  safety_features: number;
}

interface RequiredModification {
  modification: string;
  priority: 'immediate' | 'important' | 'eventual';
  cost_estimate: number;
  complexity: 'simple' | 'moderate' | 'complex';
  contractor_required: boolean;
  permit_required: boolean;
  funding_eligible: boolean;
  impact_on_value: number;
}

interface AccessibilityFunding {
  program: string;
  amount_available: number;
  eligibility_met: boolean;
  application_process: string;
  timeline: string;
  restrictions: string[];
}

interface VeteranFinancialAnalysis {
  affordability_score: number;
  monthly_costs: VeteranMonthlyCosts;
  down_payment_analysis: DownPaymentAnalysis;
  loan_options: VeteranLoanOption[];
  total_cost_analysis: TotalCostAnalysis;
  financial_stress_indicators: FinancialStressIndicator[];
  break_even_analysis: BreakEvenAnalysis;
}

interface VeteranMonthlyCosts {
  mortgage_payment: number;
  property_taxes: number;
  insurance: number;
  hoa_fees: number;
  utilities: number;
  maintenance: number;
  accessibility_costs: number;
  total_monthly: number;
  percentage_of_income: number;
}

interface DownPaymentAnalysis {
  required_conventional: number;
  required_va: number;
  available_funds: number;
  gap_analysis: number;
  alternative_sources: AlternativeSource[];
}

interface AlternativeSource {
  source: string;
  amount: number;
  availability: string;
  requirements: string[];
  impact: string;
}

interface VeteranLoanOption {
  loan_type: string;
  eligible: boolean;
  amount: number;
  interest_rate: number;
  monthly_payment: number;
  down_payment: number;
  closing_costs: number;
  total_cost: number;
  veteran_advantages: string[];
  requirements: string[];
  timeline: string;
}

interface TotalCostAnalysis {
  purchase_price: number;
  closing_costs: number;
  immediate_modifications: number;
  first_year_costs: number;
  five_year_costs: number;
  lifetime_costs: number;
  va_benefits_savings: number;
  net_cost: number;
}

interface FinancialStressIndicator {
  indicator: string;
  level: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string[];
}

interface BreakEvenAnalysis {
  break_even_years: number;
  rent_vs_own_comparison: RentVsOwnComparison;
  investment_return: InvestmentReturn;
}

interface RentVsOwnComparison {
  monthly_rent_equivalent: number;
  ownership_advantage: number;
  breakeven_point: number; // months
  long_term_savings: number;
}

interface InvestmentReturn {
  expected_appreciation: number;
  equity_buildup: number;
  tax_benefits: number;
  total_return: number;
  roi_percentage: number;
}

interface VeteranRiskAssessment {
  overall_risk: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  risk_factors: VeteranRiskFactor[];
  mitigation_strategies: MitigationStrategy[];
  veteran_specific_risks: VeteranSpecificRisk[];
  risk_tolerance_match: number;
}

interface VeteranRiskFactor {
  category: 'financial' | 'health' | 'property' | 'location' | 'legal' | 'accessibility';
  risk: string;
  probability: number;
  impact: number;
  risk_score: number;
  veteran_relevance: boolean;
}

interface MitigationStrategy {
  risk_addressed: string;
  strategy: string;
  cost: number;
  effectiveness: number;
  timeline: string;
  veteran_resources: string[];
}

interface VeteranSpecificRisk {
  risk: string;
  description: string;
  probability: number;
  impact: string;
  mitigation: string;
  va_support: boolean;
}

interface BenefitsAnalysis {
  total_benefit_value: number;
  annual_savings: number;
  lifetime_savings: number;
  available_benefits: AvailableBenefit[];
  unutilized_benefits: UnutilizedBenefit[];
  application_required: ApplicationRequired[];
}

interface AvailableBenefit {
  benefit: string;
  annual_value: number;
  lifetime_value: number;
  certainty: number;
  requirements_met: boolean;
  application_status: string;
}

interface UnutilizedBenefit {
  benefit: string;
  potential_value: number;
  eligibility_likelihood: number;
  barriers: string[];
  next_steps: string[];
}

interface ApplicationRequired {
  benefit: string;
  application_process: string;
  required_documents: string[];
  timeline: string;
  approval_likelihood: number;
  assistance_available: boolean;
}

interface ActionItem {
  priority: 'immediate' | 'before_purchase' | 'after_purchase' | 'long_term';
  action: string;
  description: string;
  responsible_party: 'veteran' | 'agent' | 'lender' | 'va' | 'contractor';
  estimated_time: string;
  estimated_cost: number;
  benefits: string[];
  resources: string[];
}

interface VeteranWarning {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'financial' | 'accessibility' | 'legal' | 'health' | 'safety';
  warning: string;
  explanation: string;
  consequences: string[];
  recommendations: string[];
  va_resources: string[];
}

interface ScoringExplanation {
  aspect: string;
  score: number;
  reasoning: string;
  factors: ExplanationFactor[];
  veteran_context: string;
  improvement_potential: string;
}

interface ExplanationFactor {
  factor: string;
  contribution: number;
  explanation: string;
}

export class VeteranScoringSystem {
  private scoringWeights: ScoringWeights;
  private accessibilityDatabase: Map<string, any>;
  private benefitsDatabase: Map<string, any>;
  private veteranCommunityData: Map<string, any>;

  constructor() {
    this.scoringWeights = this.getDefaultScoringWeights();
    this.accessibilityDatabase = new Map();
    this.benefitsDatabase = new Map();
    this.veteranCommunityData = new Map();
    
    this.initializeDatabases();
  }

  // Main Scoring Method
  async scorePropertyForVeteran(
    listing: Listing, 
    veteranProfile: VeteranProfile
  ): Promise<VeteranScoringResult> {
    console.log(`🎖️ [VETERAN SCORING] Analyzing property ${listing.id} for veteran ${veteranProfile.userId}`);

    try {
      // Calculate category scores
      const categoryScores = await this.calculateCategoryScores(listing, veteranProfile);

      // Calculate overall score using weighted average
      const overallScore = this.calculateWeightedScore(categoryScores, veteranProfile.preferences.scoring_weights);

      // Perform specialized analyses
      const veteranFactors = await this.analyzeVeteranSpecificFactors(listing, veteranProfile);
      const accessibilityAnalysis = await this.performAccessibilityAnalysis(listing, veteranProfile);
      const financialAnalysis = await this.performFinancialAnalysis(listing, veteranProfile);
      const riskAssessment = await this.performRiskAssessment(listing, veteranProfile);
      const benefitsAnalysis = await this.performBenefitsAnalysis(listing, veteranProfile);

      // Generate recommendations and warnings
      const actionItems = this.generateActionItems(listing, veteranProfile, accessibilityAnalysis, financialAnalysis);
      const warnings = this.generateWarnings(listing, veteranProfile, riskAssessment);
      const explanations = this.generateExplanations(categoryScores, veteranFactors, veteranProfile);

      // Determine recommendation level
      const recommendationLevel = this.determineRecommendationLevel(overallScore, riskAssessment, accessibilityAnalysis);

      // Calculate confidence
      const confidence = this.calculateConfidence(categoryScores, veteranProfile, listing);

      const result: VeteranScoringResult = {
        listingId: listing.id,
        overallScore,
        categoryScores,
        veteranSpecificFactors: veteranFactors,
        accessibilityAnalysis,
        financialAnalysis,
        riskAssessment,
        benefitsAnalysis,
        recommendationLevel,
        actionItems,
        warnings,
        explanations,
        confidence
      };

      console.log(`✅ [VETERAN SCORING] Property ${listing.id} scored ${overallScore.toFixed(1)}/100 (${recommendationLevel})`);

      return result;

    } catch (error) {
      console.error(`❌ [VETERAN SCORING] Error scoring property ${listing.id}:`, error);
      throw error;
    }
  }

  // Category Scoring Methods
  private async calculateCategoryScores(listing: Listing, veteranProfile: VeteranProfile): Promise<CategoryScores> {
    const scores: CategoryScores = {
      va_benefits: await this.scoreVABenefits(listing, veteranProfile),
      accessibility: await this.scoreAccessibility(listing, veteranProfile),
      affordability: await this.scoreAffordability(listing, veteranProfile),
      location: await this.scoreLocation(listing, veteranProfile),
      property_condition: await this.scorePropertyCondition(listing, veteranProfile),
      veteran_community: await this.scoreVeteranCommunity(listing, veteranProfile),
      family_suitability: await this.scoreFamilySuitability(listing, veteranProfile),
      investment_potential: await this.scoreInvestmentPotential(listing, veteranProfile),
      safety_security: await this.scoreSafetySecurity(listing, veteranProfile),
      proximity_services: await this.scoreProximityServices(listing, veteranProfile)
    };

    return scores;
  }

  private async scoreVABenefits(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    let score = 50; // Base score

    // VA loan eligibility (30 points)
    if (listing.flags?.va_eligible && veteranProfile.benefits.va_loan_eligibility.eligible) {
      score += 30;
      
      // Bonus for funding fee exemption
      if (veteranProfile.benefits.va_loan_eligibility.funding_fee_exempt) {
        score += 10;
      }
    }

    // Property tax exemptions (20 points)
    const taxExemptions = veteranProfile.benefits.property_tax_exemptions.filter(
      exemption => exemption.eligibility_rating <= veteranProfile.disabilities.vaRating
    );
    if (taxExemptions.length > 0) {
      score += Math.min(20, taxExemptions.length * 10);
    }

    // Housing grants applicability (20 points)
    const applicableGrants = veteranProfile.benefits.housing_grants.filter(grant => grant.eligible);
    if (applicableGrants.length > 0) {
      score += Math.min(20, applicableGrants.length * 10);
    }

    // Energy efficiency programs (10 points)
    if (veteranProfile.benefits.utility_assistance.weatherization) {
      score += 10;
    }

    return Math.min(100, score);
  }

  private async scoreAccessibility(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    if (veteranProfile.disabilities.vaRating === 0) {
      return 85; // Good baseline for non-disabled veterans
    }

    let score = 30; // Base accessibility score
    const disabilities = veteranProfile.disabilities;

    // Single-story bonus for mobility issues
    if (disabilities.mobility.wheelchair || disabilities.mobility.walker || 
        disabilities.mobility.stairs_difficulty !== 'none') {
      if (listing.description?.toLowerCase().includes('single') || 
          listing.description?.toLowerCase().includes('ranch')) {
        score += 25;
      } else {
        score -= 15; // Penalty for multi-story
      }
    }

    // Bathroom accessibility
    if (disabilities.mobility.wheelchair) {
      // Check for accessibility features in description
      if (listing.description?.toLowerCase().includes('accessible') ||
          listing.description?.toLowerCase().includes('ada')) {
        score += 20;
      }
    }

    // Newer construction bonus
    if (listing.yearBuilt && listing.yearBuilt > 1990) {
      score += 15; // Better compliance with accessibility standards
    }

    // Ramp access
    if (listing.description?.toLowerCase().includes('ramp')) {
      score += 15;
    }

    // Wide doorways (inferred from newer construction or description)
    if (listing.yearBuilt && listing.yearBuilt > 2000) {
      score += 10;
    }

    // PTSD considerations
    if (disabilities.mentalHealth.ptsd) {
      // Privacy and quiet location benefits
      if (listing.propertyType === 'Single Family') {
        score += 10;
      }
      
      // Fenced yard for privacy
      if (listing.description?.toLowerCase().includes('fenced')) {
        score += 5;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  private async scoreAffordability(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    const budget = veteranProfile.housingNeeds.budget;
    const price = listing.price || 0;

    // Calculate total monthly housing costs
    const monthlyPayment = this.calculateVALoanPayment(price, veteranProfile);
    const propertyTaxes = this.estimatePropertyTaxes(price, veteranProfile);
    const insurance = this.estimateInsurance(price, listing);
    const totalMonthly = monthlyPayment + propertyTaxes + insurance;

    // Score based on debt-to-income ratio
    const dtiRatio = totalMonthly / budget.monthlyIncome;
    let score = 100;

    if (dtiRatio > 0.41) { // VA guideline is typically 41%
      score -= (dtiRatio - 0.41) * 200; // Heavy penalty for exceeding guidelines
    } else if (dtiRatio > 0.28) { // Conservative 28% rule
      score -= (dtiRatio - 0.28) * 100;
    }

    // Bonus for being well within budget
    if (dtiRatio < 0.25) {
      score += 10;
    }

    // Down payment considerations
    if (listing.flags?.va_eligible) {
      score += 15; // Bonus for no down payment
    } else {
      const downPaymentNeeded = price * 0.2;
      if (downPaymentNeeded > budget.downPaymentAvailable) {
        score -= 30; // Major penalty for insufficient down payment
      }
    }

    // Emergency fund protection
    const closingCosts = price * 0.03;
    if (budget.emergencyFund > closingCosts * 2) {
      score += 5; // Bonus for maintaining emergency fund
    }

    return Math.max(0, Math.min(100, score));
  }

  private async scoreLocation(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    let score = 50; // Base location score
    const preferences = veteranProfile.housingNeeds.location;

    // State preferences
    const listingState = this.extractStateFromListing(listing);
    if (preferences.preferredStates.includes(listingState)) {
      score += 20;
    } else if (preferences.avoidStates.includes(listingState)) {
      score -= 30;
    }

    // Proximity to VA facilities
    const vaProximity = await this.calculateVAProximity(listing);
    if (preferences.proximityToVA.required) {
      if (vaProximity <= preferences.proximityToVA.max_distance) {
        score += 25;
      } else {
        score -= 40; // Major penalty for not meeting requirement
      }
    } else {
      // Bonus for being close even if not required
      if (vaProximity <= 20) score += 15;
      else if (vaProximity <= 50) score += 5;
    }

    // Climate considerations
    if (preferences.climate.avoid_cold && this.isColdClimate(listingState)) {
      score -= 15;
    }
    if (preferences.climate.avoid_heat && this.isHotClimate(listingState)) {
      score -= 15;
    }

    // Veteran community presence
    if (preferences.veteran_community) {
      const communityScore = await this.calculateVeteranCommunityPresence(listing);
      score += communityScore * 0.2; // Up to 20 points
    }

    // Urbanization preference
    const urbanLevel = this.determineUrbanLevel(listing);
    if (urbanLevel === preferences.urbanization) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private async scorePropertyCondition(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    let score = 70; // Base condition score

    // Age-based scoring
    const currentYear = new Date().getFullYear();
    const age = listing.yearBuilt ? currentYear - listing.yearBuilt : 50;

    if (age < 10) {
      score += 20; // New construction bonus
    } else if (age < 30) {
      score += 10; // Modern construction
    } else if (age > 50) {
      score -= 15; // Older property penalty
    }

    // Property type considerations
    if (listing.propertyType === 'Single Family') {
      score += 5; // Generally easier to modify
    }

    // Size appropriateness
    const familySize = 1 + veteranProfile.housingNeeds.familyComposition.dependents.length;
    const bedrooms = listing.bedrooms || 2;
    
    if (bedrooms >= familySize && bedrooms <= familySize + 2) {
      score += 10; // Appropriate size
    } else if (bedrooms < familySize) {
      score -= 20; // Too small
    }

    // Maintenance considerations for disabilities
    if (veteranProfile.disabilities.vaRating > 50) {
      // Prefer newer properties that require less maintenance
      if (age < 20) {
        score += 10;
      } else if (age > 40) {
        score -= 10;
      }
    }

    // Square footage appropriateness
    const sqft = listing.sqft || 1500;
    const idealSqft = familySize * 400 + 400; // 400 sqft per person + 400 base
    
    if (sqft >= idealSqft * 0.8 && sqft <= idealSqft * 1.5) {
      score += 5;
    } else if (sqft < idealSqft * 0.6) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  private async scoreVeteranCommunity(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    const communityData = await this.getVeteranCommunityData(listing);
    let score = 50; // Base score

    // Veteran population density
    score += communityData.veteranPercentage * 2; // Up to 20 points for 10%+ veteran population

    // Veteran services availability
    score += Math.min(20, communityData.veteranServices.length * 5);

    // Veteran organizations and networking
    score += Math.min(15, communityData.veteranOrganizations * 3);

    // Employment opportunities for veterans
    score += Math.min(15, communityData.veteranEmploymentRate * 15);

    // Branch-specific community
    const branchCommunity = communityData.branchSpecific[veteranProfile.veteranInfo.branch];
    if (branchCommunity && branchCommunity.presence > 0.1) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private async scoreFamilySuitability(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    let score = 60; // Base family score
    const family = veteranProfile.housingNeeds.familyComposition;

    // School-age children considerations
    const schoolAgeChildren = family.dependents.filter(d => d.schoolAge).length;
    if (schoolAgeChildren > 0) {
      const schoolQuality = await this.getSchoolQuality(listing);
      score += schoolQuality * 0.3; // Up to 30 points for excellent schools
    }

    // Pet accommodations
    const pets = family.pets.length;
    if (pets > 0) {
      // Yard for pets
      if (listing.description?.toLowerCase().includes('yard') ||
          listing.description?.toLowerCase().includes('fenced')) {
        score += 15;
      }
      
      // Service animal considerations
      const serviceAnimals = family.pets.filter(p => p.serviceAnimal).length;
      if (serviceAnimals > 0) {
        score += 10; // No restrictions should apply
      }
    }

    // Caregiving needs
    if (family.caregiving.elderly_parent || family.caregiving.disabled_family_member) {
      // Single-story preference
      if (listing.description?.toLowerCase().includes('single') ||
          listing.description?.toLowerCase().includes('ranch')) {
        score += 15;
      }
      
      // Proximity to healthcare
      const healthcareProximity = await this.calculateHealthcareProximity(listing);
      if (healthcareProximity <= 10) score += 10;
      else if (healthcareProximity <= 20) score += 5;
    }

    // Privacy for PTSD
    if (veteranProfile.disabilities.mentalHealth.ptsd) {
      if (listing.propertyType === 'Single Family') {
        score += 10;
      } else if (listing.propertyType === 'Condo') {
        score -= 5; // Shared walls may be problematic
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private async scoreInvestmentPotential(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    let score = 50; // Base investment score

    // Market appreciation potential
    const marketData = await this.getMarketData(listing);
    score += marketData.projectedAppreciation * 20; // Up to 20 points

    // Price relative to market
    const priceRatio = listing.price ? listing.price / marketData.medianPrice : 1;
    if (priceRatio < 0.9) {
      score += 15; // Below market price
    } else if (priceRatio > 1.1) {
      score -= 10; // Above market price
    }

    // VA loan advantages for investment
    if (listing.flags?.va_eligible && veteranProfile.benefits.va_loan_eligibility.eligible) {
      score += 20; // No down payment improves ROI
    }

    // Property condition and age for appreciation
    const age = listing.yearBuilt ? new Date().getFullYear() - listing.yearBuilt : 50;
    if (age < 20) {
      score += 10; // Modern properties tend to appreciate better
    } else if (age > 60) {
      score -= 5; // Older properties may need significant investment
    }

    // Location factors
    const locationAppreciation = await this.getLocationAppreciationFactor(listing);
    score += locationAppreciation * 15; // Up to 15 points

    return Math.max(0, Math.min(100, score));
  }

  private async scoreSafetySecurity(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    let score = 60; // Base safety score

    // Neighborhood crime statistics
    const crimeData = await this.getCrimeData(listing);
    score += (1 - crimeData.crimeIndex) * 40; // Up to 40 points for low crime

    // Emergency services proximity
    const emergencyProximity = await this.getEmergencyServicesProximity(listing);
    score += (1 - emergencyProximity / 20) * 20; // Up to 20 points for close services

    // Security features
    if (listing.description?.toLowerCase().includes('security') ||
        listing.description?.toLowerCase().includes('alarm')) {
      score += 10;
    }

    // Gated community bonus
    if (listing.description?.toLowerCase().includes('gated')) {
      score += 10;
    }

    // PTSD-specific safety considerations
    if (veteranProfile.disabilities.mentalHealth.ptsd) {
      // Quiet, low-traffic areas preferred
      const trafficLevel = await this.getTrafficLevel(listing);
      score += (1 - trafficLevel) * 15;
      
      // Privacy and escape routes
      if (listing.propertyType === 'Single Family') {
        score += 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private async scoreProximityServices(listing: Listing, veteranProfile: VeteranProfile): Promise<number> {
    let score = 50; // Base services score

    // Healthcare proximity
    const healthcareDistance = await this.calculateHealthcareProximity(listing);
    if (healthcareDistance <= 5) score += 20;
    else if (healthcareDistance <= 15) score += 10;
    else if (healthcareDistance > 30) score -= 10;

    // VA facilities proximity
    const vaDistance = await this.calculateVAProximity(listing);
    if (vaDistance <= 10) score += 20;
    else if (vaDistance <= 25) score += 10;
    else if (vaDistance > 50) score -= 15;

    // Shopping and amenities
    const amenitiesScore = await this.getAmenitiesProximity(listing);
    score += amenitiesScore * 0.15; // Up to 15 points

    // Public transportation
    const transitScore = await this.getTransitScore(listing);
    score += transitScore * 0.1; // Up to 10 points

    // Employment centers proximity
    const employmentDistance = await this.getEmploymentProximity(listing);
    if (employmentDistance <= 20) score += 10;
    else if (employmentDistance <= 40) score += 5;

    // Pharmacy proximity (important for medications)
    const pharmacyDistance = await this.getPharmacyProximity(listing);
    if (pharmacyDistance <= 5) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  // Specialized Analysis Methods
  private async analyzeVeteranSpecificFactors(listing: Listing, veteranProfile: VeteranProfile): Promise<VeteranFactor[]> {
    const factors: VeteranFactor[] = [];

    // VA loan eligibility factor
    if (listing.flags?.va_eligible && veteranProfile.benefits.va_loan_eligibility.eligible) {
      factors.push({
        factor: 'VA Loan Eligible',
        impact: 25,
        weight: 0.3,
        explanation: 'No down payment required, significant cost savings',
        category: 'positive',
        veteran_specific: true
      });
    }

    // Disability accommodation factors
    if (veteranProfile.disabilities.vaRating > 0) {
      const accessibilityImpact = await this.calculateAccessibilityImpact(listing, veteranProfile);
      factors.push({
        factor: 'Accessibility Compatibility',
        impact: accessibilityImpact,
        weight: 0.25,
        explanation: accessibilityImpact > 0 ? 'Property accommodates disability needs' : 'Modifications required for accessibility',
        category: accessibilityImpact > 0 ? 'positive' : 'negative',
        veteran_specific: true
      });
    }

    // PTSD considerations
    if (veteranProfile.disabilities.mentalHealth.ptsd) {
      const ptsdSuitability = this.calculatePTSDSuitability(listing);
      factors.push({
        factor: 'PTSD Environment Suitability',
        impact: ptsdSuitability,
        weight: 0.2,
        explanation: ptsdSuitability > 0 ? 'Quiet, private environment supports mental health' : 'Environment may trigger stress',
        category: ptsdSuitability > 0 ? 'positive' : 'negative',
        veteran_specific: true
      });
    }

    // Property tax exemption eligibility
    const taxSavings = this.calculatePropertyTaxSavings(listing, veteranProfile);
    if (taxSavings > 0) {
      factors.push({
        factor: 'Property Tax Exemption',
        impact: 15,
        weight: 0.15,
        explanation: `Eligible for ${taxSavings.toLocaleString()} annual tax savings`,
        category: 'positive',
        veteran_specific: true
      });
    }

    // Veteran community presence
    const communityData = await this.getVeteranCommunityData(listing);
    if (communityData.veteranPercentage > 0.1) {
      factors.push({
        factor: 'Strong Veteran Community',
        impact: 12,
        weight: 0.1,
        explanation: `${(communityData.veteranPercentage * 100).toFixed(1)}% veteran population provides peer support`,
        category: 'positive',
        veteran_specific: true
      });
    }

    return factors;
  }

  private async performAccessibilityAnalysis(listing: Listing, veteranProfile: VeteranProfile): Promise<AccessibilityAnalysis> {
    const disabilities = veteranProfile.disabilities;
    
    if (disabilities.vaRating === 0) {
      return {
        overall_accessibility: 85,
        current_accessibility: {
          entrance_accessibility: 90,
          interior_accessibility: 90,
          bathroom_accessibility: 85,
          kitchen_accessibility: 85,
          bedroom_accessibility: 90,
          safety_features: 80
        },
        required_modifications: [],
        potential_funding: [],
        timeline_estimate: 'No modifications needed',
        total_cost: 0,
        funding_coverage: 0
      };
    }

    const currentAccessibility = this.assessCurrentAccessibility(listing, disabilities);
    const requiredModifications = this.identifyRequiredModifications(listing, disabilities);
    const potentialFunding = this.identifyPotentialFunding(veteranProfile, requiredModifications);
    
    const totalCost = requiredModifications.reduce((sum, mod) => sum + mod.cost_estimate, 0);
    const fundingCoverage = potentialFunding.reduce((sum, fund) => sum + fund.amount_available, 0);

    return {
      overall_accessibility: this.calculateOverallAccessibility(currentAccessibility, requiredModifications),
      current_accessibility: currentAccessibility,
      required_modifications: requiredModifications,
      potential_funding: potentialFunding,
      timeline_estimate: this.estimateModificationTimeline(requiredModifications),
      total_cost: totalCost,
      funding_coverage: Math.min(fundingCoverage, totalCost)
    };
  }

  private async performFinancialAnalysis(listing: Listing, veteranProfile: VeteranProfile): Promise<VeteranFinancialAnalysis> {
    const price = listing.price || 0;
    const budget = veteranProfile.housingNeeds.budget;

    // Calculate monthly costs
    const monthlyCosts = this.calculateMonthlyCosts(listing, veteranProfile);
    
    // Down payment analysis
    const downPaymentAnalysis = this.analyzeDownPayment(listing, veteranProfile);
    
    // Loan options
    const loanOptions = this.analyzeLoanOptions(listing, veteranProfile);
    
    // Total cost analysis
    const totalCostAnalysis = this.analyzeTotalCosts(listing, veteranProfile);
    
    // Financial stress indicators
    const stressIndicators = this.identifyFinancialStressIndicators(monthlyCosts, budget);
    
    // Break-even analysis
    const breakEvenAnalysis = this.performBreakEvenAnalysis(listing, veteranProfile);
    
    // Affordability score
    const affordabilityScore = (monthlyCosts.percentage_of_income <= 0.28) ? 100 : 
                              Math.max(0, 100 - (monthlyCosts.percentage_of_income - 0.28) * 200);

    return {
      affordability_score: affordabilityScore,
      monthly_costs: monthlyCosts,
      down_payment_analysis: downPaymentAnalysis,
      loan_options: loanOptions,
      total_cost_analysis: totalCostAnalysis,
      financial_stress_indicators: stressIndicators,
      break_even_analysis: breakEvenAnalysis
    };
  }

  private async performRiskAssessment(listing: Listing, veteranProfile: VeteranProfile): Promise<VeteranRiskAssessment> {
    const riskFactors: VeteranRiskFactor[] = [];
    
    // Financial risks
    const dtiRatio = this.calculateDTIRatio(listing, veteranProfile);
    if (dtiRatio > 0.41) {
      riskFactors.push({
        category: 'financial',
        risk: 'High debt-to-income ratio',
        probability: 0.9,
        impact: 80,
        risk_score: 72,
        veteran_relevance: true
      });
    }

    // Property age risks
    const age = listing.yearBuilt ? new Date().getFullYear() - listing.yearBuilt : 50;
    if (age > 50) {
      riskFactors.push({
        category: 'property',
        risk: 'Older property maintenance costs',
        probability: 0.7,
        impact: 60,
        risk_score: 42,
        veteran_relevance: false
      });
    }

    // Accessibility risks
    if (veteranProfile.disabilities.vaRating > 30) {
      const accessibilityRisk = this.assessAccessibilityRisk(listing, veteranProfile);
      if (accessibilityRisk.risk_score > 30) {
        riskFactors.push(accessibilityRisk);
      }
    }

    // Health-related risks
    if (veteranProfile.disabilities.mentalHealth.ptsd) {
      const environmentRisk = this.assessEnvironmentalRisk(listing, veteranProfile);
      riskFactors.push(environmentRisk);
    }

    const overallRisk = this.calculateOverallRisk(riskFactors);
    const mitigationStrategies = this.generateMitigationStrategies(riskFactors, veteranProfile);
    const veteranSpecificRisks = this.identifyVeteranSpecificRisks(listing, veteranProfile);

    return {
      overall_risk: overallRisk,
      risk_factors: riskFactors,
      mitigation_strategies: mitigationStrategies,
      veteran_specific_risks: veteranSpecificRisks,
      risk_tolerance_match: this.calculateRiskToleranceMatch(overallRisk, veteranProfile)
    };
  }

  private async performBenefitsAnalysis(listing: Listing, veteranProfile: VeteranProfile): Promise<BenefitsAnalysis> {
    const availableBenefits: AvailableBenefit[] = [];
    const unutilizedBenefits: UnutilizedBenefit[] = [];
    const applicationRequired: ApplicationRequired[] = [];

    // VA loan benefits
    if (listing.flags?.va_eligible && veteranProfile.benefits.va_loan_eligibility.eligible) {
      const loanSavings = this.calculateVALoanSavings(listing, veteranProfile);
      availableBenefits.push({
        benefit: 'VA Loan',
        annual_value: loanSavings.annual,
        lifetime_value: loanSavings.lifetime,
        certainty: 0.95,
        requirements_met: true,
        application_status: 'ready'
      });
    }

    // Property tax exemptions
    const taxExemptions = veteranProfile.benefits.property_tax_exemptions;
    for (const exemption of taxExemptions) {
      if (exemption.eligibility_rating <= veteranProfile.disabilities.vaRating) {
        if (exemption.application_required) {
          applicationRequired.push({
            benefit: `${exemption.state} Property Tax Exemption`,
            application_process: 'State veteran services office',
            required_documents: ['DD-214', 'VA disability rating letter', 'Property deed'],
            timeline: '30-60 days',
            approval_likelihood: 0.9,
            assistance_available: true
          });
        }
        
        availableBenefits.push({
          benefit: `${exemption.state} Property Tax Exemption`,
          annual_value: exemption.annual_savings,
          lifetime_value: exemption.annual_savings * 20, // Assume 20-year ownership
          certainty: 0.9,
          requirements_met: true,
          application_status: exemption.application_required ? 'application_needed' : 'automatic'
        });
      }
    }

    // Housing grants
    const housingGrants = veteranProfile.benefits.housing_grants.filter(grant => grant.eligible);
    for (const grant of housingGrants) {
      if (grant.application_status === 'not_applied') {
        applicationRequired.push({
          benefit: `VA ${grant.type.toUpperCase()} Grant`,
          application_process: 'VA Form 26-4555',
          required_documents: ['VA disability rating', 'Medical documentation', 'Contractor estimates'],
          timeline: '60-90 days',
          approval_likelihood: 0.8,
          assistance_available: true
        });
      }

      availableBenefits.push({
        benefit: `VA ${grant.type.toUpperCase()} Grant`,
        annual_value: 0, // One-time benefit
        lifetime_value: grant.amount_available - grant.amount_used,
        certainty: 0.8,
        requirements_met: true,
        application_status: grant.application_status
      });
    }

    // Calculate totals
    const totalBenefitValue = availableBenefits.reduce((sum, benefit) => sum + benefit.lifetime_value, 0);
    const annualSavings = availableBenefits.reduce((sum, benefit) => sum + benefit.annual_value, 0);

    return {
      total_benefit_value: totalBenefitValue,
      annual_savings: annualSavings,
      lifetime_savings: totalBenefitValue,
      available_benefits: availableBenefits,
      unutilized_benefits: unutilizedBenefits,
      application_required: applicationRequired
    };
  }

  // Helper Methods
  private getDefaultScoringWeights(): ScoringWeights {
    return {
      va_benefits: 0.20,
      accessibility: 0.15,
      affordability: 0.15,
      location: 0.12,
      property_condition: 0.10,
      veteran_community: 0.08,
      family_needs: 0.08,
      investment_potential: 0.05,
      safety: 0.04,
      proximity_services: 0.03
    };
  }

  private calculateWeightedScore(scores: CategoryScores, weights: ScoringWeights): number {
    return (
      scores.va_benefits * weights.va_benefits +
      scores.accessibility * weights.accessibility +
      scores.affordability * weights.affordability +
      scores.location * weights.location +
      scores.property_condition * weights.property_condition +
      scores.veteran_community * weights.veteran_community +
      scores.family_suitability * weights.family_needs +
      scores.investment_potential * weights.investment_potential +
      scores.safety_security * weights.safety +
      scores.proximity_services * weights.proximity_services
    );
  }

  private calculateVALoanPayment(price: number, veteranProfile: VeteranProfile): number {
    if (!veteranProfile.benefits.va_loan_eligibility.eligible) {
      return this.calculateConventionalPayment(price);
    }

    const rate = 0.0675; // Current VA rate estimate
    const term = 360; // 30 years
    const principal = price; // No down payment for VA loans
    
    const monthlyRate = rate / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
           (Math.pow(1 + monthlyRate, term) - 1);
  }

  private calculateConventionalPayment(price: number): number {
    const rate = 0.075; // Current conventional rate estimate
    const term = 360; // 30 years
    const principal = price * 0.8; // 20% down payment
    
    const monthlyRate = rate / 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
           (Math.pow(1 + monthlyRate, term) - 1);
  }

  private estimatePropertyTaxes(price: number, veteranProfile: VeteranProfile): number {
    const baseRate = 0.012; // 1.2% annual average
    const exemptions = veteranProfile.benefits.property_tax_exemptions;
    
    let annualTax = price * baseRate;
    
    // Apply veteran exemptions
    for (const exemption of exemptions) {
      if (exemption.eligibility_rating <= veteranProfile.disabilities.vaRating) {
        annualTax -= exemption.annual_savings;
      }
    }
    
    return Math.max(0, annualTax) / 12; // Monthly
  }

  private estimateInsurance(price: number, listing: Listing): number {
    const baseRate = 0.003; // 0.3% annual average
    let annualInsurance = price * baseRate;
    
    // Adjust for property age and type
    const age = listing.yearBuilt ? new Date().getFullYear() - listing.yearBuilt : 30;
    if (age > 30) {
      annualInsurance *= 1.2; // Older properties cost more to insure
    }
    
    return annualInsurance / 12; // Monthly
  }

  private calculateDTIRatio(listing: Listing, veteranProfile: VeteranProfile): number {
    const monthlyPayment = this.calculateVALoanPayment(listing.price || 0, veteranProfile);
    const propertyTaxes = this.estimatePropertyTaxes(listing.price || 0, veteranProfile);
    const insurance = this.estimateInsurance(listing.price || 0, listing);
    const totalHousing = monthlyPayment + propertyTaxes + insurance;
    
    return totalHousing / veteranProfile.housingNeeds.budget.monthlyIncome;
  }

  private extractStateFromListing(listing: Listing): string {
    // Extract state from address or ZIP code
    if (listing.address) {
      const parts = listing.address.split(',');
      if (parts.length >= 2) {
        const stateZip = parts[parts.length - 1].trim();
        const state = stateZip.split(' ')[0];
        return state;
      }
    }
    
    // Default based on ZIP code patterns
    if (listing.zipCode?.startsWith('85')) {
      return 'AZ';
    }
    
    return 'Unknown';
  }

  private async calculateVAProximity(listing: Listing): Promise<number> {
    // Simulate VA facility proximity calculation
    const zipCode = listing.zipCode || '';
    
    // Phoenix area has good VA coverage
    if (zipCode.startsWith('85')) {
      return 8.5; // Miles to Phoenix VA Medical Center
    }
    
    return 25 + Math.random() * 50; // 25-75 miles for other areas
  }

  private isColdClimate(state: string): boolean {
    const coldStates = ['AK', 'MT', 'ND', 'MN', 'WI', 'MI', 'NY', 'VT', 'NH', 'ME'];
    return coldStates.includes(state);
  }

  private isHotClimate(state: string): boolean {
    const hotStates = ['AZ', 'NV', 'TX', 'FL', 'LA', 'MS', 'AL', 'GA'];
    return hotStates.includes(state);
  }

  private async calculateVeteranCommunityPresence(listing: Listing): Promise<number> {
    const communityData = await this.getVeteranCommunityData(listing);
    return Math.min(100, communityData.veteranPercentage * 500); // 0-100 scale
  }

  private determineUrbanLevel(listing: Listing): 'urban' | 'suburban' | 'rural' {
    // Simplified urbanization determination
    const zipCode = listing.zipCode || '';
    
    if (zipCode.startsWith('85')) {
      return 'suburban'; // Phoenix suburbs
    }
    
    return 'suburban'; // Default
  }

  private async getVeteranCommunityData(listing: Listing): Promise<any> {
    // Mock veteran community data
    return {
      veteranPercentage: 0.125, // 12.5%
      veteranServices: ['VA Medical Center', 'Vet Center', 'American Legion'],
      veteranOrganizations: 3,
      veteranEmploymentRate: 0.85,
      branchSpecific: {
        army: { presence: 0.4 },
        navy: { presence: 0.2 },
        air_force: { presence: 0.25 },
        marines: { presence: 0.1 },
        coast_guard: { presence: 0.03 },
        space_force: { presence: 0.02 }
      }
    };
  }

  private async getSchoolQuality(listing: Listing): Promise<number> {
    // Mock school quality data
    const zipCode = listing.zipCode || '';
    const schoolRatings: { [key: string]: number } = {
      '85001': 70,
      '85021': 75,
      '85033': 65,
      '85260': 90,
      '85251': 85
    };
    
    return schoolRatings[zipCode] || 70;
  }

  private async calculateHealthcareProximity(listing: Listing): Promise<number> {
    // Mock healthcare proximity calculation
    return 5 + Math.random() * 20; // 5-25 miles
  }

  private async getMarketData(listing: Listing): Promise<any> {
    return {
      projectedAppreciation: 0.04, // 4% annual
      medianPrice: 400000,
    };
  }

  private async getLocationAppreciationFactor(listing: Listing): Promise<number> {
    return 0.7; // Good appreciation potential
  }

  private async getCrimeData(listing: Listing): Promise<any> {
    return {
      crimeIndex: 0.3 // Low crime (0 = no crime, 1 = high crime)
    };
  }

  private async getEmergencyServicesProximity(listing: Listing): Promise<number> {
    return 3 + Math.random() * 7; // 3-10 miles
  }

  private async getTrafficLevel(listing: Listing): Promise<number> {
    return 0.4; // Moderate traffic (0 = no traffic, 1 = heavy traffic)
  }

  private async getAmenitiesProximity(listing: Listing): Promise<number> {
    return 80; // Good amenities access
  }

  private async getTransitScore(listing: Listing): Promise<number> {
    return 60; // Moderate transit access
  }

  private async getEmploymentProximity(listing: Listing): Promise<number> {
    return 15; // 15 miles to employment centers
  }

  private async getPharmacyProximity(listing: Listing): Promise<number> {
    return 2; // 2 miles to nearest pharmacy
  }

  private generateActionItems(
    listing: Listing, 
    veteranProfile: VeteranProfile, 
    accessibilityAnalysis: AccessibilityAnalysis, 
    financialAnalysis: VeteranFinancialAnalysis
  ): ActionItem[] {
    const actions: ActionItem[] = [];

    // VA loan pre-approval
    if (listing.flags?.va_eligible && veteranProfile.benefits.va_loan_eligibility.eligible) {
      actions.push({
        priority: 'before_purchase',
        action: 'Obtain VA Loan Pre-Approval',
        description: 'Get pre-approved for VA loan to strengthen offer and understand exact terms',
        responsible_party: 'veteran',
        estimated_time: '1-2 weeks',
        estimated_cost: 0,
        benefits: ['Stronger offers', 'Clear budget', 'Faster closing'],
        resources: ['VA-approved lenders', 'Certificate of Eligibility']
      });
    }

    // Accessibility modifications
    if (accessibilityAnalysis.required_modifications.length > 0) {
      const immediateModifications = accessibilityAnalysis.required_modifications.filter(
        mod => mod.priority === 'immediate'
      );
      
      if (immediateModifications.length > 0) {
        actions.push({
          priority: 'before_purchase',
          action: 'Plan Accessibility Modifications',
          description: 'Get contractor estimates for required accessibility modifications',
          responsible_party: 'veteran',
          estimated_time: '2-3 weeks',
          estimated_cost: immediateModifications.reduce((sum, mod) => sum + mod.cost_estimate, 0),
          benefits: ['Safe access', 'VA grant funding', 'Independence'],
          resources: ['VA HISA grant', 'Certified contractors', 'Accessibility specialists']
        });
      }
    }

    // Property tax exemption applications
    const taxExemptions = veteranProfile.benefits.property_tax_exemptions.filter(
      exemption => exemption.application_required && 
                  exemption.eligibility_rating <= veteranProfile.disabilities.vaRating
    );
    
    if (taxExemptions.length > 0) {
      actions.push({
        priority: 'after_purchase',
        action: 'Apply for Property Tax Exemptions',
        description: 'Submit applications for veteran property tax exemptions',
        responsible_party: 'veteran',
        estimated_time: '1-2 months',
        estimated_cost: 0,
        benefits: [`Annual savings: $${taxExemptions[0]?.annual_savings.toLocaleString()}`],
        resources: ['State veteran services', 'County assessor', 'VSO assistance']
      });
    }

    return actions;
  }

  private generateWarnings(
    listing: Listing, 
    veteranProfile: VeteranProfile, 
    riskAssessment: VeteranRiskAssessment
  ): VeteranWarning[] {
    const warnings: VeteranWarning[] = [];

    // High DTI ratio warning
    const dtiRatio = this.calculateDTIRatio(listing, veteranProfile);
    if (dtiRatio > 0.41) {
      warnings.push({
        severity: 'high',
        category: 'financial',
        warning: 'Debt-to-Income Ratio Exceeds VA Guidelines',
        explanation: `Monthly housing costs would be ${(dtiRatio * 100).toFixed(1)}% of income, exceeding VA's 41% guideline`,
        consequences: ['Loan approval difficulties', 'Financial stress', 'Limited emergency funds'],
        recommendations: ['Consider lower-priced properties', 'Increase income', 'Reduce existing debt'],
        va_resources: ['VA financial counseling', 'HUD housing counseling']
      });
    }

    // Accessibility concerns
    if (veteranProfile.disabilities.vaRating > 30 && 
        riskAssessment.risk_factors.some(risk => risk.category === 'accessibility')) {
      warnings.push({
        severity: 'medium',
        category: 'accessibility',
        warning: 'Significant Accessibility Modifications Required',
        explanation: 'Property may require substantial modifications to meet your accessibility needs',
        consequences: ['High modification costs', 'Extended timeline', 'Temporary accessibility issues'],
        recommendations: ['Get detailed accessibility assessment', 'Explore VA grant funding', 'Consider more accessible properties'],
        va_resources: ['VA HISA grant', 'Vocational rehabilitation', 'Independent living services']
      });
    }

    // PTSD environment concerns
    if (veteranProfile.disabilities.mentalHealth.ptsd && 
        listing.propertyType !== 'Single Family') {
      warnings.push({
        severity: 'medium',
        category: 'health',
        warning: 'Property Type May Not Support PTSD Management',
        explanation: 'Shared walls and close neighbors may increase stress and trigger symptoms',
        consequences: ['Increased anxiety', 'Sleep disruption', 'Social isolation'],
        recommendations: ['Consider single-family homes', 'Evaluate noise levels', 'Plan coping strategies'],
        va_resources: ['PTSD treatment programs', 'Mental health counseling', 'Peer support groups']
      });
    }

    return warnings;
  }

  private generateExplanations(
    categoryScores: CategoryScores, 
    veteranFactors: VeteranFactor[], 
    veteranProfile: VeteranProfile
  ): ScoringExplanation[] {
    const explanations: ScoringExplanation[] = [];

    // VA Benefits explanation
    explanations.push({
      aspect: 'VA Benefits',
      score: categoryScores.va_benefits,
      reasoning: 'Score based on available veteran benefits for this property',
      factors: [
        { factor: 'VA Loan Eligibility', contribution: 30, explanation: 'No down payment required' },
        { factor: 'Property Tax Exemptions', contribution: 20, explanation: 'Annual tax savings available' },
        { factor: 'Housing Grants', contribution: 15, explanation: 'Modification funding available' }
      ],
      veteran_context: `With your ${veteranProfile.disabilities.vaRating}% VA rating, you qualify for significant benefits`,
      improvement_potential: 'Ensure all available benefits are utilized'
    });

    // Accessibility explanation
    if (veteranProfile.disabilities.vaRating > 0) {
      explanations.push({
        aspect: 'Accessibility',
        score: categoryScores.accessibility,
        reasoning: 'Property evaluated for compatibility with your specific disability needs',
        factors: [
          { factor: 'Current Accessibility', contribution: 40, explanation: 'Existing accessibility features' },
          { factor: 'Modification Potential', contribution: 35, explanation: 'Feasibility of necessary modifications' },
          { factor: 'Funding Availability', contribution: 25, explanation: 'VA grants for modifications' }
        ],
        veteran_context: `Analysis considers your ${veteranProfile.disabilities.conditions.map(c => c.condition).join(', ')} conditions`,
        improvement_potential: 'Consider properties requiring fewer modifications'
      });
    }

    return explanations;
  }

  private determineRecommendationLevel(
    overallScore: number, 
    riskAssessment: VeteranRiskAssessment, 
    accessibilityAnalysis: AccessibilityAnalysis
  ): 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding' {
    // Adjust score based on risk and accessibility
    let adjustedScore = overallScore;
    
    if (riskAssessment.overall_risk === 'high' || riskAssessment.overall_risk === 'very_high') {
      adjustedScore -= 15;
    }
    
    if (accessibilityAnalysis.overall_accessibility < 60) {
      adjustedScore -= 10;
    }

    if (adjustedScore >= 90) return 'outstanding';
    if (adjustedScore >= 80) return 'excellent';
    if (adjustedScore >= 70) return 'good';
    if (adjustedScore >= 60) return 'fair';
    return 'poor';
  }

  private calculateConfidence(
    categoryScores: CategoryScores, 
    veteranProfile: VeteranProfile, 
    listing: Listing
  ): number {
    let confidence = 0.8; // Base confidence

    // Reduce confidence for incomplete data
    if (!listing.yearBuilt) confidence -= 0.1;
    if (!listing.sqft) confidence -= 0.05;
    if (!listing.description) confidence -= 0.1;

    // Increase confidence for comprehensive veteran profile
    if (veteranProfile.disabilities.conditions.length > 0) confidence += 0.1;
    if (veteranProfile.history.search_history.length > 5) confidence += 0.05;

    return Math.max(0.5, Math.min(0.95, confidence));
  }

  // Additional helper methods for comprehensive analysis
  private calculateAccessibilityImpact(listing: Listing, veteranProfile: VeteranProfile): number {
    // Calculate positive or negative impact based on accessibility needs
    let impact = 0;

    if (veteranProfile.disabilities.mobility.wheelchair) {
      if (listing.description?.toLowerCase().includes('single') ||
          listing.description?.toLowerCase().includes('ranch')) {
        impact += 20;
      } else {
        impact -= 15;
      }
    }

    if (veteranProfile.disabilities.mentalHealth.ptsd) {
      if (listing.propertyType === 'Single Family') {
        impact += 10;
      } else if (listing.propertyType === 'Condo') {
        impact -= 5;
      }
    }

    return Math.max(-30, Math.min(30, impact));
  }

  private calculatePTSDSuitability(listing: Listing): number {
    let suitability = 0;

    // Single family home bonus
    if (listing.propertyType === 'Single Family') {
      suitability += 15;
    }

    // Privacy features
    if (listing.description?.toLowerCase().includes('private') ||
        listing.description?.toLowerCase().includes('fenced')) {
      suitability += 10;
    }

    // Quiet area indicators
    if (listing.description?.toLowerCase().includes('quiet') ||
        listing.description?.toLowerCase().includes('cul-de-sac')) {
      suitability += 10;
    }

    // Penalty for high-density housing
    if (listing.propertyType === 'Condo' || listing.propertyType === 'Apartment') {
      suitability -= 10;
    }

    return Math.max(-20, Math.min(20, suitability));
  }

  private calculatePropertyTaxSavings(listing: Listing, veteranProfile: VeteranProfile): number {
    const exemptions = veteranProfile.benefits.property_tax_exemptions.filter(
      exemption => exemption.eligibility_rating <= veteranProfile.disabilities.vaRating
    );

    return exemptions.reduce((sum, exemption) => sum + exemption.annual_savings, 0);
  }

  private initializeDatabases(): void {
    // Initialize with sample data - in production, would load from real databases
    console.log('🗄️ [VETERAN SCORING] Initializing databases...');
    console.log('✅ [VETERAN SCORING] System ready for veteran-specific property analysis');
  }

  // Additional calculation methods would be implemented here...
  private calculateVALoanSavings(listing: Listing, veteranProfile: VeteranProfile): { annual: number; lifetime: number } {
    const price = listing.price || 0;
    const downPaymentSaved = price * 0.2; // 20% conventional down payment
    const pmiSavings = price * 0.005; // Annual PMI savings
    
    return {
      annual: pmiSavings,
      lifetime: downPaymentSaved + (pmiSavings * 10) // Assume 10 years of PMI
    };
  }

  private assessCurrentAccessibility(listing: Listing, disabilities: DisabilityProfile): CurrentAccessibility {
    // Assess current accessibility features
    return {
      entrance_accessibility: 70,
      interior_accessibility: 75,
      bathroom_accessibility: 60,
      kitchen_accessibility: 70,
      bedroom_accessibility: 80,
      safety_features: 65
    };
  }

  private identifyRequiredModifications(listing: Listing, disabilities: DisabilityProfile): RequiredModification[] {
    const modifications: RequiredModification[] = [];

    if (disabilities.mobility.wheelchair) {
      modifications.push({
        modification: 'Install wheelchair ramp',
        priority: 'immediate',
        cost_estimate: 3500,
        complexity: 'moderate',
        contractor_required: true,
        permit_required: true,
        funding_eligible: true,
        impact_on_value: 2000
      });
    }

    return modifications;
  }

  private identifyPotentialFunding(veteranProfile: VeteranProfile, modifications: RequiredModification[]): AccessibilityFunding[] {
    const funding: AccessibilityFunding[] = [];

    if (veteranProfile.disabilities.vaRating >= 30) {
      funding.push({
        program: 'VA HISA Grant',
        amount_available: 6800,
        eligibility_met: true,
        application_process: 'VA Form 26-4555',
        timeline: '60-90 days',
        restrictions: ['Must be primary residence', 'Modifications must be accessibility-related']
      });
    }

    return funding;
  }

  private calculateOverallAccessibility(currentAccessibility: CurrentAccessibility, modifications: RequiredModification[]): number {
    const currentAvg = Object.values(currentAccessibility).reduce((sum, val) => sum + val, 0) / 
                      Object.values(currentAccessibility).length;
    
    const modificationPenalty = modifications.length * 5;
    
    return Math.max(0, Math.min(100, currentAvg - modificationPenalty));
  }

  private estimateModificationTimeline(modifications: RequiredModification[]): string {
    if (modifications.length === 0) return 'No modifications needed';
    
    const immediateCount = modifications.filter(m => m.priority === 'immediate').length;
    const complexCount = modifications.filter(m => m.complexity === 'complex').length;
    
    if (immediateCount > 2 || complexCount > 1) {
      return '3-6 months';
    } else if (immediateCount > 0) {
      return '1-3 months';
    } else {
      return '2-4 weeks';
    }
  }

  private calculateMonthlyCosts(listing: Listing, veteranProfile: VeteranProfile): VeteranMonthlyCosts {
    const price = listing.price || 0;
    const mortgagePayment = this.calculateVALoanPayment(price, veteranProfile);
    const propertyTaxes = this.estimatePropertyTaxes(price, veteranProfile);
    const insurance = this.estimateInsurance(price, listing);
    const utilities = price * 0.001 / 12; // Estimate 0.1% of home value annually
    const maintenance = price * 0.01 / 12; // Estimate 1% of home value annually
    
    const totalMonthly = mortgagePayment + propertyTaxes + insurance + utilities + maintenance;
    const percentageOfIncome = totalMonthly / veteranProfile.housingNeeds.budget.monthlyIncome;

    return {
      mortgage_payment: mortgagePayment,
      property_taxes: propertyTaxes,
      insurance: insurance,
      hoa_fees: 0, // Would extract from listing details
      utilities: utilities,
      maintenance: maintenance,
      accessibility_costs: 0, // Would calculate based on required modifications
      total_monthly: totalMonthly,
      percentage_of_income: percentageOfIncome
    };
  }

  private analyzeDownPayment(listing: Listing, veteranProfile: VeteranProfile): DownPaymentAnalysis {
    const price = listing.price || 0;
    
    return {
      required_conventional: price * 0.2,
      required_va: 0, // VA loans require no down payment
      available_funds: veteranProfile.housingNeeds.budget.downPaymentAvailable,
      gap_analysis: 0, // No gap with VA loan
      alternative_sources: []
    };
  }

  private analyzeLoanOptions(listing: Listing, veteranProfile: VeteranProfile): VeteranLoanOption[] {
    const price = listing.price || 0;
    const options: VeteranLoanOption[] = [];

    // VA Loan option
    if (listing.flags?.va_eligible && veteranProfile.benefits.va_loan_eligibility.eligible) {
      options.push({
        loan_type: 'VA Loan',
        eligible: true,
        amount: price,
        interest_rate: 6.75,
        monthly_payment: this.calculateVALoanPayment(price, veteranProfile),
        down_payment: 0,
        closing_costs: price * 0.03,
        total_cost: price + (price * 0.03),
        veteran_advantages: ['No down payment', 'No PMI', 'Competitive rates', 'No prepayment penalty'],
        requirements: ['VA eligibility', 'Certificate of Eligibility', 'Primary residence'],
        timeline: '30-45 days'
      });
    }

    // Conventional loan option
    options.push({
      loan_type: 'Conventional Loan',
      eligible: true,
      amount: price * 0.8,
      interest_rate: 7.25,
      monthly_payment: this.calculateConventionalPayment(price),
      down_payment: price * 0.2,
      closing_costs: price * 0.03,
      total_cost: price + (price * 0.23),
      veteran_advantages: [],
      requirements: ['20% down payment', 'Good credit', 'Income verification'],
      timeline: '30-45 days'
    });

    return options;
  }

  private analyzeTotalCosts(listing: Listing, veteranProfile: VeteranProfile): TotalCostAnalysis {
    const price = listing.price || 0;
    
    return {
      purchase_price: price,
      closing_costs: price * 0.03,
      immediate_modifications: 0, // Would calculate based on accessibility needs
      first_year_costs: price * 1.05, // 5% additional first year costs
      five_year_costs: price * 1.2, // 20% total additional costs over 5 years
      lifetime_costs: price * 1.5, // 50% additional lifetime costs
      va_benefits_savings: this.calculateVALoanSavings(listing, veteranProfile).lifetime,
      net_cost: price * 1.3 // Net after benefits
    };
  }

  private identifyFinancialStressIndicators(monthlyCosts: VeteranMonthlyCosts, budget: VeteranBudget): FinancialStressIndicator[] {
    const indicators: FinancialStressIndicator[] = [];

    if (monthlyCosts.percentage_of_income > 0.4) {
      indicators.push({
        indicator: 'High Housing Cost Burden',
        level: 'high',
        description: 'Housing costs exceed 40% of income',
        mitigation: ['Consider lower-priced properties', 'Increase income', 'Look for roommate opportunities']
      });
    }

    if (budget.emergencyFund < monthlyCosts.total_monthly * 6) {
      indicators.push({
        indicator: 'Insufficient Emergency Fund',
        level: 'medium',
        description: 'Emergency fund less than 6 months of housing costs',
        mitigation: ['Build emergency savings', 'Consider lower monthly payments', 'Explore family support']
      });
    }

    return indicators;
  }

  private performBreakEvenAnalysis(listing: Listing, veteranProfile: VeteranProfile): BreakEvenAnalysis {
    const monthlyCosts = this.calculateMonthlyCosts(listing, veteranProfile);
    const rentEquivalent = monthlyCosts.total_monthly * 0.8; // Assume rent is 80% of ownership costs
    
    return {
      break_even_years: 5, // Simplified calculation
      rent_vs_own_comparison: {
        monthly_rent_equivalent: rentEquivalent,
        ownership_advantage: monthlyCosts.total_monthly - rentEquivalent,
        breakeven_point: 60, // months
        long_term_savings: 50000 // over 10 years
      },
      investment_return: {
        expected_appreciation: 0.04, // 4% annual
        equity_buildup: 0.02, // 2% annual
        tax_benefits: 0.01, // 1% annual
        total_return: 0.07, // 7% annual
        roi_percentage: 7.0
      }
    };
  }

  private assessAccessibilityRisk(listing: Listing, veteranProfile: VeteranProfile): VeteranRiskFactor {
    return {
      category: 'accessibility',
      risk: 'Inadequate accessibility features',
      probability: 0.8,
      impact: 70,
      risk_score: 56,
      veteran_relevance: true
    };
  }

  private assessEnvironmentalRisk(listing: Listing, veteranProfile: VeteranProfile): VeteranRiskFactor {
    return {
      category: 'health',
      risk: 'PTSD trigger environment',
      probability: 0.4,
      impact: 60,
      risk_score: 24,
      veteran_relevance: true
    };
  }

  private calculateOverallRisk(riskFactors: VeteranRiskFactor[]): 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' {
    const avgRisk = riskFactors.reduce((sum, factor) => sum + factor.risk_score, 0) / riskFactors.length;
    
    if (avgRisk < 20) return 'very_low';
    if (avgRisk < 40) return 'low';
    if (avgRisk < 60) return 'moderate';
    if (avgRisk < 80) return 'high';
    return 'very_high';
  }

  private generateMitigationStrategies(riskFactors: VeteranRiskFactor[], veteranProfile: VeteranProfile): MitigationStrategy[] {
    const strategies: MitigationStrategy[] = [];

    for (const risk of riskFactors) {
      if (risk.category === 'financial') {
        strategies.push({
          risk_addressed: risk.risk,
          strategy: 'Financial counseling and budget adjustment',
          cost: 0,
          effectiveness: 0.8,
          timeline: '1-3 months',
          veteran_resources: ['VA financial counseling', 'HUD housing counseling']
        });
      }
    }

    return strategies;
  }

  private identifyVeteranSpecificRisks(listing: Listing, veteranProfile: VeteranProfile): VeteranSpecificRisk[] {
    const risks: VeteranSpecificRisk[] = [];

    if (veteranProfile.disabilities.mentalHealth.ptsd) {
      risks.push({
        risk: 'PTSD symptom exacerbation',
        description: 'Living environment may trigger or worsen PTSD symptoms',
        probability: 0.3,
        impact: 'Moderate impact on daily functioning and quality of life',
        mitigation: 'Create safe spaces, establish routines, maintain treatment',
        va_support: true
      });
    }

    return risks;
  }

  private calculateRiskToleranceMatch(overallRisk: string, veteranProfile: VeteranProfile): number {
    // Simplified risk tolerance matching
    let tolerance = 0.6; // Base tolerance

    // Adjust based on veteran factors
    if (veteranProfile.disabilities.vaRating > 70) {
      tolerance -= 0.2; // Lower tolerance for high disability ratings
    }

    if (veteranProfile.housingNeeds.timeline === 'immediate') {
      tolerance += 0.1; // Higher tolerance for urgent needs
    }

    const riskMapping = {
      'very_low': 0.9,
      'low': 0.7,
      'moderate': 0.5,
      'high': 0.3,
      'very_high': 0.1
    };

    const riskScore = riskMapping[overallRisk as keyof typeof riskMapping];
    
    return Math.abs(tolerance - riskScore) < 0.2 ? 0.8 : 0.5; // Good match if within 0.2
  }

  // Public interface methods
  getSystemStatus(): {
    isReady: boolean;
    databasesLoaded: boolean;
    scoringWeights: ScoringWeights;
  } {
    return {
      isReady: true,
      databasesLoaded: this.accessibilityDatabase.size > 0,
      scoringWeights: this.scoringWeights
    };
  }

  updateScoringWeights(newWeights: Partial<ScoringWeights>): void {
    this.scoringWeights = { ...this.scoringWeights, ...newWeights };
    console.log('🔄 [VETERAN SCORING] Scoring weights updated');
  }
}

export const veteranScoringSystem = new VeteranScoringSystem();
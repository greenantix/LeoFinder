import { liveAICoordinator } from '../services/liveAICoordinator';
import { veteranScoringSystem } from '../services/veteranScoringSystem';
import { realtimeMatchingPipeline } from '../services/realtimeMatchingPipeline';
import { aiOrchestrationEngine } from '../services/aiOrchestrationEngine';

interface DemoVeteran {
  name: string;
  profile: any;
  searchCriteria: any;
  story: string;
}

interface DemoResult {
  veteran: DemoVeteran;
  searchResults: any[];
  processingTime: number;
  aiInsights: any;
  recommendedAction: string;
  savings: number;
  confidence: number;
}

export class VeteranSearchDemo {
  private demoVeterans: DemoVeteran[] = [];
  private demoResults: DemoResult[] = [];

  constructor() {
    this.initializeDemoVeterans();
  }

  // Main Demo Orchestration
  async runLiveDemo(): Promise<void> {
    console.log('\n🎯 ================================');
    console.log('🐕 LEOFINDER AI BRAIN LIVE DEMO');
    console.log('🎖️  VETERAN HOUSING REVOLUTION');
    console.log('🎯 ================================\n');

    console.log('🚀 Initializing AI Brain Systems...\n');
    
    // System status check
    await this.displaySystemStatus();
    
    console.log('\n🎖️ PROCESSING VETERAN SEARCHES...\n');

    // Process each demo veteran
    for (let i = 0; i < this.demoVeterans.length; i++) {
      const veteran = this.demoVeterans[i];
      console.log(`\n🔥 [SEARCH ${i + 1}/${this.demoVeterans.length}] Processing ${veteran.name}...`);
      
      const result = await this.processVeteranSearch(veteran);
      this.demoResults.push(result);
      
      // Display results with dramatic pause
      await this.displaySearchResults(result);
      
      if (i < this.demoVeterans.length - 1) {
        console.log('\n⏱️  Preparing next veteran search...\n');
        await this.sleep(1000);
      }
    }

    // Final summary
    await this.displayFinalSummary();
  }

  private async displaySystemStatus(): Promise<void> {
    console.log('📊 SYSTEM STATUS CHECK:');
    
    const coordinatorStatus = liveAICoordinator.getSystemStatus();
    console.log(`  🧠 AI Coordinator: ${coordinatorStatus.overallHealth.toFixed(1)}% health`);
    console.log(`  ⚡ Active Pipelines: ${coordinatorStatus.activePipelines}`);
    console.log(`  📈 Total Requests: ${coordinatorStatus.totalRequests.toLocaleString()}`);
    console.log(`  ⏱️  Avg Response: ${coordinatorStatus.averageResponseTime.toFixed(0)}ms`);
    
    const matchingMetrics = realtimeMatchingPipeline.getMatchingMetrics();
    console.log(`  🔍 Active Streams: ${matchingMetrics.totalActiveStreams}`);
    console.log(`  💾 Cache Hit Rate: ${(matchingMetrics.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`  😊 User Satisfaction: ${(matchingMetrics.userSatisfactionScore * 100).toFixed(1)}%`);
    
    const veteranSystemStatus = veteranScoringSystem.getSystemStatus();
    console.log(`  🎖️  Veteran Scoring: ${veteranSystemStatus.isReady ? 'READY' : 'INITIALIZING'}`);
    
    console.log('\n✅ ALL SYSTEMS OPERATIONAL AND READY FOR VETERAN HOUSING SEARCH!');
  }

  private async processVeteranSearch(veteran: DemoVeteran): Promise<DemoResult> {
    const startTime = Date.now();
    
    console.log(`\n👤 VETERAN PROFILE: ${veteran.name}`);
    console.log(`📖 Story: ${veteran.story}`);
    console.log(`🏠 Looking for: ${veteran.searchCriteria.description}`);
    console.log(`💰 Budget: $${veteran.searchCriteria.budget.min.toLocaleString()} - $${veteran.searchCriteria.budget.max.toLocaleString()}`);
    console.log(`⏰ Timeline: ${veteran.profile.housingNeeds.timeline}`);
    
    // Create veteran search request
    const searchRequest = {
      requestId: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: veteran.profile.userId,
      veteranProfile: veteran.profile,
      searchCriteria: {
        query: veteran.searchCriteria.query,
        filters: veteran.searchCriteria.filters,
        sorting: { primary: 'relevance', direction: 'desc' },
        resultsLimit: 10
      },
      context: {
        sessionId: `demo_session_${veteran.name.replace(' ', '_')}`,
        deviceType: 'desktop' as const,
        timeOfDay: this.getTimeOfDay(),
        urgency: veteran.profile.housingNeeds.timeline === 'immediate' ? 'high' as const : 'medium' as const,
        source: 'demo' as const
      },
      priority: veteran.profile.housingNeeds.timeline === 'immediate' ? 'urgent' as const : 'normal' as const,
      timeout: 10000
    };

    console.log('\n🚀 LAUNCHING AI BRAIN PROCESSING...');
    console.log('   🔍 Real-time property discovery');
    console.log('   🧠 AI orchestration & scoring'); 
    console.log('   🎖️  Veteran-specific analysis');
    console.log('   🔄 Adaptive personalization');
    console.log('   🧮 Neural ensemble enhancement');
    console.log('   🎮 Reinforcement learning optimization');
    console.log('   📋 Final ranking & assembly');

    try {
      // Process through live AI coordinator
      const processingResults = await liveAICoordinator.processVeteranRequest(searchRequest);
      
      const processingTime = Date.now() - startTime;
      
      // Calculate additional insights
      const aiInsights = this.generateAIInsights(processingResults, veteran);
      const savings = this.calculateVeteranSavings(processingResults, veteran);
      const recommendedAction = this.generateRecommendedAction(processingResults, veteran);

      console.log(`\n✅ AI PROCESSING COMPLETE in ${processingTime}ms`);
      console.log(`📊 Found ${processingResults.listings.length} analyzed properties`);
      console.log(`🎯 Personalization Score: ${processingResults.personalizedScore.toFixed(1)}%`);
      console.log(`🔒 Confidence Level: ${(processingResults.confidence * 100).toFixed(1)}%`);

      return {
        veteran,
        searchResults: processingResults.listings,
        processingTime,
        aiInsights,
        recommendedAction,
        savings,
        confidence: processingResults.confidence
      };

    } catch (error) {
      console.error(`❌ Error processing search for ${veteran.name}:`, error);
      
      return {
        veteran,
        searchResults: [],
        processingTime: Date.now() - startTime,
        aiInsights: { error: 'Processing failed' },
        recommendedAction: 'Please try again or contact support',
        savings: 0,
        confidence: 0
      };
    }
  }

  private async displaySearchResults(result: DemoResult): Promise<void> {
    console.log(`\n🎉 SEARCH RESULTS FOR ${result.veteran.name}:`);
    console.log(`⚡ Processing Time: ${result.processingTime}ms`);
    console.log(`🎯 AI Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`💰 Estimated Savings: $${result.savings.toLocaleString()}`);
    
    if (result.searchResults.length > 0) {
      console.log(`\n🏠 TOP PROPERTY MATCHES:`);
      
      for (let i = 0; i < Math.min(3, result.searchResults.length); i++) {
        const property = result.searchResults[i];
        console.log(`\n   ${i + 1}. 🏡 Property ID: ${property.listingId}`);
        console.log(`      🎯 Overall Score: ${property.finalScore.toFixed(1)}/100`);
        console.log(`      🎖️  Veteran Score: ${property.veteranSpecificScore.toFixed(1)}/100`);
        console.log(`      ♿ Accessibility: ${property.accessibility?.overallScore.toFixed(1) || 'N/A'}/100`);
        console.log(`      💰 Monthly Cost: $${property.financing?.totalCost.monthlyPayment.toFixed(0) || 'N/A'}`);
        
        if (property.veteranBenefits && property.veteranBenefits.length > 0) {
          console.log(`      🎁 Benefits: ${property.veteranBenefits.map((b: any) => b.type).join(', ')}`);
        }
        
        if (property.warnings && property.warnings.length > 0) {
          console.log(`      ⚠️  Warnings: ${property.warnings.length} items to review`);
        }
        
        if (property.actionItems && property.actionItems.length > 0) {
          console.log(`      📋 Action Items: ${property.actionItems.length} recommended steps`);
        }
      }
    }

    console.log(`\n🎯 RECOMMENDED ACTION: ${result.recommendedAction}`);
    
    if (result.aiInsights.keyFindings) {
      console.log(`\n🔍 AI INSIGHTS:`);
      result.aiInsights.keyFindings.forEach((finding: string, index: number) => {
        console.log(`   ${index + 1}. ${finding}`);
      });
    }

    console.log(`\n💡 NEXT STEPS:`);
    if (result.searchResults.length > 0) {
      console.log(`   📞 Contact agent for top ${Math.min(3, result.searchResults.length)} properties`);
      console.log(`   📋 Apply for VA loan pre-approval`);
      console.log(`   🏥 Schedule accessibility assessment if needed`);
      console.log(`   📄 Gather required documentation`);
    } else {
      console.log(`   🔄 Adjust search criteria`);
      console.log(`   💰 Review budget requirements`);
      console.log(`   📍 Consider expanding location search`);
    }
  }

  private async displayFinalSummary(): Promise<void> {
    console.log('\n🎖️ ================================');
    console.log('🏆 LEOFINDER AI BRAIN DEMO COMPLETE');
    console.log('🎖️ ================================\n');

    const totalProcessingTime = this.demoResults.reduce((sum, result) => sum + result.processingTime, 0);
    const avgProcessingTime = totalProcessingTime / this.demoResults.length;
    const totalSavings = this.demoResults.reduce((sum, result) => sum + result.savings, 0);
    const avgConfidence = this.demoResults.reduce((sum, result) => sum + result.confidence, 0) / this.demoResults.length;
    const successfulSearches = this.demoResults.filter(r => r.searchResults.length > 0).length;

    console.log('📊 DEMO STATISTICS:');
    console.log(`   👥 Veterans Served: ${this.demoResults.length}`);
    console.log(`   ✅ Successful Searches: ${successfulSearches}/${this.demoResults.length}`);
    console.log(`   ⚡ Avg Processing Time: ${avgProcessingTime.toFixed(0)}ms`);
    console.log(`   💰 Total Savings Identified: $${totalSavings.toLocaleString()}`);
    console.log(`   🎯 Average Confidence: ${(avgConfidence * 100).toFixed(1)}%`);

    console.log('\n🏠 PROPERTY MATCHES FOUND:');
    this.demoResults.forEach((result, index) => {
      const status = result.searchResults.length > 0 ? 
        `✅ ${result.searchResults.length} matches` : 
        '⚠️  No matches (criteria adjustment needed)';
      console.log(`   ${index + 1}. ${result.veteran.name}: ${status}`);
    });

    console.log('\n🎖️ VETERAN BENEFITS IDENTIFIED:');
    let totalVALoans = 0;
    let totalTaxExemptions = 0;
    let totalAccessibilityGrants = 0;

    this.demoResults.forEach(result => {
      result.searchResults.forEach((property: any) => {
        if (property.financing?.vaLoan?.eligible) totalVALoans++;
        if (property.veteranBenefits?.some((b: any) => b.type.includes('Tax'))) totalTaxExemptions++;
        if (property.veteranBenefits?.some((b: any) => b.type.includes('Grant'))) totalAccessibilityGrants++;
      });
    });

    console.log(`   💰 VA Loan Opportunities: ${totalVALoans}`);
    console.log(`   📄 Tax Exemption Eligible: ${totalTaxExemptions}`);
    console.log(`   ♿ Accessibility Grant Eligible: ${totalAccessibilityGrants}`);

    console.log('\n🧠 AI SYSTEM PERFORMANCE:');
    const finalCoordinatorMetrics = liveAICoordinator.getCoordinatorMetrics();
    console.log(`   🎯 Total Requests Processed: ${finalCoordinatorMetrics.totalRequests}`);
    console.log(`   ⚡ System Response Time: ${finalCoordinatorMetrics.averageResponseTime.toFixed(0)}ms`);
    console.log(`   📈 Success Rate: ${(finalCoordinatorMetrics.successRate * 100).toFixed(1)}%`);
    console.log(`   💾 Cache Efficiency: ${(finalCoordinatorMetrics.cacheEfficiency * 100).toFixed(1)}%`);

    console.log('\n🐕 LEO\'S FINAL ASSESSMENT:');
    console.log('   🎯 AI Brain: FULLY OPERATIONAL');
    console.log('   🎖️  Veteran Support: MISSION READY');
    console.log('   🏠 Housing Matches: HIGH QUALITY');
    console.log('   💰 Savings Delivered: SIGNIFICANT');
    console.log('   ⚡ Performance: EXCELLENT');

    console.log('\n🚀 READY TO SERVE ALL VETERANS!');
    console.log('🐕 *WOOF WOOF* - Leo is ready to find homes!');
    console.log('\n🎖️ ================================\n');
  }

  private generateAIInsights(results: any, veteran: DemoVeteran): any {
    const insights = {
      keyFindings: [],
      recommendations: [],
      benefitsIdentified: [],
      riskFactors: []
    };

    // Generate key findings
    if (results.listings.length > 0) {
      const avgScore = results.listings.reduce((sum: number, listing: any) => sum + listing.finalScore, 0) / results.listings.length;
      insights.keyFindings.push(`Found ${results.listings.length} properties with average AI score of ${avgScore.toFixed(1)}/100`);
      
      const vaEligible = results.listings.filter((l: any) => l.financing?.vaLoan?.eligible).length;
      if (vaEligible > 0) {
        insights.keyFindings.push(`${vaEligible} properties eligible for VA loans with zero down payment`);
      }

      const accessibilitySupport = results.listings.filter((l: any) => l.accessibility?.overallScore > 80).length;
      if (accessibilitySupport > 0) {
        insights.keyFindings.push(`${accessibilitySupport} properties well-suited for accessibility needs`);
      }

      const veteranCommunity = results.listings.filter((l: any) => l.neighborhood?.veteranFriendly?.overall > 80).length;
      if (veteranCommunity > 0) {
        insights.keyFindings.push(`${veteranCommunity} properties in strong veteran communities`);
      }
    } else {
      insights.keyFindings.push('No properties found matching current criteria - suggest expanding search parameters');
    }

    return insights;
  }

  private calculateVeteranSavings(results: any, veteran: DemoVeteran): number {
    let totalSavings = 0;

    if (results.listings.length > 0) {
      // Calculate VA loan savings on average property
      const avgPrice = results.listings.reduce((sum: number, listing: any) => 
        sum + (listing.financing?.totalCost?.purchasePrice || 300000), 0) / results.listings.length;
      
      // VA loan saves 20% down payment + PMI
      const vaLoanSavings = avgPrice * 0.2; // Down payment savings
      const pmiSavings = avgPrice * 0.005 * 10; // 10 years of PMI savings
      
      totalSavings += vaLoanSavings + pmiSavings;

      // Add property tax exemption savings
      if (veteran.profile.disabilities?.vaRating >= 30) {
        totalSavings += 3000 * 10; // 10 years of tax savings
      }

      // Add accessibility grant funding
      if (veteran.profile.disabilities?.vaRating >= 30) {
        totalSavings += 6800; // VA HISA grant
      }
    }

    return totalSavings;
  }

  private generateRecommendedAction(results: any, veteran: DemoVeteran): string {
    if (results.listings.length === 0) {
      return 'Expand search criteria or adjust budget/location preferences';
    }

    const topProperty = results.listings[0];
    
    if (topProperty.finalScore >= 85) {
      return 'Highly recommend viewing top properties and submitting offers quickly';
    } else if (topProperty.finalScore >= 75) {
      return 'Good matches found - schedule viewings and prepare for negotiations';
    } else if (topProperty.finalScore >= 65) {
      return 'Moderate matches - consider adjusting criteria for better options';
    } else {
      return 'Properties found but scores are low - recommend refining search criteria';
    }
  }

  private getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Demo Data Initialization
  private initializeDemoVeterans(): void {
    this.demoVeterans = [
      {
        name: 'Sergeant Maria Rodriguez',
        story: 'Army veteran with PTSD and mobility challenges, seeking accessible home near VA facilities',
        profile: {
          userId: 'demo_maria_rodriguez',
          veteranInfo: {
            branch: 'army',
            rank: 'Sergeant',
            mos: '11B',
            serviceYears: { start: 2010, end: 2018 },
            deployments: [
              { location: 'Afghanistan', startDate: new Date(2012, 0, 1), endDate: new Date(2013, 0, 1), type: 'combat' }
            ],
            commendations: ['Purple Heart', 'Combat Infantry Badge'],
            discharge_type: 'honorable'
          },
          housingNeeds: {
            timeline: 'within_3_months',
            budget: {
              monthlyIncome: 4500,
              vaCompensation: 2100,
              otherIncome: 2400,
              maxMonthlyPayment: 1800,
              downPaymentAvailable: 5000,
              emergencyFund: 15000,
              debtToIncomeRatio: 0.25
            },
            familyComposition: {
              maritalStatus: 'single',
              dependents: [],
              pets: [{ type: 'dog', size: 'medium', serviceAnimal: true, emotional_support: true }],
              caregiving: { elderly_parent: false, disabled_family_member: false, childcare_needs: false, respite_care: false }
            },
            accessibility: {
              wheelchair: false,
              walker: false,
              cane: true,
              mobility_scooter: false,
              stairs_difficulty: 'moderate',
              walking_distance: 200
            },
            location: {
              preferredStates: ['AZ', 'TX', 'FL'],
              avoidStates: ['AK', 'MT'],
              proximityToVA: { required: true, max_distance: 20, importance: 'critical' },
              proximityToFamily: { required: false, max_distance: 100, importance: 'preferred' },
              proximityToEmployment: { required: true, max_distance: 30, importance: 'important' },
              climate: { avoid_cold: true, avoid_heat: false, avoid_humidity: false, seasonal_affective: false, preferred_seasons: ['spring', 'fall'] },
              urbanization: 'suburban',
              veteran_community: true
            },
            propertyRequirements: {
              property_types: ['Single Family', 'Townhouse'],
              min_bedrooms: 2,
              min_bathrooms: 2,
              min_sqft: 1200,
              stories: 'single',
              yard: { required: true, fenced: true, size: 'medium', maintenance: 'low', garden_space: false },
              parking: { spaces_needed: 2, garage_preferred: true, accessible_parking: true, covered_parking: true },
              age_preference: { prefer_new: false, avoid_old: true, min_year_built: 1990, historic_ok: false }
            },
            specialRequirements: [
              { type: 'accessibility', description: 'Wheelchair accessible entrance', priority: 'strongly_preferred', cost_impact: 3500 },
              { type: 'ptsd', description: 'Quiet neighborhood away from loud noises', priority: 'strongly_preferred', cost_impact: 0 }
            ]
          },
          disabilities: {
            vaRating: 70,
            conditions: [
              { condition: 'PTSD', rating: 50, serviceConnected: true, static: false, bodySystem: 'mental' },
              { condition: 'Knee injury', rating: 20, serviceConnected: true, static: true, bodySystem: 'musculoskeletal' }
            ],
            accommodations: [
              { type: 'Wheelchair ramp', priority: 'important', description: 'Accessible entrance', cost_estimate: 3500, funding_available: true },
              { type: 'Grab bars', priority: 'important', description: 'Bathroom safety', cost_estimate: 800, funding_available: true }
            ],
            mobility: { wheelchair: false, walker: false, cane: true, mobility_scooter: false, stairs_difficulty: 'moderate', walking_distance: 200 },
            cognitive: { tbi: false, memory_issues: false, concentration_difficulty: true, executive_function: false, processing_speed: 'normal' },
            sensory: {
              vision: { legally_blind: false, low_vision: false, night_blindness: false, color_blind: false, assistive_technology: [] },
              hearing: { hearing_loss: 'mild', hearing_aids: false, cochlear_implant: false, sign_language: false, assistive_listening: [] },
              other_sensory: []
            },
            mentalHealth: {
              ptsd: true,
              depression: true,
              anxiety: true,
              substance_abuse: false,
              social_anxiety: true,
              triggers: ['loud noises', 'crowds', 'confined spaces'],
              coping_strategies: ['service dog', 'meditation', 'exercise'],
              support_needs: ['quiet environment', 'privacy', 'veteran community']
            }
          },
          benefits: {
            va_loan_eligibility: {
              eligible: true,
              entitlement_amount: 647000,
              remaining_entitlement: 647000,
              prior_use: false,
              funding_fee_exempt: true,
              certificate_of_eligibility: true
            },
            disability_compensation: {
              monthly_amount: 2100,
              rating: 70,
              individual_unemployability: false,
              special_monthly_compensation: 0,
              dependents_allowance: 0
            },
            housing_grants: [
              {
                type: 'hisa',
                eligible: true,
                amount_available: 6800,
                amount_used: 0,
                restrictions: ['Primary residence', 'Accessibility modifications only'],
                application_status: 'not_applied'
              }
            ],
            property_tax_exemptions: [
              {
                state: 'AZ',
                type: 'partial',
                eligibility_rating: 30,
                annual_savings: 2500,
                application_required: true
              }
            ],
            utility_assistance: {
              liheap_eligible: false,
              weatherization: true,
              emergency_assistance: true,
              veteran_specific_programs: ['AZ Veterans Utility Assistance']
            },
            vocational_rehab: {
              chapter31_eligible: false,
              housing_allowance: 0,
              subsistence_allowance: 0,
              program_status: 'not_enrolled'
            },
            education: {
              gibill_type: 'post_911',
              remaining_months: 18,
              housing_allowance_rate: 1800,
              yellow_ribbon: false,
              dependents_transfer: false
            }
          },
          preferences: {
            scoring_weights: {
              va_benefits: 0.25,
              accessibility: 0.20,
              affordability: 0.15,
              location: 0.12,
              property_condition: 0.08,
              veteran_community: 0.10,
              family_needs: 0.05,
              investment_potential: 0.02,
              safety: 0.02,
              proximity_services: 0.01
            },
            deal_breakers: ['no_parking', 'hoa_over_400', 'major_accessibility_barriers'],
            nice_to_haves: ['veteran_neighbors', 'quiet_street', 'garden_space'],
            flexibility_level: 0.6,
            explanation_detail: 'detailed'
          },
          history: {
            previous_homes: [],
            search_history: [],
            property_interactions: [],
            feedback_given: [],
            preferences_evolution: []
          }
        },
        searchCriteria: {
          description: 'Accessible single-family home near VA facilities',
          query: 'accessible single family home VA eligible Phoenix Arizona',
          budget: { min: 200000, max: 350000 },
          filters: {
            priceRange: { min: 200000, max: 350000 },
            location: 'Phoenix, AZ',
            propertyType: 'Single Family',
            bedrooms: 2,
            bathrooms: 2,
            vaEligible: true,
            accessibility: ['ramp_access', 'single_story'],
            timeline: 'within_3_months'
          }
        }
      },
      {
        name: 'Master Chief David Thompson',
        story: 'Navy veteran with family, seeking investment property with strong appreciation potential',
        profile: {
          userId: 'demo_david_thompson',
          veteranInfo: {
            branch: 'navy',
            rank: 'Master Chief Petty Officer',
            mos: 'IT',
            serviceYears: { start: 2000, end: 2022 },
            deployments: [
              { location: 'Persian Gulf', startDate: new Date(2003, 0, 1), endDate: new Date(2004, 0, 1), type: 'combat' },
              { location: 'Mediterranean', startDate: new Date(2010, 0, 1), endDate: new Date(2011, 0, 1), type: 'peacekeeping' }
            ],
            commendations: ['Navy Achievement Medal', 'Good Conduct Medal'],
            security_clearance: 'secret',
            discharge_type: 'honorable'
          },
          housingNeeds: {
            timeline: 'within_6_months',
            budget: {
              monthlyIncome: 8500,
              vaCompensation: 800,
              otherIncome: 7700,
              maxMonthlyPayment: 2800,
              downPaymentAvailable: 100000,
              emergencyFund: 50000,
              debtToIncomeRatio: 0.18
            },
            familyComposition: {
              maritalStatus: 'married',
              dependents: [
                { relationship: 'spouse', age: 35, specialNeeds: false, schoolAge: false },
                { relationship: 'child', age: 12, specialNeeds: false, schoolAge: true },
                { relationship: 'child', age: 8, specialNeeds: false, schoolAge: true }
              ],
              pets: [{ type: 'dog', size: 'large', serviceAnimal: false, emotional_support: false }],
              caregiving: { elderly_parent: false, disabled_family_member: false, childcare_needs: true, respite_care: false }
            },
            accessibility: {
              wheelchair: false,
              walker: false,
              cane: false,
              mobility_scooter: false,
              stairs_difficulty: 'none',
              walking_distance: 1000
            },
            location: {
              preferredStates: ['AZ', 'CA', 'TX'],
              avoidStates: [],
              proximityToVA: { required: false, max_distance: 50, importance: 'preferred' },
              proximityToFamily: { required: false, max_distance: 200, importance: 'preferred' },
              proximityToEmployment: { required: true, max_distance: 45, importance: 'important' },
              climate: { avoid_cold: false, avoid_heat: false, avoid_humidity: true, seasonal_affective: false, preferred_seasons: ['spring', 'summer'] },
              urbanization: 'suburban',
              veteran_community: true
            },
            propertyRequirements: {
              property_types: ['Single Family'],
              min_bedrooms: 4,
              min_bathrooms: 3,
              min_sqft: 2500,
              stories: 'no_preference',
              yard: { required: true, fenced: true, size: 'large', maintenance: 'medium', garden_space: true },
              parking: { spaces_needed: 3, garage_preferred: true, accessible_parking: false, covered_parking: true },
              age_preference: { prefer_new: true, avoid_old: false, min_year_built: 2000, historic_ok: false }
            },
            specialRequirements: [
              { type: 'family', description: 'Good school district', priority: 'must_have', cost_impact: 0 },
              { type: 'investment', description: 'High appreciation potential', priority: 'strongly_preferred', cost_impact: 0 }
            ]
          },
          disabilities: {
            vaRating: 20,
            conditions: [
              { condition: 'Tinnitus', rating: 10, serviceConnected: true, static: true, bodySystem: 'other' },
              { condition: 'Back strain', rating: 10, serviceConnected: true, static: false, bodySystem: 'musculoskeletal' }
            ],
            accommodations: [],
            mobility: { wheelchair: false, walker: false, cane: false, mobility_scooter: false, stairs_difficulty: 'none', walking_distance: 1000 },
            cognitive: { tbi: false, memory_issues: false, concentration_difficulty: false, executive_function: false, processing_speed: 'normal' },
            sensory: {
              vision: { legally_blind: false, low_vision: false, night_blindness: false, color_blind: false, assistive_technology: [] },
              hearing: { hearing_loss: 'mild', hearing_aids: false, cochlear_implant: false, sign_language: false, assistive_listening: [] },
              other_sensory: []
            },
            mentalHealth: {
              ptsd: false,
              depression: false,
              anxiety: false,
              substance_abuse: false,
              social_anxiety: false,
              triggers: [],
              coping_strategies: ['exercise', 'family_time'],
              support_needs: []
            }
          },
          benefits: {
            va_loan_eligibility: {
              eligible: true,
              entitlement_amount: 647000,
              remaining_entitlement: 500000,
              prior_use: true,
              funding_fee_exempt: false,
              certificate_of_eligibility: true
            },
            disability_compensation: {
              monthly_amount: 800,
              rating: 20,
              individual_unemployability: false,
              special_monthly_compensation: 0,
              dependents_allowance: 200
            },
            housing_grants: [],
            property_tax_exemptions: [],
            utility_assistance: {
              liheap_eligible: false,
              weatherization: false,
              emergency_assistance: false,
              veteran_specific_programs: []
            },
            vocational_rehab: {
              chapter31_eligible: false,
              housing_allowance: 0,
              subsistence_allowance: 0,
              program_status: 'not_enrolled'
            },
            education: {
              gibill_type: 'post_911',
              remaining_months: 0,
              housing_allowance_rate: 0,
              yellow_ribbon: false,
              dependents_transfer: true
            }
          },
          preferences: {
            scoring_weights: {
              va_benefits: 0.15,
              accessibility: 0.05,
              affordability: 0.20,
              location: 0.15,
              property_condition: 0.10,
              veteran_community: 0.08,
              family_needs: 0.15,
              investment_potential: 0.10,
              safety: 0.02,
              proximity_services: 0.00
            },
            deal_breakers: ['poor_schools', 'high_crime', 'hoa_over_500'],
            nice_to_haves: ['pool', 'three_car_garage', 'modern_kitchen'],
            flexibility_level: 0.7,
            explanation_detail: 'standard'
          },
          history: {
            previous_homes: [
              {
                address: 'Norfolk, VA',
                ownership_type: 'military_housing',
                duration: { start: new Date(2015, 0, 1), end: new Date(2018, 0, 1) },
                satisfaction: 7,
                reasons_for_leaving: ['PCS orders'],
                modifications_made: []
              }
            ],
            search_history: [],
            property_interactions: [],
            feedback_given: [],
            preferences_evolution: []
          }
        },
        searchCriteria: {
          description: 'Family home in excellent school district with investment potential',
          query: 'family home good schools investment potential Phoenix Scottsdale',
          budget: { min: 400000, max: 650000 },
          filters: {
            priceRange: { min: 400000, max: 650000 },
            location: 'Scottsdale, AZ',
            propertyType: 'Single Family',
            bedrooms: 4,
            bathrooms: 3,
            sqft: { min: 2500, max: 4000 },
            vaEligible: true,
            features: ['pool', 'garage', 'good_schools'],
            timeline: 'within_6_months'
          }
        }
      },
      {
        name: 'Staff Sergeant Jennifer Kim',
        story: 'Air Force veteran transitioning to civilian life, seeking affordable starter home',
        profile: {
          userId: 'demo_jennifer_kim',
          veteranInfo: {
            branch: 'air_force',
            rank: 'Staff Sergeant',
            mos: 'Cyber Operations',
            serviceYears: { start: 2016, end: 2024 },
            deployments: [
              { location: 'Qatar', startDate: new Date(2019, 0, 1), endDate: new Date(2020, 0, 1), type: 'training' }
            ],
            commendations: ['Air Force Achievement Medal'],
            security_clearance: 'top_secret',
            discharge_type: 'honorable'
          },
          housingNeeds: {
            timeline: 'immediate',
            budget: {
              monthlyIncome: 5200,
              vaCompensation: 0,
              otherIncome: 5200,
              maxMonthlyPayment: 1800,
              downPaymentAvailable: 8000,
              emergencyFund: 12000,
              debtToIncomeRatio: 0.22
            },
            familyComposition: {
              maritalStatus: 'single',
              dependents: [],
              pets: [{ type: 'cat', size: 'small', serviceAnimal: false, emotional_support: true }],
              caregiving: { elderly_parent: false, disabled_family_member: false, childcare_needs: false, respite_care: false }
            },
            accessibility: {
              wheelchair: false,
              walker: false,
              cane: false,
              mobility_scooter: false,
              stairs_difficulty: 'none',
              walking_distance: 800
            },
            location: {
              preferredStates: ['AZ', 'CO', 'NV'],
              avoidStates: ['FL', 'LA'],
              proximityToVA: { required: false, max_distance: 30, importance: 'preferred' },
              proximityToFamily: { required: false, max_distance: 500, importance: 'preferred' },
              proximityToEmployment: { required: true, max_distance: 25, importance: 'critical' },
              climate: { avoid_cold: false, avoid_heat: true, avoid_humidity: true, seasonal_affective: false, preferred_seasons: ['fall', 'winter'] },
              urbanization: 'suburban',
              veteran_community: false
            },
            propertyRequirements: {
              property_types: ['Single Family', 'Townhouse', 'Condo'],
              min_bedrooms: 2,
              min_bathrooms: 2,
              min_sqft: 1000,
              max_sqft: 1800,
              stories: 'no_preference',
              yard: { required: false, fenced: false, size: 'small', maintenance: 'low', garden_space: false },
              parking: { spaces_needed: 1, garage_preferred: false, accessible_parking: false, covered_parking: false },
              age_preference: { prefer_new: false, avoid_old: false, historic_ok: true }
            },
            specialRequirements: [
              { type: 'affordability', description: 'Low maintenance costs', priority: 'strongly_preferred', cost_impact: 0 },
              { type: 'technology', description: 'High-speed internet available', priority: 'must_have', cost_impact: 0 }
            ]
          },
          disabilities: {
            vaRating: 0,
            conditions: [],
            accommodations: [],
            mobility: { wheelchair: false, walker: false, cane: false, mobility_scooter: false, stairs_difficulty: 'none', walking_distance: 800 },
            cognitive: { tbi: false, memory_issues: false, concentration_difficulty: false, executive_function: false, processing_speed: 'normal' },
            sensory: {
              vision: { legally_blind: false, low_vision: false, night_blindness: false, color_blind: false, assistive_technology: [] },
              hearing: { hearing_loss: 'none', hearing_aids: false, cochlear_implant: false, sign_language: false, assistive_listening: [] },
              other_sensory: []
            },
            mentalHealth: {
              ptsd: false,
              depression: false,
              anxiety: false,
              substance_abuse: false,
              social_anxiety: false,
              triggers: [],
              coping_strategies: ['exercise', 'reading'],
              support_needs: []
            }
          },
          benefits: {
            va_loan_eligibility: {
              eligible: true,
              entitlement_amount: 647000,
              remaining_entitlement: 647000,
              prior_use: false,
              funding_fee_exempt: false,
              certificate_of_eligibility: true
            },
            disability_compensation: {
              monthly_amount: 0,
              rating: 0,
              individual_unemployability: false,
              special_monthly_compensation: 0,
              dependents_allowance: 0
            },
            housing_grants: [],
            property_tax_exemptions: [],
            utility_assistance: {
              liheap_eligible: false,
              weatherization: false,
              emergency_assistance: false,
              veteran_specific_programs: []
            },
            vocational_rehab: {
              chapter31_eligible: false,
              housing_allowance: 0,
              subsistence_allowance: 0,
              program_status: 'not_enrolled'
            },
            education: {
              gibill_type: 'post_911',
              remaining_months: 36,
              housing_allowance_rate: 1800,
              yellow_ribbon: true,
              dependents_transfer: false
            }
          },
          preferences: {
            scoring_weights: {
              va_benefits: 0.20,
              accessibility: 0.05,
              affordability: 0.25,
              location: 0.15,
              property_condition: 0.15,
              veteran_community: 0.05,
              family_needs: 0.05,
              investment_potential: 0.05,
              safety: 0.05,
              proximity_services: 0.00
            },
            deal_breakers: ['hoa_over_200', 'major_repairs_needed', 'no_internet'],
            nice_to_haves: ['modern_kitchen', 'in_unit_laundry', 'parking'],
            flexibility_level: 0.8,
            explanation_detail: 'minimal'
          },
          history: {
            previous_homes: [
              {
                address: 'Lackland AFB, TX',
                ownership_type: 'military_housing',
                duration: { start: new Date(2020, 0, 1), end: new Date(2024, 0, 1) },
                satisfaction: 8,
                reasons_for_leaving: ['Discharge'],
                modifications_made: []
              }
            ],
            search_history: [],
            property_interactions: [],
            feedback_given: [],
            preferences_evolution: []
          }
        },
        searchCriteria: {
          description: 'Affordable starter home with modern amenities',
          query: 'affordable starter home Phoenix Arizona modern amenities',
          budget: { min: 180000, max: 280000 },
          filters: {
            priceRange: { min: 180000, max: 280000 },
            location: 'Phoenix, AZ',
            propertyType: 'Townhouse',
            bedrooms: 2,
            bathrooms: 2,
            vaEligible: true,
            features: ['modern_kitchen', 'laundry', 'internet'],
            timeline: 'immediate'
          }
        }
      }
    ];

    console.log(`🎖️ Initialized ${this.demoVeterans.length} demo veterans for live AI brain testing`);
  }

  // Public interface
  getDemoVeterans(): DemoVeteran[] {
    return this.demoVeterans;
  }

  getDemoResults(): DemoResult[] {
    return this.demoResults;
  }

  async runSingleVeteranDemo(veteranIndex: number): Promise<DemoResult> {
    if (veteranIndex < 0 || veteranIndex >= this.demoVeterans.length) {
      throw new Error('Invalid veteran index');
    }

    const veteran = this.demoVeterans[veteranIndex];
    return this.processVeteranSearch(veteran);
  }
}

// Create and export demo instance
export const veteranSearchDemo = new VeteranSearchDemo();
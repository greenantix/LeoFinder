import { Listing } from '../types/listing';

interface RLAgent {
  agentId: string;
  name: string;
  type: 'q_learning' | 'dqn' | 'policy_gradient' | 'actor_critic' | 'multi_armed_bandit';
  state: AgentState;
  policy: Policy;
  memory: Experience[];
  performance: AgentPerformance;
  hyperparameters: RLHyperparameters;
  status: 'training' | 'exploring' | 'exploiting' | 'updating' | 'ready';
  specialty: 'search_ranking' | 'filter_optimization' | 'recommendation' | 'user_engagement';
  createdAt: Date;
  lastUpdate: Date;
  totalSteps: number;
}

interface AgentState {
  currentEpisode: number;
  stepCount: number;
  explorationRate: number;
  learningRate: number;
  temperature: number; // For softmax exploration
  recentReward: number;
  averageReward: number;
  bestReward: number;
  convergenceScore: number;
}

interface Policy {
  type: 'epsilon_greedy' | 'softmax' | 'ucb' | 'thompson_sampling';
  parameters: PolicyParameters;
  actionSpace: ActionSpace;
  qTable?: QTable;
  neuralNetwork?: PolicyNetwork;
}

interface PolicyParameters {
  epsilon?: number;
  temperature?: number;
  confidence?: number;
  decay?: number;
  ucbConstant?: number;
}

interface ActionSpace {
  actions: Action[];
  continuousActions?: ContinuousAction[];
  actionDimensions: number;
  maxActions: number;
}

interface Action {
  id: string;
  name: string;
  type: 'discrete' | 'continuous';
  parameters: ActionParameter[];
  reward: RewardFunction;
  constraints?: ActionConstraint[];
}

interface ActionParameter {
  name: string;
  type: 'integer' | 'float' | 'categorical' | 'boolean';
  range?: { min: number; max: number };
  options?: any[];
  default: any;
}

interface ContinuousAction {
  name: string;
  dimensions: number;
  bounds: { min: number[]; max: number[] };
}

interface ActionConstraint {
  type: 'boundary' | 'conditional' | 'mutual_exclusive';
  condition: string;
  parameters: any;
}

interface RewardFunction {
  type: 'immediate' | 'delayed' | 'cumulative' | 'sparse';
  components: RewardComponent[];
  shaping: RewardShaping;
  normalization: 'none' | 'z_score' | 'min_max' | 'sigmoid';
}

interface RewardComponent {
  name: string;
  weight: number;
  calculator: (state: any, action: any, nextState: any) => number;
  importance: number;
}

interface RewardShaping {
  enabled: boolean;
  potential: (state: any) => number;
  discount: number;
}

interface Experience {
  id: string;
  timestamp: Date;
  state: StateVector;
  action: ActionVector;
  reward: number;
  nextState: StateVector;
  done: boolean;
  metadata: ExperienceMetadata;
}

interface StateVector {
  features: number[];
  userContext: UserContext;
  marketContext: MarketContext;
  sessionContext: SessionContext;
  timeContext: TimeContext;
}

interface UserContext {
  userId: string;
  preferences: number[];
  behaviorHistory: number[];
  engagement: number;
  satisfaction: number;
  demographics: number[];
}

interface MarketContext {
  inventory: number[];
  trends: number[];
  competition: number[];
  seasonality: number[];
  volatility: number;
}

interface SessionContext {
  duration: number;
  interactions: number;
  searchQueries: number;
  filters: number[];
  browsing: number[];
}

interface TimeContext {
  hour: number;
  dayOfWeek: number;
  dayOfMonth: number;
  month: number;
  isWeekend: boolean;
  isHoliday: boolean;
}

interface ActionVector {
  actionId: string;
  parameters: number[];
  confidence: number;
  explorationNoise: number;
}

interface ExperienceMetadata {
  userId: string;
  sessionId: string;
  propertyId?: string;
  searchContext: any;
  businessMetrics: BusinessMetrics;
}

interface BusinessMetrics {
  clickThroughRate: number;
  conversionRate: number;
  timeOnPage: number;
  userSatisfaction: number;
  revenueImpact: number;
}

interface QTable {
  states: Map<string, StateEntry>;
  defaultValue: number;
  learningRate: number;
  discountFactor: number;
  explorationRate: number;
}

interface StateEntry {
  stateHash: string;
  actionValues: Map<string, number>;
  visitCount: number;
  lastUpdate: Date;
  confidence: number;
}

interface PolicyNetwork {
  architecture: NetworkArchitecture;
  weights: number[][][];
  biases: number[][];
  optimizer: OptimizerState;
  targetNetwork?: PolicyNetwork;
  updateFrequency: number;
}

interface NetworkArchitecture {
  inputDim: number;
  hiddenLayers: number[];
  outputDim: number;
  activations: string[];
  dropout: number[];
}

interface OptimizerState {
  type: 'adam' | 'sgd' | 'rmsprop';
  learningRate: number;
  momentum?: number;
  beta1?: number;
  beta2?: number;
  gradients: number[][][];
  velocities?: number[][][];
}

interface AgentPerformance {
  totalReward: number;
  averageReward: number;
  episodeRewards: number[];
  explorationEfficiency: number;
  convergenceRate: number;
  stabilityScore: number;
  businessImpact: BusinessImpact;
  lastEvaluation: Date;
}

interface BusinessImpact {
  userEngagement: number;
  conversionImprovement: number;
  revenueIncrease: number;
  userSatisfaction: number;
  systemEfficiency: number;
}

interface RLHyperparameters {
  learningRate: number;
  discountFactor: number;
  explorationRate: number;
  explorationDecay: number;
  minExploration: number;
  batchSize: number;
  memorySize: number;
  targetUpdateFreq: number;
  rewardScale: number;
  entropyBonus: number;
}

interface SearchOptimizationTask {
  taskId: string;
  type: 'ranking' | 'filtering' | 'recommendation' | 'personalization';
  userId: string;
  query: SearchQuery;
  context: SearchContext;
  candidates: PropertyCandidate[];
  constraints: SearchConstraint[];
  objectives: OptimizationObjective[];
  currentSolution?: SearchSolution;
  reward?: number;
}

interface SearchQuery {
  text?: string;
  filters: QueryFilter[];
  location: LocationFilter;
  priceRange: PriceFilter;
  features: FeatureFilter[];
  intent: 'buying' | 'renting' | 'investing' | 'browsing';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface QueryFilter {
  type: string;
  value: any;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
  weight: number;
  negotiable: boolean;
}

interface LocationFilter {
  coordinates?: { lat: number; lng: number };
  radius?: number;
  zipCodes?: string[];
  cities?: string[];
  counties?: string[];
  commute?: CommutePreference[];
}

interface CommutePreference {
  destination: { lat: number; lng: number };
  maxTime: number;
  mode: 'driving' | 'transit' | 'walking' | 'cycling';
  importance: number;
}

interface PriceFilter {
  min?: number;
  max?: number;
  monthlyBudget?: number;
  downPayment?: number;
  flexibility: number;
}

interface FeatureFilter {
  feature: string;
  required: boolean;
  preference: number;
  alternatives?: string[];
}

interface SearchContext {
  session: SessionData;
  user: UserData;
  market: MarketData;
  time: TimeData;
}

interface SessionData {
  sessionId: string;
  startTime: Date;
  interactions: Interaction[];
  currentPage: string;
  referrer?: string;
  device: DeviceInfo;
}

interface Interaction {
  type: 'click' | 'view' | 'save' | 'contact' | 'filter' | 'search';
  target: string;
  timestamp: Date;
  duration?: number;
  metadata?: any;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  screenSize: { width: number; height: number };
  connection: 'slow' | 'fast' | 'wifi' | 'cellular';
}

interface UserData {
  profile: UserProfile;
  history: UserHistory;
  preferences: UserPreferences;
  behavior: BehaviorData;
}

interface UserProfile {
  userId: string;
  veteran: boolean;
  demographics: any;
  experience: 'first_time' | 'experienced' | 'investor';
  timeline: string;
}

interface UserHistory {
  searches: SearchQuery[];
  views: PropertyView[];
  saves: PropertySave[];
  contacts: PropertyContact[];
  purchases?: PropertyPurchase[];
}

interface PropertyView {
  propertyId: string;
  timestamp: Date;
  duration: number;
  source: string;
  position: number;
}

interface PropertySave {
  propertyId: string;
  timestamp: Date;
  folder?: string;
  notes?: string;
}

interface PropertyContact {
  propertyId: string;
  timestamp: Date;
  method: 'phone' | 'email' | 'form' | 'chat';
  response?: boolean;
}

interface PropertyPurchase {
  propertyId: string;
  timestamp: Date;
  price: number;
  satisfaction: number;
}

interface BehaviorData {
  patterns: BehaviorPattern[];
  preferences: LearnedPreference[];
  triggers: BehaviorTrigger[];
  segments: string[];
}

interface BehaviorPattern {
  pattern: string;
  frequency: number;
  confidence: number;
  context: string[];
}

interface LearnedPreference {
  feature: string;
  strength: number;
  stability: number;
  context: string[];
}

interface BehaviorTrigger {
  trigger: string;
  action: string;
  probability: number;
  conditions: string[];
}

interface PropertyCandidate {
  listing: Listing;
  baseScore: number;
  features: number[];
  marketPosition: MarketPosition;
  userMatch: UserMatchScore;
  constraints: PropertyConstraint[];
}

interface MarketPosition {
  percentile: number;
  trend: 'up' | 'down' | 'stable';
  velocity: number;
  competition: number;
  opportunity: number;
}

interface UserMatchScore {
  overall: number;
  components: MatchComponent[];
  confidence: number;
  personalization: number;
}

interface MatchComponent {
  aspect: string;
  score: number;
  weight: number;
  reasoning: string;
}

interface PropertyConstraint {
  type: 'hard' | 'soft';
  constraint: string;
  violation: number;
  penalty: number;
}

interface SearchConstraint {
  type: 'budget' | 'location' | 'timeline' | 'features' | 'legal';
  importance: 'critical' | 'high' | 'medium' | 'low';
  constraint: any;
  flexibility: number;
}

interface OptimizationObjective {
  name: string;
  type: 'maximize' | 'minimize';
  weight: number;
  target?: number;
  calculator: (solution: SearchSolution) => number;
}

interface SearchSolution {
  rankedResults: RankedResult[];
  appliedFilters: AppliedFilter[];
  personalization: PersonalizationStrategy;
  performance: SolutionPerformance;
  reasoning: string[];
}

interface RankedResult {
  propertyId: string;
  rank: number;
  score: number;
  confidence: number;
  reasons: string[];
  actionRecommendations: ActionRecommendation[];
}

interface AppliedFilter {
  filter: string;
  value: any;
  impact: number;
  rationale: string;
}

interface PersonalizationStrategy {
  strategy: string;
  parameters: any;
  confidence: number;
  adaptations: string[];
}

interface SolutionPerformance {
  relevance: number;
  diversity: number;
  coverage: number;
  efficiency: number;
  userSatisfaction: number;
}

interface ActionRecommendation {
  action: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  confidence: number;
}

export class ReinforcementLearningEngine {
  private agents = new Map<string, RLAgent>();
  private experienceBuffer = new Map<string, Experience[]>();
  private activeEpisodes = new Map<string, Episode>();
  private rewardHistory = new Map<string, number[]>();
  private isTraining = false;
  private trainingQueue: string[] = [];

  constructor() {
    this.initializeAgents();
    this.startTrainingLoop();
  }

  // Agent Management
  async createAgent(config: Partial<RLAgent>): Promise<RLAgent> {
    const agentId = `rl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agent: RLAgent = {
      agentId,
      name: config.name || `Agent_${agentId}`,
      type: config.type || 'dqn',
      state: this.initializeAgentState(),
      policy: this.initializePolicy(config.type || 'dqn'),
      memory: [],
      performance: this.initializePerformance(),
      hyperparameters: config.hyperparameters || this.getDefaultHyperparameters(),
      status: 'training',
      specialty: config.specialty || 'search_ranking',
      createdAt: new Date(),
      lastUpdate: new Date(),
      totalSteps: 0
    };

    this.agents.set(agentId, agent);
    this.experienceBuffer.set(agentId, []);
    this.trainingQueue.push(agentId);
    
    return agent;
  }

  private initializeAgentState(): AgentState {
    return {
      currentEpisode: 0,
      stepCount: 0,
      explorationRate: 1.0,
      learningRate: 0.001,
      temperature: 1.0,
      recentReward: 0,
      averageReward: 0,
      bestReward: -Infinity,
      convergenceScore: 0
    };
  }

  private initializePolicy(agentType: string): Policy {
    const actionSpace = this.createActionSpace();
    
    const policy: Policy = {
      type: 'epsilon_greedy',
      parameters: {
        epsilon: 1.0,
        decay: 0.995,
        temperature: 1.0
      },
      actionSpace
    };

    if (agentType === 'q_learning') {
      policy.qTable = {
        states: new Map(),
        defaultValue: 0,
        learningRate: 0.1,
        discountFactor: 0.95,
        explorationRate: 1.0
      };
    } else if (agentType === 'dqn' || agentType === 'actor_critic') {
      policy.neuralNetwork = this.createPolicyNetwork();
    }

    return policy;
  }

  private createActionSpace(): ActionSpace {
    return {
      actions: [
        {
          id: 'rerank_results',
          name: 'Rerank Search Results',
          type: 'discrete',
          parameters: [
            {
              name: 'ranking_strategy',
              type: 'categorical',
              options: ['relevance', 'price', 'score', 'personalized', 'trending'],
              default: 'relevance'
            },
            {
              name: 'boost_factor',
              type: 'float',
              range: { min: 0.5, max: 2.0 },
              default: 1.0
            }
          ],
          reward: {
            type: 'immediate',
            components: [
              {
                name: 'click_through_rate',
                weight: 0.4,
                calculator: this.calculateCTRReward.bind(this),
                importance: 0.9
              },
              {
                name: 'user_engagement',
                weight: 0.3,
                calculator: this.calculateEngagementReward.bind(this),
                importance: 0.8
              },
              {
                name: 'conversion_rate',
                weight: 0.3,
                calculator: this.calculateConversionReward.bind(this),
                importance: 1.0
              }
            ],
            shaping: {
              enabled: true,
              potential: (state: any) => state.userContext.engagement * 0.1,
              discount: 0.95
            },
            normalization: 'z_score'
          }
        },
        {
          id: 'adjust_filters',
          name: 'Adjust Search Filters',
          type: 'continuous',
          parameters: [
            {
              name: 'price_range_expansion',
              type: 'float',
              range: { min: 0.8, max: 1.5 },
              default: 1.0
            },
            {
              name: 'location_radius_adjustment',
              type: 'float',
              range: { min: 0.5, max: 3.0 },
              default: 1.0
            },
            {
              name: 'feature_strictness',
              type: 'float',
              range: { min: 0.1, max: 1.0 },
              default: 0.7
            }
          ],
          reward: {
            type: 'delayed',
            components: [
              {
                name: 'result_satisfaction',
                weight: 0.5,
                calculator: this.calculateSatisfactionReward.bind(this),
                importance: 0.9
              },
              {
                name: 'discovery_rate',
                weight: 0.3,
                calculator: this.calculateDiscoveryReward.bind(this),
                importance: 0.7
              },
              {
                name: 'result_diversity',
                weight: 0.2,
                calculator: this.calculateDiversityReward.bind(this),
                importance: 0.6
              }
            ],
            shaping: {
              enabled: false,
              potential: () => 0,
              discount: 0.9
            },
            normalization: 'sigmoid'
          }
        },
        {
          id: 'personalize_recommendations',
          name: 'Personalize Property Recommendations',
          type: 'discrete',
          parameters: [
            {
              name: 'personalization_weight',
              type: 'float',
              range: { min: 0.0, max: 1.0 },
              default: 0.5
            },
            {
              name: 'exploration_factor',
              type: 'float',
              range: { min: 0.1, max: 0.5 },
              default: 0.2
            }
          ],
          reward: {
            type: 'cumulative',
            components: [
              {
                name: 'long_term_engagement',
                weight: 0.4,
                calculator: this.calculateLongTermEngagement.bind(this),
                importance: 1.0
              },
              {
                name: 'preference_learning',
                weight: 0.3,
                calculator: this.calculatePreferenceLearning.bind(this),
                importance: 0.8
              },
              {
                name: 'serendipity_factor',
                weight: 0.3,
                calculator: this.calculateSerendipityReward.bind(this),
                importance: 0.6
              }
            ],
            shaping: {
              enabled: true,
              potential: (state: any) => state.userContext.satisfaction * 0.05,
              discount: 0.99
            },
            normalization: 'min_max'
          }
        }
      ],
      actionDimensions: 3,
      maxActions: 10
    };
  }

  private createPolicyNetwork(): PolicyNetwork {
    return {
      architecture: {
        inputDim: 128, // State vector dimension
        hiddenLayers: [256, 128, 64],
        outputDim: 32, // Action space dimension
        activations: ['relu', 'relu', 'relu', 'linear'],
        dropout: [0.2, 0.3, 0.2, 0.0]
      },
      weights: this.initializeNetworkWeights([128, 256, 128, 64, 32]),
      biases: this.initializeNetworkBiases([256, 128, 64, 32]),
      optimizer: {
        type: 'adam',
        learningRate: 0.001,
        beta1: 0.9,
        beta2: 0.999,
        gradients: [],
        velocities: []
      },
      updateFrequency: 100
    };
  }

  // Search Optimization
  async optimizeSearch(task: SearchOptimizationTask): Promise<SearchSolution> {
    const agent = this.selectBestAgent(task.type);
    if (!agent) {
      throw new Error('No suitable agent available for task');
    }

    // Convert task to state representation
    const state = this.convertTaskToState(task);
    
    // Select action using current policy
    const action = await this.selectAction(agent, state);
    
    // Apply action to generate solution
    const solution = await this.applySolutionAction(task, action);
    
    // Store experience for learning
    const experience = this.createExperience(state, action, task, solution);
    this.storeExperience(agent.agentId, experience);
    
    // Update agent if enough experience
    if (this.shouldUpdateAgent(agent)) {
      await this.updateAgent(agent.agentId);
    }

    return solution;
  }

  private selectBestAgent(taskType: string): RLAgent | null {
    const candidates = Array.from(this.agents.values()).filter(agent => 
      agent.specialty === taskType || agent.specialty === 'search_ranking'
    );

    if (candidates.length === 0) return null;

    // Select based on performance and specialization
    return candidates.reduce((best, current) => {
      const bestScore = best.performance.averageReward * 
        (best.specialty === taskType ? 1.2 : 1.0);
      const currentScore = current.performance.averageReward * 
        (current.specialty === taskType ? 1.2 : 1.0);
      
      return currentScore > bestScore ? current : best;
    });
  }

  private convertTaskToState(task: SearchOptimizationTask): StateVector {
    return {
      features: this.extractTaskFeatures(task),
      userContext: {
        userId: task.userId,
        preferences: this.extractUserPreferences(task.context.user),
        behaviorHistory: this.extractBehaviorHistory(task.context.user),
        engagement: task.context.user.behavior.patterns.length / 10,
        satisfaction: this.calculateUserSatisfaction(task.context.user),
        demographics: this.extractDemographics(task.context.user)
      },
      marketContext: {
        inventory: this.extractInventoryFeatures(task.candidates),
        trends: this.extractMarketTrends(task.context.market),
        competition: this.extractCompetitionMetrics(task.context.market),
        seasonality: this.extractSeasonalityFeatures(task.context.time),
        volatility: this.calculateMarketVolatility(task.context.market)
      },
      sessionContext: {
        duration: this.calculateSessionDuration(task.context.session),
        interactions: task.context.session.interactions.length,
        searchQueries: this.countSearchQueries(task.context.session),
        filters: this.extractFilterUsage(task.query),
        browsing: this.extractBrowsingPattern(task.context.session)
      },
      timeContext: {
        hour: task.context.time.timestamp.getHours(),
        dayOfWeek: task.context.time.timestamp.getDay(),
        dayOfMonth: task.context.time.timestamp.getDate(),
        month: task.context.time.timestamp.getMonth(),
        isWeekend: task.context.time.isWeekend,
        isHoliday: task.context.time.isHoliday
      }
    };
  }

  private async selectAction(agent: RLAgent, state: StateVector): Promise<ActionVector> {
    switch (agent.type) {
      case 'q_learning':
        return this.selectQLearningAction(agent, state);
      case 'dqn':
        return this.selectDQNAction(agent, state);
      case 'policy_gradient':
        return this.selectPolicyGradientAction(agent, state);
      case 'actor_critic':
        return this.selectActorCriticAction(agent, state);
      case 'multi_armed_bandit':
        return this.selectBanditAction(agent, state);
      default:
        return this.selectRandomAction(agent);
    }
  }

  private selectQLearningAction(agent: RLAgent, state: StateVector): ActionVector {
    const stateHash = this.hashState(state);
    const qTable = agent.policy.qTable!;
    
    let stateEntry = qTable.states.get(stateHash);
    if (!stateEntry) {
      stateEntry = {
        stateHash,
        actionValues: new Map(),
        visitCount: 0,
        lastUpdate: new Date(),
        confidence: 0
      };
      qTable.states.set(stateHash, stateEntry);
    }

    // Epsilon-greedy action selection
    const epsilon = agent.policy.parameters.epsilon || 0.1;
    
    if (Math.random() < epsilon) {
      // Explore: random action
      const randomAction = agent.policy.actionSpace.actions[
        Math.floor(Math.random() * agent.policy.actionSpace.actions.length)
      ];
      return {
        actionId: randomAction.id,
        parameters: this.randomizeActionParameters(randomAction),
        confidence: 0.1,
        explorationNoise: epsilon
      };
    } else {
      // Exploit: best known action
      let bestAction = agent.policy.actionSpace.actions[0];
      let bestValue = stateEntry.actionValues.get(bestAction.id) || qTable.defaultValue;
      
      for (const action of agent.policy.actionSpace.actions) {
        const value = stateEntry.actionValues.get(action.id) || qTable.defaultValue;
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }
      
      return {
        actionId: bestAction.id,
        parameters: this.optimizeActionParameters(bestAction, state),
        confidence: Math.min(1.0, stateEntry.confidence),
        explorationNoise: 0
      };
    }
  }

  private selectDQNAction(agent: RLAgent, state: StateVector): ActionVector {
    const network = agent.policy.neuralNetwork!;
    const stateFeatures = this.flattenStateVector(state);
    
    // Forward pass through network
    const qValues = this.forwardPass(network, stateFeatures);
    
    // Epsilon-greedy with neural network Q-values
    const epsilon = agent.state.explorationRate;
    
    if (Math.random() < epsilon) {
      // Random action
      const randomActionIndex = Math.floor(Math.random() * agent.policy.actionSpace.actions.length);
      const action = agent.policy.actionSpace.actions[randomActionIndex];
      
      return {
        actionId: action.id,
        parameters: this.randomizeActionParameters(action),
        confidence: 0.1,
        explorationNoise: epsilon
      };
    } else {
      // Best action from Q-values
      const bestActionIndex = this.argmax(qValues);
      const bestAction = agent.policy.actionSpace.actions[bestActionIndex];
      const confidence = this.softmax(qValues)[bestActionIndex];
      
      return {
        actionId: bestAction.id,
        parameters: this.optimizeActionParameters(bestAction, state),
        confidence,
        explorationNoise: 0
      };
    }
  }

  private selectPolicyGradientAction(agent: RLAgent, state: StateVector): ActionVector {
    const network = agent.policy.neuralNetwork!;
    const stateFeatures = this.flattenStateVector(state);
    
    // Get action probabilities from policy network
    const actionProbs = this.forwardPass(network, stateFeatures);
    const probabilities = this.softmax(actionProbs);
    
    // Sample action based on probabilities
    const actionIndex = this.sampleFromDistribution(probabilities);
    const selectedAction = agent.policy.actionSpace.actions[actionIndex];
    
    return {
      actionId: selectedAction.id,
      parameters: this.sampleActionParameters(selectedAction, state),
      confidence: probabilities[actionIndex],
      explorationNoise: 1 - probabilities[actionIndex]
    };
  }

  private selectActorCriticAction(agent: RLAgent, state: StateVector): ActionVector {
    // Actor-Critic combines policy gradient with value estimation
    const network = agent.policy.neuralNetwork!;
    const stateFeatures = this.flattenStateVector(state);
    
    // Actor network outputs action probabilities
    const actionProbs = this.forwardPass(network, stateFeatures);
    const probabilities = this.softmax(actionProbs);
    
    // Add exploration noise based on value uncertainty
    const temperature = agent.state.temperature;
    const explorationBonus = temperature / (agent.totalSteps + 1);
    
    // Adjust probabilities with exploration
    const adjustedProbs = probabilities.map(p => p + explorationBonus / probabilities.length);
    const normalizedProbs = this.normalize(adjustedProbs);
    
    const actionIndex = this.sampleFromDistribution(normalizedProbs);
    const selectedAction = agent.policy.actionSpace.actions[actionIndex];
    
    return {
      actionId: selectedAction.id,
      parameters: this.sampleActionParameters(selectedAction, state),
      confidence: normalizedProbs[actionIndex],
      explorationNoise: explorationBonus
    };
  }

  private selectBanditAction(agent: RLAgent, state: StateVector): ActionVector {
    // Multi-armed bandit with upper confidence bound (UCB)
    const totalSteps = agent.totalSteps + 1;
    const ucbConstant = agent.policy.parameters.ucbConstant || 2.0;
    
    let bestAction = agent.policy.actionSpace.actions[0];
    let bestUCB = -Infinity;
    
    for (const action of agent.policy.actionSpace.actions) {
      const rewardHistory = this.getActionRewardHistory(agent.agentId, action.id);
      
      if (rewardHistory.length === 0) {
        // Unplayed actions get infinite UCB
        bestAction = action;
        break;
      }
      
      const meanReward = rewardHistory.reduce((sum, r) => sum + r, 0) / rewardHistory.length;
      const confidence = Math.sqrt((2 * Math.log(totalSteps)) / rewardHistory.length);
      const ucb = meanReward + ucbConstant * confidence;
      
      if (ucb > bestUCB) {
        bestUCB = ucb;
        bestAction = action;
      }
    }
    
    return {
      actionId: bestAction.id,
      parameters: this.optimizeActionParameters(bestAction, state),
      confidence: Math.min(1.0, bestUCB / 10), // Normalize UCB to confidence
      explorationNoise: 1 / Math.sqrt(totalSteps)
    };
  }

  private async applySolutionAction(task: SearchOptimizationTask, action: ActionVector): Promise<SearchSolution> {
    const actionDef = task.query.filters.find(f => f.type === action.actionId);
    
    switch (action.actionId) {
      case 'rerank_results':
        return this.applyRerankingAction(task, action);
      case 'adjust_filters':
        return this.applyFilterAdjustmentAction(task, action);
      case 'personalize_recommendations':
        return this.applyPersonalizationAction(task, action);
      default:
        return this.generateDefaultSolution(task);
    }
  }

  private applyRerankingAction(task: SearchOptimizationTask, action: ActionVector): SearchSolution {
    const [strategyParam, boostParam] = action.parameters;
    const strategy = ['relevance', 'price', 'score', 'personalized', 'trending'][Math.floor(strategyParam * 5)];
    const boostFactor = 0.5 + boostParam * 1.5;
    
    // Rerank candidates based on strategy
    const rankedResults = task.candidates
      .map((candidate, index) => {
        let score = candidate.baseScore;
        
        switch (strategy) {
          case 'price':
            score *= candidate.listing.price ? (1 / Math.log(candidate.listing.price / 100000)) : 1;
            break;
          case 'score':
            score *= candidate.userMatch.overall;
            break;
          case 'personalized':
            score *= candidate.userMatch.personalization;
            break;
          case 'trending':
            score *= candidate.marketPosition.velocity;
            break;
        }
        
        score *= boostFactor;
        
        return {
          propertyId: candidate.listing.id,
          rank: index + 1,
          score,
          confidence: action.confidence,
          reasons: [`Ranked using ${strategy} strategy with ${boostFactor.toFixed(2)}x boost`],
          actionRecommendations: [
            {
              action: 'view_details',
              priority: score > 80 ? 'high' : score > 60 ? 'medium' : 'low',
              reasoning: `Score: ${score.toFixed(1)}`,
              confidence: action.confidence
            }
          ]
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((result, index) => ({ ...result, rank: index + 1 }));

    return {
      rankedResults,
      appliedFilters: [],
      personalization: {
        strategy: 'reranking',
        parameters: { strategy, boostFactor },
        confidence: action.confidence,
        adaptations: [`Applied ${strategy} ranking strategy`]
      },
      performance: {
        relevance: this.calculateRelevanceScore(rankedResults),
        diversity: this.calculateDiversityScore(rankedResults),
        coverage: this.calculateCoverageScore(rankedResults, task.candidates),
        efficiency: 0.9, // Reranking is efficient
        userSatisfaction: 0.7 + action.confidence * 0.3
      },
      reasoning: [
        `Used ${strategy} ranking strategy`,
        `Applied ${boostFactor.toFixed(2)}x boost factor`,
        `Ranked ${rankedResults.length} properties`
      ]
    };
  }

  private applyFilterAdjustmentAction(task: SearchOptimizationTask, action: ActionVector): SearchSolution {
    const [priceExpansion, radiusAdjustment, strictness] = action.parameters;
    
    // Apply filter adjustments
    const adjustedCandidates = task.candidates.filter(candidate => {
      let passes = true;
      
      // Price filter adjustment
      if (task.query.priceRange.min || task.query.priceRange.max) {
        const price = candidate.listing.price || 0;
        const adjustedMin = (task.query.priceRange.min || 0) / priceExpansion;
        const adjustedMax = (task.query.priceRange.max || Infinity) * priceExpansion;
        
        if (price < adjustedMin || price > adjustedMax) {
          if (strictness > 0.8) passes = false;
        }
      }
      
      // Location filter adjustment
      if (task.query.location.radius) {
        const adjustedRadius = task.query.location.radius * radiusAdjustment;
        // Simplified distance check
        const distance = Math.random() * 50; // Mock distance
        if (distance > adjustedRadius) {
          if (strictness > 0.6) passes = false;
        }
      }
      
      return passes;
    });

    const rankedResults = adjustedCandidates
      .map((candidate, index) => ({
        propertyId: candidate.listing.id,
        rank: index + 1,
        score: candidate.baseScore * (1 + (1 - strictness) * 0.2),
        confidence: action.confidence,
        reasons: [`Included with adjusted filters (strictness: ${strictness.toFixed(2)})`],
        actionRecommendations: []
      }))
      .sort((a, b) => b.score - a.score);

    return {
      rankedResults,
      appliedFilters: [
        {
          filter: 'price_range',
          value: { expansion: priceExpansion },
          impact: priceExpansion !== 1.0 ? 0.3 : 0,
          rationale: `Price range ${priceExpansion > 1 ? 'expanded' : 'contracted'} by ${Math.abs(priceExpansion - 1) * 100}%`
        },
        {
          filter: 'location_radius',
          value: { adjustment: radiusAdjustment },
          impact: radiusAdjustment !== 1.0 ? 0.2 : 0,
          rationale: `Search radius ${radiusAdjustment > 1 ? 'expanded' : 'contracted'} by ${Math.abs(radiusAdjustment - 1) * 100}%`
        }
      ],
      personalization: {
        strategy: 'filter_adjustment',
        parameters: { priceExpansion, radiusAdjustment, strictness },
        confidence: action.confidence,
        adaptations: ['Dynamically adjusted search filters based on user behavior']
      },
      performance: {
        relevance: 0.8 - Math.abs(strictness - 0.7) * 0.5,
        diversity: 0.6 + (1 - strictness) * 0.4,
        coverage: adjustedCandidates.length / task.candidates.length,
        efficiency: 0.8,
        userSatisfaction: 0.6 + action.confidence * 0.4
      },
      reasoning: [
        `Adjusted price filter expansion: ${priceExpansion.toFixed(2)}`,
        `Adjusted location radius: ${radiusAdjustment.toFixed(2)}`,
        `Filter strictness: ${strictness.toFixed(2)}`,
        `Results: ${adjustedCandidates.length}/${task.candidates.length} properties`
      ]
    };
  }

  private applyPersonalizationAction(task: SearchOptimizationTask, action: ActionVector): SearchSolution {
    const [personalizationWeight, explorationFactor] = action.parameters;
    
    const rankedResults = task.candidates
      .map((candidate, index) => {
        // Combine base score with personalization
        const personalizedScore = 
          candidate.baseScore * (1 - personalizationWeight) +
          candidate.userMatch.overall * personalizationWeight;
        
        // Add exploration bonus
        const explorationBonus = Math.random() * explorationFactor * 10;
        const finalScore = personalizedScore + explorationBonus;
        
        return {
          propertyId: candidate.listing.id,
          rank: index + 1,
          score: finalScore,
          confidence: action.confidence,
          reasons: [
            `Personalized score: ${personalizedScore.toFixed(1)}`,
            `Exploration bonus: ${explorationBonus.toFixed(1)}`
          ],
          actionRecommendations: [
            {
              action: 'save_property',
              priority: candidate.userMatch.overall > 0.8 ? 'high' : 'medium',
              reasoning: `High personal match (${candidate.userMatch.overall.toFixed(2)})`,
              confidence: candidate.userMatch.confidence
            }
          ]
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((result, index) => ({ ...result, rank: index + 1 }));

    return {
      rankedResults,
      appliedFilters: [],
      personalization: {
        strategy: 'user_preference_weighting',
        parameters: { personalizationWeight, explorationFactor },
        confidence: action.confidence,
        adaptations: [
          `Applied ${(personalizationWeight * 100).toFixed(0)}% personalization weight`,
          `Added ${(explorationFactor * 100).toFixed(0)}% exploration factor`
        ]
      },
      performance: {
        relevance: 0.7 + personalizationWeight * 0.3,
        diversity: 0.5 + explorationFactor * 0.5,
        coverage: 1.0,
        efficiency: 0.9,
        userSatisfaction: 0.8 + personalizationWeight * 0.2
      },
      reasoning: [
        `Applied personalization with ${(personalizationWeight * 100).toFixed(0)}% weight`,
        `Added exploration factor of ${(explorationFactor * 100).toFixed(0)}%`,
        `Balanced exploitation vs exploration`,
        `Optimized for long-term user satisfaction`
      ]
    };
  }

  // Reward Calculation Functions
  private calculateCTRReward(state: any, action: any, nextState: any): number {
    // Simulate CTR based on ranking quality
    const baselineCTR = 0.1;
    const qualityBonus = action.confidence * 0.05;
    const positionPenalty = Math.log(1 + state.rank || 1) * 0.01;
    
    return baselineCTR + qualityBonus - positionPenalty;
  }

  private calculateEngagementReward(state: any, action: any, nextState: any): number {
    // Reward based on user engagement improvement
    const engagementImprovement = (nextState?.engagement || 0.5) - (state?.engagement || 0.5);
    return Math.tanh(engagementImprovement * 5); // Normalize to [-1, 1]
  }

  private calculateConversionReward(state: any, action: any, nextState: any): number {
    // High reward for actual conversions (contacts, saves, purchases)
    const conversionTypes = ['contact', 'save', 'purchase'];
    const conversionWeights = [0.3, 0.2, 1.0];
    
    let reward = 0;
    conversionTypes.forEach((type, index) => {
      if (nextState?.actions?.includes(type)) {
        reward += conversionWeights[index];
      }
    });
    
    return Math.min(1.0, reward);
  }

  private calculateSatisfactionReward(state: any, action: any, nextState: any): number {
    // User satisfaction based on time spent and interactions
    const timeSpent = nextState?.timeSpent || 0;
    const interactions = nextState?.interactions || 0;
    
    const timeScore = Math.min(1.0, timeSpent / 300); // 5 minutes max
    const interactionScore = Math.min(1.0, interactions / 10); // 10 interactions max
    
    return (timeScore + interactionScore) / 2;
  }

  private calculateDiscoveryReward(state: any, action: any, nextState: any): number {
    // Reward for helping users discover new properties
    const noveltyScore = nextState?.novelProperties || 0;
    const explorationScore = nextState?.explorationRate || 0;
    
    return (noveltyScore + explorationScore) / 2;
  }

  private calculateDiversityReward(state: any, action: any, nextState: any): number {
    // Reward for providing diverse results
    const diversityMetrics = nextState?.diversityMetrics || {};
    const priceSpread = diversityMetrics.priceSpread || 0;
    const locationSpread = diversityMetrics.locationSpread || 0;
    const typeSpread = diversityMetrics.typeSpread || 0;
    
    return (priceSpread + locationSpread + typeSpread) / 3;
  }

  private calculateLongTermEngagement(state: any, action: any, nextState: any): number {
    // Long-term user retention and engagement
    const returnRate = nextState?.userMetrics?.returnRate || 0.5;
    const sessionLength = nextState?.userMetrics?.avgSessionLength || 300;
    const actionsPerSession = nextState?.userMetrics?.actionsPerSession || 5;
    
    const returnScore = returnRate;
    const lengthScore = Math.min(1.0, sessionLength / 600); // 10 minutes max
    const actionScore = Math.min(1.0, actionsPerSession / 15); // 15 actions max
    
    return (returnScore + lengthScore + actionScore) / 3;
  }

  private calculatePreferenceLearning(state: any, action: any, nextState: any): number {
    // Reward for improving preference model accuracy
    const preferenceAccuracy = nextState?.preferenceModel?.accuracy || 0.5;
    const modelConfidence = nextState?.preferenceModel?.confidence || 0.5;
    
    return (preferenceAccuracy + modelConfidence) / 2;
  }

  private calculateSerendipityReward(state: any, action: any, nextState: any): number {
    // Reward for positive surprises (finding unexpected good matches)
    const surpriseRating = nextState?.surpriseRating || 0;
    const unexpectedEngagement = nextState?.unexpectedEngagement || 0;
    
    return (surpriseRating + unexpectedEngagement) / 2;
  }

  // Experience Management
  private createExperience(
    state: StateVector,
    action: ActionVector,
    task: SearchOptimizationTask,
    solution: SearchSolution
  ): Experience {
    // Calculate reward based on solution performance
    const reward = this.calculateTotalReward(state, action, solution, task);
    
    return {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      state,
      action,
      reward,
      nextState: this.generateNextState(state, action, solution),
      done: false, // Episode continues
      metadata: {
        userId: task.userId,
        sessionId: task.context.session.sessionId,
        propertyId: solution.rankedResults[0]?.propertyId,
        searchContext: task.query,
        businessMetrics: {
          clickThroughRate: solution.performance.relevance * 0.2,
          conversionRate: solution.performance.userSatisfaction * 0.1,
          timeOnPage: 180 + solution.performance.efficiency * 120,
          userSatisfaction: solution.performance.userSatisfaction,
          revenueImpact: solution.performance.userSatisfaction * 100
        }
      }
    };
  }

  private calculateTotalReward(
    state: StateVector,
    action: ActionVector,
    solution: SearchSolution,
    task: SearchOptimizationTask
  ): number {
    let totalReward = 0;
    
    // Performance-based rewards
    totalReward += solution.performance.relevance * 0.3;
    totalReward += solution.performance.userSatisfaction * 0.4;
    totalReward += solution.performance.efficiency * 0.2;
    totalReward += solution.performance.diversity * 0.1;
    
    // Penalty for poor coverage
    if (solution.performance.coverage < 0.5) {
      totalReward -= 0.2;
    }
    
    // Bonus for high confidence actions
    totalReward += action.confidence * 0.1;
    
    // Veteran-specific bonus
    if (task.context.user.profile.veteran) {
      const vaEligibleCount = solution.rankedResults.filter(result => 
        task.candidates.find(c => c.listing.id === result.propertyId)?.listing.flags?.va_eligible
      ).length;
      
      if (vaEligibleCount > 0) {
        totalReward += 0.15;
      }
    }
    
    return Math.max(-1.0, Math.min(1.0, totalReward));
  }

  private generateNextState(state: StateVector, action: ActionVector, solution: SearchSolution): StateVector {
    // Update state based on action and solution
    return {
      ...state,
      userContext: {
        ...state.userContext,
        engagement: Math.min(1.0, state.userContext.engagement + solution.performance.userSatisfaction * 0.1),
        satisfaction: solution.performance.userSatisfaction
      },
      sessionContext: {
        ...state.sessionContext,
        interactions: state.sessionContext.interactions + 1
      }
    };
  }

  private storeExperience(agentId: string, experience: Experience): void {
    const buffer = this.experienceBuffer.get(agentId);
    if (!buffer) return;
    
    buffer.push(experience);
    
    // Limit buffer size
    const maxSize = 10000;
    if (buffer.length > maxSize) {
      buffer.splice(0, buffer.length - maxSize);
    }
    
    this.experienceBuffer.set(agentId, buffer);
  }

  private shouldUpdateAgent(agent: RLAgent): boolean {
    const buffer = this.experienceBuffer.get(agent.agentId);
    if (!buffer) return false;
    
    // Update when we have enough experience
    const minExperience = agent.hyperparameters.batchSize * 2;
    return buffer.length >= minExperience && agent.totalSteps % 10 === 0;
  }

  // Agent Training
  private async updateAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    const buffer = this.experienceBuffer.get(agentId);
    
    if (!agent || !buffer || buffer.length === 0) return;
    
    agent.status = 'updating';
    
    try {
      switch (agent.type) {
        case 'q_learning':
          await this.updateQLearningAgent(agent, buffer);
          break;
        case 'dqn':
          await this.updateDQNAgent(agent, buffer);
          break;
        case 'policy_gradient':
          await this.updatePolicyGradientAgent(agent, buffer);
          break;
        case 'actor_critic':
          await this.updateActorCriticAgent(agent, buffer);
          break;
        case 'multi_armed_bandit':
          await this.updateBanditAgent(agent, buffer);
          break;
      }
      
      // Update agent state
      agent.totalSteps += buffer.length;
      agent.state.explorationRate *= agent.hyperparameters.explorationDecay;
      agent.state.explorationRate = Math.max(
        agent.hyperparameters.minExploration,
        agent.state.explorationRate
      );
      
      // Update performance metrics
      this.updateAgentPerformance(agent, buffer);
      
      agent.lastUpdate = new Date();
      agent.status = 'ready';
      
    } catch (error) {
      console.error(`Failed to update agent ${agentId}:`, error);
      agent.status = 'ready';
    }
  }

  private async updateQLearningAgent(agent: RLAgent, experiences: Experience[]): Promise<void> {
    const qTable = agent.policy.qTable!;
    
    for (const exp of experiences) {
      const stateHash = this.hashState(exp.state);
      const nextStateHash = this.hashState(exp.nextState);
      
      // Get or create state entries
      let stateEntry = qTable.states.get(stateHash);
      if (!stateEntry) {
        stateEntry = {
          stateHash,
          actionValues: new Map(),
          visitCount: 0,
          lastUpdate: new Date(),
          confidence: 0
        };
        qTable.states.set(stateHash, stateEntry);
      }
      
      let nextStateEntry = qTable.states.get(nextStateHash);
      if (!nextStateEntry) {
        nextStateEntry = {
          stateHash: nextStateHash,
          actionValues: new Map(),
          visitCount: 0,
          lastUpdate: new Date(),
          confidence: 0
        };
        qTable.states.set(nextStateHash, nextStateEntry);
      }
      
      // Q-learning update
      const currentQ = stateEntry.actionValues.get(exp.action.actionId) || qTable.defaultValue;
      const maxNextQ = Math.max(...Array.from(nextStateEntry.actionValues.values()), qTable.defaultValue);
      
      const target = exp.reward + qTable.discountFactor * maxNextQ;
      const newQ = currentQ + qTable.learningRate * (target - currentQ);
      
      stateEntry.actionValues.set(exp.action.actionId, newQ);
      stateEntry.visitCount++;
      stateEntry.confidence = Math.min(1.0, stateEntry.confidence + 0.01);
      stateEntry.lastUpdate = new Date();
    }
  }

  private async updateDQNAgent(agent: RLAgent, experiences: Experience[]): Promise<void> {
    const network = agent.policy.neuralNetwork!;
    const batchSize = Math.min(agent.hyperparameters.batchSize, experiences.length);
    
    // Sample random batch
    const batch = this.sampleBatch(experiences, batchSize);
    
    for (const exp of batch) {
      const stateFeatures = this.flattenStateVector(exp.state);
      const nextStateFeatures = this.flattenStateVector(exp.nextState);
      
      // Current Q-values
      const currentQValues = this.forwardPass(network, stateFeatures);
      
      // Target Q-values
      const nextQValues = this.forwardPass(network, nextStateFeatures);
      const maxNextQ = Math.max(...nextQValues);
      
      // Calculate target
      const actionIndex = agent.policy.actionSpace.actions.findIndex(a => a.id === exp.action.actionId);
      if (actionIndex >= 0) {
        const target = exp.reward + agent.hyperparameters.discountFactor * maxNextQ;
        
        // Update target for this action
        const targetQValues = [...currentQValues];
        targetQValues[actionIndex] = target;
        
        // Simplified gradient descent update
        this.updateNetworkWeights(network, stateFeatures, targetQValues);
      }
    }
  }

  private async updatePolicyGradientAgent(agent: RLAgent, experiences: Experience[]): Promise<void> {
    const network = agent.policy.neuralNetwork!;
    
    // Calculate returns (cumulative rewards)
    const returns = this.calculateReturns(experiences, agent.hyperparameters.discountFactor);
    
    for (let i = 0; i < experiences.length; i++) {
      const exp = experiences[i];
      const returnValue = returns[i];
      
      const stateFeatures = this.flattenStateVector(exp.state);
      const actionProbs = this.forwardPass(network, stateFeatures);
      
      const actionIndex = agent.policy.actionSpace.actions.findIndex(a => a.id === exp.action.actionId);
      if (actionIndex >= 0) {
        // Policy gradient update
        const advantage = returnValue - this.calculateBaseline(experiences, i);
        
        // Update network to increase probability of good actions
        const targetProbs = [...actionProbs];
        targetProbs[actionIndex] += agent.hyperparameters.learningRate * advantage;
        
        this.updateNetworkWeights(network, stateFeatures, targetProbs);
      }
    }
  }

  private async updateActorCriticAgent(agent: RLAgent, experiences: Experience[]): Promise<void> {
    // Actor-Critic combines policy gradient with value function learning
    const network = agent.policy.neuralNetwork!;
    
    for (const exp of experiences) {
      const stateFeatures = this.flattenStateVector(exp.state);
      const nextStateFeatures = this.flattenStateVector(exp.nextState);
      
      // Critic update (value function)
      const stateValue = this.estimateStateValue(network, stateFeatures);
      const nextStateValue = this.estimateStateValue(network, nextStateFeatures);
      
      const tdTarget = exp.reward + agent.hyperparameters.discountFactor * nextStateValue;
      const tdError = tdTarget - stateValue;
      
      // Actor update (policy)
      const actionProbs = this.forwardPass(network, stateFeatures);
      const actionIndex = agent.policy.actionSpace.actions.findIndex(a => a.id === exp.action.actionId);
      
      if (actionIndex >= 0) {
        const targetProbs = [...actionProbs];
        targetProbs[actionIndex] += agent.hyperparameters.learningRate * tdError;
        
        this.updateNetworkWeights(network, stateFeatures, targetProbs);
      }
    }
  }

  private async updateBanditAgent(agent: RLAgent, experiences: Experience[]): Promise<void> {
    // Update reward estimates for each action
    for (const exp of experiences) {
      const actionId = exp.action.actionId;
      const rewardHistory = this.getActionRewardHistory(agent.agentId, actionId);
      rewardHistory.push(exp.reward);
      
      // Keep recent history only
      if (rewardHistory.length > 1000) {
        rewardHistory.splice(0, rewardHistory.length - 1000);
      }
    }
  }

  // Training Loop
  private startTrainingLoop(): void {
    setInterval(async () => {
      if (!this.isTraining && this.trainingQueue.length > 0) {
        this.isTraining = true;
        const agentId = this.trainingQueue.shift()!;
        
        try {
          await this.updateAgent(agentId);
        } catch (error) {
          console.error('Agent training failed:', error);
        } finally {
          this.isTraining = false;
        }
      }
    }, 2000);
  }

  // Helper Methods
  private initializeAgents(): void {
    // Create specialized agents
    const agentConfigs = [
      {
        name: 'Search Ranking Agent',
        type: 'dqn' as const,
        specialty: 'search_ranking' as const
      },
      {
        name: 'Filter Optimization Agent',
        type: 'actor_critic' as const,
        specialty: 'filter_optimization' as const
      },
      {
        name: 'Recommendation Agent',
        type: 'policy_gradient' as const,
        specialty: 'recommendation' as const
      },
      {
        name: 'Engagement Agent',
        type: 'multi_armed_bandit' as const,
        specialty: 'user_engagement' as const
      }
    ];
    
    agentConfigs.forEach(config => {
      this.createAgent(config);
    });
  }

  private getDefaultHyperparameters(): RLHyperparameters {
    return {
      learningRate: 0.001,
      discountFactor: 0.95,
      explorationRate: 1.0,
      explorationDecay: 0.995,
      minExploration: 0.01,
      batchSize: 32,
      memorySize: 10000,
      targetUpdateFreq: 100,
      rewardScale: 1.0,
      entropyBonus: 0.01
    };
  }

  private initializePerformance(): AgentPerformance {
    return {
      totalReward: 0,
      averageReward: 0,
      episodeRewards: [],
      explorationEfficiency: 0,
      convergenceRate: 0,
      stabilityScore: 0,
      businessImpact: {
        userEngagement: 0,
        conversionImprovement: 0,
        revenueIncrease: 0,
        userSatisfaction: 0,
        systemEfficiency: 0
      },
      lastEvaluation: new Date()
    };
  }

  // Additional helper methods would continue...
  // [Implementation details for utility functions like flattenStateVector, forwardPass, etc.]
  
  private flattenStateVector(state: StateVector): number[] {
    return [
      ...state.features,
      ...state.userContext.preferences,
      ...state.userContext.behaviorHistory,
      state.userContext.engagement,
      state.userContext.satisfaction,
      ...state.userContext.demographics,
      ...state.marketContext.inventory,
      ...state.marketContext.trends,
      ...state.marketContext.competition,
      ...state.sessionContext.filters,
      ...state.sessionContext.browsing,
      state.timeContext.hour / 24,
      state.timeContext.dayOfWeek / 7,
      state.timeContext.dayOfMonth / 31,
      state.timeContext.month / 12,
      state.timeContext.isWeekend ? 1 : 0,
      state.timeContext.isHoliday ? 1 : 0
    ].slice(0, 128); // Ensure fixed size
  }

  private forwardPass(network: PolicyNetwork, inputs: number[]): number[] {
    // Simplified neural network forward pass
    let activations = [...inputs];
    
    for (let i = 0; i < network.weights.length; i++) {
      const newActivations: number[] = [];
      
      for (let j = 0; j < network.weights[i].length; j++) {
        let sum = network.biases[i][j];
        for (let k = 0; k < activations.length; k++) {
          sum += network.weights[i][j][k] * activations[k];
        }
        
        // Apply ReLU activation
        newActivations.push(Math.max(0, sum));
      }
      
      activations = newActivations;
    }
    
    return activations;
  }

  private updateNetworkWeights(network: PolicyNetwork, inputs: number[], targets: number[]): void {
    // Simplified gradient descent update
    const learningRate = network.optimizer.learningRate;
    
    // This is a very simplified version - in practice, you'd implement proper backpropagation
    for (let i = 0; i < network.weights.length; i++) {
      for (let j = 0; j < network.weights[i].length; j++) {
        for (let k = 0; k < network.weights[i][j].length; k++) {
          const gradient = (targets[j] - this.forwardPass(network, inputs)[j]) * inputs[k];
          network.weights[i][j][k] += learningRate * gradient;
        }
      }
    }
  }

  private hashState(state: StateVector): string {
    // Simple state hashing for Q-table lookup
    const features = this.flattenStateVector(state);
    const roundedFeatures = features.map(f => Math.round(f * 10) / 10);
    return roundedFeatures.join(',');
  }

  private softmax(values: number[]): number[] {
    const maxVal = Math.max(...values);
    const expValues = values.map(v => Math.exp(v - maxVal));
    const sumExp = expValues.reduce((sum, v) => sum + v, 0);
    return expValues.map(v => v / sumExp);
  }

  private argmax(values: number[]): number {
    let maxIndex = 0;
    let maxValue = values[0];
    
    for (let i = 1; i < values.length; i++) {
      if (values[i] > maxValue) {
        maxValue = values[i];
        maxIndex = i;
      }
    }
    
    return maxIndex;
  }

  private sampleFromDistribution(probabilities: number[]): number {
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        return i;
      }
    }
    
    return probabilities.length - 1;
  }

  private normalize(values: number[]): number[] {
    const sum = values.reduce((s, v) => s + v, 0);
    return sum > 0 ? values.map(v => v / sum) : values;
  }

  private sampleBatch<T>(array: T[], size: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  }

  private calculateReturns(experiences: Experience[], gamma: number): number[] {
    const returns: number[] = [];
    let cumulative = 0;
    
    for (let i = experiences.length - 1; i >= 0; i--) {
      cumulative = experiences[i].reward + gamma * cumulative;
      returns[i] = cumulative;
    }
    
    return returns;
  }

  private calculateBaseline(experiences: Experience[], index: number): number {
    // Simple moving average baseline
    const window = Math.min(10, index + 1);
    const start = Math.max(0, index - window + 1);
    const relevantExperiences = experiences.slice(start, index + 1);
    
    return relevantExperiences.reduce((sum, exp) => sum + exp.reward, 0) / relevantExperiences.length;
  }

  private estimateStateValue(network: PolicyNetwork, stateFeatures: number[]): number {
    // For simplicity, use average of Q-values as state value
    const qValues = this.forwardPass(network, stateFeatures);
    return qValues.reduce((sum, q) => sum + q, 0) / qValues.length;
  }

  // More utility methods...
  private extractTaskFeatures(task: SearchOptimizationTask): number[] {
    // Extract numerical features from search task
    return new Array(50).fill(0).map(() => Math.random());
  }

  private extractUserPreferences(user: UserData): number[] {
    return new Array(20).fill(0).map(() => Math.random());
  }

  private extractBehaviorHistory(user: UserData): number[] {
    return new Array(30).fill(0).map(() => Math.random());
  }

  private calculateUserSatisfaction(user: UserData): number {
    return 0.5 + Math.random() * 0.5;
  }

  private extractDemographics(user: UserData): number[] {
    return [
      user.profile.veteran ? 1 : 0,
      user.profile.experience === 'first_time' ? 1 : 0,
      user.profile.experience === 'experienced' ? 1 : 0,
      user.profile.experience === 'investor' ? 1 : 0,
      Math.random(), // age normalized
      Math.random(), // income normalized
      Math.random()  // family size normalized
    ];
  }

  private extractInventoryFeatures(candidates: PropertyCandidate[]): number[] {
    const totalCandidates = candidates.length;
    const avgPrice = candidates.reduce((sum, c) => sum + (c.listing.price || 0), 0) / totalCandidates;
    const avgScore = candidates.reduce((sum, c) => sum + c.baseScore, 0) / totalCandidates;
    
    return [
      totalCandidates / 100, // Normalized
      avgPrice / 1000000,    // Normalized
      avgScore / 100         // Normalized
    ];
  }

  private extractMarketTrends(market: MarketData): number[] {
    return new Array(10).fill(0).map(() => Math.random());
  }

  private extractCompetitionMetrics(market: MarketData): number[] {
    return new Array(5).fill(0).map(() => Math.random());
  }

  private extractSeasonalityFeatures(time: TimeData): number[] {
    return [
      Math.sin(2 * Math.PI * time.timestamp.getMonth() / 12),
      Math.cos(2 * Math.PI * time.timestamp.getMonth() / 12),
      Math.sin(2 * Math.PI * time.timestamp.getDay() / 7),
      Math.cos(2 * Math.PI * time.timestamp.getDay() / 7)
    ];
  }

  private calculateMarketVolatility(market: MarketData): number {
    return Math.random(); // Simplified
  }

  private calculateSessionDuration(session: SessionData): number {
    return Date.now() - session.startTime.getTime();
  }

  private countSearchQueries(session: SessionData): number {
    return session.interactions.filter(i => i.type === 'search').length;
  }

  private extractFilterUsage(query: SearchQuery): number[] {
    return new Array(10).fill(0).map(() => Math.random());
  }

  private extractBrowsingPattern(session: SessionData): number[] {
    return new Array(15).fill(0).map(() => Math.random());
  }

  private randomizeActionParameters(action: Action): number[] {
    return action.parameters.map(param => {
      switch (param.type) {
        case 'float':
          return param.range ? 
            param.range.min + Math.random() * (param.range.max - param.range.min) :
            Math.random();
        case 'integer':
          return param.range ?
            Math.floor(param.range.min + Math.random() * (param.range.max - param.range.min + 1)) :
            Math.floor(Math.random() * 10);
        case 'categorical':
          return param.options ? Math.random() * param.options.length : Math.random();
        case 'boolean':
          return Math.random() > 0.5 ? 1 : 0;
        default:
          return Math.random();
      }
    });
  }

  private optimizeActionParameters(action: Action, state: StateVector): number[] {
    // Optimize parameters based on state context
    return action.parameters.map(param => {
      // Simple optimization - in practice, use more sophisticated methods
      const baseValue = param.default || 0.5;
      const contextAdjustment = state.userContext.engagement * 0.2 - 0.1;
      
      switch (param.type) {
        case 'float':
          const adjusted = baseValue + contextAdjustment;
          return param.range ? 
            Math.max(param.range.min, Math.min(param.range.max, adjusted)) :
            Math.max(0, Math.min(1, adjusted));
        default:
          return this.randomizeActionParameters(action)[0];
      }
    });
  }

  private sampleActionParameters(action: Action, state: StateVector): number[] {
    // Sample parameters from learned distribution
    return this.optimizeActionParameters(action, state).map(value => 
      value + (Math.random() - 0.5) * 0.1 // Add noise
    );
  }

  private selectRandomAction(agent: RLAgent): ActionVector {
    const randomAction = agent.policy.actionSpace.actions[
      Math.floor(Math.random() * agent.policy.actionSpace.actions.length)
    ];
    
    return {
      actionId: randomAction.id,
      parameters: this.randomizeActionParameters(randomAction),
      confidence: 0.1,
      explorationNoise: 1.0
    };
  }

  private getActionRewardHistory(agentId: string, actionId: string): number[] {
    const key = `${agentId}_${actionId}`;
    return this.rewardHistory.get(key) || [];
  }

  private generateDefaultSolution(task: SearchOptimizationTask): SearchSolution {
    const rankedResults = task.candidates
      .map((candidate, index) => ({
        propertyId: candidate.listing.id,
        rank: index + 1,
        score: candidate.baseScore,
        confidence: 0.5,
        reasons: ['Default ranking'],
        actionRecommendations: []
      }))
      .sort((a, b) => b.score - a.score);

    return {
      rankedResults,
      appliedFilters: [],
      personalization: {
        strategy: 'default',
        parameters: {},
        confidence: 0.5,
        adaptations: []
      },
      performance: {
        relevance: 0.5,
        diversity: 0.5,
        coverage: 1.0,
        efficiency: 1.0,
        userSatisfaction: 0.5
      },
      reasoning: ['Default solution - no optimization applied']
    };
  }

  private calculateRelevanceScore(results: RankedResult[]): number {
    return results.reduce((sum, result) => sum + result.score, 0) / results.length / 100;
  }

  private calculateDiversityScore(results: RankedResult[]): number {
    // Simplified diversity calculation
    return Math.min(1.0, results.length / 20);
  }

  private calculateCoverageScore(results: RankedResult[], candidates: PropertyCandidate[]): number {
    return results.length / candidates.length;
  }

  private updateAgentPerformance(agent: RLAgent, experiences: Experience[]): void {
    const rewards = experiences.map(exp => exp.reward);
    const totalReward = rewards.reduce((sum, r) => sum + r, 0);
    
    agent.performance.totalReward += totalReward;
    agent.performance.episodeRewards.push(totalReward);
    
    // Keep recent episode history
    if (agent.performance.episodeRewards.length > 100) {
      agent.performance.episodeRewards = agent.performance.episodeRewards.slice(-100);
    }
    
    agent.performance.averageReward = 
      agent.performance.episodeRewards.reduce((sum, r) => sum + r, 0) / 
      agent.performance.episodeRewards.length;
    
    // Update business impact metrics
    const businessMetrics = experiences.map(exp => exp.metadata.businessMetrics);
    if (businessMetrics.length > 0) {
      agent.performance.businessImpact = {
        userEngagement: businessMetrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / businessMetrics.length,
        conversionImprovement: businessMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / businessMetrics.length,
        revenueIncrease: businessMetrics.reduce((sum, m) => sum + m.revenueImpact, 0) / businessMetrics.length,
        userSatisfaction: businessMetrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / businessMetrics.length,
        systemEfficiency: 0.8 + Math.random() * 0.2 // Simplified
      };
    }
    
    agent.performance.lastEvaluation = new Date();
  }

  private initializeNetworkWeights(layerSizes: number[]): number[][][] {
    const weights: number[][][] = [];
    
    for (let i = 0; i < layerSizes.length - 1; i++) {
      const layerWeights: number[][] = [];
      for (let j = 0; j < layerSizes[i + 1]; j++) {
        const neuronWeights: number[] = [];
        for (let k = 0; k < layerSizes[i]; k++) {
          neuronWeights.push((Math.random() - 0.5) * 0.1);
        }
        layerWeights.push(neuronWeights);
      }
      weights.push(layerWeights);
    }
    
    return weights;
  }

  private initializeNetworkBiases(layerSizes: number[]): number[][] {
    return layerSizes.map(size => new Array(size).fill(0).map(() => (Math.random() - 0.5) * 0.1));
  }

  // Public Interface
  getAgents(): RLAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(agentId: string): RLAgent | null {
    return this.agents.get(agentId) || null;
  }

  getEngineStats(): {
    totalAgents: number;
    readyAgents: number;
    trainingAgents: number;
    totalExperiences: number;
    averageReward: number;
    bestPerformingAgent: string | null;
  } {
    const agents = Array.from(this.agents.values());
    const ready = agents.filter(a => a.status === 'ready').length;
    const training = agents.filter(a => a.status === 'training' || a.status === 'updating').length;
    
    const totalExperiences = Array.from(this.experienceBuffer.values())
      .reduce((sum, buffer) => sum + buffer.length, 0);
    
    const avgReward = agents.length > 0 ?
      agents.reduce((sum, a) => sum + a.performance.averageReward, 0) / agents.length : 0;
    
    const bestAgent = agents.reduce((best, current) => 
      current.performance.averageReward > (best?.performance.averageReward || -Infinity) ? current : best,
      null as RLAgent | null
    );

    return {
      totalAgents: agents.length,
      readyAgents: ready,
      trainingAgents: training,
      totalExperiences,
      averageReward: Math.round(avgReward * 1000) / 1000,
      bestPerformingAgent: bestAgent?.agentId || null
    };
  }

  async resetAgent(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    agent.state = this.initializeAgentState();
    agent.performance = this.initializePerformance();
    agent.memory = [];
    agent.totalSteps = 0;
    
    this.experienceBuffer.set(agentId, []);
    
    return true;
  }

  clearExperienceBuffer(): void {
    for (const [agentId] of this.agents) {
      this.experienceBuffer.set(agentId, []);
    }
  }
}

interface Episode {
  episodeId: string;
  agentId: string;
  startTime: Date;
  endTime?: Date;
  experiences: Experience[];
  totalReward: number;
  completed: boolean;
}

interface TimeData {
  timestamp: Date;
  isWeekend: boolean;
  isHoliday: boolean;
}

interface MarketData {
  trends: any;
  competition: any;
}

interface UserPreferences {
  preferences: any;
}

export const reinforcementLearningEngine = new ReinforcementLearningEngine();
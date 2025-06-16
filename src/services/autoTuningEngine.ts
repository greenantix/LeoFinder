import { Listing } from '../types/listing';

interface HyperParameter {
  name: string;
  type: 'float' | 'int' | 'categorical' | 'boolean';
  value: any;
  range?: { min: number; max: number };
  options?: any[];
  importance: number; // 0-1
  searchHistory: Array<{ value: any; performance: number; timestamp: Date }>;
  constraints?: ParameterConstraint[];
}

interface ParameterConstraint {
  type: 'conditional' | 'dependent' | 'exclusive';
  condition: string;
  target: string;
  value: any;
}

interface TuningJob {
  jobId: string;
  modelType: string;
  objective: 'accuracy' | 'speed' | 'memory' | 'f1_score' | 'auc' | 'custom';
  strategy: 'random_search' | 'grid_search' | 'bayesian' | 'genetic' | 'tpe' | 'hyperband' | 'optuna';
  budget: {
    maxTrials: number;
    maxTime: number; // seconds
    maxResources: number; // compute units
  };
  constraints: TuningConstraints;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: {
    trialsCompleted: number;
    bestScore: number;
    currentTrial: number;
    estimatedTimeRemaining: number;
  };
  results: TuningResults;
  startTime: Date;
  endTime?: Date;
  config: TuningConfiguration;
}

interface TuningConstraints {
  minPerformance: number;
  maxTrainingTime: number;
  maxInferenceTime: number;
  maxMemoryUsage: number;
  requiredFeatures?: string[];
  forbiddenCombinations?: ParameterCombination[];
}

interface ParameterCombination {
  parameters: Record<string, any>;
  reason: string;
}

interface TuningConfiguration {
  searchSpace: SearchSpace;
  pruning: PruningConfig;
  earlyStop: EarlyStopConfig;
  parallelization: ParallelConfig;
  validation: ValidationConfig;
}

interface SearchSpace {
  parameters: HyperParameter[];
  conditionalSpaces: ConditionalSpace[];
  transformations: ParameterTransformation[];
}

interface ConditionalSpace {
  condition: string;
  parameters: HyperParameter[];
}

interface ParameterTransformation {
  parameter: string;
  transformation: 'log' | 'sqrt' | 'square' | 'normalize' | 'standardize';
}

interface PruningConfig {
  enabled: boolean;
  strategy: 'median' | 'percentile' | 'successive_halving' | 'hyperband';
  aggressiveness: number; // 0-1
  minTrials: number;
  patience: number;
}

interface EarlyStopConfig {
  enabled: boolean;
  patience: number;
  minDelta: number;
  monitorMetric: string;
  mode: 'min' | 'max';
}

interface ParallelConfig {
  enabled: boolean;
  maxWorkers: number;
  loadBalancing: 'round_robin' | 'dynamic' | 'resource_aware';
}

interface ValidationConfig {
  method: 'cross_validation' | 'holdout' | 'time_series' | 'bootstrap';
  folds: number;
  testSize: number;
  stratified: boolean;
}

interface TuningResults {
  bestParameters: Record<string, any>;
  bestScore: number;
  bestTrial: TrialResult;
  allTrials: TrialResult[];
  convergenceHistory: ConvergencePoint[];
  parameterImportance: ParameterImportance[];
  interactions: ParameterInteraction[];
}

interface TrialResult {
  trialId: string;
  parameters: Record<string, any>;
  metrics: TrialMetrics;
  status: 'completed' | 'pruned' | 'failed' | 'timeout';
  duration: number;
  resources: ResourceUsage;
  timestamp: Date;
}

interface TrialMetrics {
  primaryObjective: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  trainingTime: number;
  inferenceTime: number;
  memoryUsage: number;
  customMetrics?: Record<string, number>;
}

interface ResourceUsage {
  cpuTime: number;
  memoryPeak: number;
  gpuMemory?: number;
  diskSpace: number;
}

interface ConvergencePoint {
  trial: number;
  bestScore: number;
  averageScore: number;
  timestamp: Date;
}

interface ParameterImportance {
  parameter: string;
  importance: number;
  confidence: number;
  interactions: string[];
}

interface ParameterInteraction {
  parameters: string[];
  strength: number;
  effect: 'synergistic' | 'antagonistic' | 'independent';
}

interface OptunaStudy {
  studyName: string;
  direction: 'minimize' | 'maximize';
  sampler: OptunaSampler;
  pruner: OptunaPruner;
  trials: OptunaTrialState[];
}

interface OptunaSampler {
  type: 'tpe' | 'random' | 'grid' | 'cmaes' | 'nsgaii';
  config: any;
}

interface OptunaPruner {
  type: 'median' | 'successive_halving' | 'hyperband' | 'nop';
  config: any;
}

interface OptunaTrialState {
  number: number;
  value?: number;
  state: 'running' | 'complete' | 'pruned' | 'fail';
  params: Record<string, any>;
  userAttrs: Record<string, any>;
  systemAttrs: Record<string, any>;
}

export class AutoTuningEngine {
  private tuningJobs = new Map<string, TuningJob>();
  private activeJobs = new Set<string>();
  private workerPool: TuningWorker[] = [];
  private globalHistory = new Map<string, TrialResult[]>();
  private parameterRegistry = new Map<string, HyperParameter>();

  constructor() {
    this.initializeWorkerPool();
    this.registerDefaultParameters();
    this.startTuningLoop();
  }

  // Job Management
  async createTuningJob(config: Partial<TuningJob>): Promise<TuningJob> {
    const jobId = `tune_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: TuningJob = {
      jobId,
      modelType: config.modelType || 'neural_network',
      objective: config.objective || 'accuracy',
      strategy: config.strategy || 'bayesian',
      budget: {
        maxTrials: 100,
        maxTime: 3600, // 1 hour
        maxResources: 1000,
        ...config.budget
      },
      constraints: {
        minPerformance: 0.6,
        maxTrainingTime: 300, // 5 minutes
        maxInferenceTime: 100, // 100ms
        maxMemoryUsage: 1024, // 1GB
        ...config.constraints
      },
      status: 'pending',
      progress: {
        trialsCompleted: 0,
        bestScore: config.objective === 'accuracy' ? 0 : Infinity,
        currentTrial: 0,
        estimatedTimeRemaining: 0
      },
      results: {
        bestParameters: {},
        bestScore: config.objective === 'accuracy' ? 0 : Infinity,
        bestTrial: {} as TrialResult,
        allTrials: [],
        convergenceHistory: [],
        parameterImportance: [],
        interactions: []
      },
      startTime: new Date(),
      config: {
        searchSpace: this.createSearchSpace(config.modelType || 'neural_network'),
        pruning: {
          enabled: true,
          strategy: 'median',
          aggressiveness: 0.5,
          minTrials: 5,
          patience: 10
        },
        earlyStop: {
          enabled: true,
          patience: 20,
          minDelta: 0.001,
          monitorMetric: config.objective || 'accuracy',
          mode: this.getObjectiveMode(config.objective || 'accuracy')
        },
        parallelization: {
          enabled: true,
          maxWorkers: 4,
          loadBalancing: 'dynamic'
        },
        validation: {
          method: 'cross_validation',
          folds: 5,
          testSize: 0.2,
          stratified: true
        },
        ...config.config
      }
    };

    this.tuningJobs.set(jobId, job);
    return job;
  }

  async startTuning(jobId: string): Promise<void> {
    const job = this.tuningJobs.get(jobId);
    if (!job) {
      throw new Error('Tuning job not found');
    }

    if (this.activeJobs.has(jobId)) {
      throw new Error('Job is already running');
    }

    job.status = 'running';
    job.startTime = new Date();
    this.activeJobs.add(jobId);

    // Start tuning based on strategy
    switch (job.strategy) {
      case 'bayesian':
        await this.runBayesianOptimization(job);
        break;
      case 'tpe':
        await this.runTPEOptimization(job);
        break;
      case 'optuna':
        await this.runOptunaOptimization(job);
        break;
      case 'hyperband':
        await this.runHyperbandOptimization(job);
        break;
      case 'genetic':
        await this.runGeneticOptimization(job);
        break;
      default:
        await this.runRandomSearch(job);
    }

    job.status = 'completed';
    job.endTime = new Date();
    this.activeJobs.delete(jobId);
  }

  private async runBayesianOptimization(job: TuningJob): Promise<void> {
    const acquisitionFunction = this.createAcquisitionFunction('ei'); // Expected Improvement
    
    for (let trial = 0; trial < job.budget.maxTrials; trial++) {
      if (this.shouldStopEarly(job)) break;

      // Generate candidate parameters using Gaussian Process
      const candidateParams = this.generateBayesianCandidate(job, acquisitionFunction);
      
      // Evaluate candidate
      const result = await this.evaluateParameters(job, candidateParams);
      
      // Update job progress
      await this.updateJobProgress(job, result);
      
      // Check if should prune
      if (this.shouldPrune(job, result)) {
        result.status = 'pruned';
      }
      
      job.results.allTrials.push(result);
      
      // Update Gaussian Process with new data point
      this.updateGaussianProcess(job, result);
    }
  }

  private async runTPEOptimization(job: TuningJob): Promise<void> {
    // Tree-structured Parzen Estimator
    const gammaSplit = 0.25; // Top 25% vs bottom 75%
    
    for (let trial = 0; trial < job.budget.maxTrials; trial++) {
      if (this.shouldStopEarly(job)) break;

      let candidateParams: Record<string, any>;
      
      if (trial < 10) {
        // Random exploration phase
        candidateParams = this.generateRandomParameters(job.config.searchSpace);
      } else {
        // TPE phase
        candidateParams = this.generateTPECandidate(job, gammaSplit);
      }
      
      const result = await this.evaluateParameters(job, candidateParams);
      await this.updateJobProgress(job, result);
      
      job.results.allTrials.push(result);
    }
  }

  private async runOptunaOptimization(job: TuningJob): Promise<void> {
    // Simulated Optuna study
    const study: OptunaStudy = {
      studyName: `study_${job.jobId}`,
      direction: this.getObjectiveMode(job.objective) === 'max' ? 'maximize' : 'minimize',
      sampler: {
        type: 'tpe',
        config: {
          nStartupTrials: 10,
          nEIcandidates: 24
        }
      },
      pruner: {
        type: 'median',
        config: {
          nStartupTrials: 5,
          nWarmupSteps: 10
        }
      },
      trials: []
    };

    for (let trial = 0; trial < job.budget.maxTrials; trial++) {
      if (this.shouldStopEarly(job)) break;

      const candidateParams = this.suggestOptunaParameters(study, job.config.searchSpace);
      const result = await this.evaluateParameters(job, candidateParams);
      
      // Convert to Optuna trial format
      const optunaTrialState: OptunaTrialState = {
        number: trial,
        value: result.metrics.primaryObjective,
        state: result.status === 'completed' ? 'complete' : 
               result.status === 'pruned' ? 'pruned' : 'fail',
        params: candidateParams,
        userAttrs: {},
        systemAttrs: {
          duration: result.duration,
          memory: result.resources.memoryPeak
        }
      };
      
      study.trials.push(optunaTrialState);
      
      await this.updateJobProgress(job, result);
      job.results.allTrials.push(result);
    }
  }

  private async runHyperbandOptimization(job: TuningJob): Promise<void> {
    // Hyperband successive halving
    const maxResource = 100;
    const eta = 3;
    const sMax = Math.floor(Math.log(maxResource) / Math.log(eta));
    
    for (let s = sMax; s >= 0; s--) {
      const n = Math.ceil((sMax + 1) / (s + 1)) * Math.pow(eta, s);
      const r = maxResource / Math.pow(eta, s);
      
      // Generate random configurations
      let configs: Array<{ params: Record<string, any>; resource: number }> = [];
      for (let i = 0; i < n; i++) {
        configs.push({
          params: this.generateRandomParameters(job.config.searchSpace),
          resource: Math.floor(r / Math.pow(eta, s))
        });
      }
      
      // Successive halving
      for (let i = 0; i < s + 1; i++) {
        const nConfigs = Math.floor(n / Math.pow(eta, i));
        const resource = Math.floor(r * Math.pow(eta, i));
        
        // Evaluate configurations with current resource
        const results: TrialResult[] = [];
        for (const config of configs.slice(0, nConfigs)) {
          const result = await this.evaluateParametersWithResource(job, config.params, resource);
          results.push(result);
          await this.updateJobProgress(job, result);
        }
        
        // Sort by performance and keep top performers
        results.sort((a, b) => 
          job.objective === 'accuracy' ? 
            b.metrics.primaryObjective - a.metrics.primaryObjective :
            a.metrics.primaryObjective - b.metrics.primaryObjective
        );
        
        configs = results.slice(0, Math.floor(nConfigs / eta)).map(r => ({
          params: r.parameters,
          resource: resource
        }));
        
        job.results.allTrials.push(...results);
      }
    }
  }

  private async runGeneticOptimization(job: TuningJob): Promise<void> {
    const populationSize = 20;
    const generations = Math.floor(job.budget.maxTrials / populationSize);
    const mutationRate = 0.1;
    const crossoverRate = 0.8;
    
    // Initialize population
    let population: Array<{ params: Record<string, any>; fitness: number }> = [];
    for (let i = 0; i < populationSize; i++) {
      const params = this.generateRandomParameters(job.config.searchSpace);
      const result = await this.evaluateParameters(job, params);
      population.push({
        params,
        fitness: result.metrics.primaryObjective
      });
      
      await this.updateJobProgress(job, result);
      job.results.allTrials.push(result);
    }
    
    // Evolution loop
    for (let gen = 0; gen < generations; gen++) {
      // Selection (tournament)
      const parents = this.tournamentSelection(population, populationSize);
      
      // Crossover and mutation
      const offspring: typeof population = [];
      for (let i = 0; i < populationSize; i += 2) {
        let child1 = { ...parents[i] };
        let child2 = { ...parents[(i + 1) % populationSize] };
        
        if (Math.random() < crossoverRate) {
          [child1.params, child2.params] = this.crossoverParameters(
            child1.params, child2.params, job.config.searchSpace
          );
        }
        
        if (Math.random() < mutationRate) {
          child1.params = this.mutateParameters(child1.params, job.config.searchSpace);
        }
        if (Math.random() < mutationRate) {
          child2.params = this.mutateParameters(child2.params, job.config.searchSpace);
        }
        
        // Evaluate offspring
        const result1 = await this.evaluateParameters(job, child1.params);
        const result2 = await this.evaluateParameters(job, child2.params);
        
        child1.fitness = result1.metrics.primaryObjective;
        child2.fitness = result2.metrics.primaryObjective;
        
        offspring.push(child1, child2);
        
        await this.updateJobProgress(job, result1);
        await this.updateJobProgress(job, result2);
        job.results.allTrials.push(result1, result2);
      }
      
      population = offspring;
    }
  }

  // Parameter Generation Methods
  private generateBayesianCandidate(job: TuningJob, acquisitionFn: any): Record<string, any> {
    const params: Record<string, any> = {};
    
    for (const param of job.config.searchSpace.parameters) {
      if (param.type === 'float' && param.range) {
        params[param.name] = this.sampleFloatBayesian(param, acquisitionFn);
      } else if (param.type === 'int' && param.range) {
        params[param.name] = this.sampleIntBayesian(param, acquisitionFn);
      } else if (param.type === 'categorical' && param.options) {
        params[param.name] = this.sampleCategoricalBayesian(param, acquisitionFn);
      } else if (param.type === 'boolean') {
        params[param.name] = Math.random() > 0.5;
      }
    }
    
    return params;
  }

  private generateTPECandidate(job: TuningJob, gammaSplit: number): Record<string, any> {
    const trials = job.results.allTrials;
    const sortedTrials = [...trials].sort((a, b) => 
      job.objective === 'accuracy' ? 
        b.metrics.primaryObjective - a.metrics.primaryObjective :
        a.metrics.primaryObjective - b.metrics.primaryObjective
    );
    
    const splitPoint = Math.floor(trials.length * gammaSplit);
    const goodTrials = sortedTrials.slice(0, splitPoint);
    const badTrials = sortedTrials.slice(splitPoint);
    
    const params: Record<string, any> = {};
    
    for (const param of job.config.searchSpace.parameters) {
      const goodValues = goodTrials.map(t => t.parameters[param.name]);
      const badValues = badTrials.map(t => t.parameters[param.name]);
      
      params[param.name] = this.sampleTPEParameter(param, goodValues, badValues);
    }
    
    return params;
  }

  private generateRandomParameters(searchSpace: SearchSpace): Record<string, any> {
    const params: Record<string, any> = {};
    
    for (const param of searchSpace.parameters) {
      switch (param.type) {
        case 'float':
          if (param.range) {
            params[param.name] = param.range.min + 
              Math.random() * (param.range.max - param.range.min);
          }
          break;
        case 'int':
          if (param.range) {
            params[param.name] = Math.floor(
              param.range.min + Math.random() * (param.range.max - param.range.min + 1)
            );
          }
          break;
        case 'categorical':
          if (param.options) {
            params[param.name] = param.options[
              Math.floor(Math.random() * param.options.length)
            ];
          }
          break;
        case 'boolean':
          params[param.name] = Math.random() > 0.5;
          break;
      }
    }
    
    return params;
  }

  // Evaluation Methods
  private async evaluateParameters(job: TuningJob, parameters: Record<string, any>): Promise<TrialResult> {
    const trialId = `trial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    try {
      // Simulate model training and evaluation
      const metrics = await this.simulateModelTraining(job.modelType, parameters);
      const duration = Date.now() - startTime;
      
      const result: TrialResult = {
        trialId,
        parameters,
        metrics: {
          ...metrics,
          primaryObjective: this.calculatePrimaryObjective(metrics, job.objective)
        },
        status: 'completed',
        duration,
        resources: {
          cpuTime: duration,
          memoryPeak: 100 + Math.random() * 500,
          diskSpace: 50 + Math.random() * 200
        },
        timestamp: new Date()
      };
      
      // Check constraints
      if (!this.meetsConstraints(result, job.constraints)) {
        result.status = 'failed';
        result.metrics.primaryObjective = job.objective === 'accuracy' ? 0 : Infinity;
      }
      
      return result;
      
    } catch (error) {
      return {
        trialId,
        parameters,
        metrics: {
          primaryObjective: job.objective === 'accuracy' ? 0 : Infinity,
          accuracy: 0,
          precision: 0,
          recall: 0,
          f1Score: 0,
          trainingTime: 0,
          inferenceTime: Infinity,
          memoryUsage: Infinity
        },
        status: 'failed',
        duration: Date.now() - startTime,
        resources: { cpuTime: 0, memoryPeak: 0, diskSpace: 0 },
        timestamp: new Date()
      };
    }
  }

  private async evaluateParametersWithResource(
    job: TuningJob, 
    parameters: Record<string, any>, 
    resource: number
  ): Promise<TrialResult> {
    // Scale down evaluation based on resource allocation
    const result = await this.evaluateParameters(job, parameters);
    
    // Adjust metrics based on resource constraints
    const resourceFactor = resource / 100; // Normalize to 0-1
    result.metrics.accuracy *= (0.5 + 0.5 * resourceFactor); // Minimum 50% of full accuracy
    result.duration *= resourceFactor;
    
    return result;
  }

  private async simulateModelTraining(modelType: string, parameters: Record<string, any>): Promise<TrialMetrics> {
    // Simulate training delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
    
    // Calculate performance based on parameter quality
    let baseAccuracy = 0.6 + Math.random() * 0.35;
    
    // Parameter-specific adjustments
    if (parameters.learning_rate) {
      const lr = parameters.learning_rate;
      if (lr >= 0.001 && lr <= 0.01) baseAccuracy += 0.05;
      if (lr < 0.0001 || lr > 0.1) baseAccuracy -= 0.1;
    }
    
    if (parameters.batch_size) {
      const bs = parameters.batch_size;
      if (bs >= 16 && bs <= 64) baseAccuracy += 0.03;
    }
    
    if (parameters.hidden_units) {
      const hu = parameters.hidden_units;
      if (hu >= 64 && hu <= 256) baseAccuracy += 0.04;
    }
    
    if (parameters.dropout) {
      const dropout = parameters.dropout;
      if (dropout >= 0.1 && dropout <= 0.3) baseAccuracy += 0.02;
      if (dropout > 0.5) baseAccuracy -= 0.05;
    }
    
    baseAccuracy = Math.max(0.3, Math.min(0.98, baseAccuracy));
    
    const metrics: TrialMetrics = {
      primaryObjective: baseAccuracy,
      accuracy: baseAccuracy,
      precision: baseAccuracy * (0.95 + Math.random() * 0.05),
      recall: baseAccuracy * (0.93 + Math.random() * 0.07),
      f1Score: baseAccuracy * (0.94 + Math.random() * 0.06),
      trainingTime: 100 + Math.random() * 400,
      inferenceTime: 1 + Math.random() * 10,
      memoryUsage: 100 + Math.random() * 300
    };
    
    return metrics;
  }

  // Helper Methods
  private createSearchSpace(modelType: string): SearchSpace {
    const searchSpaces: Record<string, SearchSpace> = {
      neural_network: {
        parameters: [
          {
            name: 'learning_rate',
            type: 'float',
            value: 0.001,
            range: { min: 0.0001, max: 0.1 },
            importance: 0.9,
            searchHistory: []
          },
          {
            name: 'batch_size',
            type: 'int',
            value: 32,
            range: { min: 8, max: 128 },
            importance: 0.7,
            searchHistory: []
          },
          {
            name: 'hidden_units',
            type: 'int',
            value: 128,
            range: { min: 32, max: 512 },
            importance: 0.8,
            searchHistory: []
          },
          {
            name: 'dropout',
            type: 'float',
            value: 0.2,
            range: { min: 0.0, max: 0.5 },
            importance: 0.6,
            searchHistory: []
          },
          {
            name: 'optimizer',
            type: 'categorical',
            value: 'adam',
            options: ['adam', 'sgd', 'rmsprop', 'adagrad'],
            importance: 0.7,
            searchHistory: []
          },
          {
            name: 'activation',
            type: 'categorical',
            value: 'relu',
            options: ['relu', 'tanh', 'sigmoid', 'leaky_relu'],
            importance: 0.5,
            searchHistory: []
          }
        ],
        conditionalSpaces: [],
        transformations: [
          { parameter: 'learning_rate', transformation: 'log' }
        ]
      },
      random_forest: {
        parameters: [
          {
            name: 'n_estimators',
            type: 'int',
            value: 100,
            range: { min: 10, max: 500 },
            importance: 0.8,
            searchHistory: []
          },
          {
            name: 'max_depth',
            type: 'int',
            value: 10,
            range: { min: 3, max: 50 },
            importance: 0.7,
            searchHistory: []
          },
          {
            name: 'min_samples_split',
            type: 'int',
            value: 2,
            range: { min: 2, max: 20 },
            importance: 0.6,
            searchHistory: []
          },
          {
            name: 'min_samples_leaf',
            type: 'int',
            value: 1,
            range: { min: 1, max: 10 },
            importance: 0.5,
            searchHistory: []
          }
        ],
        conditionalSpaces: [],
        transformations: []
      }
    };
    
    return searchSpaces[modelType] || searchSpaces.neural_network;
  }

  private createAcquisitionFunction(type: string): any {
    // Simplified acquisition function
    return {
      type,
      evaluate: (mean: number, std: number) => {
        switch (type) {
          case 'ei': // Expected Improvement
            return std * Math.exp(-0.5 * Math.pow(mean, 2));
          case 'ucb': // Upper Confidence Bound
            return mean + 2.0 * std;
          case 'pi': // Probability of Improvement
            return 0.5 * (1 + this.erf(mean / (std * Math.sqrt(2))));
          default:
            return mean;
        }
      }
    };
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private getObjectiveMode(objective: string): 'min' | 'max' {
    const maximizeObjectives = ['accuracy', 'f1_score', 'auc', 'precision', 'recall'];
    return maximizeObjectives.includes(objective) ? 'max' : 'min';
  }

  private calculatePrimaryObjective(metrics: TrialMetrics, objective: string): number {
    switch (objective) {
      case 'accuracy': return metrics.accuracy;
      case 'f1_score': return metrics.f1Score;
      case 'speed': return 1 / metrics.trainingTime; // Reciprocal for maximization
      case 'memory': return 1 / metrics.memoryUsage; // Reciprocal for maximization
      default: return metrics.accuracy;
    }
  }

  private meetsConstraints(result: TrialResult, constraints: TuningConstraints): boolean {
    return result.metrics.primaryObjective >= constraints.minPerformance &&
           result.metrics.trainingTime <= constraints.maxTrainingTime &&
           result.metrics.inferenceTime <= constraints.maxInferenceTime &&
           result.metrics.memoryUsage <= constraints.maxMemoryUsage;
  }

  private shouldStopEarly(job: TuningJob): boolean {
    if (!job.config.earlyStop.enabled) return false;
    
    const recentTrials = job.results.allTrials.slice(-job.config.earlyStop.patience);
    if (recentTrials.length < job.config.earlyStop.patience) return false;
    
    const scores = recentTrials.map(t => t.metrics.primaryObjective);
    const bestRecent = Math.max(...scores);
    const improvement = bestRecent - job.results.bestScore;
    
    return improvement < job.config.earlyStop.minDelta;
  }

  private shouldPrune(job: TuningJob, result: TrialResult): boolean {
    if (!job.config.pruning.enabled) return false;
    if (job.results.allTrials.length < job.config.pruning.minTrials) return false;
    
    const completedTrials = job.results.allTrials.filter(t => t.status === 'completed');
    if (completedTrials.length === 0) return false;
    
    const scores = completedTrials.map(t => t.metrics.primaryObjective);
    const median = this.calculateMedian(scores);
    
    return result.metrics.primaryObjective < median * (1 - job.config.pruning.aggressiveness);
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private async updateJobProgress(job: TuningJob, result: TrialResult): Promise<void> {
    job.progress.trialsCompleted++;
    job.progress.currentTrial++;
    
    if (this.isBetterResult(result.metrics.primaryObjective, job.results.bestScore, job.objective)) {
      job.results.bestScore = result.metrics.primaryObjective;
      job.results.bestParameters = result.parameters;
      job.results.bestTrial = result;
      job.progress.bestScore = result.metrics.primaryObjective;
    }
    
    // Update convergence history
    job.results.convergenceHistory.push({
      trial: job.progress.trialsCompleted,
      bestScore: job.results.bestScore,
      averageScore: this.calculateAverageScore(job.results.allTrials),
      timestamp: new Date()
    });
    
    // Estimate remaining time
    const avgTrialTime = job.results.allTrials.reduce((sum, t) => sum + t.duration, 0) / 
                        job.results.allTrials.length;
    const remainingTrials = job.budget.maxTrials - job.progress.trialsCompleted;
    job.progress.estimatedTimeRemaining = avgTrialTime * remainingTrials;
  }

  private isBetterResult(newScore: number, bestScore: number, objective: string): boolean {
    if (this.getObjectiveMode(objective) === 'max') {
      return newScore > bestScore;
    } else {
      return newScore < bestScore;
    }
  }

  private calculateAverageScore(trials: TrialResult[]): number {
    if (trials.length === 0) return 0;
    return trials.reduce((sum, t) => sum + t.metrics.primaryObjective, 0) / trials.length;
  }

  // Worker Management
  private initializeWorkerPool(): void {
    // Initialize tuning workers for parallel execution
    for (let i = 0; i < 4; i++) {
      this.workerPool.push(new TuningWorker(`worker_${i}`));
    }
  }

  private startTuningLoop(): void {
    setInterval(() => {
      this.processPendingJobs();
    }, 1000);
  }

  private processPendingJobs(): void {
    const pendingJobs = Array.from(this.tuningJobs.values())
      .filter(job => job.status === 'pending');
    
    for (const job of pendingJobs) {
      if (this.activeJobs.size < this.workerPool.length) {
        this.startTuning(job.jobId).catch(console.error);
      }
    }
  }

  private registerDefaultParameters(): void {
    // Register commonly used parameters for reuse across models
    const commonParams: HyperParameter[] = [
      {
        name: 'learning_rate',
        type: 'float',
        value: 0.001,
        range: { min: 0.0001, max: 0.1 },
        importance: 0.9,
        searchHistory: []
      },
      {
        name: 'batch_size',
        type: 'int',
        value: 32,
        range: { min: 8, max: 128 },
        importance: 0.7,
        searchHistory: []
      }
    ];
    
    commonParams.forEach(param => {
      this.parameterRegistry.set(param.name, param);
    });
  }

  // Advanced sampling methods
  private sampleFloatBayesian(param: HyperParameter, acquisitionFn: any): number {
    if (!param.range) return param.value;
    
    // Use acquisition function to sample promising values
    const samples = 100;
    let bestValue = param.value;
    let bestScore = -Infinity;
    
    for (let i = 0; i < samples; i++) {
      const value = param.range.min + Math.random() * (param.range.max - param.range.min);
      const mean = this.predictParameterMean(param, value);
      const std = this.predictParameterStd(param, value);
      const score = acquisitionFn.evaluate(mean, std);
      
      if (score > bestScore) {
        bestScore = score;
        bestValue = value;
      }
    }
    
    return bestValue;
  }

  private sampleIntBayesian(param: HyperParameter, acquisitionFn: any): number {
    const floatValue = this.sampleFloatBayesian(param, acquisitionFn);
    return Math.round(floatValue);
  }

  private sampleCategoricalBayesian(param: HyperParameter, acquisitionFn: any): any {
    if (!param.options) return param.value;
    
    const scores = param.options.map(option => {
      const mean = this.getOptionMean(param, option);
      const std = this.getOptionStd(param, option);
      return acquisitionFn.evaluate(mean, std);
    });
    
    // Softmax selection
    const expScores = scores.map(s => Math.exp(s));
    const sumExp = expScores.reduce((sum, s) => sum + s, 0);
    const probabilities = expScores.map(s => s / sumExp);
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < param.options.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        return param.options[i];
      }
    }
    
    return param.options[param.options.length - 1];
  }

  private sampleTPEParameter(param: HyperParameter, goodValues: any[], badValues: any[]): any {
    if (param.type === 'categorical') {
      return this.sampleTPECategorical(param, goodValues, badValues);
    } else {
      return this.sampleTPENumerical(param, goodValues, badValues);
    }
  }

  private sampleTPECategorical(param: HyperParameter, goodValues: any[], badValues: any[]): any {
    if (!param.options) return param.value;
    
    const goodCounts = new Map<any, number>();
    const badCounts = new Map<any, number>();
    
    param.options.forEach(option => {
      goodCounts.set(option, goodValues.filter(v => v === option).length);
      badCounts.set(option, badValues.filter(v => v === option).length);
    });
    
    // Calculate likelihood ratios
    const ratios = param.options.map(option => {
      const good = (goodCounts.get(option) || 0) + 1; // Laplace smoothing
      const bad = (badCounts.get(option) || 0) + 1;
      return good / bad;
    });
    
    // Sample based on ratios
    const totalRatio = ratios.reduce((sum, r) => sum + r, 0);
    const probabilities = ratios.map(r => r / totalRatio);
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < param.options.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        return param.options[i];
      }
    }
    
    return param.options[param.options.length - 1];
  }

  private sampleTPENumerical(param: HyperParameter, goodValues: number[], badValues: number[]): number {
    if (!param.range || goodValues.length === 0) {
      return param.range ? 
        param.range.min + Math.random() * (param.range.max - param.range.min) : 
        param.value;
    }
    
    // Use kernel density estimation for TPE
    const goodMean = goodValues.reduce((sum, v) => sum + v, 0) / goodValues.length;
    const goodStd = Math.sqrt(
      goodValues.reduce((sum, v) => sum + Math.pow(v - goodMean, 2), 0) / goodValues.length
    );
    
    // Sample from good distribution with some noise
    let candidate = goodMean + (Math.random() - 0.5) * goodStd * 2;
    
    // Ensure within bounds
    if (param.range) {
      candidate = Math.max(param.range.min, Math.min(param.range.max, candidate));
    }
    
    return candidate;
  }

  private predictParameterMean(param: HyperParameter, value: number): number {
    if (param.searchHistory.length === 0) return 0.5;
    
    // Simple Gaussian kernel
    const bandwidth = 0.1;
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const entry of param.searchHistory) {
      const distance = Math.abs(entry.value - value);
      const weight = Math.exp(-distance * distance / (2 * bandwidth * bandwidth));
      weightedSum += weight * entry.performance;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  private predictParameterStd(param: HyperParameter, value: number): number {
    if (param.searchHistory.length < 2) return 1.0;
    
    const mean = this.predictParameterMean(param, value);
    const bandwidth = 0.1;
    let weightedSumSq = 0;
    let totalWeight = 0;
    
    for (const entry of param.searchHistory) {
      const distance = Math.abs(entry.value - value);
      const weight = Math.exp(-distance * distance / (2 * bandwidth * bandwidth));
      weightedSumSq += weight * Math.pow(entry.performance - mean, 2);
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? Math.sqrt(weightedSumSq / totalWeight) : 1.0;
  }

  private getOptionMean(param: HyperParameter, option: any): number {
    const relevantHistory = param.searchHistory.filter(h => h.value === option);
    if (relevantHistory.length === 0) return 0.5;
    
    return relevantHistory.reduce((sum, h) => sum + h.performance, 0) / relevantHistory.length;
  }

  private getOptionStd(param: HyperParameter, option: any): number {
    const relevantHistory = param.searchHistory.filter(h => h.value === option);
    if (relevantHistory.length < 2) return 1.0;
    
    const mean = this.getOptionMean(param, option);
    const variance = relevantHistory.reduce((sum, h) => sum + Math.pow(h.performance - mean, 2), 0) / 
                    relevantHistory.length;
    
    return Math.sqrt(variance);
  }

  private updateGaussianProcess(job: TuningJob, result: TrialResult): void {
    // Update parameter search histories
    for (const param of job.config.searchSpace.parameters) {
      const paramValue = result.parameters[param.name];
      if (paramValue !== undefined) {
        param.searchHistory.push({
          value: paramValue,
          performance: result.metrics.primaryObjective,
          timestamp: new Date()
        });
        
        // Keep only recent history
        if (param.searchHistory.length > 1000) {
          param.searchHistory = param.searchHistory.slice(-1000);
        }
      }
    }
  }

  private suggestOptunaParameters(study: OptunaStudy, searchSpace: SearchSpace): Record<string, any> {
    // Simplified Optuna parameter suggestion
    const params: Record<string, any> = {};
    
    for (const param of searchSpace.parameters) {
      if (study.trials.length < 10) {
        // Random phase
        params[param.name] = this.randomizeParameter(param);
      } else {
        // TPE phase
        const goodTrials = study.trials
          .filter(t => t.state === 'complete')
          .sort((a, b) => 
            study.direction === 'maximize' ? 
              (b.value || 0) - (a.value || 0) :
              (a.value || 0) - (b.value || 0)
          )
          .slice(0, Math.floor(study.trials.length * 0.25));
        
        const badTrials = study.trials
          .filter(t => t.state === 'complete')
          .sort((a, b) => 
            study.direction === 'maximize' ? 
              (a.value || 0) - (b.value || 0) :
              (b.value || 0) - (a.value || 0)
          )
          .slice(0, Math.floor(study.trials.length * 0.75));
        
        const goodValues = goodTrials.map(t => t.params[param.name]);
        const badValues = badTrials.map(t => t.params[param.name]);
        
        params[param.name] = this.sampleTPEParameter(param, goodValues, badValues);
      }
    }
    
    return params;
  }

  private randomizeParameter(param: HyperParameter): any {
    switch (param.type) {
      case 'float':
        if (param.range) {
          return param.range.min + Math.random() * (param.range.max - param.range.min);
        }
        return Math.random();
      
      case 'int':
        if (param.range) {
          return Math.floor(param.range.min + Math.random() * (param.range.max - param.range.min + 1));
        }
        return Math.floor(Math.random() * 100);
      
      case 'categorical':
        if (param.options) {
          return param.options[Math.floor(Math.random() * param.options.length)];
        }
        return param.value;
      
      case 'boolean':
        return Math.random() > 0.5;
      
      default:
        return param.value;
    }
  }

  private tournamentSelection(population: any[], size: number): any[] {
    const selected = [];
    const tournamentSize = 3;
    
    for (let i = 0; i < size; i++) {
      let best = population[Math.floor(Math.random() * population.length)];
      
      for (let j = 1; j < tournamentSize; j++) {
        const candidate = population[Math.floor(Math.random() * population.length)];
        if (candidate.fitness > best.fitness) {
          best = candidate;
        }
      }
      
      selected.push({ ...best });
    }
    
    return selected;
  }

  private crossoverParameters(
    params1: Record<string, any>, 
    params2: Record<string, any>, 
    searchSpace: SearchSpace
  ): [Record<string, any>, Record<string, any>] {
    const child1 = { ...params1 };
    const child2 = { ...params2 };
    
    // Single-point crossover
    const paramNames = Object.keys(params1);
    const crossoverPoint = Math.floor(Math.random() * paramNames.length);
    
    for (let i = crossoverPoint; i < paramNames.length; i++) {
      const paramName = paramNames[i];
      const temp = child1[paramName];
      child1[paramName] = child2[paramName];
      child2[paramName] = temp;
    }
    
    return [child1, child2];
  }

  private mutateParameters(params: Record<string, any>, searchSpace: SearchSpace): Record<string, any> {
    const mutated = { ...params };
    const paramToMutate = searchSpace.parameters[Math.floor(Math.random() * searchSpace.parameters.length)];
    
    mutated[paramToMutate.name] = this.randomizeParameter(paramToMutate);
    
    return mutated;
  }

  // Public Interface
  getTuningJob(jobId: string): TuningJob | null {
    return this.tuningJobs.get(jobId) || null;
  }

  getTuningJobs(): TuningJob[] {
    return Array.from(this.tuningJobs.values());
  }

  async pauseTuning(jobId: string): Promise<boolean> {
    const job = this.tuningJobs.get(jobId);
    if (!job || job.status !== 'running') return false;
    
    job.status = 'paused';
    this.activeJobs.delete(jobId);
    return true;
  }

  async resumeTuning(jobId: string): Promise<boolean> {
    const job = this.tuningJobs.get(jobId);
    if (!job || job.status !== 'paused') return false;
    
    job.status = 'running';
    this.activeJobs.add(jobId);
    return true;
  }

  async cancelTuning(jobId: string): Promise<boolean> {
    const job = this.tuningJobs.get(jobId);
    if (!job) return false;
    
    job.status = 'cancelled';
    job.endTime = new Date();
    this.activeJobs.delete(jobId);
    return true;
  }

  getTuningStats(): {
    totalJobs: number;
    runningJobs: number;
    completedJobs: number;
    averageTrialsPerJob: number;
    bestOverallScore: number;
  } {
    const jobs = Array.from(this.tuningJobs.values());
    const running = jobs.filter(j => j.status === 'running').length;
    const completed = jobs.filter(j => j.status === 'completed').length;
    
    const avgTrials = jobs.length > 0 ? 
      jobs.reduce((sum, j) => sum + j.progress.trialsCompleted, 0) / jobs.length : 0;
    
    const bestScore = Math.max(...jobs.map(j => j.results.bestScore), 0);
    
    return {
      totalJobs: jobs.length,
      runningJobs: running,
      completedJobs: completed,
      averageTrialsPerJob: Math.round(avgTrials),
      bestOverallScore: Math.round(bestScore * 1000) / 1000
    };
  }

  clearTuningHistory(): void {
    this.tuningJobs.clear();
    this.activeJobs.clear();
    this.globalHistory.clear();
  }
}

// Worker class for parallel tuning
class TuningWorker {
  private workerId: string;
  private isActive = false;
  private currentJob?: string;

  constructor(workerId: string) {
    this.workerId = workerId;
  }

  async assignJob(jobId: string): Promise<boolean> {
    if (this.isActive) return false;
    
    this.isActive = true;
    this.currentJob = jobId;
    return true;
  }

  releaseJob(): void {
    this.isActive = false;
    this.currentJob = undefined;
  }

  isAvailable(): boolean {
    return !this.isActive;
  }

  getCurrentJob(): string | undefined {
    return this.currentJob;
  }
}

export const autoTuningEngine = new AutoTuningEngine();
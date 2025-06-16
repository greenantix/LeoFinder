import { Listing } from '../types/listing';

interface NeuralNetwork {
  id: string;
  name: string;
  architecture: NetworkArchitecture;
  weights: LayerWeights[];
  biases: LayerBiases[];
  performance: NetworkPerformance;
  trainingHistory: TrainingEpoch[];
  hyperparameters: NetworkHyperparameters;
  status: 'training' | 'ready' | 'optimizing' | 'deprecated';
  specialty: 'price_prediction' | 'feature_extraction' | 'market_analysis' | 'risk_assessment';
  createdAt: Date;
  lastTrained: Date;
}

interface NetworkArchitecture {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
  activationFunctions: string[];
  dropoutRates: number[];
  batchNormalization: boolean[];
  residualConnections: boolean;
}

interface LayerWeights {
  layerIndex: number;
  weights: number[][];
  shape: [number, number];
}

interface LayerBiases {
  layerIndex: number;
  biases: number[];
  shape: number;
}

interface NetworkPerformance {
  mse: number; // Mean Squared Error
  mae: number; // Mean Absolute Error
  mape: number; // Mean Absolute Percentage Error
  r2Score: number; // R-squared
  accuracy: number; // Classification accuracy for categorical outputs
  validationLoss: number;
  trainingLoss: number;
  convergenceSpeed: number; // Epochs to convergence
  generalizationGap: number; // Training vs validation performance gap
}

interface TrainingEpoch {
  epoch: number;
  trainingLoss: number;
  validationLoss: number;
  learningRate: number;
  duration: number; // milliseconds
  timestamp: Date;
}

interface NetworkHyperparameters {
  learningRate: number;
  batchSize: number;
  epochs: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adagrad';
  regularization: {
    l1: number;
    l2: number;
    dropout: number;
  };
  momentum: number;
  beta1: number;
  beta2: number;
  epsilon: number;
}

interface EnsembleConfig {
  id: string;
  name: string;
  networks: string[]; // Network IDs
  weightingStrategy: 'equal' | 'performance' | 'dynamic' | 'stacking' | 'bayesian';
  networkWeights: number[];
  metaLearner?: MetaLearner;
  diversityMetrics: DiversityMetrics;
  performance: EnsemblePerformance;
  status: 'assembling' | 'training' | 'ready' | 'updating';
  createdAt: Date;
  lastUpdated: Date;
}

interface MetaLearner {
  type: 'linear' | 'neural' | 'xgboost' | 'random_forest';
  weights: number[];
  bias?: number;
  trained: boolean;
  performance: number;
}

interface DiversityMetrics {
  correlationMatrix: number[][];
  averageCorrelation: number;
  disagreementRate: number;
  entropyDiversity: number;
  ambiguityDecomposition: number;
}

interface EnsemblePerformance {
  mse: number;
  mae: number;
  mape: number;
  r2Score: number;
  improvementOverBest: number; // How much better than best individual model
  consistencyScore: number; // How consistent predictions are
  confidenceScore: number; // Model confidence in predictions
}

interface PricePrediction {
  propertyId: string;
  predictedPrice: number;
  confidence: number;
  priceRange: { min: number; max: number };
  contributingFactors: ContributingFactor[];
  networkContributions: NetworkContribution[];
  marketComparison: MarketComparison;
  priceBreakdown: PriceBreakdown;
  uncertainty: UncertaintyMetrics;
}

interface ContributingFactor {
  factor: string;
  importance: number;
  impact: number; // Dollar impact on price
  confidence: number;
}

interface NetworkContribution {
  networkId: string;
  prediction: number;
  weight: number;
  confidence: number;
  specialty: string;
}

interface MarketComparison {
  marketMedian: number;
  percentileRank: number;
  comparableProperties: number;
  marketTrend: 'up' | 'down' | 'stable';
  trendStrength: number;
}

interface PriceBreakdown {
  baseValue: number;
  locationPremium: number;
  sizePremium: number;
  conditionAdjustment: number;
  featurePremiums: Record<string, number>;
  marketAdjustment: number;
  veteranDiscount?: number;
}

interface UncertaintyMetrics {
  modelUncertainty: number; // Epistemic uncertainty
  dataUncertainty: number; // Aleatoric uncertainty
  totalUncertainty: number;
  predictionInterval: { lower: number; upper: number };
  reliabilityScore: number;
}

interface TrainingData {
  features: number[][];
  targets: number[];
  weights?: number[];
  validation: {
    features: number[][];
    targets: number[];
  };
  metadata: {
    featureNames: string[];
    scalingFactors: number[];
    targetScaling: { mean: number; std: number };
  };
}

interface ActivationFunction {
  name: string;
  forward: (x: number) => number;
  derivative: (x: number) => number;
}

export class NeuralEnsembleEngine {
  private networks = new Map<string, NeuralNetwork>();
  private ensembles = new Map<string, EnsembleConfig>();
  private trainingData: TrainingData | null = null;
  private activationFunctions = new Map<string, ActivationFunction>();
  private isTraining = false;
  private trainingQueue: string[] = [];

  constructor() {
    this.initializeActivationFunctions();
    this.initializeNetworks();
    this.startTrainingLoop();
  }

  // Network Creation and Management
  async createNeuralNetwork(config: Partial<NeuralNetwork>): Promise<NeuralNetwork> {
    const networkId = `nn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const network: NeuralNetwork = {
      id: networkId,
      name: config.name || `Network_${networkId}`,
      architecture: config.architecture || this.getDefaultArchitecture(),
      weights: [],
      biases: [],
      performance: this.initializePerformance(),
      trainingHistory: [],
      hyperparameters: config.hyperparameters || this.getDefaultHyperparameters(),
      status: 'training',
      specialty: config.specialty || 'price_prediction',
      createdAt: new Date(),
      lastTrained: new Date()
    };

    // Initialize weights and biases
    this.initializeNetworkWeights(network);
    
    this.networks.set(networkId, network);
    this.trainingQueue.push(networkId);
    
    return network;
  }

  private getDefaultArchitecture(): NetworkArchitecture {
    return {
      inputSize: 50, // Number of property features
      hiddenLayers: [128, 64, 32],
      outputSize: 1, // Price prediction
      activationFunctions: ['relu', 'relu', 'relu', 'linear'],
      dropoutRates: [0.2, 0.3, 0.2, 0.0],
      batchNormalization: [true, true, true, false],
      residualConnections: false
    };
  }

  private getDefaultHyperparameters(): NetworkHyperparameters {
    return {
      learningRate: 0.001,
      batchSize: 32,
      epochs: 100,
      optimizer: 'adam',
      regularization: {
        l1: 0.01,
        l2: 0.01,
        dropout: 0.2
      },
      momentum: 0.9,
      beta1: 0.9,
      beta2: 0.999,
      epsilon: 1e-8
    };
  }

  private initializeNetworkWeights(network: NeuralNetwork): void {
    const arch = network.architecture;
    const layerSizes = [arch.inputSize, ...arch.hiddenLayers, arch.outputSize];
    
    network.weights = [];
    network.biases = [];
    
    for (let i = 0; i < layerSizes.length - 1; i++) {
      const inputSize = layerSizes[i];
      const outputSize = layerSizes[i + 1];
      
      // Xavier/Glorot initialization
      const variance = 2.0 / (inputSize + outputSize);
      const weights: number[][] = [];
      
      for (let j = 0; j < outputSize; j++) {
        const neuronWeights: number[] = [];
        for (let k = 0; k < inputSize; k++) {
          neuronWeights.push(this.gaussianRandom() * Math.sqrt(variance));
        }
        weights.push(neuronWeights);
      }
      
      network.weights.push({
        layerIndex: i,
        weights,
        shape: [outputSize, inputSize]
      });
      
      // Initialize biases to small random values
      const biases: number[] = [];
      for (let j = 0; j < outputSize; j++) {
        biases.push(this.gaussianRandom() * 0.01);
      }
      
      network.biases.push({
        layerIndex: i,
        biases,
        shape: outputSize
      });
    }
  }

  // Neural Network Forward Pass
  private forwardPass(network: NeuralNetwork, inputs: number[]): number[] {
    let activations = [...inputs];
    
    for (let i = 0; i < network.weights.length; i++) {
      const weightLayer = network.weights[i];
      const biasLayer = network.biases[i];
      const activationName = network.architecture.activationFunctions[i];
      const dropoutRate = network.architecture.dropoutRates[i];
      
      // Linear transformation: W*x + b
      const newActivations: number[] = [];
      
      for (let j = 0; j < weightLayer.weights.length; j++) {
        let sum = biasLayer.biases[j];
        
        for (let k = 0; k < activations.length; k++) {
          sum += weightLayer.weights[j][k] * activations[k];
        }
        
        newActivations.push(sum);
      }
      
      // Apply activation function
      const activationFn = this.activationFunctions.get(activationName);
      if (activationFn) {
        for (let j = 0; j < newActivations.length; j++) {
          newActivations[j] = activationFn.forward(newActivations[j]);
        }
      }
      
      // Apply batch normalization (simplified)
      if (network.architecture.batchNormalization[i]) {
        this.applyBatchNormalization(newActivations);
      }
      
      // Apply dropout during training (simplified)
      if (dropoutRate > 0 && network.status === 'training') {
        this.applyDropout(newActivations, dropoutRate);
      }
      
      activations = newActivations;
    }
    
    return activations;
  }

  private applyBatchNormalization(activations: number[]): void {
    // Simplified batch normalization
    const mean = activations.reduce((sum, val) => sum + val, 0) / activations.length;
    const variance = activations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / activations.length;
    const std = Math.sqrt(variance + 1e-8);
    
    for (let i = 0; i < activations.length; i++) {
      activations[i] = (activations[i] - mean) / std;
    }
  }

  private applyDropout(activations: number[], rate: number): void {
    for (let i = 0; i < activations.length; i++) {
      if (Math.random() < rate) {
        activations[i] = 0;
      } else {
        activations[i] /= (1 - rate); // Scale remaining neurons
      }
    }
  }

  // Training
  async trainNetwork(networkId: string): Promise<void> {
    const network = this.networks.get(networkId);
    if (!network || !this.trainingData) {
      throw new Error('Network or training data not found');
    }

    network.status = 'training';
    const startTime = Date.now();
    
    console.log(`Starting training for network ${networkId}`);
    
    for (let epoch = 0; epoch < network.hyperparameters.epochs; epoch++) {
      const epochStart = Date.now();
      
      // Shuffle training data
      const shuffledIndices = this.shuffleArray([...Array(this.trainingData.features.length).keys()]);
      
      let epochLoss = 0;
      let batchCount = 0;
      
      // Process in batches
      for (let i = 0; i < shuffledIndices.length; i += network.hyperparameters.batchSize) {
        const batchIndices = shuffledIndices.slice(i, i + network.hyperparameters.batchSize);
        const batchLoss = await this.trainBatch(network, batchIndices);
        
        epochLoss += batchLoss;
        batchCount++;
      }
      
      // Calculate validation loss
      const validationLoss = this.calculateValidationLoss(network);
      
      // Record epoch
      const epochDuration = Date.now() - epochStart;
      network.trainingHistory.push({
        epoch,
        trainingLoss: epochLoss / batchCount,
        validationLoss,
        learningRate: network.hyperparameters.learningRate,
        duration: epochDuration,
        timestamp: new Date()
      });
      
      // Early stopping check
      if (this.shouldEarlyStop(network)) {
        console.log(`Early stopping at epoch ${epoch} for network ${networkId}`);
        break;
      }
      
      // Learning rate decay
      if (epoch % 20 === 0 && epoch > 0) {
        network.hyperparameters.learningRate *= 0.9;
      }
    }
    
    // Update performance metrics
    this.updateNetworkPerformance(network);
    
    network.status = 'ready';
    network.lastTrained = new Date();
    
    const trainingTime = Date.now() - startTime;
    console.log(`Training completed for network ${networkId} in ${trainingTime}ms`);
  }

  private async trainBatch(network: NeuralNetwork, batchIndices: number[]): Promise<number> {
    if (!this.trainingData) return 0;
    
    let totalLoss = 0;
    const gradients = this.initializeGradients(network);
    
    // Forward and backward pass for each sample in batch
    for (const index of batchIndices) {
      const features = this.trainingData.features[index];
      const target = this.trainingData.targets[index];
      
      // Forward pass
      const prediction = this.forwardPass(network, features)[0];
      
      // Calculate loss
      const loss = Math.pow(prediction - target, 2) / 2; // MSE
      totalLoss += loss;
      
      // Backward pass (simplified gradient calculation)
      this.accumulateGradients(network, gradients, features, target, prediction);
    }
    
    // Apply gradients
    this.applyGradients(network, gradients, batchIndices.length);
    
    return totalLoss / batchIndices.length;
  }

  private initializeGradients(network: NeuralNetwork): any {
    const gradients = {
      weights: [],
      biases: []
    };
    
    for (let i = 0; i < network.weights.length; i++) {
      const weightGradients: number[][] = [];
      for (let j = 0; j < network.weights[i].weights.length; j++) {
        weightGradients.push(new Array(network.weights[i].weights[j].length).fill(0));
      }
      gradients.weights.push(weightGradients);
      
      gradients.biases.push(new Array(network.biases[i].biases.length).fill(0));
    }
    
    return gradients;
  }

  private accumulateGradients(
    network: NeuralNetwork, 
    gradients: any, 
    features: number[], 
    target: number, 
    prediction: number
  ): void {
    // Simplified backpropagation
    const error = prediction - target;
    
    // This is a simplified version - in practice, you'd implement full backpropagation
    // through all layers with proper chain rule application
    
    // For the output layer
    const outputLayerIndex = network.weights.length - 1;
    const outputError = error;
    
    // Update output layer gradients
    for (let i = 0; i < gradients.weights[outputLayerIndex].length; i++) {
      for (let j = 0; j < gradients.weights[outputLayerIndex][i].length; j++) {
        gradients.weights[outputLayerIndex][i][j] += outputError * features[j];
      }
      gradients.biases[outputLayerIndex][i] += outputError;
    }
    
    // Propagate error backward (simplified)
    for (let layer = outputLayerIndex - 1; layer >= 0; layer--) {
      for (let i = 0; i < gradients.weights[layer].length; i++) {
        for (let j = 0; j < gradients.weights[layer][i].length; j++) {
          gradients.weights[layer][i][j] += outputError * 0.1; // Simplified
        }
        gradients.biases[layer][i] += outputError * 0.1;
      }
    }
  }

  private applyGradients(network: NeuralNetwork, gradients: any, batchSize: number): void {
    const lr = network.hyperparameters.learningRate;
    
    // Apply weight updates
    for (let i = 0; i < network.weights.length; i++) {
      for (let j = 0; j < network.weights[i].weights.length; j++) {
        for (let k = 0; k < network.weights[i].weights[j].length; k++) {
          const gradient = gradients.weights[i][j][k] / batchSize;
          
          // Add L2 regularization
          const l2Penalty = network.hyperparameters.regularization.l2 * network.weights[i].weights[j][k];
          
          network.weights[i].weights[j][k] -= lr * (gradient + l2Penalty);
        }
      }
      
      // Update biases
      for (let j = 0; j < network.biases[i].biases.length; j++) {
        const gradient = gradients.biases[i][j] / batchSize;
        network.biases[i].biases[j] -= lr * gradient;
      }
    }
  }

  private calculateValidationLoss(network: NeuralNetwork): number {
    if (!this.trainingData) return 0;
    
    let totalLoss = 0;
    const validationData = this.trainingData.validation;
    
    for (let i = 0; i < validationData.features.length; i++) {
      const prediction = this.forwardPass(network, validationData.features[i])[0];
      const target = validationData.targets[i];
      totalLoss += Math.pow(prediction - target, 2);
    }
    
    return totalLoss / validationData.features.length;
  }

  private shouldEarlyStop(network: NeuralNetwork): boolean {
    if (network.trainingHistory.length < 10) return false;
    
    const recent = network.trainingHistory.slice(-5);
    const earlier = network.trainingHistory.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, epoch) => sum + epoch.validationLoss, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, epoch) => sum + epoch.validationLoss, 0) / earlier.length;
    
    return recentAvg > earlierAvg; // Stop if validation loss is increasing
  }

  private updateNetworkPerformance(network: NeuralNetwork): void {
    if (!this.trainingData) return;
    
    const validationData = this.trainingData.validation;
    const predictions: number[] = [];
    const targets: number[] = [];
    
    // Get predictions for validation set
    for (let i = 0; i < validationData.features.length; i++) {
      const prediction = this.forwardPass(network, validationData.features[i])[0];
      predictions.push(prediction);
      targets.push(validationData.targets[i]);
    }
    
    // Calculate metrics
    const mse = this.calculateMSE(predictions, targets);
    const mae = this.calculateMAE(predictions, targets);
    const mape = this.calculateMAPE(predictions, targets);
    const r2 = this.calculateR2(predictions, targets);
    
    network.performance = {
      mse,
      mae,
      mape,
      r2Score: r2,
      accuracy: 1 - (mse / this.calculateVariance(targets)),
      validationLoss: mse,
      trainingLoss: network.trainingHistory[network.trainingHistory.length - 1]?.trainingLoss || 0,
      convergenceSpeed: network.trainingHistory.length,
      generalizationGap: Math.abs(
        network.trainingHistory[network.trainingHistory.length - 1]?.trainingLoss || 0 - mse
      )
    };
  }

  // Ensemble Creation and Management
  async createEnsemble(networkIds: string[], name: string): Promise<EnsembleConfig> {
    const ensembleId = `ensemble_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate networks exist and are ready
    const validNetworks = networkIds.filter(id => {
      const network = this.networks.get(id);
      return network && network.status === 'ready';
    });
    
    if (validNetworks.length === 0) {
      throw new Error('No valid networks provided for ensemble');
    }
    
    const ensemble: EnsembleConfig = {
      id: ensembleId,
      name,
      networks: validNetworks,
      weightingStrategy: 'performance',
      networkWeights: [],
      diversityMetrics: this.calculateDiversityMetrics(validNetworks),
      performance: this.initializeEnsemblePerformance(),
      status: 'assembling',
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    // Calculate initial network weights based on performance
    this.calculateNetworkWeights(ensemble);
    
    // Train meta-learner if using stacking
    if (ensemble.weightingStrategy === 'stacking') {
      await this.trainMetaLearner(ensemble);
    }
    
    // Update ensemble performance
    this.updateEnsemblePerformance(ensemble);
    
    ensemble.status = 'ready';
    this.ensembles.set(ensembleId, ensemble);
    
    return ensemble;
  }

  private calculateDiversityMetrics(networkIds: string[]): DiversityMetrics {
    if (!this.trainingData) {
      return {
        correlationMatrix: [],
        averageCorrelation: 0,
        disagreementRate: 0,
        entropyDiversity: 0,
        ambiguityDecomposition: 0
      };
    }
    
    const networks = networkIds.map(id => this.networks.get(id)!);
    const validationData = this.trainingData.validation;
    
    // Get predictions from all networks
    const allPredictions: number[][] = [];
    
    for (const network of networks) {
      const networkPredictions: number[] = [];
      for (const features of validationData.features) {
        const prediction = this.forwardPass(network, features)[0];
        networkPredictions.push(prediction);
      }
      allPredictions.push(networkPredictions);
    }
    
    // Calculate correlation matrix
    const correlationMatrix: number[][] = [];
    for (let i = 0; i < networks.length; i++) {
      correlationMatrix[i] = [];
      for (let j = 0; j < networks.length; j++) {
        correlationMatrix[i][j] = this.calculateCorrelation(allPredictions[i], allPredictions[j]);
      }
    }
    
    // Calculate average correlation (excluding diagonal)
    let totalCorrelation = 0;
    let count = 0;
    for (let i = 0; i < networks.length; i++) {
      for (let j = i + 1; j < networks.length; j++) {
        totalCorrelation += correlationMatrix[i][j];
        count++;
      }
    }
    const averageCorrelation = count > 0 ? totalCorrelation / count : 0;
    
    // Calculate disagreement rate
    let disagreements = 0;
    for (let i = 0; i < validationData.features.length; i++) {
      const predictions = allPredictions.map(preds => preds[i]);
      const variance = this.calculateVariance(predictions);
      if (variance > 1000) disagreements++; // Threshold for disagreement
    }
    const disagreementRate = disagreements / validationData.features.length;
    
    return {
      correlationMatrix,
      averageCorrelation,
      disagreementRate,
      entropyDiversity: 1 - averageCorrelation, // Simplified entropy
      ambiguityDecomposition: disagreementRate
    };
  }

  private calculateNetworkWeights(ensemble: EnsembleConfig): void {
    const networks = ensemble.networks.map(id => this.networks.get(id)!);
    
    switch (ensemble.weightingStrategy) {
      case 'equal':
        ensemble.networkWeights = new Array(networks.length).fill(1 / networks.length);
        break;
        
      case 'performance':
        const performances = networks.map(network => network.performance.r2Score);
        const totalPerformance = performances.reduce((sum, perf) => sum + Math.max(0, perf), 0);
        
        if (totalPerformance > 0) {
          ensemble.networkWeights = performances.map(perf => Math.max(0, perf) / totalPerformance);
        } else {
          ensemble.networkWeights = new Array(networks.length).fill(1 / networks.length);
        }
        break;
        
      case 'dynamic':
        // Dynamic weighting based on recent performance and diversity
        const diversityWeights = this.calculateDiversityWeights(ensemble);
        const performanceWeights = networks.map(network => network.performance.r2Score);
        
        ensemble.networkWeights = [];
        for (let i = 0; i < networks.length; i++) {
          const weight = 0.7 * performanceWeights[i] + 0.3 * diversityWeights[i];
          ensemble.networkWeights.push(weight);
        }
        
        // Normalize weights
        const totalWeight = ensemble.networkWeights.reduce((sum, w) => sum + w, 0);
        ensemble.networkWeights = ensemble.networkWeights.map(w => w / totalWeight);
        break;
        
      default:
        ensemble.networkWeights = new Array(networks.length).fill(1 / networks.length);
    }
  }

  private calculateDiversityWeights(ensemble: EnsembleConfig): number[] {
    const correlationMatrix = ensemble.diversityMetrics.correlationMatrix;
    const weights: number[] = [];
    
    for (let i = 0; i < ensemble.networks.length; i++) {
      // Weight inversely proportional to average correlation with other networks
      let avgCorrelation = 0;
      let count = 0;
      
      for (let j = 0; j < ensemble.networks.length; j++) {
        if (i !== j) {
          avgCorrelation += Math.abs(correlationMatrix[i][j]);
          count++;
        }
      }
      
      avgCorrelation = count > 0 ? avgCorrelation / count : 0;
      weights.push(1 - avgCorrelation); // Higher weight for lower correlation
    }
    
    return weights;
  }

  private async trainMetaLearner(ensemble: EnsembleConfig): Promise<void> {
    if (!this.trainingData) return;
    
    const networks = ensemble.networks.map(id => this.networks.get(id)!);
    const validationData = this.trainingData.validation;
    
    // Generate meta-features (predictions from base networks)
    const metaFeatures: number[][] = [];
    
    for (let i = 0; i < validationData.features.length; i++) {
      const networkPredictions: number[] = [];
      
      for (const network of networks) {
        const prediction = this.forwardPass(network, validationData.features[i])[0];
        networkPredictions.push(prediction);
      }
      
      metaFeatures.push(networkPredictions);
    }
    
    // Train simple linear meta-learner
    const metaLearner: MetaLearner = {
      type: 'linear',
      weights: new Array(networks.length).fill(1 / networks.length),
      bias: 0,
      trained: false,
      performance: 0
    };
    
    // Simple least squares for linear meta-learner
    for (let epoch = 0; epoch < 100; epoch++) {
      let totalLoss = 0;
      
      for (let i = 0; i < metaFeatures.length; i++) {
        const prediction = metaLearner.bias + 
          metaFeatures[i].reduce((sum, feat, idx) => sum + feat * metaLearner.weights[idx], 0);
        const target = validationData.targets[i];
        const error = prediction - target;
        
        totalLoss += error * error;
        
        // Gradient descent updates
        metaLearner.bias -= 0.001 * error;
        for (let j = 0; j < metaLearner.weights.length; j++) {
          metaLearner.weights[j] -= 0.001 * error * metaFeatures[i][j];
        }
      }
      
      metaLearner.performance = Math.sqrt(totalLoss / metaFeatures.length);
    }
    
    metaLearner.trained = true;
    ensemble.metaLearner = metaLearner;
  }

  private updateEnsemblePerformance(ensemble: EnsembleConfig): void {
    if (!this.trainingData) return;
    
    const validationData = this.trainingData.validation;
    const predictions: number[] = [];
    
    // Get ensemble predictions
    for (const features of validationData.features) {
      const prediction = this.getEnsemblePrediction(ensemble, features);
      predictions.push(prediction);
    }
    
    const targets = validationData.targets;
    
    // Calculate metrics
    const mse = this.calculateMSE(predictions, targets);
    const mae = this.calculateMAE(predictions, targets);
    const mape = this.calculateMAPE(predictions, targets);
    const r2 = this.calculateR2(predictions, targets);
    
    // Find best individual network performance
    const individualPerformances = ensemble.networks.map(id => {
      const network = this.networks.get(id)!;
      return network.performance.r2Score;
    });
    const bestIndividual = Math.max(...individualPerformances);
    
    ensemble.performance = {
      mse,
      mae,
      mape,
      r2Score: r2,
      improvementOverBest: r2 - bestIndividual,
      consistencyScore: 1 - (mse / this.calculateVariance(targets)),
      confidenceScore: 1 - ensemble.diversityMetrics.averageCorrelation
    };
  }

  private getEnsemblePrediction(ensemble: EnsembleConfig, features: number[]): number {
    const networks = ensemble.networks.map(id => this.networks.get(id)!);
    
    if (ensemble.metaLearner && ensemble.metaLearner.trained) {
      // Use meta-learner for stacking
      const networkPredictions = networks.map(network => 
        this.forwardPass(network, features)[0]
      );
      
      return ensemble.metaLearner.bias + 
        networkPredictions.reduce((sum, pred, idx) => 
          sum + pred * ensemble.metaLearner.weights[idx], 0
        );
    } else {
      // Weighted average of network predictions
      const networkPredictions = networks.map(network => 
        this.forwardPass(network, features)[0]
      );
      
      return networkPredictions.reduce((sum, pred, idx) => 
        sum + pred * ensemble.networkWeights[idx], 0
      );
    }
  }

  // Price Prediction Interface
  async predictPrice(listing: Listing, ensembleId?: string): Promise<PricePrediction> {
    const features = this.extractFeatures(listing);
    
    if (ensembleId) {
      return this.predictWithEnsemble(listing, features, ensembleId);
    } else {
      // Use best performing ensemble or network
      const bestEnsemble = this.getBestEnsemble();
      if (bestEnsemble) {
        return this.predictWithEnsemble(listing, features, bestEnsemble.id);
      } else {
        const bestNetwork = this.getBestNetwork();
        if (bestNetwork) {
          return this.predictWithNetwork(listing, features, bestNetwork.id);
        }
      }
    }
    
    throw new Error('No trained models available for prediction');
  }

  private async predictWithEnsemble(listing: Listing, features: number[], ensembleId: string): Promise<PricePrediction> {
    const ensemble = this.ensembles.get(ensembleId);
    if (!ensemble) {
      throw new Error('Ensemble not found');
    }
    
    const networks = ensemble.networks.map(id => this.networks.get(id)!);
    const networkContributions: NetworkContribution[] = [];
    
    // Get predictions from each network
    for (let i = 0; i < networks.length; i++) {
      const network = networks[i];
      const prediction = this.forwardPass(network, features)[0];
      
      networkContributions.push({
        networkId: network.id,
        prediction,
        weight: ensemble.networkWeights[i],
        confidence: network.performance.r2Score,
        specialty: network.specialty
      });
    }
    
    // Get ensemble prediction
    const predictedPrice = this.getEnsemblePrediction(ensemble, features);
    
    // Calculate confidence and uncertainty
    const confidence = ensemble.performance.confidenceScore;
    const uncertainty = this.calculatePredictionUncertainty(ensemble, features);
    
    return {
      propertyId: listing.id,
      predictedPrice: Math.round(predictedPrice),
      confidence,
      priceRange: {
        min: Math.round(predictedPrice - uncertainty.totalUncertainty),
        max: Math.round(predictedPrice + uncertainty.totalUncertainty)
      },
      contributingFactors: this.analyzeContributingFactors(listing, features),
      networkContributions,
      marketComparison: await this.getMarketComparison(listing, predictedPrice),
      priceBreakdown: this.calculatePriceBreakdown(listing, predictedPrice),
      uncertainty
    };
  }

  private async predictWithNetwork(listing: Listing, features: number[], networkId: string): Promise<PricePrediction> {
    const network = this.networks.get(networkId);
    if (!network) {
      throw new Error('Network not found');
    }
    
    const prediction = this.forwardPass(network, features)[0];
    const confidence = network.performance.r2Score;
    const uncertainty = confidence * 0.2 * prediction; // Simplified uncertainty
    
    return {
      propertyId: listing.id,
      predictedPrice: Math.round(prediction),
      confidence,
      priceRange: {
        min: Math.round(prediction - uncertainty),
        max: Math.round(prediction + uncertainty)
      },
      contributingFactors: this.analyzeContributingFactors(listing, features),
      networkContributions: [{
        networkId: network.id,
        prediction,
        weight: 1.0,
        confidence,
        specialty: network.specialty
      }],
      marketComparison: await this.getMarketComparison(listing, prediction),
      priceBreakdown: this.calculatePriceBreakdown(listing, prediction),
      uncertainty: {
        modelUncertainty: uncertainty * 0.6,
        dataUncertainty: uncertainty * 0.4,
        totalUncertainty: uncertainty,
        predictionInterval: {
          lower: prediction - uncertainty * 1.96,
          upper: prediction + uncertainty * 1.96
        },
        reliabilityScore: confidence
      }
    };
  }

  private calculatePredictionUncertainty(ensemble: EnsembleConfig, features: number[]): UncertaintyMetrics {
    const networks = ensemble.networks.map(id => this.networks.get(id)!);
    const predictions = networks.map(network => this.forwardPass(network, features)[0]);
    
    // Model uncertainty (epistemic) - disagreement between models
    const meanPrediction = predictions.reduce((sum, pred) => sum + pred, 0) / predictions.length;
    const modelVariance = predictions.reduce((sum, pred) => sum + Math.pow(pred - meanPrediction, 2), 0) / predictions.length;
    const modelUncertainty = Math.sqrt(modelVariance);
    
    // Data uncertainty (aleatoric) - inherent noise in data
    const avgModelConfidence = networks.reduce((sum, network) => sum + network.performance.r2Score, 0) / networks.length;
    const dataUncertainty = (1 - avgModelConfidence) * meanPrediction * 0.1;
    
    const totalUncertainty = Math.sqrt(modelUncertainty * modelUncertainty + dataUncertainty * dataUncertainty);
    
    return {
      modelUncertainty,
      dataUncertainty,
      totalUncertainty,
      predictionInterval: {
        lower: meanPrediction - totalUncertainty * 1.96,
        upper: meanPrediction + totalUncertainty * 1.96
      },
      reliabilityScore: avgModelConfidence
    };
  }

  // Training Loop
  private startTrainingLoop(): void {
    setInterval(async () => {
      if (!this.isTraining && this.trainingQueue.length > 0) {
        this.isTraining = true;
        const networkId = this.trainingQueue.shift()!;
        
        try {
          await this.trainNetwork(networkId);
        } catch (error) {
          console.error('Training failed:', error);
        } finally {
          this.isTraining = false;
        }
      }
    }, 1000);
  }

  // Helper Methods
  private initializeActivationFunctions(): void {
    this.activationFunctions.set('relu', {
      name: 'relu',
      forward: (x: number) => Math.max(0, x),
      derivative: (x: number) => x > 0 ? 1 : 0
    });
    
    this.activationFunctions.set('sigmoid', {
      name: 'sigmoid',
      forward: (x: number) => 1 / (1 + Math.exp(-x)),
      derivative: (x: number) => {
        const s = 1 / (1 + Math.exp(-x));
        return s * (1 - s);
      }
    });
    
    this.activationFunctions.set('tanh', {
      name: 'tanh',
      forward: (x: number) => Math.tanh(x),
      derivative: (x: number) => 1 - Math.tanh(x) * Math.tanh(x)
    });
    
    this.activationFunctions.set('linear', {
      name: 'linear',
      forward: (x: number) => x,
      derivative: (x: number) => 1
    });
  }

  private initializeNetworks(): void {
    // Create diverse network architectures
    const architectures = [
      { hiddenLayers: [256, 128, 64], specialty: 'price_prediction' as const, name: 'Deep Price Predictor' },
      { hiddenLayers: [128, 64], specialty: 'feature_extraction' as const, name: 'Feature Extractor' },
      { hiddenLayers: [64, 32, 16], specialty: 'market_analysis' as const, name: 'Market Analyzer' },
      { hiddenLayers: [512, 256, 128, 64], specialty: 'risk_assessment' as const, name: 'Risk Assessor' }
    ];
    
    architectures.forEach((arch, index) => {
      this.createNeuralNetwork({
        name: arch.name,
        specialty: arch.specialty,
        architecture: {
          ...this.getDefaultArchitecture(),
          hiddenLayers: arch.hiddenLayers
        }
      });
    });
    
    // Simulate training data
    this.generateSyntheticTrainingData();
  }

  private generateSyntheticTrainingData(): void {
    const numSamples = 1000;
    const numFeatures = 50;
    
    const features: number[][] = [];
    const targets: number[] = [];
    
    for (let i = 0; i < numSamples; i++) {
      const sampleFeatures = new Array(numFeatures).fill(0).map(() => Math.random());
      
      // Generate realistic price based on features
      const basePrice = 200000;
      const sizeMultiplier = sampleFeatures[1] * 300000; // sqft effect
      const locationMultiplier = sampleFeatures[5] * 100000; // location effect
      const conditionMultiplier = sampleFeatures[14] * 50000; // condition effect
      const noise = (Math.random() - 0.5) * 20000;
      
      const price = basePrice + sizeMultiplier + locationMultiplier + conditionMultiplier + noise;
      
      features.push(sampleFeatures);
      targets.push(Math.max(50000, price));
    }
    
    // Split into training and validation
    const splitIndex = Math.floor(numSamples * 0.8);
    
    this.trainingData = {
      features: features.slice(0, splitIndex),
      targets: targets.slice(0, splitIndex),
      validation: {
        features: features.slice(splitIndex),
        targets: targets.slice(splitIndex)
      },
      metadata: {
        featureNames: new Array(numFeatures).fill(0).map((_, i) => `feature_${i}`),
        scalingFactors: new Array(numFeatures).fill(1),
        targetScaling: { mean: 300000, std: 100000 }
      }
    };
  }

  private extractFeatures(listing: Listing): number[] {
    // Extract and normalize features from listing
    const features: number[] = new Array(50).fill(0);
    
    features[0] = (listing.price || 0) / 1000000; // Normalize price
    features[1] = (listing.sqft || 0) / 5000; // Normalize sqft
    features[2] = (listing.bedrooms || 0) / 6; // Normalize bedrooms
    features[3] = (listing.bathrooms || 0) / 5; // Normalize bathrooms
    features[4] = ((listing.yearBuilt || 2000) - 1950) / 70; // Normalize year
    features[5] = Math.random(); // Location score (would be calculated)
    features[6] = Math.random(); // School rating
    features[7] = Math.random(); // Crime rate
    features[8] = Math.random(); // Commute time
    features[9] = listing.flags?.va_eligible ? 1 : 0;
    features[10] = listing.creativeFinancing?.ownerFinancing ? 1 : 0;
    // ... fill remaining features with property characteristics
    
    return features;
  }

  private analyzeContributingFactors(listing: Listing, features: number[]): ContributingFactor[] {
    return [
      {
        factor: 'Property Size',
        importance: 0.3,
        impact: features[1] * 100000,
        confidence: 0.9
      },
      {
        factor: 'Location Quality',
        importance: 0.25,
        impact: features[5] * 80000,
        confidence: 0.85
      },
      {
        factor: 'Property Age',
        importance: 0.2,
        impact: features[4] * 50000,
        confidence: 0.8
      },
      {
        factor: 'VA Eligibility',
        importance: 0.15,
        impact: features[9] * 30000,
        confidence: 0.95
      },
      {
        factor: 'Market Conditions',
        importance: 0.1,
        impact: Math.random() * 20000,
        confidence: 0.7
      }
    ];
  }

  private async getMarketComparison(listing: Listing, predictedPrice: number): Promise<MarketComparison> {
    // Simulate market comparison
    return {
      marketMedian: 350000,
      percentileRank: 65,
      comparableProperties: 25,
      marketTrend: 'up',
      trendStrength: 0.7
    };
  }

  private calculatePriceBreakdown(listing: Listing, predictedPrice: number): PriceBreakdown {
    return {
      baseValue: predictedPrice * 0.6,
      locationPremium: predictedPrice * 0.15,
      sizePremium: predictedPrice * 0.1,
      conditionAdjustment: predictedPrice * 0.05,
      featurePremiums: {
        'pool': predictedPrice * 0.03,
        'garage': predictedPrice * 0.02
      },
      marketAdjustment: predictedPrice * 0.05,
      veteranDiscount: listing.flags?.va_eligible ? predictedPrice * -0.02 : 0
    };
  }

  // Statistical Helper Methods
  private gaussianRandom(): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateMSE(predictions: number[], targets: number[]): number {
    const sumSquaredError = predictions.reduce((sum, pred, i) => 
      sum + Math.pow(pred - targets[i], 2), 0
    );
    return sumSquaredError / predictions.length;
  }

  private calculateMAE(predictions: number[], targets: number[]): number {
    const sumAbsError = predictions.reduce((sum, pred, i) => 
      sum + Math.abs(pred - targets[i]), 0
    );
    return sumAbsError / predictions.length;
  }

  private calculateMAPE(predictions: number[], targets: number[]): number {
    const sumPercentError = predictions.reduce((sum, pred, i) => {
      if (targets[i] !== 0) {
        return sum + Math.abs((pred - targets[i]) / targets[i]);
      }
      return sum;
    }, 0);
    return (sumPercentError / predictions.length) * 100;
  }

  private calculateR2(predictions: number[], targets: number[]): number {
    const targetMean = targets.reduce((sum, val) => sum + val, 0) / targets.length;
    
    const totalSumSquares = targets.reduce((sum, val) => sum + Math.pow(val - targetMean, 2), 0);
    const residualSumSquares = predictions.reduce((sum, pred, i) => 
      sum + Math.pow(targets[i] - pred, 2), 0
    );
    
    return 1 - (residualSumSquares / totalSumSquares);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private initializePerformance(): NetworkPerformance {
    return {
      mse: 0,
      mae: 0,
      mape: 0,
      r2Score: 0,
      accuracy: 0,
      validationLoss: 0,
      trainingLoss: 0,
      convergenceSpeed: 0,
      generalizationGap: 0
    };
  }

  private initializeEnsemblePerformance(): EnsemblePerformance {
    return {
      mse: 0,
      mae: 0,
      mape: 0,
      r2Score: 0,
      improvementOverBest: 0,
      consistencyScore: 0,
      confidenceScore: 0
    };
  }

  private getBestEnsemble(): EnsembleConfig | null {
    let best: EnsembleConfig | null = null;
    let bestScore = -1;
    
    for (const ensemble of this.ensembles.values()) {
      if (ensemble.status === 'ready' && ensemble.performance.r2Score > bestScore) {
        best = ensemble;
        bestScore = ensemble.performance.r2Score;
      }
    }
    
    return best;
  }

  private getBestNetwork(): NeuralNetwork | null {
    let best: NeuralNetwork | null = null;
    let bestScore = -1;
    
    for (const network of this.networks.values()) {
      if (network.status === 'ready' && network.performance.r2Score > bestScore) {
        best = network;
        bestScore = network.performance.r2Score;
      }
    }
    
    return best;
  }

  // Public Interface
  getNetworks(): NeuralNetwork[] {
    return Array.from(this.networks.values());
  }

  getEnsembles(): EnsembleConfig[] {
    return Array.from(this.ensembles.values());
  }

  getNetwork(networkId: string): NeuralNetwork | null {
    return this.networks.get(networkId) || null;
  }

  getEnsemble(ensembleId: string): EnsembleConfig | null {
    return this.ensembles.get(ensembleId) || null;
  }

  getEngineStats(): {
    totalNetworks: number;
    readyNetworks: number;
    totalEnsembles: number;
    bestR2Score: number;
    averageAccuracy: number;
    trainingStatus: string;
  } {
    const networks = Array.from(this.networks.values());
    const ensembles = Array.from(this.ensembles.values());
    
    const readyNetworks = networks.filter(n => n.status === 'ready').length;
    const allPerformances = [...networks, ...ensembles].map(model => 
      'performance' in model ? model.performance.r2Score : model.performance.r2Score
    );
    
    return {
      totalNetworks: networks.length,
      readyNetworks,
      totalEnsembles: ensembles.length,
      bestR2Score: allPerformances.length > 0 ? Math.max(...allPerformances) : 0,
      averageAccuracy: allPerformances.length > 0 ? 
        allPerformances.reduce((sum, score) => sum + score, 0) / allPerformances.length : 0,
      trainingStatus: this.isTraining ? 'training' : 'idle'
    };
  }

  async retrainAllNetworks(): Promise<void> {
    const networkIds = Array.from(this.networks.keys());
    this.trainingQueue.push(...networkIds);
  }

  clearTrainingData(): void {
    this.trainingData = null;
  }
}

export const neuralEnsembleEngine = new NeuralEnsembleEngine();
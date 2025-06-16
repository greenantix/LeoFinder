import { Listing } from '../types/listing';

interface ModelMetrics {
  modelId: string;
  timestamp: Date;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc?: number;
  mse: number; // Mean Squared Error
  mae: number; // Mean Absolute Error
  latency: number; // Inference time in ms
  throughput: number; // Predictions per second
  memoryUsage: number; // MB
  cpuUsage: number; // Percentage
  errorRate: number; // Percentage of failed predictions
  dataVolume: number; // Number of predictions
}

interface AlertRule {
  ruleId: string;
  name: string;
  description: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'percentage_change';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldownMinutes: number;
  targetModels: string[]; // Empty array means all models
  actions: AlertAction[];
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

interface AlertAction {
  type: 'email' | 'webhook' | 'auto_retrain' | 'model_rollback' | 'scaling' | 'notification';
  config: any;
  enabled: boolean;
}

interface Alert {
  alertId: string;
  ruleId: string;
  modelId: string;
  severity: AlertRule['severity'];
  message: string;
  metric: string;
  actualValue: number;
  threshold: number;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  actions: ActionResult[];
}

interface ActionResult {
  actionType: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: Date;
  details?: string;
  error?: string;
}

interface DataDriftMetrics {
  modelId: string;
  timestamp: Date;
  featureDrift: FeatureDriftInfo[];
  labelDrift?: LabelDriftInfo;
  populationStabilityIndex: number; // PSI
  klDivergence: number;
  wasserstein: number;
  overallDriftScore: number; // 0-1, higher means more drift
  recommendation: 'no_action' | 'monitor' | 'investigate' | 'retrain';
}

interface FeatureDriftInfo {
  featureName: string;
  psi: number; // Population Stability Index
  klDivergence: number;
  statisticalTest: StatisticalTestResult;
  driftScore: number; // 0-1
  status: 'stable' | 'warning' | 'drifting';
}

interface LabelDriftInfo {
  distributionChange: number;
  newLabels: string[];
  missingLabels: string[];
  frequencyChanges: Record<string, number>;
}

interface StatisticalTestResult {
  testName: 'ks_test' | 'chi_square' | 'jensen_shannon';
  pValue: number;
  statistic: number;
  significant: boolean;
}

interface MonitoringDashboard {
  dashboardId: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: LayoutConfig;
  refreshInterval: number; // seconds
  timeRange: TimeRange;
  filters: DashboardFilter[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
}

interface DashboardWidget {
  widgetId: string;
  type: 'line_chart' | 'bar_chart' | 'metric_card' | 'alert_list' | 'model_comparison' | 'drift_heatmap';
  title: string;
  metrics: string[];
  models: string[];
  timeRange?: TimeRange;
  config: WidgetConfig;
  position: { x: number; y: number; width: number; height: number };
}

interface LayoutConfig {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

interface TimeRange {
  start: Date;
  end: Date;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

interface DashboardFilter {
  field: string;
  operator: 'equals' | 'contains' | 'in' | 'between';
  value: any;
}

interface WidgetConfig {
  aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
  groupBy?: string[];
  threshold?: number;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
}

interface PerformanceBenchmark {
  benchmarkId: string;
  name: string;
  modelType: string;
  dataset: string;
  metrics: BenchmarkMetrics;
  baseline: ModelMetrics;
  createdAt: Date;
  updatedAt: Date;
}

interface BenchmarkMetrics {
  expectedAccuracy: { min: number; target: number; max: number };
  expectedLatency: { min: number; target: number; max: number };
  expectedThroughput: { min: number; target: number; max: number };
  expectedMemory: { min: number; target: number; max: number };
}

interface ModelComparison {
  comparisonId: string;
  name: string;
  modelIds: string[];
  timeRange: TimeRange;
  metrics: string[];
  results: ComparisonResult[];
  createdAt: Date;
}

interface ComparisonResult {
  metric: string;
  modelResults: Record<string, number>;
  winner: string;
  confidence: number;
  significantDifference: boolean;
}

interface AutoRetrainConfig {
  modelId: string;
  enabled: boolean;
  triggers: RetrainTrigger[];
  schedule?: RetrainSchedule;
  dataValidation: DataValidationRules;
  performanceThresholds: PerformanceThresholds;
  rollbackCriteria: RollbackCriteria;
}

interface RetrainTrigger {
  type: 'performance_degradation' | 'data_drift' | 'time_based' | 'data_volume';
  threshold: number;
  metric?: string;
  enabled: boolean;
}

interface RetrainSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  timezone: string;
  enabled: boolean;
}

interface DataValidationRules {
  minDataSize: number;
  maxMissingValues: number;
  featureValidation: FeatureValidation[];
  labelValidation?: LabelValidation;
}

interface FeatureValidation {
  featureName: string;
  dataType: 'numeric' | 'categorical' | 'text' | 'datetime';
  required: boolean;
  range?: { min: number; max: number };
  allowedValues?: any[];
  pattern?: string;
}

interface LabelValidation {
  allowedLabels: string[];
  balanceThreshold: number; // Minimum percentage for each class
}

interface PerformanceThresholds {
  minAccuracy: number;
  maxLatency: number;
  maxMemoryUsage: number;
  minThroughput: number;
}

interface RollbackCriteria {
  enabled: boolean;
  performanceDrop: number; // Percentage drop that triggers rollback
  errorRateIncrease: number; // Percentage increase that triggers rollback
  evaluationPeriod: number; // Minutes to evaluate new model
}

export class PerformanceMonitoringEngine {
  private modelMetrics = new Map<string, ModelMetrics[]>();
  private alertRules = new Map<string, AlertRule>();
  private activeAlerts = new Map<string, Alert>();
  private driftMetrics = new Map<string, DataDriftMetrics[]>();
  private dashboards = new Map<string, MonitoringDashboard>();
  private benchmarks = new Map<string, PerformanceBenchmark>();
  private autoRetrainConfigs = new Map<string, AutoRetrainConfig>();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultAlertRules();
    this.initializeDefaultDashboard();
    this.startMonitoring();
  }

  // Metrics Collection
  async recordModelMetrics(modelId: string, metrics: Partial<ModelMetrics>): Promise<void> {
    const timestamp = new Date();
    
    const fullMetrics: ModelMetrics = {
      modelId,
      timestamp,
      accuracy: 0.8,
      precision: 0.75,
      recall: 0.82,
      f1Score: 0.78,
      mse: 0.15,
      mae: 0.12,
      latency: 50,
      throughput: 100,
      memoryUsage: 256,
      cpuUsage: 25,
      errorRate: 0.02,
      dataVolume: 1000,
      ...metrics
    };

    // Store metrics
    const existingMetrics = this.modelMetrics.get(modelId) || [];
    existingMetrics.push(fullMetrics);
    
    // Keep only last 10,000 metrics per model
    if (existingMetrics.length > 10000) {
      existingMetrics.splice(0, existingMetrics.length - 10000);
    }
    
    this.modelMetrics.set(modelId, existingMetrics);

    // Check alert rules
    await this.checkAlertRules(modelId, fullMetrics);

    // Calculate data drift if needed
    if (existingMetrics.length % 100 === 0) { // Check drift every 100 predictions
      await this.calculateDataDrift(modelId);
    }

    // Check auto-retrain triggers
    await this.checkAutoRetrainTriggers(modelId, fullMetrics);
  }

  // Alert Management
  async createAlertRule(rule: Partial<AlertRule>): Promise<AlertRule> {
    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alertRule: AlertRule = {
      ruleId,
      name: rule.name || 'New Alert Rule',
      description: rule.description || '',
      metric: rule.metric || 'accuracy',
      condition: rule.condition || 'less_than',
      threshold: rule.threshold || 0.8,
      severity: rule.severity || 'medium',
      enabled: rule.enabled !== false,
      cooldownMinutes: rule.cooldownMinutes || 30,
      targetModels: rule.targetModels || [],
      actions: rule.actions || [],
      createdAt: new Date(),
      triggerCount: 0
    };

    this.alertRules.set(ruleId, alertRule);
    return alertRule;
  }

  async checkAlertRules(modelId: string, metrics: ModelMetrics): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;
      if (rule.targetModels.length > 0 && !rule.targetModels.includes(modelId)) continue;

      // Check cooldown
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
        if (timeSinceLastTrigger < cooldownMs) continue;
      }

      const metricValue = this.getMetricValue(metrics, rule.metric);
      const shouldTrigger = this.evaluateCondition(metricValue, rule.condition, rule.threshold);

      if (shouldTrigger) {
        await this.triggerAlert(rule, modelId, metricValue);
      }
    }
  }

  private async triggerAlert(rule: AlertRule, modelId: string, actualValue: number): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: Alert = {
      alertId,
      ruleId: rule.ruleId,
      modelId,
      severity: rule.severity,
      message: this.generateAlertMessage(rule, modelId, actualValue),
      metric: rule.metric,
      actualValue,
      threshold: rule.threshold,
      timestamp: new Date(),
      status: 'active',
      actions: []
    };

    this.activeAlerts.set(alertId, alert);
    
    // Update rule
    rule.lastTriggered = new Date();
    rule.triggerCount++;

    // Execute actions
    for (const action of rule.actions) {
      if (!action.enabled) continue;
      
      const actionResult = await this.executeAlertAction(action, alert);
      alert.actions.push(actionResult);
    }

    console.log(`[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`);
  }

  private async executeAlertAction(action: AlertAction, alert: Alert): Promise<ActionResult> {
    const result: ActionResult = {
      actionType: action.type,
      status: 'pending',
      timestamp: new Date()
    };

    try {
      switch (action.type) {
        case 'email':
          await this.sendEmailAlert(action.config, alert);
          result.status = 'success';
          result.details = 'Email sent successfully';
          break;
        
        case 'webhook':
          await this.sendWebhookAlert(action.config, alert);
          result.status = 'success';
          result.details = 'Webhook called successfully';
          break;
        
        case 'auto_retrain':
          await this.triggerAutoRetrain(alert.modelId);
          result.status = 'success';
          result.details = 'Auto-retrain triggered';
          break;
        
        case 'model_rollback':
          await this.triggerModelRollback(alert.modelId);
          result.status = 'success';
          result.details = 'Model rollback initiated';
          break;
        
        case 'scaling':
          await this.triggerAutoScaling(action.config, alert);
          result.status = 'success';
          result.details = 'Auto-scaling triggered';
          break;
        
        default:
          result.status = 'failed';
          result.error = `Unknown action type: ${action.type}`;
      }
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  // Data Drift Detection
  async calculateDataDrift(modelId: string): Promise<DataDriftMetrics> {
    const metrics = this.modelMetrics.get(modelId) || [];
    if (metrics.length < 200) {
      throw new Error('Insufficient data for drift calculation');
    }

    // Use last 100 samples as reference and previous 100 as comparison
    const referenceSamples = metrics.slice(-200, -100);
    const currentSamples = metrics.slice(-100);

    const featureDrift = await this.calculateFeatureDrift(referenceSamples, currentSamples);
    const psi = this.calculatePSI(referenceSamples, currentSamples);
    const klDivergence = this.calculateKLDivergence(referenceSamples, currentSamples);
    const wasserstein = this.calculateWassersteinDistance(referenceSamples, currentSamples);

    const overallDriftScore = (psi + klDivergence + wasserstein) / 3;
    const recommendation = this.getDriftRecommendation(overallDriftScore);

    const driftMetrics: DataDriftMetrics = {
      modelId,
      timestamp: new Date(),
      featureDrift,
      populationStabilityIndex: psi,
      klDivergence,
      wasserstein,
      overallDriftScore,
      recommendation
    };

    // Store drift metrics
    const existingDrift = this.driftMetrics.get(modelId) || [];
    existingDrift.push(driftMetrics);
    
    if (existingDrift.length > 1000) {
      existingDrift.splice(0, existingDrift.length - 1000);
    }
    
    this.driftMetrics.set(modelId, existingDrift);

    return driftMetrics;
  }

  private async calculateFeatureDrift(reference: ModelMetrics[], current: ModelMetrics[]): Promise<FeatureDriftInfo[]> {
    const features = ['accuracy', 'latency', 'throughput', 'memoryUsage', 'errorRate'];
    const featureDrift: FeatureDriftInfo[] = [];

    for (const feature of features) {
      const refValues = reference.map(m => this.getMetricValue(m, feature));
      const curValues = current.map(m => this.getMetricValue(m, feature));

      const psi = this.calculateFeaturePSI(refValues, curValues);
      const klDivergence = this.calculateFeatureKL(refValues, curValues);
      const statisticalTest = this.performKSTest(refValues, curValues);

      const driftScore = (psi + klDivergence + (statisticalTest.significant ? 1 : 0)) / 3;
      const status = driftScore > 0.7 ? 'drifting' : driftScore > 0.3 ? 'warning' : 'stable';

      featureDrift.push({
        featureName: feature,
        psi,
        klDivergence,
        statisticalTest,
        driftScore,
        status
      });
    }

    return featureDrift;
  }

  private calculatePSI(reference: ModelMetrics[], current: ModelMetrics[]): number {
    // Simplified PSI calculation using accuracy as main feature
    const refAccuracy = reference.map(m => m.accuracy);
    const curAccuracy = current.map(m => m.accuracy);
    
    return this.calculateFeaturePSI(refAccuracy, curAccuracy);
  }

  private calculateFeaturePSI(reference: number[], current: number[]): number {
    // Create bins
    const allValues = [...reference, ...current].sort((a, b) => a - b);
    const binCount = 10;
    const binSize = (allValues[allValues.length - 1] - allValues[0]) / binCount;
    
    let psi = 0;
    
    for (let i = 0; i < binCount; i++) {
      const binStart = allValues[0] + i * binSize;
      const binEnd = allValues[0] + (i + 1) * binSize;
      
      const refCount = reference.filter(v => v >= binStart && v < binEnd).length;
      const curCount = current.filter(v => v >= binStart && v < binEnd).length;
      
      const refPct = (refCount + 1) / (reference.length + binCount); // Laplace smoothing
      const curPct = (curCount + 1) / (current.length + binCount);
      
      psi += (curPct - refPct) * Math.log(curPct / refPct);
    }
    
    return psi;
  }

  private calculateKLDivergence(reference: ModelMetrics[], current: ModelMetrics[]): number {
    // Simplified KL divergence using accuracy distributions
    const refAccuracy = reference.map(m => m.accuracy);
    const curAccuracy = current.map(m => m.accuracy);
    
    return this.calculateFeatureKL(refAccuracy, curAccuracy);
  }

  private calculateFeatureKL(reference: number[], current: number[]): number {
    // Create probability distributions
    const bins = 20;
    const refDist = this.createDistribution(reference, bins);
    const curDist = this.createDistribution(current, bins);
    
    let kl = 0;
    for (let i = 0; i < bins; i++) {
      if (curDist[i] > 0 && refDist[i] > 0) {
        kl += curDist[i] * Math.log(curDist[i] / refDist[i]);
      }
    }
    
    return kl;
  }

  private createDistribution(values: number[], bins: number): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    const dist = new Array(bins).fill(0);
    
    for (const value of values) {
      const binIndex = Math.min(bins - 1, Math.floor((value - min) / binSize));
      dist[binIndex]++;
    }
    
    // Normalize to probabilities with Laplace smoothing
    const total = values.length + bins;
    return dist.map(count => (count + 1) / total);
  }

  private calculateWassersteinDistance(reference: ModelMetrics[], current: ModelMetrics[]): number {
    // Simplified Wasserstein distance using accuracy
    const refAccuracy = reference.map(m => m.accuracy).sort((a, b) => a - b);
    const curAccuracy = current.map(m => m.accuracy).sort((a, b) => a - b);
    
    // Linear interpolation to same length
    const targetLength = Math.min(refAccuracy.length, curAccuracy.length);
    const refInterp = this.interpolateArray(refAccuracy, targetLength);
    const curInterp = this.interpolateArray(curAccuracy, targetLength);
    
    // Calculate average absolute difference
    let sumDiff = 0;
    for (let i = 0; i < targetLength; i++) {
      sumDiff += Math.abs(refInterp[i] - curInterp[i]);
    }
    
    return sumDiff / targetLength;
  }

  private interpolateArray(arr: number[], targetLength: number): number[] {
    if (arr.length === targetLength) return arr;
    
    const result: number[] = [];
    const step = (arr.length - 1) / (targetLength - 1);
    
    for (let i = 0; i < targetLength; i++) {
      const index = i * step;
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      
      if (upper >= arr.length) {
        result.push(arr[arr.length - 1]);
      } else {
        result.push(arr[lower] * (1 - weight) + arr[upper] * weight);
      }
    }
    
    return result;
  }

  private performKSTest(sample1: number[], sample2: number[]): StatisticalTestResult {
    // Simplified Kolmogorov-Smirnov test
    const allValues = [...sample1, ...sample2].sort((a, b) => a - b);
    const uniqueValues = [...new Set(allValues)];
    
    let maxDifference = 0;
    
    for (const value of uniqueValues) {
      const cdf1 = sample1.filter(v => v <= value).length / sample1.length;
      const cdf2 = sample2.filter(v => v <= value).length / sample2.length;
      const difference = Math.abs(cdf1 - cdf2);
      maxDifference = Math.max(maxDifference, difference);
    }
    
    // Critical value for α = 0.05
    const n1 = sample1.length;
    const n2 = sample2.length;
    const criticalValue = 1.36 * Math.sqrt((n1 + n2) / (n1 * n2));
    
    return {
      testName: 'ks_test',
      statistic: maxDifference,
      pValue: maxDifference > criticalValue ? 0.01 : 0.5, // Simplified p-value
      significant: maxDifference > criticalValue
    };
  }

  private getDriftRecommendation(driftScore: number): DataDriftMetrics['recommendation'] {
    if (driftScore > 0.8) return 'retrain';
    if (driftScore > 0.6) return 'investigate';
    if (driftScore > 0.3) return 'monitor';
    return 'no_action';
  }

  // Dashboard Management
  async createDashboard(dashboard: Partial<MonitoringDashboard>): Promise<MonitoringDashboard> {
    const dashboardId = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullDashboard: MonitoringDashboard = {
      dashboardId,
      name: dashboard.name || 'New Dashboard',
      description: dashboard.description || '',
      widgets: dashboard.widgets || [],
      layout: {
        columns: 12,
        rowHeight: 150,
        margin: [10, 10],
        containerPadding: [10, 10],
        ...dashboard.layout
      },
      refreshInterval: dashboard.refreshInterval || 30,
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date(),
        granularity: 'hour',
        ...dashboard.timeRange
      },
      filters: dashboard.filters || [],
      createdBy: dashboard.createdBy || 'system',
      createdAt: new Date(),
      isPublic: dashboard.isPublic || false
    };

    this.dashboards.set(dashboardId, fullDashboard);
    return fullDashboard;
  }

  async getDashboardData(dashboardId: string): Promise<any> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    const data: any = {
      dashboardId,
      name: dashboard.name,
      lastUpdated: new Date(),
      widgets: []
    };

    for (const widget of dashboard.widgets) {
      const widgetData = await this.getWidgetData(widget, dashboard.timeRange);
      data.widgets.push({
        widgetId: widget.widgetId,
        type: widget.type,
        title: widget.title,
        data: widgetData
      });
    }

    return data;
  }

  private async getWidgetData(widget: DashboardWidget, timeRange: TimeRange): Promise<any> {
    switch (widget.type) {
      case 'line_chart':
        return this.getTimeSeriesData(widget.metrics, widget.models, timeRange);
      
      case 'metric_card':
        return this.getLatestMetrics(widget.metrics, widget.models);
      
      case 'alert_list':
        return this.getActiveAlerts(widget.models);
      
      case 'model_comparison':
        return this.getModelComparison(widget.models, widget.metrics, timeRange);
      
      case 'drift_heatmap':
        return this.getDriftHeatmapData(widget.models);
      
      default:
        return {};
    }
  }

  private getTimeSeriesData(metrics: string[], models: string[], timeRange: TimeRange): any {
    const data: any = { series: [] };
    
    for (const modelId of models) {
      const modelMetrics = this.modelMetrics.get(modelId) || [];
      const filteredMetrics = modelMetrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
      
      for (const metric of metrics) {
        const series = {
          name: `${modelId}_${metric}`,
          data: filteredMetrics.map(m => ({
            x: m.timestamp,
            y: this.getMetricValue(m, metric)
          }))
        };
        data.series.push(series);
      }
    }
    
    return data;
  }

  private getLatestMetrics(metrics: string[], models: string[]): any {
    const data: any = { metrics: [] };
    
    for (const modelId of models) {
      const modelMetrics = this.modelMetrics.get(modelId) || [];
      if (modelMetrics.length === 0) continue;
      
      const latest = modelMetrics[modelMetrics.length - 1];
      
      for (const metric of metrics) {
        data.metrics.push({
          modelId,
          metric,
          value: this.getMetricValue(latest, metric),
          timestamp: latest.timestamp
        });
      }
    }
    
    return data;
  }

  private getActiveAlerts(models: string[]): any {
    const alerts = Array.from(this.activeAlerts.values())
      .filter(alert => 
        alert.status === 'active' && 
        (models.length === 0 || models.includes(alert.modelId))
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return { alerts };
  }

  // Auto-retrain Management
  async configureAutoRetrain(modelId: string, config: Partial<AutoRetrainConfig>): Promise<AutoRetrainConfig> {
    const fullConfig: AutoRetrainConfig = {
      modelId,
      enabled: config.enabled !== false,
      triggers: config.triggers || [
        { type: 'performance_degradation', threshold: 0.05, metric: 'accuracy', enabled: true },
        { type: 'data_drift', threshold: 0.7, enabled: true }
      ],
      schedule: config.schedule,
      dataValidation: {
        minDataSize: 1000,
        maxMissingValues: 0.05,
        featureValidation: [],
        ...config.dataValidation
      },
      performanceThresholds: {
        minAccuracy: 0.8,
        maxLatency: 100,
        maxMemoryUsage: 1024,
        minThroughput: 50,
        ...config.performanceThresholds
      },
      rollbackCriteria: {
        enabled: true,
        performanceDrop: 0.1,
        errorRateIncrease: 0.05,
        evaluationPeriod: 60,
        ...config.rollbackCriteria
      }
    };

    this.autoRetrainConfigs.set(modelId, fullConfig);
    return fullConfig;
  }

  private async checkAutoRetrainTriggers(modelId: string, metrics: ModelMetrics): Promise<void> {
    const config = this.autoRetrainConfigs.get(modelId);
    if (!config || !config.enabled) return;

    for (const trigger of config.triggers) {
      if (!trigger.enabled) continue;

      let shouldTrigger = false;

      switch (trigger.type) {
        case 'performance_degradation':
          shouldTrigger = await this.checkPerformanceDegradation(modelId, trigger);
          break;
        
        case 'data_drift':
          shouldTrigger = await this.checkDataDriftTrigger(modelId, trigger);
          break;
        
        case 'time_based':
          shouldTrigger = await this.checkTimeBased(modelId, trigger);
          break;
        
        case 'data_volume':
          shouldTrigger = await this.checkDataVolume(modelId, trigger);
          break;
      }

      if (shouldTrigger) {
        console.log(`Auto-retrain triggered for model ${modelId} due to ${trigger.type}`);
        await this.triggerAutoRetrain(modelId);
        break; // Only trigger once
      }
    }
  }

  private async checkPerformanceDegradation(modelId: string, trigger: RetrainTrigger): Promise<boolean> {
    if (!trigger.metric) return false;

    const metrics = this.modelMetrics.get(modelId) || [];
    if (metrics.length < 100) return false;

    // Compare recent performance to baseline
    const recent = metrics.slice(-50);
    const baseline = metrics.slice(-200, -100);

    const recentAvg = recent.reduce((sum, m) => sum + this.getMetricValue(m, trigger.metric!), 0) / recent.length;
    const baselineAvg = baseline.reduce((sum, m) => sum + this.getMetricValue(m, trigger.metric!), 0) / baseline.length;

    const degradation = (baselineAvg - recentAvg) / baselineAvg;
    return degradation > trigger.threshold;
  }

  private async checkDataDriftTrigger(modelId: string, trigger: RetrainTrigger): Promise<boolean> {
    const driftMetrics = this.driftMetrics.get(modelId) || [];
    if (driftMetrics.length === 0) return false;

    const latestDrift = driftMetrics[driftMetrics.length - 1];
    return latestDrift.overallDriftScore > trigger.threshold;
  }

  private async checkTimeBased(modelId: string, trigger: RetrainTrigger): Promise<boolean> {
    // Implementation would check if enough time has passed since last retrain
    return false; // Simplified
  }

  private async checkDataVolume(modelId: string, trigger: RetrainTrigger): Promise<boolean> {
    const metrics = this.modelMetrics.get(modelId) || [];
    const totalVolume = metrics.reduce((sum, m) => sum + m.dataVolume, 0);
    return totalVolume > trigger.threshold;
  }

  // Helper Methods
  private getMetricValue(metrics: ModelMetrics, metricName: string): number {
    const metricMap: Record<string, () => number> = {
      'accuracy': () => metrics.accuracy,
      'precision': () => metrics.precision,
      'recall': () => metrics.recall,
      'f1Score': () => metrics.f1Score,
      'latency': () => metrics.latency,
      'throughput': () => metrics.throughput,
      'memoryUsage': () => metrics.memoryUsage,
      'cpuUsage': () => metrics.cpuUsage,
      'errorRate': () => metrics.errorRate,
      'dataVolume': () => metrics.dataVolume
    };

    return metricMap[metricName]?.() || 0;
  }

  private evaluateCondition(value: number, condition: AlertRule['condition'], threshold: number): boolean {
    switch (condition) {
      case 'greater_than': return value > threshold;
      case 'less_than': return value < threshold;
      case 'equals': return Math.abs(value - threshold) < 0.001;
      case 'not_equals': return Math.abs(value - threshold) >= 0.001;
      case 'percentage_change':
        // This would require historical comparison
        return false;
      default: return false;
    }
  }

  private generateAlertMessage(rule: AlertRule, modelId: string, actualValue: number): string {
    return `Model ${modelId}: ${rule.metric} ${rule.condition.replace('_', ' ')} ${rule.threshold} (actual: ${actualValue.toFixed(3)})`;
  }

  private async sendEmailAlert(config: any, alert: Alert): Promise<void> {
    // Simulate email sending
    console.log(`Sending email alert: ${alert.message}`);
  }

  private async sendWebhookAlert(config: any, alert: Alert): Promise<void> {
    // Simulate webhook call
    console.log(`Calling webhook for alert: ${alert.message}`);
  }

  private async triggerAutoRetrain(modelId: string): Promise<void> {
    console.log(`Triggering auto-retrain for model: ${modelId}`);
  }

  private async triggerModelRollback(modelId: string): Promise<void> {
    console.log(`Rolling back model: ${modelId}`);
  }

  private async triggerAutoScaling(config: any, alert: Alert): Promise<void> {
    console.log(`Triggering auto-scaling for model: ${alert.modelId}`);
  }

  private getModelComparison(models: string[], metrics: string[], timeRange: TimeRange): any {
    const comparison: any = { models: {}, metrics: {} };
    
    for (const modelId of models) {
      const modelMetrics = this.modelMetrics.get(modelId) || [];
      const filteredMetrics = modelMetrics.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
      
      comparison.models[modelId] = {};
      
      for (const metric of metrics) {
        const values = filteredMetrics.map(m => this.getMetricValue(m, metric));
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        comparison.models[modelId][metric] = avg;
      }
    }
    
    return comparison;
  }

  private getDriftHeatmapData(models: string[]): any {
    const heatmapData: any = { data: [] };
    
    for (const modelId of models) {
      const driftMetrics = this.driftMetrics.get(modelId) || [];
      if (driftMetrics.length === 0) continue;
      
      const latest = driftMetrics[driftMetrics.length - 1];
      
      for (const featureDrift of latest.featureDrift) {
        heatmapData.data.push({
          model: modelId,
          feature: featureDrift.featureName,
          driftScore: featureDrift.driftScore,
          status: featureDrift.status
        });
      }
    }
    
    return heatmapData;
  }

  private initializeDefaultAlertRules(): void {
    // Create default alert rules
    this.createAlertRule({
      name: 'Low Accuracy Alert',
      description: 'Triggers when model accuracy drops below 80%',
      metric: 'accuracy',
      condition: 'less_than',
      threshold: 0.8,
      severity: 'high',
      actions: [
        { type: 'auto_retrain', config: {}, enabled: true }
      ]
    });

    this.createAlertRule({
      name: 'High Latency Alert',
      description: 'Triggers when inference latency exceeds 200ms',
      metric: 'latency',
      condition: 'greater_than',
      threshold: 200,
      severity: 'medium',
      actions: [
        { type: 'scaling', config: { action: 'scale_up' }, enabled: true }
      ]
    });

    this.createAlertRule({
      name: 'High Error Rate Alert',
      description: 'Triggers when error rate exceeds 5%',
      metric: 'errorRate',
      condition: 'greater_than',
      threshold: 0.05,
      severity: 'critical',
      actions: [
        { type: 'model_rollback', config: {}, enabled: true }
      ]
    });
  }

  private initializeDefaultDashboard(): void {
    this.createDashboard({
      name: 'Model Performance Overview',
      description: 'Main dashboard for monitoring model performance',
      widgets: [
        {
          widgetId: 'accuracy_chart',
          type: 'line_chart',
          title: 'Model Accuracy Over Time',
          metrics: ['accuracy'],
          models: [],
          config: { aggregation: 'avg' },
          position: { x: 0, y: 0, width: 6, height: 2 }
        },
        {
          widgetId: 'latency_chart',
          type: 'line_chart',
          title: 'Inference Latency',
          metrics: ['latency'],
          models: [],
          config: { aggregation: 'avg' },
          position: { x: 6, y: 0, width: 6, height: 2 }
        },
        {
          widgetId: 'active_alerts',
          type: 'alert_list',
          title: 'Active Alerts',
          metrics: [],
          models: [],
          config: {},
          position: { x: 0, y: 2, width: 12, height: 2 }
        }
      ]
    });
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, 60000); // Every minute
  }

  private performHealthChecks(): void {
    // Perform system health checks
    const models = Array.from(this.modelMetrics.keys());
    
    for (const modelId of models) {
      const metrics = this.modelMetrics.get(modelId) || [];
      if (metrics.length === 0) continue;
      
      const latest = metrics[metrics.length - 1];
      const timeSinceLastMetric = Date.now() - latest.timestamp.getTime();
      
      // Check if model is unresponsive (no metrics for 10 minutes)
      if (timeSinceLastMetric > 10 * 60 * 1000) {
        console.warn(`Model ${modelId} appears unresponsive - no metrics for ${Math.round(timeSinceLastMetric / 60000)} minutes`);
      }
    }
  }

  // Public Interface
  getModelMetrics(modelId: string, timeRange?: TimeRange): ModelMetrics[] {
    const metrics = this.modelMetrics.get(modelId) || [];
    
    if (!timeRange) {
      return metrics.slice(-100); // Last 100 metrics
    }
    
    return metrics.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.status === 'active');
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert || alert.status !== 'active') return false;
    
    alert.status = 'acknowledged';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    
    return true;
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) return false;
    
    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    
    return true;
  }

  getDriftMetrics(modelId: string): DataDriftMetrics[] {
    return this.driftMetrics.get(modelId) || [];
  }

  getDashboards(): MonitoringDashboard[] {
    return Array.from(this.dashboards.values());
  }

  getMonitoringStats(): {
    totalModels: number;
    totalAlerts: number;
    activeAlerts: number;
    modelsWithDrift: number;
    dashboards: number;
  } {
    const totalModels = this.modelMetrics.size;
    const totalAlerts = this.activeAlerts.size;
    const activeAlerts = this.getActiveAlerts().length;
    const modelsWithDrift = Array.from(this.driftMetrics.keys()).length;
    const dashboards = this.dashboards.size;

    return {
      totalModels,
      totalAlerts,
      activeAlerts,
      modelsWithDrift,
      dashboards
    };
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  clearMonitoringData(): void {
    this.modelMetrics.clear();
    this.activeAlerts.clear();
    this.driftMetrics.clear();
  }
}

export const performanceMonitoringEngine = new PerformanceMonitoringEngine();
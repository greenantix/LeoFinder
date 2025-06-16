import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  Target,
  AlertTriangle,
  Zap,
  DollarSign,
  Home,
  Clock
} from 'lucide-react';

interface MarketMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  unit: 'percent' | 'dollars' | 'days' | 'count';
}

interface MarketAlert {
  id: string;
  type: 'opportunity' | 'warning' | 'trend';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  zipCode?: string;
  timestamp: Date;
}

interface TrendData {
  period: string;
  medianPrice: number;
  volume: number;
  daysOnMarket: number;
  priceChange: number;
}

export const MarketTrendAnalyzer: React.FC = () => {
  const [metrics, setMetrics] = useState<MarketMetric[]>([]);
  const [alerts, setAlerts] = useState<MarketAlert[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(updateRealTimeData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadMarketData = async () => {
    setIsAnalyzing(true);
    
    // Simulate real-time market analysis
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newMetrics: MarketMetric[] = [
      {
        label: 'Median Price',
        value: 425000,
        change: 2.3,
        trend: 'up',
        confidence: 89,
        unit: 'dollars'
      },
      {
        label: 'Price/SqFt',
        value: 187,
        change: 1.8,
        trend: 'up',
        confidence: 92,
        unit: 'dollars'
      },
      {
        label: 'Days on Market',
        value: 23,
        change: -12.5,
        trend: 'down',
        confidence: 86,
        unit: 'days'
      },
      {
        label: 'New Listings',
        value: 156,
        change: -8.2,
        trend: 'down',
        confidence: 94,
        unit: 'count'
      },
      {
        label: 'Inventory Level',
        value: 2.1,
        change: -15.3,
        trend: 'down',
        confidence: 88,
        unit: 'percent'
      },
      {
        label: 'Sale/List Ratio',
        value: 98.2,
        change: 3.1,
        trend: 'up',
        confidence: 91,
        unit: 'percent'
      }
    ];
    
    const newAlerts: MarketAlert[] = [
      {
        id: '1',
        type: 'opportunity',
        title: 'Hot Market Alert',
        message: 'Phoenix 85001: Properties selling 18% faster than last month. Strike while hot!',
        severity: 'high',
        zipCode: '85001',
        timestamp: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: '2',
        type: 'trend',
        title: 'Price Acceleration',
        message: 'Veteran-friendly areas showing 23% faster appreciation than market average.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 15 * 60 * 1000)
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Owner Financing Surge',
        message: '34% increase in creative financing options this week in target areas.',
        severity: 'high',
        timestamp: new Date(Date.now() - 25 * 60 * 1000)
      },
      {
        id: '4',
        type: 'warning',
        title: 'Inventory Shortage',
        message: 'Sub-$300k inventory down 67%. Consider expanding search criteria.',
        severity: 'medium',
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
      }
    ];
    
    // Generate trend data
    const newTrendData: TrendData[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      newTrendData.push({
        period: date.toLocaleDateString(),
        medianPrice: 420000 + (Math.random() - 0.5) * 20000 + (30 - i) * 500,
        volume: Math.floor(100 + Math.random() * 100),
        daysOnMarket: Math.floor(20 + Math.random() * 15),
        priceChange: (Math.random() - 0.5) * 4
      });
    }
    
    setMetrics(newMetrics);
    setAlerts(newAlerts);
    setTrendData(newTrendData);
    setIsAnalyzing(false);
  };

  const updateRealTimeData = () => {
    // Simulate real-time updates
    setMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() - 0.5) * metric.value * 0.01,
      change: metric.change + (Math.random() - 0.5) * 0.5
    })));
  };

  const getMetricIcon = (label: string) => {
    switch (label) {
      case 'Median Price': return <DollarSign className="w-4 h-4" />;
      case 'Price/SqFt': return <BarChart3 className="w-4 h-4" />;
      case 'Days on Market': return <Clock className="w-4 h-4" />;
      case 'New Listings': return <Home className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'trend': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'dollars':
        return value > 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value.toLocaleString()}`;
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'days':
        return `${Math.round(value)} days`;
      case 'count':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const calculateMarketHealth = () => {
    const healthScore = metrics.reduce((sum, metric) => {
      let score = 0;
      
      // Positive indicators
      if (metric.label === 'Sale/List Ratio' && metric.value > 95) score += 20;
      if (metric.label === 'Median Price' && metric.change > 0) score += 15;
      if (metric.label === 'Days on Market' && metric.value < 30) score += 15;
      
      // Negative indicators  
      if (metric.label === 'Inventory Level' && metric.value < 3) score += 10;
      if (metric.label === 'New Listings' && metric.change < 0) score += 10;
      
      return sum + score;
    }, 30); // Base score
    
    return Math.min(100, healthScore);
  };

  const marketHealth = calculateMarketHealth();
  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-green-600 bg-green-50';
    if (health >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Market Health Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-Time Market Analysis
            </CardTitle>
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map(period => (
                <Button
                  key={period}
                  variant={selectedTimeframe === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(period as any)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`px-4 py-2 rounded-lg ${getHealthColor(marketHealth)}`}>
              <div className="text-2xl font-bold">{marketHealth}</div>
              <div className="text-sm">Market Health</div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">Overall Market Sentiment</div>
              <div className="flex items-center gap-2">
                {marketHealth >= 80 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">Seller's Market</span>
                  </>
                ) : marketHealth >= 60 ? (
                  <>
                    <Activity className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium text-yellow-600">Balanced Market</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-600">Buyer's Market</span>
                  </>
                )}
              </div>
            </div>
            
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-blue-600">
                <Zap className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric.label)}
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {formatValue(metric.value, metric.unit)}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={metric.change > 0 ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {metric.confidence}% confidence
                  </span>
                </div>
              </div>
              
              {/* Background indicator */}
              <div 
                className={`absolute top-0 right-0 w-1 h-full ${
                  metric.trend === 'up' ? 'bg-green-500' : 
                  metric.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                }`}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Market Alerts
            <Badge variant="outline">{alerts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          alert.severity === 'high' ? 'border-red-500 text-red-700' :
                          alert.severity === 'medium' ? 'border-yellow-500 text-yellow-700' :
                          'border-blue-500 text-blue-700'
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp.toLocaleTimeString()}</span>
                      {alert.zipCode && (
                        <>
                          <span>•</span>
                          <span>ZIP {alert.zipCode}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Set Price Alert
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Track ZIP Code
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
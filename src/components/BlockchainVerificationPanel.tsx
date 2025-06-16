import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Link as LinkIcon,
  Eye,
  FileText,
  TrendingUp,
  Zap,
  Lock,
  RefreshCw,
  ExternalLink,
  Users,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { blockchainVerificationEngine } from '../services/blockchainVerificationEngine';
import { Listing } from '../types/listing';

interface VerificationPanelProps {
  listing: Listing;
}

export const BlockchainVerificationPanel: React.FC<VerificationPanelProps> = ({ listing }) => {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [ownershipChain, setOwnershipChain] = useState<any>(null);
  const [showFullChain, setShowFullChain] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadVerificationData();
    loadStats();
  }, [listing]);

  const loadVerificationData = async () => {
    setIsVerifying(true);
    try {
      const result = await blockchainVerificationEngine.verifyPropertyOwnership(listing);
      setVerificationResult(result);
      
      const propertyId = generatePropertyId(listing);
      const chain = blockchainVerificationEngine.getOwnershipChain(propertyId);
      setOwnershipChain(chain);
    } catch (error) {
      toast.error('Failed to load verification data');
    } finally {
      setIsVerifying(false);
    }
  };

  const loadStats = () => {
    const statsData = blockchainVerificationEngine.getVerificationStats();
    setStats(statsData);
  };

  const refreshVerification = async () => {
    const propertyId = generatePropertyId(listing);
    setIsVerifying(true);
    try {
      await blockchainVerificationEngine.refreshVerification(propertyId);
      await loadVerificationData();
      toast.success('🔗 Verification refreshed from blockchain');
    } catch (error) {
      toast.error('Failed to refresh verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const generatePropertyId = (listing: Listing): string => {
    const address = listing.address?.replace(/\s+/g, '').toLowerCase() || 'unknown';
    const zipCode = listing.zipCode || '00000';
    return `prop_${(address + zipCode).slice(0, 16)}`;
  };

  const getVerificationIcon = (level: string) => {
    switch (level) {
      case 'blockchain_confirmed':
        return <Shield className="w-5 h-5 text-green-600" />;
      case 'document_verified':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'self_reported':
        return <Eye className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getVerificationBadgeColor = (level: string) => {
    switch (level) {
      case 'blockchain_confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'document_verified':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'self_reported':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'disputed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isVerifying && !verificationResult) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-y-4 flex-col">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-blue-600 animate-pulse" />
              <span className="text-lg font-medium">Verifying Ownership on Blockchain...</span>
            </div>
            <Progress value={75} className="w-full max-w-md" />
            <p className="text-sm text-gray-600">Querying Polygon network for property records</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verificationResult) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Blockchain verification not available</p>
            <Button onClick={loadVerificationData} className="mt-4">
              <Shield className="w-4 h-4 mr-2" />
              Start Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Verification Status */}
      <Card className={`border-2 ${verificationResult.isVerified ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {getVerificationIcon(verificationResult.verificationLevel)}
              Blockchain Verification
              <Badge className={getVerificationBadgeColor(verificationResult.verificationLevel)}>
                {verificationResult.verificationLevel.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshVerification}
                disabled={isVerifying}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={`https://polygonscan.com/tx/${verificationResult.blockchainProof}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Chain
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Trust Score */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Trust Score</span>
                  <span className="text-2xl font-bold text-green-600">{verificationResult.trustScore}/100</span>
                </div>
                <Progress value={verificationResult.trustScore} className="h-3" />
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Last Verified</div>
                <div className="text-sm font-medium">{formatDate(new Date(verificationResult.lastVerified))}</div>
              </div>
            </div>

            {/* Risk Flags */}
            {verificationResult.riskFlags && verificationResult.riskFlags.length > 0 && (
              <div className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Risk Factors Detected
                </h4>
                <div className="space-y-1">
                  {verificationResult.riskFlags.map((flag: string, index: number) => (
                    <div key={index} className="text-sm text-yellow-800">{flag}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Blockchain Proof */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Blockchain Proof</span>
              </div>
              <div className="text-xs font-mono bg-white p-2 rounded border">
                {verificationResult.blockchainProof}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ownership Chain */}
      {ownershipChain && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Ownership History
                <Badge variant="outline" className="flex items-center gap-1">
                  {getStatusIcon(ownershipChain.verificationStatus)}
                  {ownershipChain.verificationStatus}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullChain(!showFullChain)}
              >
                {showFullChain ? 'Hide' : 'Show'} Full Chain
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Owner */}
              <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Current Owner</span>
                </div>
                <div className="text-sm font-mono">{formatAddress(ownershipChain.currentOwner)}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Last updated: {formatDate(new Date(ownershipChain.lastUpdated))}
                </div>
              </div>

              {/* Previous Transfers */}
              {showFullChain && ownershipChain.previousOwners && ownershipChain.previousOwners.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Transfer History</h4>
                  {ownershipChain.previousOwners.slice(0, 5).map((transfer: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium">Transfer #{index + 1}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              transfer.verificationLevel === 'high' ? 'border-green-500 text-green-700' :
                              transfer.verificationLevel === 'medium' ? 'border-yellow-500 text-yellow-700' :
                              'border-red-500 text-red-700'
                            }`}
                          >
                            {transfer.verificationLevel}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(new Date(transfer.transferDate))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">From:</span>
                          <div className="font-mono">{formatAddress(transfer.fromOwner)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">To:</span>
                          <div className="font-mono">{formatAddress(transfer.toOwner)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Sale Price:</span>
                          <div className="font-medium">${transfer.salePrice.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Transaction:</span>
                          <div className="font-mono text-blue-600 cursor-pointer hover:underline">
                            {formatAddress(transfer.transactionHash)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Blockchain Network Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalProperties}</div>
                <div className="text-sm text-gray-600">Total Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.verifiedProperties}</div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.averageTrustScore}</div>
                <div className="text-sm text-gray-600">Avg Trust Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.blockchainCoverage}%</div>
                <div className="text-sm text-gray-600">On-Chain Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Dispute Ownership
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Set Monitoring
            </Button>
            <Button variant="outline" size="sm">
              <DollarSign className="w-4 h-4 mr-2" />
              Value Tracking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
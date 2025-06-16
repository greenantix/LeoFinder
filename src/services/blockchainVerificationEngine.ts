import { Listing } from '../types/listing';

interface BlockchainRecord {
  propertyId: string;
  ownerAddress: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
  verified: boolean;
  trustScore: number;
}

interface OwnershipChain {
  propertyId: string;
  currentOwner: string;
  previousOwners: OwnershipTransfer[];
  acquisitionHistory: PropertyAcquisition[];
  verificationStatus: 'verified' | 'pending' | 'disputed' | 'unverified';
  blockchainHash: string;
  lastUpdated: Date;
}

interface OwnershipTransfer {
  fromOwner: string;
  toOwner: string;
  transferDate: Date;
  salePrice: number;
  transactionHash: string;
  verificationLevel: 'high' | 'medium' | 'low';
}

interface PropertyAcquisition {
  acquisitionType: 'purchase' | 'inheritance' | 'foreclosure' | 'gift' | 'auction';
  documentHash: string;
  recordingDate: Date;
  jurisdiction: string;
  verified: boolean;
}

interface SmartContract {
  contractAddress: string;
  abi: any[];
  network: 'ethereum' | 'polygon' | 'binance_smart_chain';
  deployedBlock: number;
}

interface VerificationResult {
  isVerified: boolean;
  trustScore: number;
  verificationLevel: 'blockchain_confirmed' | 'document_verified' | 'self_reported' | 'unverified';
  ownershipChain: OwnershipChain;
  riskFlags: string[];
  lastVerified: Date;
  nextVerificationDue: Date;
  blockchainProof: string;
}

export class BlockchainVerificationEngine {
  private smartContract: SmartContract = {
    contractAddress: '0x742d35Cc6634C0532925a3b8D4043aBdF9C8c56a',
    abi: [], // Simplified for demo
    network: 'polygon',
    deployedBlock: 43285029
  };

  private verificationCache = new Map<string, VerificationResult>();
  private ownershipRegistry = new Map<string, OwnershipChain>();
  private pendingVerifications = new Set<string>();

  async verifyPropertyOwnership(listing: Listing): Promise<VerificationResult> {
    const propertyId = this.generatePropertyId(listing);
    
    // Check cache first
    if (this.verificationCache.has(propertyId)) {
      const cached = this.verificationCache.get(propertyId)!;
      if (this.isCacheValid(cached)) {
        return cached;
      }
    }

    // Start verification process
    this.pendingVerifications.add(propertyId);
    
    try {
      // 1. Query blockchain for ownership records
      const blockchainData = await this.queryBlockchainOwnership(propertyId);
      
      // 2. Cross-reference with public records
      const publicRecords = await this.validatePublicRecords(listing);
      
      // 3. Verify ownership chain integrity
      const ownershipChain = await this.buildOwnershipChain(propertyId, blockchainData);
      
      // 4. Calculate trust score
      const trustScore = this.calculateTrustScore(blockchainData, publicRecords, ownershipChain);
      
      // 5. Identify risk flags
      const riskFlags = this.analyzeRiskFactors(ownershipChain, blockchainData);
      
      // 6. Generate blockchain proof
      const blockchainProof = await this.generateProofOfOwnership(propertyId, ownershipChain);
      
      const result: VerificationResult = {
        isVerified: trustScore >= 75,
        trustScore,
        verificationLevel: this.determineVerificationLevel(trustScore, blockchainData),
        ownershipChain,
        riskFlags,
        lastVerified: new Date(),
        nextVerificationDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        blockchainProof
      };

      // Cache result
      this.verificationCache.set(propertyId, result);
      this.ownershipRegistry.set(propertyId, ownershipChain);
      
      return result;
      
    } finally {
      this.pendingVerifications.delete(propertyId);
    }
  }

  private async queryBlockchainOwnership(propertyId: string): Promise<BlockchainRecord[]> {
    // Simulate blockchain query (in production, use Web3.js or ethers.js)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const records: BlockchainRecord[] = [];
    const baseTimestamp = Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000);
    
    // Generate realistic ownership records
    for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
      records.push({
        propertyId,
        ownerAddress: this.generateEthereumAddress(),
        transactionHash: this.generateTransactionHash(),
        blockNumber: 43285029 + Math.floor(Math.random() * 1000000),
        timestamp: new Date(baseTimestamp + i * 180 * 24 * 60 * 60 * 1000),
        verified: Math.random() > 0.1, // 90% verification rate
        trustScore: Math.floor(Math.random() * 30) + 70 // 70-100
      });
    }
    
    return records.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private async validatePublicRecords(listing: Listing): Promise<any> {
    // Simulate public records validation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      countyRecordsMatch: Math.random() > 0.05, // 95% match rate
      titleCompanyVerified: Math.random() > 0.1, // 90% verified
      taxRecordsConsistent: Math.random() > 0.08, // 92% consistent
      lastRecordedSale: {
        date: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000),
        price: (listing.price || 300000) * (0.7 + Math.random() * 0.6),
        deedType: 'warranty_deed'
      }
    };
  }

  private async buildOwnershipChain(propertyId: string, blockchainData: BlockchainRecord[]): Promise<OwnershipChain> {
    const transfers: OwnershipTransfer[] = [];
    const acquisitions: PropertyAcquisition[] = [];
    
    // Build ownership transfers from blockchain data
    for (let i = 1; i < blockchainData.length; i++) {
      const prev = blockchainData[i - 1];
      const current = blockchainData[i];
      
      transfers.push({
        fromOwner: prev.ownerAddress,
        toOwner: current.ownerAddress,
        transferDate: current.timestamp,
        salePrice: Math.floor(200000 + Math.random() * 400000),
        transactionHash: current.transactionHash,
        verificationLevel: current.verified ? 'high' : 'medium'
      });
    }

    // Generate acquisition history
    const acquisitionTypes: PropertyAcquisition['acquisitionType'][] = 
      ['purchase', 'inheritance', 'foreclosure', 'gift', 'auction'];
    
    for (let i = 0; i < transfers.length; i++) {
      acquisitions.push({
        acquisitionType: acquisitionTypes[Math.floor(Math.random() * acquisitionTypes.length)],
        documentHash: this.generateDocumentHash(),
        recordingDate: transfers[i].transferDate,
        jurisdiction: 'Maricopa County, AZ',
        verified: Math.random() > 0.15 // 85% verified
      });
    }

    const currentOwner = blockchainData.length > 0 ? 
      blockchainData[blockchainData.length - 1].ownerAddress : 
      'unverified';

    return {
      propertyId,
      currentOwner,
      previousOwners: transfers,
      acquisitionHistory: acquisitions,
      verificationStatus: this.determineVerificationStatus(blockchainData),
      blockchainHash: this.generateBlockchainHash(propertyId, transfers),
      lastUpdated: new Date()
    };
  }

  private calculateTrustScore(
    blockchainData: BlockchainRecord[], 
    publicRecords: any, 
    ownershipChain: OwnershipChain
  ): number {
    let score = 0;

    // Blockchain verification (40 points)
    const verifiedRecords = blockchainData.filter(r => r.verified).length;
    const totalRecords = blockchainData.length;
    if (totalRecords > 0) {
      score += (verifiedRecords / totalRecords) * 40;
    }

    // Public records consistency (30 points)
    if (publicRecords.countyRecordsMatch) score += 15;
    if (publicRecords.titleCompanyVerified) score += 10;
    if (publicRecords.taxRecordsConsistent) score += 5;

    // Ownership chain integrity (20 points)
    const verifiedAcquisitions = ownershipChain.acquisitionHistory.filter(a => a.verified).length;
    const totalAcquisitions = ownershipChain.acquisitionHistory.length;
    if (totalAcquisitions > 0) {
      score += (verifiedAcquisitions / totalAcquisitions) * 20;
    }

    // Transaction history length (10 points)
    score += Math.min(10, ownershipChain.previousOwners.length * 2);

    return Math.round(Math.min(100, score));
  }

  private analyzeRiskFactors(ownershipChain: OwnershipChain, blockchainData: BlockchainRecord[]): string[] {
    const flags: string[] = [];

    // Check for rapid ownership changes
    const recentTransfers = ownershipChain.previousOwners.filter(
      transfer => transfer.transferDate.getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
    );
    if (recentTransfers.length > 2) {
      flags.push('⚠️ Multiple recent ownership changes detected');
    }

    // Check for unverified transactions
    const unverifiedCount = blockchainData.filter(r => !r.verified).length;
    if (unverifiedCount > 0) {
      flags.push(`🔍 ${unverifiedCount} unverified blockchain transaction(s)`);
    }

    // Check for foreclosure history
    const foreclosures = ownershipChain.acquisitionHistory.filter(
      acq => acq.acquisitionType === 'foreclosure'
    );
    if (foreclosures.length > 0) {
      flags.push('🏠 Property has foreclosure history');
    }

    // Check for dispute indicators
    if (ownershipChain.verificationStatus === 'disputed') {
      flags.push('⚖️ Ownership dispute on record');
    }

    // Check for price anomalies
    const transfers = ownershipChain.previousOwners;
    if (transfers.length > 1) {
      const priceChanges = transfers.map((transfer, i) => {
        if (i === 0) return 0;
        return (transfer.salePrice - transfers[i - 1].salePrice) / transfers[i - 1].salePrice;
      }).filter(change => change !== 0);

      const suspiciousChanges = priceChanges.filter(change => Math.abs(change) > 0.5);
      if (suspiciousChanges.length > 0) {
        flags.push('💰 Unusual price fluctuations detected');
      }
    }

    return flags;
  }

  private async generateProofOfOwnership(propertyId: string, ownershipChain: OwnershipChain): Promise<string> {
    // Generate cryptographic proof
    const proofData = {
      propertyId,
      currentOwner: ownershipChain.currentOwner,
      chainHash: ownershipChain.blockchainHash,
      verificationTimestamp: Date.now(),
      contractAddress: this.smartContract.contractAddress,
      network: this.smartContract.network
    };

    // Simulate blockchain proof generation
    const proofString = JSON.stringify(proofData);
    const hash = this.generateHash(proofString);
    
    return `0x${hash}`;
  }

  private determineVerificationLevel(trustScore: number, blockchainData: BlockchainRecord[]): VerificationResult['verificationLevel'] {
    if (trustScore >= 90 && blockchainData.length > 0) return 'blockchain_confirmed';
    if (trustScore >= 75) return 'document_verified';
    if (trustScore >= 50) return 'self_reported';
    return 'unverified';
  }

  private determineVerificationStatus(blockchainData: BlockchainRecord[]): OwnershipChain['verificationStatus'] {
    if (blockchainData.length === 0) return 'unverified';
    
    const verifiedCount = blockchainData.filter(r => r.verified).length;
    const verificationRate = verifiedCount / blockchainData.length;
    
    if (verificationRate >= 0.9) return 'verified';
    if (verificationRate >= 0.7) return 'pending';
    return 'disputed';
  }

  private isCacheValid(result: VerificationResult): boolean {
    const cacheValidityPeriod = 24 * 60 * 60 * 1000; // 24 hours
    return Date.now() - result.lastVerified.getTime() < cacheValidityPeriod;
  }

  // Utility methods
  private generatePropertyId(listing: Listing): string {
    const address = listing.address?.replace(/\s+/g, '').toLowerCase() || 'unknown';
    const zipCode = listing.zipCode || '00000';
    return `prop_${this.generateHash(address + zipCode).substring(0, 16)}`;
  }

  private generateEthereumAddress(): string {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  }

  private generateTransactionHash(): string {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  }

  private generateDocumentHash(): string {
    return 'doc_' + this.generateHash(Date.now().toString() + Math.random().toString());
  }

  private generateBlockchainHash(propertyId: string, transfers: OwnershipTransfer[]): string {
    const data = propertyId + transfers.map(t => t.transactionHash).join('');
    return this.generateHash(data);
  }

  private generateHash(input: string): string {
    // Simple hash function for demo (in production, use crypto library)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  // Public interface methods
  async batchVerifyProperties(listings: Listing[]): Promise<Map<string, VerificationResult>> {
    const results = new Map<string, VerificationResult>();
    
    // Process in batches to avoid overwhelming the blockchain
    const batchSize = 5;
    for (let i = 0; i < listings.length; i += batchSize) {
      const batch = listings.slice(i, i + batchSize);
      const batchPromises = batch.map(listing => this.verifyPropertyOwnership(listing));
      const batchResults = await Promise.all(batchPromises);
      
      batch.forEach((listing, index) => {
        const propertyId = this.generatePropertyId(listing);
        results.set(propertyId, batchResults[index]);
      });
    }
    
    return results;
  }

  getVerificationStatus(propertyId: string): VerificationResult | null {
    return this.verificationCache.get(propertyId) || null;
  }

  async refreshVerification(propertyId: string): Promise<void> {
    this.verificationCache.delete(propertyId);
    // Verification will be re-run on next access
  }

  getOwnershipChain(propertyId: string): OwnershipChain | null {
    return this.ownershipRegistry.get(propertyId) || null;
  }

  isPendingVerification(propertyId: string): boolean {
    return this.pendingVerifications.has(propertyId);
  }

  getVerificationStats(): {
    totalProperties: number;
    verifiedProperties: number;
    pendingVerifications: number;
    averageTrustScore: number;
    blockchainCoverage: number;
  } {
    const results = Array.from(this.verificationCache.values());
    const verified = results.filter(r => r.isVerified).length;
    const blockchainConfirmed = results.filter(r => r.verificationLevel === 'blockchain_confirmed').length;
    const avgTrustScore = results.length > 0 ? 
      results.reduce((sum, r) => sum + r.trustScore, 0) / results.length : 0;

    return {
      totalProperties: results.length,
      verifiedProperties: verified,
      pendingVerifications: this.pendingVerifications.size,
      averageTrustScore: Math.round(avgTrustScore),
      blockchainCoverage: Math.round((blockchainConfirmed / Math.max(1, results.length)) * 100)
    };
  }

  // Smart contract interaction methods (simplified for demo)
  async deployVerificationContract(): Promise<string> {
    // Simulate contract deployment
    await new Promise(resolve => setTimeout(resolve, 2000));
    return '0x' + this.generateHash('verification_contract_' + Date.now()).substring(0, 40);
  }

  async recordOwnershipOnChain(propertyId: string, ownerAddress: string): Promise<string> {
    // Simulate recording ownership on blockchain
    await new Promise(resolve => setTimeout(resolve, 1500));
    return this.generateTransactionHash();
  }

  async disputeOwnership(propertyId: string, evidence: string): Promise<string> {
    // Simulate dispute filing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const ownershipChain = this.ownershipRegistry.get(propertyId);
    if (ownershipChain) {
      ownershipChain.verificationStatus = 'disputed';
      this.ownershipRegistry.set(propertyId, ownershipChain);
    }
    
    return this.generateTransactionHash();
  }
}

export const blockchainVerificationEngine = new BlockchainVerificationEngine();
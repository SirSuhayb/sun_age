# SOLAR Token Revenue Sharing Mechanism for Affiliate Tracking

## 🎯 Overview

This document details the SOLAR token revenue sharing mechanism that will enable fair distribution of funds from subscribers and content purchasers to content creators and affiliates in the Solara ecosystem.

## 🏗️ Token Economy Architecture

### Current SOLAR Token Infrastructure

Based on the existing codebase analysis:
- SOLAR tokens are ERC-20 tokens on Base blockchain
- Treasury system already implemented (`TREASURY_ADDRESS`)
- Token distribution system exists (`token_distributions` table)
- Payment processing for both fiat and SOLAR tokens

### Enhanced Revenue Distribution Model

```typescript
interface SolarTokenDistribution {
  // Revenue Sources
  revenueStreams: {
    subscriptionRevenue: number;    // Monthly subscription fees
    rollPurchases: number;          // One-time roll purchases
    premiumFeatures: number;        // Premium feature upgrades
    affiliateProductSales: number;  // External affiliate commissions
  };
  
  // Distribution Allocation
  distributionModel: {
    affiliateCreators: 0.15;        // 15% to content creators
    platformOperations: 0.60;       // 60% platform operations
    communityRewards: 0.15;         // 15% community incentives
    treasuryReserve: 0.10;          // 10% treasury/dev fund
  };
  
  // SOLAR Token Conversion
  tokenMetrics: {
    usdToSolarRate: number;         // Current USD to SOLAR rate
    monthlyTokenBudget: number;     // Max SOLAR tokens for distribution
    minimumPayoutThreshold: 1000;   // Min 1000 SOLAR before payout
  };
}
```

## 💰 Revenue Streams & Attribution

### 1. Subscription Revenue Sharing

```typescript
interface SubscriptionAffiliateShare {
  // New subscription attribution
  newSubscription: {
    attributionWindow: 30;          // Days to attribute to creator
    creatorShare: 0.10;             // 10% of subscription value
    duration: 12;                   // Months of revenue sharing
    maxMonthlyEarning: 50000;       // 50K SOLAR cap per creator
  };
  
  // Calculation example
  monthlySubscription: {
    price: 19.99;                   // USD
    creatorCommission: 1.999;       // USD (10%)
    solarEquivalent: 1999;          // SOLAR tokens (assuming 1:1000 rate)
  };
}
```

### 2. Roll Purchase Revenue Sharing

```typescript
interface RollPurchaseAffiliateShare {
  // One-time purchase attribution
  rollPurchase: {
    attributionWindow: 30;          // Days
    creatorShare: 0.05;             // 5% of purchase value
    eligiblePackages: ['basic', 'premium', 'legendary'];
    
    // Tiered commission based on creator level
    tierMultipliers: {
      emerging: 1.0;                // Base rate
      rising: 1.2;                  // 20% bonus
      established: 1.5;             // 50% bonus
      influential: 1.8;             // 80% bonus
      legendary: 2.0;               // 100% bonus
    };
  };
  
  // Example calculation
  premiumRollsPurchase: {
    packagePrice: 4.99;             // USD
    baseCommission: 0.25;           // USD (5%)
    legendaryCreatorCommission: 0.50; // USD (doubled for legendary tier)
    solarTokens: 500;               // SOLAR equivalent
  };
}
```

### 3. Affiliate Product Commission Sharing

```typescript
interface ProductAffiliateShare {
  // External product affiliate earnings
  amazonAssociates: {
    platformCommission: 0.08;       // 8% from Amazon
    creatorShare: 0.20;             // 20% of platform commission
    example: {
      bookSale: 25.00;              // USD book price
      amazonCommission: 2.00;       // 8% to Solara
      creatorEarning: 0.40;         // 20% of commission
      solarTokens: 400;             // SOLAR equivalent
    };
  };
  
  travelBookings: {
    platformCommission: 0.06;       // 6% from booking sites
    creatorShare: 0.25;             // 25% of platform commission
    example: {
      hotelBooking: 200.00;         // USD booking value
      bookingCommission: 12.00;     // 6% to Solara
      creatorEarning: 3.00;         // 25% of commission
      solarTokens: 3000;            // SOLAR equivalent
    };
  };
}
```

## ⚡ SOLAR Token Distribution Engine

### Smart Contract Integration

```typescript
export class SolarDistributionEngine {
  private treasuryContract: Contract;
  private solarTokenContract: Contract;
  
  constructor() {
    this.treasuryContract = new ethers.Contract(
      TREASURY_ADDRESS, 
      TREASURY_ABI, 
      adminWallet
    );
    this.solarTokenContract = new ethers.Contract(
      SOLAR_TOKEN_ADDRESS, 
      SOLAR_TOKEN_ABI, 
      adminWallet
    );
  }
  
  async processAffiliatePayouts(
    affiliatePayouts: AffiliatePayoutBatch[]
  ): Promise<string[]> {
    const transactions: string[] = [];
    
    for (const payout of affiliatePayouts) {
      try {
        // Calculate SOLAR token amount
        const solarAmount = await this.convertUsdToSolar(payout.usdAmount);
        
        // Check if affiliate has connected wallet
        const affiliateWallet = await this.getAffiliateWallet(payout.affiliateFid);
        
        if (!affiliateWallet) {
          // Store pending payout for when wallet is connected
          await this.storePendingPayout(payout);
          continue;
        }
        
        // Execute token transfer
        const tx = await this.solarTokenContract.transfer(
          affiliateWallet,
          ethers.parseUnits(solarAmount.toString(), 18)
        );
        
        await tx.wait();
        transactions.push(tx.hash);
        
        // Record successful payout
        await this.recordSuccessfulPayout({
          ...payout,
          transactionHash: tx.hash,
          solarAmount,
          status: 'completed'
        });
        
      } catch (error) {
        // Record failed payout for retry
        await this.recordFailedPayout(payout, error.message);
      }
    }
    
    return transactions;
  }
  
  async convertUsdToSolar(usdAmount: number): Promise<number> {
    // Get current SOLAR/USD rate from DEX or oracle
    const solarPrice = await this.getSolarPrice();
    return Math.floor(usdAmount / solarPrice * 1000); // Convert to SOLAR with 3 decimal precision
  }
}
```

### Revenue Attribution Algorithm

```typescript
export class RevenueAttributionEngine {
  
  async attributeRevenue(
    revenueEvent: RevenueEvent,
    userId: string
  ): Promise<AttributionResult[]> {
    const attributions: AttributionResult[] = [];
    
    // Find all attribution sources for this user
    const userAttributions = await this.getUserAttributions(userId);
    
    for (const attribution of userAttributions) {
      if (!this.isWithinAttributionWindow(attribution, revenueEvent.timestamp)) {
        continue;
      }
      
      const commissionRate = this.getCommissionRate(
        attribution.contentType,
        attribution.creatorTier,
        revenueEvent.revenueType
      );
      
      const commissionAmount = revenueEvent.amount * commissionRate;
      const solarTokens = await this.convertToSolarTokens(commissionAmount);
      
      attributions.push({
        creatorFid: attribution.creatorFid,
        contentId: attribution.contentId,
        commissionUsd: commissionAmount,
        commissionSolar: solarTokens,
        attributionSource: attribution.source,
        revenueEventId: revenueEvent.id
      });
    }
    
    return attributions;
  }
  
  private getCommissionRate(
    contentType: string,
    creatorTier: string,
    revenueType: string
  ): number {
    const baseRates = {
      subscription: 0.10,    // 10%
      rollPurchase: 0.05,    // 5%
      affiliateProduct: 0.20, // 20%
      premiumFeature: 0.08   // 8%
    };
    
    const tierMultipliers = {
      emerging: 1.0,
      rising: 1.2,
      established: 1.5,
      influential: 1.8,
      legendary: 2.0
    };
    
    const baseRate = baseRates[revenueType] || 0.05;
    const multiplier = tierMultipliers[creatorTier] || 1.0;
    
    return Math.min(baseRate * multiplier, 0.25); // Cap at 25%
  }
}
```

## 🔄 Automated Payout System

### Monthly Payout Processing

```typescript
interface MonthlyPayoutProcess {
  schedule: {
    processingDay: 1;               // 1st of each month
    cutoffDate: 'lastDayOfMonth';   // Revenue cutoff
    payoutDelay: 7;                 // Days delay for verification
  };
  
  thresholds: {
    minimumPayout: 1000;            // 1000 SOLAR minimum
    maximumMonthlyPayout: 100000;   // 100K SOLAR cap per creator
    fraudDetectionLimit: 10000;     // Manual review above 10K
  };
  
  workflow: [
    'calculateMonthlyEarnings',
    'validateAttributions',
    'detectFraudulentActivity',
    'processPayouts',
    'recordTransactions',
    'notifyAffiliates'
  ];
}

export class MonthlyPayoutProcessor {
  
  async processMonthlyPayouts(): Promise<PayoutResult> {
    const startDate = this.getLastMonthStart();
    const endDate = this.getLastMonthEnd();
    
    // 1. Calculate earnings for all affiliates
    const affiliateEarnings = await this.calculateMonthlyEarnings(startDate, endDate);
    
    // 2. Apply thresholds and caps
    const eligiblePayouts = affiliateEarnings.filter(
      earning => earning.totalSolar >= 1000 && earning.totalSolar <= 100000
    );
    
    // 3. Flag high-earning accounts for manual review
    const highEarners = affiliateEarnings.filter(
      earning => earning.totalSolar > 10000
    );
    
    if (highEarners.length > 0) {
      await this.flagForManualReview(highEarners);
    }
    
    // 4. Process SOLAR token transfers
    const transactions = await this.distributionEngine.processAffiliatePayouts(
      eligiblePayouts
    );
    
    // 5. Record payout batch
    await this.recordPayoutBatch({
      periodStart: startDate,
      periodEnd: endDate,
      totalAffiliates: eligiblePayouts.length,
      totalSolarDistributed: eligiblePayouts.reduce((sum, p) => sum + p.totalSolar, 0),
      transactions,
      status: 'completed'
    });
    
    return {
      processedPayouts: eligiblePayouts.length,
      totalSolarDistributed: eligiblePayouts.reduce((sum, p) => sum + p.totalSolar, 0),
      pendingReview: highEarners.length,
      failedPayouts: affiliateEarnings.length - eligiblePayouts.length
    };
  }
}
```

## 🏦 Treasury Management & Budget Allocation

### Treasury Fund Allocation

```typescript
interface TreasuryFundAllocation {
  monthlyRevenue: {
    subscriptions: number;          // Total subscription revenue
    rollPurchases: number;          // Total roll purchase revenue
    affiliateCommissions: number;   // External affiliate earnings
  };
  
  budgetAllocation: {
    affiliatePayouts: {
      percentage: 0.15;             // 15% of total revenue
      maxMonthlyBudget: 50000;      // 50K USD equivalent in SOLAR
      priorityTiers: ['legendary', 'influential', 'established'];
    };
    
    platformOperations: {
      percentage: 0.60;             // 60% for platform costs
      includes: ['development', 'hosting', 'marketing', 'support'];
    };
    
    communityRewards: {
      percentage: 0.15;             // 15% for community incentives
      includes: ['streakBonuses', 'achievements', 'events'];
    };
    
    treasuryReserve: {
      percentage: 0.10;             // 10% for long-term treasury
      purpose: ['emergencyFund', 'futureInvestments', 'tokenBuybacks'];
    };
  };
}

export class TreasuryManager {
  
  async allocateMonthlyBudget(monthlyRevenue: number): Promise<BudgetAllocation> {
    const affiliateBudget = monthlyRevenue * 0.15;
    const solarBudget = await this.convertToSolarTokens(affiliateBudget);
    
    // Ensure we have sufficient SOLAR tokens in treasury
    const treasuryBalance = await this.getTreasuryBalance();
    
    if (treasuryBalance < solarBudget) {
      // Purchase additional SOLAR tokens or defer payouts
      await this.handleInsufficientFunds(solarBudget - treasuryBalance);
    }
    
    return {
      totalRevenue: monthlyRevenue,
      affiliateBudgetUsd: affiliateBudget,
      affiliateBudgetSolar: solarBudget,
      treasuryBalance,
      allocationStatus: 'sufficient'
    };
  }
  
  async handleInsufficientFunds(shortfall: number): Promise<void> {
    // Option 1: Purchase SOLAR tokens from DEX
    try {
      await this.purchaseSolarTokens(shortfall);
      return;
    } catch (error) {
      console.error('Failed to purchase SOLAR tokens:', error);
    }
    
    // Option 2: Pro-rate payouts based on available funds
    await this.proRatePayouts(shortfall);
  }
}
```

## 📊 Real-time Revenue Tracking

### Revenue Dashboard Integration

```typescript
interface RealtimeRevenueDashboard {
  affiliateMetrics: {
    totalActiveAffiliates: number;
    monthlyEarnings: SolarAmount;
    topPerformers: AffiliateLeaderboard[];
    growthRate: number;
  };
  
  revenueStreams: {
    subscriptionRevenue: MonthlyTrend[];
    rollPurchaseRevenue: MonthlyTrend[];
    affiliateProductRevenue: MonthlyTrend[];
    totalAttributedRevenue: SolarAmount;
  };
  
  distributionMetrics: {
    solarTokensDistributed: MonthlyTrend[];
    averagePayoutPerAffiliate: SolarAmount;
    payoutSuccessRate: number;
    pendingPayouts: SolarAmount;
  };
}

export class RevenueDashboardService {
  
  async getAffiliateRevenueDashboard(timeframe: string): Promise<RealtimeRevenueDashboard> {
    const [affiliateMetrics, revenueStreams, distributionMetrics] = await Promise.all([
      this.getAffiliateMetrics(timeframe),
      this.getRevenueStreams(timeframe),
      this.getDistributionMetrics(timeframe)
    ]);
    
    return {
      affiliateMetrics,
      revenueStreams,
      distributionMetrics,
      lastUpdated: new Date(),
      timeframe
    };
  }
  
  async getCreatorEarningsBreakdown(creatorFid: number): Promise<CreatorEarningsDetail> {
    return {
      totalLifetimeEarnings: await this.getLifetimeEarnings(creatorFid),
      monthlyBreakdown: await this.getMonthlyEarnings(creatorFid),
      revenueBySource: await this.getRevenueBySource(creatorFid),
      topPerformingContent: await this.getTopContent(creatorFid),
      nextPayoutEstimate: await this.getNextPayoutEstimate(creatorFid),
      currentTier: await this.getCreatorTier(creatorFid)
    };
  }
}
```

## 🔒 Security & Fraud Prevention

### Payout Security Measures

```typescript
interface PayoutSecurityFramework {
  fraudDetection: {
    velocityChecks: {
      maxDailyEarnings: 5000;       // SOLAR tokens
      maxWeeklyEarnings: 20000;     // SOLAR tokens
      suddenSpikesThreshold: 300;   // % increase triggers review
    };
    
    behaviorAnalysis: {
      unusualTrafficPatterns: boolean;
      clickFarmDetection: boolean;
      ipAddressMonitoring: boolean;
      deviceFingerprintTracking: boolean;
    };
    
    validationRequires: {
      minimumAccountAge: 30;        // Days before eligible for payouts
      minimumContentShares: 5;      // Shares before eligibility
      walletVerification: boolean;  // Must verify wallet ownership
      socialMediaValidation: boolean; // Optional but increases trust score
    };
  };
  
  multisigSecurity: {
    highValueThreshold: 10000;      // SOLAR tokens requiring multisig
    requiredSignatures: 2;          // Of 3 possible signers
    timelock: 24;                   // Hours delay for large transactions
  };
}

export class PayoutSecurityService {
  
  async validatePayoutEligibility(
    affiliateFid: number,
    requestedAmount: number
  ): Promise<SecurityValidationResult> {
    const checks = await Promise.all([
      this.checkVelocityLimits(affiliateFid, requestedAmount),
      this.analyzeBehaviorPatterns(affiliateFid),
      this.validateAccountRequirements(affiliateFid),
      this.checkFraudIndicators(affiliateFid)
    ]);
    
    const securityScore = this.calculateSecurityScore(checks);
    
    if (securityScore < 0.7) {
      return {
        approved: false,
        reason: 'Security score too low',
        requiredActions: ['account_verification', 'manual_review'],
        securityScore
      };
    }
    
    if (requestedAmount > 10000) {
      return {
        approved: true,
        requiresMultisig: true,
        timelock: 24,
        securityScore
      };
    }
    
    return {
      approved: true,
      requiresMultisig: false,
      securityScore
    };
  }
}
```

## 🌐 Cross-Platform Integration

### External Platform Revenue Sharing

```typescript
interface CrossPlatformIntegration {
  socialMediaPlatforms: {
    twitter: {
      trackingMethod: 'utm_parameters';
      attributionWindow: 7;         // Days
      commissionRate: 0.03;         // 3% for social shares
    };
    
    farcaster: {
      trackingMethod: 'frame_interactions';
      attributionWindow: 14;        // Days
      commissionRate: 0.05;         // 5% for Farcaster native shares
      bonusForFrameClicks: 0.02;    // Additional 2% for frame interactions
    };
    
    youtube: {
      trackingMethod: 'description_links';
      attributionWindow: 30;        // Days
      commissionRate: 0.08;         // 8% for video content
      minimumViewsRequired: 100;    // Views before attribution
    };
  };
  
  contentSyncing: {
    automaticSharing: boolean;      // Auto-share to connected platforms
    crossPlatformAttribution: boolean; // Track across multiple platforms
    unifiedAnalytics: boolean;      // Combined dashboard view
  };
}
```

## 📈 Growth Incentives & Token Economics

### Creator Growth Incentives

```typescript
interface CreatorGrowthIncentives {
  milestoneRewards: {
    firstSuccessfulReferral: 2000; // SOLAR
    first10Referrals: 10000;       // SOLAR
    first100Referrals: 50000;      // SOLAR
    monthlyTopPerformer: 25000;    // SOLAR
  };
  
  tierUpgradeBonuses: {
    emergingToRising: 5000;        // SOLAR
    risingToEstablished: 15000;    // SOLAR
    establishedToInfluential: 30000; // SOLAR
    influentialToLegendary: 75000; // SOLAR
  };
  
  performanceMultipliers: {
    consistencyBonus: 1.2;         // 20% bonus for 30-day streak
    qualityBonus: 1.5;             // 50% bonus for high-engagement content
    crossPlatformBonus: 1.3;       // 30% bonus for multi-platform sharing
  };
}
```

This SOLAR token revenue sharing mechanism creates a sustainable, transparent, and incentive-aligned system that rewards content creators while maintaining platform viability and growth. The automated distribution system ensures timely payouts while the security framework prevents fraud and abuse.
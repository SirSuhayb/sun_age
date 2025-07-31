# Affiliate Tracking System for Content Sharing in Solara

## 🎯 Executive Summary

This document outlines a comprehensive affiliate tracking system for Solara users who share journal entries, guidance activities, and other content. The system will enable routing $SOLAR tokens and percentage-based revenue from subscribers and content purchasers to content creators and affiliates.

## 📊 Current Infrastructure Analysis

### Existing Systems in Solara:
1. **Basic Referral System**: Already implemented in `solarEarnings.ts`
   - Referral codes (e.g., "SOL12345")
   - 5000 SOLAR bonus per referral
   - Achievement tracking for referrers

2. **Content Sharing Infrastructure**: 
   - Journal entry sharing via `journal_shares` table
   - Share URL generation and tracking
   - Social media integration with OG images

3. **Payment Systems**:
   - Stripe integration for fiat payments
   - SOLAR token payment processing
   - Purchase tracking in `roll_purchases` table

4. **Affiliate Marketing Framework**:
   - Already implemented affiliate links in Surprise Me feature
   - Support for Amazon Associates, Webflow, Visme, etc.
   - Commission tracking structure ready

## 🏗️ Proposed Affiliate System Architecture

### 1. Multi-Tier Affiliate Tracking

#### **Tier 1: Content Creator Affiliates**
- Users who share journal entries, wisdom extracts, or guidance activities
- Earn SOLAR tokens when their shared content drives new signups or purchases
- Track attribution through unique share URLs and referral codes

#### **Tier 2: Product Affiliate Partners**
- Users who promote external affiliate products through Surprise Me
- Earn percentage-based commissions from Amazon, travel bookings, etc.
- Existing system already partially implemented

#### **Tier 3: Subscription Referral Program**
- Users who refer others to paid Solara features or subscriptions
- Earn ongoing percentage of subscription revenue
- Long-term revenue sharing model

### 2. Content-Based Attribution System

```typescript
interface ContentAffiliateTracking {
  shareId: string;                    // From existing journal_shares.id
  originalCreatorFid: number;         // Content creator
  referralCode: string;               // Generated referral code
  shareUrl: string;                   // Unique tracking URL
  contentType: 'journal' | 'wisdom' | 'guidance' | 'activity';
  
  // Attribution tracking
  visits: number;                     // URL clicks
  signups: number;                    // New user registrations
  purchases: number;                  // Resulting purchases
  
  // Revenue tracking
  totalRevenue: number;               // Total revenue generated
  affiliateEarnings: number;          // Creator's earnings
  commissionRate: number;             // Percentage earned (5-15%)
  
  // Time-based attribution
  attributionWindow: number;          // Days (default: 30)
  createdAt: Date;
  lastAttributedAt: Date;
}
```

### 3. Revenue Distribution Model

#### **Revenue Sources to Track:**
1. **New User Subscriptions**: 10% to content creator for 12 months
2. **Roll Purchases**: 5% to content creator for purchases within 30 days
3. **Affiliate Product Sales**: 20% of commission to content creator
4. **Premium Feature Upgrades**: 8% to content creator for first year

#### **SOLAR Token Distribution:**
```typescript
interface SolarRevenueSplit {
  contentCreator: {
    baseRate: 0.10;           // 10% of revenue
    bonusMultiplier: 1.5;     // 1.5x for legendary content
    maxMonthlyEarning: 50000; // 50K SOLAR cap per month
  };
  
  platform: {
    operationalFund: 0.70;    // 70% for platform operations
    communityPool: 0.15;      // 15% for community rewards
    treasuryReserve: 0.05;    // 5% for treasury
  };
}
```

## 🗄️ Database Schema Extensions

### New Tables Required:

#### 1. Content Affiliate Tracking
```sql
CREATE TABLE content_affiliate_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES journal_shares(id) ON DELETE CASCADE,
  creator_fid INTEGER NOT NULL,
  referral_code VARCHAR(12) UNIQUE NOT NULL,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('journal', 'wisdom', 'guidance', 'activity')),
  
  -- Attribution metrics
  total_visits INTEGER DEFAULT 0,
  total_signups INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  total_revenue DECIMAL(18,6) DEFAULT 0,
  
  -- Affiliate earnings
  total_affiliate_earnings DECIMAL(18,6) DEFAULT 0,
  commission_rate DECIMAL(5,4) DEFAULT 0.10, -- 10%
  attribution_window_days INTEGER DEFAULT 30,
  
  -- Status and timing
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_attributed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(share_id, creator_fid)
);
```

#### 2. Affiliate Attribution Events
```sql
CREATE TABLE affiliate_attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID REFERENCES content_affiliate_tracking(id),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('visit', 'signup', 'purchase', 'subscription')),
  
  -- Event details
  visitor_identifier TEXT, -- IP hash or anonymous ID
  attributed_user_fid INTEGER, -- If user signs up
  purchase_id UUID REFERENCES roll_purchases(id), -- If purchase made
  
  -- Revenue information
  revenue_amount DECIMAL(18,6),
  commission_earned DECIMAL(18,6),
  currency VARCHAR(10),
  
  -- Tracking details
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Affiliate Payouts
```sql
CREATE TABLE affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_fid INTEGER NOT NULL,
  
  -- Payout details
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_earnings DECIMAL(18,6) NOT NULL,
  
  -- Payment information
  payout_method VARCHAR(20) NOT NULL CHECK (payout_method IN ('solar_tokens', 'stripe_transfer', 'manual')),
  transaction_hash TEXT, -- For SOLAR token transfers
  stripe_transfer_id TEXT, -- For Stripe transfers
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Implementation Components

### 1. Enhanced Share URL Generation

```typescript
// Extend existing journal sharing functionality
export const generateAffiliateShareUrl = async (
  entryId: string, 
  userFid: number,
  contentType: 'journal' | 'wisdom' | 'guidance' | 'activity'
): Promise<string> => {
  // Generate unique referral code
  const referralCode = generateReferralCode(userFid);
  
  // Create affiliate tracking record
  const trackingRecord = await createAffiliateTracking({
    shareId: entryId,
    creatorFid: userFid,
    referralCode,
    contentType
  });
  
  // Generate tracking URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  return `${baseUrl}/share/${entryId}?ref=${referralCode}&t=${trackingRecord.id}`;
};

function generateReferralCode(userFid: number): string {
  const timestamp = Date.now().toString(36);
  const userSeed = userFid.toString(36);
  return `SOL${userSeed}${timestamp}`.toUpperCase().slice(0, 12);
}
```

### 2. Attribution Tracking Middleware

```typescript
// Add to middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Track affiliate visits
  if (pathname.startsWith('/share/') && searchParams.has('ref')) {
    const referralCode = searchParams.get('ref');
    const trackingId = searchParams.get('t');
    
    await trackAffiliateVisit({
      referralCode,
      trackingId,
      visitorId: await getAnonymousVisitorId(request),
      userAgent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer')
    });
  }
  
  return NextResponse.next();
}
```

### 3. Revenue Attribution Engine

```typescript
export class AffiliateRevenueEngine {
  
  async attributePurchase(
    purchaseId: string,
    userId: string,
    amount: number,
    currency: string
  ): Promise<void> {
    // Check for recent affiliate attribution
    const attribution = await this.findRecentAttribution(userId);
    
    if (attribution && this.isWithinWindow(attribution)) {
      const commission = amount * attribution.commissionRate;
      
      // Record attribution event
      await this.recordAttributionEvent({
        trackingId: attribution.id,
        eventType: 'purchase',
        attributedUserFid: userId,
        purchaseId,
        revenueAmount: amount,
        commissionEarned: commission,
        currency
      });
      
      // Credit affiliate
      await this.creditAffiliate(attribution.creatorFid, commission, currency);
    }
  }
  
  async processSolarTokenPayout(
    affiliateFid: number,
    amount: number
  ): Promise<string> {
    // Transfer SOLAR tokens to affiliate's wallet
    const userWallet = await this.getUserWallet(affiliateFid);
    
    if (!userWallet) {
      throw new Error('User must connect wallet to receive SOLAR payouts');
    }
    
    return await this.transferSolarTokens(userWallet, amount);
  }
}
```

## 📈 Enhanced Earnings Dashboard

### Creator Analytics Dashboard

```typescript
interface CreatorAffiliateStats {
  totalEarnings: {
    solarTokens: number;
    fiatValue: number;
    lifetimeCommissions: number;
  };
  
  contentPerformance: {
    topPerformingShares: ContentShare[];
    averageClickThrough: number;
    conversionRate: number;
    revenuePerShare: number;
  };
  
  monthlyTrends: {
    earnings: MonthlyEarning[];
    traffic: MonthlyTraffic[];
    conversions: MonthlyConversion[];
  };
  
  payoutHistory: AffiliatePayout[];
}
```

## 🎮 Gamification & Incentives

### Creator Tier System

```typescript
enum CreatorTier {
  EMERGING = 'emerging',     // 0-1K SOLAR earned
  RISING = 'rising',         // 1K-10K SOLAR earned
  ESTABLISHED = 'established', // 10K-50K SOLAR earned
  INFLUENTIAL = 'influential', // 50K-200K SOLAR earned
  LEGENDARY = 'legendary'    // 200K+ SOLAR earned
}

interface TierBenefits {
  commissionBonus: number;   // Additional % on top of base rate
  exclusiveFeatures: string[];
  prioritySupport: boolean;
  customBranding: boolean;
}
```

### Achievement System Extensions

```typescript
const affiliateAchievements = {
  firstReferral: { bonus: 2000, title: "First Share Success" },
  viral: { bonus: 10000, title: "Viral Content Creator" }, // 1000+ clicks
  converter: { bonus: 15000, title: "Conversion Master" },  // 10%+ conversion rate
  consistent: { bonus: 25000, title: "Consistent Creator" }, // 30-day streak
  topEarner: { bonus: 50000, title: "Top 1% Earner" }
};
```

## 🔄 Integration with Existing Systems

### 1. Enhanced SolarEarnings.ts Integration

```typescript
// Extend existing SolarEarnings interface
interface SolarEarnings {
  // ... existing fields ...
  
  affiliateStats: {
    totalAffiliateEarnings: number;
    activeReferralCodes: string[];
    topPerformingContent: string[];
    currentTier: CreatorTier;
    monthlyCommissions: number;
  };
}
```

### 2. Surprise Me Feature Enhancement

```typescript
// Extend ActionableStep interface
interface ActionableStep {
  // ... existing fields ...
  
  // Enhanced affiliate tracking
  affiliateAttribution?: {
    originalCreator: number;      // FID of content creator
    shareSource: string;          // Where the content was shared
    attributionChain: string[];   // Full attribution path
  };
}
```

## 💰 Revenue Projections & Business Impact

### Conservative Monthly Projections (1000 DAU)

```typescript
interface AffiliateRevenueForecast {
  assumptions: {
    dailyActiveUsers: 1000;
    contentSharers: 100;          // 10% of users share content
    averageSharesPerUser: 3;      // Per month
    clickThroughRate: 0.08;       // 8% of shares get clicks
    conversionRate: 0.03;         // 3% of clicks convert
    averageOrderValue: 25;        // USD
    affiliateCommissionRate: 0.10; // 10%
  };
  
  monthlyProjections: {
    totalShares: 300;             // 100 * 3
    totalClicks: 24;              // 300 * 0.08
    totalConversions: 1;          // 24 * 0.03 (rounded up)
    totalRevenue: 25;             // 1 * 25
    totalAffiliatePayouts: 2.5;   // 25 * 0.10
    solarTokensDistributed: 2500; // Equivalent in SOLAR
  };
}
```

### Optimistic Scenario (10x Growth)

- **Monthly Affiliate Payouts**: $250 USD / 25,000 SOLAR tokens
- **Top Creator Earnings**: $50-100 per month
- **Platform Revenue**: Increased user engagement and retention
- **Network Effects**: More quality content → more users → more revenue

## 🛡️ Compliance & Risk Management

### Legal Considerations

1. **FTC Compliance**: Clear affiliate disclosure on all shared content
2. **Tax Reporting**: 1099 forms for affiliates earning >$600/year
3. **International Compliance**: Country-specific affiliate marketing laws
4. **Platform Policies**: Compliance with social media affiliate rules

### Risk Mitigation

```typescript
interface AffiliateRiskManagement {
  fraudDetection: {
    clickFraudPrevention: boolean;
    ipAddressMonitoring: boolean;
    behaviorAnalysis: boolean;
    manualReviewThreshold: number; // $100 monthly earnings
  };
  
  qualityControl: {
    contentModeration: boolean;
    spamPrevention: boolean;
    userReputationScoring: boolean;
    appealProcess: boolean;
  };
}
```

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Database schema creation
- [ ] Basic affiliate URL generation
- [ ] Attribution tracking middleware
- [ ] Simple dashboard integration

### Phase 2: Core Features (Weeks 3-4)
- [ ] Revenue attribution engine
- [ ] SOLAR token payout system
- [ ] Creator analytics dashboard
- [ ] Automated commission calculations

### Phase 3: Advanced Features (Weeks 5-6)
- [ ] Tier system and gamification
- [ ] Advanced fraud detection
- [ ] Mobile app integration
- [ ] Social media optimization

### Phase 4: Scale & Optimize (Weeks 7-8)
- [ ] Performance optimization
- [ ] International expansion support
- [ ] Advanced analytics and ML
- [ ] Integration with external platforms

## 📊 Success Metrics

### Key Performance Indicators

1. **Adoption Metrics**
   - Number of active affiliate creators
   - Content sharing frequency
   - Referral code usage rate

2. **Revenue Metrics**
   - Total affiliate commissions paid
   - Revenue per affiliate creator
   - Conversion rate improvements

3. **Engagement Metrics**
   - Click-through rates on shared content
   - Time spent on referred traffic
   - User retention from affiliates

4. **Quality Metrics**
   - Content quality scores
   - User satisfaction ratings
   - Fraud/spam detection rates

## 🔮 Future Enhancements

### Advanced Features Pipeline

1. **AI-Powered Optimization**
   - Content recommendation engine
   - Dynamic commission optimization
   - Predictive earnings modeling

2. **Cross-Platform Integration**
   - TikTok, Instagram, YouTube integration
   - Email marketing automation
   - Podcast sponsorship tracking

3. **Community Features**
   - Affiliate creator forums
   - Collaboration tools
   - Mentorship programs

4. **Enterprise Features**
   - White-label affiliate systems
   - API for external integrations
   - Custom reporting and analytics

This comprehensive affiliate tracking system will transform Solara into a creator-economy platform where users are rewarded for sharing valuable content and driving platform growth, while maintaining the authentic, wisdom-focused community that makes Solara unique.
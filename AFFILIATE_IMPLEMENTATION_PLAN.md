# Affiliate Tracking Implementation Plan for Solara

## 🎯 Executive Summary

This implementation plan provides a step-by-step roadmap for building a comprehensive affiliate tracking system in Solara that enables routing $SOLAR tokens and revenue percentages to content creators who share journal entries, guidance activities, and other content.

## 📋 Project Overview

### Goals
1. **Enable Revenue Sharing**: Route 10-15% of platform revenue to content creators
2. **Track Attribution**: Monitor how shared content drives new users and purchases
3. **Automate Payouts**: Distribute SOLAR tokens monthly to qualifying affiliates
4. **Prevent Fraud**: Implement security measures to ensure fair play
5. **Scale Creator Economy**: Build sustainable incentives for content sharing

### Success Metrics
- 100+ active content creators within 3 months
- 5% of new signups attributed to content sharing
- $500+ monthly SOLAR token distribution
- <1% fraud/abuse rate
- 4.5+ user satisfaction score for affiliate program

## 🗓️ Implementation Timeline (8 Weeks)

### Phase 1: Foundation (Weeks 1-2)
**Goal**: Set up core infrastructure and basic tracking

#### Week 1: Database & Backend Setup
- [ ] **Day 1-2**: Deploy affiliate tracking database schema
- [ ] **Day 3-4**: Create core TypeScript interfaces and types
- [ ] **Day 5-7**: Build basic affiliate tracking service

#### Week 2: URL Generation & Attribution
- [ ] **Day 1-3**: Implement affiliate URL generation for journal shares
- [ ] **Day 4-5**: Add attribution tracking middleware
- [ ] **Day 6-7**: Create basic analytics endpoints

### Phase 2: Core Features (Weeks 3-4)
**Goal**: Build attribution engine and payout system

#### Week 3: Revenue Attribution Engine
- [ ] **Day 1-3**: Build revenue attribution algorithm
- [ ] **Day 4-5**: Integrate with existing payment systems
- [ ] **Day 6-7**: Add commission calculation logic

#### Week 4: SOLAR Token Distribution
- [ ] **Day 1-3**: Implement SOLAR token payout engine
- [ ] **Day 4-5**: Add wallet connection requirements
- [ ] **Day 6-7**: Build monthly payout processor

### Phase 3: User Experience (Weeks 5-6)
**Goal**: Create creator dashboard and sharing enhancements

#### Week 5: Creator Dashboard
- [ ] **Day 1-3**: Build affiliate earnings dashboard
- [ ] **Day 4-5**: Add performance analytics views
- [ ] **Day 6-7**: Implement tier progression display

#### Week 6: Enhanced Sharing
- [ ] **Day 1-3**: Upgrade journal sharing with affiliate tracking
- [ ] **Day 4-5**: Add social media optimization
- [ ] **Day 6-7**: Implement achievement system

### Phase 4: Security & Scale (Weeks 7-8)
**Goal**: Add fraud detection and optimization

#### Week 7: Security Implementation
- [ ] **Day 1-3**: Build fraud detection system
- [ ] **Day 4-5**: Add velocity limits and behavior analysis
- [ ] **Day 6-7**: Implement security review workflows

#### Week 8: Launch & Optimization
- [ ] **Day 1-3**: Performance optimization and testing
- [ ] **Day 4-5**: Launch to beta users
- [ ] **Day 6-7**: Monitor, iterate, and scale

## 🏗️ Technical Implementation Details

### 1. Database Implementation

#### Step 1: Deploy Schema
```bash
# Run the affiliate tracking schema
psql $DATABASE_URL -f database/affiliate_tracking_schema.sql

# Verify tables created
psql $DATABASE_URL -c "\dt affiliate*"
```

#### Step 2: Update Existing Tables
```sql
-- Add referral tracking to existing journal_shares
ALTER TABLE journal_shares 
ADD COLUMN affiliate_tracking_id UUID REFERENCES content_affiliate_tracking(id);

-- Add affiliate attribution to roll_purchases
ALTER TABLE roll_purchases 
ADD COLUMN attributed_to_affiliate_fid INTEGER;
```

### 2. Backend Service Implementation

#### Core Affiliate Service
```typescript
// src/lib/affiliateTracking.ts
export class AffiliateTrackingService {
  
  async createAffiliateShare(
    shareId: string,
    creatorFid: number,
    contentType: string
  ): Promise<AffiliateTrackingRecord> {
    const referralCode = this.generateReferralCode(creatorFid);
    
    // Create tracking record
    const trackingRecord = await supabase
      .from('content_affiliate_tracking')
      .insert({
        share_id: shareId,
        creator_fid: creatorFid,
        referral_code: referralCode,
        content_type: contentType,
        share_url: this.generateTrackingUrl(shareId, referralCode)
      })
      .select()
      .single();
      
    return trackingRecord.data;
  }
  
  async trackVisit(
    referralCode: string,
    visitorId: string,
    metadata: VisitMetadata
  ): Promise<void> {
    // Find tracking record
    const tracking = await this.findByReferralCode(referralCode);
    if (!tracking) return;
    
    // Record visit event
    await supabase
      .from('affiliate_attribution_events')
      .insert({
        tracking_id: tracking.id,
        event_type: 'visit',
        visitor_identifier: this.hashVisitorId(visitorId),
        user_agent: metadata.userAgent,
        referrer_url: metadata.referrer,
        landing_page: metadata.landingPage
      });
      
    // Update visit count
    await this.incrementVisitCount(tracking.id);
  }
}
```

#### Revenue Attribution Engine
```typescript
// src/lib/revenueAttribution.ts
export class RevenueAttributionEngine {
  
  async attributePurchase(
    purchaseId: string,
    userId: string,
    amount: number
  ): Promise<AttributionResult[]> {
    // Find recent attributions for user
    const recentAttributions = await this.findUserAttributions(userId, 30);
    
    const results: AttributionResult[] = [];
    
    for (const attribution of recentAttributions) {
      const commission = await this.calculateCommission(
        attribution,
        amount
      );
      
      if (commission > 0) {
        // Record attribution event
        await this.recordAttributionEvent({
          trackingId: attribution.id,
          eventType: 'purchase',
          attributedUserFid: userId,
          purchaseId,
          revenueAmount: amount,
          commissionEarned: commission
        });
        
        results.push({
          creatorFid: attribution.creatorFid,
          commissionUsd: commission,
          commissionSolar: await this.convertToSolar(commission)
        });
      }
    }
    
    return results;
  }
}
```

### 3. Frontend Integration

#### Enhanced Journal Sharing
```typescript
// src/components/Journal/ShareButton.tsx
export function ShareButton({ entry }: { entry: JournalEntry }) {
  const [affiliateUrl, setAffiliateUrl] = useState<string>('');
  
  const generateAffiliateShare = async () => {
    const response = await fetch('/api/affiliate/create-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entryId: entry.id,
        contentType: 'journal'
      })
    });
    
    const { shareUrl } = await response.json();
    setAffiliateUrl(shareUrl);
  };
  
  return (
    <div className="share-container">
      <button onClick={generateAffiliateShare}>
        📤 Share & Earn SOLAR
      </button>
      
      {affiliateUrl && (
        <div className="affiliate-share-details">
          <p>Share this link to earn 10% of resulting purchases:</p>
          <input value={affiliateUrl} readOnly />
          <p className="earning-potential">
            💰 Potential earnings: Up to 500 SOLAR per referral
          </p>
        </div>
      )}
    </div>
  );
}
```

#### Creator Dashboard
```typescript
// src/components/Affiliate/CreatorDashboard.tsx
export function CreatorDashboard() {
  const { data: stats } = useAffiliateStats();
  
  return (
    <div className="creator-dashboard">
      <div className="earnings-overview">
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <div className="amount">
            {stats.totalSolarEarned} SOLAR
          </div>
          <div className="usd-equivalent">
            ≈ ${stats.totalUsdValue}
          </div>
        </div>
        
        <div className="stat-card">
          <h3>This Month</h3>
          <div className="amount">
            {stats.monthlyEarnings} SOLAR
          </div>
          <div className="growth">
            +{stats.monthlyGrowth}% from last month
          </div>
        </div>
      </div>
      
      <div className="tier-progression">
        <h3>Creator Tier: {stats.currentTier}</h3>
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${stats.tierProgress * 100}%` }}
          />
        </div>
        <p>
          {stats.progressToNextTier}% to {stats.nextTier} tier
        </p>
      </div>
      
      <div className="top-content">
        <h3>Top Performing Shares</h3>
        {stats.topShares.map(share => (
          <div key={share.id} className="share-item">
            <div className="share-title">{share.title}</div>
            <div className="share-stats">
              {share.visits} visits • {share.conversions} conversions
              • {share.earnings} SOLAR earned
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. API Endpoints

#### Create Affiliate Share
```typescript
// src/app/api/affiliate/create-share/route.ts
export async function POST(request: NextRequest) {
  const { entryId, contentType } = await request.json();
  const userFid = getUserFidFromAuth(request);
  
  try {
    // Create or get existing affiliate tracking
    const tracking = await affiliateService.createAffiliateShare(
      entryId,
      userFid,
      contentType
    );
    
    return NextResponse.json({
      success: true,
      shareUrl: tracking.share_url,
      referralCode: tracking.referral_code,
      trackingId: tracking.id
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create affiliate share' },
      { status: 500 }
    );
  }
}
```

#### Track Attribution
```typescript
// src/app/api/affiliate/track/route.ts
export async function POST(request: NextRequest) {
  const { referralCode, eventType, metadata } = await request.json();
  
  try {
    await affiliateService.trackEvent(referralCode, eventType, metadata);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
```

#### Get Creator Stats
```typescript
// src/app/api/affiliate/stats/route.ts
export async function GET(request: NextRequest) {
  const userFid = getUserFidFromAuth(request);
  
  try {
    const stats = await affiliateService.getCreatorStats(userFid);
    
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
```

### 5. SOLAR Token Distribution

#### Monthly Payout Processor
```typescript
// src/lib/payoutProcessor.ts
export class PayoutProcessor {
  
  async processMonthlyPayouts(): Promise<PayoutResult> {
    console.log('Starting monthly payout processing...');
    
    // 1. Calculate all affiliate earnings for last month
    const affiliateEarnings = await this.calculateMonthlyEarnings();
    
    // 2. Filter by minimum threshold
    const eligiblePayouts = affiliateEarnings.filter(
      earning => earning.totalSolar >= 1000
    );
    
    // 3. Process SOLAR token transfers
    const results = await Promise.allSettled(
      eligiblePayouts.map(payout => this.processSolarPayout(payout))
    );
    
    // 4. Record results
    await this.recordPayoutBatch(results);
    
    console.log(`Processed ${eligiblePayouts.length} payouts`);
    return this.generatePayoutSummary(results);
  }
  
  private async processSolarPayout(payout: AffiliatePayout): Promise<string> {
    // Check if user has connected wallet
    const wallet = await this.getUserWallet(payout.affiliateFid);
    
    if (!wallet) {
      // Store as pending payout
      await this.storePendingPayout(payout);
      throw new Error('No wallet connected');
    }
    
    // Transfer SOLAR tokens
    const tx = await this.solarContract.transfer(
      wallet,
      ethers.parseUnits(payout.totalSolar.toString(), 18)
    );
    
    await tx.wait();
    
    // Update payout record
    await this.updatePayoutStatus(payout.id, 'completed', tx.hash);
    
    return tx.hash;
  }
}
```

#### Scheduled Job Setup
```typescript
// scripts/monthly-payouts.ts
import { PayoutProcessor } from '../src/lib/payoutProcessor';

async function runMonthlyPayouts() {
  const processor = new PayoutProcessor();
  
  try {
    const result = await processor.processMonthlyPayouts();
    
    console.log('Monthly payouts completed:', result);
    
    // Send notification to admin
    await sendAdminNotification({
      type: 'payout_completed',
      summary: result
    });
    
  } catch (error) {
    console.error('Monthly payout failed:', error);
    
    // Send error notification
    await sendAdminNotification({
      type: 'payout_failed',
      error: error.message
    });
  }
}

// Run if called directly
if (require.main === module) {
  runMonthlyPayouts();
}
```

### 6. Middleware Integration

#### Attribution Tracking Middleware
```typescript
// src/middleware.ts (enhanced)
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Track affiliate visits
  if (searchParams.has('ref')) {
    const referralCode = searchParams.get('ref');
    const trackingId = searchParams.get('t');
    
    if (referralCode && trackingId) {
      // Track the visit asynchronously
      trackAffiliateVisit({
        referralCode,
        trackingId,
        visitorId: generateVisitorId(request),
        userAgent: request.headers.get('user-agent'),
        referrer: request.headers.get('referer'),
        landingPage: pathname
      }).catch(error => {
        console.error('Failed to track affiliate visit:', error);
      });
    }
  }
  
  return NextResponse.next();
}

async function trackAffiliateVisit(data: VisitTrackingData) {
  await fetch(`${process.env.NEXT_PUBLIC_URL}/api/affiliate/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'visit',
      ...data
    })
  });
}
```

## 🔧 Integration Points

### 1. Enhanced Journal Sharing
- Modify existing `shareJournalEntry` function to include affiliate tracking
- Add affiliate URL generation to share flow
- Update share modals with earning potential information

### 2. Payment System Integration
- Hook into existing Stripe payment success handlers
- Modify SOLAR token payment processing to trigger attribution
- Add affiliate attribution to purchase confirmation emails

### 3. User Dashboard Integration
- Add "Creator Earnings" section to existing user dashboard
- Include affiliate stats in user profile
- Add tier progression indicators

### 4. Achievement System Integration
- Extend existing achievement system with affiliate milestones
- Add SOLAR token rewards for affiliate achievements
- Include affiliate performance in user stats

## 🛡️ Security & Fraud Prevention

### 1. Velocity Monitoring
```typescript
// Check for suspicious earning patterns
async function checkVelocityLimits(creatorFid: number): Promise<SecurityCheck> {
  const recentEarnings = await getRecentEarnings(creatorFid, 7); // 7 days
  
  if (recentEarnings > 5000) { // 5K SOLAR per week limit
    return {
      passed: false,
      reason: 'Weekly earning limit exceeded',
      requiresReview: true
    };
  }
  
  return { passed: true };
}
```

### 2. Behavior Analysis
```typescript
// Detect click farms and bot traffic
async function analyzeTrafficPatterns(trackingId: string): Promise<FraudScore> {
  const visits = await getRecentVisits(trackingId, 24); // 24 hours
  
  const uniqueIPs = new Set(visits.map(v => v.ipHash)).size;
  const totalVisits = visits.length;
  
  // Suspicious if too many visits from same IP
  const ipRatio = uniqueIPs / totalVisits;
  
  if (ipRatio < 0.3 && totalVisits > 50) {
    return {
      score: 0.8, // High fraud risk
      reason: 'High visit concentration from few IPs'
    };
  }
  
  return { score: 0.1 }; // Low fraud risk
}
```

### 3. Manual Review Triggers
- Monthly earnings > 10,000 SOLAR
- Sudden traffic spikes > 300% normal
- Multiple accounts from same IP/device
- Reported suspicious activity

## 📊 Analytics & Monitoring

### 1. Key Metrics Dashboard
```typescript
interface AffiliateAnalytics {
  totalActiveCreators: number;
  monthlyRevenueAttributed: number;
  averageConversionRate: number;
  topPerformingContent: ContentShare[];
  fraudDetectionRate: number;
  payoutSuccessRate: number;
}
```

### 2. Performance Monitoring
- Track API response times for affiliate endpoints
- Monitor SOLAR token transfer success rates
- Alert on fraud detection threshold breaches
- Track user satisfaction with affiliate program

### 3. Business Intelligence
- Revenue attribution by content type
- Creator tier distribution and progression
- Geographic performance analysis
- Seasonal trending in affiliate performance

## 🚀 Launch Strategy

### Beta Launch (Week 8)
1. **Invite 20 top content creators** to beta test the system
2. **Set conservative limits**: 1K SOLAR minimum, 10K maximum monthly
3. **Monitor closely**: Daily check-ins on performance and issues
4. **Gather feedback**: Regular surveys and feedback sessions

### Full Launch (Week 10)
1. **Open to all users** with proven sharing history
2. **Increase limits**: Scale based on treasury capacity
3. **Marketing campaign**: Promote creator economy features
4. **Scale infrastructure**: Optimize for increased volume

### Growth Phase (Week 12+)
1. **Cross-platform expansion**: Twitter, YouTube, TikTok integration
2. **Advanced features**: AI-powered content optimization
3. **Partnership program**: Collaborate with major content creators
4. **International expansion**: Multi-currency support

## 💰 Revenue & Business Impact

### Conservative Projections (Monthly)
- **Active Creators**: 100
- **Attributed Revenue**: $2,000
- **Affiliate Payouts**: $300 (15%)
- **SOLAR Tokens Distributed**: ~30,000
- **Platform Growth**: +5% new user signups

### Optimistic Projections (6 Months)
- **Active Creators**: 500
- **Attributed Revenue**: $15,000
- **Affiliate Payouts**: $2,250 (15%)
- **SOLAR Tokens Distributed**: ~225,000
- **Platform Growth**: +25% new user signups

### ROI Analysis
- **Implementation Cost**: ~160 hours development
- **Monthly Operating Cost**: ~$100 (infrastructure)
- **Expected Revenue Increase**: +20-30% from viral growth
- **Payback Period**: 3-4 months

## 🎯 Success Criteria

### Technical Success
- [ ] 99.9% uptime for affiliate tracking
- [ ] <100ms response time for attribution APIs
- [ ] 100% successful SOLAR token distributions
- [ ] <1% false positive fraud detection rate

### Business Success
- [ ] 100+ active content creators by month 3
- [ ] 10% of new signups attributed to content sharing
- [ ] 4.5+ Net Promoter Score for affiliate program
- [ ] 25%+ increase in content sharing volume

### User Success
- [ ] Clear earnings attribution and transparency
- [ ] Easy-to-use sharing and tracking tools
- [ ] Fair and timely payout processing
- [ ] Responsive support for affiliate questions

This implementation plan provides a comprehensive roadmap for building a robust affiliate tracking system that will transform Solara into a true creator economy platform while maintaining the authentic, wisdom-focused community experience that makes Solara unique.
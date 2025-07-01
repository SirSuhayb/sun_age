# Affiliate Product Recommendation System

## Overview
Transform every astrological insight and activity recommendation into monetizable product suggestions through intelligent Amazon affiliate integration.

## Core Product Architecture

### 1. Product Database Structure

```typescript
// src/types/products.ts
export interface AffiliateProduct {
  id: string;
  asin: string; // Amazon Standard Identification Number
  title: string;
  description: string;
  price: number;
  image_url: string;
  amazon_url: string;
  affiliate_link: string;
  
  // Astrological alignment
  astrological_tags: AstroTag[];
  element_alignment: Element[];
  sign_compatibility: ZodiacSign[];
  planetary_associations: Planet[];
  
  // Categorization
  primary_category: ProductCategory;
  subcategories: string[];
  usage_context: UsageContext[];
  
  // Quality metrics
  amazon_rating: number;
  review_count: number;
  best_seller_rank?: number;
  prime_eligible: boolean;
  
  // Targeting
  target_demographics: Demographic[];
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  price_tier: 'budget' | 'mid_range' | 'premium';
  
  // Performance tracking
  click_through_rate: number;
  conversion_rate: number;
  commission_rate: number;
  last_updated: Date;
}

export interface ProductCategory {
  astrology_books: {
    beginner_guides: AffiliateProduct[];
    advanced_texts: AffiliateProduct[];
    sign_specific: Map<ZodiacSign, AffiliateProduct[]>;
    chart_interpretation: AffiliateProduct[];
  };
  
  outdoor_gear: {
    hiking_equipment: AffiliateProduct[];
    camping_supplies: AffiliateProduct[];
    astronomy_tools: AffiliateProduct[];
    gardening_supplies: AffiliateProduct[];
  };
  
  wellness_products: {
    crystals_and_stones: AffiliateProduct[];
    essential_oils: AffiliateProduct[];
    meditation_supplies: AffiliateProduct[];
    yoga_equipment: AffiliateProduct[];
  };
  
  creative_supplies: {
    art_materials: AffiliateProduct[];
    journaling_tools: AffiliateProduct[];
    craft_supplies: AffiliateProduct[];
    music_instruments: AffiliateProduct[];
  };
  
  home_organization: {
    planners_calendars: AffiliateProduct[];
    storage_solutions: AffiliateProduct[];
    cleaning_supplies: AffiliateProduct[];
    feng_shui_items: AffiliateProduct[];
  };
}
```

### 2. Smart Recommendation Engine

```typescript
// src/lib/affiliateRecommendation.ts
export class AffiliateRecommendationEngine {
  private products: Map<string, AffiliateProduct> = new Map();
  private userPurchaseHistory: Map<string, PurchaseHistory> = new Map();
  
  public async generateProductRecommendations(
    context: RecommendationContext
  ): Promise<ProductRecommendation[]> {
    
    // Multi-factor scoring algorithm
    const candidates = await this.findCandidateProducts(context);
    const scoredProducts = await this.scoreProducts(candidates, context);
    const optimizedSelection = this.optimizeSelection(scoredProducts, context);
    
    return optimizedSelection;
  }
  
  private async scoreProducts(
    products: AffiliateProduct[],
    context: RecommendationContext
  ): Promise<ScoredProduct[]> {
    
    return products.map(product => {
      const astroScore = this.calculateAstrologicalAlignment(product, context.user_chart);
      const contextScore = this.calculateContextualRelevance(product, context);
      const qualityScore = this.calculateQualityScore(product);
      const performanceScore = this.calculatePerformanceScore(product);
      const priceScore = this.calculatePriceScore(product, context.budget_preference);
      
      const totalScore = (
        astroScore * 0.30 +
        contextScore * 0.25 +
        qualityScore * 0.20 +
        performanceScore * 0.15 +
        priceScore * 0.10
      );
      
      return {
        product,
        total_score: totalScore,
        scores: { astroScore, contextScore, qualityScore, performanceScore, priceScore },
        reasoning: this.generateProductReasoning(product, context, totalScore)
      };
    });
  }
  
  private calculateAstrologicalAlignment(
    product: AffiliateProduct,
    chart: NatalChart
  ): number {
    let score = 0;
    
    // Element alignment
    const userElements = this.extractDominantElements(chart);
    const elementMatch = product.element_alignment.some(e => userElements.includes(e));
    if (elementMatch) score += 0.4;
    
    // Sign compatibility
    const userSigns = [chart.sunSign, chart.moonSign, chart.risingSign];
    const signMatch = product.sign_compatibility.some(s => userSigns.includes(s));
    if (signMatch) score += 0.3;
    
    // Planetary associations
    const userPlanets = this.getProminentPlanets(chart);
    const planetMatch = product.planetary_associations.some(p => userPlanets.includes(p));
    if (planetMatch) score += 0.3;
    
    return Math.min(score, 1.0);
  }
}
```

### 3. Context-Aware Product Matching

```typescript
interface ProductMatcher {
  // Activity-based recommendations
  matchToActivity(activity: Activity): ProductRecommendation[] {
    const productCategories = this.getProductCategoriesForActivity(activity);
    const recommendations = [];
    
    // Essential gear
    if (activity.required_equipment.length > 0) {
      recommendations.push(...this.findProductsForEquipment(
        activity.required_equipment,
        'essential'
      ));
    }
    
    // Enhancement products
    if (activity.optional_equipment.length > 0) {
      recommendations.push(...this.findProductsForEquipment(
        activity.optional_equipment,
        'enhancement'
      ));
    }
    
    // Learning materials
    recommendations.push(...this.findLearningMaterials(activity));
    
    return recommendations;
  }
  
  // Transit-based recommendations
  matchToTransit(transit: Transit, chart: NatalChart): ProductRecommendation[] {
    const recommendations = [];
    
    switch (transit.type) {
      case 'mercury_retrograde':
        recommendations.push(
          ...this.getProducts(['backup_electronics', 'organization_tools', 'journal_supplies']),
          ...this.getBooks(['communication', 'mindfulness', 'patience'])
        );
        break;
        
      case 'venus_return':
        recommendations.push(
          ...this.getProducts(['beauty_products', 'relationship_books', 'art_supplies']),
          ...this.getWellnessProducts(['self_love', 'aromatherapy'])
        );
        break;
        
      case 'mars_transit':
        recommendations.push(
          ...this.getProducts(['fitness_equipment', 'energy_supplements']),
          ...this.getBooks(['motivation', 'leadership', 'goal_setting'])
        );
        break;
    }
    
    return recommendations;
  }
  
  // Seasonal recommendations
  matchToSeason(season: Season, element: Element): ProductRecommendation[] {
    const seasonalMap = {
      spring: {
        fire: ['fitness_equipment', 'outdoor_gear', 'goal_planners'],
        earth: ['gardening_supplies', 'cooking_tools', 'organization'],
        air: ['learning_materials', 'communication_tools', 'social_games'],
        water: ['artistic_supplies', 'emotional_healing_books', 'meditation']
      },
      summer: {
        fire: ['adventure_gear', 'sports_equipment', 'travel_accessories'],
        earth: ['outdoor_cooking', 'preservation_tools', 'craft_supplies'],
        air: ['festival_gear', 'social_accessories', 'tech_gadgets'],
        water: ['cooling_products', 'water_activities', 'emotional_wellness']
      },
      fall: {
        fire: ['warm_clothing', 'indoor_fitness', 'motivation_books'],
        earth: ['harvest_tools', 'preservation_supplies', 'comfort_items'],
        air: ['study_materials', 'communication_upgrades', 'planning_tools'],
        water: ['introspection_books', 'cozy_supplies', 'healing_products']
      },
      winter: {
        fire: ['warming_products', 'indoor_activities', 'energy_support'],
        earth: ['comfort_foods', 'home_organization', 'practical_books'],
        air: ['learning_subscriptions', 'planning_materials', 'social_tools'],
        water: ['meditation_gear', 'emotional_support', 'introspective_tools']
      }
    };
    
    return this.getProducts(seasonalMap[season][element]);
  }
}
```

### 4. Smart Product Bundling

```typescript
interface ProductBundler {
  createElementalBundles(): ProductBundle[] {
    return [
      {
        id: 'fire_starter_bundle',
        name: 'Fire Energy Activation Kit',
        theme: 'Ignite your inner fire and take bold action',
        products: [
          this.getProduct('red_jasper_crystal'),
          this.getProduct('energizing_essential_oil_blend'),
          this.getProduct('goal_setting_planner'),
          this.getProduct('motivation_book'),
          this.getProduct('fitness_tracker')
        ],
        total_value: 127.95,
        bundle_price: 99.95,
        savings: 28.00,
        target_signs: ['Aries', 'Leo', 'Sagittarius']
      },
      
      {
        id: 'earth_grounding_bundle',
        name: 'Earth Connection Essentials',
        theme: 'Ground yourself and connect with natural abundance',
        products: [
          this.getProduct('herb_garden_starter_kit'),
          this.getProduct('grounding_crystals_set'),
          this.getProduct('practical_craft_book'),
          this.getProduct('organization_planner'),
          this.getProduct('natural_skincare_set')
        ],
        total_value: 156.80,
        bundle_price: 129.95,
        savings: 26.85,
        target_signs: ['Taurus', 'Virgo', 'Capricorn']
      }
    ];
  }
  
  createActivityBundles(activity: Activity): ProductBundle {
    const bundleName = `${activity.name} Complete Experience`;
    const essentialProducts = this.getEssentialProducts(activity);
    const enhancementProducts = this.getEnhancementProducts(activity);
    const learningProducts = this.getLearningProducts(activity);
    
    return {
      id: `bundle_${activity.id}`,
      name: bundleName,
      theme: `Everything you need for ${activity.name.toLowerCase()}`,
      products: [...essentialProducts, ...enhancementProducts, ...learningProducts],
      astrological_alignment: activity.primary_element,
      activity_reference: activity.id
    };
  }
}
```

### 5. Amazon API Integration

```typescript
// src/lib/amazonAffiliate.ts
export class AmazonAffiliateService {
  private affiliateTag: string;
  private accessKeyId: string;
  private secretAccessKey: string;
  
  constructor() {
    this.affiliateTag = process.env.AMAZON_AFFILIATE_TAG!;
    this.accessKeyId = process.env.AMAZON_ACCESS_KEY_ID!;
    this.secretAccessKey = process.env.AMAZON_SECRET_ACCESS_KEY!;
  }
  
  public async searchProducts(
    keywords: string[],
    category?: string,
    priceRange?: [number, number]
  ): Promise<AmazonProduct[]> {
    
    const searchParams = {
      Keywords: keywords.join(' '),
      SearchIndex: category || 'All',
      AssociateTag: this.affiliateTag,
      MinPrice: priceRange?.[0],
      MaxPrice: priceRange?.[1],
      ItemPage: 1,
      ResponseGroup: 'Images,ItemAttributes,Offers,Reviews'
    };
    
    const response = await this.makeProductAdvertisingAPICall(
      'ItemSearch',
      searchParams
    );
    
    return this.parseProductResponse(response);
  }
  
  public generateAffiliateLink(asin: string, customId?: string): string {
    const baseUrl = 'https://www.amazon.com/dp/';
    const affiliateParams = new URLSearchParams({
      tag: this.affiliateTag,
      linkCode: 'as1',
      creative: '9325',
      creativeASIN: asin
    });
    
    if (customId) {
      affiliateParams.set('ascsubtag', customId);
    }
    
    return `${baseUrl}${asin}?${affiliateParams.toString()}`;
  }
  
  public async trackClick(
    user: User,
    product: AffiliateProduct,
    context: string
  ): Promise<void> {
    await this.analyticsService.trackEvent({
      event: 'affiliate_click',
      user_id: user.id,
      product_asin: product.asin,
      context: context,
      timestamp: new Date(),
      potential_commission: product.price * product.commission_rate
    });
  }
}
```

### 6. Smart Product Display Components

```typescript
// src/components/ProductRecommendations.tsx
export function ProductRecommendationCard({ 
  recommendation, 
  context 
}: {
  recommendation: ProductRecommendation;
  context: 'activity' | 'insight' | 'transit' | 'seasonal';
}) {
  const product = recommendation.product;
  
  return (
    <div className="border border-gray-300 p-3 bg-white hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="relative mb-3">
        <img 
          src={product.image_url} 
          alt={product.title}
          className="w-full h-32 object-cover"
        />
        <div className="absolute top-2 right-2 bg-[#d4af37] text-black text-xs font-mono px-2 py-1">
          {Math.round(recommendation.score * 100)}% MATCH
        </div>
      </div>
      
      {/* Product Info */}
      <div className="mb-3">
        <h4 className="font-serif font-bold text-sm leading-tight mb-1">
          {product.title}
        </h4>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg font-bold text-[#d4af37]">
            ${product.price}
          </span>
          {product.prime_eligible && (
            <span className="text-xs bg-blue-600 text-white px-1">Prime</span>
          )}
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <span>⭐ {product.amazon_rating.toFixed(1)}</span>
          <span className="mx-1">•</span>
          <span>{product.review_count.toLocaleString()} reviews</span>
        </div>
      </div>
      
      {/* Astrological Reasoning */}
      <div className="bg-[#fffcf2] border border-[#d4af37] p-2 mb-3">
        <div className="text-xs font-mono text-[#b8860b] uppercase mb-1">
          Cosmic Alignment
        </div>
        <div className="text-xs text-gray-700">
          {recommendation.reasoning}
        </div>
      </div>
      
      {/* Action Button */}
      <button
        onClick={() => handleProductClick(product, context)}
        className="w-full py-2 bg-[#d4af37] text-black font-mono text-sm uppercase border border-black hover:bg-[#e6c75a] transition-colors"
      >
        View on Amazon
      </button>
    </div>
  );
}

// Contextual product displays
export function ActivityProductSuggestions({ activity }: { activity: Activity }) {
  const [products, setProducts] = useState<ProductRecommendation[]>([]);
  
  useEffect(() => {
    loadProductsForActivity(activity).then(setProducts);
  }, [activity]);
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-mono text-gray-600 uppercase tracking-wider mb-3">
        Recommended Gear
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {products.slice(0, 4).map(recommendation => (
          <ProductRecommendationCard 
            key={recommendation.product.id}
            recommendation={recommendation}
            context="activity"
          />
        ))}
      </div>
    </div>
  );
}

export function TransitProductSuggestions({ 
  transit, 
  userChart 
}: { 
  transit: Transit; 
  userChart: NatalChart; 
}) {
  const [products, setProducts] = useState<ProductRecommendation[]>([]);
  
  useEffect(() => {
    loadProductsForTransit(transit, userChart).then(setProducts);
  }, [transit, userChart]);
  
  if (products.length === 0) return null;
  
  return (
    <div className="mt-4 p-4 border border-gray-300 bg-white">
      <h3 className="text-lg font-serif font-bold mb-2">
        Navigate {transit.name} with Cosmic Tools
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {products.slice(0, 6).map(recommendation => (
          <ProductRecommendationCard 
            key={recommendation.product.id}
            recommendation={recommendation}
            context="transit"
          />
        ))}
      </div>
    </div>
  );
}
```

### 7. Revenue Optimization & Analytics

```typescript
// src/lib/affiliateAnalytics.ts
export class AffiliateAnalytics {
  public async trackProductPerformance(): Promise<ProductPerformanceReport> {
    const metrics = await this.database.query(`
      SELECT 
        p.asin,
        p.title,
        COUNT(c.id) as clicks,
        COUNT(pu.id) as purchases,
        SUM(pu.commission_earned) as total_commission,
        AVG(pr.score) as avg_recommendation_score
      FROM products p
      LEFT JOIN clicks c ON p.id = c.product_id
      LEFT JOIN purchases pu ON p.id = pu.product_id
      LEFT JOIN product_recommendations pr ON p.id = pr.product_id
      WHERE c.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id
      ORDER BY total_commission DESC
    `);
    
    return {
      top_performing_products: metrics.slice(0, 10),
      conversion_rates: this.calculateConversionRates(metrics),
      revenue_trends: await this.getRevenueTrends(),
      optimization_suggestions: this.generateOptimizationSuggestions(metrics)
    };
  }
  
  public async optimizeProductSelection(): Promise<OptimizationResults> {
    // A/B test different product recommendation algorithms
    const results = await this.runABTest([
      'astrological_heavy',
      'quality_focused', 
      'price_optimized',
      'engagement_driven'
    ]);
    
    return {
      winning_algorithm: results.best_performing,
      performance_lift: results.improvement_percentage,
      implementation_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week
    };
  }
}
```

### 8. Success Metrics & Targets

```typescript
interface AffiliateMetrics {
  // Engagement Metrics
  product_click_rate: number; // Target: 25% of users click product recommendations
  time_on_product_page: number; // Target: 60+ seconds average
  product_save_rate: number; // Target: 15% save products for later
  
  // Conversion Metrics  
  click_to_purchase_rate: number; // Target: 8% conversion rate
  average_order_value: number; // Target: $65 average order
  repeat_purchase_rate: number; // Target: 30% make second purchase
  
  // Revenue Metrics
  monthly_affiliate_revenue: number; // Target: $25k/month by month 6
  revenue_per_user: number; // Target: $15/month per active user
  commission_per_click: number; // Target: $2.50 per click
  
  // Quality Metrics
  product_rating_average: number; // Target: 4.2+ average rating
  return_rate: number; // Target: <5% return rate
  user_satisfaction_score: number; // Target: 85%+ satisfaction
}
```

This affiliate system creates natural monetization opportunities by:

1. **Matching products to astrological profiles** for authentic recommendations
2. **Integrating with activities and insights** to provide contextual value
3. **Using smart bundling** to increase average order value
4. **Optimizing through analytics** to maximize conversion rates
5. **Maintaining user trust** through quality-focused recommendations

The system generates revenue while genuinely enhancing the user's cosmic journey with helpful products and tools.
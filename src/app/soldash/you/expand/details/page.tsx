'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Calendar, Target, Zap, TrendingUp, Heart, Star } from 'lucide-react';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Generate detailed analysis based on chart and Sol data
const generateDetailedAnalysis = (chartData: any, solData: any) => {
  const sunSign = chartData?.sun?.sign || 'Aquarius';
  const moonSign = chartData?.moon?.sign || 'Pisces';
  const risingSign = chartData?.rising?.sign || 'Gemini';
  const archetype = solData?.archetype || 'Sol Innovator';
  const foundation = solData?.foundation || 'Builder Foundation';
  const depth = solData?.depth || 'Alchemist Depth';
  const phase = solData?.phase || 'Current Phase (Ages 28–35)';

  return {
    lifeFocus: {
      title: "Life Focus & Purpose",
      icon: Target,
      content: `Your ${sunSign} Sun combined with ${moonSign} Moon creates a unique blend that aligns with your ${archetype} identity. Your ${foundation} provides the practical framework for manifesting your vision, while your ${depth} adds transformational wisdom. This cosmic signature points to a life purpose centered around bridging innovation with intuitive understanding.`,
      keyPoints: [
        `${archetype} energy drives your core mission`,
        `${foundation} provides practical manifestation skills`,
        `${depth} offers transformational insights`,
        `${sunSign}-${moonSign} combination enhances spiritual innovation`
      ]
    },
    energyRhythms: {
      title: "Energy Rhythms & Cycles",
      icon: Zap,
      content: `Your energy operates in distinct cycles influenced by your ${risingSign} Rising and ${phase}. The interplay between your ${archetype} nature and current life phase creates unique rhythms that optimize when you take action versus when you integrate insights.`,
      keyPoints: [
        `${moonSign} Moon creates emotional cycles every 28 days`,
        `${risingSign} Rising influences daily energy patterns`,
        `${phase} brings specific developmental focus`,
        `${archetype} energy peaks during innovation periods`
      ]
    },
    naturalStrengths: {
      title: "Natural Strengths & Talents",
      icon: Star,
      content: `Your ${archetype} nature combined with ${depth} reveals exceptional abilities that are enhanced by your ${sunSign}-${moonSign}-${risingSign} configuration. Your ${foundation} provides the practical skills to ground your visionary insights into reality.`,
      keyPoints: [
        `${archetype} brings innovative leadership abilities`,
        `${foundation} provides practical manifestation skills`,
        `${depth} offers transformational healing gifts`,
        `${risingSign} enhances communication and adaptability`
      ]
    },
    annualResets: {
      title: "Annual Reset Periods",
      icon: Calendar,
      content: `Your ${archetype} nature experiences powerful reset periods that align with both astrological transits and your personal Sol cycle. These periods are optimal for major life changes and breakthrough innovations.`,
      periods: [
        { name: "Sol Birthday Reset", date: "Personal Birthday", description: `${archetype} renewal and vision setting` },
        { name: "Mid-Year Recalibration", date: "6 months after birthday", description: "Course correction and manifestation check-in" },
        { name: "Seasonal Alignment", date: "Solstices & Equinoxes", description: "Natural rhythm synchronization" }
      ]
    },
    growthPhases: {
      title: "Life Growth Phases",
      icon: TrendingUp,
      content: `Your ${phase} is part of a larger developmental cycle that integrates your ${archetype} evolution with traditional astrological timing. Each phase builds upon your ${foundation} while deepening your ${depth}.`,
      phases: [
        { age: "21-28", title: "Foundation Activation", description: `Establishing ${foundation} in the world` },
        { age: "28-35", title: `${archetype} Emergence`, description: "Manifesting unique gifts and innovations" },
        { age: "35-42", title: `${depth} Integration`, description: "Deepening transformational abilities" },
        { age: "42-49", title: "Master Synthesis", description: "Combining all elements for maximum impact" }
      ]
    },
    relationships: {
      title: "Relationship Patterns",
      icon: Heart,
      content: `Your relationship style reflects both your ${moonSign} Moon emotional needs and your ${archetype} mission. You attract partners who can support your ${foundation} work while appreciating your ${depth} insights.`,
      keyPoints: [
        `${archetype} attracts fellow innovators and visionaries`,
        `${moonSign} Moon needs emotional depth and understanding`,
        `${risingSign} Rising creates adaptable communication style`,
        `${depth} draws those seeking transformation`
      ]
    }
  };
};

const ExpandableSection = ({ section, isExpanded, onToggle }: any) => {
  const Icon = section.icon;
  
  return (
    <motion.div 
      className="bg-white border border-[#D7D7D7] mb-4"
      variants={itemVariants}
    >
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-[#FCF6E5] transition-colors"
      >
        <div className="flex items-center">
          <Icon className="w-6 h-6 text-[#E6B13A] mr-3" />
          <h3 className="text-lg font-serif font-semibold text-[#444]">{section.title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#888]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#888]" />
        )}
      </button>
      
      {isExpanded && (
        <motion.div 
          className="px-6 pb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-[#444] mb-4 leading-relaxed">{section.content}</p>
          
          {section.keyPoints && (
            <div className="mb-4">
              <h4 className="font-serif font-semibold text-[#444] mb-2">Key Points:</h4>
              <ul className="space-y-2">
                {section.keyPoints.map((point: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-[#E6B13A] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-sm text-[#666]">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {section.periods && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.periods.map((period: any, index: number) => (
                <div key={index} className="p-3 bg-[#FCF6E5] border border-[#E5E1D8]">
                  <div className="font-serif font-semibold text-sm text-[#444] mb-1">{period.name}</div>
                  <div className="text-xs font-mono text-[#E6B13A] mb-2">{period.date}</div>
                  <div className="text-xs text-[#666]">{period.description}</div>
                </div>
              ))}
            </div>
          )}
          
          {section.phases && (
            <div className="space-y-3">
              {section.phases.map((phase: any, index: number) => (
                <div key={index} className="flex items-start p-3 bg-[#FCF6E5] border border-[#E5E1D8]">
                  <div className="font-mono text-sm text-[#E6B13A] mr-3 flex-shrink-0">{phase.age}</div>
                  <div>
                    <div className="font-serif font-semibold text-sm text-[#444] mb-1">{phase.title}</div>
                    <div className="text-xs text-[#666]">{phase.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default function DetailsPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    lifeFocus: true // Start with first section expanded
  });
  const [chartData, setChartData] = useState<any>(null);
  const [solData, setSolData] = useState<any>(null);

  useEffect(() => {
    // Get chart data and Sol profile data
    const savedChartData = localStorage.getItem('chartData');
    const savedSolData = localStorage.getItem('sunCycleBookmark');
    
    if (savedChartData) {
      setChartData(JSON.parse(savedChartData));
    }
    
    if (savedSolData) {
      setSolData(JSON.parse(savedSolData));
    }
  }, []);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#FEFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div className="flex items-center mb-8" variants={itemVariants}>
          <Link href="/soldash/you/expand/chart" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-[#888]" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-semibold">Advanced Sol Analysis</h1>
            <p className="text-sm text-[#666] font-mono">Deep insights into your cosmic signature</p>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div 
          className="bg-gradient-to-r from-[#FCF6E5] to-[#F5F5F5] border border-[#E5E1D8] p-6 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-xl font-serif font-semibold text-[#444] mb-3">Your Complete Cosmic Profile</h2>
          <p className="text-[#666] leading-relaxed">
            This detailed analysis combines your birth chart data with Sol Dash&apos;s advanced algorithms to provide 
            personalized insights into your life patterns, optimal timing, and evolutionary path. Each section 
            reveals different aspects of your cosmic signature and how to work with your natural rhythms.
          </p>
        </motion.div>

        {/* Expandable Sections */}
        <div className="space-y-0">
          {chartData || solData ? (
            Object.entries(generateDetailedAnalysis(chartData, solData)).map(([key, section]) => (
              <ExpandableSection
                key={key}
                section={section}
                isExpanded={expandedSections[key]}
                onToggle={() => toggleSection(key)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-lg font-serif text-[#444] mb-2">Loading your personalized analysis...</div>
              <div className="text-sm text-[#666]">Integrating your chart data with Sol profile</div>
            </div>
          )}
        </div>

        {/* Summary & Next Steps */}
        <motion.div 
          className="bg-white border border-[#D7D7D7] p-8 mt-8"
          variants={itemVariants}
        >
          <h3 className="text-xl font-serif font-semibold text-[#444] mb-4 text-center">
            Integration & Next Steps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-serif font-semibold text-[#444] mb-3">Immediate Actions</h4>
              <ul className="space-y-2 text-sm text-[#666]">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#E6B13A] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Schedule creative work during your optimal energy hours (2-6 PM)
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#E6B13A] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Plan major decisions around your annual reset periods
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#E6B13A] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Align projects with your 28-day emotional cycles
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-serif font-semibold text-[#444] mb-3">Long-term Development</h4>
              <ul className="space-y-2 text-sm text-[#666]">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#E6B13A] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Develop both analytical and intuitive decision-making skills
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#E6B13A] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Seek roles that combine innovation with humanitarian impact
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-[#E6B13A] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Build relationships that support both intellectual and emotional growth
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div className="text-center mt-8" variants={itemVariants}>
          <Link href="/soldash/you/expand/chart" className="text-[#888] font-mono text-sm hover:text-[#666]">
            ← Back to Your Chart
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
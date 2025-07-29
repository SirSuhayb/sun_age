'use client';
import React, { useState } from 'react';
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

// Mock detailed analysis data
const detailedAnalysis = {
  lifeFocus: {
    title: "Life Focus & Purpose",
    icon: Target,
    content: "Your Aquarius Sun combined with Pisces Moon creates a unique blend of innovation and intuition. You're drawn to humanitarian causes and have a natural ability to envision a better future for humanity. Your life purpose centers around bringing visionary ideas into reality through compassionate action.",
    keyPoints: [
      "Natural humanitarian instincts",
      "Visionary thinking and future-focused mindset", 
      "Bridge between logic and intuition",
      "Called to serve collective evolution"
    ]
  },
  energyRhythms: {
    title: "Energy Rhythms & Cycles",
    icon: Zap,
    content: "Your energy operates in distinct cycles influenced by your Gemini Rising. You have periods of intense creative output followed by necessary recharge phases. Understanding these rhythms helps you optimize productivity and maintain emotional balance.",
    keyPoints: [
      "28-day emotional cycles (Pisces Moon influence)",
      "Weekly intellectual peaks (Gemini Rising)",
      "Seasonal shifts affect innovation capacity",
      "Daily energy best from 2-6 PM"
    ]
  },
  naturalStrengths: {
    title: "Natural Strengths & Talents",
    icon: Star,
    content: "Your chart reveals exceptional abilities in communication, innovation, and emotional intelligence. You possess rare combination of analytical thinking and intuitive insight, making you excellent at problem-solving and understanding complex human dynamics.",
    keyPoints: [
      "Exceptional communication skills",
      "Innovative problem-solving approach",
      "High emotional and social intelligence",
      "Natural counseling and healing abilities"
    ]
  },
  annualResets: {
    title: "Annual Reset Periods",
    icon: Calendar,
    content: "Your personal new year begins around your birthday in February, but you experience additional reset periods during summer solstice and autumn equinox. These are optimal times for major life changes and new project launches.",
    periods: [
      { name: "Primary Reset", date: "February 15-28", description: "Major life planning and goal setting" },
      { name: "Mid-Year Recalibration", date: "June 20-July 5", description: "Course correction and creative breakthrough" },
      { name: "Autumn Integration", date: "September 21-October 5", description: "Harvesting insights and preparing for next phase" }
    ]
  },
  growthPhases: {
    title: "Life Growth Phases",
    icon: TrendingUp,
    content: "Your chart indicates distinct 7-year cycles of development, with major transitions occurring at ages 21, 28, 35, 42, and 49. Each phase brings specific lessons and opportunities for expansion.",
    phases: [
      { age: "21-28", title: "Foundation Building", description: "Establishing identity and core beliefs" },
      { age: "28-35", title: "Creative Expression", description: "Manifesting unique gifts and talents" },
      { age: "35-42", title: "Leadership Emergence", description: "Taking on greater responsibilities and influence" },
      { age: "42-49", title: "Mastery Integration", description: "Combining all skills for maximum impact" }
    ]
  },
  relationships: {
    title: "Relationship Patterns",
    icon: Heart,
    content: "Your relationship style is characterized by deep emotional connection (Pisces Moon) combined with intellectual stimulation needs (Gemini Rising). You attract partners who appreciate both your innovative thinking and emotional depth.",
    keyPoints: [
      "Seeks partners who share humanitarian values",
      "Needs both intellectual and emotional connection",
      "Tendency to be the counselor in relationships",
      "Attracts creative and spiritually-minded individuals"
    ]
  }
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
            This detailed analysis combines your birth chart data with Sol Dash's advanced algorithms to provide 
            personalized insights into your life patterns, optimal timing, and evolutionary path. Each section 
            reveals different aspects of your cosmic signature and how to work with your natural rhythms.
          </p>
        </motion.div>

        {/* Expandable Sections */}
        <div className="space-y-0">
          {Object.entries(detailedAnalysis).map(([key, section]) => (
            <ExpandableSection
              key={key}
              section={section}
              isExpanded={expandedSections[key]}
              onToggle={() => toggleSection(key)}
            />
          ))}
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
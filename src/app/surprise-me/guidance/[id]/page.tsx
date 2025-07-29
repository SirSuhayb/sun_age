'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, Star, Zap } from 'lucide-react';
import type { DailyRoll } from '~/lib/surpriseMe';
import Image from 'next/image';
import { solarEarningsManager } from '~/lib/solarEarnings';
import ProductImage from '@/components/ProductImage';
import { PulsingStarSpinner } from '~/components/ui/PulsingStarSpinner';
import { surpriseMeFramework } from '~/lib/surpriseMe';

export default function GuidancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [rollData, setRollData] = useState<DailyRoll | null>(null);
  const [hasCompletedGuidance, setHasCompletedGuidance] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const { id } = use(params);

  useEffect(() => {
    // Load roll data from localStorage
    const today = new Date().toDateString();
    const storedRolls = localStorage.getItem(`dailyRolls_${today}`);
    if (storedRolls) {
      const parsed = JSON.parse(storedRolls);
      const currentRoll = parsed.history?.find((roll: DailyRoll) => roll.id === id);
      if (currentRoll) {
        // Migrate old structure to new structure if needed
        const migratedRoll = migrateOldStructure(currentRoll);
        setRollData(migratedRoll);
      }
    }

    // DEV ONLY: If no roll found in localStorage, try to create one from the framework
    if (!rollData && process.env.NODE_ENV === 'development') {
      surpriseMeFramework.getArchetypeActivities('Sol Innovator').then(allActivities => {
        const devRoll = allActivities.find(activity => activity.id === id);
        if (devRoll) {
          setRollData(devRoll);
        }
      });
    }

    // Check if guidance has already been completed today
    const earnings = solarEarningsManager.getEarnings();
    const todayGuidanceDate = new Date().toDateString();
    const todayGuidance = earnings.earningsHistory.filter(h => h.date === todayGuidanceDate && h.bonusType === 'guidance');
    if (todayGuidance.length > 0) {
      setHasCompletedGuidance(true);
    }
  }, [id, rollData]); // Added rollData back to dependencies

  // Migration function to handle old data structure
  const migrateOldStructure = (roll: any): DailyRoll => {
    // If it already has the new structure, return as is
    if (roll.freeItems && roll.nicheItems) {
      return roll;
    }

    // Migrate from old structure
    const migratedRoll = { ...roll };
    
    // Extract products from actionableSteps to nicheItems
    const products = roll.actionableSteps?.filter((step: any) => step.type === 'product') || [];
    migratedRoll.nicheItems = products;
    
    // Remove products from actionableSteps
    migratedRoll.actionableSteps = roll.actionableSteps?.filter((step: any) => step.type !== 'product') || [];
    
    // Add default freeItems if not present
    if (!migratedRoll.freeItems) {
      migratedRoll.freeItems = ['Voice memo app or Solara Journal'];
    }

    return migratedRoll;
  };

  const handleCompleteGuidance = () => {
    if (!rollData) return;
    
    // Award SOLAR for guidance completion
    const guidanceEarnings = solarEarningsManager.awardGuidanceCompletion(rollData.rarity, rollData.title);
    
    // Show completion message
    alert(`Guidance completed! You earned ${guidanceEarnings.totalEarned} SOLAR.`);
    
    setHasCompletedGuidance(true);
    router.push('/soldash');
  };

  const handleAddReflection = () => {
    setShowReflectionModal(true);
  };

  const handleShareReflection = async () => {
    if (!reflectionText.trim()) {
      alert('Please add a reflection before sharing.');
      return;
    }

    // Here you would implement the sharing logic
    // For now, we'll just complete the guidance
    if (!rollData) return;
    
    // Award SOLAR for guidance completion
    const guidanceEarnings = solarEarningsManager.awardGuidanceCompletion(rollData.rarity, rollData.title);
    
    // Show completion message
    alert(`Reflection shared! You earned ${guidanceEarnings.totalEarned} SOLAR for completing your guidance.`);
    
    setHasCompletedGuidance(true);
    setShowReflectionModal(false);
    router.push('/soldash');
  };

  if (!rollData) {
    return (
      <div className="min-h-screen bg-[#FFFCF2]/50 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-serif text-gray-800 mb-4 flex items-center justify-center gap-2">
            <PulsingStarSpinner />
            Loading guidance...
            <PulsingStarSpinner />
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="text-sm text-gray-500 mt-4">
              Dev mode: If this persists, the activity may not exist in localStorage.
              <br />
              Try rolling first or check the activity ID: {id}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF2]/50 backdrop-blur-sm relative z-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="text-gray-700 hover:text-black transition-colors font-mono text-sm uppercase tracking-wide"
        >
          ← BACK TO ORACLE
        </button>
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-black text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-8 py-8">
        {/* Activity Details */}
        <div className="text-center mb-8">
          {/* Icon */}
          <div className="text-4xl mb-3">{rollData.icon}</div>
          
          {/* Rarity */}
          <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">
            {rollData.rarity} {rollData.type}
          </div>
          
          {/* Title */}
          <div className="font-serif text-2xl font-bold text-black mb-4">
            {rollData.title}
          </div>

          {/* Quote */}
          <div className="border border-gray-300 bg-white/80 italic font-serif text-xl text-gray-700 px-3 py-4 mb-4 text-center">
            &ldquo;{rollData.quote || 'Let the cosmos guide your next step.'}&rdquo;
          </div>

          {/* Description */}
          <div className="font-serif text-lg text-[#5F5F5F] text-left leading-tight">
            {rollData.description}
          </div>
        </div>

        {/* TAKE ACTION Section */}
        <div className="mt-8 mb-8">
          <h2 className="font-mono text-sm uppercase tracking-widest text-center mb-4">TAKE ACTION</h2>
          <div className="space-y-3">
            {/* Regular steps (prompts) */}
            {rollData.actionableSteps?.filter(step => step.type === 'prompt').map((step, index) => (
              <div key={index} className="border-l-[5px] border-[#B18500]/35 bg-[#B18500]/5 p-4">
                <div className="font-mono text-sm text-[#8F6F0F]">
                  {step.content}
                </div>
              </div>
            ))}
            
            {/* Research links - only the original oracle.md links */}
            {rollData.actionableSteps?.filter(step => step.type === 'link' && step.label.toLowerCase().includes('research failed')).map((step, index) => (
              <div key={index} className="border border-[#DBD3BC] bg-[#FCF6E5] p-4">
                <div className="font-mono text-sm uppercase tracking-widest text-[#8F6F0F] mb-2">RESEARCH</div>
                <div className="font-serif text-base text-[#8F6F0F]">
                  {step.url ? (
                    <a href={step.url} target="_blank" rel="noopener noreferrer" className="underline">
                      {step.content}
                    </a>
                  ) : (
                    <span>{step.content}</span>
                  )}
                </div>
              </div>
            ))}
            
            {/* Optional Reading links - all the curated articles */}
            {rollData.actionableSteps?.filter(step => step.type === 'link' && !step.label.toLowerCase().includes('research failed')).map((step, index) => (
              <div key={index} className="border border-[#DBD3BC] bg-[#FCF6E5] p-4">
                <div className="font-mono text-sm uppercase tracking-widest text-[#8F6F0F] mb-2">OPTIONAL READING</div>
                <div className="font-serif text-base text-[#8F6F0F]">
                  {step.url ? (
                    <a href={step.url} target="_blank" rel="noopener noreferrer" className="underline">
                      {step.content}
                    </a>
                  ) : (
                    <span>{step.content}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT YOU NEED Section */}
        <div className="mt-8 mb-8">
          <h2 className="font-mono text-sm uppercase tracking-widest text-center mb-4">WHAT YOU NEED</h2>
          
          {/* Essentials */}
          <div className="mb-4">
            <div className="border border-gray-200 bg-gray-50 p-4">
              <div className="font-mono text-sm uppercase tracking-widest text-blue-600 mb-2">ESSENTIALS:</div>
              <div className="font-mono text-sm text-blue-600">
                {rollData.freeItems?.map((item, index) => (
                  <div key={index}>
                    {item}
                  </div>
                )) || (
                  <div>Voice memo app or Solara Journal</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Additional Tools - only render if there are niche items */}
          {rollData.nicheItems && rollData.nicheItems.length > 0 && (
            <div className="mb-4">
              {/* Big Container - Contains everything */}
              <div className="bg-[#FFFDF6] border border-[#9CA3AF]/40 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-mono text-sm uppercase tracking-widest text-blue-600">ADDITIONAL TOOLS:</div>
                  <div className="flex gap-2">
                    {rollData.nicheItems && rollData.nicheItems.length >= 4 && (
                      <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-300">
                        LEGENDARY BUNDLE ✨
                      </div>
                    )}
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      CURATED BY SOL SU ☀️
                    </div>
                  </div>
                </div>
                
                {/* Horizontal Carousel for Products */}
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {rollData.nicheItems.map((product, index) => (
                    <div key={index} className="flex-shrink-0 w-[calc(100vw-2rem)] max-w-[320px] flex flex-col">
                      {/* Small White Container INSIDE the beige container - Product Image */}
                      <div className="relative border border-gray-200 bg-white h-48 mb-3 flex items-center justify-center overflow-hidden">
                        <ProductImage 
                          productImage={product.productImage}
                          productName={product.label}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      
                      <div className="flex flex-col flex-grow">
                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-mono text-sm mb-1 line-clamp-2">
                          {product.label}
                        </a>
                        <span className="text-blue-600 font-mono text-sm mb-3">{product.price}</span>
                        
                        {/* CTA Button - anchored to bottom */}
                        <div className="mt-auto">
                          <a 
                            href={product.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-white text-black font-mono text-xs uppercase tracking-widest border border-gray-300 hover:bg-gray-100 transition-colors text-center"
                          >
                            BUY
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ONCE YOU'VE FINISHED Section */}
        <div className="mb-8">
          <h2 className="font-mono text-sm uppercase tracking-widest text-center mb-4">ONCE YOU&apos;VE FINISHED</h2>
          
          <div 
            className="w-full"
            style={{
              background: '#FCF6E5',
              borderTop: '5px solid #DBD3BC',
              borderLeft: '1px solid #DBD3BC',
              borderRight: '1px solid #DBD3BC',
              borderBottom: '1px solid #DBD3BC',
              boxSizing: 'border-box',
            }}
          >
            <div className="px-6 pt-6 pb-2">
              {/* Header with starlight icons */}
              <div className="flex items-center justify-center mb-4 gap-2">
                <Image src="/journal/small_starlight.svg" alt="starlight" width={28} height={28} className="inline-block" />
                <span className="text-2xl font-serif font-normal text-black text-center" style={{ letterSpacing: '-0.04em' }}>
                  Abri Mathos is asking...
                </span>
                <Image src="/journal/small_starlight.svg" alt="starlight" width={28} height={28} className="inline-block" />
              </div>
              {/* Prompt */}
              <div className="text-2xl mt-2 mb-4 font-gt-alpina-italic text-center" style={{ color: '#5F5F5F', letterSpacing: '-0.02em' }}>
                {rollData.journalPrompt || 'What impossible idea downloaded during your lightning session?'}
              </div>
            </div>
            {/* CTA Button */}
            <div className="w-full bg-[#FFFDF6] px-0 py-4 flex items-center justify-center border-t border-[#DBD3BC]">
              <button 
                onClick={handleAddReflection}
                className="w-full text-center text-sm font-mono text-black underline underline-offset-2 tracking-widest bg-transparent border-none rounded-none hover:text-gray-700 transition-colors cursor-pointer uppercase"
              >
                ADD A REFLECTION
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="space-y-3">
          <button
            onClick={handleCompleteGuidance}
            disabled={hasCompletedGuidance}
            className={`w-full font-mono font-base uppercase text-sm py-4 border transition-colors ${
              hasCompletedGuidance 
                ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                : 'bg-[#d4af37] text-black border-[#d4af37] hover:bg-[#e6c75a]'
            }`}
          >
            {hasCompletedGuidance ? 'GUIDANCE COMPLETED' : 'COMPLETE GUIDANCE'}
          </button>
          <button
            onClick={() => router.push('/soldash')}
            className="w-full bg-white text-black font-mono font-base uppercase text-sm py-4 border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            SAVE FOR LATER
          </button>
        </div>
      </div>

      {/* Reflection Modal - Journal-Styled */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-[99999] flex justify-center items-end w-screen h-screen top-0 left-0">
          {/* Sunrise gradient overlay */}
          <div className="absolute inset-0 bg-solara-sunrise" />
          
          {/* Modal with journal styling */}
          <div className="relative z-10 backdrop-blur-md bg-[#FFFCF2]/50 border border-gray-200 w-full max-w-md h-[95vh] max-h-[800px] flex flex-col animate-slide-up">
            
            {/* Header */}
            <div className="flex-shrink-0 p-6 pb-4">
              <div className="relative flex justify-center items-center">
                <div className="text-center">
                  <h3 className="text-xl font-mono text-black">GUIDANCE REFLECTION</h3>
                  <p className="text-sm text-gray-500 font-mono">
                    {rollData?.title}
                  </p>
                </div>
                <button 
                  onClick={() => setShowReflectionModal(false)} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col px-6 overflow-y-auto">
              {/* Prompt Display */}
              <div className="mb-6 p-4 border border-gray-200 bg-[#FFFCF2]/50 backdrop-blur-md">
                <div className="text-xs font-semibold tracking-widest text-yellow-700 mb-2">GUIDANCE PROMPT</div>
                <p className="text-black font-serif text-xl tracking-[-0.04em]">
                  {rollData?.journalPrompt || 'What impossible idea downloaded during your lightning session?'}
                </p>
              </div>

              {/* Textarea */}
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Share your experience with this guidance..."
                className="flex-grow w-full bg-transparent text-black placeholder-gray-500/80 p-2 text-2xl font-serif focus:outline-none resize-none tracking-[-0.02em] placeholder:text-2xl placeholder:italic"
              />
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-6 pt-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReflectionModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-mono text-sm uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareReflection}
                  className="flex-1 px-4 py-3 bg-[#d4af37] text-black font-mono text-sm uppercase tracking-widest hover:bg-[#e6c75a] transition-colors"
                >
                  Share & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
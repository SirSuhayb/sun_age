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
import { NotificationManager } from '~/lib/notifications';
import ProductImage from '@/components/ProductImage';
import { PulsingStarSpinner } from '~/components/ui/PulsingStarSpinner';
import { surpriseMeFramework } from '~/lib/surpriseMe';
import { getSolarArchetype } from '~/lib/solarIdentity';
import EntryPreviewModalClient from '~/components/Journal/EntryPreviewModalClient';
import { JournalEntryEditor } from '~/components/Journal/JournalEntryEditor';
import { useJournal } from '~/hooks/useJournal';
import { useFrameSDK } from '~/hooks/useFrameSDK';
import { Toast } from '~/components/ui/toast';
import { SuccessModal } from '~/components/ui/SuccessModal';

export default function GuidancePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [rollData, setRollData] = useState<DailyRoll | null>(null);
  const [hasCompletedGuidance, setHasCompletedGuidance] = useState(false);

  const [editingEntry, setEditingEntry] = useState<any>(null);
  
  // Toast and modal state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{ title: string; message: string; solarEarned?: number } | null>(null);
  const { id } = use(params);

  // Get user's sol age from localStorage
  const [userSolAge, setUserSolAge] = useState<number>(1);
  
  useEffect(() => {
    try {
      const bookmark = localStorage.getItem('sunCycleBookmark');
      if (bookmark) {
        const parsed = JSON.parse(bookmark);
        setUserSolAge(parsed.days || 1);
      }
    } catch (e) {
      console.error('Error parsing bookmark:', e);
    }
  }, []);

  // Get journal functions
  const { createEntry, updateEntry, migrateLocalEntries, entries, loadEntries } = useJournal();
  
  // Get Farcaster context
  const { context, sdk, isInFrame } = useFrameSDK();
  
  console.log('[Guidance] Frame SDK values:', {
    hasContext: !!context,
    hasSdk: !!sdk,
    isInFrame,
    userFid: context?.user?.fid
  });
  
  // Get userFid from Farcaster context or dev override
  const isDev = process.env.NODE_ENV === 'development';
  const farcasterUserFid = context?.user?.fid;
  const devUserFid = isDev ? 5543 : undefined;
  const userFid = farcasterUserFid || devUserFid;

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
      // Try to get user's archetype from stored data
      const bookmark = localStorage.getItem('sunCycleBookmark');
      let userArchetype = 'Sol Innovator'; // Default fallback
      
      if (bookmark) {
        try {
          const parsed = JSON.parse(bookmark);
          if (parsed.birthDate) {
            userArchetype = getSolarArchetype(parsed.birthDate);
          }
        } catch (error) {
          console.error('Error getting user archetype:', error);
        }
      }
      
      surpriseMeFramework.getArchetypeActivities(userArchetype).then(allActivities => {
        const devRoll = allActivities.find(activity => activity.id === id);
        if (devRoll) {
          setRollData(devRoll);
        }
      });
    }

    // Check if this specific guidance activity has already been completed today
    const earnings = solarEarningsManager.getEarnings();
    const todayGuidanceDate = new Date().toDateString();
    const todayGuidance = earnings.earningsHistory.filter(h => 
      h.date === todayGuidanceDate && 
      h.bonusType === 'guidance' && 
      h.reason.includes(id)
    );
    if (todayGuidance.length > 0) {
      setHasCompletedGuidance(true);
    }

    // Reset guidance completion status daily
    const lastCompletionDate = localStorage.getItem(`guidance_${id}_lastCompletion`);
    if (lastCompletionDate !== today) {
      setHasCompletedGuidance(false);
      localStorage.setItem(`guidance_${id}_lastCompletion`, today);
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
    console.log('Opening journal entry editor for reflection');
    // Create a new journal entry for the reflection with guidance metadata
    const entry = {
      id: '',
      user_fid: 0, // This will be set when actually saving
      sol_day: userSolAge, // Use the user's actual sol age
      content: '',
      preservation_status: 'local',
      word_count: 0,
      created_at: new Date().toISOString(),
      // Add guidance metadata
      guidance_id: rollData?.id || '',
      guidance_title: rollData?.title || '',
      guidance_prompt: rollData?.journalPrompt || ''
    };
    setEditingEntry(entry);
  };

  const handleSaveForLater = async () => {
    if (!rollData) return;
    
    const notificationManager = NotificationManager.getInstance();
    
    // Request notification permission if not already granted
    const permissionGranted = await notificationManager.requestPermission();
    
    // Save guidance for later with reminder
    notificationManager.saveGuidanceForLater(
      rollData.id,
      rollData.title,
      rollData.journalPrompt || '',
      userFid // Pass userFid for Farcaster notifications
    );
    
    // Show success toast with context-aware message
    const isInFarcaster = typeof window !== 'undefined' && window.location.href.includes('farcaster');
    const message = isInFarcaster
      ? 'Guidance saved! You\'ll get a Farcaster notification tomorrow at 10 AM.'
      : permissionGranted 
        ? 'Guidance saved! You\'ll get a reminder tomorrow at 10 AM.' 
        : 'Guidance saved! Enable notifications to get reminders.';
    
    setToast({ 
      message,
      type: 'success' 
    });
    
    // Navigate to main sol oracle page
    router.push('/surprise-me');
  };



  // Show the journal entry editor if editingEntry is set
  console.log('Checking editingEntry condition, current value:', editingEntry);
  if (editingEntry) {
    console.log('Rendering journal entry editor with entry:', editingEntry);
    return (
      <JournalEntryEditor
        entry={editingEntry}
                        onSave={async (entryToSave) => {
                  console.log('Saving entry:', entryToSave);
                  try {
                    if (editingEntry && editingEntry.id) {
                      // Update existing entry
                      await updateEntry(editingEntry.id, { content: entryToSave.content }, userFid);
                    } else {
                      // Create a new entry with guidance metadata
                      const newEntry = await createEntry({ 
                        content: entryToSave.content, 
                        sol_day: userSolAge,
                        guidance_id: rollData?.id || '',
                        guidance_title: rollData?.title || '',
                        guidance_prompt: rollData?.journalPrompt || ''
                      }, userFid);
                      // Update the editing entry state so future auto-saves update this entry, not create new ones
                      setEditingEntry(newEntry);
                    }
            
                    // Award SOLAR for guidance completion
                    if (rollData) {
                      const guidanceEarnings = solarEarningsManager.awardGuidanceCompletion(rollData.rarity, rollData.title);
                      console.log(`Reflection saved! You earned ${guidanceEarnings.totalEarned} SOLAR for completing your guidance.`);
                      setHasCompletedGuidance(true);
                    }
                    
                    // For guidance entries, we'll let the share flow handle navigation
                    // Don't navigate away yet - let the share flow take over
                  } catch (error) {
                    console.error('Error saving entry:', error);
                    setToast({ message: 'Failed to save reflection. Please try again.', type: 'error' });
                  }
                }}
                        onAutoSave={async (entryToSave) => {
                  console.log('Auto-saving entry:', entryToSave);
                  try {
                    if (editingEntry && editingEntry.id) {
                      // Update existing entry
                      await updateEntry(editingEntry.id, { content: entryToSave.content }, userFid);
                      // Update the editing entry state with the new content
                      setEditingEntry(prev => prev ? { ...prev, content: entryToSave.content } : null);
                    } else {
                      // Create a new entry with guidance metadata
                      const newEntry = await createEntry({ 
                        content: entryToSave.content, 
                        sol_day: userSolAge,
                        guidance_id: rollData?.id || '',
                        guidance_title: rollData?.title || '',
                        guidance_prompt: rollData?.journalPrompt || ''
                      }, userFid);
                      // Update the editing entry state so future auto-saves update this entry, not create new ones
                      setEditingEntry(newEntry);
                    }
                  } catch (error) {
                    console.error('Error auto-saving entry:', error);
                  }
                }}
        onFinish={() => {
          setEditingEntry(null);
          router.push('/soldash');
        }}
                                        onShare={async () => {
                  try {
                    // 1. First, ensure the entry is saved with the current content
                    console.log('[Guidance] Ensuring entry is saved before migration:', {
                      id: editingEntry.id,
                      content: editingEntry.content?.slice(0, 50) + '...',
                      guidance_id: editingEntry.guidance_id
                    });
                    
                    // Force save the entry to ensure content is updated
                    await updateEntry(editingEntry.id, { content: editingEntry.content }, userFid);
                    
                    // 2. Migrate local entries to database
                    console.log('[Guidance] Starting migration...');
                    const migrationResult = await migrateLocalEntries(userFid);
                    console.log('[Guidance] Migration result:', migrationResult);

                    // 3. Wait for migration to complete
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // 4. Find the synced entry by content matching
                    console.log('[Guidance] Finding synced entry...');
                    const apiResponse = await fetch(`/api/journal/entries?userFid=${userFid}`);
                    const apiData = await apiResponse.json();
                    const apiEntries = apiData.entries || [];
                    
                    console.log('[Guidance] Available API entries:', apiEntries.length);
                    
                    // Find the entry that was just migrated by matching content and guidance metadata
                    const syncedEntry = apiEntries.find(entry => 
                      entry.content === editingEntry.content && 
                      entry.preservation_status === 'synced' &&
                      entry.guidance_id === editingEntry.guidance_id
                    );

                    if (!syncedEntry) {
                      console.error('[Guidance] Could not find synced entry. Available entries:', apiEntries);
                      setToast({ message: 'Entry not found after migration. Please try again.', type: 'error' });
                      return; // Don't throw, just show toast and return
                    }

                    console.log('[Guidance] Found synced entry:', {
                      id: syncedEntry.id,
                      content: syncedEntry.content?.slice(0, 50) + '...',
                      guidance_id: syncedEntry.guidance_id
                    });

                    // 5. Share the synced entry
                    const { composeAndShareEntry } = await import('~/lib/journal');
                    console.log('[Guidance] About to share synced entry:', {
                      entryId: syncedEntry.id,
                      sdk: !!sdk,
                      isInFrame,
                      userFid,
                      sdkType: typeof sdk,
                      isInFrameType: typeof isInFrame
                    });
                    await composeAndShareEntry(syncedEntry, sdk, isInFrame, userFid);

                    // 6. Show success modal and navigate
                    if (rollData) {
                      const guidanceEarnings = solarEarningsManager.awardGuidanceCompletion(rollData.rarity, rollData.title, id);
                      
                      // Mark guidance reminder as completed
                      const notificationManager = NotificationManager.getInstance();
                      notificationManager.markGuidanceCompleted(rollData.id);
                      
                      setSuccessModalData({
                        title: 'Reflection Shared!',
                        message: 'Your reflection has been successfully shared to Farcaster.',
                        solarEarned: guidanceEarnings.totalEarned
                      });
                      setShowSuccessModal(true);
                      setHasCompletedGuidance(true);
                    } else {
                      setSuccessModalData({
                        title: 'Reflection Shared!',
                        message: 'Your reflection has been successfully shared to Farcaster.'
                      });
                      setShowSuccessModal(true);
                    }
                    setEditingEntry(null);
                  } catch (error) {
                    console.error('Error in guidance share flow:', error);
                    setToast({ message: 'Failed to share reflection. Please try again.', type: 'error' });
                  }
                }}
        mode="edit"
      />
    );
  }

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
    <>
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Success Modal */}
      {showSuccessModal && successModalData && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessModalData(null);
            router.push('/soldash/journal');
          }}
          title={successModalData.title}
          message={successModalData.message}
          solarEarned={successModalData.solarEarned}
        />
      )}
      
      <div className="min-h-screen bg-[#FFFCF2]/50 backdrop-blur-sm pt-24">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="text-gray-700 hover:text-black transition-colors font-mono text-sm uppercase tracking-wide"
        >
          ← BACK TO ORACLE
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
            onClick={handleSaveForLater}
            className="w-full bg-white text-black font-mono font-base uppercase text-sm py-4 border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            SAVE FOR LATER
          </button>
        </div>
      </div>
    </div>
    </>
  );
} 
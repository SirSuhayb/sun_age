"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSolarPledge } from "../../hooks/useSolarPledge";
import { useAccount, useConnect, useReadContract } from "wagmi";
import { useFrameSDK } from '~/hooks/useFrameSDK';
import { SOLAR_PLEDGE_ADDRESS, SolarPledgeABI } from '../../lib/contracts';

const steps = ["prepare", "inscribe", "empower", "sealed"];

const OFFWHITE = '#FFFCF2';

export default function CeremonyStepper() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { context, isInFrame } = useFrameSDK();
  const { address } = useAccount();
  const { approveUSDC, createPledge, isApproved, isLoading, error, hasPledged, debugInfo, allowance, isApprovalPending, isApprovalConfirmed } = useSolarPledge();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const [uiError, setUiError] = useState<string | null>(null);

  // Use params directly for initial values
  const urlDays = searchParams?.get('days');
  const urlBirthDate = searchParams?.get('birthDate');
  const urlApproxYears = searchParams?.get('approxYears');

  useEffect(() => {
    let bookmark: any = null;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try { bookmark = JSON.parse(saved); } catch {}
      }
    }
    // Always prioritize URL params, fallback to bookmark
    const days = urlDays ? Number(urlDays) : bookmark?.days;
    const birth = urlBirthDate || bookmark?.birthDate;
    const approx = urlApproxYears ? Number(urlApproxYears) : bookmark?.approxYears || (days ? Math.floor(days / 365.25) : undefined);
  }, [searchParams]);

  // Fallback: if not available, prompt user to recalculate (use params directly)
  useEffect(() => {
    if (!urlDays || !urlBirthDate) {
      alert('No calculation data found. Please calculate your Sol Age first.');
      router.push('/');
    }
  }, [urlDays, urlBirthDate, router]);

  // After a successful pledge, automatically bookmark solAge
  const autoBookmark = React.useCallback(() => {
    if (urlDays && urlBirthDate && urlApproxYears) {
      const now = new Date();
      const data = {
        days: urlDays ? Number(urlDays) : undefined,
        approxYears: urlApproxYears ? Number(urlApproxYears) : undefined,
        birthDate: urlBirthDate,
        lastVisitDays: urlDays ? Number(urlDays) : undefined,
        lastVisitDate: now.toISOString(),
      };
      localStorage.setItem('sunCycleBookmark', JSON.stringify(data));
    }
  }, [urlDays, urlBirthDate, urlApproxYears]);

  // Today's date
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, ".");

  // Dynamic FID from Farcaster context
  const fid = context?.user?.fid;

  // Dynamic signature message
  const signatureMsg = `I inscribe this Solar Vow into eternity: FID ${fid ?? '...'} has completed ${urlDays ? urlDays.toLocaleString() : '...'} rotations around our star, sealed by cosmic signature on ${today}`;

  // Placeholder data (replace with real data/props)
  const [pledge, setPledge] = useState(5);
  const [customPledge, setCustomPledge] = useState("");
  const [commitment, setCommitment] = useState("");
  const [farcasterHandle, setFarcasterHandle] = useState("");

  // Calculate sponsoredCount and multiplier for step 2
  const overage = Math.max(0, pledge - 1);
  const sponsoredCount = Math.floor(overage * 0.5);
  const multiplier = Math.min(5, (1 + (pledge - 1) * 0.1)).toFixed(1);

  // Step navigation
  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const cancel = () => {
    if (urlDays && urlBirthDate) {
      const approxYears = Math.floor(urlDays ? Number(urlDays) : 0 / 365.25);
      router.push(`/results?days=${urlDays}&birthDate=${urlBirthDate}&approxYears=${approxYears}`);
    } else {
      router.push('/');
    }
  };

  // Handler for returning to results with fallback logic
  const handleReturnToResults = () => {
    // Try in-memory data first
    if (urlDays && urlBirthDate) {
      const approxYears = Math.floor(urlDays ? Number(urlDays) : 0 / 365.25);
      router.push(`/results?days=${urlDays}&birthDate=${urlBirthDate}&approxYears=${approxYears}`);
      return;
    }
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          const bookmark = JSON.parse(saved);
          if (bookmark.days && bookmark.birthDate && bookmark.approxYears) {
            router.push(`/results?days=${bookmark.days}&birthDate=${bookmark.birthDate}&approxYears=${bookmark.approxYears}`);
            return;
          }
        } catch {}
      }
    }
    // Final fallback
    router.push('/');
  };

  // Handle pledge creation
  const handlePledge = async () => {
    if (!address) {
      if (isInFrame && farcasterConnector) {
        try {
          await connect({ connector: farcasterConnector });
        } catch (err) {
          setUiError("Failed to connect Farcaster wallet. Please try again.");
          return;
        }
      } else if (!isInFrame && injectedConnector) {
        try {
          await connect({ connector: injectedConnector });
        } catch (err) {
          setUiError("Failed to connect wallet. Please try again.");
          return;
        }
      } else {
        setUiError("No suitable wallet connector found. Please use Farcaster or a browser wallet.");
        return;
      }
    }

    try {
      setUiError(null);
      // First approve USDC if not already approved
      if (!isApproved(pledge)) {
        await approveUSDC(BigInt(pledge * 1_000_000));
        return; // Wait for user to click again to seal
      }
      // Then create the pledge
      await createPledge(
        commitment,
        farcasterHandle,
        pledge,
        urlBirthDate ? new Date(urlBirthDate) : undefined
      );
      autoBookmark(); // <-- Automatically bookmark after successful pledge
      next(); // Move to next step on success
    } catch (err) {
      setUiError(err instanceof Error ? err.message : "Failed to process transaction");
    }
  };

  // SunGlow component for glowing effect behind the sun
  function SunGlow() {
    return (
      <Image
        src="/sunsun.png"
        alt="Sun"
        width={96}
        height={96}
        className="mb-4"
        style={{ filter: 'drop-shadow(0 0 50px #FFD700cc) drop-shadow(0 0 20px #FFB30099)' }}
        priority
      />
    );
  }

  // Find the Farcaster frame connector if available
  const farcasterConnector = connectors.find(
    (c) => c.id === "farcaster" || c.name.toLowerCase().includes("frame")
  );
  const injectedConnector = connectors.find(
    (c) => c.id === "injected" || c.name.toLowerCase().includes("injected")
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white relative">
      {/* Fixed Progress Bar below global header */}
      <div style={{ position: 'fixed', top: 98, left: 0, width: '100%', zIndex: 50 }}>
        <div className="w-full h-2 flex" style={{ background: '#F6F5E6' }}>
          {(() => {
            let width = '33%';
            let color = '#D6AD30';
            if (step === 1) width = '66%';
            if (step === 2) width = '100%';
            if (step === 3) {
              width = '100%';
              color = '#22C55E'; // green-500
            }
            return <div className="h-2 transition-all duration-300" style={{ width, background: color }} />;
          })()}
          <div className="flex-1" />
        </div>
      </div>

      {/* Step Content */}
      <div className="w-full flex flex-col items-center justify-center" style={{ background: OFFWHITE }}>
        <div className="max-w-md mx-auto w-full px-6 pt-32 pb-8 min-h-[60vh]">
          {step === 0 && (
            <>
              <div className="flex flex-col items-center mb-0">
                <div className="pt-8" />
                <SunGlow />
                <div className="text-2xl font-serif font-bold mb-2">Prepare Your Solar Vow</div>
                <div className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest">The beginning to your brightest self</div>
                {/* Cosmic Journey Callout */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90 text-center">
                  <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Your Cosmic Journey Thus Far</div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl">⭐</span>
                    <span className="text-3xl font-serif font-bold">{urlDays ? urlDays.toLocaleString() : ""}</span>
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="text-xs font-mono text-gray-500 mb-2">Solar rotations since {urlBirthDate}</div>
                </div>
                {/* Commitment Callout */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-0">
                  <div className="text-xs font-mono text-gray-700 mb-2 uppercase tracking-widest font-bold">The Commitment</div>
                  <div className="text-sm font-mono text-gray-700">A Solar Vow is a sacred commitment to your cosmic journey, inscribed permanently in the celestial record.<br /><br />At <span className="font-bold">{urlDays ? urlDays.toLocaleString() : ""}</span> rotations around our star, you&apos;re ready to make your mark on the universe.</div>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex flex-col items-start mb-0">
                <div className="pt-8" />
                <Image src="/pinky_promise.png" alt="Fist" width={200} height={200} className="mb-6 self-center" style={{ filter: 'drop-shadow(0 0 50px #FFD700cc) drop-shadow(0 0 20px #FFB30099)' }} />
                <div className="text-2xl font-serif font-normal mb-1 w-full text-center leading-tighter">Inscribe Your Solar Vow</div>
                <div className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest w-full text-center">A sacred inscription of your journey</div>
                {/* Message to Sign Callout */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90 text-left">
                  <div className="text-xs font-mono text-gray-500 mb-4 uppercase tracking-widest">Message to Sign</div>
                  <div className="w-full border border-blue-200 bg-[#F2F7FF] rounded-none p-3 font-mono text-sm text-left mb-3 whitespace-pre-line select-all" style={{ color: '#2563eb', fontFamily: 'Geist Mono, monospace' }}>
                    &quot;{signatureMsg}&quot;
                  </div>
                  <div className="text-sm text-gray-500 mt-12 text-left">Your vow is an onchain signature transforming intention into cosmic law, creating an unbreakable bond with your future self. This is proof of your word.</div>
                </div>
                
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-col items-start mb-0">
                <div className="pt-8" />
                <Image src="/battery.png" alt="Battery" width={150} height={150} className="mb-6 self-center" style={{ filter: 'drop-shadow(0 0 60px #FFD700cc) drop-shadow(0 0 32px #FFB30099)' }} />
                <div className="text-2xl font-serif font-bold mb-2 w-full text-center">Empower Your Solar Vow</div>
                <div className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-widest w-full text-center">A measure of strength through collective energy</div>
                {/* Cosmic Convergence Callout */}
                <div className="w-full border border-blue-200 bg-[#F2F7FF] rounded-none p-3 font-mono text-sm text-left mb-4" style={{ color: '#2563eb', fontFamily: 'Geist Mono, monospace' }}>
                  <span className="font-bold uppercase tracking-widest">COSMIC CONVERGENCE | EPOCH 0</span><br />
                  <span className="text-xs font-mono" style={{ color: '#2563eb' }}>{`{vows} vows committed • $${pledge} pooled • {days} remaining`}</span>
                </div>
                {/* Solar Energy Level Card */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-white/90 text-left">
                  <div className="text-xs font-mono text-gray-700 mb-2 uppercase tracking-widest font-bold">CHOOSE YOUR SOLAR ENERGY LEVEL</div>
                  <div className="text-sm font-sans text-gray-700 mb-4">Your contribution joins the solar community and sponsors future vow-makers.</div>
                  <div className="flex gap-2 mb-2">
                    {[1, 5, 10, 25].map((amt) => (
                      <button key={amt} className={`flex-1 px-4 py-2 border border-black font-mono text-base rounded-none flex items-center justify-center gap-1 text-center ${pledge === amt && !customPledge ? 'bg-[#d4af37] text-black' : 'bg-white text-black'}`} onClick={() => { setPledge(amt); setCustomPledge(''); }}>
                        ${amt}{amt === 1 ? '⚡' : amt === 5 ? '🌟' : amt === 10 ? '💫' : amt === 25 ? '✨' : ''}
                      </button>
                    ))}
                  </div>
                  <div className="w-full mt-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="PLEDGE CUSTOM AMOUNT"
                      className={`w-full px-4 py-2 border border-black font-mono text-base rounded-none ${customPledge ? 'bg-[#d4af37] text-black' : 'bg-white text-black'}`}
                      value={customPledge}
                      onChange={e => {
                        setCustomPledge(e.target.value);
                        setPledge(Number(e.target.value) || 1);
                      }}
                    />
                  </div>
                </div>
                {/* Final Amount Callout */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4" style={{ background: '#F6F5E6' }}>
                  <div className="text-xs font-mono text-gray-700 mb-2 uppercase tracking-widest font-bold">YOUR ${pledge} SOLAR VOW WILL:</div>
                  <ul className="text-sm font-mono text-gray-700 list-none ml-0 mt-1">
                    <li className="mb-1">🌞 Enable {sponsoredCount} free ceremonies</li>
                    <li className="mb-1">🌊 Add ${pledge} to Genesis pool</li>
                    <li>🔒 Secure your vow with {multiplier}x energy</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex flex-col items-center mb-0">
                <div className="pt-8" />
                <Image src="/envelope.png" alt="Seal" width={120} height={120} className="mb-6 self-center" style={{ filter: 'drop-shadow(0 0 60px #22C55E88) drop-shadow(0 0 32px #22C55E44)' }} />
                <div className="text-2xl font-serif font-bold mb-2 w-full text-center">Solar Vow Sealed</div>
                <div className="text-xs font-mono text-gray-500 mb-6 uppercase tracking-tight w-full text-center" style={{ letterSpacing: '0.08em' }}>
                  YOUR PLACE IN THE GENESIS CONVERGENCE IS SECURED
                </div>
                {/* Green Card: Solar Vow Inscribed */}
                <div className="w-full border border-green-200 rounded-none p-4 mb-4" style={{ background: '#EFFDF4', color: '#15803D' }}>
                  <div className="text-xs font-mono font-bold uppercase mb-2 w-full text-center" style={{ color: '#15803D' }}>
                    SOLAR VOW INSCRIBED
                  </div>
                  <div className="flex flex-col items-center mb-2">
                    <div className="text-3xl font-serif font-bold mb-1 flex items-center gap-2" style={{ color: '#15803D' }}>
                      <span>⭐</span>
                      <span>{urlDays ? urlDays.toLocaleString() : ""}</span>
                      <span>⭐</span>
                    </div>
                    <div className="text-xs font-mono uppercase mb-2 text-center" style={{ color: '#15803D', letterSpacing: '0.08em' }}>
                      ROTATIONS SEALED IN THE COSMIC LEDGER
                    </div>
                  </div>
                  <div className="w-full h-px bg-green-300 my-2" />
                  <div className="grid grid-cols-2 gap-y-1 text-xs font-mono" style={{ color: '#15803D' }}>
                    <div className="text-left">VOW ENERGY:</div>
                    <div className="text-right font-bold">${pledge}</div>
                    <div className="text-left">SPONSORED CEREMONIES:</div>
                    <div className="text-right font-bold">2</div>
                    <div className="text-left">COMMUNITY CONSTELLATION:</div>
                    <div className="text-right font-bold">${pledge - 1} TO GENESIS POOL</div>
                    <div className="text-left">COSMIC CONVERGENCE:</div>
                    <div className="text-right font-bold">30 DAYS</div>
                  </div>
                </div>
                {/* Cosmic Convergence Callout */}
                <div className="w-full border border-gray-300 rounded-none p-4 mb-4 bg-transparent text-left">
                  <div className="font-mono font-normal mb-2 uppercase">THE COSMIC CONVERGENCE AWAITS</div>
                  <ul className="list-none ml-0 mt-1 font-sans text-sm text-gray-700">
                    <li className="mb-1">✨ Your solar journey is permanently inscribed in starlight</li>
                    <li className="mb-1">🌟 Stellar rewards will manifest when Genesis arrives</li>
                    <li>💫 Your cosmic signature will evolve through your vow&apos;s power</li>
                  </ul>
                </div>
                {/* Vow Quote Callout */}
                <div className="w-full rounded-none p-4 mb-6 text-center italic font-serif border border-gray-300" style={{ background: 'rgba(255,255,255,0.4)' }}>
                  &quot;Your vow echoes through the cosmos, binding your present self to all the futures you will become. You are now part of something infinite.&quot;
                </div>
              </div>
            </>
          )}
        </div>
        {/* Divider between main content and buttons */}
        <div className="w-full h-px bg-gray-300 mb-6" />
      </div>
      {/* Main CTA and Secondary CTAs outside main content container */}
      {(step === 0 || step === 1 || step === 2 || step === 3) && (
        <div className="w-full flex flex-col items-center mt-0 mb-2 px-0 bg-white">
          <div className="max-w-md w-full px-6">
            {step === 0 && (
              <>
        <button
                  className="w-full py-4 mb-2 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
                  onClick={async () => {
                    setUiError(null);
                    if (!address) {
                      if (isInFrame && farcasterConnector) {
                        await connect({ connector: farcasterConnector });
                      } else if (!isInFrame && injectedConnector) {
                        await connect({ connector: injectedConnector });
                      } else {
                        setUiError("No suitable wallet connector found. Please use Farcaster or a browser wallet.");
                        return;
                      }
                    } else if (address) {
                      next();
                    }
                  }}
                  disabled={isConnecting || (!address && connectors.length === 0)}
                >
                  {isConnecting
                    ? "Connecting..."
                    : !address
                      ? "CONNECT WALLET"
                      : "BEGIN SOLAR VOW CEREMONY"}
                </button>
                {uiError && (
                  <div className="text-xs font-mono text-red-600 mb-2 text-center">{uiError}</div>
                )}
                {address && (
                  <div className="text-xs font-mono text-gray-400 mb-4 text-center">Wallet: {address.slice(0, 6)}...{address.slice(-4)}</div>
                )}
                <div className="flex w-full items-center justify-center gap-0 mt-0 mb-6">
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors"
                    onClick={handleReturnToResults}
                  >
                    RETURN TO RESULTS
                  </button>
                  <span className="w-px h-6 bg-gray-300 mx-2" />
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors"
                    onClick={() => router.push('/soldash')}
                  >
                    BOOKMARK INSTEAD
                  </button>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <button
                  className="w-full py-4 mb-4 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
                  onClick={next}
                >
                  EMPOWER YOUR VOW
                </button>
                <div className="flex w-full items-center justify-center gap-0 mt-0 mb-6">
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors"
                    onClick={handleReturnToResults}
                  >
                    RETURN TO RESULTS
                  </button>
                  <span className="w-px h-8 bg-black mx-6" style={{ minWidth: '1px' }} />
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors"
                    onClick={prev}
                  >
                    CANCEL COMMITMENT
                  </button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                {/* Error Callout */}
                {(uiError || error) && (
                  <div className="w-full border border-red-300 bg-red-50 text-red-700 rounded-none p-3 font-mono text-sm text-left mb-4">
                    {uiError || (error && error.message)}
                  </div>
                )}
                {/* Debug Info Callout */}
                {(debugInfo || allowance !== undefined) && (
                  <div className="w-full border border-yellow-300 bg-yellow-50 text-yellow-700 rounded-none p-3 font-mono text-xs text-left mb-4">
                    {debugInfo && <div>{debugInfo}</div>}
                    {allowance != null && <div>Allowance: {allowance.toString()}</div>}
                    {isApprovalConfirmed && !isLoading && <div className="mt-2">✅ USDC approved! Click the button above to seal your vow.</div>}
                  </div>
                )}
                <button
                  className="w-full py-4 mb-4 bg-[#d4af37] text-black font-mono text-sm tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
                  onClick={handlePledge}
                  disabled={isLoading || isApprovalPending}
                >
                  {isLoading
                    ? (isApprovalPending ? "Waiting for approval..." : "Sealing your vow...")
                    : !isApproved(pledge)
                      ? "APPROVE USDC"
                      : `CLICK TO SEAL VOW WITH $${pledge} SOLAR ENERGY`}
                </button>
                <div className="flex w-full items-center justify-between gap-0 mt-0 mb-6">
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors text-left"
                    onClick={() => setStep(2)}
                  >
                    ADJUST PLEDGE
                  </button>
                  <span className="w-px h-8 bg-black mx-6" style={{ minWidth: '1px' }} />
                  <button
                    className="flex-1 font-mono text-base text-sm uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors text-right"
                    onClick={handleReturnToResults}
                  >
                    CANCEL COMMITMENT
        </button>
      </div>
              </>
            )}
            {step === 3 && (
              <>
                <button className="w-full py-4 mb-4 bg-[#d4af37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors" onClick={() => router.push('/soldash?tab=sol%20vows')}>VIEW MY SOL DASHBOARD</button>
                <button className="w-full py-4 mb-8 bg-white text-black font-mono text-base tracking-widest uppercase border border-gray-400 rounded-none hover:bg-gray-50 transition-colors" onClick={() => alert('TODO: Share to Farcaster')}>SHARE MY VOW</button>
                <div className="flex w-full items-center justify-center gap-0 mt-0 mb-6">
                  <button className="flex-1 font-mono text-base uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors text-left" onClick={() => router.push('/')}>CALCULATE AGAIN</button>
                  <span className="w-px h-8 bg-gray-400 mx-6" style={{ minWidth: '1px' }} />
                  <button className="flex-1 font-mono text-base uppercase underline underline-offset-2 border-none rounded-none bg-transparent text-black py-2 px-0 hover:text-[#d4af37] transition-colors text-right" onClick={() => router.push('/about')}>LEARN MORE</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Footer - same as main page */}
      <footer className="w-full border-t border-gray-200 bg-white pt-2 pb-12 mt-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-black text-center">
            Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">&quot;occulture&quot;</a> <br />
            built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">&quot;sirsu&quot;</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 
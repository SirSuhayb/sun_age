import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutSolara() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FFFCF2] relative">
      {/* Section 1: About Solara */}
      <section className="w-full flex flex-col items-center pt-32 pb-0 px-4 relative bg-[#FFFCF2]">
        {/* Sun with main-page style drop-shadow, larger and more glow */}
        <div className="flex flex-col items-center justify-center my-10 min-h-[180px]">
          <Image
            src="/sunsun.png"
            alt="Sun"
            width={128}
            height={128}
            className="mx-auto"
            style={{ width: '128px', height: 'auto', filter: 'drop-shadow(0 0 64px #FFD700cc) drop-shadow(0 0 32px #FFB30099)' }}
            priority
          />
        </div>
        {/* Tagline */}
        <div className="text-center mt-4 mb-12">
          <div className="font-serif text-5xl sm:text-5xl text-gray-900" style={{ fontFamily: 'GT Alpina, serif', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.06em' }}>
            your age in<br />solar rotations
          </div>
          <div className="font-mono text-sm text-gray-500 mt-4 tracking-widest uppercase">
            EVERY DAY IS ONE COMPLETE ROTATION<br />AROUND THE SUN
          </div>
        </div>
        {/* Three features stacked vertically, more space and clarity */}
        <div className="flex flex-col gap-12 w-full max-w-xs mx-auto mt-4 mb-12">
          <div className="flex flex-col items-center">
            {/* Circle for Sol Age */}
            <div className="w-10 h-10 border-2 border-gray-700 rounded-full mb-3 flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-700 rounded-full" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-gray-900 mb-2">Sol Age</div>
            <div className="font-sans text-sm text-gray-500 text-center">Your exact age in days since birth</div>
          </div>
          <div className="flex flex-col items-center">
            {/* Timeline for Milestones */}
            <div className="w-12 h-2 flex items-center justify-center mb-3">
              <div className="w-full h-0.5 bg-gray-700" />
              <div className="w-3 h-3 bg-gray-700 rounded-full mx-1" />
              <div className="w-full h-0.5 bg-gray-700" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-gray-900 mb-2">Milestones</div>
            <div className="font-sans text-sm text-gray-500 text-center">Track meaningful numbers in your orbit</div>
          </div>
          <div className="flex flex-col items-center">
            {/* Diamond for Journey */}
            <div className="w-10 h-10 flex items-center justify-center mb-3">
              <div className="w-6 h-6 bg-gray-700 rotate-45" />
            </div>
            <div className="font-serif text-xl sm:text-2xl text-gray-900 mb-2">Journey</div>
            <div className="font-sans text-sm text-gray-500 text-center">Visualize your path through space</div>
          </div>
        </div>
      </section>

      {/* Divider between Section 1 and Section 2 */}
      <div className="w-full h-px bg-gray-200" />

      {/* Section 2: Fact Callouts (compact, as in mockup) */}
      <section className="w-full bg-[#F6F8FF] py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="border border-[#D6E0F5] bg-[#F8FAFF] rounded-none py-6 px-4 flex flex-row justify-between items-end gap-x-4">
            <div className="flex flex-col items-center flex-1">
              <Image 
                src="/earth.png" 
                alt="Earth" 
                width={56} 
                height={56} 
                style={{ width: '56px', height: 'auto', filter: 'grayscale(1)' }}
              />
              <div className="font-serif text-3xl letter-spacing-small text-gray-900 mt-3 font-bold">365.25</div>
              <div className="font-mono text-xs text-gray-700 tracking-widest uppercase mt-1">DAYS/YEAR</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Image 
                src="/brokenHead.png" 
                alt="Lifespan" 
                width={63} 
                height={63} 
                style={{ width: 'auto', height: 'auto', filter: 'grayscale(1)' }}
              />
              <div className="font-serif text-3xl letter-spacing-small text-gray-900 mt-3 font-bold">29000</div>
              <div className="font-mono text-xs text-gray-700 tracking-widest uppercase mt-1">AVG LIFESPAN</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <Image 
                src="/galaxy.png" 
                alt="Possibilities" 
                width={65} 
                height={56} 
                style={{ width: 'auto', height: 'auto', filter: 'grayscale(1)' }}
              />
              <div className="font-serif text-3xl text-gray-900 mt-3 font-bold">infinite</div>
              <div className="font-mono text-xs text-gray-700 tracking-widest uppercase mt-1">POSSIBILITIES</div>
            </div>
          </div>
          <Link
            href="/"
            className="block w-full bg-[#D6AD30] border border-[#AE8C25] text-black font-mono py-5 mt-6 px-8 text-lg rounded-none tracking-[0.11em] uppercase transition-colors hover:bg-[#B08E29] active:bg-[#B08E29] focus:bg-[#B08E29] text-center"
            style={{ fontWeight: 400, letterSpacing: '0.11em' }}
          >
            DISCOVER YOUR SOL AGE
          </Link>
        </div>
      </section>
      <div className="w-full h-px bg-gray-300 my-0" />
      {/* Section 3: Solar Token */}
      <section className="w-full bg-[#F8F6E6] py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-400 rounded-none p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div className="font-serif text-3xl text-[#D6AD30]" style={{ fontFamily: 'GT Alpina, serif', fontStyle: 'italic', fontWeight: 400 }}>$SOLAR</div>
              <div className="flex items-center bg-[#F8F8F8] border border-gray-400 px-4 py-2 text-gray-700 text-base font-mono rounded-none">
                <span className="inline-block w-3 h-3 bg-blue-600 rounded-full mr-2" />
                <a href="https://dexscreener.com/base/0x96895f7e90a7d4b9543ec008e204a4f4c7a7033b" target="_blank" rel="noopener noreferrer" className="hover:underline">0X7460...1B07</a>
              </div>
            </div>
            {/* Features */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <div className="font-serif text-2xl mb-2">Bank time</div>
                <div className="text-base text-gray-700">Convert your solar rotations into tokens.<br />Every day lived earns value.</div>
              </div>
              <div className="text-center mb-8">
                <div className="font-serif text-2xl mb-2">Bet on yourself</div>
                <div className="text-base text-gray-700">Stake tokens on hitting future milestones.<br />Win big when you reach them.</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-2xl mb-2">Commit to your goals</div>
                <div className="text-base text-gray-700">Lock tokens behind promises to yourself.<br />Get rewarded for follow-through.</div>
              </div>
            </div>
            {/* Divider */}
            <div className="w-full h-px bg-gray-400 mb-6" />
            {/* Solar Community Callout */}
            <div className="bg-[#F2F3F6] border border-gray-300 p-6 mb-6 text-center">
              <div className="font-mono text-base text-gray-700 mb-2 tracking-widest uppercase">JOIN THE SOLAR COMMUNITY</div>
              <div className="flex items-center justify-center gap-4 mb-2">
                <span className="text-3xl">⭐️</span>
                <span className="font-serif text-3xl text-gray-900">Growing Daily</span>
                <span className="text-3xl">⭐️</span>
              </div>
              <div className="font-mono text-sm text-gray-600">COSMIC TRAVELERS UNITE</div>
            </div>
            {/* Buttons row */}
            <div className="flex gap-4">
              <Link href="/" className="flex-1 bg-white border border-gray-400 text-black font-mono py-4 text-lg rounded-none tracking-[0.11em] uppercase transition-colors hover:bg-gray-100 active:bg-gray-200 focus:bg-gray-100 text-center">MAKE A VOW</Link>
              <a href="https://dexscreener.com/base/0x96895f7e90a7d4b9543ec008e204a4f4c7a7033b" target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#D6AD30] border border-[#AE8C25] text-black font-mono py-4 text-lg rounded-none tracking-[0.11em] uppercase transition-colors hover:bg-[#B08E29] active:bg-[#B08E29] focus:bg-[#B08E29] text-center">BUY $SOLAR</a>
            </div>
          </div>
        </div>
      </section>
      {/* Farcaster Callout Section */}
      <section className="w-full bg-[#F8F6E6] py-8 px-4">
        <div className="max-w-md mx-auto bg-white border border-gray-400 rounded-none p-8 flex flex-col items-center -mt-8">
          {/* Farcaster icon placeholder */}
          <Image src="/farcaster.svg" alt="Farcaster" width={40} height={40} className="mb-2" />
          <div className="font-serif text-2xl font-bold mb-2">built for farcaster</div>
          <div className="text-center text-base text-gray-700 mb-6">Pin Solara to your mini apps.<br />Get milestone notifications.<br />Share your cosmic journey.</div>
          <div className="flex w-full justify-between mt-2">
            <span className="font-mono text-xs text-gray-500"><a href="https://farcaster.xyz/solaracosmos" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">Follow Solara</a></span>
            <span className="font-mono text-xs text-gray-500"><a href="https://farcaster.xyz/solaracosmos" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">Add Mini App</a></span>
            <span className="font-mono text-xs text-gray-500"><a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">/occulture</a></span>
          </div>
        </div>
      </section>
      {/* Extended Footer/Tagline Section */}
      <section className="w-full bg-[#F8F6E6] py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center relative">
          <div className="flex items-center gap-8 mb-8">
            <Image src="/sunsun.png" alt="Sun" width={64} height={64} className="spin-slow" />
            <span className="font-serif text-3xl text-gray-900 text-center font-normal" style={{ lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              every sunrise is <br />a new rotation
            </span>
            <Image src="/sunsun.png" alt="Sun" width={64} height={64} className="spin-slow" />
          </div>
          <div className="w-full flex justify-center items-center mt-8" style={{ position: 'relative', zIndex: 0 }}>
            <Image src="/logo.svg" alt="SOLARA" width={800} height={160} className="opacity-20 select-none" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>
      <footer className="w-full bg-white border-t border-gray-200 -mt-12 pt-6 pb-10 z-50 relative">
        <div className="flex flex-col items-center justify-center">
          <div className="text-sm font-mono text-gray-500 text-center">
            Solara is made for <a href="https://farcaster.xyz/~/channel/occulture" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">/occulture</a> <br />
            built by <a href="https://farcaster.xyz/sirsu.eth" className="underline transition-colors hover:text-[#D6AD30] active:text-[#D6AD30] focus:text-[#D6AD30]" target="_blank" rel="noopener noreferrer">sirsu</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 
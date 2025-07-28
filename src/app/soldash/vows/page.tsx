'use client';
import { Tooltip } from '~/components/Soldash/Tooltip';
import { useConvergenceStats } from '~/hooks/useConvergenceStats';
import { useSolarPledge } from '~/hooks/useSolarPledge';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function VowsPage() {
  const router = useRouter();
  const { numVows, totalPooled, daysRemaining } = useConvergenceStats();
  const { onChainPledge, onChainPledgeV1, isLoading } = useSolarPledge();
  console.log('onChainPledge', onChainPledge);
  console.log('onChainPledgeV1', onChainPledgeV1);

  const handleMakeVow = () => {
    // Read bookmark data from localStorage
    let bookmark: { days?: number; birthDate?: string; approxYears?: number } | null = null;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sunCycleBookmark');
      if (saved) {
        try {
          bookmark = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse bookmark:', e);
        }
      }
    }

    if (bookmark && bookmark.days && bookmark.birthDate) {
      // Calculate approxYears if not present
      const approxYears = bookmark.approxYears || Math.floor(bookmark.days / 365.25);
      router.push(`/ceremony?days=${bookmark.days}&birthDate=${bookmark.birthDate}&approxYears=${approxYears}`);
    } else {
      // Fallback to ceremony page without params (it will handle the error)
      router.push('/ceremony');
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Tooltip/Callout */}
      <motion.div className="mt-10" variants={itemVariants}>
        <Tooltip
          title="COMMIT TO SELF AND BECOME GREATER"
          body={"Channel your Sol Innovator energy into life-changing vows. These are not just promises to self, but to the Sol community."}
          bgColor="#DBFFE5"
          borderColor="#76EC9F"
          textColor="#14532D"
          storageKey="soldash-vows-tooltip"
        />
      </motion.div>

      {/* Cosmic Convergence Card */}
      <motion.div className="border border-gray-200 bg-[#FEFDF8] p-5 rounded-none" variants={itemVariants}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">{daysRemaining !== undefined ? `${daysRemaining} DAYS LEFT` : '...'} </span>
          <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">${totalPooled !== undefined ? totalPooled.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '...'} PLEDGED | {numVows !== undefined ? numVows : '...'} VOWS</span>
        </div>
        <div className="text-2xl font-serif font-bold text-black mb-1">Cosmic Convergence<br />Epoch 0</div>
        <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">MAKE A SACRED VOW WITH CEREMONIAL POWER</div>
        <div className="flex justify-center my-4">
          <Image src="/vows/coscon_illustration.svg" alt="Cosmic Convergence" width={240} height={80} style={{ width: 'auto', height: 116 }} />
        </div>
        <div className="text-lg font-serif leading-tight text-[#5F5F5F] mb-6">Make a sacred vow and your solar journey becomes $SOLAR tokens. The longer your journey, the more you receive.</div>
        <button
          className="w-full py-3 bg-[#D4AF37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none hover:bg-[#e6c75a] transition-colors"
          onClick={handleMakeVow}
        >
          MAKE A VOW
        </button>
      </motion.div>

      {/* Sol Pledges Card (Coming Soon) */}
      <motion.div className="border border-[#1D8943] bg-[#F0FDF2] p-5 rounded-none" variants={itemVariants}>
        <div className="text-2xl font-serif font-bold text-black mb-1">Sol Pledges</div>
        <div className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">BET ON YOURSELF, GROW AS YOU COMMIT TO SELF</div>
        <div className="flex justify-center my-4">
          <Image src="/vows/solPledge_illustration.svg" alt="Sol Pledges" width={240} height={80} style={{ width: 'auto', height: 116 }} />
        </div>
        <div className="text-lg font-serif leading-tight text-[#5F5F5F] mb-6">Commit to a personal challenge with skin in the game. Stake USDC or SOL on your ability to follow through.</div>
        <button
          className="w-full py-3 bg-[#D4AF37] text-black font-mono text-base tracking-widest uppercase border border-black rounded-none mt-2 opacity-60 cursor-not-allowed"
          disabled
        >
          COMING SOON
        </button>
      </motion.div>

      {/* Active Vows Section */}
      <motion.div variants={itemVariants}>
        <div className="text-lg font-serif font-bold text-black mb-3">Active Vows</div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2" />
            <span className="font-mono text-xs text-gray-500">Fetching your Solar Vows...</span>
          </div>
        ) : (onChainPledge && onChainPledge.isActive) || (onChainPledgeV1 && onChainPledgeV1.isActive) ? (
          <>
            {onChainPledge && onChainPledge.isActive && (
              <div className="border border-blue-200 bg-[#F2F7FF] rounded-none p-4 mb-4 relative" style={{ borderLeftWidth: '5px' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-blue-900">SOL {onChainPledge.pledgeNumber?.toString() || ''}</span>
                  <span className="font-mono text-xs text-blue-900 font-bold uppercase">COSMIC</span>
                </div>
                <div className="font-serif italic text-base text-blue-900 mb-2">&ldquo;{onChainPledge.commitmentText}&rdquo;</div>
                <div className="border border-green-200 bg-[#EFFDF4] rounded-none p-3 mt-2">
                  <div className="font-mono text-xs text-green-800 mb-1">EPOCH 0 - GENESIS</div>
                  <div className="font-mono text-xs text-green-800 mb-1">VOW ENERGY: ${Number(onChainPledge.usdcPaid) / 1e6}</div>
                  <div className="font-mono text-xs text-green-800">SACRED COMMITMENT · NO EXPIRY</div>
                </div>
              </div>
            )}
            {!onChainPledge?.isActive && onChainPledgeV1 && onChainPledgeV1.isActive && (
              <div className="border border-blue-200 bg-[#F2F7FF] rounded-none p-4 mb-4 relative" style={{ borderLeftWidth: '5px' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-blue-900">SOL {onChainPledgeV1.pledgeNumber?.toString() || ''}</span>
                  <span className="font-mono text-xs text-blue-900 font-bold uppercase">COSMIC</span>
                </div>
                <div className="font-serif italic text-base text-blue-900 mb-2">&ldquo;{onChainPledgeV1.commitmentText}&rdquo;</div>
                <div className="border border-green-200 bg-[#EFFDF4] rounded-none p-3 mt-2">
                  <div className="font-mono text-xs text-green-800 mb-1">EPOCH 0 - GENESIS</div>
                  <div className="font-mono text-xs text-green-800 mb-1">VOW ENERGY: ${Number(onChainPledgeV1.usdcPaid) / 1e6}</div>
                  <div className="font-mono text-xs text-green-800">SACRED COMMITMENT · NO EXPIRY</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="border border-gray-200 bg-white rounded-none p-6 text-center text-gray-500 font-mono text-sm">No active vows yet. Make your first vow!</div>
        )}
      </motion.div>
    </motion.div>
  );
} 
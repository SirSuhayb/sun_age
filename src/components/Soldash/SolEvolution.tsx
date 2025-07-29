import React from 'react';
import Image from 'next/image';
import { getSunSign, getSolPhase, getSolarArchetype, dayRangeToAgeRange, getCompleteSolarProfile, getFoundationDescription, getDepthDescription } from '../../lib/solarIdentity';
import { getNextMilestone } from '../../lib/milestones';

interface Bookmark {
  birthDate: string;
  solAge?: number;
  solArchetype?: string;
  foundation?: string;
  depth?: string;
  agePhase?: string;
}

interface SolEvolutionProps {
  bookmark: Bookmark;
}

// Phase-specific insights that provide meaningful guidance and create curiosity
function getPhaseInsight(phaseName: string, archetype: string, foundation: string, depth: string, agePhase: string): string {
  const phaseWisdom: Record<string, Record<string, string>> = {
    'Sol Innovator': {
      'Curious Experimenter': 'Your natural curiosity is awakening breakthrough potential. This phase builds the experimental mindset that will fuel your greatest innovations.',
      'System Questioner': 'You\'re developing the critical thinking that challenges conventional wisdom. Your questions now are reshaping how you\'ll revolutionize systems later.',
      'Innovation Architect': 'Your vision is crystallizing into tangible blueprints. This is when your breakthrough ideas begin taking structural form.',
      'Connected Revolutionary': 'Your innovations are ready to transform communities. The systems you question become the ones you reconstruct.',
      'Wisdom Transmitter': 'You\'ve become a conduit for evolutionary insights. Your role now is teaching others to see what you\'ve learned to envision.',
      'System Transformer': 'You embody the change you once imagined. Your very presence shifts paradigms and opens new possibilities for humanity.'
    },
    'Sol Nurturer': {
      'Natural Caregiver': 'Your innate compassion is developing into a powerful force for growth. This foundation shapes how you\'ll nurture entire communities.',
      'Community Builder': 'You\'re learning to create spaces where others flourish. Your caring nature is expanding beyond individuals to collective healing.',
      'Support System Creator': 'Your nurturing wisdom is building lasting structures. This phase teaches you how care becomes sustainable architecture.',
      'Growth Facilitator': 'You\'ve mastered the art of helping others bloom. Your focus now is understanding the deeper patterns of human potential.',
      'Wisdom Keeper': 'You hold the secrets of sustainable growth. Your nurturing has evolved into profound guidance for life\'s greatest transitions.',
      'Sacred Guardian': 'You protect and preserve the wisdom that heals generations. Your presence becomes a sanctuary for collective evolution.'
    },
    'Sol Alchemist': {
      'Sensitive Explorer': 'Your sensitivity is your superpower, revealing hidden patterns others miss. This phase builds the awareness that fuels transformation.',
      'Shadow Walker': 'You\'re learning to navigate darkness without losing your light. This crucial phase teaches you how to transmute what others fear.',
      'Transformation Student': 'You\'re mastering the sacred art of change. Every challenge now becomes raw material for your growing alchemical skills.',
      'Wisdom Alchemist': 'Your transformative powers are reaching mastery. You can now turn any experience into golden wisdom.',
      'Mystical Teacher': 'You\'ve become a guide for others\' deepest transformations. Your journey through darkness now illuminates the path for many.',
      'Sacred Oracle': 'You embody the mystery of profound change. Your insights pierce the veil between what is and what could be.'
    },
    'Sol Sage': {
      'Wonder Seeker': 'Your curiosity about life\'s mysteries is building the foundation for profound wisdom. Every question opens new dimensions of understanding.',
      'Truth Hunter': 'You\'re developing discernment that cuts through illusion. This phase sharpens the perception that will guide your teaching.',
      'Experience Collector': 'You\'re gathering the diverse knowledge that will become integrated wisdom. Each experience adds to your future insights.',
      'Wisdom Teacher': 'Your collected experiences are crystallizing into teachable wisdom. You\'re learning how to share what you\'ve discovered.',
      'Universal Connector': 'You see the patterns that connect all knowledge. Your role is helping others understand life\'s deeper interconnections.',
      'Cosmic Philosopher': 'You embody the marriage of experience and insight. Your perspective bridges earthly wisdom and cosmic understanding.'
    },
    'Sol Builder': {
      'Foundation Layer': 'You\'re developing the patience and persistence that creates lasting impact. This phase builds the bedrock of your future achievements.',
      'Skill Forger': 'You\'re mastering the tools that will build your legacy. Every skill refined now multiplies your future creative power.',
      'Structure Creator': 'Your vision is taking concrete form. This phase teaches you how ideas become enduring realities.',
      'Master Builder': 'You\'ve learned to create systems that outlast their creator. Your focus now is on structures that serve collective evolution.',
      'Architect of Legacy': 'You build foundations that will support future generations. Your creations become the infrastructure for others\' dreams.',
      'Eternal Foundation': 'You embody the principles that create lasting change. Your presence becomes the bedrock others build upon.'
    },
    'Sol Artist': {
      'Beauty Discoverer': 'You\'re awakening to beauty as a transformative force. This phase develops your ability to see art in everything.',
      'Creative Rebel': 'You\'re learning that authentic expression requires courage. Your artistic voice is finding its unique frequency.',
      'Harmony Weaver': 'You\'re mastering the art of bringing disparate elements into beautiful unity. This skill will define your creative signature.',
      'Beauty Ambassador': 'Your creations are ready to heal and inspire communities. You\'ve learned how art becomes a force for collective transformation.',
      'Harmony Master': 'You embody the principles of beauty that transcend personal expression. Your art now serves universal harmony.',
      'Pure Beauty': 'You\'ve become a living artwork, expressing beauty through your very being. Your presence inspires others to create.'
    }
  };

  return phaseWisdom[archetype]?.[phaseName] || `You're in a powerful ${agePhase.toLowerCase()} period of growth and discovery.`;
}

// Generate compelling key themes that hint at deeper patterns and create curiosity
function getKeyThemeInsight(archetype: string, foundation: string, depth: string, agePhase: string, phaseName?: string): string {
  const foundationType = foundation.replace(' Foundation', '').toLowerCase();
  const depthType = depth.replace(' Depth', '').toLowerCase();
  const archetypeCore = archetype.replace('Sol ', '').toLowerCase();
  
  // Foundation-Depth combinations create unique expressions
  const combinationInsights: Record<string, Record<string, string>> = {
    'seeker': {
      'explorer': 'Your broad curiosity is uncovering patterns that others miss entirely. There\'s a hidden structure emerging in your explorations.',
      'artisan': 'Your search for truth is developing into masterful discernment. You\'re learning to craft wisdom from raw experience.',
      'alchemist': 'Your questioning mind is discovering the secrets of transformation. Every inquiry is revealing deeper mysteries.',
      'sage': 'Your endless curiosity is synthesizing into profound insights. You\'re seeing connections that span multiple dimensions.',
      'mystic': 'Your seeking is touching the transcendent. There are cosmic patterns calling to your awakening consciousness.'
    },
    'builder': {
      'explorer': 'Your systematic approach is revealing new frontiers of possibility. You\'re building bridges to unexplored territories.',
      'artisan': 'Your structural thinking is creating beautiful, lasting forms. There\'s an art emerging in your methodical approach.',
      'alchemist': 'Your building process is becoming transformational alchemy. You\'re discovering how structures can catalyze profound change.',
      'sage': 'Your constructions are embodying timeless wisdom. Every foundation you lay contains deeper teachings.',
      'mystic': 'Your building transcends the physical plane. You\'re creating structures that bridge earthly and cosmic realms.'
    },
    'nurturer': {
      'explorer': 'Your caring nature is discovering new ways to foster growth. You\'re exploring territories of healing others haven\'t mapped.',
      'artisan': 'Your nurturing touch is creating sustainable beauty. There\'s an artistry in how you cultivate flourishing.',
      'alchemist': 'Your care is becoming a force of profound transformation. You\'re learning to heal at levels others can\'t reach.',
      'sage': 'Your nurturing wisdom spans generations. You\'re discovering patterns of growth that echo across time.',
      'mystic': 'Your caring touches the eternal. There\'s a sacred dimension to how you help souls evolve.'
    },
    'innovator': {
      'explorer': 'Your breakthrough thinking is opening entirely new realms. You\'re pioneering territories of possibility.',
      'artisan': 'Your innovations are taking beautiful, refined form. There\'s an elegance emerging in your revolutionary ideas.',
      'alchemist': 'Your creativity is becoming transformational magic. You\'re discovering how innovation can transmute reality itself.',
      'sage': 'Your breakthroughs carry ancient wisdom into new forms. You\'re bridging timeless truth with cutting-edge insight.',
      'mystic': 'Your innovations channel cosmic intelligence. There\'s a transcendent source flowing through your creativity.'
    },
    'wisdom': {
      'explorer': 'Your experienced perspective is revealing uncharted depths of understanding. You\'re mapping territories of insight.',
      'artisan': 'Your wisdom is expressing through masterful creation. There\'s a refinement in how you share what you\'ve learned.',
      'alchemist': 'Your knowledge has become transformational power. You\'re discovering how wisdom can transmute any experience.',
      'sage': 'Your accumulated insights are crystallizing into universal principles. You\'re touching the eternal patterns.',
      'mystic': 'Your wisdom transcends ordinary understanding. There\'s a cosmic dimension to your accumulated knowledge.'
    },
    'harmonic': {
      'explorer': 'Your balanced nature is discovering the hidden unity in all exploration. You\'re finding the thread that connects everything.',
      'artisan': 'Your harmonious approach creates beautiful synthesis. There\'s an artistry in how you blend all elements.',
      'alchemist': 'Your balance enables the deepest transformations. You\'re learning to transmute through perfect equilibrium.',
      'sage': 'Your harmony embodies universal wisdom. You\'re becoming a living example of integrated understanding.',
      'mystic': 'Your balance touches the cosmic order. There\'s a divine proportion emerging in your expression.'
    }
  };

  const insight = combinationInsights[foundationType]?.[depthType] || 
    `Your ${foundationType} foundation and ${depthType} depth are creating a unique ${archetypeCore} expression. There are hidden patterns emerging in your evolution that reveal deeper cosmic signatures.`;

  return insight;
}

const SolEvolution: React.FC<SolEvolutionProps> = ({ bookmark }) => {
  // Generate complete solar profile from birth date
  const solarProfile = bookmark?.birthDate ? getCompleteSolarProfile(bookmark.birthDate) : null;
  
  const sunSign = solarProfile?.sunSign || (bookmark?.birthDate ? getSunSign(bookmark.birthDate) : '');
  const solArchetype = solarProfile?.archetype || bookmark?.solArchetype || '';
  const foundation = solarProfile?.foundation || bookmark?.foundation || 'Seeker Foundation';
  const depth = solarProfile?.depth || bookmark?.depth || 'Explorer Depth';
  const agePhase = solarProfile?.agePhase || bookmark?.agePhase || '';

  // Use solAge from bookmark if present, otherwise calculate from birthDate
  const solAge =
    typeof bookmark.solAge === 'number' && !isNaN(bookmark.solAge)
      ? bookmark.solAge
      : bookmark.birthDate
        ? Math.floor((Date.now() - new Date(bookmark.birthDate).getTime()) / (1000 * 60 * 60 * 24))
        : undefined;

  // Debug: log the values used for phase calculation
  // eslint-disable-next-line no-console
  console.log('SolEvolution debug:', {
    solArchetype,
    solAge,
    foundation,
    depth,
    agePhase,
    phaseInfo: solArchetype && solAge !== undefined ? getSolPhase(solArchetype, solAge) : null,
    bookmark
  });

  const phaseInfo = solArchetype && solAge !== undefined ? getSolPhase(solArchetype, solAge) : null;

  // Current Phase: name, age range, description with enhanced foundation/depth context
  let phaseLabel = '';
  let phaseDescription = '';
  if (phaseInfo && solArchetype) {
    const phaseRanges = {
      'Sol Innovator': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Nurturer': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Alchemist': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Sage': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Builder': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
      'Sol Artist': [
        { min: 0, max: 3652 },
        { min: 3653, max: 7305 },
        { min: 7306, max: 10957 },
        { min: 10958, max: 18262 },
        { min: 18263, max: 21914 },
        { min: 21915, max: Infinity },
      ],
    };
    const phaseRange = phaseRanges[solArchetype][phaseInfo.phase - 1];
    const ageRange = dayRangeToAgeRange(phaseRange.min, phaseRange.max === Infinity ? phaseRange.min + 3652 : phaseRange.max);
    phaseLabel = `CURRENT PHASE (${ageRange})`;
    
    // Enhanced description with phase-specific insights
    const phaseInsights = getPhaseInsight(phaseInfo.name, solArchetype, foundation, depth, agePhase);
    phaseDescription = `The ${phaseInfo.name} — ${phaseInsights}`;
  } else {
    phaseLabel = 'CURRENT PHASE';
    phaseDescription = 'Your current phase information will appear here.';
  }

  // Enhanced Key Themes with compelling insights that create curiosity
  const keyTheme = getKeyThemeInsight(solArchetype, foundation, depth, agePhase, phaseInfo?.name);

  // Upcoming Milestone
  let milestoneLabel = '';
  let milestoneDescription = '';
  if (bookmark.birthDate && solAge !== undefined) {
    const milestone = getNextMilestone(solAge, new Date(bookmark.birthDate));
    if (milestone) {
      milestoneLabel = `UPCOMING MILESTONE (DAY ${milestone.cycles.toLocaleString()})`;
      milestoneDescription = `${milestone.description} — ${milestone.daysToMilestone} days away.`;
    } else {
      milestoneLabel = 'UPCOMING MILESTONE';
      milestoneDescription = 'Your next milestone will appear here.';
    }
  } else {
    milestoneLabel = 'UPCOMING MILESTONE';
    milestoneDescription = 'Your next milestone will appear here.';
  }

  return (
    <div className="w-full max-w-xl mx-auto p-8 bg-white border border-gray-200 rounded-none flex flex-col gap-4">
      <div className="text-2xl font-serif font-semibold text-center">Your current Sol evolution</div>
      {/* Current Phase */}
      <div className="flex gap-3 items-start mb-2">
        <Image src="/you/little_light.svg" alt="Current Phase Icon" width={32} height={32} className="w-8 h-8" />
        <div>
          <div className="font-mono text-[#E67803] text-lg font-medium uppercase tracking-tight mb-1">{phaseLabel}</div>
          <div className="font-serif text-lg text-black leading-snug">{phaseDescription}</div>
        </div>
      </div>
      {/* Key Themes */}
      <div className="flex gap-3 items-start mb-2">
        <Image src="/you/little_star.svg" alt="Key Themes Icon" width={32} height={32} className="w-8 h-8 mt-1" />
        <div>
          <div className="font-mono text-[#E67803] text-lg font-medium uppercase tracking-tight mb-1">KEY THEMES THIS SOLAR YEAR</div>
          <div className="font-serif text-lg text-black leading-snug">{keyTheme}</div>
        </div>
      </div>
      {/* Upcoming Milestone */}
      <div className="flex gap-3 items-start">
        <Image src="/you/little_nova.svg" alt="Upcoming Milestone Icon" width={32} height={32} className="w-8 h-8 mt-1" />
        <div>
          <div className="font-mono text-[#E67803] text-lg font-medium uppercase tracking-tight mb-1">{milestoneLabel}</div>
          <div className="font-serif text-lg text-black leading-snug">{milestoneDescription}</div>
        </div>
      </div>
    </div>
  );
};

export default SolEvolution; 
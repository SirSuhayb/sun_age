// Centralized sharing utilities with bot post references
import { getLatestBotPost, type BotPostType } from './botPosts';

export interface ShareOptions {
  text: string;
  embeds: string[];
  botPostType?: BotPostType;
  sdk?: any;
  isInFrame?: boolean;
}

// Enhanced compose cast function that includes bot post references
export async function composeWithBotReference(options: ShareOptions) {
  const { text, embeds, botPostType, sdk, isInFrame } = options;
  
  // Get bot post reference if type is specified
  let botPost: any = null;
  if (botPostType) {
    botPost = await getLatestBotPost(botPostType);
    console.log(`[composeWithBotReference] Bot post found for ${botPostType}:`, botPost?.cast_hash);
  }
  
  // Prepare compose options - start with existing embeds
  let finalEmbeds = [...embeds];
  
  // Add bot cast URL as an embed for proper quoting (instead of parent reference)
  if (botPost && botPost.cast_hash) {
    const botCastUrl = `https://warpcast.com/solaracosmos/${botPost.cast_hash}`;
    // Farcaster allows max 2 embeds, so we need to prioritize
    if (finalEmbeds.length < 2) {
      finalEmbeds.push(botCastUrl);
      console.log(`[composeWithBotReference] Added bot cast as embed:`, botCastUrl);
    } else {
      // If we're at the limit, replace the last embed (mini app URL) with the bot cast
      // Keep the first embed (frame URL) as it's more important for visual experience
      finalEmbeds[finalEmbeds.length - 1] = botCastUrl;
      console.log(`[composeWithBotReference] Replaced last embed with bot cast:`, botCastUrl);
    }
  }
  
  const composeOptions: any = {
    text,
    embeds: finalEmbeds,
  };
  
  if (isInFrame && sdk) {
    console.log(`[composeWithBotReference] Sharing via Farcaster SDK with options:`, composeOptions);
    return await sdk.actions.composeCast(composeOptions);
  } else {
    // For non-frame sharing, include bot cast URL in embeds
    console.log(`[composeWithBotReference] Sharing via Warpcast compose URL with bot cast embed`);
    const composeUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds=${encodeURIComponent(finalEmbeds.join(','))}`;
    window.open(composeUrl, "_blank");
    return { success: true };
  }
}

// Sol Age sharing with bot reference
export async function shareSolAge(
  days: number, 
  approxYears: number, 
  birthDate: string, 
  userName: string = 'TRAVELLER',
  profilePicUrl?: string,
  archetype?: string,
  quote?: string,
  sdk?: any,
  isInFrame?: boolean
) {
  const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  
  // Create the shared URL with encoded parameters (this route has fc:frame metadata)
  const shareParams = new URLSearchParams({
    solAge: days.toString(),
    ...(archetype && { archetype }),
    ...(quote && { quote })
  });
  const sharedUrl = `${baseUrl}/solage/shared/${encodeURIComponent(shareParams.toString())}`;
  
  const miniAppUrl = 'https://www.solara.fyi';
  const message = `I'm a ${archetype || 'Solar Being'} powered by ${days} days of pure sunlight ☀️\n\nDiscover your Solar Identity: https://www.solara.fyi`;
  
  return await composeWithBotReference({
    text: message,
    embeds: [sharedUrl, miniAppUrl], // Shared URL (with fc:frame) + mini app URL (2 embeds max)
    botPostType: 'sol_age_prompt',
    sdk,
    isInFrame
  });
}

// Pledge sharing with bot reference
export async function sharePledge(
  signatureMsg: string,
  userName: string = 'TRAVELLER',
  fid?: string,
  solAge?: string,
  currentDate?: string,
  profilePicUrl?: string,
  sdk?: any,
  isInFrame?: boolean
) {
  const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
  const ogImageUrl = `${url}/api/og/vow?userName=${encodeURIComponent(userName)}&fid=${fid || ''}&solAge=${solAge || ''}&currentDate=${encodeURIComponent(currentDate || '')}${profilePicUrl ? `&profilePicUrl=${encodeURIComponent(profilePicUrl)}` : ''}`;
  const shareText = `I've inscribed my Solar Vow into eternity:\n"${signatureMsg}"\n\nMake a vow and join the convergence: ${url}`;
  
  return await composeWithBotReference({
    text: shareText,
    embeds: [ogImageUrl],
    botPostType: 'pledge_encouragement',
    sdk,
    isInFrame
  });
}

// Roll sharing with bot reference
export async function shareRoll(
  roll: {
    title: string;
    description: string;
    archetype: string;
    rarity: string;
    icon: string;
    type: string;
  },
  userName: string = 'TRAVELLER',
  solarEarned?: number,
  streak?: number,
  sdk?: any,
  isInFrame?: boolean
) {
  const url = process.env.NEXT_PUBLIC_URL || window.location.origin;
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  
  // Create OG image URL for the roll
  const ogImageUrl = `${baseUrl}/api/og/roll?title=${encodeURIComponent(roll.title)}&archetype=${encodeURIComponent(roll.archetype)}&rarity=${encodeURIComponent(roll.rarity)}&icon=${encodeURIComponent(roll.icon)}&type=${encodeURIComponent(roll.type)}${solarEarned ? `&solarEarned=${solarEarned}` : ''}${streak ? `&streak=${streak}` : ''}`;
  
  // Create message text
  const rarityEmoji = roll.rarity === 'legendary' ? '🌟' : roll.rarity === 'rare' ? '💎' : '✨';
  const solarText = solarEarned ? ` (+${solarEarned} $SOLAR earned!)` : '';
  const streakText = streak && streak > 1 ? ` • ${streak} day streak! 🔥` : '';
  
  const message = `The cosmos guided me to: "${roll.title}" ${roll.icon}\n\n${rarityEmoji} ${roll.rarity} ${roll.type} for ${roll.archetype}${solarText}${streakText}\n\nGet your daily cosmic guidance: https://www.solara.fyi/surprise-me`;
  
  const miniAppUrl = 'https://www.solara.fyi/surprise-me';
  
  return await composeWithBotReference({
    text: message,
    embeds: [ogImageUrl, miniAppUrl],
    botPostType: 'sol_age_prompt', // Reuse existing bot post type or create new one
    sdk,
    isInFrame
  });
}
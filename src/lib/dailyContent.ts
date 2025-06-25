import { createClient } from '~/utils/supabase/server';

// Fallback data for when database is unavailable
const fallbackAffirmations = [
  {
    id: 'fallback-1',
    prompt_type: 'affirmation',
    prompt_description: 'Each rotation around the sun brings new wisdom and deeper understanding of my cosmic journey.',
    prompt_author: 'Solara Wisdom',
    inspiration_notes: 'Reflects on the continuous nature of growth',
    is_active: true,
  },
  {
    id: 'fallback-2',
    prompt_type: 'affirmation',
    prompt_description: 'I am aligned with the rhythms of the universe and trust in the timing of my solar cycles.',
    prompt_author: 'Solara Wisdom',
    inspiration_notes: 'Emphasizes cosmic alignment and trust',
    is_active: true,
  },
  {
    id: 'fallback-3',
    prompt_type: 'affirmation',
    prompt_description: 'My infinite rotations represent endless possibilities for transformation and growth.',
    prompt_author: 'Solara Wisdom',
    inspiration_notes: 'Focuses on infinite potential',
    is_active: true,
  },
];

const fallbackDailyPrompts = [
  {
    id: 'prompt-1',
    prompt_type: 'daily_prompt',
    prompt_description: 'What new perspective have your recent solar rotations brought into your life?',
    prompt_author: 'Solara Reflection',
    inspiration_notes: 'Encourages reflection on recent growth',
    is_active: true,
  },
  {
    id: 'prompt-2',
    prompt_type: 'daily_prompt',
    prompt_description: 'How can you honor the cosmic cycles that influence your daily journey?',
    prompt_author: 'Solara Reflection',
    inspiration_notes: 'Connects daily life to cosmic awareness',
    is_active: true,
  },
  {
    id: 'prompt-3',
    prompt_type: 'daily_prompt',
    prompt_description: 'What intention will guide your next rotation around the sun?',
    prompt_author: 'Solara Reflection',
    inspiration_notes: 'Forward-looking intention setting',
    is_active: true,
  },
  {
    id: 'prompt-4',
    prompt_type: 'daily_prompt',
    prompt_description: 'In what ways has your solar age wisdom influenced your relationships and connections?',
    prompt_author: 'Solara Reflection',
    inspiration_notes: 'Explores wisdom and relationships',
    is_active: true,
  },
  {
    id: 'prompt-5',
    prompt_type: 'daily_prompt',
    prompt_description: 'How do you celebrate the milestones in your cosmic journey?',
    prompt_author: 'Solara Reflection',
    inspiration_notes: 'Encourages celebration and recognition',
    is_active: true,
  },
];

// Helper function to format the daily content response
const formatDailyContent = (date: string, primaryPrompt: any, secondaryPrompts: any[]) => {
  return {
    date: date,
    primary: {
      type: primaryPrompt.prompt_type,
      text: primaryPrompt.prompt_description,
      author: primaryPrompt.prompt_author,
      id: primaryPrompt.id,
    },
    secondary: secondaryPrompts.map((p: any) => ({
      type: p.prompt_type,
      text: p.prompt_description,
      author: p.prompt_author,
      id: p.id,
    })),
  };
};

// Fallback function when database is unavailable
const getFallbackContent = (date: Date) => {
  const dateString = date.toISOString().split('T')[0];
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

  // Select primary affirmation (rotating)
  const primaryIndex = dayOfYear % fallbackAffirmations.length;
  const primaryPrompt = fallbackAffirmations[primaryIndex];

  // Select 3 secondary prompts (rotating)
  const secondaryPrompts: any[] = [];
  for (let i = 0; i < 3; i++) {
    const index = (dayOfYear + i) % fallbackDailyPrompts.length;
    secondaryPrompts.push(fallbackDailyPrompts[index]);
  }

  return formatDailyContent(dateString, primaryPrompt, secondaryPrompts);
};

// Main function to select daily content
export const selectDailyContent = async (date: Date) => {
  try {
    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, using fallback content');
      return getFallbackContent(date);
    }

    const supabase = await createClient();
    const dateString = date.toISOString().split('T')[0];
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

    // 1. Check cache first
    const { data: existingSelection } = await supabase
      .from('daily_content_selections')
      .select('primary_prompt_id, secondary_prompt_ids')
      .eq('date', dateString)
      .single();

    if (existingSelection) {
      const { data: primaryPrompt } = await supabase
          .from('daily_prompts')
          .select('*')
          .eq('id', existingSelection.primary_prompt_id)
          .single();

      const { data: secondaryPrompts } = await supabase
          .from('daily_prompts')
          .select('*')
          .in('id', existingSelection.secondary_prompt_ids);
      
      if (primaryPrompt && secondaryPrompts) {
          return formatDailyContent(dateString, primaryPrompt, secondaryPrompts);
      }
    }

    // 2. Generate new selection if not in cache
    const { data: affirmations, error: affirmationsError } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('prompt_type', 'affirmation')
      .eq('is_active', true);

    if (affirmationsError) {
      console.log('Database error, using fallback content:', affirmationsError.message);
      return getFallbackContent(date);
    }
    
    if (!affirmations || affirmations.length === 0) {
      console.log('No affirmations found in database, using fallback content');
      return getFallbackContent(date);
    }

    const { data: dailyPrompts, error: promptsError } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('prompt_type', 'daily_prompt')
      .eq('is_active', true);

    if (promptsError) {
      console.log('Database error, using fallback content:', promptsError.message);
      return getFallbackContent(date);
    }
    
    if (!dailyPrompts || dailyPrompts.length === 0) {
      console.log('No daily prompts found in database, using fallback content');
      return getFallbackContent(date);
    }

    // 3. Select primary affirmation (rotating)
    const primaryIndex = dayOfYear % affirmations.length;
    const primaryPrompt = affirmations[primaryIndex];

    // 4. Select 3 secondary prompts (rotating)
    const secondaryPrompts: any[] = [];
    for (let i = 0; i < 3; i++) {
      const index = (dayOfYear + i) % dailyPrompts.length;
      secondaryPrompts.push(dailyPrompts[index]);
    }
    const secondaryPromptIds = secondaryPrompts.map((p: any) => p.id);

    // 5. Cache the selection
    const { error: insertError } = await supabase.from('daily_content_selections').insert({
      date: dateString,
      primary_prompt_id: primaryPrompt.id,
      secondary_prompt_ids: secondaryPromptIds,
    });

    if (insertError) {
      if (insertError.code === '23505') { // unique_violation
        return selectDailyContent(date);
      }
      console.log('Cache error, continuing with content:', insertError.message);
    }

    // 6. Return the newly created content
    return formatDailyContent(dateString, primaryPrompt, secondaryPrompts);
    
  } catch (error) {
    console.log('Unexpected error, using fallback content:', error);
    return getFallbackContent(date);
  }
}; 
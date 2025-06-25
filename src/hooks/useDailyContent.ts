import { useState, useEffect } from 'react';

interface DailyPrompt {
  type: string;
  text: string;
  author: string;
  id: string;
}

interface DailyContent {
  date: string;
  primary: DailyPrompt;
  secondary: DailyPrompt[];
}

export function useDailyContent() {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    async function fetchDailyContent() {
      try {
        setIsLoading(true);
        setError(null);
        setUsingFallback(false);
        
        const response = await fetch('/api/prompts/today');
        
        if (!response.ok) {
          const errorData = await response.json();
          console.log('API error, content may be using fallback:', errorData.details || 'Failed to fetch daily content');
          // Don't throw error here - the API might be returning fallback content with an error status
        }
        
        const data = await response.json();
        
        if (data.content) {
          setContent(data.content);
          // Check if we're using fallback content based on author names
          const isPrimaryFallback = data.content.primary.author === 'Solara Wisdom';
          const isSecondaryFallback = data.content.secondary.some((p: DailyPrompt) => p.author === 'Solara Reflection');
          setUsingFallback(isPrimaryFallback || isSecondaryFallback);
        } else {
          throw new Error('No content received from API');
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to fetch daily content';
        setError(new Error(errorMessage));
        console.log("Daily content fetch error:", e);
        // Don't leave content empty - this error handling is here as a last resort
      } finally {
        setIsLoading(false);
      }
    }

    fetchDailyContent();
  }, []);

  return { content, isLoading, error, usingFallback };
} 
const NYT_API_KEY = 'ABDzALAYMspbXaM2DHR4l6kPImeP16Na';

async function fetchWikipediaEvent(date: Date): Promise<{ text: string, url?: string } | null> {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.events || !Array.isArray(data.events)) return null;
    // Find event closest to the target year
    let bestEvent: any = null;
    let minYearDiff = Infinity;
    for (const event of data.events as any[]) {
      if (!event.year || !event.text) continue;
      const diff = Math.abs(event.year - year);
      if (diff < minYearDiff) {
        minYearDiff = diff;
        bestEvent = event;
      }
    }
    if (bestEvent) {
      return {
        text: `${bestEvent.year}: ${bestEvent.text}`,
        url: bestEvent.pages && bestEvent.pages[0] && bestEvent.pages[0].content_urls?.desktop?.page,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchHistoricalEvent(date: Date): Promise<{ text: string, url?: string } | null> {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const url = `https://byabbe.se/on-this-day/${month}/${day}/events.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.events || !Array.isArray(data.events)) return null;
    // Find event closest to the target year
    let bestEvent: any = null;
    let minYearDiff = Infinity;
    for (const event of data.events as any[]) {
      if (!event.year || !event.description) continue;
      const diff = Math.abs(Number(event.year) - year);
      if (diff < minYearDiff) {
        minYearDiff = diff;
        bestEvent = event;
      }
    }
    if (bestEvent) {
      return {
        text: `${bestEvent.year}: ${bestEvent.description}`,
        url: bestEvent.wikipedia && bestEvent.wikipedia[0] && bestEvent.wikipedia[0].wikipedia,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchNYTEvent(date: Date): Promise<{ text: string, url?: string } | null> {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const url = `https://api.nytimes.com/svc/archive/v1/${year}/${month}.json?api-key=${NYT_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.response || !data.response.docs) return null;
    // Find article published on the target day
    const articles = data.response.docs.filter((doc: any) => {
      if (!doc.pub_date) return false;
      const pub = new Date(doc.pub_date);
      return pub.getUTCDate() === day && pub.getUTCMonth() + 1 === month && pub.getUTCFullYear() === year;
    });
    if (articles.length > 0) {
      const article: any = articles[0];
      return {
        text: `${year}: ${article.headline.main}`,
        url: article.web_url,
      };
    }
    // If no article for the exact day, pick the closest
    let minDiff = Infinity;
    let bestArticle: any = null;
    for (const doc of data.response.docs as any[]) {
      if (!doc.pub_date) continue;
      const pub = new Date(doc.pub_date);
      const diff = Math.abs(pub.getTime() - date.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        bestArticle = doc;
      }
    }
    if (bestArticle) {
      return {
        text: `${year}: ${bestArticle.headline.main}`,
        url: bestArticle.web_url,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getWorldEventForDate(date: Date): Promise<{ text: string, url?: string }> {
  // 1. Try Wikipedia
  const wiki = await fetchWikipediaEvent(date);
  if (wiki) return wiki;
  // 2. Try Historical Events API
  const hist = await fetchHistoricalEvent(date);
  if (hist) return hist;
  // 3. Try NYT
  const nyt = await fetchNYTEvent(date);
  if (nyt) return nyt;
  // Fallback
  return { text: 'No world event found for this date.' };
} 
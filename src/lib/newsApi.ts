// News API utility functions
// Uses Supabase Edge Function as a proxy to avoid CORS issues

import { supabase, isSupabaseConfigured } from './supabase-client';
import { API_KEYS } from '../config/apiKeys';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

/**
 * Fetch news using Supabase Edge Function proxy
 */
export async function fetchNewsViaSupabase(
  query?: string,
  category?: string,
  country: string = 'in'
): Promise<NewsResponse> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please set up your Supabase credentials.');
  }

  try {
    const { data, error } = await supabase.functions.invoke('news-proxy', {
      body: { query, category, country },
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to fetch news: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('Supabase function invocation failed:', err);
    throw err;
  }
}

/**
 * Fetch news directly (fallback method, has CORS issues on free tier)
 */
export async function fetchNewsDirect(
  query?: string,
  category?: string,
  country: string = 'in'
): Promise<NewsResponse> {
  let url: string;
  
  if (query) {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20`;
  } else if (category) {
    url = `https://newsapi.org/v2/top-headlines?category=${category}&country=${country}&pageSize=20`;
  } else {
    url = `https://newsapi.org/v2/top-headlines?category=business&country=${country}&pageSize=20`;
  }

  const response = await fetch(url, {
    headers: {
      'X-Api-Key': API_KEYS.newsApi,
    },
  });

  if (!response.ok) {
    throw new Error(`NewsAPI request failed: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Main function to fetch news - tries Supabase proxy first, falls back to direct
 */
export async function fetchNews(
  query?: string,
  category?: string,
  country: string = 'in'
): Promise<NewsResponse> {
  // Try Supabase proxy first if configured
  if (isSupabaseConfigured()) {
    try {
      return await fetchNewsViaSupabase(query, category, country);
    } catch (error) {
      console.warn('Supabase proxy failed, trying direct API:', error);
    }
  }

  // Fallback to direct API (may have CORS issues)
  try {
    return await fetchNewsDirect(query, category, country);
  } catch (error) {
    console.error('Direct API also failed:', error);
    // Return mock data as last resort
    return getMockNews();
  }
}

/**
 * Mock news data for demo purposes
 */
export function getMockNews(): NewsResponse {
  return {
    status: 'ok',
    totalResults: 5,
    articles: [
      {
        source: { id: null, name: 'Mock News' },
        author: 'Finance Desk',
        title: 'Stock Market Reaches New Heights Amid Economic Recovery',
        description: 'Indian stock markets continue their upward trajectory as economic indicators show strong recovery signals.',
        url: '#',
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        content: 'Major indices showed significant gains as investor confidence remains high...',
      },
      {
        source: { id: null, name: 'Mock News' },
        author: 'Business Reporter',
        title: 'RBI Maintains Interest Rates in Latest Policy Review',
        description: 'The Reserve Bank of India kept key interest rates unchanged, focusing on inflation management.',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        content: 'The monetary policy committee voted unanimously to maintain the status quo...',
      },
      {
        source: { id: null, name: 'Mock News' },
        author: 'Tech & Finance',
        title: 'Digital Payments Hit Record High in India',
        description: 'UPI transactions crossed a new milestone, showcasing India\'s digital payment revolution.',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        content: 'The surge in digital payments reflects the growing adoption of fintech solutions...',
      },
      {
        source: { id: null, name: 'Mock News' },
        author: 'Investment Analyst',
        title: 'Mutual Fund Industry Sees Strong Growth in SIP Contributions',
        description: 'Systematic Investment Plans continue to attract retail investors across the country.',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        content: 'Monthly SIP contributions have reached an all-time high, showing sustained investor interest...',
      },
      {
        source: { id: null, name: 'Mock News' },
        author: 'Market Watch',
        title: 'Gold Prices Show Volatility Amid Global Uncertainty',
        description: 'Precious metal prices fluctuate as investors weigh economic and geopolitical factors.',
        url: '#',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        content: 'Gold remains a safe haven asset as market participants navigate uncertain times...',
      },
    ],
  };
}
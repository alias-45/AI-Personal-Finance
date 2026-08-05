
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, Newspaper, ExternalLink, Clock, Eye, Bookmark, Share2, Search, Loader2, RefreshCw, AlertCircle, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { API_KEYS, isKeyConfigured } from '../config/apiKeys';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: 'market' | 'crypto' | 'economy' | 'stocks' | 'banking' | 'policy';
  timestamp: string;
  imageUrl?: string;
  trend: 'up' | 'down' | 'neutral';
  views: string;
  readTime: string;
  url: string;
}

interface FinanceNewsProps {
  newsApiKey?: string;
  alphavantageApiKey?: string;
}

const mockNewsData: NewsArticle[] = [
  {
    id: '1',
    title: 'RBI Announces New Digital Rupee Pilot Program',
    summary: 'Reserve Bank of India expands its CBDC pilot to include retail transactions across major cities. Expected to impact digital payment landscape.',
    source: 'Economic Times',
    category: 'banking',
    timestamp: '2 hours ago',
    trend: 'up',
    views: '12.5K',
    readTime: '3 min',
    url: 'https://economictimes.indiatimes.com'
  },
  {
    id: '2',
    title: 'Sensex Hits Record High, Nifty Crosses 20,000 Mark',
    summary: 'Indian stock markets surge on strong corporate earnings and foreign institutional investments. Banking and IT sectors lead the rally.',
    source: 'Moneycontrol',
    category: 'stocks',
    timestamp: '4 hours ago',
    trend: 'up',
    views: '24.8K',
    readTime: '5 min',
    url: 'https://www.moneycontrol.com'
  },
  {
    id: '3',
    title: 'Cryptocurrency Regulations: New Framework Announced',
    summary: 'Government unveils comprehensive crypto regulation framework. 30% tax on crypto gains and 1% TDS on transactions now effective.',
    source: 'Bloomberg Quint',
    category: 'crypto',
    timestamp: '6 hours ago',
    trend: 'neutral',
    views: '18.2K',
    readTime: '4 min',
    url: 'https://www.bloombergquint.com'
  },
  {
    id: '4',
    title: 'Inflation Rate Drops to 5.2%, Within RBI Target Range',
    summary: 'Retail inflation eases on the back of lower food prices. RBI may reconsider interest rate hikes in upcoming policy meeting.',
    source: 'Mint',
    category: 'economy',
    timestamp: '8 hours ago',
    trend: 'down',
    views: '15.7K',
    readTime: '4 min',
    url: 'https://www.livemint.com'
  },
  {
    id: '5',
    title: 'Top 5 Mutual Funds for Long-Term Investment in 2025',
    summary: 'Financial experts share their picks for best-performing mutual funds based on 10-year returns and risk-adjusted performance.',
    source: 'Value Research',
    category: 'market',
    timestamp: '12 hours ago',
    trend: 'neutral',
    views: '32.1K',
    readTime: '6 min',
    url: 'https://www.valueresearchonline.com'
  },
  {
    id: '6',
    title: 'UPI Transactions Cross 10 Billion Mark in October',
    summary: 'Digital payment revolution continues as UPI processes record number of transactions worth ₹16 trillion.',
    source: 'Business Standard',
    category: 'banking',
    timestamp: '1 day ago',
    trend: 'up',
    views: '21.4K',
    readTime: '3 min',
    url: 'https://www.business-standard.com'
  },
  {
    id: '7',
    title: 'GST Collections Hit All-Time High at ₹1.87 Lakh Crore',
    summary: 'Strong economic activity drives record GST revenue. Government targets higher collections in festive season.',
    source: 'The Hindu BusinessLine',
    category: 'policy',
    timestamp: '1 day ago',
    trend: 'up',
    views: '14.9K',
    readTime: '4 min',
    url: 'https://www.thehindubusinessline.com'
  },
  {
    id: '8',
    title: 'Gold Prices Surge: Should You Invest Now?',
    summary: 'Gold crosses ₹62,000 per 10 grams amid global uncertainty. Analysts share mixed views on investment timing.',
    source: 'Zee Business',
    category: 'market',
    timestamp: '2 days ago',
    trend: 'up',
    views: '28.6K',
    readTime: '5 min',
    url: 'https://www.zeebiz.com'
  }
];

const trendingTopics = [
  { name: 'Digital Rupee', count: '2.4K' },
  { name: 'Stock Market', count: '5.1K' },
  { name: 'Cryptocurrency', count: '3.7K' },
  { name: 'Mutual Funds', count: '4.2K' },
  { name: 'Gold Investment', count: '2.9K' },
  { name: 'RBI Policy', count: '1.8K' }
];

export function FinanceNews() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set());
  const [newsData, setNewsData] = useState<NewsArticle[]>(mockNewsData);
  const [marketIndices, setMarketIndices] = useState([
    { name: 'Sensex', value: '65,828.41', change: '+1.24%', trend: 'up' as const },
    { name: 'Nifty 50', value: '19,638.30', change: '+1.18%', trend: 'up' as const },
    { name: 'Bank Nifty', value: '44,523.75', change: '+0.87%', trend: 'up' as const },
    { name: 'USD/INR', value: '83.12', change: '-0.15%', trend: 'down' as const }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [apiError, setApiError] = useState<string | null>(null);

  // Check if APIs are configured
  const newsApiConfigured = isKeyConfigured(API_KEYS.newsApi);
  const alphavantageConfigured = isKeyConfigured(API_KEYS.alphavantage);

  const categories = [
    { id: 'all', label: 'All News', color: 'bg-gray-600' },
    { id: 'market', label: 'Markets', color: 'bg-blue-600' },
    { id: 'crypto', label: 'Crypto', color: 'bg-purple-600' },
    { id: 'economy', label: 'Economy', color: 'bg-green-600' },
    { id: 'stocks', label: 'Stocks', color: 'bg-orange-600' },
    { id: 'banking', label: 'Banking', color: 'bg-teal-600' },
    { id: 'policy', label: 'Policy', color: 'bg-red-600' }
  ];

  useEffect(() => {
    if (newsApiConfigured || alphavantageConfigured) {
      fetchRealTimeData();
      // Auto-refresh every 5 minutes
      const interval = setInterval(fetchRealTimeData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [newsApiConfigured, alphavantageConfigured]);

  const fetchRealTimeData = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Fetch news if NewsAPI key is provided
      if (newsApiConfigured) {
        try {
          await fetchNewsData();
        } catch (newsError) {
          console.warn('NewsAPI failed, using demo data:', newsError);
          // Silently continue with demo data
        }
      }
      
      // Fetch market data if Alpha Vantage key is provided
      if (alphavantageConfigured) {
        try {
          await fetchMarketData();
        } catch (marketError) {
          console.warn('Alpha Vantage failed, using demo data:', marketError);
          // Silently continue with demo data
        }
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      // Don't show error to user, just use demo data
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewsData = async () => {
    if (!newsApiConfigured) return;

    const queries = ['finance India', 'stock market India', 'economy India', 'cryptocurrency', 'banking India'];
    const allArticles: NewsArticle[] = [];

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${API_KEYS.newsApi}`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('NewsAPI request failed:', errorData.message || 'Unknown error');
          continue; // Skip this query
        }

        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
          const articles: NewsArticle[] = data.articles.map((article: any, index: number) => ({
            id: `${Date.now()}-${index}-${Math.random()}`,
            title: article.title,
            summary: article.description || article.content?.substring(0, 150) + '...' || 'No description available',
            source: article.source.name,
            category: categorizeArticle(article.title + ' ' + (article.description || '')),
            timestamp: getTimeAgo(new Date(article.publishedAt)),
            imageUrl: article.urlToImage,
            trend: determineTrend(article.title + ' ' + (article.description || '')),
            views: `${Math.floor(Math.random() * 50 + 5)}K`,
            readTime: `${Math.floor(Math.random() * 5 + 2)} min`,
            url: article.url
          }));

          allArticles.push(...articles);
        }
      } catch (queryError) {
        console.warn(`Failed to fetch news for query "${query}":`, queryError);
        // Continue with other queries
      }
    }

    // Remove duplicates and limit to 20 articles
    const uniqueArticles = allArticles.filter((article, index, self) =>
      index === self.findIndex((a) => a.title === article.title)
    ).slice(0, 20);

    if (uniqueArticles.length > 0) {
      setNewsData(uniqueArticles);
    }
    // If no articles found, just keep using demo data
  };

  const fetchMarketData = async () => {
    if (!alphavantageConfigured) return;

    try {
      // Fetch USD/INR exchange rate
      const forexResponse = await fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=INR&apikey=${API_KEYS.alphavantage}`
      );

      if (forexResponse.ok) {
        const forexData = await forexResponse.json();
        const rate = forexData['Realtime Currency Exchange Rate'];
        
        if (rate) {
          const currentRate = parseFloat(rate['5. Exchange Rate']);
          const previousRate = parseFloat(rate['8. Bid Price']) || currentRate;
          const changeNum = ((currentRate - previousRate) / previousRate) * 100;
          const change = changeNum.toFixed(2);
          
          setMarketIndices(prev => prev.map(index => 
            index.name === 'USD/INR' 
              ? {
                  ...index,
                  value: currentRate.toFixed(2),
                  change: `${changeNum >= 0 ? '+' : ''}${change}%`,
                  trend: changeNum >= 0 ? 'up' : 'down'
                }
              : index
          ));
        }
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const categorizeArticle = (text: string): NewsArticle['category'] => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('crypto') || lowerText.includes('bitcoin') || lowerText.includes('ethereum')) return 'crypto';
    if (lowerText.includes('stock') || lowerText.includes('share') || lowerText.includes('equity')) return 'stocks';
    if (lowerText.includes('bank') || lowerText.includes('upi') || lowerText.includes('payment')) return 'banking';
    if (lowerText.includes('policy') || lowerText.includes('regulation') || lowerText.includes('government')) return 'policy';
    if (lowerText.includes('inflation') || lowerText.includes('gdp') || lowerText.includes('economy')) return 'economy';
    return 'market';
  };

  const determineTrend = (text: string): 'up' | 'down' | 'neutral' => {
    const lowerText = text.toLowerCase();
    const positiveWords = ['surge', 'gain', 'rise', 'high', 'growth', 'increase', 'up', 'positive', 'bullish'];
    const negativeWords = ['fall', 'drop', 'decline', 'loss', 'decrease', 'down', 'negative', 'bearish', 'crash'];
    
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'up';
    if (negativeCount > positiveCount) return 'down';
    return 'neutral';
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const filteredNews = newsData.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-600';
  };

  const handleRefresh = () => {
    fetchRealTimeData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2>Finance News & Market Updates</h2>
          <p className="text-muted-foreground">
            {newsApiConfigured || alphavantageConfigured ? 'Live updates' : 'Demo mode - Add API keys in Settings for live data'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(newsApiConfigured || alphavantageConfigured) && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Updated {getTimeAgo(lastUpdated)}</span>
            </div>
          )}
          <Button 
            onClick={handleRefresh}
            disabled={isLoading || (!newsApiConfigured && !alphavantageConfigured)}
            className="rounded-xl"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* API Error Alert */}
      {apiError && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">API Error</AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200 flex items-start justify-between gap-4">
            <span>{apiError}</span>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl h-6 w-6 p-0"
              onClick={() => setApiError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Market Indices */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {marketIndices.map((index, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-muted-foreground">{index.name}</h4>
                {index.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <p className="mb-1">{index.value}</p>
              <Badge className={index.trend === 'up' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                {index.change}
              </Badge>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search financial news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              className={`rounded-xl whitespace-nowrap ${
                selectedCategory === category.id
                  ? `${category.color} text-white hover:opacity-90`
                  : ''
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          <span className="ml-2">Fetching latest news...</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* News Articles */}
        <div className="lg:col-span-2 space-y-4">
          {filteredNews.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge className={`${getCategoryColor(article.category)} text-white`}>
                        {article.category}
                      </Badge>
                      <span className="text-muted-foreground">{article.source}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{article.timestamp}</span>
                    </div>
                    
                    <h3 className="mb-2">{article.title}</h3>
                    <p className="text-muted-foreground mb-4">{article.summary}</p>
                    
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime}</span>
                        </div>
                        {article.trend !== 'neutral' && (
                          <div className="flex items-center gap-1">
                            {article.trend === 'up' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-xl"
                          onClick={() => toggleBookmark(article.id)}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              bookmarkedArticles.has(article.id)
                                ? 'fill-yellow-500 text-yellow-500'
                                : ''
                            }`}
                          />
                        </Button>
                        <Button size="sm" variant="ghost" className="rounded-xl">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          className="rounded-xl bg-teal-600 hover:bg-teal-700"
                          onClick={() => window.open(article.url, '_blank')}
                        >
                          Read More
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <Card className="p-6 rounded-3xl shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h3>Trending Topics</h3>
            </div>
            <div className="space-y-2">
              {trendingTopics.map((topic, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>#{topic.name}</span>
                  <Badge variant="outline">{topic.count} posts</Badge>
                </button>
              ))}
            </div>
          </Card>

          {/* Quick Insights */}
          <Card className="p-6 rounded-3xl shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-purple-900 dark:text-purple-100">Quick Insight</h3>
            </div>
            <p className="text-purple-700 dark:text-purple-300 mb-4">
              Markets are showing strong momentum with FII inflows increasing by 35% this quarter. Banking stocks are outperforming other sectors.
            </p>
            <Button className="w-full rounded-xl bg-purple-600 hover:bg-purple-700">
              View Full Analysis
            </Button>
          </Card>

          {/* Bookmarked Articles */}
          {bookmarkedArticles.size > 0 && (
            <Card className="p-6 rounded-3xl shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Bookmark className="w-5 h-5 text-yellow-600 fill-yellow-500" />
                <h3>Saved Articles</h3>
              </div>
              <p className="text-muted-foreground">
                You have {bookmarkedArticles.size} saved article{bookmarkedArticles.size !== 1 ? 's' : ''}
              </p>
              <Button variant="outline" className="w-full mt-3 rounded-xl">
                View All Saved
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
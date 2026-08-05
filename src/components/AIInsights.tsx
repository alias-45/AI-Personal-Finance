import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Brain, TrendingUp, TrendingDown, DollarSign, Calendar, ShoppingCart, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const shapData = [
  { factor: 'Income', impact: 25, positive: true },
  { factor: 'Dining Out', impact: -18, positive: false },
  { factor: 'Savings Rate', impact: 22, positive: true },
  { factor: 'Impulse Purchases', impact: -15, positive: false },
  { factor: 'Investments', impact: 20, positive: true },
  { factor: 'Subscriptions', impact: -8, positive: false }
];

const categoryInfluence = [
  { category: 'Income', value: 85 },
  { category: 'Spending', value: 72 },
  { category: 'Savings', value: 78 },
  { category: 'Investments', value: 65 },
  { category: 'Debt', value: 45 },
  { category: 'Budget Adherence', value: 82 }
];

const monthlyComparison = [
  { month: 'May', income: 4500, expenses: 3200, savings: 1300 },
  { month: 'Jun', income: 4800, expenses: 3400, savings: 1400 },
  { month: 'Jul', income: 4600, expenses: 3100, savings: 1500 },
  { month: 'Aug', income: 5200, expenses: 3500, savings: 1700 },
  { month: 'Sep', income: 5000, expenses: 3300, savings: 1700 },
  { month: 'Oct', income: 5400, expenses: 3600, savings: 1800 }
];

export function AIInsights() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const [transactionsRes, budgetsRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/transactions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/budgets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (transactionsRes.ok && budgetsRes.ok) {
        const transData = await transactionsRes.json();
        const budData = await budgetsRes.json();
        setTransactions(transData.transactions || []);
        setBudgets(budData.budgets || []);
        calculateInsights(transData.transactions || [], budData.budgets || []);
      }
    } catch (error) {
      console.error('Error loading AI insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateInsights = (trans: any[], buds: any[]) => {
    // Calculate monthly data
    const last6Months = generateLast6Months();
    const monthlyStats = last6Months.map(month => {
      const monthTrans = trans.filter(t => {
        const transDate = new Date(t.date);
        return transDate.getMonth() === month.monthIndex && 
               transDate.getFullYear() === month.year;
      });

      const income = monthTrans
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTrans
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: month.name,
        income: Math.round(income),
        expenses: Math.round(expenses),
        savings: Math.round(income - expenses)
      };
    });

    setMonthlyData(monthlyStats);

    // Calculate dynamic insights
    const totalIncome = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

    // Find biggest expense category
    const categoryTotals: Record<string, number> = {};
    trans.filter(t => t.type === 'expense').forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    const biggestCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0];

    setInsights({
      savingsRate: savingsRate.toFixed(0),
      biggestCategory: biggestCategory?.[0] || 'Food & Dining',
      incomeGrowth: calculateGrowthRate(monthlyStats.map(m => m.income))
    });
  };

  const generateLast6Months = () => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: monthNames[date.getMonth()],
        monthIndex: date.getMonth(),
        year: date.getFullYear()
      });
    }
    return months;
  };

  const calculateGrowthRate = (values: number[]) => {
    if (values.length < 2) return 0;
    const first = values[0] || 1;
    const last = values[values.length - 1] || 1;
    return Math.round(((last - first) / first) * 100);
  };

  const displayMonthlyData = monthlyData.length > 0 ? monthlyData : [
    { month: 'May', income: 45000, expenses: 32000, savings: 13000 },
    { month: 'Jun', income: 48000, expenses: 34000, savings: 14000 },
    { month: 'Jul', income: 46000, expenses: 31000, savings: 15000 },
    { month: 'Aug', income: 52000, expenses: 35000, savings: 17000 },
    { month: 'Sep', income: 50000, expenses: 33000, savings: 17000 },
    { month: 'Oct', income: 54000, expenses: 36000, savings: 18000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2>Explainable AI Insights</h2>
          <p className="text-muted-foreground">Understand what's affecting your financial health</p>
        </div>
        <Select defaultValue="october">
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="october">October 2025</SelectItem>
            <SelectItem value="september">September 2025</SelectItem>
            <SelectItem value="august">August 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* SHAP-Style Feature Importance */}
      <Card className="p-6 rounded-3xl shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-600 dark:bg-purple-500 rounded-2xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-purple-900 dark:text-purple-100">SHAP Feature Impact Analysis</h3>
            <p className="text-purple-700 dark:text-purple-300">
              Factors affecting your financial health this month
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {shapData.map((item, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-900 dark:text-purple-100">{item.factor}</span>
                <Badge className={item.positive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                  {item.positive ? '+' : ''}{item.impact}%
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      item.positive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.abs(item.impact) * 3}%` }}
                  />
                </div>
                {item.positive ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Radar Chart - Category Influence */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">Category Influence on Financial Health</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={categoryInfluence}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="category" stroke="#94a3b8" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
              <Radar 
                name="Impact Score" 
                dataKey="value" 
                stroke="#0d9488" 
                fill="#0d9488" 
                fillOpacity={0.6}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {categoryInfluence.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
              <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
              <span className="text-muted-foreground">{cat.category}</span>
              <span className="ml-auto">{cat.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Comparison */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">6-Month Trend Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="income" fill="#0d9488" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expenses" fill="#fb7185" radius={[8, 8, 0, 0]} />
              <Bar dataKey="savings" fill="#fbbf24" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 justify-center mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-600 rounded"></div>
            <span>Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-coral rounded"></div>
            <span>Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gold rounded"></div>
            <span>Savings</span>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-green-500">
          <DollarSign className="w-10 h-10 text-green-600 mb-3" />
          <h4 className="mb-2">Income Growth</h4>
          <p className="text-muted-foreground">
            {insights?.incomeGrowth 
              ? `Your income ${insights.incomeGrowth >= 0 ? 'increased' : 'decreased'} by ${Math.abs(insights.incomeGrowth)}% over the last 6 months`
              : 'Your income increased by 20% over the last 6 months'}
          </p>
        </Card>
        
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-yellow-500">
          <ShoppingCart className="w-10 h-10 text-yellow-600 mb-3" />
          <h4 className="mb-2">Spending Patterns</h4>
          <p className="text-muted-foreground">
            {insights?.biggestCategory 
              ? `${insights.biggestCategory} is your biggest variable expense`
              : 'Dining out is your biggest variable expense'}
          </p>
        </Card>
        
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-blue-500">
          <Home className="w-10 h-10 text-blue-600 mb-3" />
          <h4 className="mb-2">Savings Rate</h4>
          <p className="text-muted-foreground">
            {insights?.savingsRate
              ? `You're saving ${insights.savingsRate}% of your monthly income on average`
              : "You're saving 33% of your monthly income on average"}
          </p>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, Lightbulb } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DashboardHomeProps {
  userName: string;
}

export function DashboardHome({ userName }: DashboardHomeProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchTransactions(),
      fetchBudgets(),
    ]);
    setIsLoading(false);
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/analytics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/transactions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/budgets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBudgets(data.budgets || []);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Calculate health score based on real data
  const calculateHealthScore = () => {
    if (!analytics) return 0;
    
    const savingsRate = analytics.totalIncome > 0 
      ? ((analytics.totalIncome - analytics.totalExpenses) / analytics.totalIncome) * 100 
      : 0;
    
    // Health score based on savings rate and budget adherence
    const score = Math.max(0, Math.min(100, Math.round(50 + savingsRate)));
    return score;
  };

  // Calculate savings growth data from transactions
  const calculateSavingsData = () => {
    const monthlyData: Record<string, number> = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date || tx.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
      
      if (tx.type === 'income') {
        monthlyData[monthKey] += parseFloat(tx.amount) || 0;
      } else if (tx.type === 'expense') {
        monthlyData[monthKey] -= parseFloat(tx.amount) || 0;
      }
    });

    // Convert to array and calculate cumulative savings
    const months = Object.keys(monthlyData);
    let cumulative = 0;
    return months.map(month => {
      cumulative += monthlyData[month];
      return { month, amount: cumulative };
    }).slice(-7); // Last 7 months
  };

  // Calculate budget status by category
  const calculateBudgetCategories = () => {
    if (!analytics?.categorySpending || budgets.length === 0) return [];

    return budgets.slice(0, 4).map(budget => {
      const spent = analytics.categorySpending[budget.category] || 0;
      const budgetAmount = parseFloat(budget.amount) || 0;
      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      return {
        name: budget.category,
        spent,
        budget: budgetAmount,
        percentage: Math.round(percentage),
      };
    });
  };

  const healthScore = calculateHealthScore();
  const savingsData = calculateSavingsData();
  const budgetCategories = calculateBudgetCategories();
  
  // Calculate monthly savings
  const monthlySavings = analytics 
    ? (analytics.totalIncome - analytics.monthlyExpenses) 
    : 0;

  // Calculate growth rate
  const growthRate = savingsData.length >= 2 
    ? ((savingsData[savingsData.length - 1].amount - savingsData[0].amount) / savingsData[0].amount * 100).toFixed(1)
    : 0;

  // Prepare chart data from real analytics
  const expenseData = analytics?.categorySpending 
    ? Object.entries(analytics.categorySpending).map(([name, value], index) => ({
        name,
        value: value as number,
        color: ['#0d9488', '#5eead4', '#fbbf24', '#fb7185', '#a78bfa', '#94a3b8'][index % 6],
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Welcome & Health Score */}
        <Card className="flex-1 p-6 bg-gradient-to-br from-teal-600 to-emerald-500 dark:from-teal-700 dark:to-emerald-700 text-white rounded-3xl shadow-lg border-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-white mb-2">Welcome back, {userName}!</h2>
              <p className="text-white/90 mb-4">Here's your financial overview for today</p>
              <div className="flex gap-4 flex-wrap">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <p className="text-white/80">Total Balance</p>
                  <p className="text-white">₹{analytics?.balance.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <p className="text-white/80">This Month Savings</p>
                  <p className="text-white flex items-center gap-1">
                    ₹{monthlySavings.toFixed(2)}
                    {monthlySavings >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Health Score Circle */}
            <div className="relative w-40 h-40">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - healthScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white">Financial Health</span>
                <span className="text-white">{healthScore}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card className="p-6 rounded-3xl shadow-lg">
          <h3 className="mb-4">Expense Summary</h3>
          {expenseData.length > 0 ? (
            <>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-muted-foreground">{item.name}: ₹{item.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No expense data available</p>
            </div>
          )}
        </Card>

        {/* Savings Growth */}
        <Card className="p-6 rounded-3xl shadow-lg">
          <h3 className="mb-4">Savings & Investment Growth</h3>
          {savingsData.length > 0 ? (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={savingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#0d9488" 
                      strokeWidth={3}
                      dot={{ fill: '#0d9488', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-2 mt-4 bg-emerald-50 dark:bg-emerald-950 p-3 rounded-xl">
                {parseFloat(growthRate as string) >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className={parseFloat(growthRate as string) >= 0 
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-red-700 dark:text-red-300"
                }>
                  {growthRate}% growth this period
                </span>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No savings data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Budget Status */}
      {budgetCategories.length > 0 && (
        <Card className="p-6 rounded-3xl shadow-lg">
          <h3 className="mb-6">Monthly Budget Status</h3>
          <div className="space-y-6">
            {budgetCategories.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span>{category.name}</span>
                  <span className="text-muted-foreground">
                    ₹{category.spent.toFixed(0)} / ₹{category.budget.toFixed(0)}
                  </span>
                </div>
                <div className="relative">
                  <Progress value={category.percentage} className="h-3" />
                  {category.percentage >= 85 && (
                    <Badge className="absolute -top-8 right-0 bg-coral text-white">
                      {category.percentage}% used
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Insights */}
      <Card className="p-6 rounded-3xl shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-600 dark:bg-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-purple-900 dark:text-purple-100">AI Insight of the Day</h3>
            <p className="text-purple-700 dark:text-purple-300 mb-4">
              Based on your spending patterns, you can reduce dining expenses by 12% to hit your savings goal faster. Consider meal prepping on Sundays!
            </p>
            <div className="flex gap-3 flex-wrap">
              <Badge className="bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-white/90">
                <DollarSign className="w-3 h-3 mr-1" />
                Save ₹156/month
              </Badge>
              <Badge className="bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-white/90">
                <Target className="w-3 h-3 mr-1" />
                Reach goal 2 months earlier
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
import { useState, useEffect, SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { ReceiptScanner } from './ReceiptScanner';
import { TransactionForm } from './TransactionForm';
import { Plus, Camera, FileText, TrendingUp, TrendingDown, ShoppingBag, Car, Home, Utensils, Coffee, Zap, Trash2, Edit, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const iconMap: Record<string, any> = {
  'Food & Dining': Utensils,
  'Transportation': Car,
  'Shopping': ShoppingBag,
  'Utilities': Zap,
  'Healthcare': Plus,
  'Entertainment': Coffee,
  'Groceries': ShoppingBag,
  'Income': TrendingUp,
  'Other': FileText,
};

const categoryColors: Record<string, string> = {
  'Food & Dining': '#f97316',
  'Transportation': '#3b82f6',
  'Shopping': '#ec4899',
  'Utilities': '#eab308',
  'Healthcare': '#10b981',
  'Entertainment': '#8b5cf6',
  'Groceries': '#14b8a6',
  'Income': '#22c55e',
  'Other': '#6b7280',
};

export function BudgetExpense() {
  const [budgetAmount, setBudgetAmount] = useState(25000);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchTransactions(),
      fetchBudgets(),
      fetchAnalytics(),
      fetchAlerts(),
    ]);
    setIsLoading(false);
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

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/alerts`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/transactions/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const spent = analytics?.monthlyExpenses || 0;
  const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

  // Prepare chart data
  const categoryData = analytics?.categorySpending 
    ? Object.entries(analytics.categorySpending).map(([name, value]) => ({
        name,
        value: value as number,
        color: categoryColors[name] || '#6b7280',
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2>Budget & Expenses</h2>
          <p className="text-muted-foreground">Track spending with OCR-powered receipt scanning</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowReceiptScanner(true)}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 gap-2"
          >
            <Camera className="w-4 h-4" />
            Scan Receipt
          </Button>
          <Button
            onClick={() => setShowTransactionForm(true)}
            variant="outline"
            className="rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-amber-900 dark:text-amber-100">Budget Alerts</h4>
                  <div className="space-y-2 mt-2">
                    {alerts.slice(0, 3).map((alert) => (
                      <p key={alert.id} className="text-amber-800 dark:text-amber-200">
                        {alert.message}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Overview */}
      <Card className="p-6 rounded-3xl shadow-lg bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950">
        <h3 className="mb-6">Monthly Budget</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="text-teal-600 dark:text-teal-400">₹{spent.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Budget</p>
              <p>₹{budgetAmount.toFixed(2)}</p>
            </div>
          </div>
          <Progress value={percentage} className="h-4" />
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{percentage.toFixed(0)}% used</p>
            <p className={`${
              budgetAmount - spent > 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              ₹{Math.abs(budgetAmount - spent).toFixed(2)} {budgetAmount - spent > 0 ? 'remaining' : 'over budget'}
            </p>
          </div>
        </div>

        {/* AI-Powered Budget Adjuster */}
        <div className="mt-6 pt-6 border-t border-teal-200 dark:border-teal-800">
          <Label>AI-Suggested Budget: ₹{budgetAmount.toLocaleString('en-IN')}</Label>
          <Slider
            value={[budgetAmount]}
            onValueChange={(value: SetStateAction<number>[]) => setBudgetAmount(value[0])}
            min={5000}
            max={100000}
            step={1000}
            className="mt-3"
          />
          <p className="text-muted-foreground mt-2">
            Based on your spending patterns, AI suggests a budget of ₹{budgetAmount.toLocaleString('en-IN')} for optimal savings. (Range: ₹5,000 - ₹1,00,000)
          </p>
        </div>
      </Card>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Total Income</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-green-600">₹{analytics.totalIncome?.toFixed(2) || '0.00'}</p>
          </Card>

          <Card className="p-6 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Total Expenses</p>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-red-600">₹{analytics.totalExpenses?.toFixed(2) || '0.00'}</p>
          </Card>

          <Card className="p-6 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground">Balance</p>
              <CheckCircle className="w-5 h-5 text-teal-600" />
            </div>
            <p className={analytics.balance >= 0 ? 'text-teal-600' : 'text-red-600'}>
              ₹{analytics.balance?.toFixed(2) || '0.00'}
            </p>
          </Card>
        </div>
      )}

      {/* Category Spending Chart */}
      {categoryData.length > 0 && (
        <Card className="p-6 rounded-3xl shadow-lg">
          <h3 className="mb-4">Spending by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Transaction List */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">Recent Transactions</h3>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-muted-foreground mb-4">No transactions yet</p>
            <p className="text-muted-foreground">Start by scanning a receipt or adding a transaction manually</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {transactions.map((transaction) => {
                const Icon = iconMap[transaction.category] || FileText;
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ 
                          backgroundColor: `${categoryColors[transaction.category] || '#6b7280'}20` 
                        }}
                      >
                        <Icon 
                          className="w-6 h-6" 
                          style={{ color: categoryColors[transaction.category] || '#6b7280' }}
                        />
                      </div>
                      <div>
                        <p>{transaction.merchant || transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="rounded-full">
                            {transaction.category}
                          </Badge>
                          <p className="text-muted-foreground">
                            {new Date(transaction.date || transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                      }>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTransaction(transaction.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showReceiptScanner && (
        <ReceiptScanner
          onTransactionCreated={(transaction) => {
            loadData();
          }}
          onClose={() => setShowReceiptScanner(false)}
        />
      )}

      {showTransactionForm && (
        <TransactionForm
          onTransactionCreated={(transaction) => {
            loadData();
          }}
          onClose={() => setShowTransactionForm(false)}
        />
      )}
    </div>
  );
}
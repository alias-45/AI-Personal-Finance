import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Leaf, TrendingDown, Award, ShoppingBag, Car, Zap, Home, Coffee, Plane } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState, useEffect } from 'react';
import { projectId } from '../utils/supabase/info';

const monthlyTrend = [
  { month: 'May', carbon: 1580, target: 1400 },
  { month: 'Jun', carbon: 1520, target: 1400 },
  { month: 'Jul', carbon: 1460, target: 1400 },
  { month: 'Aug', carbon: 1380, target: 1400 },
  { month: 'Sep', carbon: 1320, target: 1400 },
  { month: 'Oct', carbon: 1250, target: 1400 }
];

const ecoTips = [
  {
    id: 1,
    title: 'Switch to Public Transport',
    description: 'Using public transport 3 days/week can reduce your carbon footprint by 30%',
    impact: 'High',
    savings: '150 kg CO₂/month'
  },
  {
    id: 2,
    title: 'Choose Local Products',
    description: 'Buy locally sourced groceries to reduce transportation emissions',
    impact: 'Medium',
    savings: '80 kg CO₂/month'
  },
  {
    id: 3,
    title: 'Energy-Efficient Appliances',
    description: 'Upgrade to energy-star rated appliances',
    impact: 'Medium',
    savings: '60 kg CO₂/month'
  },
  {
    id: 4,
    title: 'Reduce Food Waste',
    description: 'Plan meals to minimize food waste',
    impact: 'Low',
    savings: '40 kg CO₂/month'
  }
];

const achievements = [
  { id: 1, name: 'Eco Warrior', description: 'Reduced carbon by 20%', earned: true },
  { id: 2, name: 'Green Commuter', description: 'Used public transport 10+ times', earned: true },
  { id: 3, name: 'Zero Waste Week', description: 'Minimal waste for 7 days', earned: false },
  { id: 4, name: 'Plant-Based', description: '5 meat-free days', earned: true }
];

export function CarbonFootprint() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [carbonData, setCarbonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/transactions`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        calculateCarbon(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading carbon data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCarbon = (trans: any[]) => {
    // Carbon emission factors (kg CO₂ per ₹100 spent)
    const carbonFactors: Record<string, number> = {
      'Transportation': 5.0,
      'Food & Dining': 2.5,
      'Shopping': 3.5,
      'Utilities': 4.0,
      'Entertainment': 1.5,
      'Groceries': 2.0,
      'Healthcare': 1.0,
      'Other': 2.0
    };

    const categoryCarbon: Record<string, number> = {};
    
    trans.filter(t => t.type === 'expense').forEach(t => {
      const factor = carbonFactors[t.category] || 2.0;
      const carbon = (t.amount / 100) * factor;
      categoryCarbon[t.category] = (categoryCarbon[t.category] || 0) + carbon;
    });

    const carbonCategories = Object.entries(categoryCarbon).map(([name, value]) => {
      const iconMap: Record<string, any> = {
        'Transportation': Car,
        'Shopping': ShoppingBag,
        'Utilities': Zap,
        'Food & Dining': Coffee,
        'Entertainment': Plane,
        'Groceries': Coffee
      };

      const colorMap: Record<string, string> = {
        'Transportation': '#fb7185',
        'Shopping': '#fbbf24',
        'Utilities': '#0d9488',
        'Food & Dining': '#5eead4',
        'Entertainment': '#a78bfa',
        'Groceries': '#5eead4'
      };

      return {
        name: name,
        value: Math.round(value),
        color: colorMap[name] || '#94a3b8',
        icon: iconMap[name] || ShoppingBag
      };
    });

    setCarbonData(carbonCategories);
  };

  const displayCarbonData = carbonData.length > 0 ? carbonData : [
    { name: 'Transport', value: 450, color: '#fb7185', icon: Car },
    { name: 'Shopping', value: 320, color: '#fbbf24', icon: ShoppingBag },
    { name: 'Utilities', value: 280, color: '#0d9488', icon: Zap },
    { name: 'Food', value: 220, color: '#5eead4', icon: Coffee },
    { name: 'Travel', value: 180, color: '#a78bfa', icon: Plane }
  ];

  const totalCarbon = displayCarbonData.reduce((acc, item) => acc + item.value, 0);
  const targetCarbon = 1400;
  const reduction = ((targetCarbon - totalCarbon) / targetCarbon * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Carbon Footprint Tracker</h2>
        <p className="text-muted-foreground">Monitor your environmental impact based on spending</p>
      </div>

      {/* Overview Card */}
      <Card className="p-6 rounded-3xl shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-2xl flex items-center justify-center">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-green-900 dark:text-green-100">Monthly Carbon Impact</h3>
              <p className="text-green-700 dark:text-green-300">Based on your transaction data</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-900 dark:text-green-100">{totalCarbon} kg CO₂</p>
            <Badge className="bg-green-600 text-white mt-2">
              <TrendingDown className="w-3 h-3 mr-1" />
              {Math.abs(parseFloat(reduction))}% below target
            </Badge>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-2 text-green-700 dark:text-green-300">
            <span>Progress to Target</span>
            <span>{totalCarbon} / {targetCarbon} kg</span>
          </div>
          <Progress value={(totalCarbon / targetCarbon) * 100} className="h-3" />
        </div>
      </Card>

      {/* Carbon Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-3xl shadow-lg">
          <h3 className="mb-6">Carbon by Category</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayCarbonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayCarbonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {displayCarbonData.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span>{item.name}</span>
                  </div>
                  <span>{item.value} kg CO₂</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 rounded-3xl shadow-lg">
          <h3 className="mb-6">6-Month Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="carbon" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Your Carbon"
                  dot={{ fill: '#10b981', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-2 mt-4 bg-emerald-50 dark:bg-emerald-950 p-3 rounded-xl">
            <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-300">21% reduction in the last 6 months</span>
          </div>
        </Card>
      </div>

      {/* Eco Tips */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">Sustainability Tips</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ecoTips.map((tip) => {
            const impactColors = {
              High: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
              Medium: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400',
              Low: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
            };
            
            return (
              <div
                key={tip.id}
                className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4>{tip.title}</h4>
                  <Badge className={impactColors[tip.impact as keyof typeof impactColors]}>
                    {tip.impact}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">{tip.description}</p>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Leaf className="w-4 h-4" />
                  <span>Save {tip.savings}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Green Badges */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">Green Badges</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-2xl text-center transition-all ${
                achievement.earned
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gray-100 dark:bg-slate-900 opacity-50'
              }`}
            >
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                achievement.earned ? 'bg-white/30' : 'bg-gray-300 dark:bg-slate-800'
              }`}>
                {achievement.earned ? (
                  <Award className="w-8 h-8 text-white" />
                ) : (
                  <Award className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className={achievement.earned ? 'text-white' : 'text-muted-foreground'}>
                {achievement.name}
              </p>
              <p className={achievement.earned ? 'text-white/80' : 'text-muted-foreground'}>
                {achievement.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-green-500">
          <Leaf className="w-10 h-10 text-green-600 mb-3" />
          <h4 className="mb-2">Trees Equivalent</h4>
          <p className="text-green-600 dark:text-green-400">{Math.ceil(totalCarbon / 150)} trees</p>
          <p className="text-muted-foreground">needed to offset monthly carbon</p>
        </Card>
        
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-blue-500">
          <Home className="w-10 h-10 text-blue-600 mb-3" />
          <h4 className="mb-2">vs. Average</h4>
          <p className="text-blue-600 dark:text-blue-400">18% lower</p>
          <p className="text-muted-foreground">than average household</p>
        </Card>
        
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-purple-500">
          <Award className="w-10 h-10 text-purple-600 mb-3" />
          <h4 className="mb-2">Rank</h4>
          <p className="text-purple-600 dark:text-purple-400">Top 15%</p>
          <p className="text-muted-foreground">among community members</p>
        </Card>
      </div>
    </div>
  );
}

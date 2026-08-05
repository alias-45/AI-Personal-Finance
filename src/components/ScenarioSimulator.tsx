import { SetStateAction, useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, RefreshCw, DollarSign, ShoppingCart, PiggyBank } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export function ScenarioSimulator() {
  const [income, setIncome] = useState(50000);
  const [monthlyExpense, setMonthlyExpense] = useState(35000);
  const [savingsRate, setSavingsRate] = useState(15);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [oneTimeExpense, setOneTimeExpense] = useState(0);

  const baseIncome = 50000;
  const baseExpense = 35000;
  
  const generatePrediction = () => {
    const data = [];
    let balance = 100000; // Starting balance
    
    for (let i = 0; i < 6; i++) {
      const monthlyIncome = income;
      const monthlyExpenses = monthlyExpense;
      const monthlySavings = (monthlyIncome - monthlyExpenses) * (savingsRate / 100);
      const investmentGains = balance * (investmentReturn / 100 / 12);
      
      balance += monthlyIncome - monthlyExpenses + investmentGains;
      
      data.push({
        month: i + 1,
        balance: Math.round(balance),
        optimistic: Math.round(balance * 1.15),
        pessimistic: Math.round(balance * 0.85)
      });
    }
    
    return data;
  };

  const predictionData = generatePrediction();
  const finalBalance = predictionData[predictionData.length - 1].balance;
  const currentBalance = 100000;
  const changeAmount = finalBalance - currentBalance;
  const changePercent = ((changeAmount / currentBalance) * 100).toFixed(1);

  const scenarios = [
    {
      title: 'Job Loss',
      description: 'What if you lose your primary income?',
      action: () => {
        setIncome(0);
        setMonthlyExpense(25000); // Reduce to essentials
      },
      icon: TrendingDown,
      color: 'red'
    },
    {
      title: 'Raise',
      description: '20% salary increase',
      action: () => {
        setIncome(baseIncome * 1.2);
      },
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Big Purchase',
      description: 'One-time ₹20,000 expense',
      action: () => {
        setMonthlyExpense(baseExpense + 5000);
        setOneTimeExpense(20000);
      },
      icon: ShoppingCart,
      color: 'orange'
    },
    {
      title: 'Aggressive Savings',
      description: 'Increase savings to 30%',
      action: () => {
        setSavingsRate(30);
        setMonthlyExpense(baseExpense * 0.8);
      },
      icon: PiggyBank,
      color: 'blue'
    }
  ];

  const resetScenario = () => {
    setIncome(baseIncome);
    setMonthlyExpense(baseExpense);
    setSavingsRate(15);
    setInvestmentReturn(7);
    setOneTimeExpense(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Predictive Scenario Simulator</h2>
          <p className="text-muted-foreground">Explore "what-if" financial scenarios</p>
        </div>
        <Button onClick={resetScenario} variant="outline" className="rounded-xl">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Quick Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((scenario, index) => {
          const Icon = scenario.icon;
          const colorMap = {
            red: 'from-red-500 to-pink-500',
            green: 'from-green-500 to-emerald-500',
            orange: 'from-orange-500 to-yellow-500',
            blue: 'from-blue-500 to-cyan-500'
          };
          
          return (
            <Card
              key={index}
              className="p-4 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={scenario.action}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[scenario.color as keyof typeof colorMap]} flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="mb-1">{scenario.title}</h4>
              <p className="text-muted-foreground">{scenario.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Sliders */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <h3 className="mb-6">Adjust Parameters</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between mb-2">
              <Label>Monthly Income</Label>
              <span className="text-teal-600 dark:text-teal-400">₹{income.toLocaleString('en-IN')}</span>
            </div>
            <Slider
              value={[income]}
              onValueChange={(value: SetStateAction<number>[]) => setIncome(value[0])}
              min={0}
              max={100000}
              step={1000}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <Label>Monthly Expenses</Label>
              <span className="text-red-600 dark:text-red-400">₹{monthlyExpense.toLocaleString('en-IN')}</span>
            </div>
            <Slider
              value={[monthlyExpense]}
              onValueChange={(value: SetStateAction<number>[]) => setMonthlyExpense(value[0])}
              min={10000}
              max={80000}
              step={1000}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <Label>Savings Rate</Label>
              <span className="text-blue-600 dark:text-blue-400">{savingsRate}%</span>
            </div>
            <Slider
              value={[savingsRate]}
              onValueChange={(value: SetStateAction<number>[]) => setSavingsRate(value[0])}
              min={0}
              max={50}
              step={1}
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <Label>Investment Return</Label>
              <span className="text-green-600 dark:text-green-400">{investmentReturn}%</span>
            </div>
            <Slider
              value={[investmentReturn]}
              onValueChange={(value: SetStateAction<number>[]) => setInvestmentReturn(value[0])}
              min={0}
              max={20}
              step={0.5}
            />
          </div>
        </div>
      </Card>

      {/* Prediction Chart */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3>6-Month Projection</h3>
          <div className="flex gap-3">
            <Badge className={changeAmount >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
              {changeAmount >= 0 ? '+' : ''}{changePercent}%
            </Badge>
            <Badge variant="outline">
              <DollarSign className="w-3 h-3 mr-1" />
              {changeAmount >= 0 ? '+' : ''}{changeAmount.toLocaleString()}
            </Badge>
          </div>
        </div>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={predictionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" label={{ value: 'Months', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="optimistic" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.1}
                name="Optimistic"
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#0d9488" 
                fill="#0d9488" 
                fillOpacity={0.3}
                strokeWidth={3}
                name="Expected"
              />
              <Area 
                type="monotone" 
                dataKey="pessimistic" 
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.1}
                name="Pessimistic"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex gap-6 justify-center mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Optimistic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-600 rounded"></div>
            <span>Expected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Pessimistic</span>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-teal-500">
          <h4 className="mb-2">Monthly Net</h4>
          <p className={income - monthlyExpense >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            ₹{(income - monthlyExpense).toLocaleString('en-IN')}
          </p>
          <p className="text-muted-foreground">per month</p>
        </Card>
        
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-blue-500">
          <h4 className="mb-2">6-Month Savings</h4>
          <p className="text-blue-600 dark:text-blue-400">
            ₹{((income - monthlyExpense) * 6).toLocaleString('en-IN')}
          </p>
          <p className="text-muted-foreground">at current rate</p>
        </Card>
        
        <Card className="p-6 rounded-3xl shadow-lg border-l-4 border-purple-500">
          <h4 className="mb-2">Final Balance</h4>
          <p className="text-purple-600 dark:text-purple-400">
            ₹{finalBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-muted-foreground">projected</p>
        </Card>
      </div>
    </div>
  );
}
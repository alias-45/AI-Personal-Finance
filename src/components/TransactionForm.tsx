import { useState } from "react";
import { motion } from "motion/react";
import { X, DollarSign, Calendar, Tag, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TransactionFormProps {
  onTransactionCreated: (transaction: any) => void;
  onClose: () => void;
  initialData?: any;
}

export function TransactionForm({ onTransactionCreated, onClose, initialData }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'expense',
    amount: initialData?.amount?.toString() || '',
    merchant: initialData?.merchant || '',
    category: initialData?.category || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Utilities',
    'Healthcare',
    'Entertainment',
    'Groceries',
    'Income',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || !formData.merchant || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to create transactions');
        return;
      }

      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/transactions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transaction),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const result = await response.json();
      onTransactionCreated(result.transaction);
      onClose();
    } catch (err: any) {
      console.error('Transaction creation error:', err);
      setError(err.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-teal-600" />
              Add Transaction
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === 'expense'
                      ? 'border-red-500 bg-red-50 dark:bg-red-950'
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <TrendingDown className={`w-8 h-8 mx-auto mb-2 ${
                    formData.type === 'expense' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <div className="text-center">Expense</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === 'income'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950'
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${
                    formData.type === 'income' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="text-center">Income</div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant / Source *</Label>
              <Input
                id="merchant"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                placeholder="Store name, employer, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                <Tag className="w-4 h-4 inline mr-1" />
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Transaction'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

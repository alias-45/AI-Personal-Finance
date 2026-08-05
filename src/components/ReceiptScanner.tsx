import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Camera, Upload, X, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ReceiptScannerProps {
  onTransactionCreated: (transaction: any) => void;
  onClose: () => void;
}

export function ReceiptScanner({ onTransactionCreated, onClose }: ReceiptScannerProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'complete'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [ocrData, setOcrData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    type: 'expense',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('processing');
    uploadAndProcessReceipt(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please use file upload instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
            processFile(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const uploadAndProcessReceipt = async (file: File) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to upload receipts');
        setStep('upload');
        return;
      }

      const formData = new FormData();
      formData.append('receipt', file);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fe8ebde8/receipts/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process receipt');
      }

      const result = await response.json();
      setOcrData(result.ocrData);
      
      // Pre-fill form with OCR data including auto-detected category
      setFormData(prev => ({
        ...prev,
        merchant: result.ocrData.merchant || prev.merchant,
        amount: result.ocrData.amount?.toString() || prev.amount,
        category: result.ocrData.category || prev.category,
        description: result.ocrData.merchant || prev.description,
      }));

      setStep('review');
    } catch (err: any) {
      console.error('Receipt upload error:', err);
      setError(err.message || 'Failed to process receipt');
      setStep('upload');
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to create transactions');
        return;
      }

      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        receiptUrl: previewUrl,
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
      setStep('complete');
      
      setTimeout(() => {
        onTransactionCreated(result.transaction);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Transaction creation error:', err);
      setError(err.message || 'Failed to create transaction');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-teal-600" />
              Scan Receipt
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {step === 'upload' && !isCameraActive && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2">Upload Receipt</h3>
                <p className="text-muted-foreground mb-4">
                  Take a photo or upload an image of your receipt
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={startCamera} className="gap-2">
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload File
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {isCameraActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="flex gap-3 justify-center">
                <Button onClick={capturePhoto} className="gap-2">
                  <Camera className="w-5 h-5" />
                  Capture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-teal-600 animate-spin" />
              <h3 className="mb-2">Processing Receipt</h3>
              <p className="text-muted-foreground">
                Extracting transaction details...
              </p>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-6">
              {previewUrl && (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                  <img src={previewUrl} alt="Receipt" className="w-full h-48 object-cover" />
                </div>
              )}

              {ocrData && (
                <div className="p-4 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-teal-600" />
                    <h4 className="text-teal-900 dark:text-teal-100">Auto-Detected Details</h4>
                  </div>
                  <p className="text-teal-700 dark:text-teal-300">
                    We've automatically filled in the merchant, amount, and category. Please review and edit if needed.
                  </p>
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Input
                    id="merchant"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    placeholder="Store name"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
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
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add notes"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSubmit} className="flex-1">
                  Create Transaction
                </Button>
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="mb-2">Transaction Created!</h3>
              <p className="text-muted-foreground">
                Your receipt has been processed successfully
              </p>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
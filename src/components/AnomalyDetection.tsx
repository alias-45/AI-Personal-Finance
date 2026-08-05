import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, Shield, CheckCircle, XCircle, MapPin, CreditCard, Clock, MessageSquare, Smartphone, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface SMSAlert {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  amount?: number;
  merchant?: string;
  riskLevel: 'high' | 'medium' | 'low';
  type: 'transaction' | 'otp' | 'alert';
  verified: boolean;
}

const anomalies = [
  {
    id: 1,
    type: 'suspicious',
    severity: 'high',
    title: 'Unusual Transaction Pattern',
    description: 'Transaction from an unusual location: London, UK',
    amount: 12500.00,
    merchant: 'Unknown Merchant',
    time: '2 hours ago',
    location: 'London, UK',
    status: 'pending',
    source: 'SMS Alert'
  },
  {
    id: 2,
    type: 'suspicious',
    severity: 'medium',
    title: 'Multiple Small Transactions',
    description: '5 transactions under ₹10 in 30 minutes',
    amount: 425.00,
    merchant: 'Various',
    time: '5 hours ago',
    location: 'Mumbai, India',
    status: 'pending',
    source: 'SMS Pattern'
  },
  {
    id: 3,
    type: 'verified',
    severity: 'low',
    title: 'Large Purchase Verified',
    description: 'Laptop purchase confirmed as legitimate',
    amount: 89900.00,
    merchant: 'Apple Store',
    time: '1 day ago',
    location: 'Bangalore, India',
    status: 'verified',
    source: 'SMS Confirmed'
  }
];

const heatmapData = [
  { day: 'Mon', hour0: 0, hour6: 2, hour12: 5, hour18: 8, hour24: 3 },
  { day: 'Tue', hour0: 1, hour6: 3, hour12: 7, hour18: 12, hour24: 4 },
  { day: 'Wed', hour0: 0, hour6: 2, hour12: 6, hour18: 9, hour24: 2 },
  { day: 'Thu', hour0: 1, hour6: 4, hour12: 8, hour18: 11, hour24: 5 },
  { day: 'Fri', hour0: 2, hour6: 3, hour12: 6, hour18: 15, hour24: 8 },
  { day: 'Sat', hour0: 1, hour6: 1, hour12: 4, hour18: 10, hour24: 6 },
  { day: 'Sun', hour0: 0, hour6: 1, hour12: 3, hour18: 7, hour24: 4 }
];

const securityScore = 85;

export function AnomalyDetection() {
  const [smsAlerts, setSmsAlerts] = useState<SMSAlert[]>([
    {
      id: 'sms1',
      sender: 'HDFC',
      message: 'Your A/C XX1234 debited with Rs 12,500.00 on 10-Nov-25 at Unknown Merchant. Avl Bal: Rs 45,230.50',
      timestamp: '2 hours ago',
      amount: 12500,
      merchant: 'Unknown Merchant',
      riskLevel: 'high',
      type: 'transaction',
      verified: false
    },
    {
      id: 'sms2',
      sender: 'ICICI',
      message: 'Rs 425.00 debited from card XX5678 at Swiggy on 10-Nov-25 18:45. Not you? Call immediately.',
      timestamp: '5 hours ago',
      amount: 425,
      merchant: 'Swiggy',
      riskLevel: 'low',
      type: 'transaction',
      verified: false
    },
    {
      id: 'sms3',
      sender: 'SBI',
      message: 'Alert: OTP 834521 for transaction of Rs 89,900 at Apple Store. Valid for 10 mins.',
      timestamp: '1 day ago',
      amount: 89900,
      merchant: 'Apple Store',
      riskLevel: 'medium',
      type: 'otp',
      verified: true
    },
    {
      id: 'sms4',
      sender: 'AXIS',
      message: 'Your card XX9012 used for Rs 2,340.00 at Amazon. If not you, report now.',
      timestamp: '3 days ago',
      amount: 2340,
      merchant: 'Amazon',
      riskLevel: 'low',
      type: 'transaction',
      verified: false
    }
  ]);

  const [smsPermission, setSmsPermission] = useState<boolean>(false);

  const requestSMSPermission = () => {
    // In a real app, this would request SMS permissions via native APIs or backend
    setSmsPermission(true);
    alert('SMS monitoring enabled! The app will now analyze your transaction SMS for fraud detection.');
  };

  const analyzeSMS = (sms: SMSAlert) => {
    // Simple fraud detection logic based on SMS content
    const suspiciousKeywords = ['unknown', 'foreign', 'overseas', 'suspicious'];
    const message = sms.message.toLowerCase();
    
    if (sms.amount && sms.amount > 10000) {
      return 'high';
    }
    
    if (suspiciousKeywords.some(keyword => message.includes(keyword))) {
      return 'high';
    }
    
    if (sms.type === 'otp') {
      return 'medium';
    }
    
    return 'low';
  };

  const verifySMSAlert = (id: string) => {
    setSmsAlerts(prev => prev.map(sms => 
      sms.id === id ? { ...sms, verified: true } : sms
    ));
  };

  const declineSMSAlert = (id: string) => {
    setSmsAlerts(prev => prev.filter(sms => sms.id !== id));
    alert('Alert declined. Transaction marked as fraudulent.');
  };

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-gray-100 dark:bg-slate-900';
    if (value <= 3) return 'bg-green-200 dark:bg-green-900';
    if (value <= 7) return 'bg-yellow-200 dark:bg-yellow-900';
    if (value <= 12) return 'bg-orange-300 dark:bg-orange-800';
    return 'bg-red-400 dark:bg-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Real-Time Fraud Detection</h2>
        <p className="text-muted-foreground">AI-powered transaction monitoring via SMS</p>
      </div>

      {/* Security Score */}
      <Card className="p-6 rounded-3xl shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-600 dark:bg-green-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-green-900 dark:text-green-100">Security Score</h3>
              <p className="text-green-700 dark:text-green-300">Your account protection level</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-900 dark:text-green-100">{securityScore}/100</p>
            <Badge className="bg-green-600 text-white mt-2">Excellent</Badge>
          </div>
        </div>
        <div className="mt-6">
          <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-4">
            <div 
              className="bg-green-600 dark:bg-green-500 h-4 rounded-full transition-all"
              style={{ width: `${securityScore}%` }}
            />
          </div>
        </div>
      </Card>

      {/* SMS Monitoring Card */}
      <Card className="p-6 rounded-3xl shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-2xl flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-blue-900 dark:text-blue-100">SMS Monitoring</h3>
              <p className="text-blue-700 dark:text-blue-300">
                {smsPermission ? 'Actively monitoring your transaction SMS' : 'Enable to detect fraud in real-time'}
              </p>
            </div>
          </div>
          {!smsPermission && (
            <Button 
              onClick={requestSMSPermission}
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable SMS Access
            </Button>
          )}
          {smsPermission && (
            <Badge className="bg-blue-600 text-white">
              <MessageSquare className="w-3 h-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </Card>

      {/* SMS Alerts */}
      {smsPermission && (
        <Card className="p-6 rounded-3xl shadow-lg">
          <h3 className="mb-6">Recent SMS Transaction Alerts</h3>
          <div className="space-y-4">
            {smsAlerts.map((sms) => (
              <motion.div
                key={sms.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border-l-4 ${
                  sms.riskLevel === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-950/20' :
                  sms.riskLevel === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                  'border-green-500 bg-green-50 dark:bg-green-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className={`w-5 h-5 ${
                        sms.riskLevel === 'high' ? 'text-red-600' :
                        sms.riskLevel === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`} />
                      <span className="font-medium">{sms.sender}</span>
                      <Badge variant="outline" className={
                        sms.riskLevel === 'high' ? 'border-red-500 text-red-700 dark:text-red-400' :
                        sms.riskLevel === 'medium' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' :
                        'border-green-500 text-green-700 dark:text-green-400'
                      }>
                        {sms.riskLevel} risk
                      </Badge>
                      {sms.verified && (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">{sms.message}</p>
                    <div className="flex items-center gap-4 flex-wrap">
                      {sms.amount && (
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span>₹{sms.amount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {sms.merchant && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">{sms.merchant}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{sms.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!sms.verified && sms.type === 'transaction' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="rounded-xl"
                        onClick={() => declineSMSAlert(sms.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Not Me
                      </Button>
                      <Button 
                        size="sm" 
                        className="rounded-xl bg-green-600 hover:bg-green-700"
                        onClick={() => verifySMSAlert(sms.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        It's Me
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
  
}

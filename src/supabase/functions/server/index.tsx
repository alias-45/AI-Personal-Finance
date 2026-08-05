import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createClient } from '@supabase/supabase-js';
import * as kv from './kv_store.tsx';

// @ts-ignore: Deno global is available in Deno runtime
declare const Deno: any;

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create storage bucket on startup
const bucketName = 'make-fe8ebde8-receipts';
const { data: buckets } = await supabase.storage.listBuckets();
const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
if (!bucketExists) {
  await supabase.storage.createBucket(bucketName, { public: false });
  console.log(`Created bucket: ${bucketName}`);
}

// Helper function to verify user authentication
async function getUserFromToken(authHeader: string | null | undefined) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ============= Authentication Routes =============

app.post('/make-server-fe8ebde8/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error for ${email}: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Initialize user profile
    await kv.set(`user:${data.user.id}:profile`, {
      email,
      name,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Signup exception: ${error}`);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ============= Transaction Routes =============

app.post('/make-server-fe8ebde8/transactions', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization') ?? null);
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const transaction = await c.req.json();
    const transactionId = crypto.randomUUID();
    
    // Categorize transaction using simple keyword matching (can be enhanced with ML)
    const category = categorizeTransaction(transaction.description || transaction.merchant);
    
    const fullTransaction = {
      id: transactionId,
      userId: user.id,
      ...transaction,
      category: transaction.category || category,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`transaction:${transactionId}`, fullTransaction);
    
    // Add to user's transaction list
    const userTransactions = await kv.get(`user:${user.id}:transactions`) || [];
    userTransactions.unshift(transactionId);
    await kv.set(`user:${user.id}:transactions`, userTransactions);

    // Check budget and send alert if needed
    await checkBudgetAlert(user.id, fullTransaction);

    return c.json({ success: true, transaction: fullTransaction });
  } catch (error) {
    console.log(`Error creating transaction: ${error}`);
    return c.json({ error: 'Failed to create transaction' }, 500);
  }
});

app.get('/make-server-fe8ebde8/transactions', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization') ?? null);
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const transactionIds = await kv.get(`user:${user.id}:transactions`) || [];
    const transactions = [];
    
    for (const id of transactionIds.slice(0, 100)) { // Limit to 100 recent transactions
      const transaction = await kv.get(`transaction:${id}`);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return c.json({ transactions });
  } catch (error) {
    console.log(`Error fetching transactions: ${error}`);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

app.put('/make-server-fe8ebde8/transactions/:id', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const transactionId = c.req.param('id');
    const updates = await c.req.json();
    
    const transaction = await kv.get(`transaction:${transactionId}`);
    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }
    
    if (transaction.userId !== user.id) {
      return c.json({ error: 'Forbidden: Not your transaction' }, 403);
    }

    const updatedTransaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`transaction:${transactionId}`, updatedTransaction);

    return c.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    console.log(`Error updating transaction: ${error}`);
    return c.json({ error: 'Failed to update transaction' }, 500);
  }
});

app.delete('/make-server-fe8ebde8/transactions/:id', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const transactionId = c.req.param('id');
    const transaction = await kv.get(`transaction:${transactionId}`);
    
    if (!transaction) {
      return c.json({ error: 'Transaction not found' }, 404);
    }
    
    if (transaction.userId !== user.id) {
      return c.json({ error: 'Forbidden: Not your transaction' }, 403);
    }

    await kv.del(`transaction:${transactionId}`);
    
    // Remove from user's transaction list
    const userTransactions = await kv.get(`user:${user.id}:transactions`) || [];
    const filtered = userTransactions.filter((id: string) => id !== transactionId);
    await kv.set(`user:${user.id}:transactions`, filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting transaction: ${error}`);
    return c.json({ error: 'Failed to delete transaction' }, 500);
  }
});

// ============= Receipt Upload & OCR Route =============

app.post('/make-server-fe8ebde8/receipts/upload', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('receipt') as File;
    
    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      console.log(`Receipt upload error: ${uploadError.message}`);
      return c.json({ error: 'Failed to upload receipt' }, 500);
    }

    // Generate signed URL
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

    // Perform OCR using Google Vision API
    const ocrData = await performOCR(arrayBuffer);

    const receiptId = crypto.randomUUID();
    const receipt = {
      id: receiptId,
      userId: user.id,
      fileName,
      url: urlData?.signedUrl,
      ocrData,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`receipt:${receiptId}`, receipt);

    return c.json({ success: true, receipt, ocrData });
  } catch (error) {
    console.log(`Receipt upload exception: ${error}`);
    return c.json({ error: 'Failed to process receipt' }, 500);
  }
});

// ============= Budget Routes =============

app.post('/make-server-fe8ebde8/budgets', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const budget = await c.req.json();
    const budgetId = crypto.randomUUID();
    
    const fullBudget = {
      id: budgetId,
      userId: user.id,
      ...budget,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`budget:${budgetId}`, fullBudget);
    
    // Add to user's budget list
    const userBudgets = await kv.get(`user:${user.id}:budgets`) || [];
    userBudgets.push(budgetId);
    await kv.set(`user:${user.id}:budgets`, userBudgets);

    return c.json({ success: true, budget: fullBudget });
  } catch (error) {
    console.log(`Error creating budget: ${error}`);
    return c.json({ error: 'Failed to create budget' }, 500);
  }
});

app.get('/make-server-fe8ebde8/budgets', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const budgetIds = await kv.get(`user:${user.id}:budgets`) || [];
    const budgets = [];
    
    for (const id of budgetIds) {
      const budget = await kv.get(`budget:${id}`);
      if (budget) {
        budgets.push(budget);
      }
    }

    return c.json({ budgets });
  } catch (error) {
    console.log(`Error fetching budgets: ${error}`);
    return c.json({ error: 'Failed to fetch budgets' }, 500);
  }
});

// ============= Analytics Route =============

app.get('/make-server-fe8ebde8/analytics', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const transactionIds = await kv.get(`user:${user.id}:transactions`) || [];
    const transactions = [];
    
    for (const id of transactionIds) {
      const transaction = await kv.get(`transaction:${id}`);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    // Calculate analytics
    const analytics = calculateAnalytics(transactions);

    return c.json({ analytics });
  } catch (error) {
    console.log(`Error generating analytics: ${error}`);
    return c.json({ error: 'Failed to generate analytics' }, 500);
  }
});

// ============= Helper Functions =============

function categorizeTransaction(description: string): string {
  const desc = description?.toLowerCase() || '';
  
  // Simple keyword-based categorization (can be enhanced with ML)
  const categories = {
    'Food & Dining': ['restaurant', 'cafe', 'food', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'starbucks', 'mcdonald'],
    'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'train', 'bus'],
    'Shopping': ['amazon', 'walmart', 'target', 'store', 'mall', 'shop'],
    'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
    'Healthcare': ['pharmacy', 'doctor', 'hospital', 'medical', 'health', 'clinic'],
    'Entertainment': ['movie', 'theater', 'netflix', 'spotify', 'game', 'concert'],
    'Groceries': ['grocery', 'supermarket', 'whole foods', 'trader joe'],
    'Income': ['salary', 'paycheck', 'income', 'payment received'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => desc.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}

async function performOCR(imageBuffer: ArrayBuffer): Promise<any> {
  try {
    // Check if Google Vision API key is available
    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    
    if (!apiKey) {
      console.log('Google Vision API key not found, returning mock OCR data');
      // Return mock data if API key is not configured
      return {
        text: 'Mock receipt data - Configure GOOGLE_VISION_API_KEY to enable real OCR',
        merchant: 'Sample Store',
        amount: 0,
        date: new Date().toISOString(),
        items: [],
      };
    }

    // Convert ArrayBuffer to base64
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );

    // Call Google Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64Image },
            features: [{ type: 'TEXT_DETECTION' }]
          }]
        })
      }
    );

    const result = await response.json();
    const text = result.responses?.[0]?.fullTextAnnotation?.text || '';

    // Parse receipt data from OCR text
    const parsedData = parseReceiptText(text);

    return parsedData;
  } catch (error) {
    console.log(`OCR processing error: ${error}`);
    return {
      text: '',
      merchant: 'Unknown',
      amount: 0,
      date: new Date().toISOString(),
      items: [],
      error: 'OCR processing failed',
    };
  }
}

function parseReceiptText(text: string): any {
  // Simple parser - can be enhanced with more sophisticated logic
  const lines = text.split('\n');
  
  // Extract amount (look for currency symbols and numbers)
  const amountMatch = text.match(/₹?\s*(\d+\.?\d{0,2})|(\d+,\d+\.?\d{0,2})/);
  const amount = amountMatch ? parseFloat(amountMatch[0].replace(/[₹,]/g, '')) : 0;
  
  // Extract date
  const dateMatch = text.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/);
  const date = dateMatch ? dateMatch[1] : new Date().toISOString();
  
  // First line often contains merchant name
  const merchant = lines[0] || 'Unknown';
  
  // Auto-detect category from merchant name
  const category = categorizeTransaction(merchant + ' ' + text);

  return {
    text,
    merchant,
    amount,
    date,
    category,
    items: lines.slice(1, 10), // Sample items
  };
}

async function checkBudgetAlert(userId: string, transaction: any) {
  try {
    if (transaction.type !== 'expense') return;

    const budgetIds = await kv.get(`user:${userId}:budgets`) || [];
    const transactionIds = await kv.get(`user:${userId}:transactions`) || [];
    
    for (const budgetId of budgetIds) {
      const budget = await kv.get(`budget:${budgetId}`);
      if (!budget) continue;

      // Calculate total spending for this budget's category and period
      let totalSpent = 0;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      for (const txId of transactionIds) {
        const tx = await kv.get(`transaction:${txId}`);
        if (!tx || tx.type !== 'expense') continue;
        
        const txDate = new Date(tx.date || tx.createdAt);
        if (txDate >= startOfMonth && 
            (budget.category === 'all' || tx.category === budget.category)) {
          totalSpent += parseFloat(tx.amount) || 0;
        }
      }

      // Check if budget exceeded
      const budgetLimit = parseFloat(budget.amount) || 0;
      const percentUsed = (totalSpent / budgetLimit) * 100;

      if (percentUsed >= 90) {
        // Store alert
        const alertId = crypto.randomUUID();
        const alert = {
          id: alertId,
          userId,
          type: 'budget_alert',
          message: `You've used ${percentUsed.toFixed(0)}% of your ${budget.category} budget`,
          budgetId,
          totalSpent,
          budgetLimit,
          createdAt: new Date().toISOString(),
        };
        
        await kv.set(`alert:${alertId}`, alert);
        
        // Add to user's alerts
        const userAlerts = await kv.get(`user:${userId}:alerts`) || [];
        userAlerts.unshift(alertId);
        await kv.set(`user:${userId}:alerts`, userAlerts.slice(0, 50)); // Keep last 50 alerts
      }
    }
  } catch (error) {
    console.log(`Error checking budget alert: ${error}`);
  }
}

function calculateAnalytics(transactions: any[]) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  let totalIncome = 0;
  let totalExpenses = 0;
  let monthlyExpenses = 0;
  let weeklyExpenses = 0;
  const categorySpending: Record<string, number> = {};

  for (const tx of transactions) {
    const amount = parseFloat(tx.amount) || 0;
    const txDate = new Date(tx.date || tx.createdAt);

    if (tx.type === 'income') {
      totalIncome += amount;
    } else if (tx.type === 'expense') {
      totalExpenses += amount;
      
      if (txDate >= startOfMonth) {
        monthlyExpenses += amount;
      }
      
      if (txDate >= startOfWeek) {
        weeklyExpenses += amount;
      }

      const category = tx.category || 'Other';
      categorySpending[category] = (categorySpending[category] || 0) + amount;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    monthlyExpenses,
    weeklyExpenses,
    categorySpending,
    transactionCount: transactions.length,
  };
}

// ============= Alerts Route =============

app.get('/make-server-fe8ebde8/alerts', async (c) => {
  try {
    const user = await getUserFromToken(c.req.header('Authorization'));
    if (!user) {
      return c.json({ error: 'Unauthorized: Please log in' }, 401);
    }

    const alertIds = await kv.get(`user:${user.id}:alerts`) || [];
    const alerts = [];
    
    for (const id of alertIds.slice(0, 20)) {
      const alert = await kv.get(`alert:${id}`);
      if (alert) {
        alerts.push(alert);
      }
    }

    return c.json({ alerts });
  } catch (error) {
    console.log(`Error fetching alerts: ${error}`);
    return c.json({ error: 'Failed to fetch alerts' }, 500);
  }
});

// Health check
app.get('/make-server-fe8ebde8/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
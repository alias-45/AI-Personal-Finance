import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Settings as SettingsIcon, Shield, Link, Cloud, Bell, Moon, Sun, Lock, User, CreditCard } from 'lucide-react';

const linkedAccounts = [
  { id: 1, name: 'CIBIL Score', icon: '🏦', connected: true, status: 'Synced 2h ago' },
  { id: 2, name: 'Zerodha', icon: '📈', connected: true, status: 'Active' },
  { id: 3, name: 'Groww', icon: '🌱', connected: true, status: 'Active' },
  { id: 4, name: 'Coinbase', icon: '₿', connected: false, status: 'Not connected' },
  { id: 5, name: 'PayPal', icon: '💳', connected: false, status: 'Not connected' }
];

interface SettingsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Settings({ darkMode, onToggleDarkMode }: SettingsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>Settings & Integrations</h2>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-xl flex items-center justify-center">
            {darkMode ? <Moon className="w-5 h-5 text-white" /> : <Sun className="w-5 h-5 text-white" />}
          </div>
          <h3>Appearance</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-muted-foreground">Enable dark theme</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-600 dark:bg-green-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h3>Privacy & Security</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div className="flex-1">
              <Label>Federated Learning</Label>
              <p className="text-muted-foreground">Train AI on your device without sending data</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div className="flex-1">
              <Label>Privacy Mode</Label>
              <p className="text-muted-foreground">Enhanced data protection</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div className="flex-1">
              <Label>Biometric Authentication</Label>
              <p className="text-muted-foreground">Use fingerprint or face unlock</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div className="flex-1">
              <Label>Two-Factor Authentication</Label>
              <p className="text-muted-foreground">Extra security for your account</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl">
              Enable
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-600 dark:bg-orange-500 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h3>Notifications</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div>
              <Label>Budget Alerts</Label>
              <p className="text-muted-foreground">Get notified when approaching limits</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div>
              <Label>AI Insights</Label>
              <p className="text-muted-foreground">Daily financial tips and recommendations</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div>
              <Label>Anomaly Detection</Label>
              <p className="text-muted-foreground">Suspicious transaction alerts</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Linked Accounts */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
            <Link className="w-5 h-5 text-white" />
          </div>
          <h3>Linked Accounts</h3>
        </div>
        
        <div className="space-y-3">
          {linkedAccounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{account.icon}</div>
                <div>
                  <p>{account.name}</p>
                  <p className="text-muted-foreground">{account.status}</p>
                </div>
              </div>
              {account.connected ? (
                <Badge className="bg-green-600 text-white">Connected</Badge>
              ) : (
                <Button variant="outline" size="sm" className="rounded-xl">
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Cloud Sync */}
      <Card className="p-6 rounded-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-600 dark:bg-cyan-500 rounded-xl flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <h3>Cloud Sync</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div>
                <Label>Google Drive</Label>
                <p className="text-muted-foreground">Last sync: 10 minutes ago</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-2xl">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0061FF">
                <path d="M7.004 3.5L12 8.496l4.996-4.996a5.25 5.25 0 017.425 7.425L12 23.346.579 10.925a5.25 5.25 0 017.425-7.425z"/>
              </svg>
              <div>
                <Label>Dropbox</Label>
                <p className="text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Switch />
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="p-6 rounded-3xl shadow-lg border-red-200 dark:border-red-900">
        <h3 className="mb-4 text-red-600 dark:text-red-400">Danger Zone</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full rounded-xl justify-start">
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full rounded-xl justify-start">
            <User className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Separator />
          <Button variant="destructive" className="w-full rounded-xl">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}

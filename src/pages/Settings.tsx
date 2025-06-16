import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Search, User, Shield, Target } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface UserSettings {
  // Personal Info
  name: string;
  email: string;
  veteranStatus: 'veteran' | 'active' | 'spouse' | 'civilian';
  
  // Search Preferences
  zipCodes: string[];
  maxPrice: number;
  minScore: number;
  propertyTypes: string[];
  
  // Notification Preferences
  notificationsEnabled: boolean;
  emailAlerts: boolean;
  pushAlerts: boolean;
  alertFrequency: 'instant' | 'daily' | 'weekly';
  
  // Email Template
  emailTemplate: string;
  emailTone: 'professional' | 'friendly' | 'casual';
}

const defaultSettings: UserSettings = {
  name: '',
  email: '',
  veteranStatus: 'veteran',
  zipCodes: [],
  maxPrice: 500000,
  minScore: 40,
  propertyTypes: ['house', 'condo', 'townhouse'],
  notificationsEnabled: true,
  emailAlerts: true,
  pushAlerts: true,
  alertFrequency: 'instant',
  emailTemplate: `Hi there!

I'm a veteran interested in your property listing. I'm looking for a home with flexible financing options, particularly those that work well with VA loans or creative financing.

Could we schedule a time to discuss the property and any available financing options?

Thank you for your time and service to the community.

Best regards,
[Your Name]`,
  emailTone: 'professional'
};

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [newZipCode, setNewZipCode] = useState('');
  const { isSupported, permission, requestPermission, isEnabled } = usePushNotifications();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('leoSettings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('leoSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const addZipCode = () => {
    if (newZipCode && !settings.zipCodes.includes(newZipCode)) {
      setSettings(prev => ({
        ...prev,
        zipCodes: [...prev.zipCodes, newZipCode]
      }));
      setNewZipCode('');
    }
  };

  const removeZipCode = (zipCode: string) => {
    setSettings(prev => ({
      ...prev,
      zipCodes: prev.zipCodes.filter(zc => zc !== zipCode)
    }));
  };

  const handleNotificationToggle = async () => {
    if (!settings.notificationsEnabled) {
      // User is enabling notifications
      if (isSupported && permission !== 'granted') {
        await requestPermission();
      }
    }
    setSettings(prev => ({ ...prev, notificationsEnabled: !prev.notificationsEnabled }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Mission Settings</h1>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Tell LEO about yourself to personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="veteranStatus">Military Status</Label>
            <Select
              value={settings.veteranStatus}
              onValueChange={(value: any) => setSettings(prev => ({ ...prev, veteranStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veteran">Veteran</SelectItem>
                <SelectItem value="active">Active Duty</SelectItem>
                <SelectItem value="spouse">Military Spouse</SelectItem>
                <SelectItem value="civilian">Civilian</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Search Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Preferences
          </CardTitle>
          <CardDescription>
            Configure how LEO searches for your perfect home
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Target Areas (ZIP Codes)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newZipCode}
                onChange={(e) => setNewZipCode(e.target.value)}
                placeholder="Enter ZIP code"
                onKeyPress={(e) => e.key === 'Enter' && addZipCode()}
              />
              <Button onClick={addZipCode}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {settings.zipCodes.map(zipCode => (
                <Badge key={zipCode} variant="secondary" className="cursor-pointer" onClick={() => removeZipCode(zipCode)}>
                  {zipCode} ×
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Maximum Price: ${settings.maxPrice.toLocaleString()}</Label>
            <Slider
              value={[settings.maxPrice]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, maxPrice: value }))}
              max={1000000}
              min={50000}
              step={25000}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Minimum LEO Score: {settings.minScore}</Label>
            <Slider
              value={[settings.minScore]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, minScore: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Stay updated when LEO finds new opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable LEO Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when LEO finds matching properties</p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          {!isSupported && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Push notifications are not supported in your browser.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Email Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive opportunities via email</p>
            </div>
            <Switch
              checked={settings.emailAlerts}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailAlerts: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Instant browser notifications</p>
            </div>
            <Switch
              checked={settings.pushAlerts}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushAlerts: checked }))}
              disabled={!isSupported || permission !== 'granted'}
            />
          </div>

          <div>
            <Label>Alert Frequency</Label>
            <Select
              value={settings.alertFrequency}
              onValueChange={(value: any) => setSettings(prev => ({ ...prev, alertFrequency: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Template
          </CardTitle>
          <CardDescription>
            Customize the template LEO uses for outreach emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email Tone</Label>
            <Select
              value={settings.emailTone}
              onValueChange={(value: any) => setSettings(prev => ({ ...prev, emailTone: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Email Template</Label>
            <Textarea
              value={settings.emailTemplate}
              onChange={(e) => setSettings(prev => ({ ...prev, emailTemplate: e.target.value }))}
              rows={8}
              placeholder="Enter your email template..."
            />
            <p className="text-sm text-muted-foreground mt-2">
              Use [Your Name] as a placeholder for your name in emails
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} size="lg">
          <Target className="w-4 h-4 mr-2" />
          Save Mission Settings
        </Button>
      </div>
    </div>
  );
}
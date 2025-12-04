import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Link2, LogOut, Globe, CheckCircle2, Loader2, XCircle, ExternalLink, Check, RefreshCw, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const addToast = useToastStore((state) => state.addToast);
  const [storeName, setStoreName] = useState('My Pawn Shop');
  const [email, setEmail] = useState('store@example.com');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState<string | null>('myshop.llatria.com');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isWebsiteActive, setIsWebsiteActive] = useState(true);
  
  // Facebook connection state
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [facebookConnecting, setFacebookConnecting] = useState(false);
  const [facebookModalOpen, setFacebookModalOpen] = useState(false);
  const [facebookAccount, setFacebookAccount] = useState<string | null>(null);
  
  // eBay connection state
  const [ebayConnected, setEbayConnected] = useState(false);
  const [ebayConnecting, setEbayConnecting] = useState(false);
  const [ebayModalOpen, setEbayModalOpen] = useState(false);
  const [ebayAccount, setEbayAccount] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [facebookLastSync, setFacebookLastSync] = useState<Date | null>(null);
  const [ebayLastSync, setEbayLastSync] = useState<Date | null>(null);
  const [facebookSyncStatus, setFacebookSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [ebaySyncStatus, setEbaySyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  const handleSubdomainChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(sanitized);
  };

  const handleBuildWebsite = async () => {
    if (!subdomain || subdomain.length < 3) {
      addToast({ type: 'warning', message: 'Please enter a subdomain with at least 3 characters' });
      return;
    }

    setIsBuilding(true);
    
    // Simulate website building process
    setTimeout(() => {
      const newUrl = `${subdomain}.llatria.com`;
      setWebsiteUrl(newUrl);
      setIsWebsiteActive(true);
      setIsBuilding(false);
      addToast({ type: 'success', message: `Website created: ${newUrl}` });
      // In production, this would call an API to create the website
    }, 2000);
  };

  const handleFacebookConnect = () => {
    setFacebookModalOpen(true);
    setFacebookConnecting(true);
    
    // Simulate opening Facebook login window
    // In production, this would open an Electron BrowserWindow to facebook.com/login
    setTimeout(() => {
      // Simulate successful connection after 3 seconds
      setFacebookConnecting(false);
      setFacebookConnected(true);
      setFacebookAccount('user@example.com'); // In production, get from Facebook
      setFacebookLastSync(new Date());
      setFacebookSyncStatus('idle');
      setFacebookModalOpen(false);
      addToast({ type: 'success', message: 'Facebook Marketplace connected successfully!' });
    }, 3000);
  };

  const handleFacebookDisconnect = () => {
    setFacebookConnected(false);
    setFacebookAccount(null);
    setFacebookLastSync(null);
    setFacebookSyncStatus('idle');
    addToast({ type: 'info', message: 'Facebook Marketplace disconnected' });
  };

  const handleFacebookSync = async () => {
    setFacebookSyncStatus('syncing');
    // Simulate sync
    setTimeout(() => {
      setFacebookLastSync(new Date());
      setFacebookSyncStatus('idle');
      addToast({ type: 'success', message: 'Facebook sync completed' });
    }, 2000);
  };

  const handleEbaySync = async () => {
    setEbaySyncStatus('syncing');
    // Simulate sync
    setTimeout(() => {
      setEbayLastSync(new Date());
      setEbaySyncStatus('idle');
      addToast({ type: 'success', message: 'eBay sync completed' });
    }, 2000);
  };

  const handleEbayConnect = () => {
    setEbayModalOpen(true);
    setEbayConnecting(true);
    
    // Simulate opening eBay login/API authorization
    // In production, this would open eBay OAuth flow or API key setup
    setTimeout(() => {
      // Simulate successful connection after 3 seconds
      setEbayConnecting(false);
      setEbayConnected(true);
      setEbayAccount('store@example.com'); // In production, get from eBay
      setEbayLastSync(new Date());
      setEbaySyncStatus('idle');
      setEbayModalOpen(false);
      addToast({ type: 'success', message: 'eBay connected successfully!' });
    }, 3000);
  };

  const handleEbayDisconnect = () => {
    setEbayConnected(false);
    setEbayAccount(null);
    setEbayLastSync(null);
    setEbaySyncStatus('idle');
    addToast({ type: 'info', message: 'eBay disconnected' });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate API call to save account settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would call an API to save the settings
    // For now, we'll just simulate success
    setIsSaving(false);
    setSaveSuccess(true);
    addToast({ type: 'success', message: 'Settings saved successfully!' });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="mb-6 pt-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'inventory' }));
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your account and platform connections</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input 
                label="Store Name" 
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <Input 
                label="Email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input 
                label="Phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <Button 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                {saveSuccess && (
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Changes saved successfully
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website Setup
              </CardTitle>
              <CardDescription>
                Create your custom store website. Your products will automatically appear on your site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!websiteUrl ? (
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Subdomain"
                      placeholder="myshop"
                      value={subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      description="Choose a unique subdomain for your store (letters, numbers, and hyphens only)"
                    />
                    <div className="mt-1 text-sm text-muted-foreground">
                      Your website will be available at: <span className="font-mono font-medium">{subdomain || 'myshop'}.llatria.com</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleBuildWebsite} 
                    disabled={!subdomain || subdomain.length < 3 || isBuilding}
                    className="w-full"
                  >
                    {isBuilding ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Building Website...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Build My Website
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="font-medium">Your Website</span>
                      </div>
                      {isWebsiteActive && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-sm font-medium">Active</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <a 
                        href={`https://${websiteUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono text-sm"
                      >
                        {websiteUrl}
                      </a>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your website is live and automatically displays all items posted to your website platform.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setWebsiteUrl(null);
                      setSubdomain('');
                    }}
                  >
                    Change Subdomain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Connections</CardTitle>
              <CardDescription>Connect your accounts to enable automatic posting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Facebook Marketplace */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📘</span>
                  <div>
                    <div className="font-medium">Facebook Marketplace</div>
                    {facebookConnected ? (
                      <div className="text-sm text-muted-foreground">{facebookAccount}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Not connected</div>
                    )}
                  </div>
                </div>
                {facebookConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleFacebookDisconnect}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleFacebookConnect}
                    disabled={facebookConnecting}
                  >
                    {facebookConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* eBay */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <div className="font-medium">eBay</div>
                    {ebayConnected ? (
                      <div className="text-sm text-muted-foreground">{ebayAccount}</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Not connected</div>
                    )}
                  </div>
                </div>
                {ebayConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleEbayDisconnect}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEbayConnect}
                    disabled={ebayConnecting}
                  >
                    {ebayConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="font-medium">Your Website</div>
                    <div className="text-sm text-muted-foreground">{websiteUrl || 'Not set up'}</div>
                  </div>
                </div>
                {websiteUrl ? (
                  <Button variant="outline" size="sm" disabled>
                    Active
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setWebsiteUrl(null)}>
                    Set Up
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="text-red-600 hover:text-red-700"
                onClick={() => setLogoutConfirmOpen(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Facebook Connection Modal */}
      <Modal
        isOpen={facebookModalOpen}
        onClose={() => {
          if (!facebookConnecting) {
            setFacebookModalOpen(false);
          }
        }}
        title="Connect to Facebook Marketplace"
        showCloseButton={!facebookConnecting}
      >
        <div className="space-y-4">
          {facebookConnecting ? (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium mb-2">Connecting to Facebook...</p>
                <p className="text-sm text-muted-foreground text-center">
                  A new window will open for you to log in to Facebook.
                  <br />
                  Please complete the login process in that window.
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Note:</strong> Make sure you have a Facebook account with Marketplace access enabled.
                  You may need to verify your account or add a payment method.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Click the button below to open Facebook login in a new window.
              </p>
              <Button
                onClick={() => {
                  // In production, this would open Electron BrowserWindow
                  window.open('https://www.facebook.com/login', '_blank');
                  setFacebookConnecting(true);
                }}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Facebook Login
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* eBay Connection Modal */}
      <Modal
        isOpen={ebayModalOpen}
        onClose={() => {
          if (!ebayConnecting) {
            setEbayModalOpen(false);
          }
        }}
        title="Connect to eBay"
        showCloseButton={!ebayConnecting}
      >
        <div className="space-y-4">
          {ebayConnecting ? (
            <>
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium mb-2">Connecting to eBay...</p>
                <p className="text-sm text-muted-foreground text-center">
                  You will be redirected to eBay to authorize this application.
                  <br />
                  Please complete the authorization process.
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <p className="text-sm text-orange-900 dark:text-orange-100">
                  <strong>Note:</strong> You'll need an eBay seller account with API access enabled.
                  Make sure you have your eBay API credentials ready.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Click the button below to authorize this application with your eBay account.
              </p>
              <Button
                onClick={() => {
                  // In production, this would open eBay OAuth flow
                  window.open('https://signin.ebay.com/ws/eBayISAPI.dll?SignIn', '_blank');
                  setEbayConnecting(true);
                }}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Authorize with eBay
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          logout();
          addToast({ type: 'info', message: 'Signed out successfully' });
          setLogoutConfirmOpen(false);
        }}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  );
};



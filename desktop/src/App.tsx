import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { InventoryPage } from './pages/InventoryPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { EditListingPage } from './pages/EditListingPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { ThemeToggle } from './components/common/ThemeToggle';
import { Button } from './components/common/Button';
import { Toaster } from './components/common/Toaster';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { KeyboardShortcutsHelp } from './components/common/KeyboardShortcutsHelp';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { OnboardingTour } from './components/onboarding/OnboardingTour';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useThemeStore } from './store/themeStore';
import { useInventoryStore } from './store/inventoryStore';
import { useAuthStore } from './store/authStore';
import { useAuthStore as getAuthStore } from './store/authStore';
import { InventoryItem as InventoryItemType } from './types/inventory';
import { clsx } from 'clsx';

type Page = 'inventory' | 'create' | 'edit' | 'settings' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('inventory');
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isDark, setTheme } = useThemeStore();
  const { loadInventory } = useInventoryStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initializeAuth = useAuthStore((state) => state.initialize);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setCurrentPage(event.detail as Page);
    };
    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  useEffect(() => {
    // Initialize auth state
    const init = async () => {
      await initializeAuth();
      
      // Load inventory only if authenticated
      const authState = getAuthStore.getState();
      if (authState.isAuthenticated) {
        await loadInventory();
      }
    };
    
    init();
    
    // Initialize theme
    const savedTheme = localStorage.getItem('llatria-theme');
    if (savedTheme) {
      const isDarkMode = savedTheme === 'true';
      setTheme(isDarkMode);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark);
    }

    // Check if onboarding should be shown
    const onboardingCompleted = localStorage.getItem('llatria-onboarding-completed');
    if (!onboardingCompleted && isAuthenticated) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, [setTheme, loadInventory, initializeAuth, isAuthenticated]);

  const handleCreateNew = () => {
    setCurrentPage('create');
  };

  const handleEditItem = (item: InventoryItemType) => {
    setEditingItem(item);
    setCurrentPage('edit');
  };

  const handleBackToInventory = () => {
    setCurrentPage('inventory');
    setEditingItem(null);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      metaKey: true,
      handler: () => {
        if (isAuthenticated && currentPage !== 'create') {
          handleCreateNew();
        }
      },
    },
    {
      key: 'k',
      metaKey: true,
      handler: () => {
        // Quick search - focus search input if on inventory page
        if (currentPage === 'inventory') {
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          searchInput?.focus();
        }
      },
    },
    {
      key: '/',
      metaKey: true,
      handler: () => {
        setShowShortcutsHelp(true);
      },
    },
    {
      key: 'Escape',
      handler: () => {
        setShowShortcutsHelp(false);
      },
    },
  ]);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={clsx('h-screen w-screen', isDark && 'dark')}>
        <LoginPage />
      </div>
    );
  }

  return (
    <div className={clsx('h-screen w-screen flex flex-col overflow-hidden', isDark && 'dark')}>
      {/* Draggable Title Bar Area */}
      <div className="h-8 bg-background drag-region" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <ErrorBoundary>
          <div className="flex-1 overflow-hidden">
            {currentPage === 'inventory' && (
              <InventoryPage />
            )}
            {currentPage === 'create' && (
              <CreateListingPage
                onBack={handleBackToInventory}
                onComplete={handleBackToInventory}
              />
            )}
            {currentPage === 'edit' && editingItem && (
              <EditListingPage
                item={editingItem}
                onBack={handleBackToInventory}
                onSave={handleBackToInventory}
              />
            )}
            {currentPage === 'settings' && <SettingsPage />}
            {currentPage === 'dashboard' && <DashboardPage />}
          </div>
        </ErrorBoundary>
      </div>

      {/* Bottom Right Panel - Settings & Theme */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-card border border-border rounded-lg shadow-lg p-2 z-50">
        <Button
          variant={currentPage === 'settings' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setCurrentPage(currentPage === 'settings' ? 'inventory' : 'settings')}
          className="h-9 w-9 p-0"
          title={currentPage === 'settings' ? 'Close Settings' : 'Settings'}
          data-tour="settings"
        >
          <Settings className="h-5 w-5 text-foreground flex-shrink-0" />
        </Button>
        <div className="w-px h-6 bg-border" />
        <ThemeToggle />
      </div>

      {/* Toast Notifications */}
      <Toaster />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />
    </div>
  );
}

export default App;


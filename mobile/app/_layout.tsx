import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Toaster } from '@/components/Toaster';

export default function RootLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);
  const { isDark, initializeTheme } = useThemeStore();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth state and theme on app start
    let mounted = true;
    
    Promise.all([
      initialize().catch(err => {
        console.error('Auth initialization error:', err);
        return null; // Continue even if auth init fails
      }),
      initializeTheme().catch(err => {
        console.error('Theme initialization error:', err);
        return null; // Continue even if theme init fails
      }),
    ]).then(() => {
      if (mounted) {
        setIsReady(true);
      }
    }).catch((err) => {
      console.error('Initialization error:', err);
      if (mounted) {
        setError(err.message || 'Failed to initialize app');
        setIsReady(true);
      }
    });
    
    return () => {
      mounted = false;
    };
  }, [initialize, initializeTheme]);

  // Show loading screen while initializing
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={{ marginTop: 16, color: '#666666' }}>Loading...</Text>
      </View>
    );
  }

  // Show error screen if initialization failed
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ef4444', marginBottom: 8 }}>Error</Text>
        <Text style={{ color: '#666666', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  // Always render the Stack first, then handle navigation inside
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            },
            headerTintColor: isDark ? '#ffffff' : '#000000',
            headerTitleStyle: {
              fontWeight: 'bold',
              color: isDark ? '#ffffff' : '#000000',
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen 
            name="login" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="item/[id]" 
            options={{ 
              title: 'Edit Listing',
              headerBackTitle: 'Listings',
            }} 
          />
        </Stack>
        <AuthRedirect isReady={isReady} isAuthenticated={isAuthenticated} />
        <Toaster />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AuthRedirect({ isReady, isAuthenticated }: { isReady: boolean; isAuthenticated: boolean }) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Only navigate after router is ready and auth is initialized
    if (!isReady) return;

    const inAuthGroup = segments[0] === 'login';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and on login page
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, router, isReady]);

  return null;
}


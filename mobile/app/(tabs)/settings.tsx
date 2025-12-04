import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Linking, Modal, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, X, Sun, Moon } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { isDark, toggleTheme, initializeTheme } = useThemeStore();
  const [subdomain, setSubdomain] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState<string | null>('myshop.llatria.com');
  const [isBuilding, setIsBuilding] = useState(false);
  const [isWebsiteActive, setIsWebsiteActive] = useState(true);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);
  
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

  const handleSubdomainChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(sanitized);
  };

  const handleBuildWebsite = async () => {
    if (!subdomain || subdomain.length < 3) {
      Alert.alert('Invalid Subdomain', 'Please enter a subdomain with at least 3 characters');
      return;
    }

    setIsBuilding(true);
    
    // Simulate website building process
    setTimeout(() => {
      const newUrl = `${subdomain}.llatria.com`;
      setWebsiteUrl(newUrl);
      setIsWebsiteActive(true);
      setIsBuilding(false);
      // In production, this would call an API to create the website
    }, 2000);
  };

  const openWebsite = () => {
    if (websiteUrl) {
      Linking.openURL(`https://${websiteUrl}`);
    }
  };

  const handleFacebookConnect = () => {
    setFacebookModalOpen(true);
    setFacebookConnecting(true);
    
    // Simulate opening Facebook login
    setTimeout(() => {
      setFacebookConnecting(false);
      setFacebookConnected(true);
      setFacebookAccount('user@example.com');
      setFacebookModalOpen(false);
    }, 3000);
  };

  const handleFacebookDisconnect = () => {
    setFacebookConnected(false);
    setFacebookAccount(null);
  };

  const handleEbayConnect = () => {
    setEbayModalOpen(true);
    setEbayConnecting(true);
    
    // Simulate opening eBay authorization
    setTimeout(() => {
      setEbayConnecting(false);
      setEbayConnected(true);
      setEbayAccount('store@example.com');
      setEbayModalOpen(false);
    }, 3000);
  };

  const handleEbayDisconnect = () => {
    setEbayConnected(false);
    setEbayAccount(null);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
    },
    header: {
      ...styles.header,
      backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
      borderBottomColor: isDark ? '#1a1a1a' : '#e5e5e5',
    },
    title: {
      ...styles.title,
      color: isDark ? '#ffffff' : '#000000',
    },
    sectionTitle: {
      ...styles.sectionTitle,
      color: isDark ? '#ffffff' : '#000000',
    },
    sectionDescription: {
      ...styles.sectionDescription,
      color: isDark ? '#999999' : '#666666',
    },
    settingLabel: {
      ...styles.settingLabel,
      color: isDark ? '#ffffff' : '#000000',
    },
    settingValue: {
      ...styles.settingValue,
      color: isDark ? '#999999' : '#666666',
    },
    settingItem: {
      ...styles.settingItem,
      borderBottomColor: isDark ? '#1a1a1a' : '#f5f5f5',
    },
    input: {
      ...styles.input,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
      color: isDark ? '#ffffff' : '#000000',
    },
    inputLabel: {
      ...styles.inputLabel,
      color: isDark ? '#ffffff' : '#000000',
    },
    inputHint: {
      ...styles.inputHint,
      color: isDark ? '#999999' : '#666666',
    },
    websiteInfo: {
      ...styles.websiteInfo,
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
      borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
    },
    websiteTitle: {
      ...styles.websiteTitle,
      color: isDark ? '#ffffff' : '#000000',
    },
    websiteUrl: {
      ...styles.websiteUrl,
      color: isDark ? '#60a5fa' : '#0066cc',
    },
    websiteDescription: {
      ...styles.websiteDescription,
      color: isDark ? '#999999' : '#666666',
    },
    buttonText: {
      ...styles.buttonText,
      color: '#ffffff',
    },
    buttonOutlineText: {
      ...styles.buttonOutlineText,
      color: isDark ? '#ffffff' : '#000000',
    },
    platformButtonText: {
      ...styles.platformButtonText,
      color: '#ffffff',
    },
    modalContent: {
      ...styles.modalContent,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    },
    modalTitle: {
      ...styles.modalTitle,
      color: isDark ? '#ffffff' : '#000000',
    },
    modalText: {
      ...styles.modalText,
      color: isDark ? '#ffffff' : '#000000',
    },
    modalSubtext: {
      ...styles.modalSubtext,
      color: isDark ? '#999999' : '#666666',
    },
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Account</Text>
          <View style={dynamicStyles.settingItem}>
            <Text style={dynamicStyles.settingLabel}>Store Name</Text>
            <Text style={dynamicStyles.settingValue}>My Pawn Shop</Text>
          </View>
          <View style={dynamicStyles.settingItem}>
            <Text style={dynamicStyles.settingLabel}>Email</Text>
            <Text style={dynamicStyles.settingValue}>store@example.com</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Appearance</Text>
          <View style={dynamicStyles.settingItem}>
            <View style={styles.themeToggleContainer}>
              {isDark ? (
                <Moon size={20} color={isDark ? '#ffffff' : '#000000'} />
              ) : (
                <Sun size={20} color={isDark ? '#ffffff' : '#000000'} />
              )}
              <Text style={dynamicStyles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: isDark ? '#2a2a2a' : '#e5e5e5', true: isDark ? '#ffffff' : '#000000' }}
              thumbColor={isDark ? '#000000' : '#ffffff'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Website Setup</Text>
          <Text style={dynamicStyles.sectionDescription}>
            Create your custom store website. Your products will automatically appear on your site.
          </Text>
          
          {!websiteUrl ? (
            <View style={styles.websiteSetup}>
              <View style={styles.inputContainer}>
                <Text style={dynamicStyles.inputLabel}>Subdomain</Text>
                <TextInput
                  style={dynamicStyles.input}
                  placeholder="myshop"
                  placeholderTextColor={isDark ? '#666666' : '#999999'}
                  value={subdomain}
                  onChangeText={handleSubdomainChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={dynamicStyles.inputHint}>
                  Your website will be: {subdomain || 'myshop'}.llatria.com
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.button, (!subdomain || subdomain.length < 3 || isBuilding) && styles.buttonDisabled]}
                onPress={handleBuildWebsite}
                disabled={!subdomain || subdomain.length < 3 || isBuilding}
              >
                {isBuilding ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={dynamicStyles.buttonText}>Build My Website</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.websiteActive}>
              <View style={dynamicStyles.websiteInfo}>
                <View style={styles.websiteHeader}>
                  <Text style={dynamicStyles.websiteTitle}>Your Website</Text>
                  {isWebsiteActive && (
                    <View style={styles.activeBadge}>
                      <CheckCircle size={16} color="#22c55e" />
                      <Text style={styles.activeText}>Active</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={openWebsite}>
                  <Text style={dynamicStyles.websiteUrl}>{websiteUrl}</Text>
                </TouchableOpacity>
                <Text style={dynamicStyles.websiteDescription}>
                  Your website is live and automatically displays all items posted to your website platform.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={() => {
                  setWebsiteUrl(null);
                  setSubdomain('');
                }}
              >
                <Text style={[dynamicStyles.buttonText, dynamicStyles.buttonOutlineText]}>Change Subdomain</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Platform Connections</Text>
          
          {/* Facebook Marketplace */}
          <View style={styles.platformItem}>
            <View style={styles.platformInfo}>
              <Text style={styles.platformEmoji}>📘</Text>
              <View style={styles.platformDetails}>
                <Text style={dynamicStyles.settingLabel}>Facebook Marketplace</Text>
                <Text style={dynamicStyles.settingValue}>
                  {facebookConnected ? facebookAccount : 'Not connected'}
                </Text>
              </View>
            </View>
            {facebookConnected ? (
              <View style={styles.platformActions}>
                <View style={styles.connectedBadge}>
                  <CheckCircle size={16} color="#22c55e" />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
                <TouchableOpacity
                  style={[styles.platformButton, styles.disconnectButton]}
                  onPress={handleFacebookDisconnect}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={[dynamicStyles.platformButtonText, { color: '#ef4444' }]}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.platformButton, styles.connectButton]}
                onPress={handleFacebookConnect}
                disabled={facebookConnecting}
              >
                {facebookConnecting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={dynamicStyles.platformButtonText}>Connect</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* eBay */}
          <View style={styles.platformItem}>
            <View style={styles.platformInfo}>
              <Text style={styles.platformEmoji}>🛒</Text>
              <View style={styles.platformDetails}>
                <Text style={dynamicStyles.settingLabel}>eBay</Text>
                <Text style={dynamicStyles.settingValue}>
                  {ebayConnected ? ebayAccount : 'Not connected'}
                </Text>
              </View>
            </View>
            {ebayConnected ? (
              <View style={styles.platformActions}>
                <View style={styles.connectedBadge}>
                  <CheckCircle size={16} color="#22c55e" />
                  <Text style={styles.connectedText}>Connected</Text>
                </View>
                <TouchableOpacity
                  style={[styles.platformButton, styles.disconnectButton]}
                  onPress={handleEbayDisconnect}
                >
                  <X size={16} color="#ef4444" />
                  <Text style={[dynamicStyles.platformButtonText, { color: '#ef4444' }]}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.platformButton, styles.connectButton]}
                onPress={handleEbayConnect}
                disabled={ebayConnecting}
              >
                {ebayConnecting ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={dynamicStyles.platformButtonText}>Connect</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Website */}
          <View style={dynamicStyles.settingItem}>
            <Text style={dynamicStyles.settingLabel}>Your Website</Text>
            <Text style={dynamicStyles.settingValue}>{websiteUrl || 'Not set up'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Danger Zone</Text>
          <Text style={dynamicStyles.sectionDescription}>Irreversible actions</Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonOutline, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[dynamicStyles.buttonText, dynamicStyles.buttonOutlineText, { color: '#ef4444' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Facebook Connection Modal */}
        <Modal
          visible={facebookModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            if (!facebookConnecting) {
              setFacebookModalOpen(false);
            }
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Connect to Facebook Marketplace</Text>
                {!facebookConnecting && (
                  <TouchableOpacity onPress={() => setFacebookModalOpen(false)}>
                    <X size={24} color={isDark ? '#ffffff' : '#000000'} />
                  </TouchableOpacity>
                )}
              </View>
              {facebookConnecting ? (
                <View style={styles.modalBody}>
                  <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} style={styles.modalSpinner} />
                  <Text style={dynamicStyles.modalText}>Connecting to Facebook...</Text>
                  <Text style={dynamicStyles.modalSubtext}>
                    A new window will open for you to log in to Facebook.
                    Please complete the login process in that window.
                  </Text>
                  <View style={styles.modalNote}>
                    <Text style={styles.modalNoteText}>
                      <Text style={styles.modalNoteBold}>Note:</Text> Make sure you have a Facebook account with Marketplace access enabled.
                      You may need to verify your account or add a payment method.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.modalBody}>
                  <Text style={dynamicStyles.modalSubtext}>
                    Click the button below to open Facebook login in a new window.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      Linking.openURL('https://www.facebook.com/login');
                      setFacebookConnecting(true);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Open Facebook Login</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* eBay Connection Modal */}
        <Modal
          visible={ebayModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            if (!ebayConnecting) {
              setEbayModalOpen(false);
            }
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={dynamicStyles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Connect to eBay</Text>
                {!ebayConnecting && (
                  <TouchableOpacity onPress={() => setEbayModalOpen(false)}>
                    <X size={24} color={isDark ? '#ffffff' : '#000000'} />
                  </TouchableOpacity>
                )}
              </View>
              {ebayConnecting ? (
                <View style={styles.modalBody}>
                  <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#000000'} style={styles.modalSpinner} />
                  <Text style={dynamicStyles.modalText}>Connecting to eBay...</Text>
                  <Text style={dynamicStyles.modalSubtext}>
                    You will be redirected to eBay to authorize this application.
                    Please complete the authorization process.
                  </Text>
                  <View style={styles.modalNote}>
                    <Text style={styles.modalNoteText}>
                      <Text style={styles.modalNoteBold}>Note:</Text> You'll need an eBay seller account with API access enabled.
                      Make sure you have your eBay API credentials ready.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.modalBody}>
                  <Text style={dynamicStyles.modalSubtext}>
                    Click the button below to authorize this application with your eBay account.
                  </Text>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      Linking.openURL('https://signin.ebay.com/ws/eBayISAPI.dll?SignIn');
                      setEbayConnecting(true);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Authorize with eBay</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000000',
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
  },
  websiteSetup: {
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  inputHint: {
    fontSize: 12,
    color: '#666666',
    marginTop: 6,
    fontFamily: 'monospace',
  },
  websiteActive: {
    marginTop: 8,
  },
  websiteInfo: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: 12,
  },
  websiteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  websiteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  websiteUrl: {
    fontSize: 14,
    color: '#0066cc',
    fontFamily: 'monospace',
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  websiteDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutlineText: {
    color: '#000000',
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  platformDetails: {
    flex: 1,
  },
  platformActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  platformButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  connectButton: {
    backgroundColor: '#000000',
  },
  disconnectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  platformButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalBody: {
    alignItems: 'center',
  },
  modalSpinner: {
    marginBottom: 16,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalNote: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  modalNoteText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  modalNoteBold: {
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    borderColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


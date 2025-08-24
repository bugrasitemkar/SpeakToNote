import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotionService, NotionConfig } from '../services/notion';
import { NotionTokenScreen } from './NotionTokenScreen';

interface NotionSettingsScreenProps {
  onBack?: () => void;
}

interface PageItem {
  id: string;
  title: string;
  url: string;
}

export const NotionSettingsScreen: React.FC<NotionSettingsScreenProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [config, setConfig] = useState<NotionConfig | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [showPageSelection, setShowPageSelection] = useState(false);
  const [showTokenSetup, setShowTokenSetup] = useState(false);

  const notionService = NotionService.getInstance();

  useEffect(() => {
    loadNotionConfig();
  }, []);

  const loadNotionConfig = async () => {
    setIsLoading(true);
    try {
      const savedConfig = await notionService.loadConfig();
      setConfig(savedConfig);
    } catch (error) {
      console.error('Error loading Notion config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    try {
      const success = await notionService.authenticate();
      if (success) {
        Alert.alert('Success', 'Notion connected successfully! Now select a page to sync with.');
        await loadNotionConfig();
        setShowPageSelection(true);
        // Auto-load pages after successful connection
        handleLoadPages();
      } else {
        Alert.alert('Error', 'Failed to connect to Notion. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Failed to authenticate with Notion. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLoadPages = async () => {
    setIsLoadingPages(true);
    try {
      const userPages = await notionService.getUserPages();
      setPages(userPages);
    } catch (error) {
      console.error('Error loading pages:', error);
      Alert.alert('Error', 'Failed to load your Notion pages. Please try again.');
    } finally {
      setIsLoadingPages(false);
    }
  };

  const handleSelectPage = async (page: PageItem) => {
    try {
      await notionService.setSelectedPage(page.id, page.title);
      setConfig(prev => prev ? { ...prev, pageId: page.id, pageName: page.title } : null);
      setShowPageSelection(false);
      Alert.alert('Success', `Selected page: ${page.title}`);
    } catch (error) {
      console.error('Error selecting page:', error);
      Alert.alert('Error', 'Failed to select page. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Notion',
      'Are you sure you want to disconnect your Notion account? This will remove all sync settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await notionService.disconnect();
              setConfig(null);
              setPages([]);
              setShowPageSelection(false);
              Alert.alert('Success', 'Notion disconnected successfully.');
            } catch (error) {
              console.error('Error disconnecting:', error);
              Alert.alert('Error', 'Failed to disconnect Notion.');
            }
          },
        },
      ]
    );
  };



  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notion Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notion Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          
          {config ? (
            <View style={styles.connectedStatus}>
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.statusText}>Connected to Your Notion Workspace</Text>
              </View>
              {config.workspaceId && (
                <Text style={styles.pageInfo}>
                  Workspace: {config.workspaceName || config.workspaceId}
                </Text>
              )}
              {config.pageName && (
                <Text style={styles.pageInfo}>
                  Selected page: {config.pageName}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.disconnectedStatus}>
              <View style={styles.statusRow}>
                <Ionicons name="close-circle" size={20} color="#ff4444" />
                <Text style={styles.statusText}>Not connected to Notion</Text>
              </View>
            </View>
          )}
        </View>

        {/* Authentication */}
        {!config && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connect to Notion</Text>
            <Text style={styles.sectionDescription}>
              Connect your Notion account to automatically sync your transcribed notes.
            </Text>
            
            <View style={styles.infoNotice}>
              <Ionicons name="information-circle" size={20} color="#007AFF" />
              <Text style={styles.infoNoticeText}>
                Connect your Notion account to automatically sync your transcribed notes to your workspace.
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.connectButton, isAuthenticating && styles.connectButtonDisabled]}
              onPress={handleAuthenticate}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="document-text" size={20} color="white" />
              )}
              <Text style={styles.connectButtonText}>
                {isAuthenticating ? 'Connecting...' : 'Connect with OAuth'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.manualSetupButton}
              onPress={() => setShowTokenSetup(true)}
            >
              <Ionicons name="key" size={20} color="#007AFF" />
              <Text style={styles.manualSetupButtonText}>
                Manual Token Setup
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Page Selection */}
        {config && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Page</Text>
            <Text style={styles.sectionDescription}>
              Choose a Notion page where your notes will be synced.
              {config.pageName && (
                <Text style={styles.currentPage}>
                  {'\n'}Current page: {config.pageName}
                </Text>
              )}
            </Text>
            
            {!showPageSelection ? (
              <TouchableOpacity
                style={styles.loadPagesButton}
                onPress={handleLoadPages}
              >
                <Ionicons name="list" size={20} color="#007AFF" />
                <Text style={styles.loadPagesButtonText}>Load My Pages</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pageSelection}>
                {isLoadingPages ? (
                  <View style={styles.loadingPages}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.loadingPagesText}>Loading pages...</Text>
                  </View>
                ) : (
                  <View style={styles.pagesList}>
                    {pages.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.pageItem}
                        onPress={() => handleSelectPage(item)}
                      >
                        <View style={styles.pageItemInfo}>
                          <Text style={styles.pageTitle}>{item.title}</Text>
                          <Text style={styles.pageUrl}>{item.url}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Disconnect */}
        {config && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Ionicons name="log-out-outline" size={20} color="#ff4444" />
              <Text style={styles.disconnectButtonText}>Disconnect Notion</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Notion Sync</Text>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Your notes will be automatically synced to the selected Notion page.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="add-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Notes are appended to the page - they are never deleted from Notion.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Each note includes a timestamp of when it was transcribed.
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Your data is secure and only synced to your own Notion workspace.
            </Text>
          </View>
        </View>
      </View>
      
      {/* Manual Token Setup Modal */}
      {showTokenSetup && (
        <NotionTokenScreen
          onBack={() => setShowTokenSetup(false)}
          onSuccess={() => {
            setShowTokenSetup(false);
            loadNotionConfig();
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  connectedStatus: {
    marginTop: 8,
  },
  disconnectedStatus: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 12,
  },
  connectButtonDisabled: {
    backgroundColor: '#ccc',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  manualSetupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  manualSetupButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoNoticeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  currentPage: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 8,
  },
  loadPagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
  },
  loadPagesButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  pageSelection: {
    marginTop: 8,
  },
  loadingPages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingPagesText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  pagesList: {
    maxHeight: 300,
  },
  pageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pageItemInfo: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  pageUrl: {
    fontSize: 12,
    color: '#666',
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  disconnectButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

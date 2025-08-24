import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotionService } from '../services/notion';

interface NotionTokenScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const NotionTokenScreen: React.FC<NotionTokenScreenProps> = ({ onBack, onSuccess }) => {
  const [token, setToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [pageName, setPageName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const notionService = NotionService.getInstance();

  const handleSave = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter your Notion integration token');
      return;
    }

    if (!pageId.trim()) {
      Alert.alert('Error', 'Please enter a page ID');
      return;
    }

    if (!pageName.trim()) {
      Alert.alert('Error', 'Please enter a page name');
      return;
    }

    setIsLoading(true);
    try {
      // Save the configuration
      await notionService.saveConfig({
        accessToken: token.trim(),
        pageId: pageId.trim(),
        pageName: pageName.trim(),
      });

      Alert.alert('Success', 'Notion integration configured successfully!', [
        { text: 'OK', onPress: onSuccess }
      ]);
    } catch (error) {
      console.error('Error saving Notion config:', error);
      Alert.alert('Error', 'Failed to save configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notion Setup</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Setup Instructions</Text>
          <Text style={styles.sectionDescription}>
            To connect to your real Notion account, you need to:
          </Text>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              Create a Notion integration at{' '}
              <Text style={styles.link}>notion.so/my-integrations</Text>
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              Copy your integration token (starts with "secret_")
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              Share a Notion page with your integration
            </Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4</Text>
            <Text style={styles.instructionText}>
              Enter the details below
            </Text>
          </View>
        </View>

        {/* Token Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integration Token</Text>
          <Text style={styles.sectionDescription}>
            Your Notion integration token (starts with "secret_")
          </Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="secret_your_token_here"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Page ID Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Page ID</Text>
          <Text style={styles.sectionDescription}>
            The ID of the Notion page you want to sync with (from the page URL)
          </Text>
          <TextInput
            style={styles.input}
            value={pageId}
            onChangeText={setPageId}
            placeholder="page-id-from-url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Page Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Page Name</Text>
          <Text style={styles.sectionDescription}>
            A friendly name for the page (for display purposes)
          </Text>
          <TextInput
            style={styles.input}
            value={pageName}
            onChangeText={setPageName}
            placeholder="My Notes"
            autoCapitalize="words"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Configuration'}
          </Text>
        </TouchableOpacity>

        {/* Help Text */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Check the NOTION_SETUP.md file in the project for detailed instructions on creating a Notion integration.
          </Text>
        </View>
      </ScrollView>
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
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpSection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

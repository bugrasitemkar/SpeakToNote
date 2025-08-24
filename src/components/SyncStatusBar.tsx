import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types';
import { NotionService } from '../services/notion';

interface SyncStatusBarProps {
  notes: Note[];
  onSyncComplete?: () => void;
}

export const SyncStatusBar: React.FC<SyncStatusBarProps> = ({
  notes,
  onSyncComplete,
}) => {
  const [unsyncedNotes, setUnsyncedNotes] = useState<Note[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isNotionConfigured, setIsNotionConfigured] = useState(false);

  const notionService = NotionService.getInstance();

  useEffect(() => {
    checkNotionConfig();
    updateUnsyncedNotes();
  }, [notes]);

  const checkNotionConfig = async () => {
    try {
      await notionService.loadConfig();
      setIsNotionConfigured(notionService.isConfigured());
    } catch (error) {
      setIsNotionConfigured(false);
    }
  };

  const updateUnsyncedNotes = () => {
    const unsynced = notes.filter(note => !note.notionSyncStatus?.isSynced);
    setUnsyncedNotes(unsynced);
  };

  const handleSyncAll = async () => {
    if (unsyncedNotes.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Ensure the page exists
      await notionService.ensurePageExists();

      for (const note of unsyncedNotes) {
        try {
          await notionService.syncNote({
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
          });

          // Update the note's sync status
          note.notionSyncStatus = {
            isSynced: true,
            lastSyncAttempt: new Date(),
          };

          successCount++;
        } catch (error) {
          console.error(`Failed to sync note ${note.id}:`, error);
          note.notionSyncStatus = {
            isSynced: false,
            lastSyncAttempt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          };
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0 && errorCount === 0) {
        Alert.alert('Sync Complete', `Successfully synced ${successCount} notes to Notion!`);
        onSyncComplete?.();
      } else if (successCount > 0 && errorCount > 0) {
        Alert.alert(
          'Partial Sync Complete',
          `Synced ${successCount} notes, ${errorCount} failed. Check your connection and try again.`
        );
        onSyncComplete?.();
      } else {
        Alert.alert(
          'Sync Failed',
          `Failed to sync ${errorCount} notes. Please check your Notion connection and try again.`
        );
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Error', 'Failed to sync notes. Please try again.');
    } finally {
      setIsSyncing(false);
      updateUnsyncedNotes();
    }
  };

  const handleShowUnsyncedNotes = () => {
    if (unsyncedNotes.length === 0) return;

    const noteList = unsyncedNotes
      .map(note => `• ${note.title}`)
      .join('\n');

    Alert.alert(
      'Unsynced Notes',
      `You have ${unsyncedNotes.length} notes that haven't been synced to Notion:\n\n${noteList}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sync Now', onPress: handleSyncAll },
      ]
    );
  };

  // Don't show if Notion is not configured
  if (!isNotionConfigured) {
    return null;
  }

  // Don't show if all notes are synced
  if (unsyncedNotes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.syncButton}
        onPress={handleShowUnsyncedNotes}
        disabled={isSyncing}
      >
        <View style={styles.syncContent}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#ff4444" />
          ) : (
            <Ionicons name="cloud-upload-outline" size={20} color="#ff4444" />
          )}
          <Text style={styles.syncText}>
            {isSyncing
              ? 'Syncing...'
              : `${unsyncedNotes.length} note${unsyncedNotes.length > 1 ? 's' : ''} not synced`}
          </Text>
        </View>
        {!isSyncing && (
          <Ionicons name="chevron-forward" size={16} color="#666" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff5f5',
    borderTopWidth: 1,
    borderTopColor: '#ffebee',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#ff4444',
  },
});

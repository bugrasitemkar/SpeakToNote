import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import { MicrophoneButton } from '../components/MicrophoneButton';
import { NoteList } from '../components/NoteList';
import { SyncStatusBar } from '../components/SyncStatusBar';
import { Ionicons } from '@expo/vector-icons';
import { Note, RecordingState } from '../types';
import { SpeechToTextService } from '../services/speechToText';
import { StorageService } from '../services/storage';
import { NotionService } from '../services/notion';
import { generateId, generateNoteTitle } from '../utils/helpers';
import { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  onNotePress?: (note: Note) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, onNotePress }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
  });
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [durationInterval, setDurationInterval] = useState<NodeJS.Timeout | null>(null);

  const speechToTextService = SpeechToTextService.getInstance();
  const storageService = StorageService.getInstance();
  const notionService = NotionService.getInstance();

  useEffect(() => {
    loadNotes();
    setupAudio();
  }, []);

  // Refresh notes when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
      Alert.alert('Error', 'Failed to set up audio recording');
    }
  };

  const loadNotes = async () => {
    try {
      const savedNotes = await storageService.getNotes();
      setNotes(savedNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const startRecording = async () => {
    try {
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setRecordingState({
        isRecording: true,
        duration: 0,
      });

      // Start duration timer
      const interval = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1,
        }));
      }, 1000);
      setDurationInterval(interval);

      // Auto-stop after 2 minutes (120 seconds)
      setTimeout(() => {
        if (recordingState.isRecording) {
          stopRecording();
        }
      }, 120000);

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      setRecording(null);
      setRecordingState({
        isRecording: false,
        duration: 0,
        audioUri: uri || undefined,
      });

      if (durationInterval) {
        clearInterval(durationInterval);
        setDurationInterval(null);
      }

      if (uri) {
        await transcribeAudio(uri);
      }

    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const transcribeAudio = async (audioUri: string) => {
    setIsTranscribing(true);
    
    try {
      const transcription = await speechToTextService.transcribeAudio(audioUri);
      
      // Create a new note from the transcription
      const newNote: Note = {
        id: generateId(),
        title: generateNoteTitle(transcription.text),
        content: transcription.text,
        createdAt: new Date(),
        updatedAt: new Date(),
        audioDuration: recordingState.duration,
      };

      await storageService.saveNote(newNote);
      await loadNotes();

      // Try to sync to Notion
      try {
        await trySyncToNotion(newNote);
        console.log('🎉 New note created and synced to Notion!');
      } catch (error) {
        console.log('⚠️ Note created but sync failed:', error);
      }

      // Navigate to edit screen to show the transcribed note
      navigation.navigate('NoteEdit', { note: newNote });

    } catch (error) {
      console.error('Error transcribing audio:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMicrophonePress = () => {
    if (recordingState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleNotePress = (note: Note) => {
    if (onNotePress) {
      onNotePress(note);
    } else {
      navigation.navigate('NoteEdit', { note });
    }
  };

  const trySyncToNotion = async (note: Note) => {
    try {
      // Check if Notion is configured
      if (!notionService.isConfigured()) {
        return;
      }

      // Try to sync the note
      await notionService.ensurePageExists();
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

      // Save the updated note
      await storageService.updateNote(note);
      await loadNotes();

      console.log('Note synced to Notion successfully');
    } catch (error) {
      console.error('Failed to sync note to Notion:', error);
      
      // Update the note's sync status with error
      note.notionSyncStatus = {
        isSynced: false,
        lastSyncAttempt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      // Save the updated note
      await storageService.updateNote(note);
      await loadNotes();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await storageService.deleteNote(noteId);
      await loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  const handleSyncComplete = () => {
    loadNotes();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SpeakToNote</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NotionSettings')}
            style={styles.headerButton}
          >
            <Ionicons name="document-text" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.content}>
        <MicrophoneButton
          isRecording={recordingState.isRecording}
          onPress={handleMicrophonePress}
          recordingDuration={recordingState.duration}
        />
        
        {isTranscribing && (
          <View style={styles.transcribingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.transcribingText}>
              Transcribing your audio...
            </Text>
          </View>
        )}
        
        <NoteList
          notes={notes}
          onNotePress={handleNotePress}
          onDeleteNote={handleDeleteNote}
        />
        
        <SyncStatusBar
          notes={notes}
          onSyncComplete={handleSyncComplete}
        />
      </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  transcribingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  transcribingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

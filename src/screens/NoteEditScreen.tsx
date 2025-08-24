import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types';
import { StorageService } from '../services/storage';
import { formatDate } from '../utils/helpers';

interface NoteEditScreenProps {
  note?: Note;
  onSave?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  navigation?: any;
  route?: any;
}

export const NoteEditScreen: React.FC<NoteEditScreenProps> = ({
  note,
  onSave,
  onDelete,
  navigation,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isEditing, setIsEditing] = useState(!note); // If no note provided, start in edit mode
  const [hasChanges, setHasChanges] = useState(false);

  const storageService = StorageService.getInstance();

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  // Convert serialized dates back to Date objects if needed
  const processedNote = note ? {
    ...note,
    createdAt: typeof note.createdAt === 'string' ? new Date(note.createdAt) : note.createdAt,
    updatedAt: typeof note.updatedAt === 'string' ? new Date(note.updatedAt) : note.updatedAt,
  } : note;

  useEffect(() => {
    if (processedNote) {
      setHasChanges(title !== processedNote.title || content !== processedNote.content);
    } else {
      setHasChanges(title.trim() !== '' || content.trim() !== '');
    }
  }, [title, content, processedNote]);

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please enter a title or content for your note');
      return;
    }

    try {
      const noteTitle = title.trim() || 'Untitled Note';
      
      if (processedNote) {
        // Update existing note
        const updatedNote: Note = {
          ...processedNote,
          title: noteTitle,
          content: content.trim(),
          updatedAt: new Date(),
        };
        
        await storageService.updateNote(updatedNote);
        onSave?.(updatedNote);
      } else {
        // Create new note
        const newNote: Note = {
          id: Date.now().toString(),
          title: noteTitle,
          content: content.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await storageService.saveNote(newNote);
        onSave?.(newNote);
      }

      setIsEditing(false);
      setHasChanges(false);
      
      // Navigate back to home screen after successful save
      if (navigation) {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    }
  };

  const handleDelete = () => {
    if (!processedNote) return;

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
                      onPress: async () => {
              try {
                await storageService.deleteNote(processedNote.id);
                onDelete?.(processedNote.id);
                // Don't call onBack here - let the parent handle navigation
              } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (isEditing && hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save them before leaving?',
        [
          {
            text: 'Don\'t Save',
            style: 'destructive',
            onPress: () => {
              if (navigation) {
                navigation.navigate('Home');
              }
            },
          },
          {
            text: 'Save',
            onPress: async () => {
              await handleSave();
              // handleSave will navigate back
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      if (navigation) {
        navigation.navigate('Home');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          {isEditing ? (
            // Edit mode: Show X (discard) and checkmark (save)
            <>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(false);
                  setHasChanges(false);
                  // Reset to original values
                  if (processedNote) {
                    setTitle(processedNote.title);
                    setContent(processedNote.content);
                  }
                }}
                style={styles.actionButton}
              >
                <Ionicons name="close" size={24} color="#ff4444" />
              </TouchableOpacity>
              
              {hasChanges && (
                <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                  <Ionicons name="checkmark" size={24} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </>
          ) : (
            // View mode: Show edit button and delete button
            <>
              {processedNote && (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={styles.actionButton}
                >
                  <Ionicons name="create" size={24} color="#007AFF" />
                </TouchableOpacity>
              )}
              
              {processedNote && (
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                  <Ionicons name="trash" size={24} color="#ff4444" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Note Info */}
          {processedNote && (
            <View style={styles.noteInfo}>
              <Text style={styles.noteDate}>
                Created: {formatDate(processedNote.createdAt)}
              </Text>
              {processedNote.updatedAt.getTime() !== processedNote.createdAt.getTime() && (
                <Text style={styles.noteDate}>
                  Updated: {formatDate(processedNote.updatedAt)}
                </Text>
              )}
            </View>
          )}

          {/* Title Input */}
          <TextInput
            style={[styles.titleInput, !isEditing && styles.titleInputReadOnly]}
            placeholder="Note title..."
            value={title}
            onChangeText={setTitle}
            editable={isEditing}
            multiline
            maxLength={100}
          />

          {/* Content Input */}
          <TextInput
            style={[styles.contentInput, !isEditing && styles.contentInputReadOnly]}
            placeholder="Start writing your note..."
            value={content}
            onChangeText={setContent}
            editable={isEditing}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  noteInfo: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  noteDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    padding: 0,
    minHeight: 40,
  },
  titleInputReadOnly: {
    backgroundColor: 'transparent',
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    padding: 0,
    minHeight: 200,
    flex: 1,
  },
  contentInputReadOnly: {
    backgroundColor: 'transparent',
  },
});

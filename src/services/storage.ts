import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from '../types';

const NOTES_STORAGE_KEY = '@speak_to_note_notes';

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async saveNote(note: Note): Promise<void> {
    try {
      const existingNotes = await this.getNotes();
      const updatedNotes = [...existingNotes, note];
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving note:', error);
      throw new Error('Failed to save note');
    }
  }

  async getNotes(): Promise<Note[]> {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (notesJson) {
        const notes = JSON.parse(notesJson);
        // Convert date strings back to Date objects
        return notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  async updateNote(updatedNote: Note): Promise<void> {
    try {
      const notes = await this.getNotes();
      const updatedNotes = notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      );
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error updating note:', error);
      throw new Error('Failed to update note');
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      const notes = await this.getNotes();
      const filteredNotes = notes.filter(note => note.id !== noteId);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw new Error('Failed to delete note');
    }
  }

  async clearAllNotes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notes:', error);
      throw new Error('Failed to clear notes');
    }
  }
}

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { NoteEditScreen } from './src/screens/NoteEditScreen';
import { NotionSettingsScreen } from './src/screens/NotionSettingsScreen';
import { Note } from './src/types';

export type RootStackParamList = {
  Home: undefined;
  NoteEdit: { note?: Note };
  NotionSettings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [currentNote, setCurrentNote] = useState<Note | undefined>(undefined);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen
              {...props}
              onNotePress={(note) => {
                setCurrentNote(note);
                // Convert dates to strings to avoid serialization warning
                const serializedNote = {
                  ...note,
                  createdAt: note.createdAt.toISOString(),
                  updatedAt: note.updatedAt.toISOString(),
                };
                props.navigation.navigate('NoteEdit', { note: serializedNote });
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="NoteEdit">
          {(props) => (
            <NoteEditScreen
              {...props}
              note={props.route.params?.note}
              navigation={props.navigation}
              onSave={(note) => {
                setCurrentNote(note);
                // Refresh the home screen
                props.navigation.navigate('Home');
              }}
              onDelete={(noteId) => {
                setCurrentNote(undefined);
                // Use navigate instead of goBack to ensure we always have a valid route
                props.navigation.navigate('Home');
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="NotionSettings">
          {(props) => (
            <NotionSettingsScreen
              {...props}
              onBack={() => props.navigation.navigate('Home')}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

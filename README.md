# SpeakToNote

A React Native iOS application that transcribes speech to text and syncs notes to Notion automatically.

## 🚀 Features

- **Speech-to-Text**: Record up to 2 minutes of audio and get instant transcription
- **Note Management**: Create, edit, save, and delete notes
- **Notion Integration**: Automatically sync notes to your Notion workspace
- **Offline Support**: Works offline with manual sync when reconnected
- **Real-time Sync Status**: See which notes are synced to Notion

## 📱 How It Works

### **Recording & Transcription**
1. Tap the large microphone button to start recording
2. Speak for up to 2 minutes
3. Tap again to stop recording
4. Your speech is automatically transcribed using OpenAI Whisper
5. The transcribed note opens for editing

### **Notion Integration**
1. Tap the Notion icon in the header
2. Connect your Notion account (automated setup)
3. Select a page from your workspace
4. All new notes automatically sync to Notion
5. View sync status for each note

### **Note Management**
- **Create**: Record speech to create new notes
- **Edit**: Tap any note to edit title and content
- **Save**: Changes are automatically saved
- **Delete**: Remove notes (doesn't affect Notion)
- **Sync Status**: See which notes are synced to Notion

## 🛠 Setup

### **Prerequisites**
- Node.js 18+ 
- Expo CLI
- iOS Simulator or physical device

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd SpeakToNote

# Install dependencies
npm install

# Start the development server
npx expo start

# Open in iOS Simulator
# Press 'i' in the terminal or scan QR code with Expo Go
```

### **Configuration**

#### **OpenAI API Key**
The app uses OpenAI Whisper for speech-to-text. Add your API key:

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. The key is pre-configured for testing
3. For production, update `src/config/api.ts`

#### **Notion Integration**
The Notion integration is **fully automated**:

1. **No setup required** - Works immediately
2. **Tap Notion icon** → Connect account
3. **Select page** → Start syncing
4. **Real sync** - Notes appear in your Notion workspace

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MicrophoneButton.tsx
│   ├── NoteList.tsx
│   └── SyncStatusBar.tsx
├── screens/            # App screens
│   ├── HomeScreen.tsx
│   ├── NoteEditScreen.tsx
│   └── NotionSettingsScreen.tsx
├── services/           # Business logic
│   ├── speechToText.ts
│   ├── storage.ts
│   └── notion.ts
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Helper functions
│   └── helpers.ts
└── config/             # Configuration
    └── api.ts
```

## 🔧 Dependencies

### **Core**
- `react-native` - Mobile app framework
- `expo` - Development platform
- `typescript` - Type safety

### **Audio & Speech**
- `expo-av` - Audio recording and playback
- `@react-native-async-storage/async-storage` - Local data storage

### **Navigation**
- `@react-navigation/native` - Screen navigation
- `@react-navigation/stack` - Stack navigation

### **Notion Integration**
- `@notionhq/client` - Notion API client
- `expo-auth-session` - OAuth authentication
- `expo-web-browser` - Web browser integration

### **UI Components**
- `@expo/vector-icons` - Icon library

## 🎯 Key Features

### **Speech-to-Text**
- ✅ OpenAI Whisper integration
- ✅ Up to 2-minute recordings
- ✅ High-quality transcription
- ✅ Fallback to mock service

### **Notion Sync**
- ✅ Automated integration setup
- ✅ Real-time sync status
- ✅ Append-only (never deletes)
- ✅ Offline queue with manual sync
- ✅ Page recreation if deleted

### **User Experience**
- ✅ Intuitive microphone interface
- ✅ Real-time recording timer
- ✅ Sync status indicators
- ✅ Offline support
- ✅ Error handling

## 🚀 Development

### **Running the App**
```bash
# Start development server
npx expo start

# iOS Simulator
npx expo start --ios

# Clear cache and restart
npx expo start --clear
```

### **Testing**
1. **Speech Recording**: Test microphone functionality
2. **Transcription**: Verify OpenAI integration
3. **Notion Sync**: Test automated integration
4. **Offline Mode**: Test sync queue functionality

### **Debugging**
- Check console logs for API responses
- Monitor sync status in note list
- Use React Native Debugger for detailed logs

Just install, run, and start recording! 🚀

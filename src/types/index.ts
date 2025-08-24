export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  audioDuration?: number;
  notionSyncStatus?: {
    isSynced: boolean;
    lastSyncAttempt?: Date;
    error?: string;
  };
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioUri?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language?: string;
}

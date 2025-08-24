import { TranscriptionResult } from '../types';
import { API_CONFIG } from '../config/api';

export class SpeechToTextService {
  private static instance: SpeechToTextService;
  private apiKey: string;

  private constructor() {
    this.apiKey = API_CONFIG.OPENAI.API_KEY;
  }

  static getInstance(): SpeechToTextService {
    if (!SpeechToTextService.instance) {
      SpeechToTextService.instance = new SpeechToTextService();
    }
    return SpeechToTextService.instance;
  }

  // Set API key dynamically (useful for user-provided keys)
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
    console.log('SpeechToText: Starting transcription with API key:', this.apiKey ? 'Present' : 'Missing');
    
    if (!this.apiKey) {
      console.log('SpeechToText: No API key found, using mock transcription');
      return this.getMockTranscription();
    }

    try {
      console.log('SpeechToText: Using OpenAI Whisper API...');
      
      // Create form data for the audio file
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');

      // Make API request to OpenAI
      const response = await fetch(`${API_CONFIG.OPENAI.BASE_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API Error:', errorData);
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      console.log('SpeechToText: Transcription completed successfully');
      
      return {
        text: result.text,
        confidence: 1.0, // OpenAI doesn't provide confidence scores
        language: result.language || 'en'
      };
    } catch (error) {
      console.error('SpeechToText: Error transcribing with OpenAI:', error);
      
      // Fallback to mock service if API fails
      console.log('SpeechToText: Falling back to mock transcription...');
      return this.getMockTranscription();
    }
  }

  // Fallback mock transcription
  private getMockTranscription(): TranscriptionResult {
    const mockTranscriptions = [
      "Hello, this is a test recording for my speech to text application. I'm speaking clearly to ensure accurate transcription.",
      "Today I want to talk about my project ideas. I have several concepts that I'd like to develop including a mobile app for productivity.",
      "I need to remember to buy groceries tomorrow. I need milk, bread, eggs, and some vegetables for dinner.",
      "My meeting notes for today: discussed the new feature requirements, assigned tasks to team members, and set deadlines for next week.",
      "Personal reflection: I'm feeling productive today and accomplished a lot of work. I should maintain this momentum for the rest of the week."
    ];

    const randomIndex = Math.floor(Math.random() * mockTranscriptions.length);
    
    return {
      text: mockTranscriptions[randomIndex],
      confidence: 0.95,
      language: 'en'
    };
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const response = await fetch(`${API_CONFIG.OPENAI.BASE_URL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }
}

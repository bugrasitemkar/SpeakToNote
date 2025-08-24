import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface MicrophoneButtonProps {
  isRecording: boolean;
  onPress: () => void;
  recordingDuration: number;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isRecording,
  onPress,
  recordingDuration,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isRecording) {
      // Start pulsing animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.buttonContainer}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.microphoneButton,
            {
              transform: [
                { scale: scaleAnim },
                { scale: isRecording ? pulseAnim : 1 },
              ],
              backgroundColor: isRecording ? '#ff4444' : '#007AFF',
            },
          ]}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={48}
            color="white"
          />
        </Animated.View>
      </TouchableOpacity>
      
      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingText}>Recording...</Text>
          <Text style={styles.timerText}>{formatTime(recordingDuration)}</Text>
        </View>
      )}
      
      {!isRecording && (
        <Text style={styles.instructionText}>
          Tap to start recording (max 2 minutes)
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  microphoneButton: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingInfo: {
    marginTop: 20,
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff4444',
    marginBottom: 5,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';

export const isWeb = Platform.OS === 'web';

export const impactAsync = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
  if (!isWeb) {
    try {
      await Haptics.impactAsync(style);
    } catch (error) {
      // Silently fail on haptics errors
      console.warn('Haptics not available:', error);
    }
  }
};

export const notificationAsync = async (type: Haptics.NotificationFeedbackType) => {
  if (!isWeb) {
    try {
      await Haptics.notificationAsync(type);
    } catch (error) {
      // Silently fail on haptics errors
      console.warn('Haptics notification not available:', error);
    }
  }
};

export const selectionAsync = async () => {
  if (!isWeb) {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Silently fail on haptics errors
      console.warn('Haptics selection not available:', error);
    }
  }
};

export const getFileInfo = async (uri: string) => {
  if (isWeb) {
    // Web implementation
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return {
        exists: true,
        size: blob.size,
        uri: uri,
        isDirectory: false,
        modificationTime: Date.now()
      };
    } catch (error) {
      return { exists: false };
    }
  }
  // Native implementation
  return FileSystem.getInfoAsync(uri);
};

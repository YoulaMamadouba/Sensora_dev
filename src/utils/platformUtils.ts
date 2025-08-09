import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';

export const isWeb = Platform.OS === 'web';

export const impactAsync = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
  if (!isWeb) {
    await Haptics.impactAsync(style);
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

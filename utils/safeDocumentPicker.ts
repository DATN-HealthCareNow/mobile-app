type AudioPickerResult = {
  canceled: boolean;
  assets: Array<{
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  }>;
};

export const pickAudioDocument = async (): Promise<AudioPickerResult> => {
  try {
    const documentPicker = await import('expo-document-picker');
    return documentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    }) as Promise<AudioPickerResult>;
  } catch (error) {
    console.error('Document picker native module is unavailable:', error);
    throw new Error('DOCUMENT_PICKER_NATIVE_MISSING');
  }
};
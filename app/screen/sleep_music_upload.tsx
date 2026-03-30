import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { musicService } from '../../api/services/musicService';
import { pickAudioDocument } from '../../utils/safeDocumentPicker';

interface MusicUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onMusicUploaded: (musicData: { name: string; uri: string; id: string }) => void;
}

export default function MusicUploadModal({
  visible,
  onClose,
  onMusicUploaded,
}: MusicUploadModalProps) {
  const { isDark } = useTheme();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePickFile = async () => {
    try {
      const result = await pickAudioDocument();

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setUploadError(null);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      if (error instanceof Error && error.message === 'DOCUMENT_PICKER_NATIVE_MISSING') {
        setUploadError('Thiếu native module expo-document-picker. Hãy rebuild app bằng expo run:android hoặc cập nhật Expo Go.');
      } else {
        setUploadError('Lỗi khi chọn tệp');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress updates (0%, 30%, 70%, 100%)
      const progressUpdates = [0, 100]; // In real scenario, use actual progress from API
      for (const progress of progressUpdates) {
        setUploadProgress(progress);
        if (progress < 100) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Upload to server
      const uploadResponse = await musicService.uploadMusic(
        selectedFile.uri,
        selectedFile.name
      );

      setUploadProgress(100);

      // Callback with uploaded music data
      onMusicUploaded({
        name: uploadResponse.fileName,
        uri: uploadResponse.fileUrl,
        id: uploadResponse.id,
      });

      // Reset and close
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Lỗi khi tải lên nhạc. Vui lòng thử lại.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? '#1e293b' : '#fff' },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#0f172a' }]}>
              Tải Nhạc Lên
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#cbd5e1' : '#94a3b8'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* File Selection Area */}
            {!selectedFile ? (
              <TouchableOpacity
                style={[
                  styles.selectArea,
                  {
                    borderColor: isDark ? '#475569' : '#cbd5e1',
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  },
                ]}
                onPress={handlePickFile}
              >
                <Ionicons name="cloud-upload-outline" size={48} color="#3b82f6" />
                <Text
                  style={[
                    styles.selectText,
                    { color: isDark ? '#cbd5e1' : '#475569' },
                  ]}
                >
                  Chọn tệp nhạc MP3
                </Text>
                <Text style={styles.selectSubtext}>
                  Nhấn để chọn từ thiết bị
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.selectedFileCard,
                  {
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    borderColor: isDark ? '#475569' : '#e2e8f0',
                  },
                ]}
              >
                <View style={styles.fileIcon}>
                  <Ionicons name="musical-notes" size={32} color="#3b82f6" />
                </View>
                <View style={styles.fileInfo}>
                  <Text
                    style={[
                      styles.fileName,
                      { color: isDark ? '#cbd5e1' : '#475569' },
                    ]}
                    numberOfLines={2}
                  >
                    {selectedFile.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFile(null);
                    setUploadError(null);
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <View style={styles.progressSection}>
                <Text
                  style={[
                    styles.progressLabel,
                    { color: isDark ? '#cbd5e1' : '#475569' },
                  ]}
                >
                  Đang tải lên: {uploadProgress}%
                </Text>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${uploadProgress}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            {/* Error Message */}
            {uploadError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.errorText}>{uploadError}</Text>
              </View>
            )}

            {/* Info Section */}
            <View style={styles.infoSection}>
              <Text
                style={[
                  styles.infoTitle,
                  { color: isDark ? '#cbd5e1' : '#475569' },
                ]}
              >
                Định dạng hỗ trợ
              </Text>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.infoText}>MP3, WAV, AAC</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.infoText}>Dung lượng tối đa: 50MB</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.infoText}>Tải lên vào AWS S3</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: isDark ? '#0f172a' : '#f1f5f9' },
              ]}
              onPress={onClose}
              disabled={isUploading}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: isDark ? '#cbd5e1' : '#475569' },
                ]}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.uploadBtn,
                {
                  opacity: !selectedFile || isUploading ? 0.5 : 1,
                  backgroundColor: isUploading ? '#94a3b8' : '#3b82f6',
                },
              ]}
              onPress={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                  <Text style={styles.uploadBtnText}>
                    {selectedFile ? 'Tải Lên' : 'Chọn Tệp'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  selectArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  selectSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  infoSection: {
    paddingVertical: 16,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  uploadBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

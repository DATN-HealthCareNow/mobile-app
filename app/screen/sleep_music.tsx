import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
import { useSleepStore } from '../../store/sleepStore';
import { musicService } from '../../api/services/musicService';
import { pickAudioDocument } from '../../utils/safeDocumentPicker';

const { width } = Dimensions.get('window');

interface MusicFile {
  id: string;
  name: string;
  uri: string;
  duration: number;
  isUploading?: boolean;
}

const normalizeMusicUrl = (rawUrl: string): string => {
  if (!rawUrl) return rawUrl;

  let normalized = rawUrl.trim();
  normalized = normalized.replace(/cnd\./gi, 'cdn.');
  normalized = normalized.replace(/pixabya/gi, 'pixabay');
  normalized = normalized.replace(/\.coim/gi, '.com');

  return normalized;
};

export default function SleepMusicScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { setMusicUrl } = useSleepStore();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicList, setMusicList] = useState<MusicFile[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<MusicFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [timerTimeout, setTimerTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  
  const PRESET_MUSIC: MusicFile[] = [
    { id: 'm1', name: 'Tiếng mưa', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 0 },
    { id: 'm2', name: 'Tiếng suối', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 0 },
    { id: 'm3', name: 'Zen 432Hz', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 0 },
    { id: 'm4', name: 'White Noise', uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', duration: 0 },
  ];

  // Load music list on mount
  useEffect(() => {
    loadMusicList();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Load uploaded music from server
  const loadMusicList = async () => {
    try {
      setIsLoading(true);
      setMusicList(PRESET_MUSIC);
    } catch (error) {
      console.error('Error loading music:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Timer logic
  const handleSetTimer = (minutes: number) => {
    if (timerTimeout) clearTimeout(timerTimeout);
    setSleepTimer(minutes);
    if (minutes > 0) {
      const timeout = setTimeout(() => {
        if (sound) sound.stopAsync();
        setIsPlaying(false);
        setSleepTimer(null);
      }, minutes * 60 * 1000);
      setTimerTimeout(timeout);
    }
  };

  // Update current time during playback
  useEffect(() => {
    if (sound && isPlaying) {
      const interval = setInterval(async () => {
        // We are not tracking duration/currentTime anymore since UI is a Mini Player
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sound, isPlaying]);

  // Play music
  const playMusic = async (uri: string) => {
    try {
      setIsLoading(true);
      const safeUri = normalizeMusicUrl(uri);

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: safeUri },
        { shouldPlay: true, progressUpdateIntervalMillis: 1000 }
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing music:', error);
      const msg = String((error as any)?.message || error || '');
      if (msg.toLowerCase().includes('unable to resolve host')) {
        alert('Link nhac bi sai host (DNS). He thong da tu sua neu la typo pho bien, vui long thu lai.');
      } else {
        alert('Lỗi khi phát nhạc');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Play/Pause
  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  // Pick and upload music file
  const pickAndUploadMusic = async () => {
    try {
      const result = await pickAudioDocument();

      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];
        const newMusic: MusicFile = {
          id: Date.now().toString(),
          name: file.name,
          uri: file.uri,
          duration: 0,
          isUploading: true,
        };

        setMusicList([...musicList, newMusic]);
        
        try {
          const uploadResponse = await musicService.uploadMusic(file.uri, file.name);
          
          const updatedMusic: MusicFile = {
            id: uploadResponse.id,
            name: uploadResponse.fileName,
            uri: normalizeMusicUrl(uploadResponse.fileUrl),
            duration: 0,
            isUploading: false,
          };
          
          setMusicList(prev => 
            prev.map(m => m.id === newMusic.id ? updatedMusic : m)
          );
          setSelectedMusic(updatedMusic);
          setMusicUrl(normalizeMusicUrl(uploadResponse.fileUrl));
          await playMusic(normalizeMusicUrl(uploadResponse.fileUrl));
        } catch (uploadError) {
          console.error('Upload failed, using local file:', uploadError);
          setMusicList(prev =>
            prev.map(m => ({ ...m, isUploading: false }))
          );
          setSelectedMusic(newMusic);
          setMusicUrl(file.uri);
          await playMusic(file.uri);
          alert('Lưu nhạc vào cloud thất bại, sử dụng bộ nhớ cục bộ');
        }
      }
    } catch (error) {
      console.error('Error picking music:', error);
      if (error instanceof Error && error.message === 'DOCUMENT_PICKER_NATIVE_MISSING') {
        alert('Thiếu native module expo-document-picker. Hãy rebuild app bằng expo run:android hoặc cập nhật Expo Go.');
      } else {
        alert('Lỗi khi chọn tệp nhạc');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#334155'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Nghe Nhạc</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 150 }}>
        <Text style={[styles.sectionTitle, { marginTop: 10, color: isDark ? '#fff' : '#0f172a' }]}>Âm thanh thư giãn</Text>
        <View style={styles.musicGrid}>
          {musicList.map((music) => (
            <TouchableOpacity
              key={music.id}
              style={[
                styles.musicCard,
                {
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderColor: selectedMusic?.id === music.id ? '#3b82f6' : 'transparent',
                  borderWidth: selectedMusic?.id === music.id ? 2 : 0,
                  opacity: music.isUploading ? 0.6 : 1,
                },
              ]}
              onPress={() => {
                if (!music.isUploading) {
                  setSelectedMusic(music);
                  setMusicUrl(music.uri);
                  playMusic(music.uri);
                }
              }}
              disabled={music.isUploading}
            >
              <View style={[styles.musicCardIcon, { backgroundColor: isDark ? '#0f172a' : '#eff6ff' }]}>
                {music.isUploading ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Ionicons 
                    name={music.name.includes('mưa') ? 'rainy' : music.name.includes('suối') ? 'water' : 'musical-notes'} 
                    size={28} color="#3b82f6" 
                  />
                )}
              </View>
              <Text style={[styles.musicName, { color: isDark ? '#fff' : '#0f172a' }]} numberOfLines={2}>
                {music.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BỘ HẸN GIỜ TẮT */}
        {selectedMusic && (
          <View style={[styles.timerSection, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <Ionicons name="timer-outline" size={24} color="#8b5cf6" style={{ marginRight: 8 }} />
              <Text style={[styles.timerTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Hẹn giờ tắt (Sleep Timer)</Text>
            </View>
            <View style={styles.timerRow}>
              {[15, 30, 60].map(mins => (
                <TouchableOpacity 
                  key={mins}
                  style={[styles.timerBtn, sleepTimer === mins && { backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }]}
                  onPress={() => handleSetTimer(mins)}
                >
                  <Text style={[styles.timerBtnText, sleepTimer === mins && { color: '#fff' }]}>{mins}p</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={styles.timerBtn}
                onPress={() => handleSetTimer(0)}
              >
                <Text style={styles.timerBtnText}>Tắt</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* MINI PLAYER (FIXED TO BOTTOM) */}
      {selectedMusic && (
        <View style={[styles.miniPlayer, { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
          <View style={styles.miniPlayerRow}>
            <View style={styles.miniPlayerIcon}>
              <Ionicons name="musical-notes" size={20} color="#3b82f6" />
            </View>
            <View style={{ flex: 1, marginRight: 15 }}>
              <Text style={[styles.miniPlayerTitle, { color: isDark ? '#fff' : '#0f172a' }]} numberOfLines={1}>{selectedMusic.name}</Text>
              <Text style={{ fontSize: 11, color: '#64748b' }}>Đang phát {sleepTimer ? `- Tắt sau ${sleepTimer}p` : ''}</Text>
            </View>
            <TouchableOpacity onPress={togglePlayPause} style={styles.miniPlayerPlayBtn}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" style={{ marginLeft: isPlaying ? 0 : 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}


      {/* Bottom Action Button */}
      {/* We no longer need the big Action Button at bottom, user can just back out */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 20,
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 20 },
  musicGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  musicCard: { width: '48%', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', elevation: 3, shadowColor: '#3b82f6', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
  musicCardIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  musicName: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  
  timerSection: { borderRadius: 20, padding: 20, marginTop: 10, elevation: 3, shadowColor: '#8b5cf6', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
  timerTitle: { fontSize: 16, fontWeight: 'bold' },
  timerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  timerBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#cbd5e1' },
  timerBtnText: { fontSize: 13, fontWeight: '600', color: '#64748b' },

  miniPlayer: { position: 'absolute', bottom: 20, left: 20, right: 20, borderRadius: 30, padding: 10, paddingHorizontal: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 15, borderWidth: 1 },
  miniPlayerRow: { flexDirection: 'row', alignItems: 'center' },
  miniPlayerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  miniPlayerTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  miniPlayerPlayBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' }
});

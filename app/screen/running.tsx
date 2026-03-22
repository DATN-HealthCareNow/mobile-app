import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { activityService } from '../../api/services/activityService';

const { width, height } = Dimensions.get('window');

// Công thức Haversine tính khoảng cách giữa 2 điểm GPS (trả về km)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

export default function RunningScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // States
  const [isRunning, setIsRunning] = useState(true); // Bắt đầu chạy ngay khi vào màn hình
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [activityId, setActivityId] = useState<string | null>(null);
  
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [routePath, setRoutePath] = useState<{latitude: number, longitude: number}[]>([]);
  
  const mapRef = useRef<MapView>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);

  // Khởi tạo GPS và lắng nghe
  useEffect(() => {
    let mounted = true;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (mounted) {
        setCurrentLocation(location.coords);
        setRoutePath([{ latitude: location.coords.latitude, longitude: location.coords.longitude }]);
        
        // Gọi API lên server để thông báo "Đã bắt đầu chạy", lấy ID về
        try {
           const act = await activityService.start({ type: "RUN", mode: "OUTDOOR" });
           if (act && act.id) setActivityId(act.id);
        } catch (e) {
           console.log("Failed to create activity on Server", e);
        }
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000, // Cập nhật mỗi 2 giây
          distanceInterval: 5, // Cập nhật mỗi 5 mét
        },
        (newLoc) => {
          if (!mounted) return;
          const { latitude, longitude } = newLoc.coords;
          
          setCurrentLocation(newLoc.coords);

          // Chỉ lưu tọa độ vẽ đường và cộng dồn khoảng cách nếu đang chạy
          setIsRunning((prevIsRunning) => {
            setIsPaused((prevIsPaused) => {
              if (prevIsRunning && !prevIsPaused) {
                setRoutePath((prevPath) => {
                  const lastPoint = prevPath[prevPath.length - 1];
                  if (lastPoint) {
                    const dist = calculateDistance(lastPoint.latitude, lastPoint.longitude, latitude, longitude);
                    if (dist > 0.005) { // Lọc nhiễu GPS (chỉ cộng nếu > 5 mét)
                      setDistanceKm((d) => d + dist);
                      return [...prevPath, { latitude, longitude }];
                    }
                  }
                  return prevPath;
                });
              }
              return prevIsPaused;
            });
            return prevIsRunning;
          });
        }
      );
      
      locationSubRef.current = subscription;
    };

    startTracking();

    return () => {
      mounted = false;
      if (locationSubRef.current) {
        locationSubRef.current.remove();
      }
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Format Thời gian (VD: 00:42:15)
  const formattedTime = useMemo(() => {
    const hrs = Math.floor(elapsedSeconds / 3600);
    const mins = Math.floor((elapsedSeconds % 3600) / 60);
    const secs = elapsedSeconds % 60;
    
    // Nếu có giờ thì gom giờ:phút, nếu ko chỉ gom phút
    const mainPart = hrs > 0 
      ? `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}` 
      : `${mins.toString().padStart(2, '0')}`;
    const subPart = `:${secs.toString().padStart(2, '0')}`;
    
    return { mainPart, subPart };
  }, [elapsedSeconds]);

  // Format Pace (Phút/Km)
  const currentPace = useMemo(() => {
    if (distanceKm === 0) return "0:00";
    const paceSeconds = elapsedSeconds / distanceKm;
    const pMins = Math.floor(paceSeconds / 60);
    const pSecs = Math.floor(paceSeconds % 60);
    return `${pMins}:${pSecs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds, distanceKm]);


  // Handlers
  const handleTogglePause = () => setIsPaused(!isPaused);
  
  const handleStop = async () => {
    setIsRunning(false);
    setIsPaused(true);
    
    let snapshotUri = "";
    try {
       if (mapRef.current) {
          snapshotUri = await mapRef.current.takeSnapshot({
            width: width,
            height: height * 0.55,
            format: 'png',
            quality: 0.9,
            result: 'file'
          });
       }
    } catch (e) {
       console.log("Snapshot failed", e);
    }

    // Tính toán tạm calories: giả sử 1km = trung bình 65 kcal
    const caloriesBurned = Math.round(distanceKm * 65);

    // Chuyển sang màn hình Tổng kết thay vì hiện Alert
    router.replace({
      pathname: "/screen/run_summary",
      params: {
        activityId: activityId || "",
        distance: distanceKm.toFixed(2),
        pace: currentPace,
        time: elapsedSeconds.toString(),
        calories: caloriesBurned.toString(),
        mapImageUri: snapshotUri
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* 1. MAP VIEW OVERLAY (Nửa trên) */}
      <View style={styles.mapContainer}>
        {currentLocation ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={false}
            followsUserLocation={true}
          >
            {/* Đường Route màu xanh */}
            <Polyline
              coordinates={routePath}
              strokeColor="#0ea5e9"
              strokeWidth={6}
              lineJoin="round"
              lineCap="round"
            />
            {/* Chấm tròn Vị trí hiện tại */}
            <Marker coordinate={currentLocation}>
              <View style={styles.markerContainer}>
                <View style={styles.markerDot} />
                <View style={styles.markerRing} />
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#e2e8f0' }]} />
        )}

        {/* 2. FLOATING HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#334155" />
          </TouchableOpacity>

          <View style={styles.gpsPill}>
             <View style={styles.gpsDot} />
             <Text style={styles.gpsText}>GPS ACTIVE</Text>
          </View>

          <TouchableOpacity style={styles.circleBtn}>
            <Ionicons name="settings-sharp" size={20} color="#0284c7" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. BOTTOM CONTROL CARD (Nửa dưới) */}
      <View style={[styles.bottomCard, { backgroundColor: isDark ? colors.card : '#ffffff' }]}>
        <View style={styles.dragIndicator} />

        <Text style={styles.elapsedLabel}>ELAPSED TIME</Text>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeMain, { color: isDark ? colors.text : '#0369a1' }]}>
            {hrsPart(formattedTime.mainPart)}
          </Text>
          <Text style={[styles.timeSub, { color: isDark ? colors.text : '#0369a1' }]}>
            {formattedTime.subPart}
          </Text>
        </View>

        {/* METRICS ROW */}
        <View style={styles.metricsRow}>
          {/* Cột Distance */}
          <View style={[styles.metricBox, isDark && { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={styles.metricLabelRow}>
               <MaterialCommunityIcons name="ruler" size={16} color="#0ea5e9" />
               <Text style={styles.metricLabel}>DISTANCE</Text>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, { color: isDark ? colors.text : '#0369a1' }]}>
                  {distanceKm.toFixed(2)}
              </Text>
              <Text style={styles.metricUnit}> km</Text>
            </View>
          </View>

          {/* Cột Pace */}
          <View style={[styles.metricBox, isDark && { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={styles.metricLabelRow}>
               <MaterialCommunityIcons name="speedometer" size={16} color="#0ea5e9" />
               <Text style={styles.metricLabel}>AVG PACE</Text>
            </View>
            <View style={styles.metricValueRow}>
              <Text style={[styles.metricValue, { color: isDark ? colors.text : '#0369a1' }]}>
                  {currentPace}
              </Text>
              <Text style={styles.metricUnit}> /km</Text>
            </View>
          </View>
        </View>

        {/* BUTTONS ROW */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <View style={styles.stopIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.pauseButton, isPaused && { backgroundColor: '#10b981' }]} onPress={handleTogglePause}>
            <Ionicons name={isPaused ? "play" : "pause"} size={28} color="#fff" />
            <Text style={styles.pauseText}>{isPaused ? "RESUME RUN" : "PAUSE RUN"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Giúp fix rendering giờ
const hrsPart = (mainP: string) => {
    // Để giữ design gốc, nếu có 1 số 0 ở đầu sẽ render ra ví dụ 00:42. 
    return mainP.length === 2 ? `00:${mainP}` : mainP;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: '55%',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  gpsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981', // green
    marginRight: 8,
  },
  gpsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0ea5e9', // lighter blue
    letterSpacing: 1,
  },
  markerContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0284c7', // Muted Blue like map
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,
  },
  markerRing: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(2, 132, 199, 0.2)', // Outer glow
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '48%', 
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  dragIndicator: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1', // slate-300
    marginBottom: 24,
  },
  elapsedLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#64748b', // slate-500
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline', // Căn chỉnh nhỏ to nằm chung chân
    marginBottom: 24,
  },
  timeMain: {
    fontSize: 72,
    fontWeight: 'bold',
    letterSpacing: -2,
    lineHeight: 80,
  },
  timeSub: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  metricBox: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0ea5e9',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffe4e6', // rose-100
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    width: 14,
    height: 14,
    backgroundColor: '#f43f5e', // rose-500
    borderRadius: 3,
  },
  pauseButton: {
    flex: 1,
    flexDirection: 'row',
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0284c7', // sky-600
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  pauseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 8,
  },
});

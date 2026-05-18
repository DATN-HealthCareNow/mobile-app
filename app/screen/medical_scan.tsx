import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { axiosClient } from "../../api/axiosClient";
import { scheduleService } from "../../api/services/scheduleService";
import PremiumUpgradeModal from "../../components/PremiumUpgradeModal";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useSession } from "../../hooks/useAuth";
import { useScheduleStore } from "../../store/scheduleStore";

interface MedicationInfo {
  name: string;
  dosage?: string;
  duration?: string;
  duration_days?: number;
  note: string;
  schedules?: { time: string; dosage: string }[];
}

interface AnalysisResult {
  diagnosis?: string;
  medications?: MedicationInfo[];
  forbidden_foods?: string[];
  error?: string;
}

export default function MedicalScanScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const { token, userId } = useSession();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [scanQuotaExceeded, setScanQuotaExceeded] = useState(false);

  const [savingRecordId, setSavingRecordId] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const params = useLocalSearchParams();
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(
    (params.expandRecordId as string) || null,
  );
  const {
    schedules: allSchedules,
    deleteSchedules,
    loadSchedules,
  } = useScheduleStore();

  const fetchHistory = async () => {
    try {
      const response = await axiosClient.get("/api/v1/medical-records");
      const list = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setHistory(list);
    } catch (err) {
      console.log("Error fetching history:", err);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const pickImage = async (useCamera = false) => {
    let pickerResult;

    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          t("medical.permission", "Permission"),
          t(
            "medical.camera_permission_msg",
            "Camera permission is required to take photos.",
          ),
        );
        return;
      }
      pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
    } else {
      pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
    }

    if (
      !pickerResult.canceled &&
      pickerResult.assets &&
      pickerResult.assets.length > 0
    ) {
      const uri = pickerResult.assets[0].uri;
      setImageUri(uri);
      analyzeImage(uri);
    }
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const filename = uri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      const formData = new FormData();
      // @ts-ignore
      formData.append("file", { uri, name: filename, type });

      const response = await fetch(
        `${axiosClient.defaults.baseURL}/api/v1/bff/mobile/medical/scan`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : "",
            "x-user-id": userId || "",
          },
        },
      );

      if (response.status === 403) {
        setScanQuotaExceeded(true);
        setIsAnalyzing(false);
        return;
      }

      const data = await response.json();

      let parsedResult: AnalysisResult;
      if (typeof data.ai_response === "string") {
        try {
          const jsonStr = data.ai_response.replace(/```json|```/g, "").trim();
          parsedResult = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Parse AI string failed", e);
          Alert.alert(
            t("medical.parse_error", "Parse Error"),
            t("medical.parse_error", "Không thể parse JSON từ server"),
          );
          setIsAnalyzing(false);
          return;
        }
      } else {
        parsedResult = data.ai_response;
      }

      if (
        !parsedResult.diagnosis &&
        (!parsedResult.medications || parsedResult.medications.length === 0)
      ) {
        Alert.alert(
          t("medical.unknown_title", "Could not recognize"),
          t(
            "medical.unknown_msg",
            "AI không thể phân tích được hình ảnh này. Vui lòng chụp lại ảnh rõ hơn (đủ ánh sáng, không bị mờ, đúng góc chụp đơn thuốc).",
          ),
          [
            {
              text: t("medical.retake", "Retake"),
              onPress: () => setImageUri(null),
            },
            { text: t("medical.close", "Close") },
          ],
        );
        setIsAnalyzing(false);
        return;
      }

      setResult(parsedResult);
    } catch (error) {
      console.error("Scan failed:", error);
      Alert.alert(
        t("medical.error", "AI Error"),
        t(
          "medical.send_error",
          "Failed to send image to AI server. Please try again.",
        ),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndSchedule = async () => {
    if (!result) return;
    setIsAnalyzing(true);

    try {
      const saveResp = await axiosClient.post("/api/v1/medical-records", {
        diagnosis:
          result.diagnosis || t("medical.default_title", "Medical Record"),
        medications: result.medications || [],
        forbidden_foods: result.forbidden_foods || [],
        image_url: imageUri,
      });

      const savedRecord = saveResp.data;

      // Notification Permission
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          t("medical.notice", "Notification Permission"),
          t(
            "medical.notif_permission_msg",
            "Record saved, but please enable notifications to receive medication reminders.",
          ),
        );
      }

      // Create unified schedule on server
      const medications = result.medications || [];
      const timeSet = new Set<string>();
      medications.forEach((med) => {
        if (med.schedules && Array.isArray(med.schedules)) {
          med.schedules.forEach((s) => {
            if (s.time) timeSet.add(s.time);
          });
        }
      });
      const uniqueTimes = Array.from(timeSet);
      let scheduleCount = 0;

      if (uniqueTimes.length > 0) {
        try {
          await scheduleService.createSchedule({
            title: t("home.medication", "Medication"),
            schedule_type: "RECURRING",
            start_date: new Date().toISOString(),
            reminder_enabled: true,
            source_id: savedRecord.id,
            diagnosis: result.diagnosis || t("medical.default_title", "Medical Record"),
            medications: medications,
            recurrence_config: {
              repeat_days: [0, 1, 2, 3, 4, 5, 6],
              reminder_times: uniqueTimes,
              reminder_time: uniqueTimes[0],
            },
          });

          // Schedule Local Notifications for each medicine
          for (const med of medications) {
            let medSchedules = med.schedules && med.schedules.length > 0 ? med.schedules : [];
            
            // Fallback logic for frequency if empty
            if (medSchedules.length === 0) {
              const note = (med.note || "").toLowerCase();
              const dosage = (med.dosage || "").toLowerCase();
              if (note.includes("2 lần") || dosage.includes("2 lần")) {
                medSchedules = [{ time: "08:00", dosage: med.dosage || "" }, { time: "20:00", dosage: med.dosage || "" }];
              } else if (note.includes("3 lần") || dosage.includes("3 lần")) {
                medSchedules = [{ time: "08:00", dosage: med.dosage || "" }, { time: "13:00", dosage: med.dosage || "" }, { time: "20:00", dosage: med.dosage || "" }];
              } else {
                medSchedules = [{ time: "08:00", dosage: med.dosage || "" }];
              }
            }

            for (const sched of medSchedules) {
              const [hour, minute] = sched.time.split(":").map(Number);
              const dosageText = sched.dosage || med.dosage || "";
              
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: t("medical.notif_title", "💊 Medication Reminder"),
                  body: t("medical.notif_body", "It's time to take {name} ({dosage})")
                    .replace("{name}", med.name)
                    .replace("{dosage}", dosageText || t("medical.unit_dose", "1 dose")),
                  data: { screen: 'medication_schedule', recordId: savedRecord.id },
                  sound: true,
                  priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                  type: 'daily',
                  hour,
                  minute,
                  repeats: true,
                } as any,
              });
            }
          }
          scheduleCount = medications.length;
        } catch (e) {
          console.log("Failed to create unified schedule", e);
        }
      }

      if (scheduleCount === 0) {
        Alert.alert(
          t("medical.notice", "Notice"),
          t("medical.no_meds_schedule", "No medications found to schedule."),
        );
      } else {
        Alert.alert(
          t("auth.verify_register.success_title", "Success"),
          t(
            "medical.save_success",
            "Medical record saved and reminders created for {count} medications!",
          ).replace("{count}", scheduleCount.toString()),
        );
      }

      setResult(null);
      setImageUri(null);
      fetchHistory();
      loadSchedules(); // Refresh local store
    } catch (error) {
      console.error("Failed to save record:", error);
      Alert.alert(
        t("medical.error", "Error"),
        t("medical.save_error", "Could not save record or create reminders."),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createRemindersForRecord = async (
    record: any,
  ) => {
    const recordId = record.id;
    const medications = record.medications || [];
    const timeSet = new Set<string>();
    medications.forEach((med: any) => {
      if (med.schedules && Array.isArray(med.schedules)) {
        med.schedules.forEach((s: any) => {
          if (s.time) timeSet.add(s.time);
        });
      }
    });
    const uniqueTimes = Array.from(timeSet);
    let count = 0;

    if (uniqueTimes.length > 0) {
      try {
        await scheduleService.createSchedule({
          title: t("home.medication", "Medication"),
          schedule_type: "RECURRING",
          start_date: new Date().toISOString(),
          reminder_enabled: true,
          source_id: recordId,
          diagnosis: record.diagnosis || t("medical.default_title", "Medical Record"),
          medications: medications,
          recurrence_config: {
            repeat_days: [0, 1, 2, 3, 4, 5, 6],
            reminder_times: uniqueTimes,
            reminder_time: uniqueTimes[0],
          },
        });

        // Schedule Local Notifications for each medicine
        for (const med of medications) {
          let medSchedules = med.schedules && med.schedules.length > 0 ? med.schedules : [];
          
          // Fallback logic for frequency if empty
          if (medSchedules.length === 0) {
            const note = (med.note || "").toLowerCase();
            const dosage = (med.dosage || "").toLowerCase();
            if (note.includes("2 lần") || dosage.includes("2 lần")) {
              medSchedules = [{ time: "08:00", dosage: med.dosage || "" }, { time: "20:00", dosage: med.dosage || "" }];
            } else if (note.includes("3 lần") || dosage.includes("3 lần")) {
              medSchedules = [{ time: "08:00", dosage: med.dosage || "" }, { time: "13:00", dosage: med.dosage || "" }, { time: "20:00", dosage: med.dosage || "" }];
            } else {
              medSchedules = [{ time: "08:00", dosage: med.dosage || "" }];
            }
          }

          for (const sched of medSchedules) {
            const [hour, minute] = sched.time.split(":").map(Number);
            const dosageText = sched.dosage || med.dosage || "";
            
            await Notifications.scheduleNotificationAsync({
              content: {
                title: t("medical.notif_title", "💊 Medication Reminder"),
                body: t("medical.notif_body", "It's time to take {name} ({dosage})")
                  .replace("{name}", med.name)
                  .replace("{dosage}", dosageText || t("medical.unit_dose", "1 dose")),
                data: { screen: 'medication_schedule', recordId },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
              },
              trigger: {
                type: 'daily',
                hour,
                minute,
                repeats: true,
              } as any,
            });
          }
        }
        count = medications.length;
      } catch (e) {
        console.log("Failed to create unified schedule", e);
      }
    }
    return count;
  };

  const toggleReminders = async (record: any) => {
    const relatedSchedules = allSchedules.filter((s) => s.sourceId === record.id);
    const isEnabled = relatedSchedules.length > 0;

    if (isEnabled) {
      // Disable: Delete all
      try {
        await deleteSchedules(relatedSchedules.map((s) => s.id));
        Alert.alert(t("medical.notice"), t("medical.reminders_disabled"));
      } catch (err) {
        Alert.alert(t("medical.error"), t("medical.expire_error"));
      }
    } else {
      // Enable: Create
      const count = await createRemindersForRecord(
        record
      );
      if (count > 0) {
        Alert.alert(t("auth.verify_register.success_title"), t("medical.reminders_enabled"));
      } else {
        Alert.alert(t("medical.notice"), t("medical.no_meds_schedule"));
      }
    }
    loadSchedules();
  };

  const handleExpire = async (recordId: string) => {
    Alert.alert(
      t("medical.confirm", "Confirm"),
      t(
        "medical.expire_confirm_msg",
        "Mark this record as expired/recovered?",
      ),
      [
        { text: t("medical.cancel_action", "Cancel"), style: "cancel" },
        {
          text: t("medical.confirm", "Confirm"),
          onPress: () => updateStatus(recordId, "EXPIRED"),
        },
      ],
    );
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axiosClient.post(`/api/v1/medical-records/${id}/status`, {
        status,
      });

      if (status === "EXPIRED") {
        // Find and delete related schedules
        const relatedSchedules = allSchedules.filter((s) => s.sourceId === id);
        if (relatedSchedules.length > 0) {
          await deleteSchedules(relatedSchedules.map((s) => s.id));
        }
        Alert.alert(
          t("medical.notice", "Notice"),
          t(
            "medical.expire_success",
            "Record expired and all reminders cleaned up.",
          ),
        );
      }

      fetchHistory();
      loadSchedules();
    } catch (error) {
      Alert.alert(
        t("medical.error", "Error"),
        t(
          "medical.expire_error",
          "Could not fully update status or clean up reminders.",
        ),
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("medical.scan_title", "Scan Medical Record")}
          </Text>
          <Text style={styles.headerSub}>
            {t("medical.ai_feature_name", "AI Medical Scan")}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Scan Module */}
        <View
          style={[
            styles.scanModule,
            { backgroundColor: isDark ? colors.card : "#fff" },
          ]}
        >
          <View style={styles.previewBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.emptyPreview}>
                <MaterialCommunityIcons
                  name="image-search-outline"
                  size={60}
                  color="#94a3b8"
                />
                <Text style={styles.emptyPreviewText}>
                  {t("medical.no_image", "No image selected")}
                </Text>
              </View>
            )}
            {isAnalyzing && (
              <View style={styles.analyzingOverlay}>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={styles.analyzingText}>
                  {t("medical.analyzing", "AI is analyzing records...")}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.galleryBtn]}
              onPress={() => pickImage(false)}
            >
              <Ionicons name="images" size={20} color="#0ea5e9" />
              <Text style={styles.galleryBtnText}>
                {t("medical.gallery", "Gallery")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cameraBtn]}
              onPress={() => pickImage(true)}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.cameraBtnText}>
                {t("medical.take_photo", "Take Photo")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Result View */}
        {result && (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: isDark ? "#1e293b" : "#f8fafc" },
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons name="sparkles" size={20} color="#0ea5e9" />
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                {t("medical.diagnosis", "Diagnosis")}
              </Text>
            </View>
            <Text style={[styles.diagnosisText, { color: colors.text }]}>
              {result.diagnosis || t("medical.default_title", "Medical record")}
            </Text>

            <Text style={styles.resultLabel}>
              {t(
                "medical.medications_count",
                "Prescribed Medications ({count})",
              ).replace(
                "{count}",
                (result.medications?.length || 0).toString(),
              )}
            </Text>
            {result.medications?.map((med, idx) => (
              <View key={idx} style={styles.medCard}>
                <View style={styles.medCardHeader}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                </View>
                {med.schedules && (
                  <View style={styles.medTimeRow}>
                    <Text style={styles.medTimeLabel}>
                      {t("medical.medication_times", "Medication Times:")}
                    </Text>
                    <View style={styles.timePills}>
                      {med.schedules.map((s, si) => (
                        <View key={si} style={styles.timePill}>
                          <Text style={styles.timePillText}>{s.time}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}

            {result.forbidden_foods && result.forbidden_foods.length > 0 && (
              <>
                <Text style={styles.resultLabel}>
                  {t("medical.forbidden_foods_list", "Forbidden Food List")}
                </Text>
                <View style={styles.foodBadges}>
                  {result.forbidden_foods.map((food, idx) => (
                    <View key={idx} style={styles.foodBadge}>
                      <Text style={styles.foodBadgeText}>{food}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveAndSchedule}
            >
              <Text style={styles.saveBtnText}>
                {t("medical.schedule_reminders", "Schedule Reminders")}
              </Text>
              <Ionicons
                name="calendar"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("medical.history", "Medical History")}
          </Text>
          {history.map((record) => {
            const isExpanded = expandedRecordId === record.id;
            return (
              <View
                key={record.id}
                style={[
                  styles.recordCard,
                  {
                    backgroundColor: isDark ? colors.card : "#fff",
                    opacity: record.status === "EXPIRED" ? 0.7 : 1,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.recordHeader}
                  onPress={() =>
                    setExpandedRecordId(isExpanded ? null : record.id)
                  }
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.recordDiagnosis, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {record.diagnosis}
                    </Text>
                    <View style={styles.recordStatusRow}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              record.status === "ACTIVE"
                                ? "#10b981"
                                : "#94a3b8",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              record.status === "ACTIVE"
                                ? "#10b981"
                                : "#94a3b8",
                          },
                        ]}
                      >
                        {record.status === "ACTIVE"
                          ? t("medical.active_medication", "Active Medication")
                          : t("medical.expired_label", "Expired")}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.clockBox,
                      record.status === "EXPIRED" && {
                        backgroundColor: "rgba(148, 163, 184, 0.1)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="time"
                      size={22}
                      color={record.status === "ACTIVE" ? "#10b981" : "#94a3b8"}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.recordDetail}>
                    <View style={styles.divider} />

                    <View style={styles.recordActionsContainer}>
                      <View style={styles.recordActionRow}>
                        <TouchableOpacity
                          style={[
                            styles.btnAction,
                            allSchedules.some((s) => s.sourceId === record.id)
                              ? styles.btnDisable
                              : styles.btnEnable,
                          ]}
                          onPress={() => toggleReminders(record)}
                        >
                          <Ionicons
                            name={
                              allSchedules.some((s) => s.sourceId === record.id)
                                ? "notifications-off"
                                : "notifications"
                            }
                            size={18}
                            color="#fff"
                          />
                          <Text style={styles.btnActionText}>
                            {allSchedules.some((s) => s.sourceId === record.id)
                              ? t("medical.disable", "Disable")
                              : t("medical.enable", "Enable")}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.btnAction, styles.btnExpire]}
                          onPress={() => handleExpire(record.id)}
                          disabled={record.status === "EXPIRED"}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#fff"
                          />
                          <Text style={styles.btnActionText}>
                            {t("medical.expire_btn", "Expire")}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={styles.btnDetails}
                        onPress={() =>
                          router.push({
                            pathname: "/screen/medication_schedule",
                            params: { recordId: record.id },
                          })
                        }
                      >
                        <Ionicons name="calendar" size={18} color="#10b981" />
                        <Text style={styles.btnDetailsText}>
                          {t("medical.details", "Details")}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.actionDivider} />

                      <TouchableOpacity
                        style={styles.btnForbidden}
                        onPress={() =>
                          router.push({
                            pathname: "/screen/forbidden_foods",
                            params: { recordId: record.id },
                          })
                        }
                      >
                        <Ionicons name="restaurant" size={18} color="#f43f5e" />
                        <Text style={styles.btnForbiddenText}>
                          {t("medical.forbidden_foods_btn")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <PremiumUpgradeModal
        visible={scanQuotaExceeded}
        onClose={() => setScanQuotaExceeded(false)}
        featureName={t("medical.ai_feature_name", "AI Medical Scan")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.02)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  headerSub: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },

  scanModule: { margin: 20, padding: 20, borderRadius: 24, elevation: 2 },
  previewBox: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  emptyPreview: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyPreviewText: { color: "#94a3b8", marginTop: 10, fontWeight: "600" },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  analyzingText: { marginTop: 12, color: "#0ea5e9", fontWeight: "700" },

  btnRow: { flexDirection: "row" },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  galleryBtn: { marginRight: 10, borderWidth: 1, borderColor: "#0ea5e9" },
  galleryBtnText: { marginLeft: 8, color: "#0ea5e9", fontWeight: "700" },
  cameraBtn: { backgroundColor: "#0ea5e9" },
  cameraBtnText: { marginLeft: 8, color: "#fff", fontWeight: "700" },

  resultCard: { margin: 20, marginTop: 0, padding: 20, borderRadius: 24 },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: { fontSize: 16, fontWeight: "700", marginLeft: 8 },
  diagnosisText: { fontSize: 18, fontWeight: "800", marginBottom: 20 },
  resultLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  medCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  medCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  medName: { fontSize: 16, fontWeight: "700", flex: 1 },
  medDosage: { fontSize: 14, color: "#0ea5e9", fontWeight: "600" },
  medTimeRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  medTimeLabel: { fontSize: 11, color: "#94a3b8", marginBottom: 6 },
  timePills: { flexDirection: "row", flexWrap: "wrap" },
  timePill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  timePillText: { fontSize: 11, fontWeight: "700", color: "#64748b" },

  foodBadges: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  foodBadge: {
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  foodBadgeText: { color: "#f43f5e", fontSize: 12, fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#10b981",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  historySection: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 16 },
  recordCard: { borderRadius: 20, marginBottom: 16, padding: 16, elevation: 1 },
  recordHeader: { flexDirection: "row", alignItems: "center" },
  recordDiagnosis: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 6,
    lineHeight: 24,
  },
  recordStatusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  clockBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  recordDetail: { marginTop: 20 },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 16,
  },
  recordActionsContainer: {
    marginTop: 10,
  },
  recordActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  btnAction: {
    flex: 0.48,
    height: 48,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnDisable: {
    backgroundColor: "#f43f5e",
  },
  btnEnable: {
    backgroundColor: "#10b981",
  },
  btnExpire: {
    backgroundColor: "#64748b",
  },
  btnActionText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 14,
  },
  btnDetails: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  btnDetailsText: {
    color: "#10b981",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 14,
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginBottom: 20,
  },
  btnForbidden: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnForbiddenText: {
    color: "#f43f5e",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 14,
  },
});

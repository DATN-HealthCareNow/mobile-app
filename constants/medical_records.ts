export const SAMPLE_MEDICAL_RECORD_VI = {
  _id: "65b2c3d4e5f6a7b8c9d002",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  record_type: "GENERAL_CHECKUP",
  title: "Khám sức khỏe tổng quát định kỳ",
  clinical_notes: "Sức khỏe tốt, cần chú ý bổ sung thêm Vitamin D.",
  icd_codes: ["Z00.0", "E55.9"],
  audit_log: {
    created_by: "Dr. Tran Van B",
    last_accessed_at: "2026-01-22T14:00:00.000Z",
    access_count: 3,
  },
  metadata: {
    doctor_name: "Tran Van B",
    doctor_license: "CCHN-123456",
    clinic: "Bệnh viện Đại học Y Dược",
    clinic_address: "215 Hồng Bàng, Quận 5, TP.HCM",
    date: "2026-01-15T09:00:00.000Z",
    next_appointment: "2026-07-15T09:00:00.000Z",
  },
  files: [
    {
      file_id: "65c3d4e5f6a7b8c9d003",
      filename: "xray_chest.jpg",
      s3_url: "https://s3.amazonaws.com/healthcarenow/records/xray_chest.jpg",
      file_type: "IMAGE/JPEG",
      size_bytes: 2048576,
      uploaded_at: "2026-01-15T10:00:00.000Z",
      ai_processed: true,
      ai_analysis_id: "65d4e5f6a7b8c9d004",
    },
  ],
  sharing: {
    shared_with: [{ user_id: "65e5f6a7b8c9d005", access: "READ" }],
    requires_consent: true,
  },
};

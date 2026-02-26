export const SAMPLE_PRESCRIPTION = {
  _id: "658e9f0a1b2c3d",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  medical_record_id: "65b2c3d4e5f6a7b8c9d002",
  prescription_code: "PRES-2026-001",
  issued_date: "2026-01-15T10:00:00.000Z",
  expiry_date: "2026-02-15T10:00:00.000Z",
  refills_remaining: 2,
  status: "ACTIVE",
  medications: [
    {
      name: "Paracetamol",
      generic_name: "Acetaminophen",
      dosage: "500mg",
      frequency: "2 lần/ngày",
      route: "Uống sau ăn",
      duration_days: 7,
      indication: "Giảm đau, hạ sốt",
      side_effects: ["Buồn nôn", "Phát ban"],
    },
  ],
};

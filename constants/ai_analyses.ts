export const ANALYSIS_EXAMPLE = {
  _id: "65d4e5f6a7b8c9d004",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  analysis_type: "MEDICAL_IMAGE_OCR",
  source_id: "65c3d4e5f6a7b8c9d003",
  source_collection: "medical_records.files",
  model_used: "Gemini-1.5-Pro",
  confidence_threshold: 0.95,
  status: "SUCCESS",
  consent_snapshot: {
    granted: true,
    granted_at: "2026-01-15T09:55:00.000Z",
    scope: ["OCR", "DIAGNOSIS_SUGGESTION"],
  },
  results: {
    findings: [
      { key: "Heart Size", value: "Normal" },
      { key: "Lungs", value: "Clear" },
    ],
    urgency: "LOW",
  },
};

export const ML_MODEL_SAMPLE = {
  _id: "65ff11223344556677889900",
  model_name: "skin-lesion-classifier",
  version: "v1.3.0",
  s3_model_path:
    "s3://health-ai-models/skin-lesion-classifier/v1.3.0/model.bin",
  deployment_status: "ACTIVE",
  performance_metrics: {
    accuracy: 0.93,
    precision: 0.91,
    recall: 0.89,
  },
};

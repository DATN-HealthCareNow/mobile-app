export const SAMPLE_USER_DATA = {
  _id: "65a1b2c3d4e5f6a7b8c9d001",
  email: "danhomo.nguyen@example.com",
  password_hash: "$2b$12$VQ7...",
  status: "ACTIVE",
  deleted_at: null,
  profile: {
    full_name: "Nguyen Cong Danh",
    date_of_birth: "2002-07-14T00:00:00.000Z",
    gender: "MALE",
    height_cm: 175,
    weight_kg: 70,
    created_at: "2026-01-01T08:00:00.000Z",
    updated_at: "2026-01-20T10:30:00.000Z",
  },
  privacy_settings: {
    data_sharing: true,
    marketing_emails: false,
  },
  emergency_contacts: [
    {
      name: "Nguyen Van A",
      email: "vana@example.com",
      phone: "0901234567",
      priority: 1,
      verified: true,
    },
  ],
};

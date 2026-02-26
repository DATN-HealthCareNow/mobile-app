export const MOCK_NOTIFICATION = {
  _id: "655b6c7d8e9f0a",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  type: "PUSH",
  title: "Nhắc nhở uống nước",
  content: "Đã 2 giờ bạn chưa uống nước, hãy bổ sung thêm 250ml nhé!",
  status: "SENT",
  provider_resp: "fcm_token_success_123",
  created_at: "2026-01-22T14:00:00.000Z",
};

export const NOTIFICATION_TEMPLATE_WELCOME = {
  _id: "655b6c7d8e9f0b",
  code: "WELCOME",
  subject_template: "Chào mừng bạn đến với HealthCareNow",
  body_template:
    "Xin chào {{full_name}}, hãy bắt đầu theo dõi sức khỏe cùng chúng tôi!",
};

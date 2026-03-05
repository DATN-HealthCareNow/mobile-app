export const SAMPLE_MEAL_DATA_VI = {
  _id: "651d2e3f4a5b6c",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  timestamp: "2026-01-22T12:30:00.000Z",
  meal_type: "LUNCH",
  photo_url: "https://s3.amazonaws.com/healthcarenow/meals/lunch_2201.jpg",
  ai_analysis_id: "652e3f4a5b6c7d",
  food_items: [
    {
      name: "Ức gà áp chảo",
      quantity_g: 200,
      calories: 330.0,
      protein_g: 62.0,
      fat_g: 7.0,
      carbs_g: 0.0,
      fiber_g: 0.0,
      ai_confidence: 0.98,
    },
    {
      name: "Gạo lứt",
      quantity_g: 150,
      calories: 165.0,
      protein_g: 3.5,
      fat_g: 1.2,
      carbs_g: 35.0,
      fiber_g: 2.5,
      ai_confidence: 0.95,
    },
  ],
  total_nutrition: {
    calories: 495.0,
    protein_g: 65.5,
    fat_g: 8.2,
    carbs_g: 35.0,
    fiber_g: 2.5,
  },
};

export const SAMPLE_AI_MEAL_PLAN = {
  id: "plan_001",
  target_calories: 2200,
  target_protein: 150,
  target_carbs: 200,
  target_fat: 65,
  meals: [
    {
      type: "Breakfast",
      time: "07:30 AM",
      name: "Oatmeal & Boiled Eggs",
      calories: 450,
      description:
        "A solid mix of slow-digesting carbs and high-quality protein.",
    },
    {
      type: "Lunch",
      time: "12:30 PM",
      name: "Grilled Chicken Salad",
      calories: 550,
      description: "High protein, rich in fiber, and packed with vitamins.",
    },
    {
      type: "Dinner",
      time: "07:00 PM",
      name: "Salmon with Brown Rice",
      calories: 600,
      description:
        "Heart-healthy fats, complex carbs, and protein for recovery.",
    },
  ],
  ai_note:
    "Based on your goal to build muscle while maintaining a lean physique, I designed this high-protein, moderate-carb meal plan. Stay hydrated!",
};

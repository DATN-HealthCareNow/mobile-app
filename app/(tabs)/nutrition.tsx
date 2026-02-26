import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FOOD_SAMPLE } from "@/constants/food";
import { SAMPLE_MEAL_DATA_VI } from "@/constants/meals";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet } from "react-native";

export default function NutritionScreen() {
  const meal = SAMPLE_MEAL_DATA_VI;
  const food = FOOD_SAMPLE;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#FFF3E0", dark: "#3A2A0F" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.section}>
        <ThemedText type="title">Today's Meal</ThemedText>
        <ThemedText>
          {meal.meal_type} at {new Date(meal.timestamp).toLocaleTimeString()}
        </ThemedText>
        <ThemedText>
          Total: {meal.total_nutrition.calories} kcal • P{" "}
          {meal.total_nutrition.protein_g} • C {meal.total_nutrition.carbs_g} •
          F {meal.total_nutrition.fat_g}
        </ThemedText>
        <ThemedText type="subtitle" style={{ marginTop: 6 }}>
          Items
        </ThemedText>
        {meal.food_items.map((f, i) => (
          <ThemedText key={i}>
            • {f.name} — {f.quantity_g}g ({f.calories} kcal)
          </ThemedText>
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="title">Food Database</ThemedText>
        <ThemedText>
          {food.name} ({food.brand}) • {food.serving_size_g}g
        </ThemedText>
        <ThemedText>
          Per 100g: {food.nutrition_per_100g.calories} kcal • P{" "}
          {food.nutrition_per_100g.protein_g} • C{" "}
          {food.nutrition_per_100g.carbs_g} • F {food.nutrition_per_100g.fat_g}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6, marginBottom: 16 },
  headerImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../../context/ThemeContext";

function AnimatedIcon({ focused, children }: any) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(focused ? 1.2 : 1.1) },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          height: 92,
          paddingBottom: 24,
          paddingTop: 8,
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 32,
          backgroundColor: colors.tabBar,
          borderTopWidth: 0,
          elevation: 8, // Tăng elevation để Android có bóng đổ rõ hơn
          shadowColor: "#0b3f64",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused}>
              <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
            </AnimatedIcon>
          ),
        }}
      />

      {/* ACTIVITY */}
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused}>
              <Ionicons name={focused ? "pulse" : "pulse-outline"} size={22} color={color} />
            </AnimatedIcon>
          ),
        }}
      />

      {/* AI CENTER FLOAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: "absolute",
                bottom: 2,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: 31,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: colors.primary,
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  elevation: 8,
                  borderWidth: 5,
                  borderColor: colors.tabBar,
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={26} color="white" />
              </View>
            </View>
          ),
        }}
      />

      {/* ANALYSIS */}
      <Tabs.Screen
        name="analysis"
        options={{
          title: "Analysis",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused}>
              <MaterialIcons name="description" size={24} color={color} />
            </AnimatedIcon>
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <AnimatedIcon focused={focused}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            </AnimatedIcon>
          ),
        }}
      />
    </Tabs>
  );
}
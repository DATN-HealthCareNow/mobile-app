import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
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
          height: 80,
          paddingBottom: 20,
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -4,
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

      {/* AI CENTER FLOAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: colors.primary,
                  shadowOpacity: 0.4,
                  shadowRadius: 10,
                  elevation: 8,
                  borderWidth: 4,
                  borderColor: colors.background,
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={26} color="white" />
              </View>
            </View>
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
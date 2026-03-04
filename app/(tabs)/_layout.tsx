import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

function AnimatedIcon({ focused, children }: any) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(focused ? 1.2 : 1) },
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#0ea5e9",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          height: 75,
          paddingBottom: 10,
          backgroundColor: "white",
          borderTopWidth: 0,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -4,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon focused={focused}>
              <Ionicons name="home" size={size} color={color} />
            </AnimatedIcon>
          ),
        }}
      />

      {/* ACTIVITY */}
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon focused={focused}>
              <Ionicons name="pulse" size={size} color={color} />
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
                  width: 65,
                  height: 65,
                  borderRadius: 35,
                  backgroundColor: "#0ea5e9",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#0ea5e9",
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 10,
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={28} color="white" />
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
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon focused={focused}>
              <MaterialIcons name="description" size={size} color={color} />
            </AnimatedIcon>
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon focused={focused}>
              <Ionicons
          name={focused ? "person" : "person-outline"}
          size={24}
          color={focused ? "#0ea5e9" : "#9ca3af"}
        />

            </AnimatedIcon>
          ),
        }}
      />
    </Tabs>
  );
}
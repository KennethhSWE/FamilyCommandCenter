// frontend/app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="kids"
        options={{
          title: "My Chores",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="child" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="points"
        options={{
          title: "Points",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="stars" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="gift-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="shield-account" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
      name='calendar'
      options={{ title: "Calendar",
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calendar-month" color={color} size={size} /> }}
      />
    </Tabs>
  );
}

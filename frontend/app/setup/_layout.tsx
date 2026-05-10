import { Stack } from "expo-router";

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="parent"
        options={{
          title: "Parent Setup",
        }}
      />

      <Stack.Screen
        name="kids"
        options={{
          title: "Add Kids",
        }}
      />

      <Stack.Screen
        name="chores"
        options={{
          title: "Starter Chores",
        }}
      />

      <Stack.Screen
        name="rewards"
        options={{
          title: "Starter Rewards",
        }}
      />

      <Stack.Screen
        name="done"
        options={{
          title: "Setup Complete",
        }}
      />
    </Stack>
  );
}

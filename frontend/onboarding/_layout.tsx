// frontend/app/onboarding/_layout.tsx
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="add-kids"
        options={{ title: 'Add Your Kids' }}
      />
      {/* later you might add
          <Stack.Screen name="set-rewards" options={{ title: 'Rewards' }} />
      */}
    </Stack>
  );
}

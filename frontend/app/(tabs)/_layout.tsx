import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="kids" options={{ title: 'My Chores' }} />
      <Tabs.Screen name="points" options={{ title: 'Points' }} />
      <Tabs.Screen name="rewards" options={{ title: 'Rewards' }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin', headerShown: false }} />
    </Tabs>
  );
}

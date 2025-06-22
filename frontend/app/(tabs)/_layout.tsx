import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClientOnlyValue } from '../components/useClientOnlyValue';
import CustomTabBar from '../components/CustomTabBar';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="kids/kids" options={{ title: 'Kids' }} />
      <Tabs.Screen name="rewards/rewards" options={{ title: 'Rewards' }} />
      <Tabs.Screen name="points/points" options={{ title: 'Points' }} />
      <Tabs.Screen name="admin/admin" options={{ title: 'Admin' }} />
      <Tabs.Screen name="calendar/calendar" options={{ title: 'Calendar'}} />
    </Tabs>
  );
}
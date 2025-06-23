import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import KidsScreen from '../screens/Kids/KidsScreen';

const Tab = createBottomTabNavigator();

export default function KidsTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="My Chores" component={KidsScreen} />
    </Tab.Navigator>
  );
}
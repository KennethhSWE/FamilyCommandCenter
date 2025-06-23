import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ParentScreen from '../screens/Admin/ParentScreen';
import RewardScreen from '../screens/Admin/RewardScreen';
import PointsHouseScreen from '../screens/Admin/PointsHouseScreen';

const Tab = createBottomTabNavigator();

export default function ParentTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Admin" component={ParentScreen} />
      <Tab.Screen name="Rewards" component={RewardScreen} />
      <Tab.Screen name="PointsHouse" component={PointsHouseScreen} />
    </Tab.Navigator>
  );
}

export default ParentTabs;

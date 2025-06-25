import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminScreen from "../(tabs)/admin/admin";
import CalendarScreen from "../(tabs)/calendar/calendar";
import PointsScreen from "../(tabs)/points/points";
import RewardsScreen from "../(tabs)/rewards/rewards";

const Tab = createBottomTabNavigator();

export default function ParentTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Admin" component={AdminScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="PointsHouse" component={PointsScreen} />
    </Tab.Navigator>
  );
}

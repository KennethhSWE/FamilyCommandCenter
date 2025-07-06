import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminScreen from "../(tabs)/admin";
import CalendarScreen from "../(tabs)/calendar";
import PointsScreen from "../(tabs)/points";
import RewardsScreen from "../(tabs)/rewards";

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

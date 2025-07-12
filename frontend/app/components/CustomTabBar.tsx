// frontend/components/CustomTabBar.tsx
// ------------------------------------------------------------------
//  Curved bottom tab bar with raised “Kids” button
// ------------------------------------------------------------------
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  useColorScheme,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import {
  Feather,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

/* ––––– constants ––––– */
const { width: WIN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = WIN_WIDTH / 5;

/* ––––– icon resolver ––––– */
const tabIcon = (route: string, color: string, size: number) => {
  if (route.includes("kids"))
    return <FontAwesome5 name="child" size={size} color={color} />;
  if (route.includes("rewards"))
    return <MaterialCommunityIcons name="gift-outline" size={size} color={color} />;
  if (route.includes("points"))
    return <MaterialIcons name="stars" size={size} color={color} />;
  if (route.includes("admin"))
    return <Feather name="settings" size={size} color={color} />;
  return <MaterialIcons name="event" size={size} color={color} />; // calendar
};

/* ––––– component ––––– */
export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets   = useSafeAreaInsets();
  const scheme   = useColorScheme();
  const colors   = scheme === "dark"
    ? { bg: "#1e1e1e", active: "#8e44ad", text: "#fff", border: "#333" }
    : { bg: "#fff",   active: "#007aff",  text: "#000", border: "#ccc" };

  const SVG_W = WIN_WIDTH - 60;
  const centerX = SVG_W / 2;

  return (
    <>
      {/*  curved background shape  */}
      <Svg
        width={SVG_W}
        height={100}
        viewBox={`0 0 ${SVG_W} 100`}
        style={[styles.svg, { bottom: 70 + insets.bottom }]}
      >
        <Path
          d={`
            M0 0
            H${centerX - 60}
            C${centerX - 40} 0 ${centerX - 40} 40 ${centerX} 40
            C${centerX + 40} 40 ${centerX + 40} 0 ${centerX + 60} 0
            H${SVG_W} V100 H0 Z
          `}
          fill={colors.bg}
          stroke={colors.border}
          strokeWidth={2}
        />
      </Svg>

      {/*  tab buttons  */}
      <View
        style={[
          styles.row,
          { paddingBottom: insets.bottom, bottom: 60 + insets.bottom },
        ]}
      >
        {state.routes.map((route, idx) => {
          const focused = state.index === idx;
          const label   =
            descriptors[route.key].options.tabBarLabel ??
            descriptors[route.key].options.title ??
            route.name;

          const onPress = () => {
            const evt = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !evt.defaultPrevented) navigation.navigate(route.name);
          };

          /* center (Kids) gets elevated treatment */
          const isCenter = route.name.toLowerCase().includes("kids");
          const size     = isCenter ? 32 : 24;
          const color    = focused ? colors.active : colors.text;

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerWrapper}>
                <TouchableOpacity
                  onPress={onPress}
                  activeOpacity={0.85}
                  style={[styles.centerBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                >
                  {tabIcon(route.name, color, size)}
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabBtn}
              activeOpacity={0.7}
            >
              {tabIcon(route.name, color, size)}
              <Text style={{ fontSize: 12, color }}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

/* ––––– styles ––––– */
const styles = StyleSheet.create({
  svg: {
    position: "absolute",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
    position: "absolute",
    width: WIN_WIDTH,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabBtn: {
    width: TAB_WIDTH,
    alignItems: "center",
    paddingTop: 10,
  },
  centerWrapper: {
    position: "absolute",
    left: WIN_WIDTH / 2 - 38,
    top: -30,
  },
  centerBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
  },
});

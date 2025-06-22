import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Platform, Dimensions, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

const ICONS = {
  calendar: require('../assets/images/calendar.png'),
  kids: require('../assets/images/kids.png'),
  rewards: require('../assets/images/reward.png'),
  points: require('../assets/images/points.png'),
  admin: require('../assets/images/admin.png'),
};

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    const insets = useSafeAreaInsets();
    const windowWidth = Dimensions.get('window').width;
    const svgWidth = width - 60;
    const center = svgWidth /2;

  return (
    <View style={[styles.wrapper]}>
      <Svg
        width={svgWidth}
        height={120}
        viewBox={`0 0 ${svgWidth} 100`}
        style={styles.svg}
      >
        <Path
          d={`
            M0,0
            H${center - 70}
            C${center - 40},0 ${center - 40},40 ${center},40
            C${center + 40},40 ${center + 40},0 ${center + 70},0
            H${svgWidth}
            V115
            H0
            Z
          `}
          fill="#ffffff"
          stroke="#ccc"
          strokeWidth={2.5}
        />
        
      </Svg>

      <View style={[styles.container, { paddingBottom: insets.bottom, height: 70 + insets.bottom }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const routeName = route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconKey: keyof typeof ICONS;

          if (routeName.includes('kids')) iconKey = 'kids';
          else if (routeName.includes('rewards')) iconKey = 'rewards';
          else if (routeName.includes('points')) iconKey = 'points';
          else if (routeName.includes('admin')) iconKey = 'admin';
          else iconKey = 'calendar';

          const isCenter = iconKey === 'kids';

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerButtonContainer}>
                <TouchableOpacity
                  onPress={onPress}
                  style={styles.centerButton}
                  activeOpacity={0.85}
                >
                  <Image source={ICONS[iconKey]} style={styles.centerIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabButton}
            >
              <View style={styles.tabContent}>
                <Image source={ICONS[iconKey]} style={styles.icon} resizeMode="contain" />
                <Text style={isFocused ? styles.labelActive : styles.label}>
                  {getTabLabel(routeName)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

function getTabLabel(routeName: string): string {
  if (routeName.toLowerCase().includes('kids')) return 'Kids';
  if (routeName.toLowerCase().includes('rewards')) return 'Rewards';
  if (routeName.toLowerCase().includes('points')) return 'Points';
  if (routeName.toLowerCase().includes('admin')) return 'Admin';
  return 'Calendar';
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 0,
  },
  svg: {
    position: 'absolute',
    bottom: 0,
    zIndex: 0,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    elevation: 5,
    backgroundColor: 'transparent',
    marginHorizontal: 30,
    borderRadius: 16,
  },
  tabButton: {
    flex: 0.9,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 6,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 75,
    height: 75,
    top: 20,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -45,
    left: width / 2 - 65,
    zIndex: 10,
  },
  centerButton: {
    width: 75,
    height: 75,
    borderRadius: 35,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  centerIcon: {
    width: 70,
    height: 70,
    borderRadius: 25,
  },
  label: {
    fontSize: 18,
    color: '#888',
    marginTop: 4,
    fontWeight: '400',
  },
  labelActive: {
    fontSize: 24,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '700',
  },
});

export default CustomTabBar;

import { Tab, TabView, useTheme } from '@rneui/themed';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { View } from '@/components/Themed';

import IndexScreen from './index';
import MyScreen from './my';

class TabTouchableOpacity extends React.Component<TouchableOpacityProps> {
  render() {
    return <TouchableOpacity {...this.props} />;
  }
}

export default function TabLayout() {
  const router = useRouter();
  const { theme } = useTheme();
  const pathname = usePathname();
  const tabIndex = pathname.includes('/my') ? 1 : 0;

  const handleChange = (nextIndex: number) => {
    if (nextIndex === tabIndex) {
      return;
    }
    const nextRoute = nextIndex === 1 ? '/my' : '/';
    router.replace(nextRoute);
  };

  const backgroundColor = theme.colors.background;
  const textColor = theme.mode === 'dark' ? theme.colors.white : theme.colors.black;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.tabViewContainer, { backgroundColor }]}>
        <TabView
          value={tabIndex}
          onChange={handleChange}
          animationType="timing"
          disableTransition
          containerStyle={{ backgroundColor }}
          tabItemContainerStyle={{ backgroundColor }}
        >
          <TabView.Item style={[styles.tabViewItem, { backgroundColor }]}>
            <IndexScreen />
          </TabView.Item>
          <TabView.Item style={[styles.tabViewItem, { backgroundColor }]}>
            <MyScreen />
          </TabView.Item>
        </TabView>
      </View>
      <Tab
        value={tabIndex}
        onChange={handleChange}
        indicatorStyle={styles.tabIndicator}
        style={[styles.tabBar, { backgroundColor }]}
        containerStyle={{ backgroundColor }}
        buttonStyle={{ backgroundColor }}
      >
        <Tab.Item
          title="首页"
          titleStyle={(active) => [
            styles.tabTitle,
            { color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)' },
          ]}
          TouchableComponent={TabTouchableOpacity}
          activeOpacity={1}
        />
        <Tab.Item
          title="我的"
          titleStyle={(active) => [
            styles.tabTitle,
            { color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)' },
          ]}
          TouchableComponent={TabTouchableOpacity}
          activeOpacity={1}
        />
      </Tab>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    //tab的top边框一个像素高度的白色边框，模糊效果
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 5
  },
  tabIndicator: {
    backgroundColor: '#1e2933',
    height: 2,
  },
  tabTitle: {
    fontSize: 15,
    fontWeight: '600',
    paddingBottom: 15,
  },
  tabViewContainer: {
    flex: 1,
  },
  tabViewItem: {
    width: '100%',
    flex: 1,
  },
});

import { Tab, TabView, useTheme } from '@rneui/themed';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { View } from '@/components/Themed';

import IndexScreen from './index';
import MyScreen from './my';

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
          titleStyle={[styles.tabTitle, { color: textColor }]}
          TouchableComponent={TouchableOpacity}
          activeOpacity={1}
        />
        <Tab.Item
          title="我的"
          titleStyle={[styles.tabTitle, { color: textColor }]}
          TouchableComponent={TouchableOpacity}
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

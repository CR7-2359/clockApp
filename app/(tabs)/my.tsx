import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>我的页面</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});

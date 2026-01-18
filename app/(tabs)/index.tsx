import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet } from 'react-native';
export default function TabOneScreen() {
  const [time, onChangeTime] = useState(new Date().toLocaleTimeString())
  setInterval(() => {
    onChangeTime(new Date().toLocaleTimeString())
  }, 1000)
  const router = useRouter();


  return (
    <View style={styles.container}>
      <Text style={styles.title}>当前时间{time}</Text>
      <Button 
      title="进入时钟" 
      onPress={() => router.push('/timer')}
      >
      </Button>
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
  button: {
    margin: 10,
  },
});

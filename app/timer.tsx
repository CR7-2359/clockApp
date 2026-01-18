import { View } from '@/components/Themed';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { Button } from '@rneui/themed';
import { Rect, Svg } from 'react-native-svg';

// 虚线边框动画参数
const BORDER_RADIUS = 10;
const DASH_PATTERN = '8 6';
const DASH_DURATION_MS = 900;
const AnimatedRect = Animated.createAnimatedComponent(Rect);

// 让虚线边框“滚动”的动画组件
function MovingDashedBorder() {
  const dashOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 循环推进虚线偏移量，形成流动效果
    const animation = Animated.loop(
      Animated.timing(dashOffset, {
        toValue: 14,
        duration: DASH_DURATION_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [dashOffset]);

  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      <AnimatedRect
        x="1"
        y="1"
        width="98%"
        height="98%"
        rx={BORDER_RADIUS}
        ry={BORDER_RADIUS}
        fill="none"
        stroke="#fff"
        strokeWidth={2}
        strokeDasharray={DASH_PATTERN}
        strokeDashoffset={dashOffset}
      />
    </Svg>
  );
}

export default function TabOneScreen() {
  const [time, setTime] = useState(new Date());

  // 用于控制布局方向
  const [isLandscape, setIsLandscape] = useState(false);

  const onClickChange = async () => {
    const nextLock = isLandscape
      ? ScreenOrientation.OrientationLock.PORTRAIT_UP
      : ScreenOrientation.OrientationLock.LANDSCAPE;
    await ScreenOrientation.lockAsync(nextLock);
  };
  const onClickRefresh = () => {
    setTime(new Date());
  };

  // 启动定时器更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 监听屏幕方向变化
  useEffect(() => {
    const checkOrientation = async () => {
      const orientation = await ScreenOrientation.getOrientationAsync();
      const isLandscapeNow =
        orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsLandscape(isLandscapeNow);
    };

    // 初始检查
    checkOrientation();

    // 订阅方向变化事件
    const subscription = ScreenOrientation.addOrientationChangeListener(
      ({ orientationInfo }) => {
        const isLandscapeNow =
          orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
          orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
        setIsLandscape(isLandscapeNow);
      }
    );

    return () => {
      subscription.remove();
      // 恢复全局方向锁定（根据你的 app.json）
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <View style={styles.houerContainer}>
        {/* 动态设置 flexDirection */}
        <View style={[
          styles.houerRow,
          isLandscape ? styles.houerRowLandscape : styles.houerRowPortrait,
        ]}>
          <View style={styles.houer}>
            <Text style={styles.houerText}>{hours}</Text>
            <MovingDashedBorder />
          </View>
          <View style={styles.houer}>
            <Text style={styles.houerText}>{minutes}</Text>
            <MovingDashedBorder />
          </View>
        </View>
        <View style={styles.buttonsRow}>
          <Button
            title="切换"
            onPress={onClickChange}
            buttonStyle={styles.buttonCircle}
            containerStyle={styles.buttonCircleContainer}
            titleStyle={styles.buttonText}
            activeOpacity={0.6}
          />
          <Button
            title="刷新"
            onPress={onClickRefresh}
            buttonStyle={[styles.buttonCircle, styles.buttonCircleAlt]}
            containerStyle={styles.buttonCircleContainer}
            titleStyle={styles.buttonText}
            activeOpacity={0.6}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ 改为 flex: 1 更标准（占满全屏）、
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000', // 可选：深色背景更沉浸
  },
  houerContainer: {
    // 盒子布局方向在 houerRow 上动态设置
    display: 'flex',
    width: '60%',
    height: '60%',
    alignItems: 'stretch',
  },
  houerRow: {
    flex: 1,
    width: '100%',
  },
  houerRowPortrait: {
    flexDirection: 'column',
  },
  houerRowLandscape: {
    flexDirection: 'row',
  },
  houer: {
    flex: 1,
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: BORDER_RADIUS,
    margin: 6,
  },
  houerText: {
    fontSize: 98,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
    justifyContent: 'center',
  },
  buttonCircleContainer: {
    marginHorizontal: 10,
  },
  buttonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#1e2933',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCircleAlt: {
    backgroundColor: '#233024',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

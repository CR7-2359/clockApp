import { View } from '@/components/Themed';
import { Button } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useId, useRef, useState } from 'react';
import { Alert, Animated as RNAnimated, Easing, StyleSheet, Text, View as RNView } from 'react-native';
import Animated, {
  Easing as ReEasing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Defs, Image as SvgImage, Pattern, Rect, Svg, Text as SvgText } from 'react-native-svg';

// 虚线边框动画参数
const BORDER_RADIUS = 10;
const DASH_PATTERN = '8 6';
const DASH_DURATION_MS = 900;
const DIGIT_FONT_SIZE = 120;
const IMAGE_ROTATION_DURATION_MS = 12000;
const AnimatedRect = RNAnimated.createAnimatedComponent(Rect);
const AnimatedPattern = Animated.createAnimatedComponent(Pattern);

// 让虚线边框“滚动”的动画组件
function MovingDashedBorder() {
  const dashOffset = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    // 循环推进虚线偏移量，形成流动效果
    const animation = RNAnimated.loop(
      RNAnimated.timing(dashOffset, {
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

function ImageFillText({ text, imageSource }: { text: string; imageSource: string | number }) {
  const maskId = useId().replace(/:/g, '_');
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const rotation = useSharedValue(0);
  const { width, height } = layout;

  useEffect(() => {
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, { duration: IMAGE_ROTATION_DURATION_MS, easing: ReEasing.linear }),
      -1,
      false
    );
  }, [rotation]);

  const patternAnimatedProps = useAnimatedProps(() => {
    if (!width || !height) {
      return { patternTransform: [1, 0, 0, 1, 0, 0] };
    }
    const angle = (rotation.value * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const cx = width / 2;
    const cy = height / 2;
    const translateX = cx - cx * cos + cy * sin;
    const translateY = cy - cx * sin - cy * cos;
    return {
      patternTransform: [cos, sin, -sin, cos, translateX, translateY],
    };
  }, [width, height]);

  return (
    <RNView
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        if (width !== layout.width || height !== layout.height) {
          setLayout({ width, height });
        }
      }}
    >
      {layout.width > 0 && layout.height > 0 && (
        <Svg width={layout.width} height={layout.height}>
          <Defs>
            <AnimatedPattern
              id={maskId}
              patternUnits="userSpaceOnUse"
              width={layout.width}
              height={layout.height}
              animatedProps={patternAnimatedProps}
            >
              <Rect width={layout.width} height={layout.height} fill="#000" />
              <SvgImage
                href={imageSource}
                width={layout.width}
                height={layout.height}
                preserveAspectRatio="xMidYMid slice"
              />
            </AnimatedPattern>
          </Defs>
          <SvgText
            x={layout.width / 2}
            y={layout.height / 2}
            fontSize={DIGIT_FONT_SIZE}
            fontWeight="900"
            fill={`url(#${maskId})`}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {text}
          </SvgText>
        </Svg>
      )}
    </RNView>
  );
}

export default function TabOneScreen() {
  const [time, setTime] = useState(new Date());
  const [imageUri, setImageUri] = useState<string | null>(null);

  // 用于控制布局方向
  const [isLandscape, setIsLandscape] = useState(false);

  const onClickChange = async () => {
    const nextLock = isLandscape
      ? ScreenOrientation.OrientationLock.PORTRAIT_UP
      : ScreenOrientation.OrientationLock.LANDSCAPE;
    await ScreenOrientation.lockAsync(nextLock);
  };
  const onClickRefresh = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('需要权限', '请在系统设置中允许访问相册。');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
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
  const hasImage = Boolean(imageUri);
  const imageSource = imageUri ?? null;

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
            {hasImage ? (
              <ImageFillText text={hours} imageSource={imageSource as string} />
            ) : (
              <Text style={styles.houerText}>{hours}</Text>
            )}
            <MovingDashedBorder />
          </View>
          <View style={styles.houer}>
            {hasImage ? (
              <ImageFillText text={minutes} imageSource={imageSource as string} />
            ) : (
              <Text style={styles.houerText}>{minutes}</Text>
            )}
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
    margin:0,
    padding:0,
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
    fontSize: DIGIT_FONT_SIZE,
    color: '#fff',
    fontWeight: '900',
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
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

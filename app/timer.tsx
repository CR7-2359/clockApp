import { View } from '@/components/Themed';
import * as ImagePicker from 'expo-image-picker';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useId, useRef, useState } from 'react';
import {
  Alert,
  Animated as RNAnimated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View as RNView,
} from 'react-native';
import Animated, {
  Easing as ReEasing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Defs, Image as SvgImage, Pattern, Rect, Svg, Text as SvgText } from 'react-native-svg';
import type { PatternProps } from 'react-native-svg';
import { BottomSheet } from '@rneui/themed';

// 虚线边框动画参数
const BORDER_RADIUS = 10;
const DIGIT_FONT_SIZE = 120;
const IMAGE_ROTATION_DURATION_MS = 12000;
const AnimatedPattern = Animated.createAnimatedComponent(Pattern);

// 让虚线边框“滚动”的动画组件

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

  const patternAnimatedProps = useAnimatedProps<PatternProps>(() => {
    if (!width || !height) {
      const matrix: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];
      return { patternTransform: matrix };
    }
    const angle = (rotation.value * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const cx = width / 2;
    const cy = height / 2;
    const translateX = cx - cx * cos + cy * sin;
    const translateY = cy - cx * sin - cy * cos;
    const matrix: [number, number, number, number, number, number] = [
      cos,
      sin,
      -sin,
      cos,
      translateX,
      translateY,
    ];
    return { patternTransform: matrix };
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const framePulse = useRef(new RNAnimated.Value(0)).current;


  const onClickChange = async () => {
    setIsModalVisible(false);
    const nextLock = isLandscape
      ? ScreenOrientation.OrientationLock.PORTRAIT_UP
      : ScreenOrientation.OrientationLock.LANDSCAPE;
    await ScreenOrientation.lockAsync(nextLock);
    setIsLandscape(!isLandscape);
  };
  const onClickRefresh = async () => {
    setIsModalVisible(false);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    framePulse.stopAnimation();
    framePulse.setValue(0);
    RNAnimated.sequence([
      RNAnimated.timing(framePulse, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      RNAnimated.timing(framePulse, {
        toValue: 0,
        duration: 860,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [time, framePulse]);


  const onLongPressScreen = () => {
    if (!isModalVisible) {
      setIsModalVisible(true);
    }
  };
  const onCloseModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    setIsLandscape(false);
  }, []);

  const frameGlowOpacity = framePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  });
  const frameGlowScale = framePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const hasImage = Boolean(imageUri);
  const imageSource = imageUri ?? null;

  return (
    <Pressable style={styles.container} onLongPress={onLongPressScreen}>
      <StatusBar hidden />
      
      <View style={styles.houerContainer}>
        <View pointerEvents="none" style={styles.houerFrameBase} />
        <RNAnimated.View
          pointerEvents="none"
          style={[
            styles.houerFrameGlow,
            { opacity: frameGlowOpacity, transform: [{ scale: frameGlowScale }] },
          ]}
        />
        <View
          style={[
            styles.houerRow,
            isLandscape ? styles.houerRowLandscape : styles.houerRowPortrait,
          ]}
        >
          <View style={styles.houer}>
            {hasImage ? (
              <ImageFillText text={hours} imageSource={imageSource as string} />
            ) : (
              <Text style={styles.houerText}>{hours}</Text>
            )}
          </View>
          <View style={styles.houer}>
            {hasImage ? (
              <ImageFillText text={minutes} imageSource={imageSource as string} />
            ) : (
              <Text style={styles.houerText}>{minutes}</Text>
            )}
          </View>
        </View>
      </View>
      <BottomSheet isVisible={isModalVisible} onBackdropPress={onCloseModal}>
        <View style={styles.sheetCard}>
          <Text style={styles.sheetTitle}>Options</Text>
          <Pressable style={styles.sheetAction} onPress={onClickRefresh}>
            <Text style={styles.sheetActionText}>Select Image</Text>
          </Pressable>
          <Pressable style={[styles.sheetAction, styles.sheetActionAlt]} onPress={onClickChange}>
            <Text style={styles.sheetActionText}>切换方向</Text>
          </Pressable>
        </View>
      </BottomSheet>
    </Pressable>
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
    display: 'flex',
    width: '60%',
    height: '60%',
    alignItems: 'stretch',
    position: 'relative',
    padding: 6,
  },
  houerRow: {
    flex: 1,
    width: '100%',
    zIndex: 1,
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
  houerFrameBase: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#2b3842',
    borderRadius: BORDER_RADIUS + 8,
    zIndex: 0,
  },
  houerFrameGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: '#6b8a9a',
    borderRadius: BORDER_RADIUS + 10,
    backgroundColor: 'transparent',
    shadowColor: '#6fb2d1',
    shadowOpacity: 0.8,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
    zIndex: 0,
  },
  houerText: {
    fontSize: DIGIT_FONT_SIZE,
    color: '#fff',
    fontWeight: '900',
  },






  sheetCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderColor: '#2a2a2a',
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  sheetAction: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1e2933',
  },
  sheetActionAlt: {
    backgroundColor: '#233024',
  },
  sheetActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

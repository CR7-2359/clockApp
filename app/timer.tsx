import { View } from '@/components/Themed';
import { BottomSheet } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useId, useRef, useState } from 'react';
import {
  Alert,
  Easing,
  GestureResponderEvent,
  Pressable,
  Animated as RNAnimated,
  View as RNView,
  StyleSheet,
  Text,
} from 'react-native';
import Animated, {
  Easing as ReEasing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { ImageProps } from 'react-native-svg';
import {
  Defs,
  LinearGradient,
  Pattern,
  Rect,
  Stop,
  Svg,
  Image as SvgImage,
  Text as SvgText,
} from 'react-native-svg';

// 虚线边框动画参数
const BORDER_RADIUS = 10;
const DIGIT_FONT_SIZE = 120;
const IMAGE_ROTATION_DURATION_MS = 12000;
const IMAGE_BREATH_DURATION_MS = 8000;
const IMAGE_BREATH_SCALE = 1.06;
const COLOR_OPTIONS = [
  '#ffffff',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#f97316',
  '#eab308',
];
const AnimatedSvgImage = Animated.createAnimatedComponent(SvgImage);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const hsvToRgb = (h: number, s: number, v: number) => {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};
const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;

function ImageFillText({ text, imageSource }: { text: string; imageSource: string | number }) {
  const maskId = useId().replace(/:/g, '_');
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const { width, height } = layout;

  useEffect(() => {
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(360, { duration: IMAGE_ROTATION_DURATION_MS, easing: ReEasing.linear }),
      -1,
      false
    );
    scale.value = 1;
    scale.value = withRepeat(
      withTiming(IMAGE_BREATH_SCALE, {
        duration: IMAGE_BREATH_DURATION_MS,
        easing: ReEasing.inOut(ReEasing.quad),
      }),
      -1,
      true
    );
  }, [rotation, scale]);

  const imageAnimatedProps = useAnimatedProps<ImageProps>(() => {
    if (!width || !height) {
      return {};
    }
    const cx = width / 2;
    const cy = height / 2;
    return {
      transform: [
        { translateX: cx },
        { translateY: cy },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
        { translateX: -cx },
        { translateY: -cy },
      ],
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
            <Pattern
              id={maskId}
              patternUnits="userSpaceOnUse"
              width={layout.width}
              height={layout.height}
            >
              <Rect width={layout.width} height={layout.height} fill="#000" />
              <AnimatedSvgImage
                href={imageSource}
                width={layout.width}
                height={layout.height}
                preserveAspectRatio="xMidYMid slice"
                animatedProps={imageAnimatedProps}
              />
            </Pattern>
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
  const [customClockColor, setCustomClockColor] = useState(COLOR_OPTIONS[0]);
  const [customFrameColor, setCustomFrameColor] = useState(COLOR_OPTIONS[4]);
  const [pickerTarget, setPickerTarget] = useState<'clock' | 'frame' | null>(null);
  const [pickerLayout, setPickerLayout] = useState({ width: 0, height: 0 });
  const [clockColor, setClockColor] = useState(COLOR_OPTIONS[0]);
  const [frameColor, setFrameColor] = useState(COLOR_OPTIONS[4]);
  const [useClockColor, setUseClockColor] = useState(false);
  const [useCustomFrameColor, setUseCustomFrameColor] = useState(false);


  const onClickChange = async () => {
    setIsModalVisible(false);
    setPickerTarget(null);
    const nextLock = isLandscape
      ? ScreenOrientation.OrientationLock.PORTRAIT_UP
      : ScreenOrientation.OrientationLock.LANDSCAPE;
    await ScreenOrientation.lockAsync(nextLock);
    setIsLandscape(!isLandscape);
  };
  const onClickRefresh = async () => {
    setIsModalVisible(false);
    setPickerTarget(null);
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
      setUseClockColor(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(framePulse, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        RNAnimated.timing(framePulse, {
          toValue: 0,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [framePulse]);


  const onLongPressScreen = () => {
    if (!isModalVisible) {
      setIsModalVisible(true);
    }
  };
  const onSelectClockColor = (color: string) => {
    setClockColor(color);
    setUseClockColor(true);
    setPickerTarget(null);
  };
  const onSelectFrameColor = (color: string) => {
    setFrameColor(color);
    setUseCustomFrameColor(false);
    setPickerTarget(null);
  };
  const onOpenColorCard = (target: 'clock' | 'frame') => {
    setPickerTarget((current) => (current === target ? null : target));
  };
  const onColorCardTouch = (event: GestureResponderEvent) => {
    if (!pickerTarget || !pickerLayout.width || !pickerLayout.height) {
      return;
    }
    const x = clamp(event.nativeEvent.locationX / pickerLayout.width, 0, 1);
    const y = clamp(event.nativeEvent.locationY / pickerLayout.height, 0, 1);
    const hue = x * 360;
    const saturation = y;
    const { r, g, b } = hsvToRgb(hue, saturation, 1);
    const color = rgbToHex(r, g, b);
    if (pickerTarget === 'clock') {
      setClockColor(color);
      setCustomClockColor(color);
      setUseClockColor(true);
    } else {
      setFrameColor(color);
      setCustomFrameColor(color);
      setUseCustomFrameColor(true);
    }
  };
  const onCloseModal = () => {
    setIsModalVisible(false);
    setPickerTarget(null);
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
  const hasImage = Boolean(imageUri);
  const imageSource = imageUri ?? null;
  const shouldUseImage = hasImage && !useClockColor;
  const clockSwatches = [...COLOR_OPTIONS, customClockColor];
  const frameSwatches = [...COLOR_OPTIONS, customFrameColor];
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');

  return (
    <Pressable style={styles.container} onLongPress={onLongPressScreen}>
      <StatusBar hidden />

      <View style={styles.houerContainer}>
        <View
          pointerEvents="none"
          style={[styles.houerFrameBase, { borderColor: frameColor }]}
        />
        <RNAnimated.View
          pointerEvents="none"
          style={[
            styles.houerFrameGlow,
            {
              borderColor: frameColor,
              shadowColor: frameColor,
              opacity: frameGlowOpacity,
              transform: [{ scale: frameGlowScale }],
            },
          ]}
        />
        <View
          style={[
            styles.houerRow,
            isLandscape ? styles.houerRowLandscape : styles.houerRowPortrait,
          ]}
        >
          <View style={styles.houer}>
            {shouldUseImage ? (
              <ImageFillText text={hours} imageSource={imageSource as string} />
            ) : (
              <Text style={[styles.houerText, { color: clockColor }]}>{hours}</Text>
            )}
          </View>
          <View style={styles.houer}>
            {shouldUseImage ? (
              <ImageFillText text={minutes} imageSource={imageSource as string} />
            ) : (
              <Text style={[styles.houerText, { color: clockColor }]}>{minutes}</Text>
            )}
          </View>
        </View>
      </View>
      <BottomSheet isVisible={isModalVisible} onBackdropPress={onCloseModal}>
        <View style={styles.sheetCard}>
          <Text style={styles.sheetTitle}>Options</Text>
          <View style={styles.sheetColorSection}>
            <Text style={styles.sheetSectionTitle}>Clock Color</Text>
            <View style={styles.sheetColorRow}>
              {clockSwatches.map((color, index) => {
                const isCustom = index === COLOR_OPTIONS.length;
                const isActive = isCustom
                  ? useClockColor && clockColor === customClockColor
                  : clockColor === color;
                return (
                  <Pressable
                    key={`clock-${index}`}
                    style={[
                      styles.sheetColorSwatch,
                      isCustom ? styles.sheetColorSwatchCustom : { backgroundColor: color },
                      isActive && styles.sheetColorSwatchActive,
                    ]}
                    onPress={() =>
                      isCustom ? onOpenColorCard('clock') : onSelectClockColor(color)
                    }
                  >
                    {isCustom ? (
                      <Svg width="100%" height="100%">
                        <Defs>
                          <LinearGradient id="clockHue" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0%" stopColor="#ff0000" />
                            <Stop offset="16.6%" stopColor="#ffff00" />
                            <Stop offset="33.3%" stopColor="#00ff00" />
                            <Stop offset="50%" stopColor="#00ffff" />
                            <Stop offset="66.6%" stopColor="#0000ff" />
                            <Stop offset="83.3%" stopColor="#ff00ff" />
                            <Stop offset="100%" stopColor="#ff0000" />
                          </LinearGradient>
                          <LinearGradient id="clockSat" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                          </LinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#clockHue)" />
                        <Rect width="100%" height="100%" fill="url(#clockSat)" />
                      </Svg>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.sheetColorSection}>
            <Text style={styles.sheetSectionTitle}>Frame Color</Text>
            <View style={styles.sheetColorRow}>
              {frameSwatches.map((color, index) => {
                const isCustom = index === COLOR_OPTIONS.length;
                const isActive = isCustom
                  ? useCustomFrameColor && frameColor === customFrameColor
                  : frameColor === color;
                return (
                  <Pressable
                    key={`frame-${index}`}
                    style={[
                      styles.sheetColorSwatch,
                      isCustom ? styles.sheetColorSwatchCustom : { backgroundColor: color },
                      isActive && styles.sheetColorSwatchActive,
                    ]}
                    onPress={() =>
                      isCustom ? onOpenColorCard('frame') : onSelectFrameColor(color)
                    }
                  >
                    {isCustom ? (
                      <Svg width="100%" height="100%">
                        <Defs>
                          <LinearGradient id="frameHue" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0%" stopColor="#ff0000" />
                            <Stop offset="16.6%" stopColor="#ffff00" />
                            <Stop offset="33.3%" stopColor="#00ff00" />
                            <Stop offset="50%" stopColor="#00ffff" />
                            <Stop offset="66.6%" stopColor="#0000ff" />
                            <Stop offset="83.3%" stopColor="#ff00ff" />
                            <Stop offset="100%" stopColor="#ff0000" />
                          </LinearGradient>
                          <LinearGradient id="frameSat" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                            <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                          </LinearGradient>
                        </Defs>
                        <Rect width="100%" height="100%" fill="url(#frameHue)" />
                        <Rect width="100%" height="100%" fill="url(#frameSat)" />
                      </Svg>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
          {pickerTarget ? (
            <View style={styles.sheetColorSection}>
              <Text style={styles.sheetSectionTitle}>
                {pickerTarget === 'clock' ? 'Clock Color Card' : 'Frame Color Card'}
              </Text>
              <View
                style={styles.colorCard}
                onLayout={(event) => {
                  const { width, height } = event.nativeEvent.layout;
                  if (width !== pickerLayout.width || height !== pickerLayout.height) {
                    setPickerLayout({ width, height });
                  }
                }}
                onStartShouldSetResponder={() => true}
                onResponderGrant={onColorCardTouch}
                onResponderMove={onColorCardTouch}
              >
                <Svg width="100%" height="100%">
                  <Defs>
                    <LinearGradient id="pickerHue" x1="0" y1="0" x2="1" y2="0">
                      <Stop offset="0%" stopColor="#ff0000" />
                      <Stop offset="16.6%" stopColor="#ffff00" />
                      <Stop offset="33.3%" stopColor="#00ff00" />
                      <Stop offset="50%" stopColor="#00ffff" />
                      <Stop offset="66.6%" stopColor="#0000ff" />
                      <Stop offset="83.3%" stopColor="#ff00ff" />
                      <Stop offset="100%" stopColor="#ff0000" />
                    </LinearGradient>
                    <LinearGradient id="pickerSat" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                      <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#pickerHue)" />
                  <Rect width="100%" height="100%" fill="url(#pickerSat)" />
                </Svg>
              </View>
            </View>
          ) : null}
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
    margin: 0,
    padding: 0,
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
  sheetColorSection: {
    marginTop: 12,
  },
  sheetSectionTitle: {
    color: '#9aa4ad',
    fontSize: 12,
    marginBottom: 8,
  },
  sheetColorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sheetColorSwatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#1f262c',
    marginRight: 10,
    marginBottom: 10,
  },
  sheetColorSwatchCustom: {
    overflow: 'hidden',
  },
  sheetColorSwatchActive: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  colorCard: {
    marginTop: 8,
    width: '100%',
    height: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f262c',
    overflow: 'hidden',
    backgroundColor: '#111',
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

# myDemo

这是一个 React Native（Expo）示例项目，包含自定义计时页面、边框发光动画和图片填充数字等功能。

## 功能

- 小时/分钟两位显示，支持图片填充和动画效果
- 底部抽屉操作（选择图片、切换方向）
- 时钟文字与边框颜色分开选择，支持自定义色卡
- 两个数字外框发光动画

## 环境要求

- Node.js 和 pnpm
- Expo CLI（或使用 `npx expo`）

## 安装

```bash
pnpm install
```

## 运行

```bash
pnpm start
```

然后选择平台：

```bash
pnpm android
pnpm ios
pnpm web
```

## 使用说明

- 长按计时页面，打开底部抽屉
- “Select Image”：选择图片作为数字填充
- “Switch Orientation”：切换竖屏/横屏
- 颜色色块用于设置时钟文字和边框颜色
- 最后一个色块可打开色卡自定义颜色

---
description: How to build the VitalWatch Android APK
---

# Build VitalWatch APK

## Prerequisites (One-time setup)

### 1. Install Android Studio
Download from: https://developer.android.com/studio

During install, make sure these are checked:
- Android SDK
- Android SDK Platform 34
- Android Virtual Device (AVD)

### 2. Set Environment Variables
After installing Android Studio, add these to your system PATH:

```
ANDROID_HOME = C:\Users\<your-user>\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

## Build Steps

// turbo-all

### 1. Build the web app
```bash
npm run build
```

### 2. Sync with Android project
```bash
npx cap sync android
```

### 3. Build debug APK
```bash
cd android && .\gradlew.bat assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 4. (Optional) Build release APK
```bash
cd android && .\gradlew.bat assembleRelease
```

## Alternative: Open in Android Studio
```bash
npx cap open android
```
This opens the project in Android Studio where you can build/run directly.

## Quick one-liner (after prerequisites)
```bash
npm run build && npx cap sync android && cd android && .\gradlew.bat assembleDebug
```

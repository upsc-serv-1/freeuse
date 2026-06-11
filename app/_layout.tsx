import 'react-native-reanimated';
import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, createContext, useContext, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { NativeModules, Platform } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider as UIThemeProvider } from '@/components/ui/theme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

// ═══ Native Module Access ═══
const AppBlockerNative = Platform.OS === 'android' ? NativeModules.AppBlockerModule : null;

// ═══ Permissions Context ═══
interface PermissionsState {
  accessibilityEnabled: boolean;
  usageAccessGranted: boolean;
  overlayPermission: boolean;
  checking: boolean;
}
const defaultPerms: PermissionsState = {
  accessibilityEnabled: false,
  usageAccessGranted: false,
  overlayPermission: false,
  checking: true,
};
export const PermissionsContext = createContext<{
  perms: PermissionsState;
  checkPermissions: () => Promise<void>;
  openAccessibility: () => void;
  openUsageStats: () => void;
  openBatteryOpt: () => void;
  openOverlaySettings: () => void;
}>({
  perms: defaultPerms,
  checkPermissions: async () => {},
  openAccessibility: () => {},
  openUsageStats: () => {},
  openBatteryOpt: () => {},
  openOverlaySettings: () => {},
});

export function usePermissions() {
  return useContext(PermissionsContext);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [perms, setPerms] = useState<PermissionsState>(defaultPerms);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const checkPermissions = async () => {
    if (!AppBlockerNative) {
      setPerms({ accessibilityEnabled: false, usageAccessGranted: false, overlayPermission: false, checking: false });
      return;
    }
    try {
      const [accessibilityEnabled, overlayPermission] = await Promise.all([
        AppBlockerNative.isAccessibilityServiceEnabled(),
        AppBlockerNative.hasOverlayPermission(),
      ]);
      setPerms({ accessibilityEnabled, usageAccessGranted: true, overlayPermission, checking: false });
    } catch {
      setPerms({ accessibilityEnabled: false, usageAccessGranted: false, overlayPermission: false, checking: false });
    }
  };

  const openAccessibility = () => AppBlockerNative?.openAccessibilitySettings();
  const openUsageStats = () => AppBlockerNative?.openUsageAccessSettings();
  const openBatteryOpt = () => AppBlockerNative?.openBatteryOptimizationSettings();
  const openOverlaySettings = () => AppBlockerNative?.openOverlaySettings();

  // Start native blocking service on app load
  useEffect(() => {
    if (!AppBlockerNative) return;
    AppBlockerNative.startBlockingService()
      .then(() => console.log('Native blocking service started'))
      .catch((e: any) => console.warn('Could not start blocking service:', e));
    checkPermissions();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PermissionsContext.Provider value={{ perms, checkPermissions, openAccessibility, openUsageStats, openBatteryOpt, openOverlaySettings }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <UIThemeProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </UIThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PermissionsContext.Provider>
  );
}
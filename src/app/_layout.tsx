import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { C } from '@/constants/theme';
import { StoreProvider, useStore } from '@/db';
import { startOfDay } from '@/lib/date';
import { notifyOverdue } from '@/lib/notifications';
import { statusOf, upcoming } from '@/lib/tasks';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Root fontsReady={fontsLoaded || Boolean(fontError)} />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function Root({ fontsReady }: { fontsReady: boolean }) {
  const { ready, settings, tasks, setSetting } = useStore();

  useEffect(() => {
    if (fontsReady && ready) SplashScreen.hideAsync();
  }, [fontsReady, ready]);

  // Once a day, nudge about tasks whose deadline has already passed.
  const late = upcoming(tasks).filter((t) => statusOf(t) === 'overdue');
  const [today] = useState(() => startOfDay(Date.now()));
  useEffect(() => {
    if (!ready || settings.notify_late !== '1' || late.length === 0) return;
    if (settings.late_notified_on === String(today)) return;
    setSetting('late_notified_on', String(today)).then(() => notifyOverdue(late.length, late[0].title));
  }, [ready, settings.notify_late, settings.late_notified_on, today, late, setSetting]);

  if (!fontsReady || !ready) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.cream },
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="onboarding/peringatan" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tugas/baru" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="tugas/[id]" />
      <Stack.Screen name="matkul/index" />
      <Stack.Screen name="matkul/baru" />
      <Stack.Screen name="matkul/[id]" />
      <Stack.Screen name="atur/notifikasi" />
    </Stack>
  );
}

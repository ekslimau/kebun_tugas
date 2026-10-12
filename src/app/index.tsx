import { Redirect } from 'expo-router';

import { useStore } from '@/db';

export default function Index() {
  const { settings } = useStore();
  return <Redirect href={settings.onboarded === '1' ? '/beranda' : '/onboarding'} />;
}

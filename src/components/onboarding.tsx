import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from '@/components/ui';
import { C, R } from '@/constants/theme';

/** Back arrow + 3-step progress + "N dari 3", as shown in the onboarding screens. */
export function StepHeader({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <View style={styles.row}>
      <BackButton />
      <View style={styles.track}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.segment, i < step && styles.segmentOn]} />
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <Text style={styles.count}>{`${step} dari ${total}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  track: { flexDirection: 'row', gap: 6 },
  segment: { width: 44, height: 8, borderRadius: R.pill, backgroundColor: C.line },
  segmentOn: { backgroundColor: C.purple },
  count: { fontFamily: 'Nunito_700Bold', fontSize: 13, color: C.ink },
});

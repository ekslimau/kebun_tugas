import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { StepHeader } from '@/components/onboarding';
import { Button, Chip, Label, Screen, Scroll, Title, shadow } from '@/components/ui';
import { C, F, FS, R } from '@/constants/theme';
import { useStore } from '@/db';

export default function OnboardingProfil() {
  const { profile, saveProfile } = useStore();
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [semester, setSemester] = useState(profile.semester);

  const next = async () => {
    await saveProfile(name.trim(), semester);
    router.push('/onboarding/jadwal' as Href);
  };

  return (
    <Screen>
      <Scroll>
        <StepHeader step={1} />

        <View style={styles.mascotRow}>
          <Text style={styles.mascot}>🧅</Text>
          <View style={[styles.bubble, shadow(C.line)]}>
            <Text style={styles.bubbleText}>
              Halo! Aku Tugi. Kenalan dulu yuk, biar aku bisa bantu kamu.
            </Text>
          </View>
        </View>

        <Title>Siapa namamu?</Title>

        <Label>Nama panggilan</Label>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Contoh: Rani"
          placeholderTextColor={C.dim}
          style={styles.input}
          returnKeyType="done"
        />

        <Label>Kamu semester berapa?</Label>
        <View style={styles.chips}>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <Chip key={n} selected={semester === n} onPress={() => setSemester(n)} style={styles.chip}>
              {n}
            </Chip>
          ))}
        </View>
      </Scroll>

      <View style={styles.footer}>
        <Button label="Lanjut" onPress={next} disabled={name.trim().length === 0} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  mascotRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mascot: { fontSize: 64 },
  bubble: { flex: 1, backgroundColor: C.white, borderRadius: 20, padding: 14 },
  bubbleText: { fontFamily: F.body, fontSize: FS.body, color: C.ink },
  input: {
    minHeight: 54,
    borderWidth: 2,
    borderColor: C.purple,
    borderRadius: R.chipSm,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    fontFamily: F.body,
    fontSize: FS.body,
    color: C.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { width: '22%' },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
});

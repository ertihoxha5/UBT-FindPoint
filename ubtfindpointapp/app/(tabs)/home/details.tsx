import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeDetailsScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Details screen inside Home tab</ThemedText>
      <ThemedText style={styles.description}>
        This screen lives inside the Home tab stack, so the bottom tab bar stays available.
      </ThemedText>

      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={() => router.back()}>
        <ThemedText type="link">Go back</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  description: {
    marginTop: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
});
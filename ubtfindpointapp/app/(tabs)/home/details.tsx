import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title?: string;
    description?: string;
    type?: string;
    status?: string;
    poster?: string;
    createdAt?: string;
    imageUrl?: string;
    category?: string;
    location?: string;
    reward?: string;
  }>();

  const infoRows = [
    { label: 'Poster', value: params.poster || 'Unknown user' },
    { label: 'Type', value: params.type || 'Unknown' },
    { label: 'Status', value: params.status || 'Open' },
    { label: 'Category', value: params.category || 'Not set' },
    { label: 'Location', value: params.location || 'Not set' },
    { label: 'Reward', value: params.reward || 'Not set' },
    {
      label: 'Reported',
      value: params.createdAt ? new Date(String(params.createdAt)).toLocaleString() : 'Unknown time',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      {params.imageUrl ? <Image source={{ uri: String(params.imageUrl) }} style={styles.image} /> : null}

      <View style={styles.card}>
        <Text style={styles.typePill}>{String(params.type || 'report').toUpperCase()}</Text>
        <Text style={styles.title}>{params.title || 'Report details'}</Text>
        <Text style={styles.description}>{params.description || 'No description was provided for this report.'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Report information</Text>
        {infoRows.map((row) => (
          <View key={row.label} style={styles.tableRow}>
            <Text style={styles.tableLabel}>{row.label}</Text>
            <Text style={styles.tableValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.back()} activeOpacity={0.88}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f8fc',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    backgroundColor: '#dbe7f3',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    marginBottom: 14,
  },
  typePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4fb',
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  title: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '800',
    color: '#10233f',
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: '#526175',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10233f',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3f8',
  },
  tableLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#526175',
  },
  tableValue: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    color: '#10233f',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

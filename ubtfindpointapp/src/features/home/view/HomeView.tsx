// src/features/home/view/HomeView.tsx
import React from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

import { HomePoint } from '../viewmodel/useHomeViewModel';

type HomeViewProps = {
  points: HomePoint[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

export default function HomeView({ points, loading, error, onRefresh }: HomeViewProps) {
  if (loading && points.length === 0) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Image
            source={require('@/assets/images/ubtfindpointlogo.png')}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          <ThemedText style={styles.appTitle}>UBT FindPoint</ThemedText>
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
          <ThemedText style={styles.loadingText}>
            Po përgatisim gjithçka për ty...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={points}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            {/* Hero Section */}
            <View style={styles.hero}>
              <Image
                source={require('@/assets/images/ubtfindpointlogo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <ThemedText style={styles.appTitle}>UBT FindPoint</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Gjej ose raporto sendet e humbura brenda kampuseve të UBT-së
              </ThemedText>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
                <ThemedText style={styles.primaryButtonText}>+ Bëj Raportim të Ri</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
                <ThemedText style={styles.secondaryButtonText}>Shfleto Raportimet</ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedView style={styles.infoCard}>
              <ThemedText style={styles.sectionTitle}>Si funksionon?</ThemedText>
              <ThemedText style={styles.sectionText}>
                Raporto sendet e humbura ose të gjetura. Komuniteti dhe stafi i UBT-së 
                ndihmojnë për t'i kthyer sendet pronarëve të tyre.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoCard}>
              <ThemedText style={styles.sectionTitle}>Si të kontaktosh?</ThemedText>
              <ThemedText style={styles.sectionText}>
                Mund të dërgosh mesazhe private drejtpërdrejt personit që ka postuar sendin. 
                Komunikimi është i sigurt dhe i shpejtë.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoCard}>
              <ThemedText style={styles.sectionTitle}>Pse UBT FindPoint?</ThemedText>
              <ThemedText style={styles.sectionText}>
                • Raportim i shpejtë dhe i lehtë{'\n'}
                • Komunikim direkt me personin që ka gjetur sendin{'\n'}
                • Njoftime në kohë reale{'\n'}
                • Siguri dhe privatësi e lartë
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.campusesHeader}>
              <ThemedText style={styles.sectionTitle}>Kampuset e UBT-së</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>
                Zgjidh kampusin tënd dhe fillo veprimin
              </ThemedText>
            </ThemedView>
          </>
        }
        renderItem={({ item }) => (
          <ThemedView style={styles.campusCard}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.campusName}>{item.name}</ThemedText>
            </View>
            
            <ThemedText style={styles.location}>{item.location}</ThemedText>
            <ThemedText style={styles.campusDescription}>{item.description}</ThemedText>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.viewButton} activeOpacity={0.9}>
                <ThemedText style={styles.viewButtonText}>Shiko Raportimet</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reportButton} activeOpacity={0.9}>
                <ThemedText style={styles.reportButtonText}>Bëj Raportim</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  // Loading Screen
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    width: 125,
    height: 125,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 27,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  loadingText: {
    marginTop: 30,
    fontSize: 16.5,
    color: '#64748B',
    textAlign: 'center',
  },

  // Hero Section
  hero: {
    alignItems: 'center',
    paddingTop: 65,
    paddingBottom: 50,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 98,
    height: 98,
    marginBottom: 18,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 14,
    marginTop: -32,
    marginBottom: 30,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16.8,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  secondaryButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: '600',
  },

  infoCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.07,
    shadowRadius: 15,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 14,
  },
  sectionText: {
    fontSize: 15.5,
    lineHeight: 24.5,
    color: '#334155',
  },

  campusesHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 4,
  },

  campusCard: {
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  campusName: {
    fontSize: 20.5,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  location: {
    fontSize: 15.5,
    color: '#64748B',
    marginBottom: 12,
  },
  campusDescription: {
    fontSize: 15.5,
    lineHeight: 23,
    color: '#475569',
    marginBottom: 24,
  },
  distance: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
  },

  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  viewButtonText: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: 15.3,
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15.3,
  },

  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  listContent: {
    paddingBottom: 40,
  },
});
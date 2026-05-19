import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, ActivityIndicator, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import { getStoredToken } from '@/src/services/session';
import api from '@/src/services/api';

interface PDFPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export function PDFPreviewModal({ visible, onClose, title = 'PDF Report' }: PDFPreviewModalProps) {
  const isDark = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      generatePdfUrl();
    }
  }, [visible]);

  const generatePdfUrl = async () => {
    try {
      setLoading(true);
      const token = await getStoredToken();
      const url = `${api.defaults.baseURL}/admin/dashboard/report.pdf?token=${encodeURIComponent(token || '')}`;
      setPdfUrl(url);
    } catch (error) {
      console.error('Failed to load PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>{title}</Text>
          <TouchableOpacity
            style={[styles.closeButton, isDark && styles.closeButtonDark]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.closeButtonText, isDark && styles.closeButtonTextDark]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* PDF Viewer */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#0f5ee8'} />
            <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>Loading PDF...</Text>
          </View>
        ) : pdfUrl ? (
          <WebView
            source={{ uri: pdfUrl }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={isDark ? '#60a5fa' : '#0f5ee8'} />
              </View>
            )}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
              Failed to load PDF
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, isDark && styles.retryButtonDark]}
              onPress={generatePdfUrl}
              activeOpacity={0.7}
            >
              <Text style={[styles.retryButtonText, isDark && styles.retryButtonTextDark]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  headerTitleDark: {
    color: '#f1f5f9',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonDark: {
    backgroundColor: '#334155',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeButtonTextDark: {
    color: '#f1f5f9',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  loadingTextDark: {
    color: '#cbd5e1',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '700',
  },
  errorTextDark: {
    color: '#fca5a5',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0f5ee8',
  },
  retryButtonDark: {
    backgroundColor: '#1e40af',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  retryButtonTextDark: {
    color: '#e0f2fe',
  },
});

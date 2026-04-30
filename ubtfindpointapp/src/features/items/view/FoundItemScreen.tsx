import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Image,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import api from '../../../services/api';
import type { Item } from '../model/ItemModel';

type FoundItemPost = Item & {
	poster_name?: string;
	fullName?: string;
};

const getAssetUrl = (path: string) => {
	if (!path) {
		return '';
	}

	if (path.startsWith('http://') || path.startsWith('https://')) {
		return path;
	}

	const baseUrl = String(api.defaults.baseURL || '');
	const apiRoot = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
	return `${apiRoot}${path}`;
};

const formatPostTime = (value?: string) => {
	if (!value) {
		return 'Now';
	}

	const createdAt = new Date(value);
	if (Number.isNaN(createdAt.getTime())) {
		return 'Now';
	}

	return createdAt.toLocaleDateString();
};

export default function FoundItemScreen() {
	const router = useRouter();
	const [items, setItems] = useState<FoundItemPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadFoundItems = useCallback(async (isRefresh = false) => {
		try {
			if (isRefresh) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}

			setError(null);

			const response = await api.get('/items', {
				params: {
					status: 'found',
				},
			});

			const incomingItems = Array.isArray(response.data) ? response.data : [];
			const foundOnly = incomingItems.filter((item: FoundItemPost) => item.type === 'found');
			setItems(foundOnly);
		} catch (err: any) {
			setError(err?.response?.data?.error || 'Failed to load found item posts.');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		loadFoundItems();
	}, [loadFoundItems]);

	const header = useMemo(
		() => (
			<View style={styles.header}>
				<Text style={styles.title}>Found Item Posts</Text>
				<Text style={styles.subtitle}>See all posts for items reported as found.</Text>
			</View>
		),
		[]
	);

	if (loading && items.length === 0) {
		return (
			<SafeAreaView style={styles.container} edges={['top']}>
				<StatusBar style="dark" backgroundColor="#ECFDF5" translucent={false} />
				<View style={styles.loadingWrap}>
				<ActivityIndicator size="large" color="#0F766E" />
				<Text style={styles.loadingText}>Loading found item posts...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error && items.length === 0) {
		return (
			<SafeAreaView style={styles.container} edges={['top']}>
				<StatusBar style="dark" backgroundColor="#ECFDF5" translucent={false} />
				<View style={styles.loadingWrap}>
				<Text style={styles.errorTitle}>Could not load found items</Text>
				<Text style={styles.errorText}>{error}</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={['top']}>
			<StatusBar style="dark" backgroundColor="#ECFDF5" translucent={false} />
			<FlatList
				data={items}
				keyExtractor={(item) => String(item.item_id)}
				ListHeaderComponent={header}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFoundItems(true)} />}
				renderItem={({ item }) => {
					const displayName = item.is_anonymous
						? 'Anonymous'
						: item.poster_name || item.fullName || 'Unknown user';

					const imageUrl = item.media?.[0]?.url ? getAssetUrl(item.media[0].url) : null;

					const onOpenDetails = () => {
						router.push({
							pathname: '/home/details',
							params: {
								itemId: String(item.item_id),
								title: item.title,
								description: item.description || '',
								status: String(item.status),
								type: item.type,
								poster: displayName,
								createdAt: item.created_at || '',
								imageUrl: imageUrl || '',
							},
						});
					};

					return (
						<View style={styles.postCard}>
							<View style={styles.postTopRow}>
								<View style={styles.avatarCircle}>
									<Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
								</View>

								<View style={{ flex: 1 }}>
									<Text style={styles.posterName}>{displayName}</Text>
									<Text style={styles.postDate}>{formatPostTime(item.created_at)}</Text>
								</View>

								<View style={styles.statusPill}>
									<Text style={styles.statusPillText}>{String(item.status).toUpperCase()}</Text>
								</View>
							</View>

							<View style={styles.titleRow}>
								<Text style={styles.postTitle}>{item.title}</Text>
								<TouchableOpacity style={styles.detailsButton} activeOpacity={0.85} onPress={onOpenDetails}>
									<Text style={styles.detailsButtonText}>Details</Text>
								</TouchableOpacity>
							</View>
							{imageUrl ? <Image source={{ uri: imageUrl }} style={styles.postImage} /> : null}
						</View>
					);
				}}
				ListEmptyComponent={
					<View style={styles.emptyCard}>
						<Text style={styles.emptyTitle}>No found item posts yet</Text>
						<Text style={styles.emptySubtitle}>When someone creates a found item post, it will appear here.</Text>
					</View>
				}
				contentContainerStyle={styles.content}
				showsVerticalScrollIndicator={false}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#ECFDF5',
	},
	content: {
		paddingHorizontal: 14,
		paddingBottom: 24,
	},
	header: {
		paddingTop: 18,
		paddingBottom: 14,
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		color: '#052E2B',
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 15,
		color: '#115E59',
	},
	loadingWrap: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ECFDF5',
		paddingHorizontal: 24,
	},
	loadingText: {
		marginTop: 10,
		color: '#134E4A',
		fontSize: 15,
	},
	errorTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: '#991B1B',
		marginBottom: 6,
	},
	errorText: {
		fontSize: 14,
		color: '#B91C1C',
		textAlign: 'center',
	},
	postCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		padding: 14,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#CCFBF1',
		shadowColor: '#0F172A',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 3,
	},
	postTopRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		gap: 10,
	},
	avatarCircle: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: '#0F766E',
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: {
		color: '#FFFFFF',
		fontWeight: '700',
		fontSize: 16,
	},
	posterName: {
		fontSize: 15,
		fontWeight: '700',
		color: '#052E2B',
	},
	postDate: {
		marginTop: 2,
		color: '#0F766E',
		fontSize: 12,
	},
	statusPill: {
		backgroundColor: '#CCFBF1',
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 999,
	},
	statusPillText: {
		color: '#115E59',
		fontSize: 11,
		fontWeight: '700',
	},
	postTitle: {
		flex: 1,
		fontSize: 17,
		fontWeight: '700',
		color: '#052E2B',
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		marginBottom: 4,
	},
	detailsButton: {
		backgroundColor: '#0F766E',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
	},
	detailsButtonText: {
		color: '#FFFFFF',
		fontSize: 12,
		fontWeight: '700',
	},
	postDescription: {
		fontSize: 14,
		lineHeight: 20,
		color: '#134E4A',
	},
	postImage: {
		width: '100%',
		height: 210,
		borderRadius: 12,
		marginTop: 12,
		backgroundColor: '#F0FDFA',
	},
	emptyCard: {
		marginTop: 8,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 18,
		borderWidth: 1,
		borderColor: '#CCFBF1',
	},
	emptyTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: '#052E2B',
		marginBottom: 6,
	},
	emptySubtitle: {
		fontSize: 14,
		color: '#115E59',
	},
});

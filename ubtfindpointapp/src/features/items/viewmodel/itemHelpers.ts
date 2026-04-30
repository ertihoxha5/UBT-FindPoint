import api from '../../../services/api';
import type { Item } from '../model/ItemModel';

export const getAssetUrl = (path?: string) => {
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

export const formatItemDate = (value?: string) => {
  if (!value) {
    return 'Now';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Now';
  }

  return date.toLocaleDateString();
};

export const formatRelativeItemDate = (value?: string) => {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    return 'Less than 1h ago';
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
};

export const getItemSearchText = (item: Item) =>
  [
    item.title,
    item.description,
    item.category_name,
    item.location_name,
    item.poster_name,
    item.fullName,
    item.reward,
    item.status,
    item.type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

export const filterItems = (
  items: Item[],
  query: string,
  selectedCategory: string,
  selectedLocation: string,
  selectedStatus: string
) =>
  items.filter((item) => {
    const matchesQuery = !query.trim() || getItemSearchText(item).includes(query.trim().toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category_name === selectedCategory;
    const matchesLocation = selectedLocation === 'All' || item.location_name === selectedLocation;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus.toLowerCase();

    return matchesQuery && matchesCategory && matchesLocation && matchesStatus;
  });

export const uniqueItemValues = (items: Item[], key: 'category_name' | 'location_name') => {
  const values = Array.from(new Set(items.map((item) => item[key]).filter(Boolean)));
  return ['All', ...values] as string[];
};

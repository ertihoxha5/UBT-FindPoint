import type { Media } from './MediaModel';

export type Item = {
  item_id: number;
  title: string;
  description?: string;

  type: 'lost' | 'found';
  status: 'open' | 'claimed' | 'resolved' | 'expired';

  category_id: number;
  location_id: number;

  found_date?: string;
  reward?: string;

  is_anonymous: boolean;

  created_at?: string;
  updated_at?: string;
  media: Media[];
};
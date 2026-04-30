import type { Media } from './MediaModel';

export type Item = {
  item_id: number;
  user_id?: number | null;
  title: string;
  description?: string;

  type: 'lost' | 'found';
  status: 'open' | 'claimed' | 'resolved' | 'expired';

  category_id: number;
  location_id: number;
  category_name?: string;
  location_name?: string;

  date?: string | Date;
  reward?: string;

  is_anonymous: boolean;

  created_at?: string;
  updated_at?: string;
  media: Media[];
  poster_name?: string;
  fullName?: string;
};


import { App } from '@/types';

export interface AppStoreMedia {
  screenshots: string[];
  preview_videos?: string[];
}

export interface AppStoreDetails {
  category?: string;
  rating?: number;
  rating_count?: number;
  description?: string;
  price?: number;
  currency?: string;
  content_rating?: string;
  version?: string;
  release_notes?: string;
}

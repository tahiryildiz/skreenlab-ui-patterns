
export interface App {
  id: string;
  name: string;
  icon_url?: string;
  platform: 'iOS' | 'Android' | 'Web';
  publisher?: string;
  screenshots_count?: number;
}

export interface Screenshot {
  id: string;
  app_name: string;
  image_url: string;
  category: ScreenCategory;
  tags: string[];
  uploaded_at: string;
  description?: string;
}

export type ScreenCategory = 
  | 'onboarding'
  | 'entry'
  | 'home'
  | 'profile'
  | 'menu'
  | 'auth'
  | 'stats'
  | 'calendar'
  | 'settings'
  | 'AppStoreScreenshots'
  | 'other';

export const CATEGORIES: ScreenCategory[] = [
  'onboarding',
  'entry',
  'home',
  'profile',
  'menu',
  'auth',
  'stats',
  'calendar',
  'settings',
  'AppStoreScreenshots',
  'other'
];

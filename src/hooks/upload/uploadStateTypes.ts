
import { App } from '@/types';
import { UploadScreenshot } from '@/types/upload';

export type UploadStep = 1 | 2 | 3 | 4 | 5;

export type TagStep = 'category' | 'elements';

export interface UploadState {
  step: UploadStep;
  appStoreLink: string;
  appMetadata: App | null;
  heroImages?: string[];
  heroVideos?: string[];
  screenshots: UploadScreenshot[];
  currentScreenshotIndex: number;
  tagStep: TagStep;
  timestamp?: number;
}

export interface SerializedScreenshot {
  dataUrl: string;
  screenCategoryId: string | null;
  uiElementIds: string[];
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  hasFile: boolean;
}

export interface SerializedUploadState extends Omit<UploadState, 'screenshots'> {
  screenshots: SerializedScreenshot[];
  timestamp: number;
}

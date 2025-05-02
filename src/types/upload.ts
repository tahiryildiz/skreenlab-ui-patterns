
export type UploadScreenshot = {
  file: File;
  dataUrl: string;
  screenCategoryId: string | null;
  uiElementIds: string[];
  isHero?: boolean;
  heroPosition?: number; // Position in hero images (1, 2, 3)
};

export type StoreScreenshot = {
  url: string;
  isSelected: boolean;
  heroPosition?: number; // Position in hero images (1, 2, 3) 
};

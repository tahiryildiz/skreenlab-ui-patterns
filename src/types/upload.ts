
export type UploadScreenshot = {
  file: File;
  dataUrl: string;
  screenCategoryId: string | null;
  uiElementIds: string[];
  isHero?: boolean;
};

export type StoreScreenshot = {
  url: string;
  isSelected: boolean;
};

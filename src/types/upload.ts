
export type UploadScreenshot = {
  file: File;
  dataUrl: string;
  screenCategoryId: string | null;
  uiElementIds: string[];
};

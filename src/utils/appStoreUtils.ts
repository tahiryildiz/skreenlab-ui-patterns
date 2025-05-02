
/**
 * Validates if the provided link is a valid app store link
 */
export const isValidStoreLink = (link: string): boolean => {
  return Boolean(
    link && 
    (link.includes('apps.apple.com') || 
     link.includes('play.google.com') || 
     link.includes('appstore.com'))
  );
};

/**
 * Determines if the given link is for an iOS app
 */
export const isIOSAppLink = (link: string): boolean => {
  return link.includes('apps.apple.com') || link.includes('appstore.com');
};

/**
 * Determines if the given link is for an Android app
 */
export const isAndroidAppLink = (link: string): boolean => {
  return link.includes('play.google.com');
};

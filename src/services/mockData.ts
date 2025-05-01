
import { App, Screenshot, ScreenCategory } from "../types";

// Mock Apps
export const mockApps: App[] = [
  {
    id: "1",
    name: "Instagram",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png",
    platform: "iOS",
    publisher: "Meta",
    screenshots_count: 12
  },
  {
    id: "2",
    name: "Spotify",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png",
    platform: "iOS",
    publisher: "Spotify AB",
    screenshots_count: 8
  },
  {
    id: "3",
    name: "Slack",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png",
    platform: "iOS",
    publisher: "Salesforce",
    screenshots_count: 10
  },
  {
    id: "4",
    name: "TikTok",
    icon_url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1024px-TikTok_logo.svg.png",
    platform: "Android",
    publisher: "ByteDance",
    screenshots_count: 9
  },
  {
    id: "5",
    name: "Notion",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    platform: "Web",
    publisher: "Notion Labs",
    screenshots_count: 7
  },
  {
    id: "6",
    name: "LinkedIn",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/800px-LinkedIn_logo_initials.png",
    platform: "iOS",
    publisher: "Microsoft",
    screenshots_count: 11
  },
  {
    id: "7",
    name: "Twitter",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/512px-Logo_of_Twitter.svg.png?20220821125553",
    platform: "Android",
    publisher: "Twitter Inc",
    screenshots_count: 6
  },
  {
    id: "8",
    name: "Airbnb",
    icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_logo_bélo.svg/512px-Airbnb_logo_bélo.svg.png?20140813142239",
    platform: "iOS",
    publisher: "Airbnb Inc",
    screenshots_count: 9
  }
];

// Generate mock screenshots based on apps
export const mockScreenshots: Screenshot[] = [
  // Instagram Screenshots
  {
    id: "101",
    app_name: "Instagram",
    image_url: "https://cdn.dribbble.com/users/1998175/screenshots/15459384/media/5a894440c38151498ffc1aa2c2c363e2.png?resize=400x300&vertical=center",
    category: "home",
    tags: ["feed", "social", "photos"],
    uploaded_at: "2023-09-15T12:00:00Z"
  },
  {
    id: "102",
    app_name: "Instagram",
    image_url: "https://cdn.dribbble.com/users/1998175/screenshots/15602909/media/10b2b36f4ebe6b5585f16539f25cf91b.png?resize=400x300&vertical=center",
    category: "profile",
    tags: ["user profile", "grid", "photos"],
    uploaded_at: "2023-09-16T14:30:00Z"
  },
  {
    id: "103",
    app_name: "Instagram",
    image_url: "https://cdn.dribbble.com/userupload/6660691/file/original-7207729282235d4012236df0bb5ce941.jpg?resize=400x300&vertical=center",
    category: "onboarding",
    tags: ["welcome", "registration"],
    uploaded_at: "2023-09-17T09:15:00Z"
  },
  
  // Spotify Screenshots
  {
    id: "201",
    app_name: "Spotify",
    image_url: "https://cdn.dribbble.com/users/153131/screenshots/16683088/media/0ca8c3ba46074a9dcd97d4117aae9d71.png?resize=400x300&vertical=center",
    category: "home",
    tags: ["music", "playlists", "recommendations"],
    uploaded_at: "2023-09-18T11:45:00Z"
  },
  {
    id: "202",
    app_name: "Spotify",
    image_url: "https://cdn.dribbble.com/users/2948332/screenshots/16225048/media/76a6fa8c8ef7387dd2df72f0dca140c9.jpg?resize=400x300&vertical=center",
    category: "stats",
    tags: ["listening history", "analytics", "wrapped"],
    uploaded_at: "2023-09-19T16:20:00Z"
  },

  // Slack Screenshots
  {
    id: "301",
    app_name: "Slack",
    image_url: "https://cdn.dribbble.com/users/792073/screenshots/16331368/media/3104cb56f698fd350b7b1bfb1ed27df2.png?resize=400x300&vertical=center",
    category: "home",
    tags: ["chat", "channels", "messages"],
    uploaded_at: "2023-09-20T10:10:00Z"
  },
  {
    id: "302",
    app_name: "Slack",
    image_url: "https://cdn.dribbble.com/users/5031392/screenshots/15467520/media/89a0d08006a0e6a4ffd5b5258d2a1011.png?resize=400x300&vertical=center",
    category: "settings",
    tags: ["preferences", "notifications", "theme"],
    uploaded_at: "2023-09-21T13:05:00Z"
  },

  // TikTok Screenshots
  {
    id: "401",
    app_name: "TikTok",
    image_url: "https://cdn.dribbble.com/users/5031392/screenshots/16829105/media/7abbccd290691d908cf2ffb2daa8c7af.png?resize=400x300&vertical=center",
    category: "home",
    tags: ["video feed", "trending", "foryou"],
    uploaded_at: "2023-09-22T09:30:00Z"
  },
  {
    id: "402",
    app_name: "TikTok",
    image_url: "https://cdn.dribbble.com/users/1189590/screenshots/16669483/media/3bab339b7c38ab56ef0ef8fb675efe37.png?resize=400x300&vertical=center",
    category: "profile",
    tags: ["user videos", "likes", "followers"],
    uploaded_at: "2023-09-23T15:15:00Z"
  }
];

export const getAppById = (id: string): App | undefined => {
  return mockApps.find(app => app.id === id);
};

export const getScreenshotsByApp = (appName: string): Screenshot[] => {
  return mockScreenshots.filter(screenshot => screenshot.app_name === appName);
};

export const getScreenshotById = (id: string): Screenshot | undefined => {
  return mockScreenshots.find(screenshot => screenshot.id === id);
};

export const getScreenshotsByCategory = (category: ScreenCategory): Screenshot[] => {
  return mockScreenshots.filter(screenshot => screenshot.category === category);
};

export interface TutorialVideo {
  id: string;
  name: string;
  thumbnailLink?: string;
  resourceKey?: string;
  videoMediaMetadata?: { durationMillis?: string };
  savedVideo: { id: number; link: string };
}

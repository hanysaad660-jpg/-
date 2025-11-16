export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export enum AppMode {
  CHAT = 'chat',
  IMAGE = 'image',
  VIDEO = 'video',
  LIVE = 'live',
  SCREEN_REC = 'screen_rec',
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface MediaContent {
  type: 'image' | 'audio' | 'video';
  data: string; // base64 for image/audio, URL for video
  mimeType?: string;
}

export interface TextContent {
  type: 'text';
  data: string;
}

export interface LoadingContent {
  type: 'loading';
  data: string; // Loading message
  expectedType?: 'text' | 'image' | 'video';
}

export interface ErrorContent {
  type: 'error';
  data: string;
}

export type MessageContent = TextContent | MediaContent | LoadingContent | ErrorContent;

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: MessageContent[];
  sources?: GroundingSource[];
}

export interface UploadedFile {
  name: string;
  mimeType: string;
  type: 'image' | 'audio' | 'video' | 'document';
  // One of the following should be present
  base64?: string;
  textContent?: string;
}
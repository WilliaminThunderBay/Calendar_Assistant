
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Video } from '@google/genai';

export type Region = 'Domestic' | 'Penang' | 'Kuala Lumpur' | 'Kuantan' | 'Johor Bahru' | 'Kuching';
export type Role = 'Owner' | 'Editor' | 'Commenter' | 'Viewer';

export interface Task {
  id: number;
  number: string; // 工单号
  plate: string; // 车牌
  staff: string; // 员工
  date: string; // YYYY-MM-DD
  time: string; // HH:MM-HH:MM
  location: string; // 地点
  service: string; // 服务类型 (Workflow stage)
  note?: string;
  color: 'red' | 'blue' | 'green' | 'orange' | 'white';
  type: string; // 工程单/常规
  region: Region;
  images: string[]; // Array of image URLs/Base64
  tags: string[]; // ['S', 'wp', 'p']
}

export interface User {
  id: number;
  name: string;
  initials: string;
  color: string;
  isOnline: boolean;
  region: Region;
  role: Role;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  avatar: string; // URL or base64
  role: Role;
}

export interface Comment {
  id: string;
  taskId: number;
  userId: number;
  userName: string;
  userInitials: string;
  userColor: string;
  content: string;
  createdAt: string;
  resolved: boolean;
}

export interface ActivityLog {
  id: string;
  taskId?: number; // if null, global/calendar level
  userId: number;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'comment' | 'suggestion';
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string; // base64 or url
  size: number;
}

export interface ChatMessage {
  id: string;
  userId: number;
  userName: string;
  userColor: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
}

export interface FileItem {
  id: string;
  name: string;
  type: string; // 'pdf', 'doc', 'image', etc.
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  folderId?: string;
  sourceMessageId?: string; // Link back to chat
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export type ViewMode = 'month' | 'week' | 'day';

export interface AIAnalysisResult {
  message: string;
  suggestedTasks?: Partial<Task>[];
}

// Video Generation Types
export enum VeoModel {
  VEO = 'veo-3.1-generate-preview',
  VEO_FAST = 'veo-3.1-fast-generate-preview',
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  EXTEND_VIDEO = 'Extend Video',
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface VideoFile {
  file: File;
  base64: string;
}

export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  startFrame: ImageFile | null;
  endFrame: ImageFile | null;
  referenceImages: ImageFile[];
  styleImage: ImageFile | null;
  inputVideo: VideoFile | null;
  inputVideoObject: Video | null;
  isLooping: boolean;
}

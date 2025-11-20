/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Video } from '@google/genai';

export interface Task {
  id: number;
  number: string; // 工单号
  plate: string; // 车牌
  staff: string; // 员工
  date: string; // YYYY-MM-DD
  time: string; // HH:MM-HH:MM
  location: string; // 地点
  service: string; // 服务类型
  note?: string;
  color: 'red' | 'blue' | 'green' | 'orange' | 'white';
  type: string; // 工程单/常规
}

export interface User {
  id: number;
  name: string;
  initials: string;
  color: string;
  isOnline: boolean;
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

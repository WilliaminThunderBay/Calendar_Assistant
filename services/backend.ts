
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Task, User, ChatMessage, FileItem, Folder, ActivityLog, UserProfile, Region, Comment } from '../types';

// --- Initial Seed Data (The "Migration") ---
const initialTasks: Task[] = [
  { id: 1, number: 'W001', plate: '沪A·88888', staff: '李明', date: '2024-10-20', time: '19:00-22:00', location: '浦东陆家嘴', note: '晚上必须完成', color: 'red', type: '常规订单', service: '安装', region: 'Domestic', images: [], tags: ['S', 'wp'] },
  { id: 2, number: 'G001', plate: '沪B·12345', staff: '李明', date: '2024-10-20', time: '20:00-23:00', location: '浦西外滩', note: '加班单', color: 'red', type: '工程单', service: '安装', region: 'Domestic', images: [], tags: [] },
  { id: 3, number: 'W002', plate: 'PG-9999', staff: '张三', date: '2024-10-21', time: '08:00-11:00', location: 'George Town', note: '', color: 'blue', type: '常规订单', service: '量尺', region: 'Penang', images: [], tags: ['p'] },
  { id: 4, number: 'G002', plate: 'KL-5432', staff: '王五', date: '2024-10-21', time: '14:00-17:00', location: 'Bukit Bintang', note: '工程单', color: 'orange', type: '工程单', service: '安装', region: 'Kuala Lumpur', images: [], tags: ['S'] },
];

const initialStaff = ['李明', '张三', '王五', '赵六', 'Ali', 'Ah Hock'];
const initialServices = ['下单/待处理', '量尺', '安装', '售后'];

const initialUserProfile: UserProfile = {
  name: 'Admin User',
  email: 'admin@example.com',
  phone: '+86 138 0000 0000',
  whatsapp: '',
  avatar: '',
  role: 'Owner'
};

const initialChatMessages: ChatMessage[] = [
  { id: '1', userId: 2, userName: '李明', userColor: '#ec4899', content: '大家好，今天的安装任务都确认了吗？', timestamp: new Date(Date.now() - 3600000).toISOString() }
];

const initialActivities: ActivityLog[] = [
  { id: '1', userId: 2, userName: '李明', action: '创建工单', details: '创建了 W001', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'create' }
];

// --- Storage Keys ---
const KEYS = {
  TASKS: 'veo_tasks',
  STAFF: 'veo_staff',
  SERVICES: 'veo_services',
  PROFILE: 'veo_profile',
  CHAT: 'veo_chat',
  FILES: 'veo_files',
  FOLDERS: 'veo_folders',
  ACTIVITY: 'veo_activity',
  COMMENTS: 'veo_comments'
};

// --- Backend Service Class ---
class BackendService {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(KEYS.TASKS)) {
      console.log('Initializing Database...');
      this.save(KEYS.TASKS, initialTasks);
      this.save(KEYS.STAFF, initialStaff);
      this.save(KEYS.SERVICES, initialServices);
      this.save(KEYS.PROFILE, initialUserProfile);
      this.save(KEYS.CHAT, initialChatMessages);
      this.save(KEYS.ACTIVITY, initialActivities);
      this.save(KEYS.FILES, []);
      this.save(KEYS.FOLDERS, [
        { id: '1', name: '安装流程文档', createdAt: new Date().toISOString() },
        { id: '2', name: '产品手册', createdAt: new Date().toISOString() }
      ]);
      this.save(KEYS.COMMENTS, []);
    }
  }

  private get<T>(key: string): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private save(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- TASKS API ---
  getTasks(): Task[] {
    return this.get<Task[]>(KEYS.TASKS);
  }

  saveTask(task: Task): Task {
    const tasks = this.getTasks();
    let updatedTask = task;
    
    if (task.id) {
      const index = tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        tasks[index] = task;
      }
    } else {
      updatedTask = { ...task, id: Math.max(0, ...tasks.map(t => t.id)) + 1 };
      tasks.push(updatedTask);
    }
    this.save(KEYS.TASKS, tasks);
    return updatedTask;
  }

  deleteTask(id: number) {
    const tasks = this.getTasks();
    this.save(KEYS.TASKS, tasks.filter(t => t.id !== id));
  }

  // --- STAFF & SERVICES API ---
  getStaff(): string[] { return this.get(KEYS.STAFF); }
  addStaff(name: string) {
    const list = this.getStaff();
    if (!list.includes(name)) {
      list.push(name);
      this.save(KEYS.STAFF, list);
    }
  }

  getServices(): string[] { return this.get(KEYS.SERVICES); }
  addService(name: string) {
    const list = this.getServices();
    if (!list.includes(name)) {
      list.push(name);
      this.save(KEYS.SERVICES, list);
    }
  }

  // --- USER PROFILE API ---
  getProfile(): UserProfile { return this.get(KEYS.PROFILE); }
  updateProfile(profile: UserProfile) { this.save(KEYS.PROFILE, profile); }

  // --- CHAT API ---
  getChatMessages(): ChatMessage[] { return this.get(KEYS.CHAT); }
  addChatMessage(msg: ChatMessage) {
    const list = this.getChatMessages();
    // Limit chat history to last 100 messages for localStorage performance
    const newList = [...list, msg].slice(-100);
    this.save(KEYS.CHAT, newList);
  }

  // --- FILES API ---
  getFiles(): FileItem[] { return this.get(KEYS.FILES); }
  getFolders(): Folder[] { return this.get(KEYS.FOLDERS); }
  
  uploadFile(file: FileItem) {
    const list = this.getFiles();
    list.unshift(file);
    this.save(KEYS.FILES, list);
  }
  
  createFolder(name: string) {
    const list = this.getFolders();
    list.push({ id: Date.now().toString(), name, createdAt: new Date().toISOString() });
    this.save(KEYS.FOLDERS, list);
  }

  // --- ACTIVITY & COMMENTS API ---
  getActivities(): ActivityLog[] { return this.get(KEYS.ACTIVITY); }
  logActivity(log: ActivityLog) {
    const list = this.getActivities();
    list.unshift(log);
    this.save(KEYS.ACTIVITY, list.slice(0, 50));
  }

  getComments(): Comment[] { return this.get(KEYS.COMMENTS); }
  addComment(comment: Comment) {
    const list = this.getComments();
    list.push(comment);
    this.save(KEYS.COMMENTS, list);
  }
}

export const backend = new BackendService();

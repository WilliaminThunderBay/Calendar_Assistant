
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { Task, ViewMode, Region, UserProfile, Comment, ActivityLog, ChatMessage, User, FileItem, Folder, Attachment } from './types';
import { CalendarIcon, PlusIcon, BotIcon, BellIcon, MapPinIcon, UserIcon, ShareIcon, UsersIcon, XIcon } from './components/icons';
import Calendar from './components/Calendar';
import TaskModal from './components/TaskModal';
import AIAssistant from './components/AIAssistant';
import UserProfileView from './components/UserProfile';
import CollaborationSidebar from './components/CollaborationSidebar';
import ShareModal from './components/ShareModal';
import { backend } from './services/backend';

const regions: Region[] = ['Domestic', 'Penang', 'Kuala Lumpur', 'Kuantan', 'Johor Bahru', 'Kuching'];

const mockOnlineUsers: User[] = [
  { id: 1, name: 'Admin', initials: 'AD', color: '#4f46e5', isOnline: true, region: 'Domestic', role: 'Owner' },
  { id: 2, name: '李明', initials: 'LM', color: '#ec4899', isOnline: true, region: 'Domestic', role: 'Editor' },
  { id: 3, name: 'Ali', initials: 'AL', color: '#10b981', isOnline: true, region: 'Penang', role: 'Editor' },
  { id: 4, name: 'Sarah', initials: 'SA', color: '#f59e0b', isOnline: true, region: 'Kuala Lumpur', role: 'Viewer' },
  { id: 5, name: 'Tan', initials: 'TA', color: '#8b5cf6', isOnline: true, region: 'Penang', role: 'Viewer' },
  { id: 6, name: 'Wang', initials: 'WA', color: '#3b82f6', isOnline: true, region: 'Domestic', role: 'Editor' },
  { id: 7, name: 'Chen', initials: 'CH', color: '#ef4444', isOnline: true, region: 'Johor Bahru', role: 'Viewer' },
  { id: 8, name: 'David', initials: 'DA', color: '#f97316', isOnline: true, region: 'Domestic', role: 'Editor' },
  { id: 9, name: 'Eric', initials: 'ER', color: '#84cc16', isOnline: true, region: 'Kuching', role: 'Viewer' },
  { id: 10, name: 'Frank', initials: 'FR', color: '#06b6d4', isOnline: true, region: 'Domestic', role: 'Commenter' },
  { id: 11, name: 'Grace', initials: 'GR', color: '#d946ef', isOnline: true, region: 'Penang', role: 'Viewer' },
];

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'calendar' | 'profile'>('calendar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State (Loaded from Backend)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffList, setStaffList] = useState<string[]>([]);
  const [serviceList, setServiceList] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentRegion, setCurrentRegion] = useState<Region>('Domestic');
  const [userProfile, setUserProfile] = useState<UserProfile>(backend.getProfile());
  
  // Collaboration State
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);

  // UI State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isOnlineUsersModalOpen, setIsOnlineUsersModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // --- Initial Data Load ---
  const refreshData = () => {
    setTasks(backend.getTasks());
    setStaffList(backend.getStaff());
    setServiceList(backend.getServices());
    setUserProfile(backend.getProfile());
    setChatMessages(backend.getChatMessages());
    setActivities(backend.getActivities());
    setFiles(backend.getFiles());
    setFolders(backend.getFolders());
    setComments(backend.getComments());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.region === currentRegion);
  }, [tasks, currentRegion]);

  // --- Actions ---
  const logActivity = (action: string, details: string, taskId?: number, type: ActivityLog['type'] = 'update') => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      taskId,
      userId: 1, // Current User ID
      userName: userProfile.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    backend.logActivity(newLog);
    setActivities(backend.getActivities());
  };

  const handleTaskSave = (task: Task) => {
    let finalColor = task.color;
    if (task.number.toUpperCase().startsWith('G')) {
      finalColor = 'orange';
    } else if (task.note?.includes('加班') || task.note?.includes('晚上')) {
      finalColor = 'red';
    }

    const taskToSave = { ...task, color: finalColor };
    
    // Activity Logging Logic
    if (task.id) {
      const oldTask = tasks.find(t => t.id === task.id);
      let changes = [];
      if (oldTask) {
        if (oldTask.date !== taskToSave.date) changes.push(`日期: ${oldTask.date} -> ${taskToSave.date}`);
        if (oldTask.time !== taskToSave.time) changes.push(`时间: ${oldTask.time} -> ${taskToSave.time}`);
        if (oldTask.staff !== taskToSave.staff) changes.push(`人员: ${oldTask.staff} -> ${taskToSave.staff}`);
        if (oldTask.service !== taskToSave.service) changes.push(`状态: ${oldTask.service} -> ${taskToSave.service}`);
      }
      if (changes.length > 0) {
        logActivity('更新工单', `${task.number}: ${changes.join(', ')}`, task.id, 'update');
      }
    } else {
      // New Task - ID will be assigned by backend
      logActivity('创建工单', `新建了 ${taskToSave.number}`, undefined, 'create'); // ID unknown yet
    }

    backend.saveTask(taskToSave);
    refreshData();
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (window.confirm('确定要删除此工单吗？')) {
      if (task) logActivity('删除工单', `删除了 ${task.number}`, id, 'delete');
      backend.deleteTask(id);
      refreshData();
      setIsTaskModalOpen(false);
      setEditingTask(undefined);
    }
  };

  const handleAddComment = (taskId: number, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      taskId,
      userId: 1,
      userName: userProfile.name,
      userInitials: userProfile.name.substring(0, 2).toUpperCase(),
      userColor: '#4f46e5',
      content,
      createdAt: new Date().toISOString(),
      resolved: false
    };
    backend.addComment(newComment);
    
    const task = tasks.find(t => t.id === taskId);
    if (task) logActivity('评论工单', `${task.number}: ${content}`, taskId, 'comment');
    refreshData();
  };

  const handleGlobalSendMessage = (msg: string, attachments?: Attachment[]) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: 1,
      userName: userProfile.name,
      userColor: '#4f46e5',
      content: msg,
      timestamp: new Date().toISOString(),
      attachments
    };
    backend.addChatMessage(newMsg);
    refreshData();
  };

  const handleUploadFile = (file: File, folderId?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: e.target?.result as string,
        uploadedBy: userProfile.name,
        uploadedAt: new Date().toISOString(),
        folderId
      };
      backend.uploadFile(newFile);
      refreshData();
    };
    reader.readAsDataURL(file);
  };

  const handleCreateFolder = (name: string) => {
    backend.createFolder(name);
    refreshData();
  };

  const handleCreateTaskFromChat = (text: string) => {
    const newTask: Partial<Task> = {
       note: text,
       date: currentDate.toISOString().split('T')[0],
       region: currentRegion,
       color: 'white',
       type: '常规订单'
    };
    setEditingTask(newTask);
    setIsTaskModalOpen(true);
    setIsSidebarOpen(false);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    backend.updateProfile(profile);
    refreshData();
  };

  const handleAddTask = (dateStr?: string) => {
    setEditingTask({ 
      date: dateStr || currentDate.toISOString().split('T')[0],
      region: currentRegion 
    });
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddStaff = (name: string) => {
    backend.addStaff(name);
    refreshData();
  };

  const handleAddService = (name: string) => {
    backend.addService(name);
    refreshData();
  };

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleAIProposals = (proposedTasks: Partial<Task>[]) => {
    if (proposedTasks.length > 0) {
      setEditingTask({ ...proposedTasks[0], region: currentRegion });
      setIsTaskModalOpen(true);
    }
  };

  // --- View Switching ---
  if (view === 'profile') {
    return (
      <UserProfileView 
        profile={userProfile}
        onUpdate={handleUpdateProfile}
        onBack={() => setView('calendar')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col" onClick={() => {
      setShowNotifications(false);
      setShowProfile(false);
    }}>
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg sticky top-0 z-30" onClick={e => e.stopPropagation()}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              工程安装月历
            </h1>
            
            {/* Region Selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-sm transition-colors">
                <MapPinIcon className="w-4 h-4" />
                {currentRegion}
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2 text-gray-800 z-50">
                {regions.map(r => (
                  <button
                    key={r}
                    onClick={() => setCurrentRegion(r)}
                    className={`w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm ${currentRegion === r ? 'text-indigo-600 font-bold bg-indigo-50' : ''}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Online Status - Avatars */}
            <button 
              onClick={() => setIsOnlineUsersModalOpen(true)}
              className="hidden md:flex items-center bg-white/10 hover:bg-white/20 transition-colors cursor-pointer rounded-full px-2 py-1 border border-white/10" 
              title="点击查看在线人员详情"
            >
               <div className="flex -space-x-2 overflow-hidden p-1">
                {mockOnlineUsers.slice(0, 10).map((user, idx) => (
                  <div
                    key={user.id}
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white relative transition-transform hover:scale-110 hover:z-20"
                    style={{ backgroundColor: user.color, zIndex: 10 - idx }}
                    title={`${user.name} (${user.role})`}
                  >
                    {user.initials}
                  </div>
                ))}
                {mockOnlineUsers.length > 10 && (
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gray-400 flex items-center justify-center text-[10px] font-bold text-white relative z-0">
                    +{mockOnlineUsers.length - 10}
                  </div>
                )}
              </div>
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-2 mr-1"></div>
            </button>

            {/* Share Button */}
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors" 
              title="分享日历"
            >
               <ShareIcon className="w-5 h-5" />
            </button>

            {/* Toggle Sidebar */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-full transition-colors ${isSidebarOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
              title="协作中心"
            >
               <UsersIcon className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-white/10 rounded-full relative transition-colors"
              >
                <BellIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-indigo-600"></span>
              </button>
              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 text-gray-800 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-gray-100 font-bold text-sm text-gray-500">通知中心</div>
                  <div className="max-h-64 overflow-y-auto">
                    {activities.slice(0, 5).map(act => (
                      <div key={act.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-none">
                        <div className="text-sm font-medium text-indigo-600">{act.userName} {act.action}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{act.details}</div>
                        <div className="text-xs text-gray-400 mt-1">{new Date(act.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="w-9 h-9 bg-indigo-800 rounded-full flex items-center justify-center border-2 border-indigo-400 font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm overflow-hidden"
              >
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userProfile.name.substring(0, 2).toUpperCase()
                )}
              </button>
              {showProfile && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 text-gray-800 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="font-bold text-gray-800 truncate">{userProfile.name}</div>
                    <div className="text-xs text-gray-500 truncate">{userProfile.email}</div>
                    <div className="text-xs font-medium text-indigo-600 mt-1 px-1.5 py-0.5 bg-indigo-50 rounded inline-block">{userProfile.role}</div>
                  </div>
                  <button 
                    onClick={() => setView('profile')}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-3 text-gray-700"
                  >
                    <UserIcon className="w-4 h-4 text-gray-500" /> 个人设置 (My Profile)
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 flex items-center gap-3 border-t border-gray-100">
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Controls & Navigation */}
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col relative">
        
        {/* Main Calendar Area */}
        <div className="flex flex-col h-full">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6 shrink-0">
             <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
               <button 
                 onClick={() => setViewMode('day')} 
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'day' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
               >
                 日视图
               </button>
               <button 
                 onClick={() => setViewMode('month')} 
                 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'month' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
               >
                 月视图
               </button>
             </div>

             <div className="flex items-center gap-4">
               <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">&lt;</button>
               <h2 className="text-2xl font-bold text-gray-800">
                 {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
               </h2>
               <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-gray-200 rounded text-gray-500">&gt;</button>
               <button onClick={() => setCurrentDate(new Date())} className="text-sm text-indigo-600 font-medium px-3 py-1 bg-indigo-50 rounded-md ml-2">
                 今天
               </button>
             </div>

             <div className="flex gap-3">
               <button 
                 onClick={() => handleAddTask()} 
                 className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all"
               >
                 <PlusIcon className="w-4 h-4" /> 新建工单
               </button>
               <button 
                 onClick={() => setIsAIOpen(!isAIOpen)}
                 className={`flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${isAIOpen ? 'ring-2 ring-indigo-500 border-transparent' : 'hover:bg-gray-50'}`}
               >
                 <BotIcon className="w-4 h-4 text-purple-600" /> AI助手
               </button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col">
            <Calendar 
              tasks={filteredTasks} 
              currentDate={currentDate} 
              viewMode={viewMode}
              onTaskClick={handleEditTask}
              onAddClick={handleAddTask}
            />
          </div>
        </div>

        {/* Right Sidebar for Collaboration */}
        <CollaborationSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          activities={activities}
          chatMessages={chatMessages}
          onlineUsers={mockOnlineUsers}
          files={files}
          folders={folders}
          onSendMessage={handleGlobalSendMessage}
          onUploadFile={handleUploadFile}
          onCreateFolder={handleCreateFolder}
          onCreateTaskFromChat={handleCreateTaskFromChat}
          currentUser={{ name: userProfile.name, color: '#4f46e5' }}
        />
      </div>

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleTaskSave}
        onDelete={handleDeleteTask}
        initialData={editingTask}
        availableStaff={staffList}
        availableServices={serviceList}
        regions={regions}
        onAddStaff={handleAddStaff}
        onAddService={handleAddService}
        comments={editingTask?.id ? comments.filter(c => c.taskId === editingTask.id) : []}
        onAddComment={handleAddComment}
        taskActivities={editingTask?.id ? activities.filter(a => a.taskId === editingTask.id) : []}
      />

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />

      {/* Online Users Detail Modal */}
      {isOnlineUsersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <UsersIcon className="w-5 h-5" /> 在线人员 ({mockOnlineUsers.length})
              </h2>
              <button onClick={() => setIsOnlineUsersModalOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-2">
              {mockOnlineUsers.map(user => (
                <div key={user.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-none">
                  <div className="relative">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.initials}
                    </div>
                    {user.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">{user.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">{user.role}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{user.region}</span>
                      {user.isOnline ? <span className="text-green-600">● 在线</span> : <span className="text-gray-400">○ 离线</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AIAssistant 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
        currentDate={currentDate}
        tasks={filteredTasks}
        onTasksProposed={handleAIProposals}
      />

      {/* Floating AI Button */}
      {!isAIOpen && (
        <button 
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-8 left-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-20"
        >
          <BotIcon className="w-7 h-7" />
        </button>
      )}
    </div>
  );
};

export default App;

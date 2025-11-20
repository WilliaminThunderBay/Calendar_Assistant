
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import { Task, ViewMode, Region, UserProfile, Comment, ActivityLog, ChatMessage, User } from './types';
import { CalendarIcon, PlusIcon, BotIcon, BellIcon, MapPinIcon, UserIcon, ShareIcon, UsersIcon } from './components/icons';
import Calendar from './components/Calendar';
import TaskModal from './components/TaskModal';
import AIAssistant from './components/AIAssistant';
import UserProfileView from './components/UserProfile';
import CollaborationSidebar from './components/CollaborationSidebar';
import ShareModal from './components/ShareModal';

// Mock Data
const initialTasks: Task[] = [
  { id: 1, number: 'W001', plate: '沪A·88888', staff: '李明', date: '2024-10-20', time: '19:00-22:00', location: '浦东陆家嘴', note: '晚上必须完成', color: 'red', type: '常规订单', service: '安装', region: 'Domestic', images: [], tags: ['S', 'wp'] },
  { id: 2, number: 'G001', plate: '沪B·12345', staff: '李明', date: '2024-10-20', time: '20:00-23:00', location: '浦西外滩', note: '加班单', color: 'red', type: '工程单', service: '安装', region: 'Domestic', images: [], tags: [] },
  { id: 3, number: 'W002', plate: 'PG-9999', staff: '张三', date: '2024-10-21', time: '08:00-11:00', location: 'George Town', note: '', color: 'blue', type: '常规订单', service: '量尺', region: 'Penang', images: [], tags: ['p'] },
  { id: 4, number: 'G002', plate: 'KL-5432', staff: '王五', date: '2024-10-21', time: '14:00-17:00', location: 'Bukit Bintang', note: '工程单', color: 'orange', type: '工程单', service: '安装', region: 'Kuala Lumpur', images: [], tags: ['S'] },
];

const initialStaff = ['李明', '张三', '王五', '赵六', 'Ali', 'Ah Hock'];
const initialServices = ['下单/待处理', '量尺', '安装', '售后'];
const regions: Region[] = ['Domestic', 'Penang', 'Kuala Lumpur', 'Kuantan', 'Johor Bahru', 'Kuching'];

const mockOnlineUsers: User[] = [
  { id: 1, name: 'Admin', initials: 'AD', color: '#4f46e5', isOnline: true, region: 'Domestic', role: 'Owner' },
  { id: 2, name: '李明', initials: 'LM', color: '#ec4899', isOnline: true, region: 'Domestic', role: 'Editor' },
  { id: 3, name: 'Ali', initials: 'AL', color: '#10b981', isOnline: true, region: 'Penang', role: 'Editor' },
  { id: 4, name: 'Sarah', initials: 'SA', color: '#f59e0b', isOnline: true, region: 'Kuala Lumpur', role: 'Viewer' },
];

const App: React.FC = () => {
  // Navigation State
  const [view, setView] = useState<'calendar' | 'profile'>('calendar');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data State
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [staffList, setStaffList] = useState<string[]>(initialStaff);
  const [serviceList, setServiceList] = useState<string[]>(initialServices);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 20));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentRegion, setCurrentRegion] = useState<Region>('Domestic');
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+86 138 0000 0000',
    whatsapp: '',
    avatar: '',
    role: 'Owner'
  });

  // Collaboration State
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: '1', userId: 2, userName: '李明', action: '创建工单', details: '创建了 W001', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'create' }
  ]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', userId: 2, userName: '李明', userColor: '#ec4899', content: '大家好，今天的安装任务都确认了吗？', timestamp: new Date(Date.now() - 3600000).toISOString() }
  ]);

  // UI State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.region === currentRegion);
  }, [tasks, currentRegion]);

  // Add Activity Log Helper
  const addActivity = (action: string, details: string, taskId?: number, type: ActivityLog['type'] = 'update') => {
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
    setActivities(prev => [newLog, ...prev]);
  };

  const handleTaskSave = (task: Task) => {
    let finalColor = task.color;
    if (task.number.toUpperCase().startsWith('G')) {
      finalColor = 'orange';
    } else if (task.note?.includes('加班') || task.note?.includes('晚上')) {
      finalColor = 'red';
    }

    const taskToSave = { ...task, color: finalColor };

    if (task.id) {
      const oldTask = tasks.find(t => t.id === task.id);
      let changes = [];
      if (oldTask) {
        if (oldTask.date !== taskToSave.date) changes.push(`日期: ${oldTask.date} -> ${taskToSave.date}`);
        if (oldTask.time !== taskToSave.time) changes.push(`时间: ${oldTask.time} -> ${taskToSave.time}`);
        if (oldTask.staff !== taskToSave.staff) changes.push(`人员: ${oldTask.staff} -> ${taskToSave.staff}`);
      }
      
      if (changes.length > 0) {
        addActivity('更新工单', `${task.number}: ${changes.join(', ')}`, task.id, 'update');
      }

      setTasks(tasks.map(t => t.id === task.id ? taskToSave : t));
    } else {
      const newTask = { ...taskToSave, id: Math.max(0, ...tasks.map(t => t.id)) + 1 };
      setTasks([...tasks, newTask]);
      addActivity('创建工单', `新建了 ${newTask.number}`, newTask.id, 'create');
    }
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (window.confirm('确定要删除此工单吗？')) {
      if (task) addActivity('删除工单', `删除了 ${task.number}`, id, 'delete');
      setTasks(tasks.filter(t => t.id !== id));
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
    setComments(prev => [...prev, newComment]);
    // Also log as activity
    const task = tasks.find(t => t.id === taskId);
    if (task) addActivity('评论工单', `${task.number}: ${content}`, taskId, 'comment');
  };

  const handleGlobalSendMessage = (msg: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: 1,
      userName: userProfile.name,
      userColor: '#4f46e5',
      content: msg,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMsg]);
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
    if (name && !staffList.includes(name)) {
      setStaffList([...staffList, name]);
    }
  };

  const handleAddService = (name: string) => {
    if (name && !serviceList.includes(name)) {
      setServiceList([...serviceList, name]);
    }
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
        onUpdate={setUserProfile}
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
            {/* Online Status */}
            <div className="hidden md:flex bg-white/10 rounded-full px-3 py-1.5 items-center gap-2 border border-white/20 cursor-help" title="系统实时连接中">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-xs font-medium">{mockOnlineUsers.length}人在线</span>
            </div>

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
          onSendMessage={handleGlobalSendMessage}
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

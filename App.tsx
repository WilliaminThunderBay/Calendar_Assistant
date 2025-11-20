/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Task, ViewMode, User } from './types';
import { CalendarIcon, GridIcon, ListIcon, PlusIcon, SearchIcon, BotIcon, BellIcon } from './components/icons';
import Calendar from './components/Calendar';
import TaskModal from './components/TaskModal';
import AIAssistant from './components/AIAssistant';

// Mock Data
const initialTasks: Task[] = [
  { id: 1, number: 'W001', plate: '沪A·88888', staff: '李明', date: '2024-10-20', time: '19:00-22:00', location: '浦东陆家嘴', note: '晚上必须完成', color: 'red', type: '常规订单', service: '安装' },
  { id: 2, number: 'G001', plate: '沪B·12345', staff: '李明', date: '2024-10-20', time: '20:00-23:00', location: '浦西外滩', note: '加班单', color: 'red', type: '工程单', service: '安装' },
  { id: 3, number: 'W002', plate: '沪A·99999', staff: '张三', date: '2024-10-21', time: '08:00-11:00', location: '浦东世纪大道', note: '', color: 'blue', type: '常规订单', service: '量尺' },
  { id: 4, number: 'G002', plate: '沪B·54321', staff: '王五', date: '2024-10-21', time: '14:00-17:00', location: '虹口北外滩', note: '工程单', color: 'orange', type: '工程单', service: '安装' },
];

const availableStaff = ['李明', '张三', '王五', '赵六'];
const availableServices = ['量尺', '安装', '维修', '售后'];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 9, 20)); // Start at Oct 2024 for demo
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleTaskSave = (task: Task) => {
    if (task.id) {
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      const newTask = { ...task, id: Math.max(0, ...tasks.map(t => t.id)) + 1 };
      setTasks([...tasks, newTask]);
    }
    setIsTaskModalOpen(false);
    setEditingTask(undefined);
  };

  const handleAddTask = (dateStr?: string) => {
    setEditingTask({ date: dateStr || currentDate.toISOString().split('T')[0] });
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const handleAIProposals = (proposedTasks: Partial<Task>[]) => {
    // In a real app, you might want a confirmation step. 
    // Here we just open the modal for the first proposed task to verify/save
    if (proposedTasks.length > 0) {
      setEditingTask(proposedTasks[0]);
      setIsTaskModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              工程安装月历管理系统
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-full px-3 py-1.5 flex items-center gap-2 border border-white/20">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
               <span className="text-xs font-medium">4人在线</span>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full relative">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-indigo-800 rounded-full flex items-center justify-center border-2 border-indigo-400 font-bold text-xs">
              ME
            </div>
          </div>
        </div>
      </header>

      {/* Controls & Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
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

        {/* Main Calendar Area */}
        <Calendar 
          tasks={tasks} 
          currentDate={currentDate} 
          viewMode={viewMode}
          onTaskClick={handleEditTask}
          onAddClick={handleAddTask}
        />
      </div>

      {/* Modals */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleTaskSave}
        initialData={editingTask}
        availableStaff={availableStaff}
        availableServices={availableServices}
      />

      <AIAssistant 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
        currentDate={currentDate}
        tasks={tasks}
        onTasksProposed={handleAIProposals}
      />

      {/* Floating AI Button (if closed) */}
      {!isAIOpen && (
        <button 
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-20"
        >
          <BotIcon className="w-7 h-7" />
        </button>
      )}
    </div>
  );
};

export default App;

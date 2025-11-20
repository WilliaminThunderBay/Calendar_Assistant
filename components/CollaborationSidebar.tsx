
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { ActivityLog, ChatMessage, User } from '../types';
import { ChatIcon, HistoryIcon, UsersIcon, SendIcon, XIcon } from './icons';

interface CollaborationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityLog[];
  chatMessages: ChatMessage[];
  onlineUsers: User[];
  onSendMessage: (msg: string) => void;
  currentUser: { name: string; color: string };
}

const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({
  isOpen,
  onClose,
  activities,
  chatMessages,
  onlineUsers,
  onSendMessage,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'activity' | 'users'>('chat');
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-14 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between px-4 text-white shrink-0">
        <div className="font-bold flex items-center gap-2">
          <UsersIcon className="w-5 h-5" /> 协作中心
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
        >
          <ChatIcon className="w-4 h-4" /> 聊天
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'activity' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
        >
          <HistoryIcon className="w-4 h-4" /> 动态
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}
        >
          <UsersIcon className="w-4 h-4" /> 在线
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.userName === currentUser.name ? 'items-end' : 'items-start'}`}>
                   <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-600">{msg.userName}</span>
                      <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <div 
                    className={`px-3 py-2 rounded-lg max-w-[90%] text-sm shadow-sm ${
                      msg.userName === currentUser.name 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}
                   >
                     {msg.content}
                   </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 bg-white border-t border-gray-200 shrink-0">
               <form onSubmit={handleSend} className="flex gap-2">
                 <input 
                   value={input}
                   onChange={e => setInput(e.target.value)}
                   placeholder="输入消息..."
                   className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm outline-none transition-all"
                 />
                 <button type="submit" disabled={!input.trim()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors">
                   <SendIcon className="w-4 h-4" />
                 </button>
               </form>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="p-4 space-y-4">
            {activities.length === 0 && <p className="text-center text-gray-400 text-sm py-8">暂无动态</p>}
            {activities.map(log => (
              <div key={log.id} className="flex gap-3">
                 <div className="mt-1">
                   <div className={`w-2 h-2 rounded-full ${log.type === 'delete' ? 'bg-red-500' : log.type === 'create' ? 'bg-green-500' : 'bg-blue-500'}`} />
                 </div>
                 <div className="flex-1">
                   <p className="text-sm text-gray-800">
                     <span className="font-bold">{log.userName}</span> {log.action}
                   </p>
                   <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                   <p className="text-[10px] text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                 </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="p-4">
            <div className="space-y-2">
              {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                   <div 
                     className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white relative"
                     style={{ backgroundColor: user.color }}
                   >
                      {user.initials}
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                   </div>
                   <div>
                     <div className="text-sm font-medium text-gray-800">{user.name}</div>
                     <div className="text-xs text-gray-500">{user.region} • {user.role}</div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationSidebar;

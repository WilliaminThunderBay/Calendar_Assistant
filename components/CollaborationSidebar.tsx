
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { ActivityLog, ChatMessage, User, FileItem, Folder, Attachment } from '../types';
import { 
  ChatIcon, HistoryIcon, UsersIcon, SendIcon, XIcon, PaperclipIcon, 
  SmileIcon, FolderIcon, FileIcon, DownloadIcon, BrainIcon, SearchIcon,
  CloudIcon, PlusIcon, ImagesIcon
} from './icons';
import { summarizeChat } from '../services/geminiService';

interface CollaborationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityLog[];
  chatMessages: ChatMessage[];
  onlineUsers: User[];
  files: FileItem[];
  folders: Folder[];
  onSendMessage: (msg: string, attachments?: Attachment[]) => void;
  onUploadFile: (file: File, folderId?: string) => void;
  onCreateFolder: (name: string) => void;
  onCreateTaskFromChat: (text: string) => void;
  currentUser: { name: string; color: string };
}

const CollaborationSidebar: React.FC<CollaborationSidebarProps> = ({
  isOpen,
  onClose,
  activities,
  chatMessages,
  onlineUsers,
  files,
  folders,
  onSendMessage,
  onUploadFile,
  onCreateFolder,
  onCreateTaskFromChat,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'activity' | 'users'>('chat');
  const [input, setInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [aiTaskSuggestion, setAiTaskSuggestion] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonEmojis = ['👍', '👎', '😄', '😂', '🎉', '🚀', '🐛', '👀', '❤️', '🔥', '✅', '❌', '🤔', '😭', '🙏', '🤝', '💼', '📅', '📍', '🔧'];

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isOpen]);

  // AI Task Detection Regex (Simple heuristic)
  useEffect(() => {
    if (input.match(/(安装|量尺|维修|售后).*?(\d{1,2}[:：]\d{2}|明天|下午|上午)/)) {
      setAiTaskSuggestion("检测到可能的安装任务，是否创建工单？");
    } else {
      setAiTaskSuggestion(null);
    }
  }, [input]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (input.trim() || pendingAttachments.length > 0) {
      // Process attachments
      const attachments: Attachment[] = [];
      for (const file of pendingAttachments) {
        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = (e) => {
            attachments.push({
              id: Date.now().toString() + Math.random(),
              name: file.name,
              type: isImage ? 'image' : 'file',
              size: file.size,
              url: e.target?.result as string
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
        // Also upload to global files
        onUploadFile(file); 
      }

      onSendMessage(input, attachments.length > 0 ? attachments : undefined);
      setInput('');
      setPendingAttachments([]);
      setAiTaskSuggestion(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setPendingAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const newFiles = Array.from(e.clipboardData.files);
      setPendingAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    if (val.endsWith('@')) {
      setShowMentions(true);
      setMentionFilter('');
    } else if (showMentions) {
      const lastAt = val.lastIndexOf('@');
      if (lastAt !== -1) {
        setMentionFilter(val.substring(lastAt + 1));
      } else {
        setShowMentions(false);
      }
    }
  };

  const selectMention = (userName: string) => {
    const lastAt = input.lastIndexOf('@');
    setInput(input.substring(0, lastAt) + `@${userName} `);
    setShowMentions(false);
  };

  const handleAddEmoji = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const triggerAiSummary = async () => {
    const summary = await summarizeChat(chatMessages);
    // Insert as a special AI message locally or trigger callback
    onSendMessage(`\n${summary}`); // Simple way to show it
  };

  // Filtered data based on global search
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(globalSearch.toLowerCase()));
  const filteredMessages = chatMessages.filter(m => m.content.toLowerCase().includes(globalSearch.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col animate-in slide-in-from-right duration-300 font-sans">
      {/* Header & Search */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shrink-0">
        <div className="flex items-center justify-between mb-3">
           <div className="font-bold flex items-center gap-2 text-lg">
             <UsersIcon className="w-5 h-5" /> 协作中心
           </div>
           <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
             <XIcon className="w-5 h-5" />
           </button>
        </div>
        <div className="relative">
           <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-200" />
           <input 
             value={globalSearch}
             onChange={(e) => setGlobalSearch(e.target.value)}
             placeholder="AI 智能搜索聊天与文件..."
             className="w-full pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-indigo-200 focus:bg-white/20 focus:border-white/40 outline-none transition-all"
           />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
        <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
          <ChatIcon className="w-4 h-4" /> 聊天
        </button>
        <button onClick={() => setActiveTab('files')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'files' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
          <FolderIcon className="w-4 h-4" /> 文件
        </button>
        <button onClick={() => setActiveTab('activity')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors border-b-2 ${activeTab === 'activity' ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>
          <HistoryIcon className="w-4 h-4" /> 动态
        </button>
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 overflow-y-auto bg-gray-50/50 relative"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {dragActive && activeTab === 'chat' && (
           <div className="absolute inset-0 bg-indigo-500/10 border-2 border-dashed border-indigo-500 z-50 flex items-center justify-center backdrop-blur-sm">
             <div className="text-indigo-600 font-bold flex flex-col items-center">
               <CloudIcon className="w-12 h-12 mb-2" />
               <span>释放以上传文件</span>
             </div>
           </div>
        )}

        {/* --- CHAT TAB --- */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="bg-white px-4 py-2 border-b border-gray-100 flex justify-between items-center shadow-sm shrink-0 z-10">
               <span className="text-xs text-gray-500">今日消息</span>
               <button 
                 onClick={triggerAiSummary}
                 className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
               >
                 <BrainIcon className="w-3 h-3" /> AI 总结
               </button>
            </div>

            <div className="flex-1 p-4 space-y-5">
              {(globalSearch ? filteredMessages : chatMessages).map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.userName === currentUser.name ? 'items-end' : 'items-start'}`}>
                   <div className="flex items-baseline gap-2 mb-1 px-1">
                      <span className="text-xs font-bold text-gray-600">{msg.userName}</span>
                      <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                   <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm relative group ${
                      msg.userName === currentUser.name 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                    }`}>
                     <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                     
                     {/* Attachments */}
                     {msg.attachments && msg.attachments.length > 0 && (
                       <div className="mt-2 space-y-2">
                         {msg.attachments.map(att => (
                           <div key={att.id} className={`rounded overflow-hidden ${msg.userName === currentUser.name ? 'bg-indigo-500/30' : 'bg-gray-100'}`}>
                             {att.type === 'image' ? (
                               <img src={att.url} alt={att.name} className="max-w-full rounded cursor-zoom-in hover:opacity-90 transition-opacity" />
                             ) : (
                               <div className="flex items-center gap-3 p-2">
                                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 shrink-0">
                                   <FileIcon className="w-4 h-4" />
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <div className="truncate font-medium text-xs">{att.name}</div>
                                   <div className="text-[10px] opacity-70">{(att.size / 1024).toFixed(1)} KB</div>
                                 </div>
                                 <a href={att.url} download={att.name} className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors">
                                   <DownloadIcon className="w-3 h-3" />
                                 </a>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="bg-white border-t border-gray-200 shrink-0">
               {/* AI Suggestion Bubble */}
               {aiTaskSuggestion && (
                 <div className="mx-4 -mt-10 mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-2 rounded-lg shadow-lg flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
                   <div className="flex items-center gap-2">
                     <BrainIcon className="w-4 h-4 animate-pulse" />
                     <span>{aiTaskSuggestion}</span>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => setAiTaskSuggestion(null)} className="hover:bg-white/20 p-1 rounded">取消</button>
                     <button onClick={() => onCreateTaskFromChat(input)} className="bg-white text-indigo-600 px-2 py-1 rounded font-bold hover:bg-gray-100">创建</button>
                   </div>
                 </div>
               )}

               {/* Attachments Preview */}
               {pendingAttachments.length > 0 && (
                 <div className="px-4 pt-2 flex gap-2 overflow-x-auto">
                   {pendingAttachments.map((file, idx) => (
                     <div key={idx} className="relative group shrink-0">
                       <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                          ) : (
                            <FileIcon className="w-6 h-6" />
                          )}
                       </div>
                       <button 
                         onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}
                         className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         &times;
                       </button>
                     </div>
                   ))}
                 </div>
               )}

               <form onSubmit={handleSend} className="p-3 flex gap-2 relative">
                 {/* Mention Popup */}
                 {showMentions && (
                    <div className="absolute bottom-full left-3 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <div className="text-xs font-bold text-gray-400 px-3 py-2 bg-gray-50">提及成员</div>
                      {onlineUsers.filter(u => u.name.toLowerCase().includes(mentionFilter.toLowerCase())).map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => selectMention(u.name)}
                          className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm flex items-center gap-2"
                        >
                          <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ background: u.color }}>{u.initials}</span>
                          {u.name}
                        </button>
                      ))}
                    </div>
                 )}

                 <div className="flex-1 bg-gray-100 rounded-xl flex items-center px-2 border border-transparent focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all relative">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                       <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => { if(e.target.files) setPendingAttachments(prev => [...prev, ...Array.from(e.target.files!)]) }} />
                    
                    <input 
                      value={input}
                      onChange={handleInputChange}
                      onPaste={handlePaste}
                      placeholder="发送消息 (@提及, 拖拽文件)"
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 py-3 outline-none"
                    />
                    
                    {/* Emoji Picker Popup */}
                    {showEmojiPicker && (
                      <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                        <div className="p-2 grid grid-cols-5 gap-1 bg-gray-50">
                          {commonEmojis.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleAddEmoji(emoji)}
                              className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-xl transition-all"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-1.5 rounded-lg transition-colors ${showEmojiPicker ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                    >
                       <SmileIcon className="w-5 h-5" />
                    </button>
                 </div>
                 <button type="submit" disabled={!input.trim() && pendingAttachments.length === 0} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all">
                   <SendIcon className="w-5 h-5" />
                 </button>
               </form>
            </div>
          </div>
        )}

        {/* --- FILES TAB --- */}
        {activeTab === 'files' && (
          <div className="p-4 space-y-6 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><CloudIcon className="w-4 h-4"/> 共享云盘</h3>
                <div className="flex gap-2">
                   <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-600" title="新建文件夹"><PlusIcon className="w-4 h-4"/></button>
                   <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 rounded text-indigo-600" title="上传文件" onClick={() => fileInputRef.current?.click()}><PaperclipIcon className="w-4 h-4"/></button>
                </div>
             </div>

             {/* Folders */}
             <div className="grid grid-cols-2 gap-3">
                {folders.map(folder => (
                  <div key={folder.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                         <FolderIcon className="w-4 h-4" />
                       </div>
                     </div>
                     <div className="text-sm font-bold text-gray-800 truncate">{folder.name}</div>
                     <div className="text-[10px] text-gray-400">2024-10-20</div>
                  </div>
                ))}
             </div>

             {/* File List */}
             <div>
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">最近文件</h4>
               <div className="space-y-2">
                 {(globalSearch ? filteredFiles : files).map(file => (
                   <div key={file.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 group transition-colors">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                         {file.type.includes('image') ? <ImagesIcon className="w-5 h-5" /> : <FileIcon className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-800 truncate">{file.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                           <span>{(file.size / 1024).toFixed(1)} KB</span>
                           <span>•</span>
                           <span>{file.uploadedBy}</span>
                        </div>
                      </div>
                      <a href={file.url} download={file.name} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
                        <DownloadIcon className="w-4 h-4" />
                      </a>
                   </div>
                 ))}
                 {files.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">暂无文件</div>}
               </div>
             </div>
          </div>
        )}

        {/* --- USERS & ACTIVITY TABS (Simplified for brevity) --- */}
        {activeTab === 'users' && (
          <div className="p-4 space-y-3">
             {onlineUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white relative" style={{ backgroundColor: user.color }}>
                      {user.initials}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                   </div>
                   <div>
                     <div className="text-sm font-bold text-gray-800">{user.name}</div>
                     <div className="text-xs text-gray-500">{user.role} • {user.region}</div>
                   </div>
                </div>
             ))}
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="p-4 space-y-4">
             {activities.map(log => (
              <div key={log.id} className="flex gap-3">
                 <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${log.type === 'create' ? 'bg-green-500' : log.type === 'delete' ? 'bg-red-500' : 'bg-blue-500'}`} />
                 <div className="pb-3 border-b border-gray-100 last:border-none w-full">
                   <div className="text-sm text-gray-800">
                     <span className="font-bold">{log.userName}</span> {log.action}
                   </div>
                   <div className="text-xs text-gray-500 mt-0.5">{log.details}</div>
                   <div className="text-[10px] text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString()}</div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationSidebar;

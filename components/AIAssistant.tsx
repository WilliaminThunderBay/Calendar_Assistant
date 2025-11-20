/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { BotIcon, XIcon, SendIcon, SparklesIcon } from './icons';
import { analyzeScheduleRequest } from '../services/geminiService';
import { Task } from '../types';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  tasks: Task[];
  onTasksProposed: (tasks: Partial<Task>[]) => void;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, currentDate, tasks, onTasksProposed }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: '你好！我是工程日历的AI助手。我可以帮您查询日程、安排工单或分析工作量。请告诉我您的需求。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, tasks: proposedTasks } = await analyzeScheduleRequest(
        userMsg, 
        currentDate.toISOString().split('T')[0], 
        tasks
      );
      
      setMessages(prev => [...prev, { role: 'ai', content: text }]);
      
      if (proposedTasks && proposedTasks.length > 0) {
         onTasksProposed(proposedTasks);
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "抱歉，处理您的请求时出现错误。" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 z-40 animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
           <BotIcon className="w-6 h-6" />
           <span className="font-bold">智能助手</span>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><XIcon className="w-5 h-5"/></button>
      </div>

      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
         {messages.map((msg, idx) => (
           <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
               msg.role === 'user' 
                 ? 'bg-indigo-600 text-white rounded-br-none' 
                 : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
             }`}>
                {msg.content}
             </div>
           </div>
         ))}
         {isLoading && (
           <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex gap-1 items-center">
                <SparklesIcon className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span className="text-xs text-gray-500">AI正在思考...</span>
             </div>
           </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-colors">
          <input 
             className="flex-1 bg-transparent outline-none text-sm"
             placeholder="输入您的问题或指令..."
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="text-indigo-600 disabled:text-gray-400"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;

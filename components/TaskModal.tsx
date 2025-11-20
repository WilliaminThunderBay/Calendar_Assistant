
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Task, Region, Comment, ActivityLog } from '../types';
import { XIcon, MapPinIcon, UserIcon, WrenchIcon, ClockIcon, FileTextIcon, PlusIcon, CheckIcon, TrashIcon, ImagesIcon, MessageIcon, HistoryIcon, SendIcon } from './icons';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: number) => void;
  initialData?: Partial<Task>;
  availableStaff: string[];
  availableServices: string[];
  regions: Region[];
  onAddStaff: (name: string) => void;
  onAddService: (name: string) => void;
  // Collaboration props
  comments: Comment[];
  onAddComment: (taskId: number, content: string) => void;
  taskActivities: ActivityLog[];
}

const TimeColumn: React.FC<{
  options: string[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
}> = ({ options, value, onChange, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const selectedIdx = options.indexOf(value);
      if (selectedIdx >= 0) {
        const itemHeight = 40;
        containerRef.current.scrollTop = selectedIdx * itemHeight;
      }
    }
  }, [value, options, containerRef.current]);

  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-xs text-gray-400 mb-1 font-medium">{label}</span>}
      <div 
        ref={containerRef}
        className="h-32 overflow-y-auto w-16 bg-gray-50 rounded-lg border border-gray-200 snap-y snap-mandatory custom-scrollbar"
      >
        {options.map(opt => (
          <div
            key={opt}
            onClick={() => onChange(opt)}
            className={`h-10 flex items-center justify-center cursor-pointer snap-center transition-colors text-sm font-medium ${opt === value ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
};

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  initialData, 
  availableStaff, 
  availableServices,
  regions,
  onAddStaff,
  onAddService,
  comments,
  onAddComment,
  taskActivities
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'collab'>('details');
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState('');

  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timeParts, setTimeParts] = useState({ startHour: '09', startMin: '00', endHour: '12', endMin: '00' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const initialTask = initialData || {
        number: '',
        plate: '',
        staff: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00-12:00',
        location: '',
        service: '下单/待处理',
        note: '',
        color: 'white',
        type: '常规订单',
        region: 'Domestic',
        images: [],
        tags: []
      };
      setFormData(initialTask);
      
      if (initialTask.time && initialTask.time.includes('-')) {
        const [start, end] = initialTask.time.split('-');
        const [sh, sm] = start.split(':');
        const [eh, em] = end.split(':');
        setTimeParts({ startHour: sh || '09', startMin: sm || '00', endHour: eh || '12', endMin: em || '00' });
      }

      setIsAddingStaff(false);
      setIsAddingService(false);
      setNewStaffName('');
      setNewServiceName('');
      setShowTimePicker(false);
      setActiveTab('details');
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (activeTab === 'collab') {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, comments]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Task);
  };

  const handleConfirmAddStaff = () => {
    if (newStaffName.trim()) {
      onAddStaff(newStaffName.trim());
      setFormData(prev => ({ ...prev, staff: newStaffName.trim() }));
      setNewStaffName('');
      setIsAddingStaff(false);
    }
  };

  const handleConfirmAddService = () => {
    if (newServiceName.trim()) {
      onAddService(newServiceName.trim());
      setFormData(prev => ({ ...prev, service: newServiceName.trim() }));
      setNewServiceName('');
      setIsAddingService(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
           setFormData(prev => ({
             ...prev,
             images: [...(prev.images || []), ev.target!.result as string]
           }));
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const toggleTag = (tag: string) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tag)) {
      setFormData({ ...formData, tags: currentTags.filter(t => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
  };

  const handleSaveTime = () => {
    const newTime = `${timeParts.startHour}:${timeParts.startMin}-${timeParts.endHour}:${timeParts.endMin}`;
    setFormData(prev => ({ ...prev, time: newTime }));
    setShowTimePicker(false);
  };

  const handleSendComment = () => {
    if (newComment.trim() && initialData?.id) {
      onAddComment(initialData.id, newComment);
      setNewComment('');
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[95vh] flex flex-col">
        {/* Header with Tabs */}
        <div className="flex flex-col border-b border-gray-100 bg-gray-50 shrink-0">
           <div className="flex justify-between items-center p-4 pb-0">
            <h2 className="text-lg font-bold text-gray-800">{initialData?.id ? '编辑工单' : '新建工单'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex px-4 mt-4 gap-6">
            <button 
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              详情信息
            </button>
            <button 
              onClick={() => setActiveTab('collab')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'collab' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <HistoryIcon className="w-4 h-4" /> 协作与动态
              {comments.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{comments.length}</span>}
            </button>
          </div>
        </div>
        
        {activeTab === 'details' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto relative flex-1">
            {/* Time Picker Overlay */}
            {showTimePicker && (
              <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur flex flex-col items-center justify-center p-6 rounded-lg animate-in fade-in zoom-in-95 duration-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">选择时间段</h3>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex gap-1">
                    <TimeColumn options={hours} value={timeParts.startHour} onChange={(v) => setTimeParts(p => ({...p, startHour: v}))} label="开始时" />
                    <span className="self-center font-bold text-gray-400 mt-4">:</span>
                    <TimeColumn options={minutes} value={timeParts.startMin} onChange={(v) => setTimeParts(p => ({...p, startMin: v}))} label="分" />
                  </div>
                  <div className="h-px w-4 bg-gray-300 self-center mt-4"></div>
                  <div className="flex gap-1">
                    <TimeColumn options={hours} value={timeParts.endHour} onChange={(v) => setTimeParts(p => ({...p, endHour: v}))} label="结束时" />
                    <span className="self-center font-bold text-gray-400 mt-4">:</span>
                    <TimeColumn options={minutes} value={timeParts.endMin} onChange={(v) => setTimeParts(p => ({...p, endMin: v}))} label="分" />
                  </div>
                </div>
                <div className="flex gap-4 w-full max-w-xs">
                  <button type="button" onClick={() => setShowTimePicker(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200">取消</button>
                  <button type="button" onClick={handleSaveTime} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200">确定</button>
                </div>
              </div>
            )}

            {/* Row 1: Region & Number */}
            <div className="grid grid-cols-2 gap-5">
               <div>
                 <label className="block text-xs font-medium text-gray-500 mb-1.5">区域</label>
                 <select
                   name="region"
                   value={formData.region}
                   onChange={handleChange}
                   className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                 >
                   {regions.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
               </div>
               <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">工单号 (G开头为工程单)</label>
                <input
                  required
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none font-mono"
                  placeholder="例如: W001 或 G001"
                />
              </div>
            </div>

            {/* Row 2: Plate & Date */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">车牌号 *</label>
                <input
                  required
                  name="plate"
                  value={formData.plate}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  placeholder="沪A·88888"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">日期</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Staff & Time */}
            <div className="grid grid-cols-2 gap-5">
               <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                  <UserIcon className="w-3 h-3"/> 安装人员
                </label>
                {!isAddingStaff ? (
                  <div className="flex gap-2">
                    <select
                      name="staff"
                      value={formData.staff}
                      onChange={handleChange}
                      className="flex-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">选择人员</option>
                      {availableStaff.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button 
                      type="button"
                      onClick={() => setIsAddingStaff(true)}
                      className="flex-shrink-0 w-10 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 flex items-center justify-center"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-stretch">
                    <input
                      autoFocus
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="输入姓名"
                      className="flex-1 w-full px-3 py-2.5 bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-0"
                    />
                    <button type="button" onClick={handleConfirmAddStaff} className="flex-shrink-0 w-10 bg-green-50 text-green-600 border border-green-200 rounded-lg flex items-center justify-center hover:bg-green-100"><CheckIcon className="w-5 h-5" /></button>
                    <button type="button" onClick={() => setIsAddingStaff(false)} className="flex-shrink-0 w-10 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"><XIcon className="w-5 h-5" /></button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><ClockIcon className="w-3 h-3"/> 时间段</label>
                <div 
                  onClick={() => setShowTimePicker(true)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors flex items-center text-gray-700 select-none"
                >
                  {formData.time || '选择时间'}
                </div>
              </div>
            </div>

            {/* Workflow Stage (Service) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                <WrenchIcon className="w-3 h-3"/> 流程阶段 (服务类型)
              </label>
              {!isAddingService ? (
                <div className="flex gap-2">
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="flex-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">选择阶段</option>
                    {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setIsAddingService(true)}
                    className="flex-shrink-0 w-10 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 flex items-center justify-center"
                  >
                     <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 items-stretch">
                  <input
                    autoFocus
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="输入服务"
                    className="flex-1 w-full px-3 py-2.5 bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 min-w-0"
                  />
                  <button type="button" onClick={handleConfirmAddService} className="flex-shrink-0 w-10 bg-green-50 text-green-600 border border-green-200 rounded-lg flex items-center justify-center hover:bg-green-100"><CheckIcon className="w-5 h-5" /></button>
                  <button type="button" onClick={() => setIsAddingService(false)} className="flex-shrink-0 w-10 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100"><XIcon className="w-5 h-5" /></button>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
               <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> 地点</label>
               <input
                 name="location"
                 value={formData.location}
                 onChange={handleChange}
                 className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                 placeholder="请输入详细地址"
               />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><ImagesIcon className="w-3 h-3"/> 订单图片</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {formData.images?.map((img, idx) => (
                  <img key={idx} src={img} alt="Order" className="w-20 h-20 object-cover rounded border border-gray-200" />
                ))}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors bg-gray-50"
                >
                  <PlusIcon className="w-6 h-6" />
                  <span className="text-[10px]">上传</span>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>

            {/* Product Details (Tags) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">产品详情 (备注标签)</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => toggleTag('S')}
                  className={`px-3 py-1.5 rounded text-sm border ${formData.tags?.includes('S') ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  水盆 (S)
                </button>
                <button
                  type="button"
                  onClick={() => toggleTag('wp')}
                  className={`px-3 py-1.5 rounded text-sm border ${formData.tags?.includes('wp') ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  水龙头 (wp)
                </button>
                <button
                  type="button"
                  onClick={() => toggleTag('p')}
                  className={`px-3 py-1.5 rounded text-sm border ${formData.tags?.includes('p') ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  木板 (p)
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
               <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1"><FileTextIcon className="w-3 h-3"/> 备注</label>
               <textarea
                 name="note"
                 value={formData.note}
                 onChange={handleChange}
                 rows={2}
                 className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                 placeholder="例如: 客户要求晚上安装"
               />
            </div>

            {/* Colors */}
            <div>
               <label className="block text-xs font-medium text-gray-500 mb-1.5">优先级标记 (红=加班/急单)</label>
               <div className="flex gap-3 mt-1">
                 {['white', 'blue', 'orange', 'red', 'green'].map((color: any) => (
                   <button
                     type="button"
                     key={color}
                     onClick={() => setFormData({ ...formData, color })}
                     className={`w-8 h-8 rounded-full border-2 transition-transform shadow-sm ${formData.color === color ? 'border-gray-600 scale-110 ring-2 ring-offset-2 ring-gray-200' : 'border-gray-100 hover:scale-105'}`}
                     style={{ 
                       backgroundColor: 
                         color === 'red' ? '#f44336' : 
                         color === 'blue' ? '#2196f3' : 
                         color === 'orange' ? '#ff9800' : 
                         color === 'green' ? '#4caf50' : '#ffffff' 
                      }}
                   />
                 ))}
               </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 shrink-0">
              {initialData?.id ? (
                <button 
                  type="button" 
                  onClick={() => onDelete(initialData.id!)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                >
                  <TrashIcon className="w-4 h-4" /> 删除
                </button>
              ) : <div></div>}
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
                  保存
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-6">
                {/* Activity History Section */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <HistoryIcon className="w-3 h-3" /> 变更记录
                  </h3>
                  <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                    {taskActivities.length === 0 && <p className="text-xs text-gray-400 pl-2">暂无修改记录</p>}
                    {taskActivities.map(act => (
                      <div key={act.id} className="pl-4 relative">
                         <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-gray-300 border-2 border-white"></div>
                         <div className="text-sm">
                           <span className="font-bold text-gray-700">{act.userName}</span> <span className="text-gray-600">{act.action}</span>
                         </div>
                         <div className="text-xs text-gray-500 mt-0.5">{act.details}</div>
                         <div className="text-[10px] text-gray-400 mt-1">{new Date(act.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <hr className="border-gray-200" />

                {/* Comments Section */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageIcon className="w-3 h-3" /> 评论与讨论
                  </h3>
                  <div className="space-y-4">
                    {comments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无评论</p>}
                    {comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: comment.userColor }}
                        >
                          {comment.userInitials}
                        </div>
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100 flex-1">
                           <div className="flex justify-between items-baseline mb-1">
                              <span className="text-xs font-bold text-gray-700">{comment.userName}</span>
                              <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                           </div>
                           <p className="text-sm text-gray-800">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comment Input */}
            <div className="p-4 bg-white border-t border-gray-200">
               <div className="flex gap-2">
                 <input 
                   value={newComment}
                   onChange={(e) => setNewComment(e.target.value)}
                   placeholder="输入评论... (@提及他人)"
                   className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-lg px-4 py-2 text-sm outline-none transition-all"
                   onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                 />
                 <button 
                   onClick={handleSendComment} 
                   disabled={!newComment.trim()}
                   className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 transition-colors"
                 >
                   <SendIcon className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;

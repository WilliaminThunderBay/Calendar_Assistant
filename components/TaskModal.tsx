/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { XIcon, MapPinIcon, UserIcon, WrenchIcon, ClockIcon, FileTextIcon } from './icons';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialData?: Partial<Task>;
  availableStaff: string[];
  availableServices: string[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialData, availableStaff, availableServices }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    number: '',
    plate: '',
    staff: '',
    date: '',
    time: '',
    location: '',
    service: '',
    note: '',
    color: 'white',
    type: '常规订单'
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {
        number: '',
        plate: '',
        staff: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00-12:00',
        location: '',
        service: '',
        note: '',
        color: 'white',
        type: '常规订单'
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Task);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">{initialData?.id ? '编辑工单' : '新建工单'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">工单号 *</label>
              <input
                required
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="例如: W001"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">车牌号 *</label>
              <input
                required
                name="plate"
                value={formData.plate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
                placeholder="沪A·88888"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><UserIcon className="w-3 h-3"/> 安装人员</label>
                <select
                  name="staff"
                  value={formData.staff}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">选择人员</option>
                  {availableStaff.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><WrenchIcon className="w-3 h-3"/> 服务类型</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">选择服务</option>
                  {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">日期</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><ClockIcon className="w-3 h-3"/> 时间段</label>
              <input
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="09:00-12:00"
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><MapPinIcon className="w-3 h-3"/> 地点</label>
             <input
               name="location"
               value={formData.location}
               onChange={handleChange}
               className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
               placeholder="请输入详细地址"
             />
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1"><FileTextIcon className="w-3 h-3"/> 备注</label>
             <textarea
               name="note"
               value={formData.note}
               onChange={handleChange}
               rows={2}
               className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
             />
          </div>

          <div>
             <label className="block text-xs font-medium text-gray-500 mb-1">优先级标记</label>
             <div className="flex gap-2 mt-1">
               {['white', 'blue', 'orange', 'red', 'green'].map((color: any) => (
                 <button
                   type="button"
                   key={color}
                   onClick={() => setFormData({ ...formData, color })}
                   className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === color ? 'border-gray-600 scale-110' : 'border-transparent hover:scale-105'}`}
                   style={{ 
                     backgroundColor: 
                       color === 'red' ? '#f44336' : 
                       color === 'blue' ? '#2196f3' : 
                       color === 'orange' ? '#ff9800' : 
                       color === 'green' ? '#4caf50' : '#e0e0e0' 
                    }}
                 />
               ))}
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

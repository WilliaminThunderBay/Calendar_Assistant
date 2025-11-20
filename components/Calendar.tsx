
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Task, ViewMode } from '../types';

interface CalendarProps {
  tasks: Task[];
  currentDate: Date;
  viewMode: ViewMode;
  onTaskClick: (task: Task) => void;
  onAddClick: (dateStr: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, currentDate, viewMode, onTaskClick, onAddClick }) => {
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const days = [];
    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrevMonth - i, type: 'prev', fullDate: '' });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, type: 'current', fullDate: dateStr });
    }
    // Next month filler
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ day: i, type: 'next', fullDate: '' });
    }

    return (
      <div className="grid grid-cols-7 bg-gray-200 gap-px border-t border-gray-200 h-full overflow-hidden">
        {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((d) => (
          <div key={d} className="bg-gray-50 p-2 text-center font-medium text-gray-500 text-sm">
            {d}
          </div>
        ))}
        {days.map((d, idx) => {
          const dayTasks = d.type === 'current' ? tasks.filter(t => t.date === d.fullDate) : [];
          const isToday = d.type === 'current' && new Date().toDateString() === new Date(d.fullDate).toDateString();

          return (
            <div
              key={idx}
              className={`bg-white flex flex-col p-1 transition-colors hover:bg-gray-50 overflow-hidden ${d.type !== 'current' ? 'bg-gray-50 text-gray-400' : ''}`}
              style={{ minHeight: '120px' }}
            >
              <div className="flex justify-between items-center px-1 mb-1 shrink-0">
                <span className={`text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : ''}`}>
                  {d.day}
                </span>
                {d.type === 'current' && (
                  <button 
                    onClick={() => onAddClick(d.fullDate)}
                    className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded w-6 h-6 flex items-center justify-center"
                  >
                    +
                  </button>
                )}
              </div>
              
              {/* Task List with Scroll for Overflow */}
              <div className="flex flex-col gap-1 overflow-y-auto flex-1 custom-scrollbar px-0.5">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                    className={`text-[10px] leading-tight p-1.5 rounded border-l-2 cursor-pointer shadow-sm hover:shadow transition-all ${
                      task.color === 'red' ? 'border-red-500 bg-red-50 text-red-900' :
                      task.color === 'blue' ? 'border-blue-500 bg-blue-50 text-blue-900' :
                      task.color === 'orange' ? 'border-orange-500 bg-orange-50 text-orange-900' :
                      task.color === 'green' ? 'border-green-500 bg-green-50 text-green-900' :
                      'border-gray-400 bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                       <span className="font-bold">{task.number}</span>
                       {task.tags && task.tags.length > 0 && (
                         <div className="flex gap-0.5">
                           {task.tags.map(t => (
                             <span key={t} className="bg-white/50 px-0.5 rounded text-[8px]">{t}</span>
                           ))}
                         </div>
                       )}
                    </div>
                    <div className="truncate mt-0.5">{task.plate}</div>
                    <div className="text-gray-500 truncate">{task.staff}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.date === dateStr);

    return (
      <div className="bg-white overflow-y-auto h-full">
        {hours.map(hour => {
          const hourStr = String(hour).padStart(2, '0');
          const tasksInHour = dayTasks.filter(t => parseInt(t.time.split(':')[0]) === hour);
          
          return (
            <div key={hour} className="flex border-b border-gray-100 min-h-[80px]">
              <div className="w-16 border-r border-gray-100 p-2 text-gray-400 text-xs text-right sticky left-0 bg-white">
                {hourStr}:00
              </div>
              <div className="flex-1 p-2 relative group bg-white">
                 <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 z-10">
                    <button onClick={() => onAddClick(dateStr)} className="text-indigo-600 bg-indigo-50 rounded-full w-6 h-6 flex items-center justify-center">+</button>
                 </div>
                 {tasksInHour.map(task => (
                   <div 
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="mb-1 p-2 rounded bg-indigo-50 border-l-4 border-indigo-500 cursor-pointer flex justify-between items-center hover:bg-indigo-100"
                   >
                     <div>
                       <span className="font-bold text-indigo-900 mr-2">{task.number}</span>
                       <span className="text-indigo-800 font-medium mr-2">{task.plate}</span>
                       <span className="text-xs text-gray-500">({task.time})</span>
                     </div>
                     <div className="flex items-center gap-3">
                       {task.tags?.map(t => <span key={t} className="px-1.5 py-0.5 bg-white rounded text-xs text-indigo-600 font-bold">{t}</span>)}
                       <div className="text-sm text-gray-600">{task.staff} | {task.location}</div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex-1 flex flex-col h-full">
      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && <div className="p-10 text-center text-gray-500">周视图开发中 (使用月视图或日视图)</div>}
    </div>
  );
};

export default Calendar;


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { UserIcon, MailIcon, PhoneIcon, MessageIcon, CameraIcon, ArrowRightIcon } from './icons';

interface UserProfileProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onBack: () => void;
}

const UserProfileView: React.FC<UserProfileProps> = ({ profile, onUpdate, onBack }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFormData(prev => ({ ...prev, avatar: ev.target!.result as string }));
          setIsDirty(true);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsDirty(false);
    // Optional: show toast
    alert('个人资料已更新');
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
      >
        <ArrowRightIcon className="w-4 h-4 rotate-180" /> 返回日历
      </button>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-md">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 font-bold text-3xl">
                    {formData.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full shadow-lg hover:bg-black transition-colors"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
              />
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{formData.name}</h1>
              <p className="text-gray-500 text-sm">{formData.role}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                isDirty 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              保存修改
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-gray-400" /> 显示名称
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MailIcon className="w-4 h-4 text-gray-400" /> 邮箱地址
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4 text-gray-400" /> 手机号码
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+86 138 0000 0000"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 text-green-600">
                  <MessageIcon className="w-4 h-4" /> WhatsApp 账号
                </label>
                <input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="+60 12-345 6789"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;

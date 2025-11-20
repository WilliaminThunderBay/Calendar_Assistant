
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { XIcon, CopyIcon, GlobeIcon, LockIcon, ChevronDownIcon } from './icons';
import { Role } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Collaborator {
  email: string;
  role: Role;
  isOwner?: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [linkSharingEnabled, setLinkSharingEnabled] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('Editor');
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { email: 'admin@example.com', role: 'Owner', isOwner: true },
    { email: 'liming@example.com', role: 'Editor' },
    { email: 'zhangsan@example.com', role: 'Viewer' }
  ]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  const handleInvite = () => {
    if (emailInput.trim()) {
      setCollaborators([...collaborators, { email: emailInput, role: inviteRole }]);
      setEmailInput('');
    }
  };

  const handleRemove = (email: string) => {
    setCollaborators(collaborators.filter(c => c.email !== email));
  };

  const handleRoleChange = (email: string, newRole: Role) => {
    setCollaborators(collaborators.map(c => c.email === email ? { ...c, role: newRole } : c));
  };

  const projectId = "9389222643xpppqkvzjhb";
  const editLink = `https://calendar.app/${projectId}/edit`;
  const viewLink = `https://calendar.app/read/${projectId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Share Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Invite Section */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Add email address</label>
            <div className="flex gap-2">
              <input 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. colleague@example.com"
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
              <div className="relative w-32 shrink-0">
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded appearance-none focus:ring-2 focus:ring-indigo-500 outline-none pr-8 text-sm"
                >
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              <button 
                onClick={handleInvite}
                disabled={!emailInput.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Invite
              </button>
            </div>
            <p className="text-xs text-gray-500">Separate multiple email addresses using the comma (,) character.</p>
          </div>

          {/* Link Sharing Section */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-gray-700 font-medium">
                 {linkSharingEnabled ? <GlobeIcon className="w-4 h-4" /> : <LockIcon className="w-4 h-4" />}
                 Link sharing is {linkSharingEnabled ? 'on' : 'off'}
               </div>
               <button 
                 onClick={() => setLinkSharingEnabled(!linkSharingEnabled)}
                 className="text-indigo-600 hover:underline text-sm font-medium"
               >
                 Turn {linkSharingEnabled ? 'off' : 'on'} link sharing
               </button>
            </div>

            {linkSharingEnabled && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Anyone with this link can edit this project</label>
                  <div className="flex gap-2">
                    <input readOnly value={editLink} className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-gray-600 text-sm select-all outline-none" />
                    <button onClick={() => handleCopy(editLink)} className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-indigo-600 transition-colors" title="Copy Link">
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Anyone with this link can view this project</label>
                  <div className="flex gap-2">
                    <input readOnly value={viewLink} className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-gray-600 text-sm select-all outline-none" />
                    <button onClick={() => handleCopy(viewLink)} className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-indigo-600 transition-colors" title="Copy Link">
                      <CopyIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collaborators List */}
          <div className="space-y-4 border-t border-gray-100 pt-6">
             <h3 className="font-bold text-gray-700">Collaborators</h3>
             <div className="space-y-3">
               {collaborators.map((collab) => (
                 <div key={collab.email} className="flex items-center justify-between py-1">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                       {collab.email.substring(0, 2).toUpperCase()}
                     </div>
                     <span className="text-gray-800 text-sm">{collab.email}</span>
                   </div>
                   
                   {collab.isOwner ? (
                     <span className="text-gray-500 text-sm font-medium px-3">Owner</span>
                   ) : (
                     <div className="flex items-center gap-2">
                       <div className="relative w-28">
                          <select 
                            value={collab.role}
                            onChange={(e) => handleRoleChange(collab.email, e.target.value as Role)}
                            className="w-full pl-2 pr-6 py-1 bg-transparent text-gray-600 text-sm font-medium appearance-none outline-none hover:text-indigo-600 cursor-pointer text-right"
                          >
                            <option value="Editor">Editor</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                          <ChevronDownIcon className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                       </div>
                       <button 
                         onClick={() => handleRemove(collab.email)}
                         className="text-gray-400 hover:text-red-500 p-1"
                         title="Remove"
                       >
                         <XIcon className="w-4 h-4" />
                       </button>
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </div>

        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

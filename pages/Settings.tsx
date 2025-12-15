import React from 'react';
import { User } from '../types';
import { User as UserIcon, Shield, Bell, Save } from 'lucide-react';

interface SettingsProps {
  user: User | null;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
       <div>
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
         <p className="text-slate-500 dark:text-slate-400">Manage your profile and system preferences.</p>
       </div>

       <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 space-y-8 transition-colors">
          {/* Profile Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <UserIcon className="text-blue-600 dark:text-blue-400 w-5 h-5" /> Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input type="text" defaultValue={user?.name} className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg disabled:opacity-70" disabled />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input type="email" defaultValue={user?.email} className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg disabled:opacity-70" disabled />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <input type="text" defaultValue={user?.role} className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg capitalize bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-70" disabled />
               </div>
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Security */}
          <section className="space-y-4">
             <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Shield className="text-blue-600 dark:text-blue-400 w-5 h-5" /> Security
            </h2>
            <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm">Change Password</button>
          </section>

          <hr className="border-slate-100 dark:border-slate-800" />

           {/* Notifications */}
          <section className="space-y-4">
             <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Bell className="text-blue-600 dark:text-blue-400 w-5 h-5" /> Notifications
            </h2>
            <div className="space-y-2">
               <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Email me when a student is flagged as At-Risk</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Weekly report summaries</span>
               </label>
            </div>
          </section>
          
          <div className="pt-4">
             <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium">
               <Save className="w-4 h-4" /> Save Changes
             </button>
          </div>
       </div>
    </div>
  );
};

export default Settings;
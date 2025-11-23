
import React from 'react';
import { Settings, Users, Database, Plus } from 'lucide-react';

const AdminPanel: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
        <Settings className="w-6 h-6" /> Admin Control Panel
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-indigo-500/20 p-3 rounded-lg text-indigo-400"><Users className="w-6 h-6"/></div>
             <span className="text-3xl font-bold text-white">1,240</span>
           </div>
           <p className="text-slate-400 text-sm">Active Students</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800">
           <div className="flex justify-between items-start mb-4">
             <div className="bg-teal-500/20 p-3 rounded-lg text-teal-400"><Database className="w-6 h-6"/></div>
             <span className="text-3xl font-bold text-white">200+</span>
           </div>
           <p className="text-slate-400 text-sm">Careers in Database</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-300">Career Database Management</h3>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-500 transition-colors">
            <Plus className="w-4 h-4" /> Add New Career
          </button>
        </div>
        <div className="p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                <th className="pb-3 pl-2">Career Title</th>
                <th className="pb-3">Industry</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: 'Data Scientist', ind: 'Tech', status: 'Active' },
                { name: 'UX Designer', ind: 'Design', status: 'Active' },
                { name: 'Marine Biologist', ind: 'Science', status: 'Draft' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-800 group transition-colors">
                  <td className="py-4 pl-2 font-medium text-slate-300 group-hover:text-white">{row.name}</td>
                  <td className="py-4 text-slate-500">{row.ind}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 font-medium mr-3">Edit</button>
                    <button className="text-red-400 hover:text-red-300 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

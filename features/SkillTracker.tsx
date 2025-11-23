import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Award, Zap, Brain, User } from 'lucide-react';

interface Props {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onNavigateToProjects: () => void;
}

const SkillTracker: React.FC<Props> = ({ user, onUpdateUser, onNavigateToProjects }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAchievement, setNewAchievement] = useState('');

  const data = Object.entries(user.skillProgress).map(([subject, A]) => ({
    subject,
    A,
    fullMark: 100,
  }));

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      const updatedAchievements = [...user.achievements, newAchievement.trim()];
      onUpdateUser({ achievements: updatedAchievements });
      setNewAchievement('');
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/50">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Skill & Aptitude Tracker</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COL: Chart & Breakdown */}
        <div className="space-y-6">
            {/* Chart Section */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-800 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <h3 className="font-bold text-slate-300 mb-6 w-full text-left flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" /> Your Skill Radar
                </h3>
                <div className="h-80 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                        <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                        name="My Skills"
                        dataKey="A"
                        stroke="#818cf8"
                        strokeWidth={3}
                        fill="#6366f1"
                        fillOpacity={0.4}
                        />
                    </RadarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-center text-xs font-medium text-slate-500 mt-4">
                    Based on your quiz results & activities
                </p>
            </div>

            {/* Skill Breakdown */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-lg border border-slate-800">
                <h3 className="font-bold text-slate-300 mb-6">Detailed Breakdown</h3>
                <div className="space-y-5">
                {data.map((item, idx) => (
                    <div key={item.subject}>
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-500 uppercase tracking-wide">
                        <span>{item.subject}</span>
                        <span className="text-slate-300">{item.A}/100</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                        className={`h-full rounded-full shadow-[0_0_8px_currentColor] transition-all duration-1000 ${
                             ['bg-indigo-500 text-indigo-500', 'bg-pink-500 text-pink-500', 'bg-cyan-500 text-cyan-500', 'bg-amber-500 text-amber-500', 'bg-emerald-500 text-emerald-500', 'bg-violet-500 text-violet-500'][idx % 6]
                        }`}
                        style={{ width: `${item.A}%` }}
                        ></div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </div>

        {/* RIGHT COL: Achievements & Aptitude */}
        <div className="space-y-6">
           {/* Personality Insight Section (Synced with Quiz) */}
           {user.completedQuiz && user.quizResult && (
             <div className="bg-gradient-to-br from-slate-800 to-indigo-950 p-8 rounded-3xl shadow-xl border border-indigo-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="bg-white/10 p-2 rounded-lg">
                         <User className="w-5 h-5 text-indigo-200" />
                    </div>
                    <h3 className="font-bold text-lg">Personality Aptitude</h3>
                </div>
                <p className="text-indigo-100 leading-relaxed italic relative z-10 border-l-4 border-indigo-500 pl-4 my-4">
                   "{user.quizResult.personalityDescription}"
                </p>
                <div className="flex gap-4 text-xs font-bold text-indigo-300 uppercase tracking-wider mt-6 relative z-10">
                    <div>
                        <span className="block text-white text-lg drop-shadow-md">{user.quizResult.strength}</span>
                        <span>Core Strength</span>
                    </div>
                    <div className="w-px bg-indigo-800"></div>
                    <div>
                        <span className="block text-white text-lg drop-shadow-md">{user.quizResult.learningStyle}</span>
                        <span>Learning Style</span>
                    </div>
                </div>
             </div>
           )}

           {/* Achievements Section */}
           <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 h-full min-h-[400px]">
             <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
               <Award className="w-6 h-6 text-yellow-500" /> Recent Achievements
             </h3>
             
             <div className="space-y-3 mb-6">
               {user.achievements.length > 0 ? (
                 user.achievements.map((ach, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2 hover:border-indigo-500/50 transition-colors">
                     <div className="bg-yellow-500/10 p-2.5 rounded-full text-yellow-500 shrink-0">
                       <TrophyIcon />
                     </div>
                     <span className="font-semibold text-slate-200 text-sm">{ach}</span>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                    <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium">No achievements yet.</p>
                    <p className="text-xs text-slate-600">Complete the quiz to earn your first badge!</p>
                 </div>
               )}
             </div>

             <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                {isAdding ? (
                    <div className="animate-in fade-in zoom-in duration-300">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Add New Milestone</label>
                    <input 
                        type="text" 
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        placeholder="e.g. Won School Debate, Completed Python Course"
                        className="w-full p-3 border border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-3 bg-slate-700 text-white placeholder-slate-500"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAchievement()}
                    />
                    <div className="flex gap-2">
                        <button 
                        onClick={handleAddAchievement}
                        className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors shadow-sm"
                        >
                        Save Achievement
                        </button>
                        <button 
                        onClick={() => setIsAdding(false)}
                        className="px-4 bg-slate-700 text-slate-300 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-600 border border-slate-600 transition-colors"
                        >
                        Cancel
                        </button>
                    </div>
                    </div>
                ) : (
                    <button 
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 text-sm text-indigo-400 font-bold hover:text-indigo-300 border-2 border-dashed border-indigo-500/20 hover:border-indigo-500/40 rounded-xl transition-all bg-slate-800 hover:bg-slate-700"
                    >
                    + Add Manual Achievement
                    </button>
                )}
             </div>
           </div>
        </div>
      </div>

      {/* Action Plan Banner */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-pink-900/40 border border-pink-500/30">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Boost Your Portfolio</h3>
            <p className="text-pink-100 max-w-lg text-lg">
              Completing the psychometric test was step one. Now, complete a real-world project to increase your "Creativity" score!
            </p>
          </div>
          <button 
            onClick={onNavigateToProjects}
            className="bg-white text-pink-600 px-8 py-3 rounded-full font-bold hover:bg-pink-50 transition-colors shadow-lg flex items-center gap-2 transform hover:scale-105"
          >
            View Projects <TrendingUp className="w-4 h-4" />
          </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20">
          <Zap className="w-48 h-48 -mb-8 -mr-8 rotate-12" />
        </div>
        <div className="absolute top-0 left-0 opacity-20">
            <div className="w-32 h-32 bg-white rounded-full blur-2xl -mt-10 -ml-10"></div>
        </div>
      </div>
    </div>
  );
};

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 2c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v2h3c.55 0 1 .45 1 1v2c0 2.2-1.79 4-4 4h-.13c-1.37 2.37-3.95 4-6.87 4-2.92 0-5.5-1.63-6.87-4H6c-2.21 0-4-1.79-4-4V5c0-.55.45-1 1-1h2V2zm13 4h-2V3h-2v1h-2V3H9v1H7V3H5v2H3v2c0 1.1.9 2 2 2h.2c.28-1.55 1.15-2.91 2.3-3.87V5h1.2c1.15.96 2.02 2.32 2.3 3.87h2c.28-1.55 1.15-2.91 2.3-3.87V5h1.2c1.15.96 2.02 2.32 2.3 3.87H21V6c0-1.1-.9-2-2-2v-2zM6.5 18h11c.28 0 .5.22.5.5v1c0 .28-.22.5-.5.5h-11c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5zM7 21h10c.28 0 .5.22.5.5s-.22.5-.5.5H7c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z"/></svg>
)

export default SkillTracker;
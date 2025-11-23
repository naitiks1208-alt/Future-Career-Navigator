import React, { useEffect, useState } from 'react';
import { UserProfile, AppView } from '../types';
import { MOCK_CAREERS } from '../constants';
import { Award, Target, Book, ArrowRight, Trophy, Brain, Sparkles, Newspaper, ExternalLink, RefreshCw, ChevronDown, ChevronUp, User, Bookmark, Trash2, Plus, Sun, Moon, Sunrise } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getIndianCareerNews } from '../services/geminiService';

interface Props {
  user: UserProfile;
  onChangeView: (view: AppView) => void;
  onNavigateToPathway: (careerId: string) => void;
  onToggleSave: (careerId: string) => void;
}

const Dashboard: React.FC<Props> = ({ user, onChangeView, onNavigateToPathway, onToggleSave }) => {
  const COLORS = ['#6366f1', '#1e293b']; // Indigo-500 and Slate-800
  const progressData = [{ name: 'Done', value: user.completedQuiz ? 100 : 30 }, { name: 'Left', value: user.completedQuiz ? 0 : 70 }];
  
  const [newsData, setNewsData] = useState<{text: string, sources: any[]} | null>(null);
  const [loadingNews, setLoadingNews] = useState(true);
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [greeting, setGreeting] = useState<{text: string, icon: React.ReactNode}>({ text: 'Hello', icon: <Sun /> });

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 5) setGreeting({ text: 'Burning the Midnight Oil', icon: <Moon className="w-8 h-8 md:w-10 md:h-10 text-indigo-200" /> });
      else if (hour < 12) setGreeting({ text: 'Good Morning', icon: <Sunrise className="w-8 h-8 md:w-10 md:h-10 text-yellow-300" /> });
      else if (hour < 17) setGreeting({ text: 'Good Afternoon', icon: <Sun className="w-8 h-8 md:w-10 md:h-10 text-orange-300" /> });
      else setGreeting({ text: 'Good Evening', icon: <Moon className="w-8 h-8 md:w-10 md:h-10 text-indigo-300" /> });
    };
    updateGreeting();
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoadingNews(true);
    const data = await getIndianCareerNews();
    if (data) {
      setNewsData(data);
    }
    setLoadingNews(false);
  };

  // Resolve recommended career objects
  const recommendedCareers = user.quizResult?.recommendedCareers
    ? user.quizResult.recommendedCareers.map(id => MOCK_CAREERS.find(c => c.id === id)).filter(Boolean)
    : [];

  const savedCareerObjects = user.savedCareers
    .map(id => MOCK_CAREERS.find(c => c.id === id))
    .filter(c => c !== undefined);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/40 border border-indigo-500/30">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              {greeting.text}, {user.name || "Future Leader"}! {greeting.icon}
            </h1>
            <p className="text-indigo-100 text-lg max-w-2xl">
              Your journey to success starts here. Explore careers, track skills, and build your future.
            </p>
            {!user.completedQuiz && (
              <button 
                onClick={() => onChangeView(AppView.QUIZ)}
                className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2"
              >
                Start Career Quiz <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
           <Trophy className="w-64 h-64 -mr-10 -mt-10 rotate-12" />
        </div>
      </div>

      {/* 2. Psychometric Analysis Summary (If Quiz Done) */}
      {user.completedQuiz && user.quizResult && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
               <div className="flex items-start justify-between mb-4 relative z-10">
                  <div>
                    <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-400"/> Psychometric Profile
                    </h3>
                    <div className="text-2xl font-bold text-white mt-2">{user.quizResult.strength}</div>
                    <div className="text-sm text-indigo-300 font-medium">Recommended Stream: {user.quizResult.recommendedStream}</div>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <User className="w-6 h-6 text-indigo-400" />
                  </div>
               </div>
               <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-indigo-500 pl-3">
                 "{user.quizResult.personalityDescription}"
               </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-center items-center relative">
               <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4 absolute top-6 left-6">Profile Completion</h3>
               <div className="h-32 w-32 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={progressData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={55}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                      >
                        {progressData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-xl font-bold text-white">{user.completedQuiz ? '100%' : '30%'}</span>
                  </div>
               </div>
               <button 
                 onClick={() => onChangeView(AppView.SKILLS)}
                 className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
               >
                 View Skills <ChevronDown className="w-3 h-3" />
               </button>
            </div>
         </div>
      )}

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8 cols) - News & Top Matches (SWAPPED) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Daily Career Brief / Live News - NOW ON TOP */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
             <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
               <h3 className="font-bold text-white flex items-center gap-2">
                 <Newspaper className="w-5 h-5 text-rose-500" /> Live Career News
               </h3>
               <div className="flex items-center gap-2">
                   <button 
                      onClick={() => fetchNews()} 
                      className="p-1.5 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"
                      title="Refresh News"
                   >
                     <RefreshCw className={`w-4 h-4 ${loadingNews ? 'animate-spin' : ''}`} />
                   </button>
                   <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> LIVE
                   </span>
                   <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded hidden sm:inline-block">Hourly Updates</span>
               </div>
             </div>
             
             <div className="p-6">
                {loadingNews ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                  </div>
                ) : newsData ? (
                  <div>
                    <div className={`prose prose-invert prose-sm max-w-none text-slate-300 ${!isNewsExpanded ? 'line-clamp-3' : ''}`}>
                      <div dangerouslySetInnerHTML={{ __html: newsData.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/\n/g, '<br/>') }} />
                    </div>
                    
                    <button 
                      onClick={() => setIsNewsExpanded(!isNewsExpanded)}
                      className="mt-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {isNewsExpanded ? (
                        <>Show Less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>Read More <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>

                    {newsData.sources && newsData.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Sources & Links</p>
                        <div className="flex flex-wrap gap-2">
                          {newsData.sources.slice(0, 3).map((source: any, i: number) => (
                             <a key={i} href={source.web?.uri || source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-1 rounded text-[10px] transition-colors border border-slate-700">
                               <ExternalLink className="w-3 h-3" /> {source.web?.title || "Source"}
                             </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                   <div className="text-center text-slate-500 py-4">
                     <p>Could not load latest news.</p>
                     <button onClick={fetchNews} className="text-indigo-400 text-xs mt-2 hover:underline">Retry</button>
                   </div>
                )}
             </div>
          </div>

          {/* Top Career Matches - MOVED BELOW */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" /> Top Career Matches
              </h3>
              {user.completedQuiz && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                  {user.quizResult?.confidenceScore}% Match
                </span>
              )}
            </div>
            
            <div className="p-6">
              {!user.completedQuiz ? (
                <div className="text-center py-8">
                  <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-600" />
                  </div>
                  <h4 className="text-slate-300 font-bold mb-2">Discover Your Matches</h4>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                    Take our AI-powered psychometric test to unlock your personalized career recommendations.
                  </p>
                  <button 
                    onClick={() => onChangeView(AppView.QUIZ)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-colors"
                  >
                    Take Quiz Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {recommendedCareers.slice(0, 4).map((career: any) => (
                     <div key={career.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-indigo-500/50 transition-all hover:bg-slate-800 group cursor-pointer" onClick={() => onNavigateToPathway(career.id)}>
                        <div className="flex justify-between items-start mb-2">
                           <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                              <Book className="w-4 h-4" />
                           </div>
                           <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">{career.industry}</span>
                        </div>
                        <h4 className="text-white font-bold mb-1 group-hover:text-indigo-400 transition-colors">{career.title}</h4>
                        <p className="text-slate-500 text-xs line-clamp-2 mb-3">{career.description}</p>
                        <div className="flex items-center text-xs font-medium text-slate-400 gap-1 group-hover:text-white transition-colors">
                           View Pathway <ArrowRight className="w-3 h-3" />
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN (4 cols) - Saved Careers & Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Saved Careers Widget */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col h-full max-h-[600px]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
               <h3 className="font-bold text-white flex items-center gap-2">
                 <Bookmark className="w-5 h-5 text-indigo-500" /> Saved Careers
               </h3>
               <span className={`text-xs font-bold px-2 py-1 rounded border ${user.savedCareers.length >= 5 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                 {user.savedCareers.length}/5
               </span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
               {savedCareerObjects.length > 0 ? (
                 savedCareerObjects.map(career => (
                   <div key={career!.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div onClick={() => onNavigateToPathway(career!.id)} className="cursor-pointer flex-1">
                        <h4 className="font-bold text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">{career!.title}</h4>
                        <p className="text-xs text-slate-500">{career!.industry}</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => onNavigateToPathway(career!.id)}
                           className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                           title="View Pathway"
                         >
                           <ArrowRight className="w-4 h-4" />
                         </button>
                         <button
                           onClick={() => onToggleSave(career!.id)}
                           className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                           title="Remove from Saved"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-8 text-slate-500">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No careers saved yet.</p>
                 </div>
               )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <button 
                onClick={() => onChangeView(AppView.LIBRARY)}
                className="w-full py-3 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 font-bold text-sm hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Career
              </button>
            </div>
          </div>

          {/* Motivational Quote Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-900/20 relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                   <Award className="w-5 h-5 text-yellow-200" /> Daily Motivation
                </h4>
                <p className="font-serif text-lg leading-relaxed italic opacity-90">
                   "Arise, awake, and stop not till the goal is reached."
                </p>
                <p className="mt-3 text-sm font-bold text-yellow-200 uppercase tracking-wider">— Swami Vivekananda</p>
             </div>
             <div className="absolute -bottom-6 -right-6 text-white opacity-10 rotate-12">
               <Sparkles className="w-32 h-32" />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
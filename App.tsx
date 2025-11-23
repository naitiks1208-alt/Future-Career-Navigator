
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  BookOpen, 
  Map, 
  MessageCircle, 
  Trophy, 
  GraduationCap, 
  FileText, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { AppView, UserProfile } from './types';
import { INITIAL_USER } from './constants';

// Feature Components
import Dashboard from './features/Dashboard';
import CareerQuiz from './features/CareerQuiz';
import CareerLibrary from './features/CareerLibrary';
import CareerPathway from './features/CareerPathway';
import MentorChat from './features/MentorChat';
import SkillTracker from './features/SkillTracker';
import Scholarships from './features/Scholarships';
import Portfolio from './features/Portfolio';
import AdminPanel from './features/AdminPanel';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Initialize user from localStorage if available, otherwise use default
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const savedUser = localStorage.getItem('futureNav_user');
      return savedUser ? JSON.parse(savedUser) : INITIAL_USER;
    } catch (error) {
      console.error('Failed to load user data from storage', error);
      return INITIAL_USER;
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<string | null>(null);
  const [portfolioTab, setPortfolioTab] = useState<'builder' | 'projects'>('builder');

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('futureNav_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user data to storage', error);
    }
  }, [user]);

  // Helper to update user data
  const updateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  // Helper to save/unsave career with FIFO logic (Max 5)
  const handleToggleSaveCareer = (careerId: string) => {
    setUser(prev => {
      const isSaved = prev.savedCareers.includes(careerId);
      let newSaved;

      if (isSaved) {
        // Remove if already saved
        newSaved = prev.savedCareers.filter(id => id !== careerId);
      } else {
        // Add new career
        newSaved = [...prev.savedCareers, careerId];
        // FIFO Logic: If more than 5, remove the first one (index 0)
        if (newSaved.length > 5) {
          newSaved = newSaved.slice(newSaved.length - 5);
        }
      }
      return { ...prev, savedCareers: newSaved };
    });
  };

  // Helper to navigate to pathway from library
  const handleNavigateToPathway = (careerId: string) => {
    setSelectedCareerId(careerId);
    setCurrentView(AppView.PATHWAY);
  };

  // Helper to navigate to specific portfolio tab
  const handleNavigateToPortfolio = (tab: 'builder' | 'projects') => {
    setPortfolioTab(tab);
    setCurrentView(AppView.PORTFOLIO);
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false); // Close mobile menu on click
        if (view === AppView.PORTFOLIO) setPortfolioTab('builder'); // Default to builder when clicking sidebar
      }}
      className={`flex items-center w-full px-4 py-3 mb-2 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity ${currentView === view ? 'hidden' : ''}`} />
      <Icon className={`w-5 h-5 mr-3 ${currentView === view ? 'text-indigo-200' : 'text-slate-500 group-hover:text-indigo-400'}`} />
      <span className="font-medium text-sm relative z-10">{label}</span>
      {currentView === view && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
      )}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200 selection:bg-indigo-500 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center h-24 px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
               <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-white tracking-tight">FutureNav</span>
              <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-widest">Career OS</span>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="mb-8">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Discovery Engine</div>
            <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Mission Control" />
            <NavItem view={AppView.QUIZ} icon={Compass} label="Career DNA Quiz" />
            <NavItem view={AppView.LIBRARY} icon={BookOpen} label="Career Library" />
            <NavItem view={AppView.PATHWAY} icon={Map} label="Strategic Pathway" />
            <NavItem view={AppView.CHAT} icon={MessageCircle} label="AI Mentor Core" />
          </div>

          <div className="mb-8">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Evolution</div>
            <NavItem view={AppView.SKILLS} icon={Trophy} label="Skill Tracker" />
            <NavItem view={AppView.SCHOLARSHIPS} icon={GraduationCap} label="Funding Ops" />
            <NavItem view={AppView.PORTFOLIO} icon={FileText} label="Holistic Portfolio" />
          </div>

          <div>
             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">System</div>
            <NavItem view={AppView.ADMIN} icon={Settings} label="Admin Console" />
          </div>
        </div>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3 border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
            <span className="text-xs font-medium text-slate-400">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
        
        {/* Header */}
        <header className="h-20 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-8 z-10 shrink-0 sticky top-0">
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1 lg:flex-none"></div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-medium text-slate-300">Grade {user.grade}</span>
            </div>
            
            <div className="flex items-center gap-4 pl-6 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white">{user.name || "Cadet"}</p>
                <p className="text-xs text-slate-400 font-medium">Student Account</p>
              </div>
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
                <div className="w-11 h-11 relative rounded-full bg-slate-900 flex items-center justify-center font-bold text-white border border-slate-700 group-hover:border-slate-500 transition-colors">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {currentView === AppView.DASHBOARD && (
            <Dashboard 
              user={user} 
              onChangeView={setCurrentView} 
              onNavigateToPathway={handleNavigateToPathway}
              onToggleSave={handleToggleSaveCareer}
            />
          )}
          {currentView === AppView.QUIZ && (
            <CareerQuiz 
              user={user}
              onUpdateName={(name) => updateUser({ name })}
              onComplete={(result) => {
                // Add unique achievement if not already present
                const achievementName = "Psychometric Profile Unlocked 🧠";
                const updatedAchievements = user.achievements.includes(achievementName) 
                  ? user.achievements 
                  : [...user.achievements, achievementName];

                updateUser({ 
                  completedQuiz: true, 
                  quizResult: result,
                  // Update skill progress with calculated profile from quiz
                  skillProgress: result.skillProfile ? { ...result.skillProfile } : user.skillProgress,
                  achievements: updatedAchievements
                });
                setCurrentView(AppView.DASHBOARD);
              }} 
            />
          )}
          {currentView === AppView.LIBRARY && (
            <CareerLibrary 
              user={user} 
              onToggleSave={handleToggleSaveCareer}
              onSelectPathway={handleNavigateToPathway} 
            />
          )}
          {currentView === AppView.PATHWAY && (
            <CareerPathway initialCareerId={selectedCareerId} user={user} />
          )}
          {currentView === AppView.CHAT && (
            <MentorChat />
          )}
          {currentView === AppView.SKILLS && (
            <SkillTracker 
              user={user} 
              onUpdateUser={updateUser} 
              onNavigateToProjects={() => handleNavigateToPortfolio('projects')} 
            />
          )}
          {currentView === AppView.SCHOLARSHIPS && (
            <Scholarships />
          )}
          {currentView === AppView.PORTFOLIO && (
            <Portfolio user={user} initialTab={portfolioTab} />
          )}
          {currentView === AppView.ADMIN && (
            <AdminPanel />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

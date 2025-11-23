
import React, { useState, useMemo } from 'react';
import { MOCK_CAREERS } from '../constants';
import { Career, UserProfile } from '../types';
import { Search, IndianRupee, PlayCircle, Filter, X, Briefcase, Check, Scale, ArrowRightLeft, Trash2, Zap, Bookmark } from 'lucide-react';
import { generateCareerVideo } from '../services/geminiService';

interface Props {
  user: UserProfile;
  onToggleSave: (id: string) => void;
  onSelectPathway: (careerId: string) => void;
}

const CareerLibrary: React.FC<Props> = ({ user, onToggleSave, onSelectPathway }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  
  // Compare State
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Filter States
  const [activeCategory, setActiveCategory] = useState('All');
  const [personalityFilter, setPersonalityFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');
  const [salaryFilter, setSalaryFilter] = useState('All');
  
  // Video State
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Derived options for dropdowns
  const allSkills = useMemo(() => {
    return Array.from(new Set(MOCK_CAREERS.flatMap(c => c.skills))).sort();
  }, []);

  // Helper to categorize salary based on Indian Lakhs (L)
  const getSalaryLevel = (salary: string) => {
    const amounts = salary.match(/(\d+)/g); 
    
    if (!amounts || amounts.length === 0) {
        if(salary.toLowerCase().includes("variable")) return 'Variable';
        if(salary.toLowerCase().includes("daily")) return 'Entry Level';
        return 'Mid-Range';
    }
    
    const isLakhs = salary.includes('L') || salary.includes('lakhs');
    const values = amounts.map(s => parseInt(s, 10));
    
    let maxSalary = Math.max(...values);
    
    if (!isLakhs && maxSalary > 1000) {
       maxSalary = (maxSalary * 12) / 100000; 
    } else if (!isLakhs && maxSalary <= 1000) {
       // Daily wage assumed
       return 'Entry Level';
    }

    if (maxSalary >= 15) return 'High Paying'; 
    if (maxSalary >= 5) return 'Mid-Range';    
    return 'Entry Level';                      
  };

  const filteredCareers = MOCK_CAREERS.filter(c => {
    // Text Search (Expanded to include Skills)
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(lowerSearch) || 
                          c.industry.toLowerCase().includes(lowerSearch) ||
                          c.education.toLowerCase().includes(lowerSearch) ||
                          c.skills.some(s => s.toLowerCase().includes(lowerSearch));
    
    // Category Tag
    let matchesCategory = true;
    if (activeCategory !== 'All') {
        if (activeCategory === 'Vocational / ITI') {
            matchesCategory = c.industry === 'Vocational' || c.education.includes('ITI') || c.education.includes('Diploma') || c.tags.includes('Trade');
        } else if (activeCategory === 'Govt & Defense') {
             matchesCategory = c.industry === 'Govt' || c.industry === 'Defense';
        } else {
            matchesCategory = c.tags.includes(activeCategory) || c.industry === activeCategory;
        }
    }

    const matchesPersonality = personalityFilter === 'All' || c.personalityType === personalityFilter;
    const matchesSkill = skillFilter === 'All' || c.skills.includes(skillFilter);

    // Salary Filter
    const matchesSalary = salaryFilter === 'All' || getSalaryLevel(c.salaryRange) === salaryFilter;

    return matchesSearch && matchesCategory && matchesPersonality && matchesSkill && matchesSalary;
  });

  const handleGenerateVideo = async (career: Career) => {
    setSelectedCareer(career);
    setVideoUrl(null); 
    setIsVideoLoading(true);
    
    const url = await generateCareerVideo(career.title);
    setVideoUrl(url);
    setIsVideoLoading(false);
  };

  const closeVideoModal = () => {
    setSelectedCareer(null);
    setVideoUrl(null);
    setIsVideoLoading(false);
  };

  // Compare Logic
  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareList.includes(id)) {
      setCompareList(prev => prev.filter(c => c !== id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 careers at a time.");
        return;
      }
      setCompareList(prev => [...prev, id]);
    }
  };

  const getSelectedCareerData = () => {
    return MOCK_CAREERS.filter(c => compareList.includes(c.id));
  };

  return (
    <div className="h-full flex flex-col relative bg-slate-950">
      {/* Spacious Toolbar */}
      <div className="shrink-0 bg-slate-900/80 backdrop-blur-md px-6 py-6 border-b border-slate-800 flex flex-col gap-5 z-10 shadow-lg sticky top-0">
          
          {/* Top Row: Search & Main Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* Search Bar */}
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-0 bg-indigo-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-slate-800 rounded-xl flex items-center">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search careers, skills, or keywords..." 
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              </div>

              {/* Filter Group */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                 <div className="flex items-center gap-0 bg-slate-800 rounded-xl border border-slate-700 p-1 shadow-sm">
                     <div className="px-3 flex items-center gap-2 border-r border-slate-700">
                        <IndianRupee className="w-4 h-4 text-green-400" />
                        <select 
                          className="bg-transparent py-2 text-sm font-semibold text-slate-300 focus:outline-none cursor-pointer hover:text-white min-w-[100px] [&>option]:bg-slate-800 [&>option]:text-white"
                          value={salaryFilter}
                          onChange={(e) => setSalaryFilter(e.target.value)}
                        >
                          <option value="All">Salary: All</option>
                          <option value="Entry Level">&lt; 5L (Entry)</option>
                          <option value="Mid-Range">5L - 15L (Mid)</option>
                          <option value="High Paying">&gt; 15L (High)</option>
                        </select>
                     </div>
                     
                     <div className="px-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-400" />
                        <select 
                          className="bg-transparent py-2 text-sm font-semibold text-slate-300 focus:outline-none cursor-pointer hover:text-white max-w-[140px] [&>option]:bg-slate-800 [&>option]:text-white"
                          value={skillFilter}
                          onChange={(e) => setSkillFilter(e.target.value)}
                        >
                          <option value="All">Skills: All</option>
                          {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                     </div>
                 </div>

                 {/* Reset Button */}
                 {(searchTerm || activeCategory !== 'All' || salaryFilter !== 'All' || skillFilter !== 'All' || personalityFilter !== 'All') && (
                   <button 
                      onClick={() => {
                          setSearchTerm('');
                          setActiveCategory('All');
                          setSalaryFilter('All');
                          setSkillFilter('All');
                          setPersonalityFilter('All');
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors shadow-sm ml-auto md:ml-0 border border-red-500/20"
                  >
                      <X className="w-4 h-4" /> Reset
                  </button>
                 )}
              </div>
          </div>

          {/* Bottom Row: Category Chips (Wrapped) */}
          <div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Vocational / ITI', 'Govt & Defense', 'Technology', 'Healthcare', 'Finance', 'Creative', 'Engineering', 'Agriculture', 'Law'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveCategory(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border shadow-sm ${
                    activeCategory === f 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-900/50' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
          {filteredCareers.slice(0, 60).map((career) => (
            <div key={career.id} className={`bg-slate-900 rounded-2xl shadow-lg border overflow-hidden hover:shadow-2xl hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full ${compareList.includes(career.id) ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900' : 'border-slate-800'}`}>
              {/* Card Image */}
              <div className="h-48 bg-slate-800 relative overflow-hidden group">
                 <img 
                   src={career.imageUrl} 
                   alt={career.title} 
                   loading="lazy"
                   className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                   onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${career.title}&background=random&size=400`
                   }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent"></div>
                 
                 {/* Compare Checkbox - Top Left */}
                 <button
                    onClick={(e) => toggleCompare(career.id, e)}
                    className={`absolute top-3 left-3 p-2 rounded-full shadow-lg backdrop-blur-md transition-all z-20 flex items-center justify-center border border-white/10 ${compareList.includes(career.id) ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900/80 text-slate-400 hover:bg-white hover:text-indigo-600'}`}
                    title="Compare this career"
                  >
                    {compareList.includes(career.id) ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                 </button>

                 {/* Save / Bookmark Button - Top Right */}
                 <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(career.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-lg backdrop-blur-md transition-all z-20 flex items-center justify-center border border-white/10 ${user.savedCareers.includes(career.id) ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900/80 text-slate-400 hover:bg-white hover:text-indigo-600'}`}
                    title={user.savedCareers.includes(career.id) ? "Remove from Saved" : "Save Career"}
                  >
                    <Bookmark className={`w-4 h-4 ${user.savedCareers.includes(career.id) ? 'fill-current' : ''}`} />
                 </button>

                 {/* Industry Badge - Top Left (Offset) */}
                 <div className="absolute top-3 left-14 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-200 shadow-sm flex items-center gap-1.5 z-10 border border-slate-700 hidden sm:flex">
                    <Briefcase className="w-3 h-3 text-indigo-400" /> {career.industry}
                 </div>
                 
                 <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold text-lg leading-tight mb-1 shadow-black drop-shadow-md">{career.title}</h3>
                    <div className="flex items-center gap-3 text-slate-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                       <span className="flex items-center gap-1 text-green-400"><IndianRupee className="w-3 h-3" /> {career.salaryRange.split(' ')[0]}</span>
                       <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                       <span className="text-indigo-300">{career.education.split(' ')[0]}</span>
                    </div>
                 </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col bg-slate-900">
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {career.skills.slice(0, 3).map(s => (
                     <span key={s} className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] rounded-md border border-slate-700 font-semibold group-hover:border-indigo-500/30 transition-colors">
                       {s}
                     </span>
                  ))}
                  {career.skills.length > 3 && <span className="px-2 py-1 bg-slate-800 text-slate-500 text-[10px] rounded-md border border-slate-700 font-bold">+{career.skills.length - 3}</span>}
                </div>
                
                <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-3 group-hover:text-slate-300 transition-colors">{career.description}</p>

                <div className="mt-auto grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => onSelectPathway(career.id)}
                    className="col-span-3 bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                  >
                    View Roadmap
                  </button>
                  <button 
                    onClick={() => handleGenerateVideo(career)}
                    className="col-span-1 flex items-center justify-center bg-slate-800 text-indigo-400 rounded-xl hover:bg-slate-700 hover:text-white transition-colors border border-slate-700 group-hover:border-indigo-500/30"
                    title="Watch AI Video"
                  >
                    <PlayCircle className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCareers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-80 text-slate-400 bg-slate-900 rounded-3xl border border-dashed border-slate-800 mx-auto max-w-2xl mt-10">
            <div className="bg-slate-800 p-4 rounded-full mb-4">
               <Filter className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-300 mb-1">No careers found</h3>
            <p className="text-sm text-slate-500 mb-6">Try adjusting your search terms or filters.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('All');
                setSalaryFilter('All');
                setSkillFilter('All');
                setPersonalityFilter('All');
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-900/40 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Compare Floating Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-40 animate-in slide-in-from-bottom-4 border border-slate-600 ring-1 ring-white/10 max-w-[90%]">
           <div className="flex items-center gap-3">
              <div className="bg-indigo-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                {compareList.length}
              </div>
              <span className="font-semibold text-sm hidden sm:inline text-slate-200">Careers Selected</span>
           </div>
           <div className="h-6 w-px bg-slate-600"></div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setCompareList([])} 
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors px-2"
              >
                Clear
              </button>
              <button 
                onClick={() => setShowCompareModal(true)} 
                className="bg-white text-slate-900 hover:bg-indigo-50 px-5 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-2 shadow-lg"
              >
                Compare Now <ArrowRightLeft className="w-3 h-3" />
              </button>
           </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-200">
           <div className="bg-slate-900 rounded-3xl w-full max-w-6xl h-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-800">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                 <div>
                   <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                     <Scale className="w-6 h-6 text-indigo-500" /> Career Comparison
                   </h2>
                   <p className="text-slate-400 text-sm">Comparing {compareList.length} career paths side-by-side</p>
                 </div>
                 <button onClick={() => setShowCompareModal(false)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-slate-700 text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Comparison Table Container */}
              <div className="flex-1 overflow-auto p-6 bg-slate-950">
                 <div className="min-w-[800px]">
                    <div className="grid" style={{ gridTemplateColumns: `200px repeat(${compareList.length}, minmax(250px, 1fr))` }}>
                       {/* Header Row */}
                       <div className="p-4 font-bold text-slate-500 uppercase tracking-wider text-xs flex items-center">Metric</div>
                       {getSelectedCareerData().map(career => (
                          <div key={career.id} className="p-4 border-l border-slate-800 relative bg-slate-900/50">
                             <div className="flex justify-between items-start gap-2">
                                <h3 className="font-bold text-lg text-slate-200 leading-tight">{career.title}</h3>
                                <button onClick={() => setCompareList(prev => prev.filter(id => id !== career.id))} className="text-slate-500 hover:text-red-400 transition-colors">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                             <div className="mt-2 inline-block px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-indigo-300 border border-slate-700">
                               {career.industry}
                             </div>
                          </div>
                       ))}

                       {/* Salary Row */}
                       <div className="p-4 font-semibold text-slate-400 text-sm border-t border-slate-800 bg-slate-900">Salary Range</div>
                       {getSelectedCareerData().map(career => (
                          <div key={career.id} className="p-4 border-l border-t border-slate-800 bg-slate-900">
                             <div className="flex items-center gap-2 text-green-400 font-bold">
                                <IndianRupee className="w-4 h-4" /> {career.salaryRange}
                             </div>
                          </div>
                       ))}

                       {/* Education Row */}
                       <div className="p-4 font-semibold text-slate-400 text-sm border-t border-slate-800 bg-slate-900">Education</div>
                       {getSelectedCareerData().map(career => (
                          <div key={career.id} className="p-4 border-l border-t border-slate-800 bg-slate-900 text-sm text-slate-300">
                             {career.education}
                          </div>
                       ))}

                       {/* Growth Row */}
                       <div className="p-4 font-semibold text-slate-400 text-sm border-t border-slate-800 bg-slate-900">Growth Potential</div>
                       {getSelectedCareerData().map(career => (
                          <div key={career.id} className="p-4 border-l border-t border-slate-800 bg-slate-900">
                             <div className="flex items-center gap-2 mb-1">
                                <Zap className={`w-4 h-4 ${career.growthScore > 90 ? 'text-yellow-400' : 'text-slate-600'}`} />
                                <span className="font-bold text-slate-200">{career.growthScore}/100</span>
                             </div>
                             <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div className={`h-full rounded-full ${career.growthScore > 90 ? 'bg-green-500' : career.growthScore > 80 ? 'bg-indigo-500' : 'bg-slate-600'}`} style={{ width: `${career.growthScore}%` }}></div>
                             </div>
                          </div>
                       ))}

                       {/* Skills Row */}
                       <div className="p-4 font-semibold text-slate-400 text-sm border-t border-slate-800 bg-slate-900">Top Skills</div>
                       {getSelectedCareerData().map(career => (
                          <div key={career.id} className="p-4 border-l border-t border-slate-800 bg-slate-900">
                             <div className="flex flex-wrap gap-1">
                                {career.skills.slice(0, 4).map(s => (
                                  <span key={s} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-semibold text-slate-400">{s}</span>
                                ))}
                             </div>
                          </div>
                       ))}

                       {/* Description Row */}
                       <div className="p-4 font-semibold text-slate-400 text-sm border-t border-slate-800 bg-slate-900">Overview</div>
                       {getSelectedCareerData().map(career => (
                          <div key={career.id} className="p-4 border-l border-t border-slate-800 bg-slate-900 text-xs text-slate-400 leading-relaxed">
                             {career.description}
                          </div>
                       ))}

                       {/* Action Row */}
                       <div className="p-4 border-t border-slate-800 bg-slate-900"></div>
                       {getSelectedCareerData().map(career => (
                          <div key={career.id} className="p-4 border-l border-t border-slate-800 bg-slate-900">
                             <button 
                               onClick={() => {
                                 setShowCompareModal(false);
                                 onSelectPathway(career.id);
                               }}
                               className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/20"
                             >
                               Select Path
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Video Modal */}
      {selectedCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl animate-in fade-in duration-200" onClick={closeVideoModal}>
          <div className="bg-slate-900 rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
             <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
               <h3 className="text-white font-bold flex items-center gap-2">
                 <PlayCircle className="w-5 h-5 text-indigo-500" />
                 Career Preview: {selectedCareer.title}
               </h3>
               <button onClick={closeVideoModal} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full transition-colors border border-slate-700">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="aspect-video bg-black relative flex items-center justify-center">
               {isVideoLoading ? (
                 <div className="text-center p-8">
                   <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                   </div>
                   <p className="text-indigo-200 animate-pulse font-medium">Generating cinematic preview with Google Veo...</p>
                   <p className="text-slate-500 text-xs mt-2">This AI simulation may take up to a minute.</p>
                 </div>
               ) : videoUrl ? (
                 <video 
                   src={videoUrl} 
                   controls 
                   autoPlay 
                   className="w-full h-full object-contain"
                 />
               ) : (
                 <div className="text-slate-500 flex flex-col items-center">
                    <Briefcase className="w-10 h-10 opacity-20 mb-2" />
                    <span>Video unavailable</span>
                 </div>
               )}
             </div>
             
             <div className="p-4 bg-slate-900 border-t border-slate-800">
               <p className="text-slate-400 text-xs">
                 <span className="text-indigo-400 font-bold">AI Generated:</span> This video is created in real-time using Google's generative AI to help you visualize the {selectedCareer.title} environment.
               </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerLibrary;

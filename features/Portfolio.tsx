import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Upload, FileText, Image, Award, Layout, Download, Lightbulb, Plus, Printer, Check, Loader2 } from 'lucide-react';
import { generateProjectIdeas } from '../services/geminiService';

interface Props {
  user: UserProfile;
  initialTab?: 'builder' | 'projects';
}

const Portfolio: React.FC<Props> = ({ user, initialTab = 'builder' }) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'projects'>(initialTab);
  const [activeTemplate, setActiveTemplate] = useState('Modern');
  const [bio, setBio] = useState('Passionate student looking to explore the world of technology and design.');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string, type: string}[]>([]);
  
  // Project Generator State
  const [projectInterest, setProjectInterest] = useState(user.interests.length > 0 ? user.interests[0] : 'Technology');
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Sync bio with quiz results if available and bio is default
  useEffect(() => {
    if (user.quizResult && bio.startsWith('Passionate student')) {
      setBio(`I am a student in Grade ${user.grade} with a strong aptitude for ${user.quizResult.strength}. My learning style is ${user.quizResult.learningStyle}, and I am passionate about exploring careers in ${user.quizResult.recommendedStream}.`);
    }
  }, [user.quizResult, user.grade]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setUploadedFiles(prev => [...prev, {
        name: file.name,
        url: url,
        type: file.type
      }]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateProjects = async () => {
    if (!projectInterest) return;
    setLoadingProjects(true);
    const ideas = await generateProjectIdeas(projectInterest, user.grade);
    setProjects(ideas);
    setLoadingProjects(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top Nav for Portfolio */}
      <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1 no-print">
        <button 
          onClick={() => setActiveTab('builder')}
          className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'builder' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-white'}`}
        >
          Resume & Portfolio Builder
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          className={`pb-2 px-4 text-sm font-bold transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'projects' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-white'}`}
        >
          <Lightbulb className="w-4 h-4" /> Project Ideas Hub
        </button>
      </div>

      {/* CONTENT AREA */}
      {activeTab === 'builder' ? (
        <div className="h-full flex flex-col lg:flex-row gap-8">
          {/* Editor Side (Hidden on Print) */}
          <div className="lg:w-1/3 bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 overflow-y-auto no-print">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-500" /> Editor
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Choose Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Modern', 'Classic', 'Creative', 'Minimal'].map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveTemplate(t)}
                      className={`py-2 px-3 text-sm rounded-lg border ${
                        activeTemplate === t ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Short Bio</label>
                <textarea 
                  className="w-full p-3 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-800 text-white placeholder-slate-500"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2">Upload Artifacts</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:bg-slate-800/50 transition-colors relative">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">Upload certificates, project photos, or reports.</p>
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleFileUpload}
                  />
                  <span className="bg-slate-800 border border-slate-600 px-4 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white">Browse Files</span>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800 p-2 rounded-md border border-slate-700">
                        <FileText className="w-3 h-3" /> {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handlePrint}
              className="w-full mt-8 bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/50 hover:bg-indigo-500 transition-colors"
            >
              Print / Download PDF <Printer className="w-4 h-4" />
            </button>
            
            <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-xl text-xs text-amber-400">
               <strong>Tip:</strong> To save as PDF, click "Print" and select "Save as PDF" as the destination in your browser's print dialog.
            </div>
          </div>

          {/* Preview Side (Printable) */}
          <div className="flex-1 bg-slate-800/50 rounded-2xl p-4 md:p-8 overflow-y-auto flex justify-center print:bg-white print:p-0 print:overflow-visible">
            <div id="resume-preview" className={`bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-12 transition-all duration-500 print:shadow-none print:max-w-full text-slate-900 ${activeTemplate === 'Creative' ? 'border-t-8 border-indigo-500' : ''} ${activeTemplate === 'Minimal' ? 'font-serif' : 'font-sans'}`}>
              
              {/* Header */}
              <div className={`flex items-center gap-6 mb-12 border-b border-slate-100 pb-8 ${activeTemplate === 'Classic' ? 'flex-col text-center' : ''}`}>
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 print:bg-slate-100">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">{user.name || "Student Name"}</h1>
                  <p className="text-slate-500 text-lg">{user.grade} Student | Aspiring Innovator</p>
                </div>
              </div>

              {/* Psychometric Profile (New Section) */}
              {user.quizResult && (
                <div className="mb-10 break-inside-avoid">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Psychometric Profile</h3>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primary Strength</span>
                           <p className="font-bold text-slate-800 text-lg">{user.quizResult.strength}</p>
                        </div>
                        <div>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Learning Style</span>
                           <p className="font-bold text-slate-800 text-lg">{user.quizResult.learningStyle}</p>
                        </div>
                     </div>
                     <div className="mb-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommended Stream</span>
                        <p className="font-bold text-slate-800">{user.quizResult.recommendedStream}</p>
                     </div>
                     <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Personality Insight</span>
                        <p className="text-sm text-slate-700 mt-1 italic">"{user.quizResult.personalityDescription}"</p>
                     </div>
                  </div>
                </div>
              )}

              {/* Bio */}
              <div className="mb-10 break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">About Me</h3>
                <p className="text-slate-700 leading-relaxed text-lg">{bio}</p>
              </div>

              {/* Achievements */}
              <div className="mb-10 break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Key Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.achievements.length > 0 ? user.achievements.map((ach, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg print:border print:border-slate-200">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-slate-800">{ach}</span>
                    </div>
                  )) : <p className="text-slate-400 italic">No achievements listed yet.</p>}
                </div>
              </div>

              {/* Skills */}
              <div className="mb-10 break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Core Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(user.skillProgress).map(([k, v]) => (
                    (v as number) > 40 && <span key={k} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-medium text-sm print:border print:border-slate-200">{k}</span>
                  ))}
                </div>
              </div>

              {/* Artifacts / Projects */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Featured Projects & Artifacts</h3>
                <div className="space-y-4">
                  {uploadedFiles.length > 0 ? uploadedFiles.map((f, i) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 gap-4 break-inside-avoid">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                              {f.type.startsWith('image/') ? <Image className="w-5 h-5 text-slate-400" /> : <FileText className="w-5 h-5 text-slate-400" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">{f.name}</h4>
                              <p className="text-sm text-slate-500">Portfolio Artifact</p>
                            </div>
                        </div>
                        {f.type.startsWith('image/') ? (
                          <div className="rounded-lg overflow-hidden border border-slate-200 mt-2">
                            <img src={f.url} alt={f.name} className="w-full h-auto object-cover max-h-64" />
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic border border-slate-100">
                            File attached: {f.name} (View in digital portfolio)
                          </div>
                        )}
                    </div>
                  )) : (
                    <div className="border border-slate-100 rounded-xl p-4 flex gap-4 break-inside-avoid">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <Image className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">School Science Fair Model</h4>
                          <p className="text-sm text-slate-500 mt-1">Example Project Entry</p>
                        </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : (
        /* PROJECTS TAB */
        <div className="h-full max-w-4xl mx-auto p-6">
           <div className="bg-gradient-to-r from-indigo-700 to-violet-800 rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-2xl border border-indigo-500/30">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Build Your Portfolio</h2>
                <p className="text-indigo-200 mb-6 max-w-xl">
                  Not sure what to add to your resume? Generate personalized project ideas based on your interests to demonstrate your skills to future colleges.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 bg-white/5 p-2 rounded-xl backdrop-blur-md border border-white/10 max-w-lg">
                  <input 
                    type="text" 
                    value={projectInterest}
                    onChange={(e) => setProjectInterest(e.target.value)}
                    placeholder="Enter area of interest (e.g. Robotics, History, Coding)..."
                    className="flex-1 bg-transparent border-none text-white placeholder-indigo-300 focus:outline-none px-3 font-medium"
                  />
                  <button 
                    onClick={handleGenerateProjects}
                    disabled={loadingProjects}
                    className="bg-white text-indigo-700 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {loadingProjects ? <Loader2 className="w-4 h-4 animate-spin"/> : <Lightbulb className="w-4 h-4"/>}
                    Generate Ideas
                  </button>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20">
                 <Award className="w-64 h-64 -mr-10 -mb-10 rotate-12" />
              </div>
           </div>

           {/* Generated Projects List */}
           <div className="space-y-6">
             {loadingProjects ? (
               <div className="text-center py-20">
                 <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
                 <p className="text-slate-500">Consulting AI for the best project ideas...</p>
               </div>
             ) : projects.length > 0 ? (
               <div className="grid gap-6">
                 {projects.map((proj, i) => (
                   <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg hover:border-indigo-500/50 transition-all animate-in slide-in-from-bottom-4 fade-in" style={{animationDelay: `${i * 100}ms`}}>
                     <div className="flex justify-between items-start mb-3">
                       <h3 className="text-xl font-bold text-white">{proj.title}</h3>
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${proj.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : proj.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                         {proj.difficulty}
                       </span>
                     </div>
                     <p className="text-slate-400 mb-4 leading-relaxed">{proj.description}</p>
                     
                     <div className="mb-4">
                       <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills You'll Gain</h4>
                       <div className="flex flex-wrap gap-2">
                         {proj.skills_gained?.map((skill: string, idx: number) => (
                           <span key={idx} className="bg-slate-800 text-slate-300 px-2 py-1 rounded-md text-xs font-medium border border-slate-700">{skill}</span>
                         ))}
                       </div>
                     </div>
                     
                     <button className="text-indigo-400 font-bold text-sm flex items-center gap-1 hover:text-indigo-300">
                       Start Project <Plus className="w-4 h-4" />
                     </button>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                 <Lightbulb className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                 <p className="text-slate-500">Enter your interest above to see project ideas.</p>
               </div>
             )}
           </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background-color: white !important;
            color: black !important;
          }
          #resume-preview, #resume-preview * {
            visibility: visible;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            border: none;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;
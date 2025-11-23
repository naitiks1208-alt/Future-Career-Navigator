
import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { MOCK_CAREERS } from '../constants';
import { generatePathway } from '../services/geminiService';
import { CheckCircle2, ChevronRight, BookOpen, Star, RefreshCw, Download } from 'lucide-react';

interface Props {
  initialCareerId: string | null;
  user: UserProfile;
}

const CareerPathway: React.FC<Props> = ({ initialCareerId, user }) => {
  const [careerId, setCareerId] = useState(initialCareerId || MOCK_CAREERS[0].id);
  const [loading, setLoading] = useState(false);
  const [pathwayData, setPathwayData] = useState<any>(null);

  const career = MOCK_CAREERS.find(c => c.id === careerId);

  useEffect(() => {
    if (career) {
      fetchPathway();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerId]);

  const fetchPathway = async () => {
    setLoading(true);
    setPathwayData(null);
    if (!career) return;
    
    // In a real app, we'd cache this result
    const data = await generatePathway(career.title, user);
    setPathwayData(data);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto" id="roadmap-container">
      <style>{`
        @media print {
          @page { margin: 1cm; }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          /* Hide everything by default */
          body > * {
            display: none !important;
          }
          /* Show root but hide its direct children if they are not the main container */
          body > #root {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* We need to specifically target the roadmap container to be visible */
          #roadmap-container {
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            z-index: 9999 !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            visibility: visible !important;
          }

          #roadmap-container * {
            visibility: visible !important;
            color: black !important;
            text-shadow: none !important;
          }

          /* Reset colors for print */
          .bg-slate-900 {
            background-color: transparent !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            color: black !important;
          }
          .text-white {
            color: black !important;
          }
          .text-slate-300, .text-slate-400, .text-slate-500 {
            color: #333 !important;
          }
          .bg-indigo-600 {
            background-color: #333 !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Hide interactive elements */
          button, select, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-white">Career Roadmap</h1>
           <p className="text-slate-400">Step-by-step guide to becoming a {career?.title}</p>
        </div>
        
        {/* Simple Dropdown to switch career in this view */}
        <select 
          className="p-2 border border-slate-700 rounded-lg bg-slate-900 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 print:hidden"
          value={careerId}
          onChange={(e) => setCareerId(e.target.value)}
        >
          {MOCK_CAREERS.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-3xl p-12 shadow-sm border border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-lg font-medium text-slate-300">AI is designing your future path...</p>
          <p className="text-slate-500 text-sm mt-2">Analyzing education, skills, and industry trends.</p>
        </div>
      ) : pathwayData ? (
        <div className="space-y-8 relative">
           {/* Connecting Line (Desktop) */}
           <div className="absolute left-8 top-8 bottom-8 w-1 bg-slate-800 hidden md:block print:border-l print:border-slate-300"></div>

           {pathwayData.milestones?.map((step: any, idx: number) => (
             <div key={idx} className="relative pl-0 md:pl-20 animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
               
               {/* Marker */}
               <div className="hidden md:flex absolute left-4 top-0 w-9 h-9 bg-indigo-600 rounded-full border-4 border-slate-900 items-center justify-center text-white font-bold z-10 shadow-lg shadow-indigo-900/50 print:border-white">
                 {idx + 1}
               </div>

               <div className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 hover:border-indigo-500/50 transition-colors print:break-inside-avoid">
                 <div className="flex items-center gap-3 mb-4">
                   <span className="md:hidden flex w-8 h-8 bg-indigo-600 text-white rounded-full items-center justify-center font-bold text-sm">{idx + 1}</span>
                   <h3 className="text-xl font-bold text-white">{step.stage}</h3>
                 </div>
                 
                 <div className="space-y-3">
                   {step.actions.map((action: string, i: number) => (
                     <div key={i} className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5 print:text-black" />
                       <span className="text-slate-300">{action}</span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           ))}

           {/* Extras */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-20 print:pl-0 print:grid-cols-2">
              <div className="bg-indigo-900/20 border border-indigo-500/20 p-6 rounded-2xl print:break-inside-avoid print:bg-slate-50 print:border-slate-200">
                <h4 className="font-bold text-indigo-300 mb-3 flex items-center gap-2 print:text-black"><Star className="w-5 h-5"/> Recommended Degrees</h4>
                <div className="flex flex-wrap gap-2">
                  {pathwayData.recommendedDegrees?.map((d: string, i: number) => (
                    <span key={i} className="bg-indigo-950 text-indigo-200 px-3 py-1 rounded-md text-sm shadow-sm border border-indigo-900 print:bg-white print:text-black print:border-slate-300">{d}</span>
                  ))}
                </div>
              </div>
              <div className="bg-orange-900/20 border border-orange-500/20 p-6 rounded-2xl print:break-inside-avoid print:bg-slate-50 print:border-slate-200">
                <h4 className="font-bold text-orange-300 mb-3 flex items-center gap-2 print:text-black"><BookOpen className="w-5 h-5"/> Top Skills to Master</h4>
                <div className="flex flex-wrap gap-2">
                  {pathwayData.topSkills?.map((s: string, i: number) => (
                    <span key={i} className="bg-orange-950 text-orange-200 px-3 py-1 rounded-md text-sm shadow-sm border border-orange-900 print:bg-white print:text-black print:border-slate-300">{s}</span>
                  ))}
                </div>
              </div>
           </div>

           <div className="flex justify-center pt-8 print:hidden">
              <button 
                onClick={handlePrint}
                className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download PDF Roadmap
              </button>
           </div>
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
           Failed to load pathway. Please check your API configuration.
        </div>
      )}
    </div>
  );
};

export default CareerPathway;

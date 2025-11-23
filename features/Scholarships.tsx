import React, { useState } from 'react';
import { MOCK_SCHOLARSHIPS } from '../constants';
import { ExternalLink, Calendar, MapPin, IndianRupee, Search, Filter, RefreshCw } from 'lucide-react';
import { Scholarship } from '../types';
import { getLatestScholarships } from '../services/geminiService';

const Scholarships: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // State for dynamic scholarships
  const [dynamicScholarships, setDynamicScholarships] = useState<Scholarship[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const filters = ['All', 'Central', 'State', 'Private', 'Exam'];

  // Combine static and dynamic lists
  const allScholarships = [...dynamicScholarships, ...MOCK_SCHOLARSHIPS];

  const filteredScholarships = allScholarships.filter(scholarship => {
    const matchesFilter = activeFilter === 'All' || scholarship.category === activeFilter;
    const matchesSearch = scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scholarship.eligibility.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleUpdateScholarships = async () => {
    setIsUpdating(true);
    const newScholarships = await getLatestScholarships();
    if (newScholarships && newScholarships.length > 0) {
      setDynamicScholarships(prev => [...newScholarships, ...prev]);
    }
    setIsUpdating(false);
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Central': return 'bg-orange-900/40 text-orange-300 border border-orange-700/50';
      case 'State': return 'bg-blue-900/40 text-blue-300 border border-blue-700/50';
      case 'Private': return 'bg-purple-900/40 text-purple-300 border border-purple-700/50';
      case 'Exam': return 'bg-red-900/40 text-red-300 border border-red-700/50';
      default: return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Scholarship Finder 2025-26</h1>
        <p className="text-slate-400">Discover government and private funding for your education.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input 
            type="text"
            placeholder="Search scholarships (e.g. 'Merit', 'Class 10', 'UP')..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center flex-wrap md:flex-nowrap">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40' 
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleUpdateScholarships}
            disabled={isUpdating}
            className="px-4 py-2.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-600/30 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Check Updates'}
          </button>
        </div>
      </div>

      {/* List */}
      {filteredScholarships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <div key={scholarship.id} className="bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-800 hover:border-indigo-500/50 hover:-translate-y-1 transition-all flex flex-col relative overflow-hidden group h-full">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                scholarship.category === 'Central' ? 'bg-orange-500' :
                scholarship.category === 'State' ? 'bg-blue-500' :
                scholarship.category === 'Exam' ? 'bg-red-500' :
                'bg-purple-500'
              }`}></div>
              
              <div className="mb-4 pl-2">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(scholarship.category)}`}>
                    {scholarship.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{scholarship.country}</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 h-12">{scholarship.name}</h3>
              </div>

              <div className="space-y-3 mb-6 flex-1 pl-2">
                <div className="flex items-start gap-3 text-slate-300 text-sm">
                  <IndianRupee className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="font-semibold text-green-400">{scholarship.amount}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <Calendar className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Deadline: {scholarship.deadline}</span>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400 border border-slate-700/50">
                  <strong className="text-slate-300">Eligibility:</strong> {scholarship.eligibility}
                </div>
              </div>

              <button 
                onClick={() => window.open(scholarship.link, '_blank')}
                className="w-full bg-slate-800 text-indigo-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white transition-all mt-auto border border-slate-700 group-hover:border-indigo-500/20"
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900 rounded-2xl border border-dashed border-slate-700">
          <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-400">No scholarships found</h3>
          <p className="text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Scholarships;
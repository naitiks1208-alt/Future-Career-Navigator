
import React, { useState } from 'react';
import { UserProfile, QuizResult, Career } from '../types';
import { Check, ArrowRight, ArrowLeft, Brain, BookOpen, Hammer, Heart, Trophy, User, Lightbulb, Target } from 'lucide-react';
import { MOCK_CAREERS } from '../constants';

interface Props {
  user: UserProfile;
  onComplete: (result: QuizResult) => void;
  onUpdateName: (name: string) => void;
}

// Categories: Subject Interest, Work Environment, Personality (RIASEC)
const QUESTIONS = [
  // --- SECTION 1: SUBJECT APTITUDE ---
  { id: 1, text: "I enjoy solving complex Math problems, equations, and using logic.", type: 'I', trait: 'Math', category: 'Aptitude' },
  { id: 2, text: "I am fascinated by Biology, human anatomy, plants, or how living things function.", type: 'S', trait: 'Bio', category: 'Aptitude' },
  { id: 3, text: "I enjoy History, Politics, Social Sciences, and understanding how society works.", type: 'E', trait: 'Humanities', category: 'Aptitude' },
  { id: 4, text: "I am good at managing Money, Accounts, and understanding Profit/Loss.", type: 'C', trait: 'Commerce', category: 'Aptitude' },
  { id: 5, text: "I understand Physics, mechanics, and how machines or electricity work.", type: 'R', trait: 'Physics', category: 'Aptitude' },
  { id: 6, text: "I love learning Languages, writing stories, or communicating ideas effectively.", type: 'A', trait: 'Language', category: 'Aptitude' },

  // --- SECTION 2: WORK ENVIRONMENT & GOALS ---
  { id: 7, text: "I prefer 'Hands-on' work (fixing, building, crafting) over sitting at a desk.", type: 'R', trait: 'Vocational', category: 'Work Style' },
  { id: 8, text: "I want a job where I directly help people cure sickness or improve their lives.", type: 'S', trait: 'Medical', category: 'Motivation' },
  { id: 9, text: "I like leading teams, giving presentations, and influencing people.", type: 'E', trait: 'Leadership', category: 'Social' },
  { id: 10, text: "I prefer the stability and respect of a Government Job over private sector risks.", type: 'C', trait: 'Govt', category: 'Stability' },
  { id: 11, text: "I enjoy creative freedom (Design, Art, Music) and dislike strict rules.", type: 'A', trait: 'Creative', category: 'Creativity' },
  { id: 12, text: "I am willing to study for many years (like for MBBS/PhD/UPSC) to reach the top.", type: 'I', trait: 'Research', category: 'Commitment' },

  // --- SECTION 3: SPECIFIC INTERESTS ---
  { id: 13, text: "I want to start earning quickly via a skilled trade (Electrician, Technician, etc.).", type: 'R', trait: 'Vocational', category: 'Goals' },
  { id: 14, text: "I am curious about Computers, Coding, AI, and how software is built.", type: 'I', trait: 'Tech', category: 'Interest' },
  { id: 15, text: "I like organizing data, files, schedules, and keeping things systematic.", type: 'C', trait: 'Admin', category: 'Organization' },
  { id: 16, text: "I enjoy visual arts, sketching, fashion, or editing videos.", type: 'A', trait: 'Design', category: 'Interest' },
  { id: 17, text: "I am physically fit and attracted to the Uniform/Discipline of Defense/Police.", type: 'R', trait: 'Defense', category: 'Service' },
  { id: 18, text: "I am interested in the Stock Market, Investments, and Business growth.", type: 'E', trait: 'Finance', category: 'Interest' },

  // --- SECTION 4: PERSONALITY & BEHAVIOR ---
  { id: 19, text: "I make decisions based on Logic and Data rather than emotions.", type: 'I', trait: 'Logic', category: 'Personality' },
  { id: 20, text: "I love animals, nature, and working outdoors.", type: 'R', trait: 'Nature', category: 'Environment' },
  { id: 21, text: "I am competitive and want a high-status, high-paying career.", type: 'E', trait: 'Ambition', category: 'Motivation' },
  { id: 22, text: "I prefer clear instructions and a routine; I don't like unexpected surprises.", type: 'C', trait: 'Structure', category: 'Personality' },
  { id: 23, text: "I often find myself daydreaming or thinking about abstract concepts.", type: 'A', trait: 'Abstract', category: 'Personality' },
  { id: 24, text: "I am a good listener and friends often come to me for advice.", type: 'S', trait: 'Empathy', category: 'Personality' },
  { id: 25, text: "I enjoy taking things apart (gadgets, toys) just to see how they work.", type: 'R', trait: 'Mechanics', category: 'Curiosity' },
  { id: 26, text: "I am comfortable taking risks if the reward is big (Business/Startup).", type: 'E', trait: 'Risk', category: 'Personality' },
  
  // --- SECTION 5: NICHE & LIFESTYLE ---
  { id: 27, text: "I love traveling, seeing new places, and don't mind being away from home.", type: 'E', trait: 'Travel', category: 'Lifestyle' },
  { id: 28, text: "I enjoy cooking, baking, or experimenting with food.", type: 'R', trait: 'Food', category: 'Interest' },
  { id: 29, text: "I like explaining things to others and helping them understand new concepts.", type: 'S', trait: 'Teaching', category: 'Skill' },

  // --- SECTION 6: NEW TARGETED QUESTIONS ---
  { id: 30, text: "I am passionate about sports, fitness, or athletic training.", type: 'R', trait: 'Sports', category: 'Interest' },
  { id: 31, text: "I enjoy debating, arguing for a cause, or understanding the law.", type: 'E', trait: 'Law', category: 'Interest' },
  { id: 32, text: "I am interested in agriculture, farming techniques, and nature conservation.", type: 'R', trait: 'Agri', category: 'Interest' }
];

const CareerQuiz: React.FC<Props> = ({ user, onComplete, onUpdateName }) => {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState<Record<number, number>>({}); 
  const [calculatedResult, setCalculatedResult] = useState<QuizResult | null>(null);
  const [studentName, setStudentName] = useState(user.name);

  const handleStart = () => {
    if (studentName.trim().length > 0) {
      onUpdateName(studentName);
      setStep(1);
    } else {
      alert("Please enter your name to start.");
    }
  };

  const handleAnswer = (score: number) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[step - 1].id]: score }));
    
    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length + 1); 
      setTimeout(() => calculateResult(), 1500); 
    }
  };

  const calculateResult = () => {
    try {
      // 1. CALCULATE TRAIT SCORES
      const traits: Record<string, number> = {};
      const riasec = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

      QUESTIONS.forEach(q => {
        const ans = answers[q.id] || 3; // Default to neutral (3) if missing
        
        // Aggregate specific trait scores
        if (!traits[q.trait]) traits[q.trait] = 0;
        traits[q.trait] += ans;

        // Aggregate RIASEC scores
        riasec[q.type as keyof typeof riasec] += ans;
      });

      // 2. DETERMINE TOP PERSONALITY TYPES
      const riasecEntries = Object.entries(riasec);
      riasecEntries.sort((a, b) => b[1] - a[1]);
      const topType = riasecEntries[0][0]; // e.g., 'R'
      const secondType = riasecEntries[1][0]; // e.g., 'I'

      // 3. GENERATE PERSONALITY DESCRIPTION
      const typeDescriptions: Record<string, string> = {
        R: "You are a 'Doer'. You are practical, realistic, and love seeing tangible results. You enjoy working with tools, machines, nature, or your hands.",
        I: "You are a 'Thinker'. You are analytical, intellectual, and curious. You love solving complex puzzles and understanding the 'why' behind things.",
        A: "You are a 'Creator'. You are expressive, original, and independent. You thrive in environments where you can use your imagination.",
        S: "You are a 'Helper'. You are kind, generous, and patient. You find satisfaction in teaching, healing, or guiding others.",
        E: "You are a 'Persuader'. You are energetic, ambitious, and confident. You enjoy leading teams, selling ideas, and taking risks.",
        C: "You are an 'Organizer'. You are detail-oriented, precise, and efficient. You value structure, stability, and clear guidelines."
      };
      
      let personalityDesc = typeDescriptions[topType] + " ";
      if (topType === 'I' && secondType === 'A') personalityDesc += "Your blend of logic and creativity makes you an innovator.";
      if (topType === 'R' && secondType === 'I') personalityDesc += "You have a scientific mind with practical hands-on skills.";
      if (topType === 'E' && secondType === 'S') personalityDesc += "You are a charismatic leader who truly cares about people.";
      if (topType === 'C' && traits['Govt'] > 3) personalityDesc += "You value stability and would thrive in structured roles like Government services.";
      
      // 4. SCORING ALGORITHM FOR CAREERS
      const careerScores = MOCK_CAREERS.map((career: Career) => {
        let score = 0;

        // A. RIASEC Matching (Base Score: 30%)
        if (career.personalityType.startsWith(topType)) score += 20;
        else if (career.personalityType.startsWith(secondType)) score += 10;

        // B. Subject/Industry Matching (40%)
        // Tech & Logic
        if (traits['Tech'] >= 4 && (career.tags.includes('Tech') || career.industry === 'Technology')) score += 15;
        if (traits['Math'] >= 4 && (career.subjects.includes('Math') || career.subjects.includes('CS'))) score += 10;
        if (traits['Physics'] >= 4 && (career.subjects.includes('Physics') || career.industry === 'Engineering')) score += 10;
        
        // Biology & Medical
        if (traits['Bio'] >= 4 && (career.subjects.includes('Biology') || career.industry === 'Healthcare' || career.industry === 'Agriculture')) score += 15;
        if (traits['Medical'] >= 4 && career.industry === 'Healthcare') score += 15;
        
        // Creativity & Arts
        if (traits['Creative'] >= 4 && (career.industry === 'Creative' || career.tags.includes('Creative'))) score += 15;
        if (traits['Design'] >= 4 && (career.tags.includes('Design') || career.industry === 'Creative')) score += 10;
        
        // Commerce & Biz
        if (traits['Commerce'] >= 4 && (career.industry === 'Finance' || career.subjects.includes('Accounts'))) score += 15;
        if (traits['Finance'] >= 4 && career.industry === 'Finance') score += 10;
        
        // Humanities & Law
        if (traits['Humanities'] >= 4 && (career.industry === 'Humanities' || career.industry === 'Legal' || career.industry === 'Social')) score += 15;
        if (traits['Language'] >= 4 && (career.tags.includes('Writing') || career.industry === 'Media')) score += 10;

        // C. Specific Goal Matching (30%)
        // Govt vs Private
        if (traits['Govt'] >= 4) {
           if (career.industry === 'Govt' || career.tags.includes('Govt') || career.industry === 'Defense') score += 25;
        }
        
        // Vocational / Hands-on
        if ((traits['Vocational'] >= 8) || (traits['Mechanics'] >= 4 && traits['Physics'] < 3)) {
           // High vocational interest or likes mechanics but hates theory
           if (career.industry === 'Vocational' || career.tags.includes('Trade')) score += 30;
        }
        
        // Defense & Sports
        if (traits['Defense'] >= 4 && (career.industry === 'Defense' || career.tags.includes('Police'))) score += 25;
        if (career.industry === 'Sports' && (traits['Defense'] >= 4 || traits['Vocational'] >= 4)) score += 15; // Physicality link

        // Nature/Agriculture
        if (traits['Nature'] >= 4 && (career.industry === 'Agriculture' || career.tags.includes('Nature'))) score += 15;

        // Research / Deep Study
        if (traits['Research'] >= 4 && (career.tags.includes('Research') || career.education.includes('PhD') || career.education.includes('MBBS'))) score += 10;
        else if (traits['Research'] <= 2 && (career.education.includes('PhD') || career.education.includes('MBBS'))) score -= 10; // Penalty for long study if disliked

        // D. New Traits Logic
        // Travel -> Aviation, Logistics, Merchant Navy
        if (traits['Travel'] >= 4) {
            if (career.industry === 'Aviation' || career.industry === 'Logistics' || career.tags.includes('Travel') || career.tags.includes('Sea')) score += 20;
        }
        // Food -> Hospitality, Agri
        if (traits['Food'] >= 4) {
            if (career.tags.includes('Food') || career.industry === 'Agriculture' || career.industry === 'Vocational') score += 15;
        }
        // Teaching
        if (traits['Teaching'] >= 4) {
            if (career.industry === 'Education' || career.tags.includes('Teaching') || career.tags.includes('Coach')) score += 20;
        }
        // Sports
        if (traits['Sports'] >= 4) {
            if (career.industry === 'Sports' || career.tags.includes('Sport')) score += 25;
        }
        // Law
        if (traits['Law'] >= 4) {
             if (career.industry === 'Legal' || career.tags.includes('Law')) score += 25;
        }
        // Agri
        if (traits['Agri'] >= 4) {
             if (career.industry === 'Agriculture') score += 25;
        }

        return { career, score };
      });

      // 5. SORT AND RANK
      careerScores.sort((a, b) => b.score - a.score);
      const topMatches = careerScores.slice(0, 6).map(c => c.career.id); // Get top 6 matches ranging from most favorable

      // 6. DETERMINE STREAM BASED ON TOP CAREER
      const topCareer = careerScores[0].career;
      let recommendedStream = "General";
      
      if (topCareer.industry === 'Vocational') recommendedStream = "Vocational / ITI / Skill Development";
      else if (topCareer.industry === 'Technology' || topCareer.industry === 'Engineering') recommendedStream = "Science (PCM)";
      else if (topCareer.industry === 'Healthcare' || topCareer.industry === 'Agriculture') recommendedStream = "Science (PCB)";
      else if (topCareer.industry === 'Finance' || topCareer.industry === 'Business') recommendedStream = "Commerce";
      else if (topCareer.industry === 'Legal' || topCareer.industry === 'Humanities' || topCareer.industry === 'Govt') recommendedStream = "Arts / Humanities";
      else if (topCareer.industry === 'Defense') recommendedStream = "Any Stream (Prep for NDA/Defense Exams)";
      else if (topCareer.industry === 'Creative') recommendedStream = "Any Stream + Design/Media Portfolio";
      else if (topCareer.industry === 'Aviation') recommendedStream = "Science (PCM)";

      // 7. CALCULATE SKILL PROFILE
      const normalize = (val: number, max: number) => Math.min(100, Math.max(20, Math.round((val / max) * 100)));
      const skillProfile = {
        Logic: normalize(traits['Math'] + traits['Logic'] + traits['Tech'], 15),
        Creativity: normalize(traits['Creative'] + traits['Design'] + traits['Abstract'], 15),
        Communication: normalize(traits['Language'] + traits['Leadership'] + traits['Empathy'] + traits['Law'], 18),
        Coding: normalize(traits['Tech'] + traits['Math'], 10),
        Leadership: normalize(traits['Leadership'] + traits['Ambition'] + traits['Law'], 15),
        Collaboration: normalize(traits['Empathy'] + traits['Nature'] + traits['Teaching'] + traits['Sports'], 20)
      };

      const result: QuizResult = {
        recommendedStream,
        topClusters: [topCareer.industry, careerScores[1].career.industry, careerScores[2].career.industry],
        strength: topType === 'R' ? 'Practical Skills' : topType === 'I' ? 'Analytical Thinking' : topType === 'A' ? 'Creativity' : topType === 'S' ? 'Empathy' : topType === 'E' ? 'Leadership' : 'Organization',
        learningStyle: topType === 'R' ? 'Kinesthetic (Doing)' : topType === 'A' ? 'Visual' : 'Logical',
        confidenceScore: Math.min(98, Math.round((careerScores[0].score / 90) * 100)), // Normalize
        recommendedCareers: topMatches,
        skillProfile,
        personalityDescription: personalityDesc
      };

      setCalculatedResult(result);
      setStep(QUESTIONS.length + 2); 

    } catch (e) {
      console.error("Quiz Calculation Error", e);
      // Fallback
      setCalculatedResult({
           recommendedStream: 'General',
           topClusters: ['General'],
           strength: 'Versatile',
           learningStyle: 'Mixed',
           confidenceScore: 70,
           recommendedCareers: MOCK_CAREERS.slice(0, 6).map(c => c.id),
           skillProfile: { Communication: 50, Creativity: 50, Coding: 50, Logic: 50, Leadership: 50, Collaboration: 50 },
           personalityDescription: "You have a balanced profile."
      });
      setStep(QUESTIONS.length + 2);
    }
  };

  if (step === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center bg-slate-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-700 relative overflow-hidden group">
           {/* Glow Effects */}
           <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
           <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px]"></div>
           
           <div className="w-24 h-24 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-inner border border-indigo-700/50">
             <Brain className="w-12 h-12 text-indigo-400" />
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Indian Career Psychometric Test</h2>
           <p className="text-slate-400 mb-8 text-lg max-w-lg mx-auto leading-relaxed">
             Confused between PCM, PCB, Commerce, Arts, or Vocational? We analyze your <span className="font-bold text-indigo-400">Interests</span>, <span className="font-bold text-fuchsia-400">Personality</span>, and <span className="font-bold text-cyan-400">Aptitude</span> to find your perfect path in India.
           </p>
           
           <div className="mb-8 text-left max-w-sm mx-auto bg-slate-800/50 p-4 rounded-xl border border-slate-700 shadow-sm">
              <label className="block text-sm font-bold text-indigo-400 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Student Name
              </label>
              <input 
                type="text" 
                className="w-full p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-900 text-white placeholder-slate-500"
                placeholder="Enter your full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
           </div>

           <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-slate-400">
              <span className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-sm"><BookOpen className="w-4 h-4 text-blue-400"/> Subject Interest</span>
              <span className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-sm"><Heart className="w-4 h-4 text-rose-400"/> Passion Check</span>
              <span className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 shadow-sm"><Hammer className="w-4 h-4 text-amber-400"/> Skill Mapping</span>
           </div>
           <button 
             onClick={handleStart}
             className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-4 rounded-full font-bold text-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-900/50 flex items-center gap-3 mx-auto transform hover:scale-105 duration-200"
           >
             Start My Analysis <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      </div>
    );
  }

  if (step === QUESTIONS.length + 1) {
    return (
      <div className="h-full flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="relative mb-6">
             <div className="w-24 h-24 border-4 border-slate-700 rounded-full mx-auto animate-spin border-t-indigo-500"></div>
             <Brain className="w-10 h-10 text-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Analyzing your profile...</h3>
          <p className="text-slate-400">Scoring your compatibility against 300+ Indian Career Paths...</p>
        </div>
      </div>
    );
  }

  if (step === QUESTIONS.length + 2 && calculatedResult) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-green-400 via-teal-500 to-emerald-600"></div>
           
           <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 p-4 rounded-full shadow-xl border-4 border-slate-900">
             <Trophy className="w-10 h-10 text-yellow-400" />
           </div>
           
           <h2 className="text-3xl font-bold text-white mt-8 mb-2">Analysis Complete!</h2>
           <p className="text-slate-400 mb-6">Great job, {studentName.split(' ')[0]}. We've found your ideal path.</p>
           
           <div className="bg-slate-800/50 rounded-2xl p-6 mb-8 text-left border border-slate-700 shadow-inner">
             <div className="mb-4">
               <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1"><Target className="w-3 h-3"/> Recommended Stream</span>
               <div className="text-3xl font-extrabold text-white mt-1 drop-shadow-md">{calculatedResult.recommendedStream}</div>
             </div>
             <div className="mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Lightbulb className="w-3 h-3"/> Top Strength</span>
                <div className="text-lg font-medium text-slate-300">{calculatedResult.strength}</div>
             </div>
             <div className="mb-4">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><User className="w-3 h-3"/> Personality Insight</span>
                 <div className="text-sm text-slate-400 mt-1 italic leading-relaxed border-l-2 border-slate-600 pl-3">"{calculatedResult.personalityDescription}"</div>
             </div>
             <div>
                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Match Confidence</span>
                <div className="w-full bg-slate-900 rounded-full h-3 mt-1 border border-slate-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ width: `${calculatedResult.confidenceScore}%` }}></div>
                </div>
                <div className="text-right text-xs font-bold text-green-400 mt-1">{calculatedResult.confidenceScore}% Match</div>
             </div>
           </div>

           <button 
             onClick={() => onComplete(calculatedResult)}
             className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 transform active:scale-95"
           >
             View My Top Career Matches <ArrowRight className="w-5 h-5" />
           </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step - 1];
  if (!q) return <div>Error loading question</div>;
  
  const progress = ((step - 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex justify-between text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">
          <span>Question {step} / {QUESTIONS.length}</span>
          <span>{q.category}</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-800 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
         {/* Decorative Blobs */}
         <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-purple-600/10 rounded-full blur-[60px]"></div>
         <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-[60px]"></div>
         
         <div className="relative z-10">
           <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-snug text-center drop-shadow-md">{q.text}</h3>
           
           <div className="space-y-3 max-w-xl mx-auto">
             {[
               { val: 5, label: "Strongly Agree (Yes!)", color: "border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-400" },
               { val: 4, label: "Agree", color: "border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/50 text-blue-400" },
               { val: 3, label: "Neutral / Not Sure", color: "border-slate-700 hover:bg-slate-800 hover:border-slate-500 text-slate-400" },
               { val: 2, label: "Disagree", color: "border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/50 text-orange-400" },
               { val: 1, label: "Strongly Disagree (No way!)", color: "border-red-500/20 hover:bg-red-500/10 hover:border-red-500/50 text-red-400" }
             ].map((opt) => (
               <button
                 key={opt.val}
                 onClick={() => handleAnswer(opt.val)}
                 className={`w-full p-4 rounded-2xl border-2 bg-slate-800/50 transition-all font-bold flex justify-between items-center group shadow-sm hover:shadow-lg backdrop-blur-sm ${opt.color}`}
               >
                 <span>{opt.label}</span>
                 {opt.val === 5 && <Check className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
               </button>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
};

export default CareerQuiz;

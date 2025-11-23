import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Scholarship } from "../types";
import { MOCK_SCHOLARSHIPS } from "../constants";

const getAiClient = () => {
  const apiKey = process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

// Fallback data for when API quota is exceeded or fails
const FALLBACK_PATHWAY = {
  milestones: [
    {
      stage: "Foundation (Class 11-12)",
      actions: [
        "Focus on core subjects relevant to your stream (Science, Commerce, or Arts)",
        "Prepare for relevant entrance exams (e.g., JEE, NEET, CLAT, CUET)",
        "Maintain a consistent academic record (GPA/Percentage)"
      ]
    },
    {
      stage: "Higher Education (Undergraduate)",
      actions: [
        "Pursue a Bachelor's degree or Diploma in your chosen field",
        "Participate in college clubs, hackathons, or cultural fests",
        "Seek internships during semester breaks to gain real-world experience"
      ]
    },
    {
      stage: "Skill Specialization",
      actions: [
        "Identify and learn high-demand skills in your industry",
        "Obtain relevant certifications to boost your resume",
        "Build a portfolio of projects or case studies"
      ]
    },
    {
      stage: "Professional Launch",
      actions: [
        "Create a professional network on LinkedIn",
        "Prepare for job interviews and aptitude tests",
        "Apply for entry-level positions or graduate trainee programs"
      ]
    }
  ],
  recommendedDegrees: ["Bachelor's Degree", "Diploma", "Professional Certification"],
  topSkills: ["Communication", "Problem Solving", "Time Management", "Adaptability"]
};

const FALLBACK_NEWS = {
  text: "**System Notification: Live Updates Unavailable**\n\nWe are currently unable to fetch real-time news due to high network traffic or API limits. Here are some general updates:\n\n1. **Entrance Exams:** Keep an eye on official NTA and state board websites for the latest announcements regarding JEE, NEET, and CUET.\n2. **Admissions:** University admission cycles typically begin in May-June. Check specific college portals for deadlines.\n3. **Career Trends:** Technology, Sustainability, and Healthcare continue to be high-growth sectors in India.\n4. **Advice:** Focus on skill building and exam preparation. Check back later for live news.",
  sources: []
};

export const generateMentorResponse = async (history: {role: string, text: string}[], message: string) => {
  const ai = getAiClient();
  if (!process.env.API_KEY) {
    return "API Key is missing. Please check your configuration.";
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are a friendly, encouraging, and knowledgeable Career Counselor for Indian students (Class 8 to 12). 
        Your tone should be professional but accessible, like a supportive mentor.
        
        Key Context for India:
        - Education System: Familiar with CBSE, ICSE, State Boards, NIOS.
        - Streams: Science (PCM/PCB), Commerce, Arts/Humanities, and Vocational.
        - Entrance Exams: JEE, NEET, UPSC, CA Foundation, CLAT, NID, CUET, NDA, CET, ITI Entrance.
        - Degrees: B.Tech, MBBS, B.Com, BA, B.Des, LLB, ITI Certificates, Diplomas (Polytechnic).
        - Culture: Respectful, understanding parental pressure but encouraging student passion.
        
        If a student asks about Vocational or ITI courses (Electrician, Plumber, etc.), respect them as high-skill trades and provide dignified, accurate pathways.
        
        Provide clear, actionable advice. Break down complex topics into simple steps.
        Use bullet points for lists.`,
      },
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting to the career database right now. Please try again in a moment!";
  }
};

export const generatePathway = async (careerTitle: string, user: UserProfile) => {
  const ai = getAiClient();
  if (!process.env.API_KEY) return FALLBACK_PATHWAY;

  const strength = user.quizResult?.strength || 'General';
  const interests = user.interests.length > 0 ? user.interests.join(', ') : 'General Learning';

  const prompt = `Create a personalized structured career pathway for an Indian student wanting to become a ${careerTitle}.
  Student Profile:
  - Current Grade: ${user.grade}
  - Strength: ${strength}
  - Interests: ${interests}
  
  Tailor the milestones to this profile, suggesting specific actions relevant to their strengths.
  Include Indian entrance exams (e.g., JEE, NEET, CAT, UPSC, CLAT, NID, ITI/Polytechnic Exams) where applicable.
  Mention standard Indian degrees/certificates (B.Tech, MBBS, B.Com, ITI, Diploma) and top Indian institutions (IITs, IIMs, AIIMS, NIFTs, NLUs, ITIs) if relevant.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stage: { type: Type.STRING, description: "The educational stage, e.g., Class 11-12, Undergraduate/Diploma, Entrance Exams" },
                  actions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of concrete actions, subjects to pick, or exams to prepare for" }
                }
              }
            },
            recommendedDegrees: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. B.Tech, MBBS, ITI, Diploma" },
            topSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return FALLBACK_PATHWAY;
  } catch (e) {
    console.error("Pathway Generation Error", e);
    // Return fallback data ensures the UI doesn't break for the user
    return FALLBACK_PATHWAY;
  }
};

export const generateCareerVideo = async (careerTitle: string): Promise<string | null> => {
  const attemptGeneration = async (forceKeySelection = false) => {
      if (forceKeySelection) {
          // @ts-ignore
          if (window.aistudio && window.aistudio.openSelectKey) {
             // @ts-ignore
             await window.aistudio.openSelectKey();
          }
      } else {
           // Standard check
           // @ts-ignore
           if (window.aistudio && window.aistudio.hasSelectedApiKey) {
                // @ts-ignore
                const hasKey = await window.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    // @ts-ignore
                    if (window.aistudio.openSelectKey) {
                        // @ts-ignore
                        await window.aistudio.openSelectKey();
                    }
                }
           }
      }

      // Always create a new client instance right before the call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A cinematic, inspiring video showing the professional life of a ${careerTitle} in India. High quality, realistic, educational, showing the work environment.`,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (videoUri) {
        return `${videoUri}&key=${process.env.API_KEY}`;
      }
      return null;
  };

  try {
      return await attemptGeneration(false);
  } catch (error: any) {
      // Handle the specific 404 error for Veo API key session
      if (
        error.toString().includes("Requested entity was not found") || 
        (error.error && error.error.message && error.error.message.includes("Requested entity was not found")) ||
        error.status === 404 || 
        error.code === 404
      ) {
          console.log("Veo API Key expired or missing, retrying with selection...");
          try {
              // Retry with forced key selection
              return await attemptGeneration(true);
          } catch (retryError) {
              console.error("Video Gen Retry Error:", retryError);
              return null;
          }
      }
      console.error("Video Gen Error:", error);
      return null;
  }
};

export const generateProjectIdeas = async (interest: string, grade: string) => {
  const ai = getAiClient();
  if (!process.env.API_KEY) return [];

  const prompt = `Suggest 3 impressive, hands-on portfolio projects for an Indian school student (Grade: ${grade}) interested in ${interest}. 
  Return a raw JSON array (NO MARKDOWN) where each object has these keys:
  - title (string)
  - difficulty (Beginner/Intermediate/Advanced)
  - description (string)
  - skills_gained (array of strings)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch (e) {
    console.error("Project Gen Error", e);
    // Return a generic project if AI fails
    return [{
        title: `Starter Project in ${interest}`,
        difficulty: "Beginner",
        description: "A foundational project to explore basic concepts in this field. Start by researching online tutorials.",
        skills_gained: ["Research", "Basics"]
    }];
  }
};

export const getIndianCareerNews = async () => {
  // Use current date/time to force fresh results
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { dateStyle: 'full' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const prompt = `Find the latest live news and updates (As of ${dateStr} ${timeStr}) regarding:
  1. Indian Entrance Tests (JEE, NEET, CUET, UPSC, etc.) - Latest announcements, admit cards, or results.
  2. Scholarship News (Government & Private) - New openings or deadlines.
  3. Job Market, Career Business, and Professional Trends impacting students in India.
  
  Provide a "Live Hourly Update" style summary.
  List 3-5 distinct, important updates.
  Focus on breaking news, deadlines, and actionable info.
  Keep the tone professional, informative, and urgent/fresh for students.`;

  const maxRetries = 2; // Reduced retries to fail faster to fallback
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Re-initialize client each attempt to pick up any key changes/refresh
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      if (!process.env.API_KEY) return FALLBACK_NEWS;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        }
      });
      
      if (response.text) {
         return {
           text: response.text,
           sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
         };
      }
    } catch (e: any) {
      console.warn(`News Fetch Attempt ${attempt + 1} failed:`, e.message || e);
      lastError = e;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error("News Fetch Failed after retries:", lastError);
  return FALLBACK_NEWS;
};

export const getLatestScholarships = async (): Promise<Scholarship[]> => {
  const ai = getAiClient();
  if (!process.env.API_KEY) return [];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const prompt = `Search for the latest active scholarships in India for school and college students available in ${dateStr}.
  Find at least 3 distinct, currently active scholarships.
  Return a raw JSON array (NO MARKDOWN) with objects containing:
  - id (string, generate a random ID starting with NEW)
  - name (string)
  - category (one of: 'Central', 'State', 'Private', 'Exam')
  - country (string, usually 'India')
  - amount (string, e.g. "₹50,000/yr")
  - deadline (string)
  - eligibility (string, short summary)
  - link (string, URL to apply)
  
  Ensure the response is a valid JSON array only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        // Note: Do not use responseMimeType: 'application/json' when tools are enabled as it is currently unsupported.
      }
    });

    if (response.text) {
      try {
        // Clean up markdown code blocks if the model adds them
        const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        // Find array start and end to enable robust parsing even if extra text exists
        const start = cleanedText.indexOf('[');
        const end = cleanedText.lastIndexOf(']');
        if (start !== -1 && end !== -1) {
            const jsonStr = cleanedText.substring(start, end + 1);
            const data = JSON.parse(jsonStr);
            if (Array.isArray(data)) return data;
        }
        return [];
      } catch (e) {
        console.error("Error parsing scholarship JSON", e);
        return [];
      }
    }
    return [];
  } catch (e) {
    console.error("Scholarship Fetch Error", e);
    return [];
  }
};

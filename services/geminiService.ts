
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationParams, LessonPlan, WorksheetStyle, GeneratedWorksheet } from "../types";

// Initialize the Gemini API client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJson = (text: string): string => {
  if (!text) return "";
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  const startIdx = text.indexOf('{');
  const endIdx = text.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return text.substring(startIdx, endIdx + 1);
  }
  return text.trim();
};

export const generateLessonPlan = async (params: GenerationParams): Promise<LessonPlan> => {
  const ai = getAiClient();
  const prompt = `Create a comprehensive Canadian lesson plan for ${params.grade} ${params.subject} on "${params.topic}" in ${params.province}.
  
  GUIDELINES:
  1. Use Canadian spelling (e.g., colour, theatre, centimetre).
  2. Slide count: ${params.slideCount}.
  3. Focus heavily on 'Class Activities' that involve student participation.
  4. Include a practicalExample for EVERY slide to encourage classroom participation.
  5. Content must be pedagogically sound for ${params.grade} level students.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      learningObjectives: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of specific learning goals."
      },
      curriculumExpectations: {
        type: Type.STRING,
        description: "Summary of relevant provincial curriculum standards."
      },
      slides: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            bulletPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            teacherNotes: { type: Type.STRING, description: "A detailed script for the teacher to say aloud." },
            suggestedActivity: { type: Type.STRING, description: "Small activity specific to this slide's content." },
            imageDescription: { type: Type.STRING, description: "Prompt for an AI to generate a matching visual." },
            practicalExample: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING, description: "A problem or challenge for the class to solve." },
                solutionSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["problem", "solutionSteps"]
            }
          },
          required: ["title", "bulletPoints", "teacherNotes", "suggestedActivity", "imageDescription", "practicalExample"]
        }
      },
      activities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.STRING },
            materials: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "duration", "materials"]
        }
      },
      quiz: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer"]
        }
      }
    },
    required: ["learningObjectives", "curriculumExpectations", "slides", "activities", "quiz"]
  };
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: responseSchema
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    const result = JSON.parse(text);
    result.theme = params.theme;
    result.structure = params.structure;
    result.gradeLevel = params.grade;
    result.province = params.province;
    result.subject = params.subject;
    // Format topic as requested: Subject, Topic, Grade
    result.topic = `${params.subject}, ${params.topic}, ${params.grade}`;
    result.createdAt = new Date().toISOString();
    return result;
  } catch (e) {
    console.error("JSON Parse Error:", e);
    try {
      const result = JSON.parse(cleanJson(response.text || ""));
      result.theme = params.theme;
      result.structure = params.structure;
      result.gradeLevel = params.grade;
      result.province = params.province;
      result.subject = params.subject;
      // Format topic as requested: Subject, Topic, Grade
      result.topic = `${params.subject}, ${params.topic}, ${params.grade}`;
      result.createdAt = new Date().toISOString();
      return result;
    } catch (innerError) {
      throw new Error("Invalid format from AI. Please try again with a more specific topic.");
    }
  }
};

export const generateSlideImage = async (description: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `A high-quality, bright, educational classroom visual for children: ${description}. Clear, simple, and engaging. No text.`,
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData?.data) {
    return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate image.");
};

export const generateHookIdea = async (topic: string, grade: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 creative 'Minds On' or 'Lesson Hook' ideas for a ${grade} lesson about ${topic}. Use Canadian spelling.`
  });
  return response.text;
};

export const generateChatResponse = async (newMessage: string, history: any[], context?: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Context: ${context || 'General teaching assistant'}\n\nUser: ${newMessage}`,
    config: { systemInstruction: "You are MapleBot, a Canadian teaching assistant. Always use Canadian spelling." }
  });
  return response.text;
};

export const generateStandaloneWorksheet = async (topic: string, grade: string, subject: string, style: WorksheetStyle, questionCount: number): Promise<GeneratedWorksheet> => {
  const ai = getAiClient();
  const prompt = `Generate a high-quality Canadian educational worksheet for ${grade} ${subject} on ${topic}. 
  Style: ${style}. 
  Questions: ${questionCount}.
  
  STRICT FORMATTING RULES:
  1. DO NOT use LaTeX or special math symbols like "$". Use plain text only.
  2. For the studentMarkdown, keep it clean for students to fill out.
  3. For the teacherMarkdown, you MUST bold the correct answers (e.g. **a) Correct Answer**) for inline highlighting.
  4. Use simple Markdown: "#" for main title, "##" for sections.
  5. For questions, use simple numbering: "1.", "2.", etc.
  6. For multiple choice options, use "a)", "b)", "c)", "d)".
  7. Use Canadian spelling (colour, theatre, etc.).
  8. Provide a clear "Answer Key" summary section at the very end of the teacher copy.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      studentMarkdown: {
        type: Type.STRING,
        description: "The full worksheet text for students in Markdown format. Clear and printable."
      },
      teacherMarkdown: {
        type: Type.STRING,
        description: "The same worksheet with correct answers bolded (e.g. **a) Answer**) and an answer key summary at the end."
      }
    },
    required: ["studentMarkdown", "teacherMarkdown"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response");
    const result = JSON.parse(text);
    return { 
      topic: `${subject}, ${topic}, ${grade}`, 
      style, 
      studentMarkdown: result.studentMarkdown, 
      teacherMarkdown: result.teacherMarkdown 
    };
  } catch (e) {
    throw new Error("Failed to generate worksheet. Please try a smaller question count or different topic.");
  }
};

export const generateWelcomeEmail = async (teacherName: string, schoolName: string, email: string, tempPass: string): Promise<string> => {
  const ai = getAiClient();
  const loginUrl = `https://www.mymapleprep.com?email=${encodeURIComponent(email)}`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a professional and welcoming invitation email for a teacher named ${teacherName} joining the MaplePrep platform at ${schoolName}. 
    
    REQUIRED STRUCTURE:
    1. Warm greeting.
    2. One sentence explanation: MaplePrep is an AI lesson planner built for Canadian teachers.
    3. Direct Login Link: ${loginUrl}
    4. Clear "Initial Access Details" section with:
       - Email Address: ${email}
       - Temporary Password: ${tempPass}
    5. Instructions: Use the temporary password to log in for the first time. If you prefer to set your own password immediately, you can use the "Forgot Password" link on the login page. You can also change your password anytime from your profile settings once logged in.
    6. Sign-off from the ${schoolName} Administration.
    
    Use Canadian spelling and a concise, clear tone. Do not use markdown bolding in the output, just plain text. Ensure the URL is presented clearly as the primary action.`,
  });
  return response.text;
};

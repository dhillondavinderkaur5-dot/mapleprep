
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GenerationParams, LessonPlan, GameQuestion, SortingGameData, StoryGameData, MemoryGameData, MathBananaRound, WorksheetStyle, GeneratedWorksheet } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const practicalExampleSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    problem: { type: Type.STRING, description: "A specific problem or scenario to solve (e.g. 'If I have 3/4 of a pizza...')" },
    solutionSteps: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Step-by-step breakdown of how to solve it (e.g. 'Step 1: Identify the denominator')"
    }
  },
  required: ["problem", "solutionSteps"]
};

const slideSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the slide" },
    bulletPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Key educational points for the slide (3-5 points)",
    },
    teacherNotes: { type: Type.STRING, description: "Script or notes for the teacher to say" },
    suggestedActivity: { type: Type.STRING, description: "A quick interaction, question, or mini-activity for students during this slide" },
    imageDescription: { type: Type.STRING, description: "A highly detailed visual description prompt for an AI image generator. Describe the style (e.g. 'colorful flat vector illustration') and the content." },
    practicalExample: practicalExampleSchema,
  },
  required: ["title", "bulletPoints", "teacherNotes", "suggestedActivity", "imageDescription", "practicalExample"],
};

const activitySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING, description: "Instructions for the activity" },
    duration: { type: Type.STRING, description: "Estimated time (e.g. '15 mins')" },
    materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of materials needed" }
  },
  required: ["title", "description", "duration", "materials"]
};

const quizSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "4 possible answers" },
    correctAnswer: { type: Type.STRING, description: "The correct answer text, must match one of the options exactly" }
  },
  required: ["question", "options", "correctAnswer"]
};

const lessonPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    gradeLevel: { type: Type.STRING },
    province: { type: Type.STRING },
    subject: { type: Type.STRING },
    curriculumExpectations: { type: Type.STRING, description: "Specific curriculum codes or standards addressed" },
    learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
    slides: { type: Type.ARRAY, items: slideSchema },
    activities: { type: Type.ARRAY, items: activitySchema },
    worksheetMarkdown: { type: Type.STRING, description: "A complete markdown formatted worksheet for students" },
    answerSheetMarkdown: { type: Type.STRING, description: "The teacher's answer key for the worksheet, also in Markdown" },
    quiz: { type: Type.ARRAY, items: quizSchema }
  },
  required: ["topic", "gradeLevel", "province", "subject", "curriculumExpectations", "learningObjectives", "slides", "activities", "worksheetMarkdown", "answerSheetMarkdown", "quiz"]
};

export const generateLessonPlan = async (params: GenerationParams): Promise<LessonPlan> => {
  const prompt = `
    Create a comprehensive lesson plan for a Canadian elementary classroom.
    Topic: ${params.topic}
    Grade Level: ${params.grade}
    Province: ${params.province}
    Subject: ${params.subject}

    Please ensure:
    1. The content is strictly aligned with the ${params.province} ${params.subject} curriculum.
    2. The language and examples are age-appropriate for ${params.grade} students.
    3. Include exactly ${params.slideCount} slides for a presentation.
    4. **CRITICAL:** For every slide that introduces a concept, include a "practicalExample" with a clear problem and step-by-step solution steps so the teacher can show "how to solve" on the board.
    5. Provide specific class activity ideas (with duration and materials).
    6. Generate a student worksheet in Markdown format.
    7. Generate a corresponding **Teacher Answer Key** for the worksheet in Markdown format. This MUST be a separate document with all answers filled in clearly.
    8. Create a multiple choice quiz with between 15 and 25 questions.
    9. Use Canadian spelling and context (e.g. kilometres, litres, Canadian cities/money/history).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: lessonPlanSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response generated");
  }

  const data = JSON.parse(text) as LessonPlan;
  
  // Initialize customElements and polyfill practicalExample if missing
  data.slides = data.slides.map(slide => ({
    ...slide,
    customElements: [],
    practicalExample: slide.practicalExample || {
      problem: "Example generation pending...",
      solutionSteps: ["This slide explains a concept without a specific step-by-step problem.", "Discuss the bullet points above with the class."]
    }
  }));

  return data;
};

export const generateSlideImage = async (imageDescription: string, stylePreset: 'default' | 'chalkboard' = 'default'): Promise<string> => {
  let promptText = '';
  
  if (stylePreset === 'chalkboard') {
    promptText = `Generate a precise educational diagram on a dark background (chalkboard style).
    
    TASK: Visualize the following specific educational content accurately.
    CONTENT: ${imageDescription}
    
    STYLE GUIDELINES:
    - Use white or pastel chalk-like lines on a dark slate/black background.
    - High contrast for readability.
    - If numbers or specific quantities are mentioned (e.g. "3 apples", "1/4 fraction", "triangle"), YOU MUST DRAW EXACTLY THAT AMOUNT/SHAPE.
    - Do not include generated text labels unless necessary for the diagram (like axis labels).
    - Keep it clean, schematic, and focused on the concept.`;
  } else {
    promptText = `Create a simple, clear, educational illustration suitable for an elementary school slide presentation. Style: Modern, flat vector, colorful but clean. Subject: ${imageDescription}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: promptText,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
  } catch (error) {
    console.error("Gemini image generation error:", error);
    throw error;
  }

  throw new Error("No image data returned from AI service");
};

// --- NEW GAME GENERATORS ---

// 1. Math Ninja Banana Slice Generator
const bananaGameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    rounds: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          target: { type: Type.NUMBER },
          targetDescription: { type: Type.STRING, description: "Rule for the round, e.g. 'Factors of 10' or 'Sums to 10'" },
          bananas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                content: { type: Type.STRING, description: "The equation or number on the banana, e.g. '5+5'" },
                value: { type: Type.NUMBER, description: "The calculated value" },
                isCorrect: { type: Type.BOOLEAN, description: "Does this match the target?" }
              },
              required: ["content", "value", "isCorrect"]
            }
          }
        },
        required: ["target", "targetDescription", "bananas"]
      }
    }
  },
  required: ["rounds"]
};

export const generateMathBananaGame = async (grade: string, topic?: string): Promise<MathBananaRound[]> => {
  const topicInstruction = topic 
    ? `The target rules MUST be about: "${topic}".` 
    : "Create 3 DIFFERENT, RANDOM, and CREATIVE math targets appropriate for this grade. Do not repeat the same concept (e.g. don't make all rounds about addition). Mix it up!";

  const prompt = `Create a 'Math Ninja' game dataset for ${grade}. 
  ${topicInstruction}
  Create 3 progressive rounds (Round 1: Easy, Round 2: Medium, Round 3: Hard).
  For each round, define a target rule (e.g. 'Sums equal to 10', 'Multiples of 5', 'Fractions equivalent to 1/2').
  Then provide 12 'bananas' for each round: 6 that are CORRECT (match the rule) and 6 that are WRONG (do not match).
  Mix of equations and raw numbers.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: bananaGameSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No game generated");
  return JSON.parse(text).rounds;
};

// 2. Sorting Game Generator
const sortingGameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    categories: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Exactly 2 contrasting categories, e.g. 'Living' vs 'Non-Living' or 'Magnetic' vs 'Non-Magnetic'"
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          categoryIndex: { type: Type.INTEGER, description: "0 or 1, corresponding to categories array" }
        },
        required: ["id", "text", "categoryIndex"]
      }
    }
  },
  required: ["categories", "items"]
};

export const generateSortingGame = async (grade: string, topic: string, subject: string): Promise<SortingGameData> => {
  const prompt = `Create a ${subject} sorting game for ${grade} students about '${topic}'.
  Choose 2 clear, contrasting categories suitable for ${subject}.
  Examples: 
  - Social Studies: Urban vs Rural, Needs vs Wants.
  - Science: Living vs Non-Living, Magnetic vs Non-Magnetic.
  - The Arts: Warm Colors vs Cool Colors, Primary vs Secondary, Geometric vs Organic Shapes.
  Provide 12 items to sort (6 for each category).`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: sortingGameSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No game generated");
  return JSON.parse(text);
};

// 3. Language Silly Story Generator
const storyGameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    template: { type: Type.STRING, description: "The story text. Use placeholders like {0}, {1}, {2} etc. for missing words." },
    placeholders: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          key: { type: Type.STRING, description: "The placeholder key, e.g. {0}" },
          label: { type: Type.STRING, description: "The type of word needed, e.g. 'Adjective' or 'Animal'" }
        },
        required: ["key", "label"]
      }
    }
  },
  required: ["title", "template", "placeholders"]
};

export const generateStoryGame = async (grade: string, topic: string): Promise<StoryGameData> => {
  const prompt = `Create a funny 'Mad Libs' style story template for ${grade} students.
  Topic: ${topic || "A Day at School"}.
  The story should be about 100 words.
  Include 8-12 blanks for students to fill in (Nouns, Verbs, Adjectives, etc.).
  Make it silly and engaging!`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: storyGameSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No game generated");
  return JSON.parse(text);
};

// 4. Memory Match Generator
const memoryGameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    pairs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          item1: { type: Type.STRING, description: "First item (e.g. French word)" },
          item2: { type: Type.STRING, description: "Matching item (e.g. English meaning)" }
        },
        required: ["id", "item1", "item2"]
      }
    }
  },
  required: ["pairs"]
};

export const generateMemoryGame = async (grade: string, topic: string, subject: string): Promise<MemoryGameData> => {
  const prompt = `Create 8 matching pairs for a memory card game for ${grade} ${subject}.
  Topic: ${topic || "General Vocabulary"}.
  If subject is French, ensure strict accuracy: Word (French) <-> Word (English). Use standard, correct translations.
  If subject is Math, do Equation <-> Answer.
  If subject is Science, do Term <-> Definition.
  If subject is Music, do Instrument <-> Instrument Family (e.g. Violin <-> Strings) or Symbol <-> Name.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: memoryGameSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No game generated");
  return JSON.parse(text);
};

// 5. Quiz Game Generator
const quizGameSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["id", "text", "options", "correctAnswer", "explanation"]
      }
    }
  },
  required: ["questions"]
};

export const generateQuizGame = async (grade: string, topic: string, subject: string): Promise<GameQuestion[]> => {
  const prompt = `Create a fun 5-question multiple choice quiz for ${grade} ${subject}.
  Topic: ${topic || "General Review"}.
  Make the questions engaging and age-appropriate.
  Include a brief explanation for why the answer is correct.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: quizGameSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No game generated");
  return JSON.parse(text).questions;
};

// 6. Standalone Worksheet Generator
const worksheetSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    studentMarkdown: { type: Type.STRING, description: "The formatted worksheet for the student to print and fill out." },
    teacherMarkdown: { type: Type.STRING, description: "The answer key with all answers filled in." }
  },
  required: ["studentMarkdown", "teacherMarkdown"]
};

export const generateStandaloneWorksheet = async (topic: string, grade: string, subject: string, style: WorksheetStyle, questionCount: number): Promise<GeneratedWorksheet> => {
  let styleInstruction = "";
  
  switch (style) {
    case 'vocabulary':
      styleInstruction = `Format: 'Vocabulary & Definitions'. Include a word bank and matching section with approximately ${questionCount} items, plus fill-in-the-blank sentences using the words.`;
      break;
    case 'critical_thinking':
      styleInstruction = `Format: 'Critical Thinking & Reflection'. Focus on ${Math.max(3, Math.floor(questionCount / 3))} deep, open-ended scenarios or questions that require paragraph answers. Less memorization, more reasoning.`;
      break;
    case 'math_drill':
      styleInstruction = `Format: 'Skill Drills'. A high volume of practice problems (exactly ${questionCount}) focusing on calculation and procedure. Group by difficulty.`;
      break;
    default:
      styleInstruction = `Format: 'Standard Mix'. Include a total of ${questionCount} questions: A mix of multiple choice, short answer, and 1 drawing/diagram activity.`;
      break;
  }

  const prompt = `Create a printable worksheet for a Canadian ${grade} ${subject} class.
  Topic: ${topic}.
  ${styleInstruction}
  
  Use proper Markdown formatting (headings, bold text, bullet points).
  Ensure Canadian spelling (colour, neighbour, centre).
  Make it look professional and ready to print.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: worksheetSchema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No worksheet generated");
  
  const data = JSON.parse(text);
  
  return {
    topic,
    style,
    studentMarkdown: data.studentMarkdown,
    teacherMarkdown: data.teacherMarkdown
  };
};

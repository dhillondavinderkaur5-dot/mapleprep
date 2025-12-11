
import { GradeLevel, Province, Subject } from "./types";

export const GRADES = Object.values(GradeLevel);
export const PROVINCES = Object.values(Province);
export const SUBJECTS = Object.values(Subject);

export const SAMPLE_TOPICS = [
  "The Water Cycle",
  "Indigenous History: The Fur Trade",
  "Introduction to Fractions",
  "Canadian Government System",
  "Habitats and Communities",
  "Simple Machines",
];

export const SUBJECT_TEMPLATES: Record<string, string[]> = {
  [Subject.Math]: [
    "Introduction to Fractions",
    "Telling Time: Analog & Digital",
    "Canadian Money: Coins & Bills",
    "Identifying Geometric Shapes",
    "Simple Addition & Subtraction",
    "Patterning Rules"
  ],
  [Subject.Science]: [
    "Plant Life Cycle",
    "Animal Habitats & Adaptations",
    "Daily & Seasonal Weather",
    "States of Matter: Solids, Liquids, Gas",
    "Simple Machines",
    "Light and Sound"
  ],
  [Subject.Social]: [
    "My Local Community",
    "Map of Canada: Provinces & Territories",
    "Canadian Government Basics",
    "Indigenous Peoples: Early Life",
    "Community Helpers",
    "Needs vs. Wants"
  ],
  [Subject.Language]: [
    "Nouns, Verbs, and Adjectives",
    "Writing a Friendly Letter",
    "Story Elements: Character & Setting",
    "Reading Comprehension Strategies",
    "Persuasive Writing",
    "Synonyms and Antonyms"
  ],
  [Subject.Health]: [
    "Healthy Eating & Canada's Food Guide",
    "Personal Safety & Boundaries",
    "Mental Health: Identifying Emotions",
    "Active Living Strategies"
  ],
  [Subject.Arts]: [
    "Primary and Secondary Colours",
    "Elements of Dance",
    "Famous Canadian Artists",
    "Rhythm and Beat"
  ],
  [Subject.French]: [
    "Basic Greetings & Introductions",
    "Colors and Numbers (1-20)",
    "Ma Famille (My Family)",
    "Food & Drink Vocabulary",
    "Les Saisons (The Seasons)",
    "Conjugating Avoir & Etre"
  ],
  [Subject.Music]: [
    "Rhythm and Beat Basics",
    "Instruments of the Orchestra",
    "Reading Treble Clef Notes",
    "Famous Composers",
    "Music Dynamics (Loud & Soft)",
    "Tempo Terms"
  ]
};

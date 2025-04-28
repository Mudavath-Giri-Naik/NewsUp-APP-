// src/utils/types.ts

// Defines the parameters expected by each screen in your navigation stack
export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleDetail: {
    id: string;
    paper: string; // The *actual* source newspaper for fetching details
    date: string; // ISO date string passed from HomeScreen
    displayMode: string; // The mode selected in HomeScreen ('Exam' or 'The Hindu', etc.)
  };
  // Add other screen definitions here if they exist
};

// --- Types specifically for HomeScreen ---

// Type for the items displayed in the ArticleList on HomeScreen
export type ArticleListItemType = {
  id: string;
  title: string;
  category?: string; // Optional category (might be used if syllabus is missing or not in Exam mode)
  source: string;   // The original newspaper source (matches 'paper' in ArticleDetail params)
  syllabusHeadings?: string[]; // <<<--- ADDED THIS LINE (Make sure it's optional)
};

// Type for the category chips in HomeScreen
export type CategoryChipType = {
  category: string;
  count: number;
};

// Type for the raw data structure coming from the API
export type RawArticleDataType = {
  _id?: any;
  articleId?: number | string;
  title: string;
  category?: string;
  examSpecific?: boolean;
  syllabusHeadings?: string[]; // <<<--- ADDED THIS LINE (to match API response)
  source?: string; // Added during processing in HomeScreen
  involvement?: string;
  past?: string;
  present?: string;
  description?: string;
  points?: string;
  glossary?: { [key: string]: string };
  deepAnalysisJson?: string;
  summaryPointsJson?: string;
  date?: string | Date;
  // Add any other fields the API might return
};

// --- Types specifically for ArticleDetailScreen ---

export type ParsedJsonDataType = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonArray | ParsedJsonDataType;
interface JsonArray extends Array<JsonValue> {}
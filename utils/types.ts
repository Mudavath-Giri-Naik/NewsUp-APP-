// src/utils/types.ts

// ✅ Import DailyResource type (adjust path if utils/api.ts is elsewhere)
import { DailyResource } from './api';

// Defines the parameters expected by each screen in your navigation stack
export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleDetail: {
    id: string;
    paper: string;
    date: string;
    displayMode: string;
  };
  // ✅ ADDED date parameter to Resources screen
  Resources: {
    date: string; // Expect a date string (e.g., "DD-MM-YYYY")
  };
  ResourceDetail: {
    resource: DailyResource;
  };
};
  

  // ✅ ADDED: Definition for the Resource Detail screen


// --- Types specifically for HomeScreen ---
// (Keep existing types below)
export type ArticleListItemType = {
  id: string;
  title: string;
  category?: string;
  source: string;
  syllabusHeadings?: string[];
};

export type CategoryChipType = {
  category: string;
  count: number;
};

export type RawArticleDataType = {
  _id?: any;
  articleId?: number | string;
  title: string;
  category?: string;
  examSpecific?: boolean;
  syllabusHeadings?: string[];
  source?: string;
  involvement?: string;
  past?: string;
  present?: string;
  description?: string;
  points?: string;
  glossary?: { [key: string]: string };
  deepAnalysisJson?: string;
  summaryPointsJson?: string;
  date?: string | Date;
};

// --- Types specifically for ArticleDetailScreen ---
export type ParsedJsonDataType = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonArray | ParsedJsonDataType;
interface JsonArray extends Array<JsonValue> {}
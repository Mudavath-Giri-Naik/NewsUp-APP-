// utils/api.ts
import axios from 'axios';

export const BASE_URL = "https://newsup-react-native-app-backend.onrender.com";

// ✅ 1. Get full article by articleId (no change here)
export const fetchArticleDetails = (paper: string, id: string) =>
  axios.get(`${BASE_URL}/api/articles/by-id/${encodeURIComponent(paper)}/${encodeURIComponent(id)}`);

// ✅ 2. Get articles for a specific newspaper and date (with pagination)
export const fetchArticlesByPaperAndDate = (paper: string, date: string, page: number = 1, limit: number = 200) =>
  axios.get(`${BASE_URL}/api/articles/${encodeURIComponent(paper)}/by-date/${encodeURIComponent(date)}?page=${page}&limit=${limit}`);

// utils/api.ts
import axios from 'axios';


export const BASE_URL = "https://newsup-react-native-app-backend.onrender.com";


// ✅ 1. Get full article by articleId
export const fetchArticleDetails = (paper: string, id: string) =>
  axios.get(`${BASE_URL}/api/articles/by-id/${encodeURIComponent(paper)}/${encodeURIComponent(id)}`);

// ✅ 2. Get articles for a specific newspaper and date
export const fetchArticlesByPaperAndDate = (paper: string, date: string) =>
  axios.get(`${BASE_URL}/api/articles/${encodeURIComponent(paper)}/by-date/${encodeURIComponent(date)}`);

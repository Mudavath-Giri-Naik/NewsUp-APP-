// utils/api.ts
import axios from 'axios';


export const BASE_URL = "https://newsup-react-native-app-backend.onrender.com";

// ✅ 1. Get category counts
export const fetchCategories = (paper: string) =>
  axios.get(`${BASE_URL}/api/articles/categories/${encodeURIComponent(paper)}`);

// ✅ 2. Get article titles by category
export const fetchTitles = (paper: string, category: string) => {
  if (category === 'all') {
    return fetchAllArticles(paper); // use the new route if "All" is selected
  }
  return axios.get(`${BASE_URL}/api/articles/titles/${encodeURIComponent(paper)}/${encodeURIComponent(category)}`);
};

// ✅ 3. Get all articles
export const fetchAllArticles = (paper: string) =>
  axios.get(`${BASE_URL}/api/articles/all/${encodeURIComponent(paper)}`);

// ✅ 4. Get full article by articleId
export const fetchArticleDetails = (paper: string, id: string) =>
  axios.get(`${BASE_URL}/api/articles/by-id/${encodeURIComponent(paper)}/${encodeURIComponent(id)}`);

// ✅ 5. Get Related_to counts
export const fetchRelatedToTags = (paper: string) =>
  axios.get(`${BASE_URL}/api/articles/related-to/${encodeURIComponent(paper)}`);

// ✅ 6. Get article titles by Related_to
export const fetchTitlesByRelatedTo = (paper: string, relatedTo: string) =>
  axios.get(`${BASE_URL}/api/articles/titles/related-to/${encodeURIComponent(paper)}/${encodeURIComponent(relatedTo)}`);
// Update to match your backend route exactly
export const fetchSecondCategories = (paper: string) =>
  axios.get(`${BASE_URL}/api/articles/secondCategory/${encodeURIComponent(paper)}`);

// ✅ 8. Get titles by secondCategory (only for Exam)
export const fetchTitlesBySecondCategory = (paper: string, secondCategory: string) =>
  axios.get(`${BASE_URL}/api/articles/titles/${encodeURIComponent(paper)}/secondCategory/${encodeURIComponent(secondCategory)}`);
// ✅ 9. Get titles by secondCategory across all newspapers
export const fetchTitlesBySecondCategoryAll = (secondCategory: string) =>
  axios.get(`${BASE_URL}/api/articles/titles/secondCategory/all/${encodeURIComponent(secondCategory)}`);
// ✅ 10. Get all articles by date across selected newspapers
export const fetchArticlesByDate = (date: string) =>
  axios.get(`${BASE_URL}/api/articles/by-date/${encodeURIComponent(date)}`);
// ✅ 11. Get articles for a specific newspaper and date
export const fetchArticlesByPaperAndDate = (paper: string, date: string) =>
  axios.get(`${BASE_URL}/api/articles/${encodeURIComponent(paper)}/by-date/${encodeURIComponent(date)}`);

export type RootStackParamList = {
  Welcome: undefined; // ✅ Added for the welcome screen
  Home: undefined;
  ArticleDetail: { id: string; paper: string };
};
export type ArticleType = {
  id: string;
  title: string;
  newspaper: string; // needed for navigating to ArticleDetail
};

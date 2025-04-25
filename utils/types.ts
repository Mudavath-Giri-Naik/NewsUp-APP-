// src/utils/types.ts

export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleDetail: { id: string; paper: string; date: string }; // Add 'date' as a string
};

export type ArticleType = {
  id: string;
  title: string;
  newspaper: string; // needed for navigating to ArticleDetail
};

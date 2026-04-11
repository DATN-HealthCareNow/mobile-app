import { axiosClient } from '../axiosClient';

export type MobileArticle = {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string;
  publishedAt?: string;
};

export const articleService = {
  get_published: async (): Promise<MobileArticle[]> => {
    const response = await axiosClient.get('/api/v1/articles') as MobileArticle[];
    return response;
  },
};

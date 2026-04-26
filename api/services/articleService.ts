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

const normalizeArticles = (payload: any): MobileArticle[] => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.content)) {
    return payload.content;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  return [];
};

const normalizeArticle = (payload: any): MobileArticle | null => {
  if (!payload) {
    return null;
  }
  if (payload.data && typeof payload.data === 'object') {
    return payload.data as MobileArticle;
  }
  return payload as MobileArticle;
};

export const articleService = {
  get_published: async (): Promise<MobileArticle[]> => {
    const response = await axiosClient.get('/api/v1/articles');
    return normalizeArticles(response);
  },
  getById: async (id: string): Promise<MobileArticle> => {
    try {
      const response = await axiosClient.get(`/api/v1/articles/${id}`);
      const article = normalizeArticle(response);
      if (!article) {
        throw new Error('Article response is empty');
      }
      return article;
    } catch (error: any) {
      if (error?.response?.status !== 405) {
        throw error;
      }

      // Một số môi trường chỉ mở endpoint list; fallback để vẫn xem được detail.
      const list = await articleService.get_published();
      const matched = list.find((item) => item.id === id);
      if (!matched) {
        throw error;
      }
      return matched;
    }
  },
};

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

const normalizeCoverUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  let u = value.trim();
  if (!u) return undefined;

  u = u.replace(/\\/g, '/');
  if (u.startsWith('//')) u = `https:${u}`;
  if (!u.startsWith('http://') && !u.startsWith('https://') && u.startsWith('s3://')) {
    // Convert s3://bucket/key to an https URL (best-effort for display in mobile app)
    u = u.replace(/^s3:\/\//, 'https://');
  }

  try {
    return encodeURI(u);
  } catch {
    return u;
  }
};

const normalizeArticles = (payload: any): MobileArticle[] => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.content)
    ? payload.content
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  const sanitize = (a: any): MobileArticle => {
    if (!a) return a;
    const source = a as any;
    const coverImageUrl = normalizeCoverUrl(
      source.coverImageUrl ?? source.cover_image_url ?? source.cover_image ?? source.image_url,
    );

    return {
      ...source,
      coverImageUrl,
      // Keep camelCase fields for mobile consumption when backend sends snake_case.
      publishedAt: source.publishedAt ?? source.published_at,
    } as MobileArticle;
  };

  return list.map(sanitize);
};

const normalizeArticle = (payload: any): MobileArticle | null => {
  if (!payload) {
    return null;
  }
  const source = payload.data && typeof payload.data === 'object' ? payload.data : payload;
  const article = source as any;
  const coverImageUrl = normalizeCoverUrl(
    article?.coverImageUrl ?? article?.cover_image_url ?? article?.cover_image ?? article?.image_url,
  );

  return {
    ...article,
    coverImageUrl,
    publishedAt: article?.publishedAt ?? article?.published_at,
  } as MobileArticle;
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

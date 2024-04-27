import { NanoRepArticle } from './nanorep-article.js';

export interface NanoRepResponse {
  articles: NanoRepArticle[];
  account: string;
  kb: string;
  skipped: number;
  exported: number;
  totalArticles: number;
}
